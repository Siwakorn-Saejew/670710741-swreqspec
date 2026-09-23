from app.db.models import Base
from app.db.session import engine

# รองรับ: CON-TECH-01, DOM-PDPA-01, IF-HIS-01


def upgrade():
    Base.metadata.create_all(bind=engine)


def downgrade():
    Base.metadata.drop_all(bind=engine)
