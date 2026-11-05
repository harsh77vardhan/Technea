"""add user refresh tokens, auth rate limits, and security indexes

Revision ID: 8b9c0d1e2f3a
Revises: 7a8b9c0d1e2f
Create Date: 2026-11-06 00:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '8b9c0d1e2f3a'
down_revision: Union[str, None] = '7a8b9c0d1e2f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    dialect_name = conn.dialect.name

    uuid_type = postgresql.UUID(as_uuid=True) if dialect_name == "postgresql" else sa.String(36)

    # 1. Create user_refresh_tokens table
    op.create_table(
        'user_refresh_tokens',
        sa.Column('id', uuid_type, primary_key=True),
        sa.Column('user_id', uuid_type, sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('token_hash', sa.String(64), nullable=False, unique=True),
        sa.Column('family_id', uuid_type, nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rotated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('client_ip', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_index('ix_user_refresh_tokens_user_id', 'user_refresh_tokens', ['user_id'])
    op.create_index('ix_user_refresh_tokens_token_hash', 'user_refresh_tokens', ['token_hash'])
    op.create_index('ix_user_refresh_tokens_family_id', 'user_refresh_tokens', ['family_id'])
    op.create_index('ix_user_refresh_tokens_expires_at', 'user_refresh_tokens', ['expires_at'])
    op.create_index('ix_user_refresh_tokens_revoked_at', 'user_refresh_tokens', ['revoked_at'])
    op.create_index('ix_refresh_tokens_family', 'user_refresh_tokens', ['family_id', 'revoked_at'])
    op.create_index('ix_refresh_tokens_user_active', 'user_refresh_tokens', ['user_id', 'expires_at'])

    # 2. Create auth_rate_limits table
    op.create_table(
        'auth_rate_limits',
        sa.Column('id', uuid_type, primary_key=True),
        sa.Column('key', sa.String(255), nullable=False),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )

    op.create_index('ix_auth_rate_limits_key', 'auth_rate_limits', ['key'])
    op.create_index('ix_auth_rate_limits_action', 'auth_rate_limits', ['action'])
    op.create_index('ix_auth_rate_limits_created_at', 'auth_rate_limits', ['created_at'])
    op.create_index('ix_rate_limits_key_action_time', 'auth_rate_limits', ['key', 'action', 'created_at'])

    # 3. Index password_reset_token on users
    try:
        op.create_index('ix_users_password_reset_token', 'users', ['password_reset_token'])
    except Exception:
        pass

    # 4. Partial and functional indexes for PostgreSQL
    if dialect_name == "postgresql":
        op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email_lower ON users (lower(email));")
        op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id_not_null ON users (google_id) WHERE google_id IS NOT NULL;")
        op.execute("CREATE INDEX IF NOT EXISTS ix_email_otps_active ON email_otps (email, created_at DESC) WHERE is_used = false;")


def downgrade() -> None:
    conn = op.get_bind()
    dialect_name = conn.dialect.name

    if dialect_name == "postgresql":
        op.execute("DROP INDEX IF EXISTS ix_email_otps_active;")
        op.execute("DROP INDEX IF EXISTS ix_users_google_id_not_null;")
        op.execute("DROP INDEX IF EXISTS ix_users_email_lower;")

    try:
        op.drop_index('ix_users_password_reset_token', table_name='users')
    except Exception:
        pass

    op.drop_table('auth_rate_limits')
    op.drop_table('user_refresh_tokens')
