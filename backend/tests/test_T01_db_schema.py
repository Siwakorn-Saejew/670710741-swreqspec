from sqlalchemy import inspect

from app.db.models import AuditLog, Booking, Slot
from app.db.session import engine


def test_T01_creates_required_tables_and_columns():
    inspector = inspect(engine)

    assert "slots" in inspector.get_table_names()
    assert "bookings" in inspector.get_table_names()
    assert "audit_logs" in inspector.get_table_names()

    slot_columns = {col["name"] for col in inspector.get_columns("slots")}
    booking_columns = {col["name"] for col in inspector.get_columns("bookings")}
    audit_columns = {col["name"] for col in inspector.get_columns("audit_logs")}

    assert {"id", "slot_date", "start_time", "package_code", "capacity", "remaining"}.issubset(slot_columns)
    assert {"id", "hn", "slot_id", "booking_date", "queue_no", "status", "created_at"}.issubset(booking_columns)
    assert {"id", "actor_id", "action", "hn", "accessed_at"}.issubset(audit_columns)

    assert "national_id" not in booking_columns
    assert "slot_id" in booking_columns
