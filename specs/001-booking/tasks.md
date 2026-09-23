# Tasks: จองคิวตรวจสุขภาพ (Booking)
- Feature: จองคิวตรวจสุขภาพ (Booking)
- Spec ID: SPEC-BKG-001
- อ้างอิง plan.md: specs/001-booking/plan.md
- วันที่: 2569-09-23

สรุป: ทำทั้งหมด 12 task และมี 1 task ที่ต้องรอ Open Question (Q-02) ก่อนทำต่อได้
สรุป: งานแบ่งเป็นลำดับพึ่งพาแบบ data → API → frontend → validation โดยแยก task ที่เชื่อมกับ AC และ constraint อย่างชัดเจน

### T-01 สร้าง schema ฐานข้อมูลและ migration พื้นฐาน
- รองรับ: CON-TECH-01, DOM-PDPA-01, IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04
- ไฟล์ที่แตะ: backend/app/db/models.py, backend/app/db/session.py, backend/app/db/migrations/001_init.py, backend/app/config.py
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: migration สร้างตาราง slots, bookings, audit_logs พร้อมใช้ PostgreSQL ในระบบจริง และ SQLite ใน test ได้
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 ตรวจสิทธิ์ยืนยันตัวตนและค้น HN จาก HIS ก่อนทำ booking
- รองรับ: IF-IDP-01, IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04
- ไฟล์ที่แตะ: backend/app/auth/idp.py, backend/app/his/client.py, backend/app/booking/router.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: ทุก request ที่เข้าถึงข้อมูลผู้รับบริการผ่าน auth check และ lookup HN จาก HIS โดยไม่เก็บเลขบัตรประชาชนลง booking table
- สถานะ: พร้อมทำ

### T-03 สร้าง API ดึงช่วงเวลาว่างและคำนวณที่นั่งคงเหลือ
- รองรับ: FR-BKG-01, FR-BKG-06, NFR-PERF-01
- ตรวจด้วย: AC-BKG-05
- ไฟล์ที่แตะ: backend/app/slots/router.py, backend/app/slots/service.py
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: GET /slots คืนช่วงเวลาใน 30 วันข้างหน้า พร้อม remaining และตอบ p95 ใน 2 วินาที เมื่อผู้ใช้พร้อมกัน 200 คน
- สถานะ: พร้อมทำ

### T-04 สร้าง API จองคิวพื้นฐานและตัดที่นั่งทันที
- รองรับ: FR-BKG-04
- ตรวจด้วย: AC-BKG-01
- ไฟล์ที่แตะ: backend/app/booking/router.py, backend/app/booking/service.py
- ต้องทำหลัง: T-01, T-02, T-03
- เสร็จเมื่อ: POST /bookings บันทึก booking, ตัด remaining ของ slot, คืนหมายเลขคิว (placeholder) และบันทึกการจองสำเร็จในฐานข้อมูล
- สถานะ: พร้อมทำ

### T-05 ป้องกันการจองซ้ำในวันเดียวกันและคืนคิวเดิม
- รองรับ: FR-BKG-02
- ตรวจด้วย: AC-BKG-02
- ไฟล์ที่แตะ: backend/app/booking/service.py
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: ผู้รับบริการที่มีคิวยังไม่ได้ใช้ในวันเดียวกันถูกปฏิเสธด้วย 409 และระบบแสดงหมายเลขคิวเดิมกลับไป
- สถานะ: พร้อมทำ

### T-06 จัดการช่วงเวลาที่เต็มและเสนอ 3 ตัวเลือกที่ใกล้ที่สุด
- รองรับ: FR-BKG-03
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: backend/app/slots/service.py, backend/app/booking/service.py, backend/app/booking/router.py
- ต้องทำหลัง: T-03, T-04
- เสร็จเมื่อ: เมื่อ slot เต็มระหว่างยืนยัน ระบบคืน 409 พร้อม 3 ช่วงที่ว่างใกล้ที่สุดภายในวันเดียวกันและวันถัดไป และไม่มีรายการจองซ้อนเกิดขึ้น
- สถานะ: พร้อมทำ

### T-07 จัดการคิวส่งข้อความยืนยันแบบ asynchronous และ retry ภายใน 5 นาที
- รองรับ: FR-BKG-05, IF-NOT-01, NFR-REL-02
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: backend/app/notify/queue.py, backend/app/booking/service.py
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: การจองยังถูกบันทึกแม้ส่งข้อความไม่สำเร็จ และมีรายการค้างส่งที่กำหนดให้ retry ภายใน 5 นาทีตามข้อกำหนด
- สถานะ: พร้อมทำ

### T-08 บันทึก audit log ทุกครั้งที่เข้าถึงข้อมูลการจอง
- รองรับ: DOM-PDPA-01
- ตรวจด้วย: AC-BKG-06
- ไฟล์ที่แตะ: backend/app/audit/middleware.py, backend/app/db/models.py
- ต้องทำหลัง: T-01, T-04
- เสร็จเมื่อ: ทุก request ที่เข้าถึงข้อมูลการจองมี audit_log ที่ระบุ actor_id, accessed_at, hn และถูกเก็บอย่างน้อย 1 ปี
- สถานะ: พร้อมทำ

### T-09 สร้างหน้าเลือกแพ็กเกจและช่วงเวลาพื้นฐานแบบใช้ API จำลอง
- รองรับ: FR-BKG-01, FR-BKG-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-10
- ไฟล์ที่แตะ: frontend/src/pages/SlotPicker.jsx, frontend/src/api/client.js
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: ผู้ใช้เลือกแพ็กเกจแล้วเห็นช่วงเวลาและจำนวนที่นั่งคงเหลือจาก API จำลองได้ในหน้า UI โดยไม่ต้องรอ backend จริง
- สถานะ: พร้อมทำ

### T-10 สร้างหน้้ายืนยันและหน้าผลลัพธ์แบบใช้ API จำลอง
- รองรับ: FR-BKG-03, FR-BKG-04, FR-BKG-05
- ตรวจด้วย: AC-BKG-03, AC-BKG-04
- ไฟล์ที่แตะ: frontend/src/pages/ConfirmBooking.jsx, frontend/src/pages/BookingResult.jsx, frontend/src/__tests__/AC-BKG-03.test.jsx
- ต้องทำหลัง: T-09
- เสร็จเมื่อ: หน้ายืนยันแสดงข้อความ "ช่วงเวลาเต็ม" พร้อม 3 ตัวเลือก และหน้าแสดงผลแสดงหมายเลขคิวแม้ส่งข้อความยืนยันไม่สำเร็จ
- สถานะ: พร้อมทำ

### T-11 ต่อหน้าจอกับ API จริงและตรวจสอบ integration แบบปิด loop
- รองรับ: FR-BKG-01, FR-BKG-03, FR-BKG-04, IF-NOT-01
- ตรวจด้วย: AC-BKG-01, AC-BKG-03
- ไฟล์ที่แตะ: frontend/src/pages/SlotPicker.jsx, frontend/src/pages/ConfirmBooking.jsx, frontend/src/pages/BookingResult.jsx, frontend/src/api/client.js
- ต้องทำหลัง: T-03, T-05, T-06, T-09, T-10
- เสร็จเมื่อ: หน้าจอเรียก API จริงได้อย่างถูกต้องและแสดงสถานะคิว/ช่วงเวลาที่เต็มจากระบบจริง โดยไม่ใช้ mock อย่างเดียว
- สถานะ: พร้อมทำ

### T-12 กำหนดรูปแบบหมายเลขคิวและรีเซ็ตตามวันเมื่อได้คำตอบ Q-02
- รองรับ: FR-BKG-04, Q-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04
- ไฟล์ที่แตะ: backend/app/booking/service.py, backend/app/db/models.py
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: เมื่อเจ้าหน้าที่เวชระเบียนตอบ Q-02 แล้ว ระบบกำหนดรูปแบบหมายเลขคิวชัดเจนและแสดงตามวัน/ลำดับที่ถูกต้อง
- สถานะ: รอ Q-02

## ตารางตรวจความครบ AC
| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-BKG-01 | T-04 |
| AC-BKG-02 | T-05 |
| AC-BKG-03 | T-06, T-10, T-11 |
| AC-BKG-04 | T-07, T-10 |
| AC-BKG-05 | T-03 |
| AC-BKG-06 | T-08 |

## ตารางตรวจความครบ Constraint
| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-TECH-01 | T-01 |
| DOM-PDPA-01 | T-01, T-08 |
| IF-IDP-01 | T-02 |
| IF-HIS-01 | T-02 |
| IF-NOT-01 | T-07, T-11 |

## สิ่งที่ยังไม่ทำ
- Q-02 หมายเลขคิวรีเซ็ตรายวัน หรือนับต่อเนื่อง และมีรูปแบบอย่างไร (เช่น A001)? -> ถามเจ้าหน้าที่เวชระเบียน (ยังไม่ได้คำตอบ)
  - รอ task: T-12
