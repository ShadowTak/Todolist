import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSession, getStudent, getOverallStats, getRecentScores, DATA_MODE } from '../api'
import { Reveal, Counter } from '../components/Fx'
import Icon from '../components/Icon'
import './Dashboard.css'

export default function Dashboard() {
  const session = getSession()
  const [student, setStudent] = useState(null)
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const code = session?.code || '6705100003'
      const [stu, st, rec] = await Promise.all([
        getStudent(code),
        getOverallStats(code),
        getRecentScores(code),
      ])
      setStudent(stu)
      setStats(st)
      setRecent(rec)
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return <div className="loading"><div className="spinner" /><span>กำลังโหลดข้อมูล...</span></div>
  }

  const statsCards = [
    { label: 'คะแนนรวม', value: stats?.total_score ?? 0, icon: 'star', grad: 'linear-gradient(135deg,#e05666,#ff8fa3)' },
    { label: 'เล่นทั้งหมด', value: stats?.total_plays ?? 0, icon: 'gamepad', grad: 'linear-gradient(135deg,#38bdf8,#6366f1)' },
    { label: 'เกมที่เล่น', value: stats?.games_played ?? 0, icon: 'target', grad: 'linear-gradient(135deg,#34d399,#0ea5e9)' },
    { label: 'คะแนนเฉลี่ย', value: stats?.avg_score ?? '—', icon: 'trending', grad: 'linear-gradient(135deg,#f0b429,#ffd76a)', decimals: 1 },
  ]

  return (
    <div className="fade-in">
      <Reveal>
        <div className="page-head">
          <div>
            <h1 className="grad-text">สวัสดี, {student?.student_name} {student?.student_surname}</h1>
            <p className="muted">ยินดีต้อนรับสู่ SIAM U Connect — {session?.role === 'admin' ? 'โหมดผู้ดูแลระบบ' : 'โหมดนักศึกษา'} · {DATA_MODE === 'demo' ? 'ข้อมูลเดโมในเครื่อง' : 'ข้อมูลจาก API'}</p>
          </div>
          <span className={`badge ${student?.status === 'verified' ? 'badge-green' : 'badge-red'}`}>
            <Icon name={student?.status === 'verified' ? 'check' : 'lock'} size={13} strokeWidth={2} />
            {student?.status === 'verified' ? 'ยืนยันแล้ว' : student?.status}
          </span>
        </div>
      </Reveal>

      <div className="grid grid-4 stats-grid">
        {statsCards.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: s.grad }}>
                <Icon name={s.icon} size={22} strokeWidth={1.7} />
              </div>
              <div className="stat-value">
                {s.value === '—'
                  ? '—'
                  : <Counter value={s.value} decimals={s.decimals || 0} />}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: 22 }}>
        <Reveal delay={0.1}>
          <div className="card border-flow">
            <h3 className="card-title">
              <Icon name="user" size={18} strokeWidth={1.8} style={{ verticalAlign: '-3px', marginRight: 6 }} />
              ข้อมูลนักศึกษา
            </h3>
            <div className="info-rows">
              <Row k="รหัสนักศึกษา" v={student?.student_code} />
              <Row k="ชื่อ-นามสกุล" v={`${student?.prefix_name} ${student?.student_name} ${student?.student_surname}`} />
              <Row k="คณะ" v={student?.faculty_name} />
              <Row k="สาขา" v={student?.department_name_th} />
              <Row k="GPA" v={student?.cumulative_gpa} />
            </div>
            <Link to="/student-card" className="btn btn-ghost btn-block" style={{ marginTop: 18 }}>
              <Icon name="id" size={17} strokeWidth={1.8} /> ดูบัตรนักศึกษา →
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="card border-flow">
            <h3 className="card-title">
              <Icon name="gamepad" size={18} strokeWidth={1.8} style={{ verticalAlign: '-3px', marginRight: 6 }} />
              ผลลัพธ์ล่าสุด
            </h3>
            <div className="recent-list">
              {recent.length === 0 && <p className="muted">ยังไม่มีประวัติการเล่นเกม</p>}
              {recent.map((r) => (
                <div key={r.id} className="recent-item">
                  <span className="badge badge-blue">{gameLabel(r.game_type)}</span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 16 }}>{r.score}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString('th-TH')}</span>
                </div>
              ))}
            </div>
            <Link to="/my-score" className="btn btn-ghost btn-block" style={{ marginTop: 18 }}>
              <Icon name="chart" size={17} strokeWidth={1.8} /> ดูคะแนนทั้งหมด →
            </Link>
            <Link to="/games" className="btn btn-block" style={{ marginTop: 10 }}>
              <Icon name="gamepad" size={17} strokeWidth={1.8} /> เล่นเกมเพิ่มคะแนน →
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="info-row">
      <span className="muted">{k}</span>
      <strong>{v}</strong>
    </div>
  )
}

const GAME_LABELS = {
  quiz: 'Quiz รักษ์โลก',
  'trash-catch': 'Trash Catch',
  'trash-sorting': 'Trash Sorting',
  matching: 'Matching',
}
export function gameLabel(g) {
  return GAME_LABELS[g] || g
}
