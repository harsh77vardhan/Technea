"""add_website_url_and_profile_visibility

Revision ID: 2b47370cf679
Revises: 2f63d288448f
Create Date: 2026-10-18 17:28:44.820481

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b47370cf679'
down_revision: Union[str, None] = '2f63d288448f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('website_url', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('profile_visibility', sa.String(length=20), server_default='public', nullable=False))


def downgrade() -> None:
    op.drop_column('users', 'profile_visibility')
    op.drop_column('users', 'website_url')

