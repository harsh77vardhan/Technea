# Technea Security Policy & Hardening Audit

## 1. Overview & Security Philosophy
Technea is designed with defense-in-depth principles across the entire application stack: frontend client, API gateway, authentication system, database persistence layer, and external AI integrations.

This document details our security architecture, vulnerability reporting process, threat mitigations, and pre-launch security audit findings.

---

## 2. Threat Model & Implemented Mitigations

### 2.1 Secrets & Environment Variable Protection
- **No Hardcoded Production Secrets**: API keys, JWT signing keys, and database passwords are never stored in source control. Git history has been audited with zero exposed production credentials.
- **Git Protection Rules**:
  - Root, backend, and frontend `.gitignore` rules prevent staging `.env`, `.env.*`, or `*.local` files.
  - Public templates are tracked strictly as `.env.example`.
- **Frontend Client Isolation**:
  - Frontend is compiled with Vite; only environment variables prefixed with `VITE_` (such as `VITE_API_URL` and `VITE_BACKEND_URL`) are exposed to client-side bundles.
  - Verified that Vite production build (`dist/assets/*.js`) contains zero backend secrets, database connection strings, or API private keys.
- **Production Secret Validation**:
  - `backend/app/core/config.py` enforces runtime validation. If `ENVIRONMENT="production"`, the application validates that `SECRET_KEY` is not a default placeholder and has at least 32 characters (256-bit entropy).
  - Emits critical security warnings if default keys or standard database passwords are used in production.

### 2.2 API & Authentication Security
- **Bcrypt Password Hashing**:
  - Passwords are encrypted using standard bcrypt with 12 salt rounds (`backend/app/core/security.py`).
  - Passwords are never stored in plaintext.
- **JWT Token Management**:
  - Signed tokens use `HS256` with strict claim verification (`iat`, `exp`, `sub`).
  - Tokens without valid signatures, expired timestamps, or missing subject claims are rejected (`decode_access_token`).
  - Default token lifespan is bounded and configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`.
- **Credential Leakage Prevention in API Responses**:
  - All public user Pydantic response models (`UserResponse`, `UserProfilePublicResponse`, `FollowUserItem`) strictly omit `hashed_password` and set `extra="ignore"`.
  - Password hashes are never serialized or transmitted to clients.
- **CORS Hardening**:
  - Configured in `backend/app/main.py`.
  - Wildcard `*` is strictly disallowed when `allow_credentials=True` in production.
  - Allowed origins are explicitly mapped to trusted domains configured via `CORS_ORIGINS` and `FRONTEND_URL`.
  - Trailing slashes are automatically sanitized to prevent origin matching vulnerabilities.

### 2.3 HTTP Security Response Headers
Every HTTP response is guarded by `SecurityHeadersMiddleware` in `backend/app/main.py`:
- `X-Frame-Options: DENY`: Blocks framing and clickjacking attacks.
- `X-Content-Type-Options: nosniff`: Prevents browser MIME-sniffing away from declared content-type.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`: Enforces modern TLS/HTTPS communication with a 1-year duration.
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts cross-origin referrer leakage.
- `X-XSS-Protection: 1; mode=block`: Activates legacy browser anti-XSS filters.
- `Content-Security-Policy`: Restricts resource sources (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`), omitting CSP on interactive API documentation (`/docs`, `/redoc`) to preserve Swagger UI functionality.

### 2.4 SQL Injection Prevention
- All relational database interactions use SQLAlchemy 2.0 ORM query building (`select()`, `.where()`, `.join()`) with bound parameters.
- Raw SQL string concatenation is completely avoided.
- Dynamic search terms are parameterized safely via ORM predicates.

### 2.5 Error Sanitization & Information Disclosure Protection
- **Global Unhandled Exception Handler**:
  - `backend/app/utils/exceptions.py` registers an exception handler for `Exception`.
  - Unhandled exceptions log full tracebacks to the server log via `logger.exception()` while returning a generic, safe response to external clients:
    ```json
    {
      "error": {
        "message": "An unexpected server error occurred. Please try again later.",
        "status_code": 500,
        "details": null
      }
    }
    ```
  - Internal tracebacks, database schema names, file paths, and environment strings are never leaked.
- **Infrastructure Health Sanitization**:
  - The `/ready` endpoint in `backend/app/routers/health.py` suppresses raw database exception details in production (`ENVIRONMENT="production"`).

### 2.6 AI Key Redaction & Provider Isolation
- `backend/app/services/ai/gemini_client.py` includes regex-based key sanitation (`sanitize_text()`) that automatically redacts API keys and URL tokens (`AIzaSy...`) from error messages and logs.
- If the primary AI provider encounters an issue, the system gracefully falls back to deterministic rule-based mentorship without exposing provider stack traces.

---

## 3. Vulnerability Reporting Policy

We welcome vulnerability reports from independent security researchers and members of the community.

### 3.1 Reporting Guidelines
If you believe you have found a security vulnerability in Technea:
1. **Email us directly**: Send vulnerability details to **security@technea.dev** (or open an issue with confidentiality requested if urgent).
2. **Include Reproduction Steps**:
   - Step-by-step instructions or Proof of Concept (PoC).
   - Component affected (Backend endpoint, Frontend client, Database).
   - Impact assessment and potential severity.
3. **Do Not Exploit**: Please do not access or modify data belonging to other users, degrade system availability, or perform volumetric DoS attacks.

### 3.2 Response Service Level Agreement (SLA)
- **Initial Acknowledgment**: Within **24 hours**.
- **Triage & Validation**: Within **72 hours**.
- **Fix & Deployment**: Critical issues patched within **7 business days**.

### 3.3 Safe Harbor Policy
If you conduct security research in good faith in accordance with this policy:
- We will not initiate legal action against you.
- We will work collaboratively with you to resolve the vulnerability.
- We will publicly acknowledge your contribution in our release notes (unless you request anonymity).

---

## 4. Pre-Launch Security Audit Checklist

| Security Control | Target / Requirement | Status | Verification Reference |
| :--- | :--- | :---: | :--- |
| **Secrets in Git** | No API keys, passwords, or JWT secrets committed | **PASS** | Verified via `git log -S` and regex audit |
| **Gitignore Coverage** | `.env*` ignored in root, backend, and frontend | **PASS** | `.gitignore`, `backend/.gitignore`, `frontend/.gitignore` |
| **Frontend Env Isolation** | Only `VITE_` public variables bundled in client | **PASS** | Audited Vite production build chunks |
| **Password Hashing** | Bcrypt with salt rounds >= 12 | **PASS** | `backend/app/core/security.py`, `test_security_audit.py` |
| **JWT Expiration** | Enforce `exp` and `sub` claims, reject expired | **PASS** | `backend/app/core/security.py`, `test_security_audit.py` |
| **User Response Schemas** | Exclude `hashed_password` and plain `password` | **PASS** | `backend/app/schemas/user.py`, `profile.py` (`extra='ignore'`) |
| **CORS Policy** | No wildcard `*` with credentials in production | **PASS** | `backend/app/main.py`, `backend/app/core/config.py` |
| **HTTP Security Headers** | `X-Frame-Options`, `X-Content-Type-Options`, HSTS, CSP | **PASS** | `SecurityHeadersMiddleware` in `backend/app/main.py` |
| **SQL Injection** | Parameterized queries with SQLAlchemy ORM | **PASS** | Codebase query audit |
| **500 Error Sanitization** | Generic 500 response without stack trace leaks | **PASS** | `backend/app/utils/exceptions.py`, `test_security_audit.py` |
| **AI Secret Sanitization** | Gemini keys redacted from logs and errors | **PASS** | `backend/app/services/ai/gemini_client.py` |
