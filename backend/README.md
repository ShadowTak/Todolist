# Siam U backend — student1

โค้ดส่วนนี้แยกจาก frontend เดิมใน `../src` และเป็นจุดเริ่มต้นของ API กลางสำหรับคนที่ 1

## Run

```bash
cd backend
cp .env.example .env
npm test
npm start
```

ค่าเริ่มต้นคือ `http://localhost:4000` และใช้ mock OAuth ได้เมื่อ `MOCK_OAUTH=true`.
ข้อมูล runtime ตอนนี้เก็บใน repository แบบ in-memory เพื่อให้ทีมเริ่มเชื่อม API ได้ทันที; schema จริงอยู่ที่ `db/migrations/001_initial.sql` และสามารถเปลี่ยน repository เป็น SQLite/PostgreSQL ได้โดยไม่เปลี่ยน route contract.

## Demo flow

```bash
curl -X POST http://localhost:4000/api/auth/mock \
  -H 'content-type: application/json' \
  -d '{"email":"student@example.test","name":"Demo Student","role":"student"}'
```

นำ `token` ที่ได้ไปใช้เป็น `Authorization: Bearer <token>`.
