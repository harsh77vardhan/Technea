"""upgrade_learning_paths_and_roadmap_steps

Revision ID: 3a1b5c7d9e2f
Revises: 2b47370cf679
Create Date: 2026-10-31 01:00:00.000000

"""
import re
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3a1b5c7d9e2f'
down_revision: Union[str, None] = '2b47370cf679'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def slugify(text: str) -> str:
    s = text.lower().replace("&", "and").replace("/", "-")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def upgrade() -> None:
    # 1. Add columns to learning_paths using batch_alter_table
    with op.batch_alter_table('learning_paths', schema=None) as batch_op:
        batch_op.add_column(sa.Column('slug', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('skills_covered', sa.JSON(), nullable=True, server_default='[]'))
        batch_op.add_column(sa.Column('prerequisites', sa.JSON(), nullable=True, server_default='[]'))
        batch_op.add_column(sa.Column('career_outcomes', sa.JSON(), nullable=True, server_default='[]'))
        batch_op.add_column(sa.Column('technology_stack', sa.JSON(), nullable=True, server_default='[]'))
        batch_op.add_column(sa.Column('resources', sa.JSON(), nullable=True, server_default='[]'))
        batch_op.add_column(sa.Column('tags', sa.JSON(), nullable=True, server_default='[]'))
        batch_op.add_column(sa.Column('is_featured', sa.Boolean(), server_default=sa.text('false'), nullable=False))
        batch_op.add_column(sa.Column('popularity_rank', sa.Integer(), server_default='100', nullable=False))

    # 2. Backfill existing learning paths with clean, unique slugs
    bind = op.get_bind()
    rows = bind.execute(sa.text("SELECT id, title FROM learning_paths")).fetchall()
    seen_slugs = set()
    for row in rows:
        row_id, title = row[0], row[1]
        base_slug = slugify(title)
        slug = base_slug
        counter = 2
        while slug in seen_slugs:
            slug = f"{base_slug}-{counter}"
            counter += 1
        seen_slugs.add(slug)
        bind.execute(
            sa.text("UPDATE learning_paths SET slug = :slug WHERE id = :id AND (slug IS NULL OR slug = '')"),
            {"slug": slug, "id": row_id}
        )

    # 3. Create indexes on learning_paths
    with op.batch_alter_table('learning_paths', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_learning_paths_slug'), ['slug'], unique=True)
        batch_op.create_index(batch_op.f('ix_learning_paths_is_featured'), ['is_featured'], unique=False)
        batch_op.create_index(batch_op.f('ix_learning_paths_popularity_rank'), ['popularity_rank'], unique=False)

    # 4. Add columns to roadmap_steps using batch_alter_table
    with op.batch_alter_table('roadmap_steps', schema=None) as batch_op:
        batch_op.add_column(sa.Column('topics', sa.JSON(), nullable=True, server_default='[]'))
        batch_op.add_column(sa.Column('duration', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('project_idea', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('resources', sa.JSON(), nullable=True, server_default='[]'))


def downgrade() -> None:
    with op.batch_alter_table('roadmap_steps', schema=None) as batch_op:
        batch_op.drop_column('resources')
        batch_op.drop_column('project_idea')
        batch_op.drop_column('duration')
        batch_op.drop_column('topics')

    with op.batch_alter_table('learning_paths', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_learning_paths_popularity_rank'))
        batch_op.drop_index(batch_op.f('ix_learning_paths_is_featured'))
        batch_op.drop_index(batch_op.f('ix_learning_paths_slug'))
        batch_op.drop_column('popularity_rank')
        batch_op.drop_column('is_featured')
        batch_op.drop_column('tags')
        batch_op.drop_column('resources')
        batch_op.drop_column('technology_stack')
        batch_op.drop_column('career_outcomes')
        batch_op.drop_column('prerequisites')
        batch_op.drop_column('skills_covered')
        batch_op.drop_column('slug')
