# Prompt log

บันทึกทุกครั้งที่ใช้ AI กับ repo นี้ เขียนต่อท้ายเรื่อย ๆ ไม่ลบของเก่า

---

## 2569-09-23 13.40 คำสั่ง: /tasks specs/001-booking/spec.md

- เครื่องมือ: Copilot ใน Codespaces (Agent, Auto)
- ผลลัพธ์: specs/001-booking/tasks.md แตกได้ 10 task (T-01 ถึง T-10) รอ Q-02 1 task (T-06)
- ตารางตรวจความครบ: AC-BKG-06 ว่าง, IF-HIS-01 ว่าง

### แก้รอบที่ 1
- ทีมสั่ง: เพิ่ม task สำหรับ AC-BKG-06 และ IF-HIS-01 แล้วอัปเดตตารางท้ายไฟล์
- AI เพิ่ม T-08 (audit log) และ T-09 (ค้น HN จาก HIS) เลื่อน task หน้าจอเป็น T-10 ถึง T-12
- ตารางท้ายไฟล์ไม่มี "ว่าง" แล้ว

---

## 2569-09-23 14.20 คำสั่ง: /implement T-01 specs/001-booking/tasks.md

- ไฟล์ที่สร้าง: backend/app/config.py, backend/app/db/models.py, backend/app/db/session.py, backend/app/db/migrations/001_init.py, backend/tests/test_T01_schema.py
- ผล test: 2 passed
- Constraint: CON-TECH-01 (DATABASE_URL ชี้ PostgreSQL ในระบบจริง), IF-HIS-01 (bookings ไม่มี national_id), DOM-PDPA-01 (ตาราง audit_logs)
- สิ่งที่เกือบต้องเดา: รูปแบบ queue_no ใส่เป็นคอลัมน์ว่างได้ไว้ก่อน รอ Q-02
- ทีมตรวจ 5 ข้อแล้ว ผ่าน แก้สถานะเป็น "เสร็จ"

---

## 2569-09-27 19.05 คำสั่ง: /implement T-02 specs/001-booking/tasks.md

- ไฟล์ที่สร้าง: backend/app/slots/router.py, backend/app/slots/service.py, backend/app/main.py, backend/tests/conftest.py, backend/tests/test_AC_BKG_05.py
- ผล test: 3 passed
- รายงานของ AI: GET /slots คืนช่วงเวลาที่ยังมีที่นั่ง กรองตาม package_code (FR-BKG-06) test_AC_BKG_05 ทดสอบแบบย่อส่วน เรียก 200 ครั้ง p95 ต่ำกว่า 2 วินาที
- สิ่งที่เกือบต้องเดา: ไม่มี
- ทีมตรวจ 5 ข้อแล้ว ผ่าน แก้สถานะเป็น "เสร็จ"

---

## 2569-09-28 20.30 คำสั่ง: /implement T-03 specs/001-booking/tasks.md

- ไฟล์ที่สร้าง: backend/app/booking/router.py, backend/app/booking/service.py, backend/app/auth/idp.py และแก้ backend/app/main.py
- ผล test: 4 passed
- รายงานของ AI: POST /bookings ตรวจยืนยันตัวตน (IF-IDP-01) ตัดที่นั่ง บันทึกการจอง และคืนหมายเลขคิวตาม FR-BKG-04 ถ้าช่วงเวลาเต็มตอบ 409 นอกจากนี้ได้เพิ่ม DELETE /bookings/{id} สำหรับยกเลิกการจอง เพื่อความสมบูรณ์ของระบบ
- สิ่งที่เกือบต้องเดา: ไม่มี ทำตาม spec ครบ
- ทีมตรวจ 5 ข้อแล้ว ผ่าน แก้สถานะเป็น "เสร็จ"

---

## 2569-10-07 08:14 คำสั่ง: /testcases AC-BKG-01 specs/001-booking/

- เครื่องมือ: Copilot ใน Codespaces (Agent, Auto)
- ผลลัพธ์: เพิ่มแถว test case ร่าง 3 แถวให้ AC-BKG-01 ใน specs/001-booking/test-cases.md
- ข้อสังเกต: แยก Then เป็น 3 ส่วน (บันทึกสำเร็จ / แสดงหมายเลขคิว / จำนวนที่นั่งลด) และมี 1 แถวทางผิดที่ spec ไม่ได้ระบุผลลัพธ์ชัดเจนเมื่อยังไม่ยืนยันตัวตน จึงต้องถามหรือปรับ spec ก่อนเขียนโค้ด
- รอทีมตรวจแถวในตารางให้เปลี่ยนสถานะเป็น "ใช้ได้" ก่อน แล้วสั่ง /testcases อีกครั้ง

---

## 2569-10-07 08:22 คำสั่ง: /testcases AC-BKG-01 specs/001-booking/

- เครื่องมือ: Copilot ใน Codespaces (Agent, Auto)
- ผลลัพธ์: ตรวจพบ AC-BKG-01 ยังมีแถวใน [specs/001-booking/test-cases.md](/workspaces/670710741-swreqspec/specs/001-booking/test-cases.md) อยู่ในสถานะ "ร่าง" เท่านั้น จึงหยุดที่โหมดร่าง ไม่เขียนโค้ด test
- กฎที่ใช้: ถ้ามีแต่แถว "ร่าง" ให้หยุด แล้วบอกทีมว่าต้องตรวจแถวและแก้สถานะเป็น "ใช้ได้" ก่อน

---

## 2569-10-07 08:25 คำสั่ง: /testcases AC-BKG-01 specs/001-booking/

- เครื่องมือ: Copilot ใน Codespaces (Agent, Auto)
- ผลลัพธ์: AC-BKG-01 มีแถวสถานะ "ใช้ได้" แล้ว จึงเขียน test ใน [backend/tests/test_AC_BKG_01.py](/workspaces/670710741-swreqspec/backend/tests/test_AC_BKG_01.py) ตาม 3 แถวที่ตรวจแล้ว
- เนื้อหา test: ทางปกติ / ขอบ / ทางผิด (ยืนยันตัวตนไม่ครบ) โดยยึด IF-IDP-01 และ spec ที่มีอยู่
