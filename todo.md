# Todo List — User Stories & Acceptance Criteria

## Student 1 — Main Todo List

### User Story

ในฐานะผู้ใช้ ฉันต้องการเพิ่ม แก้ไข ลบ และดูรายการ Todo เพื่อจัดการงานของตัวเองได้

### Acceptance Criteria

- [ ] ผู้ใช้สามารถเพิ่ม Todo พร้อมชื่อรายการได้
- [ ] ระบบไม่อนุญาตให้บันทึก Todo ที่ไม่มีชื่อ
- [ ] Todo ใหม่แสดงในรายการทันทีหลังเพิ่มสำเร็จ
- [ ] ผู้ใช้สามารถแก้ไขชื่อ Todo ได้
- [ ] ผู้ใช้สามารถลบ Todo ได้
- [ ] ระบบแสดงรายการ Todo ทั้งหมดที่ผู้ใช้สร้างไว้
- [ ] เมื่อไม่มี Todo ระบบแสดง empty state ที่เข้าใจได้

## Student 2 — ระบบ Login

### User Story

ในฐานะผู้ใช้ ฉันต้องการสมัครสมาชิก เข้าสู่ระบบ และกู้คืนรหัสผ่าน เพื่อใช้งาน Todo ของตัวเองได้อย่างปลอดภัย

### Acceptance Criteria

- [ ] ผู้ใช้สามารถสมัครสมาชิกด้วยข้อมูลที่จำเป็นได้
- [ ] ระบบตรวจสอบอีเมลซ้ำและข้อมูลที่ไม่ถูกต้อง
- [ ] ผู้ใช้สามารถ Login ด้วยบัญชีที่สมัครไว้ได้
- [ ] Login สำเร็จแล้วผู้ใช้ถูกพาไปยังหน้า Todo List
- [ ] Login ด้วยข้อมูลผิดจะแสดงข้อความแจ้งเตือน
- [ ] ผู้ใช้สามารถกด Forget Password ได้
- [ ] ระบบแจ้งขั้นตอนสำหรับเปลี่ยนรหัสผ่าน
- [ ] ผู้ใช้ที่ยังไม่ Login ไม่สามารถเข้าถึง Todo ของบัญชีอื่นได้

## Student 3 — ระบบเปลี่ยนสี Todo List

### User Story

ในฐานะผู้ใช้ ฉันต้องการเปลี่ยนสีและ Font ของ Todo List เพื่อปรับหน้าจอให้เหมาะกับความชอบของตัวเอง

### Acceptance Criteria

- [ ] มีปุ่มควบคุมการเปลี่ยนสีอยู่ด้านขวามือ
- [ ] เมื่อกดปุ่ม สีของ Todo List เปลี่ยนทันที
- [ ] มีปุ่มควบคุมการเปลี่ยน Font อยู่ด้านขวามือ
- [ ] เมื่อกดปุ่ม Font ของ Todo List เปลี่ยนทันที
- [ ] แสดงข้อความ Hello World เพื่อยืนยันว่าปุ่มทำงาน
- [ ] ปุ่มมีสถานะที่มองเห็นได้และกดใช้งานได้ง่าย
- [ ] การเปลี่ยนสีและ Font ไม่ทำให้ข้อมูล Todo หาย

## Student 4 — ระบบค้นหาและจัดการ Todo List

### User Story

ในฐานะผู้ใช้ ฉันต้องการค้นหา กรอง และจัดเรียง Todo เพื่อหารายการที่ต้องการได้รวดเร็วขึ้น

### Acceptance Criteria

- [ ] ผู้ใช้สามารถค้นหา Todo ด้วยชื่อรายการได้
- [ ] ระบบแสดงเฉพาะ Todo ที่ตรงกับคำค้นหา
- [ ] ผู้ใช้สามารถกรอง Todo ตามสถานะได้
- [ ] ผู้ใช้สามารถจัดเรียง Todo ตามวันที่หรือความสำคัญได้
- [ ] ผู้ใช้สามารถล้างคำค้นหาและตัวกรองได้
- [ ] ระบบแสดงจำนวนรายการที่ค้นพบ
- [ ] เมื่อไม่พบรายการ ระบบแสดงข้อความที่เข้าใจได้

---

# Developer Checklist — student1 backend

- [ ] สร้างโครงสร้าง backend และ environment config
- [ ] สร้าง database migration
- [ ] ออกแบบตาราง users, students, universities, game_scores และ security_events
- [ ] ทำ LINE OAuth หรือ mock OAuth provider
- [ ] ทำ JWT/session ที่หมดอายุได้
- [ ] ทำ middleware authenticate และ requireRole
- [ ] ป้องกัน ownership และ IDOR
- [ ] ทำ API นักศึกษา บัตร คะแนน สถิติ และ leaderboard
- [ ] ทำ CRUD สำหรับ admin
- [ ] ตรวจสอบ game_type และช่วงคะแนนฝั่ง server
- [ ] รองรับ idempotency key สำหรับการบันทึกคะแนน
- [ ] ตั้งค่า CORS allowlist และ security headers
- [ ] ทำ generic error handler และ rate limit
- [ ] ทำ seed data สำหรับ staging โดยไม่ใช้ข้อมูลจริง
- [ ] เขียน OpenAPI
- [ ] เขียน integration tests
- [ ] ส่งมอบ API base URL
- [ ] ส่งมอบ .env.example
- [ ] ส่งมอบ migration และ seed command
- [ ] ส่งมอบ test report
