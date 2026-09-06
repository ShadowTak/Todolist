import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getSession, getStudent, getIdCard, getOverallStats, DATA_MODE } from '../api'
import { Reveal, Counter } from '../components/Fx'
import Icon from '../components/Icon'
import './StudentCard.css'

export default function StudentCard() {
  const session = getSession()
  const [student, setStudent] = useState(null)
  const [idCard, setIdCard] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('card') // card | barcode

  useEffect(() => {
    (async () => {
      const code = session?.code || '6705100003'
      const [stu, card, st] = await Promise.all([
        getStudent(code),
        getIdCard(code),
        getOverallStats(code),
      ])
      setStudent(stu)
      setIdCard(card)
      setStats(st)
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return <div className="loading"><div className="spinner" /><span>กำลังโหลดบัตรนักศึกษา...</span></div>
  }

  const fullName = `${student?.prefix_name || ''} ${student?.student_name || ''} ${student?.student_surname || ''}`.trim()
  const fullNameEn = `${student?.student_name_eng || ''} ${student?.student_surname_eng || ''}`.trim()

  return (
    <div className="fade-in card-page">
      <h1 className="grad-text" style={{ marginBottom: 4 }}>บัตรนักศึกษา</h1>
      <p className="muted" style={{ marginBottom: 24 }}>บัตรประจำตัวนักศึกษา — {DATA_MODE === 'demo' ? 'ข้อมูลเดโมในเครื่อง' : 'ข้อมูลจาก API จริง'}</p>

      <motion.div
        className="id-card-tilt"
        initial={{ opacity: 0, y: 40, rotateY: -8 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: .8, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="id-card border-flow">
          <div className="id-card-head">
            <div>
              <div className="uni">มหาวิทยาลัยสยาม</div>
              <div className="uni-sub">SIAM UNIVERSITY</div>
            </div>
            <div className="logo">
              <Icon name="grad" size={22} strokeWidth={1.6} />
            </div>
          </div>

          <div className="id-card-body">
            <div className="id-card-photo">
              <Icon name="user" size={34} strokeWidth={1.4} />
            </div>
            <span className="card-status">
              <span className="status-dot" /> ยืนยันแล้ว
            </span>

            <div className="id-code mono">{student?.student_code}</div>
            <div className="id-name">{fullName}</div>
            <div className="id-name-en">{fullNameEn}</div>

            <div className="id-meta">
              <div className="id-meta-row"><span>คณะ</span><strong>{student?.faculty_name}</strong></div>
              <div className="id-meta-row"><span>สาขา</span><strong>{student?.department_name_th}</strong></div>
              <div className="id-meta-row"><span>ระดับ</span><strong>{student?.ref_lev_name}</strong></div>
              <div className="id-meta-row"><span>GPA</span><strong>{student?.cumulative_gpa}</strong></div>
              <div className="id-meta-row"><span>บัตรหมดอายุ</span><strong>{idCard?.expiry_date ? new Date(idCard.expiry_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</strong></div>
            </div>

            <div className="id-card-foot">
              <div className="qr-box">
                <Icon name="qr" size={26} strokeWidth={1.4} />
              </div>
              {view === 'card'
                ? <div className="barcode">{student?.student_code}</div>
                : <div className="mono" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '.2em' }}>{student?.student_code}</div>}
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'right' }}>
                {view === 'card' ? 'QR Code' : 'Barcode'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="switch-tabs">
        <motion.button
          className={view === 'card' ? 'active' : ''}
          onClick={() => setView('card')}
          whileTap={{ scale: .94 }}
        >
          <Icon name="qr" size={16} strokeWidth={1.8} style={{ verticalAlign: '-3px', marginRight: 5 }} /> QR Code
        </motion.button>
        <motion.button
          className={view === 'barcode' ? 'active' : ''}
          onClick={() => setView('barcode')}
          whileTap={{ scale: .94 }}
        >
          Barcode
        </motion.button>
      </div>

      <div className="card-actions">
        <a className="btn btn-sm" href="javascript:void(0)" onClick={() => window.print()}>
          <Icon name="printer" size={16} strokeWidth={1.8} /> พิมพ์บัตร
        </a>
        <button className="btn btn-ghost btn-sm">
          <Icon name="lock" size={15} strokeWidth={1.8} /> แสดง QR (สแกนที่มหาวิทยาลัย)
        </button>
      </div>

      <Reveal delay={0.15}>
        <div className="card" style={{ marginTop: 28, width: '100%', maxWidth: 560 }}>
          <h3 className="card-title">สถิติการเล่นเกม</h3>
          <div className="grid grid-3" style={{ marginTop: 14 }}>
            <MiniStat label="คะแนนรวม" value={<Counter value={stats?.total_score ?? 0} />} />
            <MiniStat label="จำนวนครั้ง" value={<Counter value={stats?.total_plays ?? 0} />} />
            <MiniStat label="คะแนนเฉลี่ย" value={stats?.avg_score ?? '—'} />
          </div>
        </div>
      </Reveal>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 0', background: 'rgba(255,255,255,.04)', borderRadius: 14 }}>
      <div className="mini-stat-value">{value}</div>
      <div className="mini-stat-label">{label}</div>
    </div>
  )
}
