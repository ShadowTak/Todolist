import { useEffect, useState } from 'react'
import { getSession, getScores, getOverallStats, DATA_MODE } from '../api'
import { gameLabel } from './Dashboard'
import { Reveal, Counter } from '../components/Fx'
import Icon from '../components/Icon'
import './MyScore.css'

const GAME_GRADS = {
  quiz: 'linear-gradient(135deg, #34d399, #0ea5e9)',
  'trash-catch': 'linear-gradient(135deg, #38bdf8, #6366f1)',
  'trash-sorting': 'linear-gradient(135deg, #e05666, #8b5cf6)',
  matching: 'linear-gradient(135deg, #f0b429, #ffd76a)',
}

export default function MyScore() {
  const session = getSession()
  const [scores, setScores] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const code = session?.code || '6705100003'
      const [sc, st] = await Promise.all([getScores(code), getOverallStats(code)])
      setScores(sc)
      setStats(st)
      setLoading(false)
    })()
  }, [])

  // จัดกลุ่มตามเกม
  const byGame = {}
  scores.forEach((s) => {
    if (!byGame[s.game_type]) byGame[s.game_type] = []
    byGame[s.game_type].push(s)
  })

  const best = {}
  scores.forEach((s) => {
    if (!best[s.game_type] || s.score > best[s.game_type]) best[s.game_type] = s.score
  })

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <h1 className="grad-text">คะแนนของฉัน</h1>
          <p className="muted">ประวัติการเล่นเกมทั้งหมด — {DATA_MODE === 'demo' ? 'ข้อมูลเดโมที่เก็บในเครื่อง' : 'ข้อมูลจาก API จริง'}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><span>กำลังโหลดคะแนน...</span></div>
      ) : (
        <>
          <Reveal>
            <div className="card" style={{ marginBottom: 22 }}>
              <h3 className="card-title">สรุปภาพรวม</h3>
              <div className="grid grid-4" style={{ marginTop: 12 }}>
                <div className="mini-stat"><div className="mini-value"><Counter value={stats?.total_score ?? 0} /></div><div className="mini-label">คะแนนรวม</div></div>
                <div className="mini-stat"><div className="mini-value"><Counter value={stats?.total_plays ?? 0} /></div><div className="mini-label">เล่นทั้งหมด</div></div>
                <div className="mini-stat"><div className="mini-value">{stats?.games_played ?? Object.keys(byGame).length}</div><div className="mini-label">เกมที่เล่น</div></div>
                <div className="mini-stat"><div className="mini-value">{stats?.avg_score ?? '—'}</div><div className="mini-label">คะแนนเฉลี่ย</div></div>
              </div>
            </div>
          </Reveal>

          {Object.entries(byGame).map(([game, list], gi) => (
            <Reveal key={game} delay={gi * 0.08}>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 className="card-title" style={{ marginBottom: 0 }}>{gameLabel(game)}</h3>
                  <span className="badge badge-gold">
                    <Icon name="medal" size={13} strokeWidth={2} /> สูงสุด {best[game]}
                  </span>
                </div>
                <div className="score-chart">
                  {[...list].reverse().map((s, si) => (
                    <div key={s.id} className="score-bar-row">
                      <span className="muted" style={{ fontSize: 12, width: 92, flexShrink: 0 }}>{new Date(s.created_at).toLocaleDateString('th-TH')}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${Math.min(100, s.score)}%`,
                            background: GAME_GRADS[game] || 'var(--brand-grad)',
                            transitionDelay: `${si * 70}ms`,
                          }}
                        />
                      </div>
                      <strong className="mono" style={{ width: 36, textAlign: 'right', color: '#fff' }}>{s.score}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}

          {scores.length === 0 && (
            <div className="card"><p className="muted">ยังไม่มีประวัติการเล่นเกม — ลองเล่นเกมก่อนได้เลย</p></div>
          )}
        </>
      )}
    </div>
  )
}
