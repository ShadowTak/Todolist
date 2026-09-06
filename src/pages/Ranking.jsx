import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getLeaderboard, getSession, DATA_MODE } from '../api'
import './Ranking.css'

const GAMES = [
  { key: 'overall', label: 'รวมทั้งหมด' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'trash-catch', label: 'Trash Catch' },
  { key: 'trash-sorting', label: 'Sorting' },
  { key: 'matching', label: 'Matching' },
]

const MEDAL_GRADS = [
  'linear-gradient(135deg, #ffd76a, #f0b429)',
  'linear-gradient(135deg, #e9e9f2, #b8b8c8)',
  'linear-gradient(135deg, #e0a06a, #c97b3a)',
]

export default function Ranking() {
  const session = getSession()
  const [game, setGame] = useState('overall')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getLeaderboard(game).then((data) => {
      setRows(data)
      setLoading(false)
    })
  }, [game])

  const maxScore = Math.max(1, ...rows.map((r) => r.total_score || 0))

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <h1 className="grad-text">อันดับผู้เล่น</h1>
          <p className="muted">ลีดเดอร์บอร์ด — {DATA_MODE === 'demo' ? 'ข้อมูลเดโมที่คำนวณในเครื่อง' : 'ข้อมูลจาก API จริง'}</p>
        </div>
      </div>

      <div className="switch-tabs" style={{ marginTop: 0, marginBottom: 22, display: 'inline-flex', flexWrap: 'wrap' }}>
        {GAMES.map((g) => (
          <motion.button
            key={g.key}
            className={game === g.key ? 'active' : ''}
            onClick={() => setGame(g.key)}
            whileTap={{ scale: .95 }}
          >{g.label}</motion.button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><span>กำลังโหลดอันดับ...</span></div>
      ) : (
        <div className="card rank-card" style={{ padding: 0, overflow: 'hidden' }}>
          {rows.map((r, i) => {
            const me = r.student_code === session?.code
            const pct = Math.min(100, ((r.total_score || 0) / maxScore) * 100)
            return (
              <motion.div
                key={r.student_code || i}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: .5, ease: [0.34, 1.56, 0.64, 1] }}
                className={`rank-row${me ? ' me' : ''}`}
              >
                <div
                  className={`rank-badge${r.rank <= 3 ? ` podium-${r.rank}` : ''}`}
                  style={r.rank <= 3 ? { background: MEDAL_GRADS[r.rank - 1] } : {}}
                >
                  {r.rank}
                </div>
                <div className="rank-main">
                  <div className="rank-name">
                    {r.full_name || `${r.student_name} ${r.student_surname}`}
                    {me && <span className="badge badge-red" style={{ marginLeft: 10 }}>คุณ</span>}
                  </div>
                  <div className="rank-bar-track">
                    <div className="rank-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="rank-sub">
                    เล่น {r.total_plays} ครั้ง · {r.last_played ? new Date(r.last_played).toLocaleDateString('th-TH') : '—'}
                  </div>
                </div>
                <div className="rank-score">
                  <span className="rank-score-num">{r.total_score}</span>
                  <span className="rank-score-unit">คะแนน</span>
                </div>
              </motion.div>
            )
          })}
          {rows.length === 0 && <div className="loading"><span>ยังไม่มีข้อมูลอันดับ</span></div>}
        </div>
      )}
    </div>
  )
}
