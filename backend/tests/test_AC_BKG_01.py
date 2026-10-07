# test ของ T-03: จองคิวสำเร็จ
# AC-BKG-01 (FR-BKG-04)
from app.db.models import Booking, Slot
from tests.conftest import AUTH


def test_TC_BKG_01_1_booking_success(client, db, make_slot):
    """TC-BKG-01-1: ทางปกติ"""
    # Given: ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง 3 ที่
    slot = make_slot(start="09:00", remaining=3)

    # When: ยืนยันการจองช่วง 09.00 น.
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then: บันทึกการจองสำเร็จ; แสดงหมายเลขคิว; ที่นั่งว่างของช่วง 09.00 น. ลดจาก 3 เป็น 2
    assert res.status_code == 201
    payload = res.json()
    assert payload["slot_id"] == slot.id
    assert payload["queue_no"]
    assert db.get(Slot, slot.id).remaining == 2
    assert db.query(Booking).filter_by(slot_id=slot.id).count() == 1


def test_TC_BKG_01_2_booking_last_seat(client, db, make_slot):
    """TC-BKG-01-2: ขอบ"""
    # Given: ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่
    slot = make_slot(start="09:00", remaining=1)

    # When: ยืนยันการจองช่วง 09.00 น.
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then: บันทึกการจองสำเร็จ; แสดงหมายเลขคิว; ที่นั่งว่างของช่วงนั้นเป็น 0
    assert res.status_code == 201
    payload = res.json()
    assert payload["queue_no"]
    assert db.get(Slot, slot.id).remaining == 0
    assert db.query(Booking).filter_by(slot_id=slot.id).count() == 1


def test_TC_BKG_01_3_unverified_user(client, db, make_slot):
    """TC-BKG-01-3: ทางผิด"""
    # Given: ยังไม่ยืนยันตัวตน และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่
    slot = make_slot(start="09:00", remaining=1)

    # When: พยายามยืนยันการจองช่วง 09.00 น.
    res = client.post("/bookings", json={"slot_id": slot.id})

    # Then: spec ไม่ได้บอกว่าควรปฏิเสธแบบใดหรือไม่ควรบันทึกเมื่อยังไม่ยืนยันตัวตน
    # อย่างไรก็ตาม IF-IDP-01 บังคับว่า ต้องยืนยันตัวตนก่อนเข้าถึงข้อมูลผู้รับบริการ
    # ระบบปัจจุบันจึงปฏิเสธด้วย 401 และไม่บันทึกการจอง
    assert res.status_code == 401
    assert db.get(Slot, slot.id).remaining == 1
    assert db.query(Booking).filter_by(slot_id=slot.id).count() == 0
