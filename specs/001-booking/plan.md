# Plan: จองคิวตรวจสุขภาพ (Booking)

## 1. สรุปแนวทาง

- ฟีเจอร์นี้ให้ผู้รับบริการที่ยืนยันตัวตนแล้วเลือกแพ็กเกจ วัน และช่วงเวลาตรวจสุขภาพ แล้วบันทึกการจองและออกหมายเลขคิว
- ผู้ใช้หลักคือ ผู้รับบริการที่ต้องจองคิว และระบบที่ต้องแสดงข้อมูลช่วงเวลาและส่งข้อความยืนยันแบบ asynchronous
- แนวทางคือสร้างหน้าจอแสดงช่วงเวลาว่างและข้อมูลคงเหลือ, ระบบ booking service ที่ตรวจเงื่อนไขการจอง, และ queue worker สำหรับส่งข้อความยืนยันพร้อม retry
- การออกแบบให้คำนึงถึงความปลอดภัยเช่น ตรวจยืนยันตัวตนก่อนเข้าถึงข้อมูล, ไม่มีการเก็บเลขบัตรประชาชนในตารางการจอง, และบันทึก audit log ทุกครั้งที่เข้าถึงข้อมูลสุขภาพ
- ผลลัพธ์หลักจะอยู่ที่การบันทึก booking อย่างปลอดภัย, ป้องกันการซ้อนจอง, และคงสถานะการส่งข้อความให้สามารถ retry ได้ตามเงื่อนไขที่กำหนด
- ทีมได้ตัดสินใจแล้วว่า: ตัวเลือกช่วงเวลาใกล้เคียงจะรวมวันถัดไปด้วยเมื่อไม่พบตัวเลือกในวันเดียวกัน, หมายเลขคิวจะรีเซ็ตทุกวัน, และ NFR-USE-01 จะเลื่อนออกก่อนจนกว่าจะกำหนดวิธีทดสอบและเงื่อนไขความสำเร็จ

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| Frontend: React (Vite) | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สำหรับแสดงวัน/ช่วงเวลา/จำนวนที่นั่งคงเหลือและผลลัพธ์การจอง |
| Backend: Python FastAPI | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สำหรับ API booking, validation, notification orchestration |
| Database: MySQL | CON-TECH-01 | ต้องใช้ตามมาตรฐานฝ่าย IT ของโรงพยาบาล |
| HTTPS/TLS | NFR-SEC-01 | ใช้ TLS 1.2 ขึ้นไป สำหรับการรับส่งข้อมูลที่มีความอ่อนไหว |
| Notification queue / async worker | IF-NOT-01, FR-BKG-04, FR-BKG-05, NFR-REL-02 | ระบบส่งข้อความแบบ asynchronous และให้ retry ตามเงื่อนไขที่กำหนด |
| Audit log table | DOM-PDPA-01 | ต้องบันทึกผู้เข้าถึง เวลา และรหัสผู้รับบริการ อย่างน้อย 1 ปี |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ FR/Constraint |
|---|---|---|
| Booking | booking_id, patient_hn, package_id, booking_date, slot_start_time, slot_end_time, queue_number, status, created_at, updated_at | FR-BKG-02, FR-BKG-04, FR-BKG-05, IF-HIS-01 |
| BookingSlot | slot_date, slot_time, package_id, capacity, booked_count, version | FR-BKG-01, FR-BKG-03, FR-BKG-06 |
| NotificationMessage | notification_id, booking_id, channel, payload, status, retry_count, next_retry_at, created_at, updated_at, last_error | FR-BKG-04, FR-BKG-05, NFR-REL-02, IF-NOT-01 |
| AuditLog | log_id, accessor_user_id, accessed_at, patient_hn, action, metadata | DOM-PDPA-01 |
| PatientReference | hn, idp_verified_at, citizen_id_hash (ถ้าจำเป็นภายใน vault) | IF-IDP-01, IF-HIS-01 |

- ไม่เก็บเลขบัตรประชาชนในตารางการจอง ตาม IF-HIS-01
- ตาราง Booking และ BookingSlot จะใช้ HN เป็นตัวอ้างอิงภายในระบบแทนเลขบัตรประชาชน
- ไม่มีฟิลด์ citizen_id หรือ national_id ใน Booking หรือ BookingSlot เพื่อให้สอดคล้องกับ IF-HIS-01

## 4. API / หน้าจอ

| ชื่อ | รายละเอียด | รองรับ FR |
|---|---|---|
| GET /booking/slots?date=... | แสดงช่วงเวลาว่างภายใน 30 วันข้างหน้า พร้อมจำนวนที่นั่งคงเหลือ | FR-BKG-01 |
| GET /booking/packages | แสดงแพ็กเกจที่พร้อมให้เลือก | FR-BKG-06 |
| POST /booking/check-duplicate | ตรวจว่าผู้รับบริการมีคิวที่ยังไม่ได้ใช้ในวันเดียวกันหรือไม่ | FR-BKG-02 |
| POST /booking/confirm | ยืนยันการจองและสร้าง booking, queue number, และ request notification | FR-BKG-03, FR-BKG-04 |
| POST /booking/notify/retry | worker retry ส่งข้อความเมื่อผิดพลาดหรือ timeout | FR-BKG-05, NFR-REL-02 |
| GET /booking/{id} | ดูสถานะการจองและสถานะข้อความ | FR-BKG-05 |
| หน้า Booking Form | เลือกแพ็กเกจ วัน และช่วงเวลา พร้อมแสดงข้อความเต็มและตัวเลือกใกล้เคียง 3 ตัว | FR-BKG-01, FR-BKG-03, FR-BKG-06 |
| หน้า Booking Result | แสดงหมายเลขคิว, สถานะสำเร็จ/สีแดง, และข้อมูลการส่งข้อความ | FR-BKG-04, FR-BKG-05 |

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-TECH-01 | Database MySQL, schema ของ booking, slot, notification, audit log | ใช้แล้ว |
| DOM-PDPA-01 | AuditLog entity และ requirement ให้บันทึกผู้เข้าถึง เวลา และรหัสผู้รับบริการ | ใช้แล้ว |
| IF-IDP-01 | Booking flow ต้องตรวจยืนยันตัวตนก่อนใช้ฟีเจอร์ | ใช้แล้ว |
| IF-HIS-01 | PatientReference / Booking ใช้ HN แทนเลขบัตรประชาชน และไม่เก็บเลขบัตรประชาชนในตารางการจอง | ใช้แล้ว |
| IF-NOT-01 | NotificationMessage queue และ async worker สำหรับ SMS/LINE | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-BKG-01 | test_AC_BKG_01_booking_success_reduces_capacity | ทดสอบกรณีช่วง 09.00 มีที่นั่ง 1 ที่ เมื่อยืนยันสำเร็จ จะบันทึก booking, แสดงหมายเลขคิว, และจำนวนที่นั่งคงเหลือเหลือ 0 |
| AC-BKG-02 | test_AC_BKG_02_duplicate_booking_rejected | ทดสอบเมื่อมีคิวที่ยังไม่ได้ใช้ในวันเดียวกัน จะถูกปฏิเสธและแสดงหมายเลขคิวเดิม |
| AC-BKG-03 | test_AC_BKG_03_slot_full_offers_three_alternatives | ทดสอบเมื่อ slot เหลือ 1 ที่ และมีผู้ใช้ยืนยันก่อนแล้ว จะแสดงข้อความ “ช่วงเวลาเต็ม” พร้อม 3 ตัวเลือก และไม่เกิดการจองซ้อน |
| AC-BKG-04 | test_AC_BKG_04_notification_failure_keeps_booking_and_retries | ทดสอบกรณี notification error หรือ timeout ให้ booking ถูกบันทึก, แสดงหมายเลขคิว, สถานะข้อความสีแดง, และมี retry สูงสุด 3 ครั้ง ภายใน 10 นาที |
| AC-BKG-05 | test_AC_BKG_05_search_slots_p95_2_seconds | ทดสอบแรงกด 200 คนพร้อมกันเพื่อวัด p95 ของเวลาตอบสนองเมื่อค้นหาช่วงเวลาว่าง |
| AC-BKG-06 | test_AC_BKG_06_audit_log_written | ทดสอบเมื่อมีการเข้าถึงข้อมูลการจอง จะบันทึก audit log ที่มีผู้เข้าถึง เวลา และรหัสผู้รับบริการ |

## 7. ลำดับงาน

1. กำหนด schema พื้นฐานของ Booking, BookingSlot, NotificationMessage และ AuditLog (รองรับ FR-BKG-01, FR-BKG-04, DOM-PDPA-01)
2. สร้าง API แสดงช่วงเวลาว่างและจำนวนที่นั่งคงเหลือ (FR-BKG-01, AC-BKG-05)
3. สร้าง flow ตรวจสอบคิวที่ยังไม่ได้ใช้ในวันเดียวกันก่อนยืนยัน (FR-BKG-02, AC-BKG-02)
4. สร้าง flow ป้องกันการจองซ้อนและเลือกช่วงเวลาทดแทนเมื่อ slot เต็ม (FR-BKG-03, AC-BKG-03)
5. สร้าง booking confirmation flow บันทึกการจองและออกหมายเลขคิว (FR-BKG-04, AC-BKG-01)
6. สร้าง async notification worker และ retry policy สำหรับ error/timeout (FR-BKG-05, NFR-REL-02, AC-BKG-04)
7. เพิ่ม audit log และตรวจสอบการเข้าถึงข้อมูลสุขภาพ (DOM-PDPA-01, AC-BKG-06)
8. ทดสอบ end-to-end และผลการทำงานแบบ concurrency และ failover (AC-BKG-01 ถึง AC-BKG-06)

## 8. สิ่งที่ยังไม่ทำ / เลื่อนออกก่อน

- NFR-USE-01: ยังเลื่อนออกก่อนจนกว่าจะกำหนดวิธีทดสอบและเงื่อนไขความสำเร็จ สำหรับตอนนี้ไม่มีการสร้าง test automation หรือ KPI สำหรับข้อนี้
- ข้อสรุปจากทีม: "ช่วงเวลาใกล้เคียง" จะรวมวันถัดไปด้วยเมื่อไม่มีตัวเลือกในวันเดียวกัน และหมายเลขคิวจะรีเซ็ตทุกวัน; ทาง plan จึงใช้กติกาเหล่านี้เป็นเงื่อนไขพัฒนาโดยตรง

## 9. ข้อสรุปทีม

- Constraint ที่ยังไม่ได้ใช้: ไม่มี; ทุก Constraint ใน spec ได้ถูกนำไปใช้ในแผนนี้แล้ว
- AC ที่ทดสอบยาก/ทดสอบไม่ได้ในสภาพแวดล้อมนักศึกษา: AC-BKG-03, AC-BKG-04, AC-BKG-05 เนื่องจากต้องมีสภาวะ real concurrency, ระบบ SMS/LINE จริง, และการทำงานพร้อมกันของหลาย user ในเวลาพอดี
- ทีมได้ตัดสินใจแล้วสำหรับข้อที่เคยเป็น Open Questions: ตัวเลือกช่วงเวลาใกล้เคียงรวมวันถัดไปด้วย, หมายเลขคิวรีเซ็ตทุกวัน, และ NFR-USE-01 เลื่อนออกก่อน

