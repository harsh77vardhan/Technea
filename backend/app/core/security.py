"""Security utilities for password hashing, HKDF key derivation, and JWT token handling."""

import asyncio
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets
from typing import Any
import bcrypt
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
import jwt

from app.core.config import settings

# JWT configuration constants
JWT_ISSUER = "technea-api"
JWT_AUDIENCE = "technea-client"
CLOCK_SKEW_LEEWAY_SECONDS = 10

# Bounded semaphore to restrict concurrent CPU-heavy bcrypt operations and prevent thread starvation
_BCRYPT_SEMAPHORE = asyncio.Semaphore(4)

# Common passwords blocklist for basic breach prevention
COMMON_PASSWORDS: frozenset[str] = frozenset({
    "password", "password1", "password123", "12345678", "123456789", "1234567890",
    "qwertyuiop", "iloveyou", "admin123", "welcome1", "passphrase", "changeme",
    "technea123", "letmein1", "secret123", "football", "dragon12", "master123",
})

# Sentinel prefix for auto-provisioned accounts that do not have a usable password
UNUSABLE_PASSWORD_PREFIX = "!unusable_sentinel_"


def derive_key(purpose: str, salt: bytes | None = None) -> bytes:
    """Derive purpose-specific cryptographic keys from the master SECRET_KEY using HKDF-SHA256."""
    secret_bytes = settings.SECRET_KEY.encode("utf-8")
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt or b"technea-hkdf-v1-salt",
        info=purpose.encode("utf-8"),
    )
    return hkdf.derive(secret_bytes)


# Purpose-separated cryptographic keys
JWT_SIGNING_KEY: bytes = derive_key("technea-jwt-signing-v1")
OTP_HMAC_KEY: bytes = derive_key("technea-otp-hmac-v1")
OAUTH_STATE_KEY: bytes = derive_key("technea-oauth-state-v1")
PASSWORD_RESET_KEY: bytes = derive_key("technea-password-reset-v1")


def validate_password_strength(password: str) -> None:
    """Validate password length and check against common breach blocklist without composition theater."""
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if len(password) > 128:
        raise ValueError("Password cannot exceed 128 characters.")
    if password.strip().lower() in COMMON_PASSWORDS:
        raise ValueError("This password is too common or easily guessable. Please choose a more secure password.")


def make_unusable_password_hash() -> str:
    """Generate a sentinel unusable password hash for OAuth / OTP provisioned accounts.

    Bcrypt will never verify against this hash, completely avoiding 12-round hashing on signup.
    """
    return f"{UNUSABLE_PASSWORD_PREFIX}{secrets.token_urlsafe(32)}"


def is_unusable_password(hashed_password: str | None) -> bool:
    """Check if the stored hash is an unusable sentinel password."""
    if not hashed_password:
        return True
    return hashed_password.startswith(UNUSABLE_PASSWORD_PREFIX)


def _safe_bcrypt_input(password: str) -> bytes:
    """Ensure password input to bcrypt never exceeds 72 bytes.

    Bcrypt truncates or crashes on >72 bytes; if length exceeds 72, SHA-256 pre-hash to 32 raw bytes.
    """
    raw_bytes = password.encode("utf-8")
    if len(raw_bytes) > 72:
        return hashlib.sha256(raw_bytes).digest()
    return raw_bytes


def get_password_hash(password: str) -> str:
    """Hash a plaintext password using bcrypt with 12 rounds."""
    validate_password_strength(password)
    safe_input = _safe_bcrypt_input(password)
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(safe_input, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str | None) -> bool:
    """Verify a plaintext password against the stored bcrypt hash with support for sentinel hashes."""
    if not hashed_password or is_unusable_password(hashed_password):
        return False
    try:
        raw_bytes = plain_password.encode("utf-8")
        hashed_bytes = hashed_password.encode("utf-8")
        # Try direct check (standard <= 72 bytes)
        if len(raw_bytes) <= 72 and bcrypt.checkpw(raw_bytes, hashed_bytes):
            return True
        # Try sha256 pre-hashed input (for passwords exceeding 72 bytes)
        sha_bytes = hashlib.sha256(raw_bytes).digest()
        return bcrypt.checkpw(sha_bytes, hashed_bytes)
    except Exception:
        return False


async def async_get_password_hash(password: str) -> str:
    """Asynchronously compute bcrypt hash inside a bounded thread semaphore to prevent event loop blocking."""
    async with _BCRYPT_SEMAPHORE:
        return await asyncio.to_thread(get_password_hash, password)


async def async_verify_password(plain_password: str, hashed_password: str | None) -> bool:
    """Asynchronously verify bcrypt hash inside a bounded thread semaphore."""
    async with _BCRYPT_SEMAPHORE:
        return await asyncio.to_thread(verify_password, plain_password, hashed_password)


# Precomputed dummy hash for constant-time email enumeration defense in login flow
DUMMY_BCRYPT_HASH: str = get_password_hash("TechneaDummyConstantTimePassword123!")


def create_access_token(
    subject: str | Any,
    expires_delta: timedelta | None = None,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Create a signed JWT access token with standard aud, iss, iat, exp claims."""
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))

    to_encode: dict[str, Any] = {
        "sub": str(subject),
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    if extra_claims:
        to_encode.update(extra_claims)

    return jwt.encode(
        to_encode,
        JWT_SIGNING_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a JWT access token with leeway and fallback for legacy token migration."""
    # 1. Primary decode using derived key, pinned HS256, and validated claims
    try:
        return jwt.decode(
            token,
            JWT_SIGNING_KEY,
            algorithms=["HS256"],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE,
            leeway=CLOCK_SKEW_LEEWAY_SECONDS,
            options={"require": ["exp", "sub", "iat"]},
        )
    except (jwt.InvalidIssuerError, jwt.InvalidAudienceError):
        # Allow legacy tokens that lack iss or aud during rollout transition
        try:
            return jwt.decode(
                token,
                JWT_SIGNING_KEY,
                algorithms=["HS256"],
                leeway=CLOCK_SKEW_LEEWAY_SECONDS,
                options={"require": ["exp", "sub"], "verify_aud": False, "verify_iss": False},
            )
        except jwt.PyJWTError:
            pass
    except jwt.InvalidSignatureError:
        # Fallback to master SECRET_KEY for active legacy tokens issued before key derivation
        try:
            return jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"],
                leeway=CLOCK_SKEW_LEEWAY_SECONDS,
                options={"require": ["exp", "sub"], "verify_aud": False, "verify_iss": False},
            )
        except jwt.PyJWTError:
            pass
    except jwt.PyJWTError:
        pass

    return None

