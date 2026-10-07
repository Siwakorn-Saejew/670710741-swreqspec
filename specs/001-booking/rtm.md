# RTM: จองคิวตรวจสุขภาพ
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-10-07 08:31 | test: 7 ผ่าน 0 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-BKG-01 | AC-BKG-05 | T-02 | backend/app/slots/router.py:get_slots; backend/app/slots/service.py:list_available_slots | test_AC_BKG_05 PASSED | ช่องโหว่ |
| FR-BKG-02 | AC-BKG-02 | T-04 | ไม่มีโค้ดที่ปฏิเสธการจองซ้ำในวันเดียวกัน | ไม่มี test | ยังไม่ถึง |
| FR-BKG-03 | AC-BKG-03 | T-05, T-11, T-12 | ไม่มีโค้ดที่เสนอ 3 ช่วงใกล้เคียงและไม่สร้างรายการจองซ้อน | ไม่มี test | ยังไม่ถึง |
| FR-BKG-04 | AC-BKG-01 | T-03, T-06 | backend/app/booking/router.py:create_booking; backend/app/booking/service.py:create_booking; next_queue_no | test_TC_BKG_01_1, 01_2, 01_3 PASSED | ครบ |
| FR-BKG-05 | AC-BKG-04 | T-07 | ไม่มีคิวส่งซ้ำภายใน 5 นาที | ไม่มี test | ยังไม่ถึง |
| FR-BKG-06 | ไม่มี AC | T-02, T-10 | backend/app/slots/service.py:list_available_slots (กรอง package_code) | ไม่มี test ตรวจ package_code อย่างชัดเจน | ช่องโหว่ |
| NFR-PERF-01 | AC-BKG-05 | T-02 | backend/app/slots/service.py:list_available_slots | test_AC_BKG_05 PASSED | ครบ |
| NFR-SEC-01 | ไม่มี AC | ไม่มี task | backend/app/config.py:DATABASE_URL; ไม่มี TLS termination ในโค้ด | ไม่มี test | ยังไม่ถึง |
| NFR-REL-02 | AC-BKG-04 | T-07 | ไม่มี logic ส่งซ้ำภายใน 5 นาที | ไม่มี test | ยังไม่ถึง |
| NFR-USE-01 | ไม่มี AC | ไม่มี task | ไม่มีการวัดเวลาและประสิทธิภาพผู้ใช้ใหม่ในโค้ด | ไม่มี test | ยังไม่ถึง |
| CON-TECH-01 | ไม่มี AC | T-01 | backend/app/config.py:DATABASE_URL; backend/app/db/models.py | tests/test_T01_schema.py PASSED | ครบ |
| DOM-PDPA-01 | AC-BKG-06 | T-08 | backend/app/db/models.py:AuditLog; ไม่มี middleware audit log ที่เรียกจริงใน app/main.py | ไม่มี test | ยังไม่ถึง |
| IF-IDP-01 | ไม่มี AC | T-03 | backend/app/auth/idp.py:get_verified_hn; backend/app/booking/router.py:create_booking | test_TC_BKG_01_3_unverified_user PASSED | ครบ |
| IF-HIS-01 | ไม่มี AC | T-09 | backend/app/db/models.py:Booking ไม่มี national_id; ไม่มี HIS client | tests/test_T01_schema.py::test_T01_no_national_id PASSED | ครบ |
| IF-NOT-01 | AC-BKG-04 | T-07 | ไม่มี async notification queue และไม่มี retry | ไม่มี test | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| backend/app/slots/router.py:get_slots | FR-BKG-01, FR-BKG-06 | ไม่ครบ | คำสั่งนี้คืน slot ที่มี remaining แต่โค้ดใช้ช่วง 14 วันเท่านั้น ไม่ตรงกับ "ภายใน 30 วันข้างหน้า" |
| backend/app/slots/service.py:list_available_slots | FR-BKG-01, FR-BKG-06 | ไม่ครบ | DAYS_AHEAD = 14 ไม่ใช่ 30 และไม่มีการกรองช่วงว่างที่เหลือ 0 อย่างชัดเจน |
| backend/app/booking/router.py:create_booking | FR-BKG-04, IF-IDP-01 | ครบ | ตรวจ auth ก่อนบันทึก และคืน queue_no หลังยืนยันสำเร็จ |
| backend/app/booking/service.py:create_booking | FR-BKG-04 | ครบ | ตัด remaining และสร้าง booking กับ queue_no ได้ตาม spec สำหรับ AC-BKG-01 |
| backend/app/auth/idp.py:get_verified_hn | IF-IDP-01 | ครบ | ปฏิเสธการเข้าถึงเมื่อไม่มีการยืนยันตัวตน |
| backend/app/config.py:DATABASE_URL | CON-TECH-01 | ครบ | ตั้งค่า PostgreSQL ในระบบจริงและ SQLite ใน dev environment |
| backend/app/db/models.py:Booking | IF-HIS-01 | ครบ | ไม่มี national_id และเก็บเฉพาะ HN |
| backend/app/main.py:app | DOM-PDPA-01 | ไม่ครบ | ไม่มี audit log middleware ที่บันทึก actor_id, accessed_at, hn เมื่อเข้าถึงข้อมูลการจอง |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | FR ไม่มี AC | spec.md / FR-BKG-06 | FR-BKG-06 | FR-BKG-06 มีข้อความว่า "เมื่อผู้รับบริการเปลี่ยนแพ็กเกจระหว่างเลือกเวลา ระบบต้องคำนวณช่วงเวลาที่ว่างใหม่ตามแพ็กเกจที่เลือก" แต่ไม่มี AC ที่ตรวจเรื่องนี้ และไม่มี test ที่ตรวจจริง | เพิ่ม AC / แก้ spec |
| F-002 | ตัวเลขไม่ตรง spec | backend/app/slots/service.py:DAYS_AHEAD | FR-BKG-01 | spec ระบุ "ภายใน 30 วันข้างหน้า" แต่โค้ดใช้ 14 วันเท่านั้น และแสดงว่าไม่ได้ทำตามความต้องการช่วง 30 วัน | แก้โค้ด |
| F-003 | โค้ดไม่มี FR | backend/app/booking/service.py; backend/app/notify/* | FR-BKG-05, IF-NOT-01, NFR-REL-02 | สเปคต้องส่งข้อความยืนยันแบบ asynchronous และมีการส่งซ้ำภายใน 5 นาที แต่ไม่มีคิวส่งข้อความหรือ retry logic ในโค้ด | แก้โค้ด |
| F-004 | โค้ดไม่มี FR | backend/app/main.py; backend/app/db/models.py | DOM-PDPA-01 | ไม่มี middleware หรือ endpoint ที่บันทึก audit log ทุกครั้งที่เข้าถึงข้อมูลการจอง แม้ตาราง AuditLog มีอยู่แล้ว แต่ยังไม่ถูกใช้จริง | แก้โค้ด |
| F-005 | test อ่อน | backend/tests/test_AC_BKG_05.py:test_AC_BKG_05 | AC-BKG-05, FR-BKG-01 | test ปลอมว่า "ผู้ใช้พร้อมกัน 200 คน" โดยเรียก 200 ครั้งต่อ localhost ใน process เดียว และไม่ตรวจว่ามีช่วง 30 วันจริงหรือกรองแพ็กเกจถูกต้อง | แก้ test |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| - | - | ไม่มีข้อค้นพบเดิมจาก RTM ก่อนหน้า |
