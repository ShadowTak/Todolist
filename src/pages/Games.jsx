import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GAME_DEFINITIONS } from '../games'
import { Reveal } from '../components/Fx'
import Icon from '../components/Icon'
import './Games.css'

export default function Games() {
  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <h1 className="grad-text">ห้องเกมรักษ์โลก</h1>
          <p className="muted">เลือกเกมสั้น ๆ แล้วสะสมคะแนนของคุณในโหมดเดโม</p>
        </div>
        <span className="badge badge-blue"><Icon name="gamepad" size={14} /> โหมดเดโม</span>
      </div>
      <div className="game-grid">
        {GAME_DEFINITIONS.map((game, index) => (
          <Reveal key={game.key} delay={index * 0.08}>
            <motion.div className="game-card" whileHover={{ y: -6 }}>
              <div className="game-card-icon" style={{ background: game.color }}><Icon name={game.icon} size={26} /></div>
              <div className="game-card-content">
                <div className="game-card-kicker">เกมที่ {index + 1} · {game.key === 'matching' ? '6 คู่' : '10 รอบ'}</div>
                <h2>{game.title}</h2>
                <p>{game.description}</p>
                <div className="game-card-foot">
                  <span className="muted">คะแนนสูงสุด {game.key === 'matching' ? 100 : 100}</span>
                  <Link className="btn btn-sm" to={`/games/${game.key}`}>เล่นเกม <span aria-hidden="true">→</span></Link>
                </div>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.25}>
        <div className="card games-note">
          <Icon name="shield" size={20} />
          <div><strong>คะแนนของคุณเก็บไว้ในเครื่องนี้</strong><p className="muted">เป็นข้อมูลเดโมแยกจากคะแนน API จริง และดูได้ที่หน้า “คะแนนของฉัน”</p></div>
        </div>
      </Reveal>
    </div>
  )
}
