"""remove image_url column

Revision ID: 04c88d92e983
Revises: 018dbdd6bbd3
Create Date: 2026-05-30 12:57:32.359191

"""

from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = "04c88d92e983"
down_revision: Union[str, Sequence[str], None] = "018dbdd6bbd3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
