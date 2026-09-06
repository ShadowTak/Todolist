# Siam U Go backend

หลังบ้านเขียนด้วย Go และใช้ SQLite ผ่าน `database/sql` โดยแยกจาก frontend เดิมใน `../src`.

## Run

```bash
cd backend
go mod tidy
go run ./cmd/api
```

ค่าเริ่มต้นคือ `http://localhost:4000` และสร้างฐานข้อมูลที่ `backend/data/siam-u.db` อัตโนมัติจาก `db/migrations/001_initial.sql`.

```bash
go test ./...
```

## API หลัก

- `POST /api/auth/register` สมัครสมาชิก
- `POST /api/auth/login` เข้าสู่ระบบ
- `POST /api/auth/mock` mock OAuth สำหรับ development
- `POST /api/auth/forgot-password` ขอ reset password แบบไม่เปิดเผยว่าอีเมลมีอยู่หรือไม่
- `GET|POST /api/todos` ดูและสร้าง Todo ของผู้ใช้ที่ login แล้ว
- `GET|PUT|DELETE /api/todos/{id}` จัดการ Todo โดยตรวจ ownership ฝั่ง server
- `GET /api/me` ดูข้อมูลผู้ใช้ปัจจุบัน

ใช้ `Authorization: Bearer <token>` กับ route ที่ต้อง login และส่ง `q`/`status=completed|pending` เพื่อค้นหาและกรอง Todo.
