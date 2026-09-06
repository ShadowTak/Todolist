# SIAM U Connect — แผนแบ่งงานเริ่มโปรเจคใหม่

เอกสารนี้ถือว่าโปรเจคเริ่มจากศูนย์ ยังไม่มีโค้ด ฐานข้อมูล หรือระบบ deploy แบ่งงานสำหรับทีม **4 คน** ให้ทำงานขนานกันได้ โดยใช้โมดูลและสัญญา API เดียวกันตั้งแต่ต้น

## เป้าหมายรุ่นแรก

- นักศึกษาเข้าสู่ระบบและดูข้อมูลส่วนตัว บัตรนักศึกษา คะแนน และอันดับได้
- ผู้ดูแลจัดการนักศึกษา/มหาวิทยาลัยและดูสถานะความปลอดภัยได้
- นักศึกษาเล่นเกมเดโม 3 เกม: Quiz, แยกขยะ, จับคู่
- คะแนนเกมถูกตรวจสอบและบันทึกอย่างปลอดภัย
- ระบบมี staging, test, logging และเอกสารสำหรับส่งมอบ

## การแบ่งเจ้าของงาน

### คนที่ 1 — Backend และข้อมูลกลาง

รับผิดชอบ API, ฐานข้อมูล, authentication และสัญญาข้อมูลที่ทุกหน้าต้องใช้

- [ ] สร้างโครงสร้าง backend, environment config และ database migration
- [ ] ออกแบบตาราง `users`, `students`, `universities`, `game_scores`, `security_events`
- [ ] ทำ LINE OAuth หรือ mock provider ให้สลับโหมดได้ และออก JWT/session ที่หมดอายุได้
- [ ] ทำ middleware `authenticate`, `requireRole` และ ownership กัน IDOR
- [ ] ทำ API นักศึกษา บัตร คะแนน สถิติ leaderboard และ CRUD ของ admin
- [ ] ทำ API บันทึกคะแนนโดยตรวจ `game_type`, ช่วงคะแนน, ผู้เล่น และ idempotency key ฝั่ง server
- [ ] ตั้งค่า CORS allowlist, security headers, generic error handler และ rate limit
- [ ] ทำ seed data สำหรับ staging โดยไม่ใช้ข้อมูลส่วนบุคคลจริง
- [ ] เขียน OpenAPI และ integration tests ของ endpoint สำคัญ
- [ ] ส่งมอบ: API base URL, `.env.example`, migration/seed command, OpenAPI, test report

**ทำก่อน/ต้องรอ:** สรุป schema และ wire shape ร่วมกับคนที่ 2 และ 3 ก่อนเริ่มทำหน้าเชื่อม API

### คนที่ 2 — Frontend, UX และระบบนำทาง

รับผิดชอบโครงเว็บทั้งหมด การใช้งานบน desktop/mobile และการเชื่อม API ในฐานะผู้ใช้

- [ ] ตั้ง React/Vite, routing, design tokens, layout, responsive breakpoints และ accessibility baseline
- [ ] ทำหน้า login, dashboard, student card, my score และ ranking
- [ ] ทำ route guard, session refresh/expiry, loading/error/empty state และ logout
- [ ] ทำ data client กลางพร้อม timeout, retry ที่เหมาะสม และป้ายแหล่งข้อมูล demo/API
- [ ] ทำ admin shell, tab navigation และฟอร์มมหาวิทยาลัย/นักศึกษา
- [ ] เชื่อม API ตามสัญญาที่คนที่ 1 ส่งมอบ โดยไม่ฝัง secret ใน client
- [ ] เพิ่ม keyboard navigation, focus state, reduced motion และตรวจมือถือ
- [ ] เขียน component tests และ browser smoke flow: login → dashboard → logout
- [ ] ส่งมอบ: frontend build, route map, component catalog, screenshots desktop/mobile

**ทำก่อน/ต้องรอ:** ใช้ mock data ชั่วคราวได้ แต่ต้องเปลี่ยนเป็น API contract เดียวก่อน merge เข้า staging

### คนที่ 3 — เกมและระบบคะแนน

รับผิดชอบ game design, state machine ของการเล่น และการเชื่อมคะแนนกับระบบกลาง

- [ ] เขียนกติกาและ acceptance criteria ของเกม 3 เกมให้คะแนนเต็ม 100 ชัดเจน
- [ ] ทำ `game catalog` กลาง: key, ชื่อ, คำอธิบาย, version, scoring rules และ content
- [ ] ทำเกม Quiz 10 ข้อ พร้อมเฉลยและผลลัพธ์
- [ ] ทำเกมแยกขยะ 10 ชิ้น พร้อม feedback คำตอบ
- [ ] ทำเกมจับคู่ 6 คู่ พร้อม timer/จำนวนครั้งที่ผิดตามกติกาที่ตกลง
- [ ] กันการกดซ้ำ, refresh กลางเกม, submit ซ้ำ และเกมที่หมดเวลา
- [ ] ส่งผลลัพธ์ผ่าน API บันทึกคะแนน ไม่เชื่อคะแนนจาก client โดยตรง
- [ ] เพิ่มสถิติรายเกม, คะแนนสูงสุด, เล่นซ้ำ และลิงก์ไป My Score/Ranking
- [ ] เขียน unit tests scoring ทุกเกม และ browser tests เล่นจบอย่างน้อยหนึ่งรอบต่อเกม
- [ ] ส่งมอบ: game rules, content JSON, scoring tests, gameplay screenshots และรายการ edge cases

**ทำก่อน/ต้องรอ:** ตกลง payload บันทึกคะแนนและ idempotency กับคนที่ 1; ใช้ component shell ของคนที่ 2

### คนที่ 4 — Security, Firewall view, QA และการส่งขึ้นระบบ

รับผิดชอบ threat model, security status สำหรับ admin, quality gate และ release process

- [ ] ทำ threat model: auth/role, IDOR, CORS, rate limit, XSS, SQL injection, data leakage และ abuse ของการส่งคะแนน
- [ ] ทำหน้า Firewall/Security Center แยกจาก enforcement จริง และติดป้าย “demo only” ชัดเจน
- [ ] ทำสถานการณ์จำลอง 401, 403, 429, WAF payload, CORS และ generic error โดยไม่ยิง payload ออก network
- [ ] ทำ audit log schema/หน้าดูเหตุการณ์และ filter blocked/allowed ตามข้อมูลจริงจากระบบ
- [ ] ตรวจ secret, dependency, headers, cookie flags, logging และ PII ก่อน release
- [ ] ตั้ง CI: lint, unit test, integration test, build และ dependency audit
- [ ] ทำ staging deployment, health check, error monitoring, backup/rollback และ release checklist
- [ ] ทดสอบ E2E ข้ามบทบาท: student, admin, unauthenticated และข้อมูลผิดรูปแบบ
- [ ] เขียน security runbook, incident contact, known limitations และ test evidence
- [ ] ส่งมอบ: threat model, QA matrix, CI result, staging URL, rollback steps และ security report

**ทำก่อน/ต้องรอ:** ต้องได้ endpoint จริงจากคนที่ 1 และเส้นทางหน้าเว็บ/เกมจากคนที่ 2/3 เพื่อทดสอบ end-to-end

## งานร่วมที่ต้องล็อกในการประชุมครั้งแรก

- [ ] เลือก stack, package manager, branch strategy และ code review rule
- [ ] ตกลงชื่อ route: `/login`, `/`, `/student-card`, `/my-score`, `/ranking`, `/games`, `/admin`
- [ ] ตกลง role อย่างน้อย `student` และ `admin`; ระบุสิทธิ์ของทุก endpoint
- [ ] ตกลง API envelope, error codes, pagination, timezone และวันที่แสดงผล
- [ ] ตกลง scoring contract: `student_code`, `game_type`, `score`, `game_version`, `idempotency_key`
- [ ] ตกลงว่า Firewall เป็นหน้าสถานะ/เดโม จนกว่าจะมี gateway หรือ WAF จริง
- [ ] สร้าง issue board ใส่ owner, dependency, estimate และ acceptance criteria ทุกงาน

## ลำดับงานและจุดส่งมอบ

### Sprint 0 — วัน 1–2: วางฐาน

- คนที่ 1: schema draft, auth contract, API skeleton
- คนที่ 2: app shell, routes, design tokens, mock client
- คนที่ 3: game rules, content format, scoring examples
- คนที่ 4: threat model, CI skeleton, test matrix

- [ ] Gate: ทุกคนรันโปรเจคและ test command เดียวกันได้

### Sprint 1 — วัน 3–7: เดโมแนวตั้ง

- [ ] login → dashboard ใช้งานได้ด้วยข้อมูล seed
- [ ] เกมหนึ่งเกมเล่นจบและบันทึกคะแนนผ่าน API ได้
- [ ] admin เปิดดูสถานะ Firewall เดโมได้
- [ ] CI ผ่าน lint/test/build และ staging deploy สำเร็จ

### Sprint 2 — วัน 8–14: ฟีเจอร์ครบ

- [ ] เกมครบ 3 เกมและสถิติเชื่อม My Score/Ranking
- [ ] CRUD admin ครบพร้อม validation และ audit trail
- [ ] security middleware และ abuse tests ครบตาม threat model
- [ ] responsive/accessibility pass และแก้ defect ระดับ blocker/critical

### Sprint 3 — วัน 15–18: hardening และส่งมอบ

- [ ] E2E ทุก role ผ่านบน staging
- [ ] dependency/security scan ไม่มี high/critical ที่ยังไม่รับความเสี่ยง
- [ ] backup/rollback/monitoring ถูกทดสอบจริง
- [ ] README, API docs, runbook, screenshots และ architecture/process diagrams ครบ
- [ ] Demo rehearsal ตามเส้นทาง login → play → score → admin firewall

## Definition of Done

งานหนึ่งรายการเสร็จเมื่อโค้ดอยู่ใน branch ที่ review แล้ว, มี test ที่เหมาะสม, ไม่มี secret/PII ใน repo, lint และ build ผ่าน, มี acceptance evidence, อัปเดตเอกสารที่เกี่ยวข้อง และทดสอบบน staging เมื่อเป็นงานที่แตะหลายโมดูล

## ความเสี่ยงที่ต้องติดตาม

- การใช้ข้อมูลนักศึกษาจริงในเดโม — ใช้ seed ปลอมและกำหนด data retention ให้ชัด
- การคำนวณคะแนนฝั่ง client — ให้ server ตรวจชนิดเกม เวอร์ชัน กติกา และความถี่การส่ง
- Firewall เดโมถูกเข้าใจว่าเป็นการป้องกันจริง — ใช้ป้ายสถานะและเอกสารจำกัดขอบเขตทุกจุด
- API ภายนอกล่มหรือ schema เปลี่ยน — มี contract test, timeout, fallback และ alert
- งานคนที่ 1 เป็นคอขวด — ให้คนที่ 2/3 ใช้ mock contract และกำหนดวัน freeze schema ตั้งแต่ Sprint 0
