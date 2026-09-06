/**
 * API Client — เชื่อม backend จริง (siam-u-line-welcome-production.up.railway.app)
 * + ข้อมูลจำลอง (fallback) เมื่อ API ไม่ตอบสนอง (เช่น id-card 500)
 *
 * ผ่าน Vite dev proxy: /api/* → backend จริง (ดู vite.config.js)
 */

const BASE = ""; // ใช้ relative → dev proxy ส่งต่อไป backend
// เดโมเป็นค่าเริ่มต้นเพื่อให้สาธิตได้แม้ออฟไลน์ เปลี่ยนเป็น api เมื่อต้องการอ่าน backend จริง
export const DATA_MODE = import.meta.env.VITE_DATA_MODE || "demo";

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  let data;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, ok: res.ok, data };
}

/* ------------------------------------------------------------------ */
/*  Mock data (fallback เมื่อ API ล่ม)                                  */
/* ------------------------------------------------------------------ */
export const DEMO_STUDENT = {
  id: 8537,
  student_code: "6705100003",
  prefix_name: "นาย",
  student_name: "ธณภณ",
  student_surname: "ศิริกรรณิกา",
  prefix_name_eng: "Mr.",
  student_name_eng: "THANAPHON",
  student_surname_eng: "SIRIKANNIKA",
  faculty_name: "เทคโนโลยีสารสนเทศ",
  faculty_name_eng: "Information Technology",
  department_name_th: "เทคโนโลยีสารสนเทศ",
  cumulative_gpa: "2.65",
  current_phone_mobile: "098-305-1982",
  status: "verified",
  ref_lev_name: "ปริญญาตรี",
};

const DEMO_ID_CARD = {
  id: 8537,
  card_number: "CARD-6705100003",
  issue_date: "2025-09-01",
  expiry_date: "2034-08-18",
  status: "active",
};

const DEMO_SCORES = [
  { id: 1, student_code: "6705100003", game_type: "quiz", score: 85, created_at: "2026-08-01T10:00:00.000Z" },
  { id: 2, student_code: "6705100003", game_type: "trash-sorting", score: 92, created_at: "2026-08-02T14:30:00.000Z" },
  { id: 3, student_code: "6705100003", game_type: "trash-catch", score: 78, created_at: "2026-08-05T09:15:00.000Z" },
  { id: 4, student_code: "6705100003", game_type: "matching", score: 88, created_at: "2026-08-08T16:45:00.000Z" },
];

const DEMO_SCORE_KEY = "siamu_demo_game_scores_v1";
function readDemoScores() {
  try {
    const raw = localStorage.getItem(DEMO_SCORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEMO_SCORES;
}
function writeDemoScores(scores) {
  localStorage.setItem(DEMO_SCORE_KEY, JSON.stringify(scores));
}
export function saveDemoScore({ student_code, game_type, score, metadata = {} }) {
  const scores = readDemoScores();
  const entry = {
    id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    student_code: student_code || "6705100003",
    game_type,
    score: Math.max(0, Math.round(Number(score) || 0)),
    created_at: new Date().toISOString(),
    source: "demo",
    metadata,
  };
  writeDemoScores([...scores, entry]);
  return entry;
}
export function clearDemoScores() {
  localStorage.removeItem(DEMO_SCORE_KEY);
}

const DEMO_LEADERBOARD = [
  { rank: 1, full_name: "สร้อยทอง แวงไทย", total_score: 2450, total_plays: 42, student_code: "65012345" },
  { rank: 2, full_name: "ธณภณ ศิริกรรณิกา", total_score: 343, total_plays: 4, student_code: "6705100003" },
  { rank: 3, full_name: "สมชาย ใจดี", total_score: 300, total_plays: 5, student_code: "6705100042" },
  { rank: 4, full_name: "สุดา รักเรียน", total_score: 265, total_plays: 4, student_code: "6705100077" },
];

/* ------------------------------------------------------------------ */
/*  Student                                                           */
/* ------------------------------------------------------------------ */
export async function getStudent(code) {
  if (DATA_MODE === "demo") return DEMO_STUDENT;
  const r = await req(`/api/students/${code}/with-english`);
  if (r.ok && r.data) return r.data;
  return DEMO_STUDENT; // fallback
}

export async function getIdCard(code) {
  if (DATA_MODE === "demo") return DEMO_ID_CARD;
  const r = await req(`/api/students/${code}/id-card`);
  if (r.ok && r.data) return r.data;
  return DEMO_ID_CARD; // fallback (API จริง 500)
}

/* ------------------------------------------------------------------ */
/*  Game scores                                                       */
/* ------------------------------------------------------------------ */
export async function getScores(code) {
  if (DATA_MODE === "demo") return readDemoScores().filter((s) => s.student_code === (code || "6705100003"));
  const r = await req(`/api/game-scores/student/${code}`);
  if (r.ok && Array.isArray(r.data?.data)) return r.data.data;
  return DEMO_SCORES;
}

export async function getOverallStats(code) {
  if (DATA_MODE === "demo") {
    const scores = readDemoScores().filter((s) => s.student_code === (code || "6705100003"));
    const total = scores.reduce((a, s) => a + Number(s.score || 0), 0);
    const games = new Set(scores.map((s) => s.game_type)).size;
    return { total_plays: scores.length, total_score: total, games_played: games, avg_score: scores.length ? (total / scores.length).toFixed(1) : "0.0" };
  }
  const r = await req(`/api/game-scores/student/${code}/overall-stats`);
  if (r.ok && r.data?.data) {
    const d = r.data.data;
    if (d.total_plays > 0 || d.total_score) return d;
  }
  // fallback: คำนวณจาก mock
  const total = DEMO_SCORES.reduce((a, s) => a + s.score, 0);
  return { total_plays: DEMO_SCORES.length, total_score: total, games_played: DEMO_SCORES.length, avg_score: (total / DEMO_SCORES.length).toFixed(1) };
}

export async function getLeaderboard(gameType = "overall") {
  if (DATA_MODE === "demo") {
    const scores = readDemoScores();
    const filtered = gameType === "overall" ? scores : scores.filter((s) => s.game_type === gameType);
    const totals = new Map();
    filtered.forEach((s) => {
      const current = totals.get(s.student_code) || { student_code: s.student_code, total_score: 0, total_plays: 0, last_played: s.created_at };
      current.total_score += Number(s.score || 0);
      current.total_plays += 1;
      if (new Date(s.created_at) > new Date(current.last_played)) current.last_played = s.created_at;
      totals.set(s.student_code, current);
    });
    if (gameType === "overall") {
      DEMO_LEADERBOARD.forEach((row) => {
        if (!totals.has(row.student_code)) totals.set(row.student_code, { student_code: row.student_code, total_score: row.total_score, total_plays: row.total_plays, last_played: "2026-08-08T16:45:00.000Z" });
      });
    }
    const names = { "6705100003": "ธณภณ ศิริกรรณิกา", "65012345": "สร้อยทอง แวงไทย", "6705100042": "สมชาย ใจดี", "6705100077": "สุดา รักเรียน" };
    return [...totals.values()].sort((a, b) => b.total_score - a.total_score || a.student_code.localeCompare(b.student_code)).map((r, i) => ({ ...r, rank: i + 1, full_name: names[r.student_code] || "ผู้เล่นเดโม" }));
  }
  const r = await req(`/api/game-scores/leaderboard/${gameType}`);
  if (r.ok && Array.isArray(r.data?.data) && r.data.data.length) return r.data.data;
  return DEMO_LEADERBOARD;
}

export async function getRecentScores(code) {
  if (DATA_MODE === "demo") return readDemoScores().filter((s) => s.student_code === (code || "6705100003")).slice(-3).reverse();
  const r = await req(`/api/game-scores/student/${code}/recent`);
  if (r.ok && Array.isArray(r.data?.data)) return r.data.data;
  return DEMO_SCORES.slice(-3).reverse();
}

/* ------------------------------------------------------------------ */
/*  Universities (feature ใหม่ของเว็บ — เก็บใน localStorage)          */
/* ------------------------------------------------------------------ */
const UNI_KEY = "siamu_universities";
const DEFAULT_UNIS = [
  { id: "siam", name: "มหาวิทยาลัยสยาม", name_en: "Siam University", short: "SIAM", color: "#B74A50" },
  { id: "chula", name: "จุฬาลงกรณ์มหาวิทยาลัย", name_en: "Chulalongkorn University", short: "CU", color: "#2E75B6" },
  { id: "kmitl", name: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง", name_en: "KMITL", short: "KMITL", color: "#7030A0" },
  { id: "ku", name: "มหาวิทยาลัยเกษตรศาสตร์", name_en: "Kasetsart University", short: "KU", color: "#538135" },
  { id: "tu", name: "มหาวิทยาลัยธรรมศาสตร์", name_en: "Thammasat University", short: "TU", color: "#C55A11" },
];

export function getUniversities() {
  try {
    const raw = localStorage.getItem(UNI_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_UNIS;
}
export function saveUniversities(list) {
  localStorage.setItem(UNI_KEY, JSON.stringify(list));
}

/* ------------------------------------------------------------------ */
/*  Students เพิ่มโดย admin (localStorage — feature ใหม่)              */
/* ------------------------------------------------------------------ */
const ADM_STU_KEY = "siamu_admin_students";
export function getAdminStudents() {
  try {
    const raw = localStorage.getItem(ADM_STU_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}
export function addAdminStudent(s) {
  const list = getAdminStudents();
  list.push({ ...s, id: Date.now(), addedAt: new Date().toISOString() });
  localStorage.setItem(ADM_STU_KEY, JSON.stringify(list));
  return list;
}
export function removeAdminStudent(id) {
  const list = getAdminStudents().filter((s) => s.id !== id);
  localStorage.setItem(ADM_STU_KEY, JSON.stringify(list));
  return list;
}

/* ------------------------------------------------------------------ */
/*  Auth (demo LINE login — จำลอง)                                    */
/* ------------------------------------------------------------------ */
const AUTH_KEY = "siamu_auth";
export function loginAs(role, code) {
  const session = { role, code, name: code === "6705100003" ? "ธณภณ ศิริกรรณิกา" : "ผู้ใช้งาน", loginAt: Date.now() };
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}
export function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
