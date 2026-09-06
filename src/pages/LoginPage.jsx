import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GradientWaves from '../components/GradientWaves'
import Icon from '../components/Icon'
import { loginAs, getStudent } from '../api'
import './LoginPage.css'

const SHAPES = ['ring', 'dot', 'diamond', 'cross', 'ring', 'dot', 'cross', 'diamond', 'ring', 'cross', 'dot', 'diamond']

export default function LoginPage() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [code, setCode] = useState('6705100003')

  const doLogin = async (role, studentCode) => {
    setBusy(true)
    setErr('')
    try {
      const c = studentCode || code.trim()
      loginAs(role, c || '6705100003')
      if (role === 'student') {
        try { await getStudent(c || '6705100003') } catch {}
      }
      navigate(role === 'admin' ? '/admin' : '/')
    } catch (e) {
      setErr('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-waves">
        <GradientWaves
          horizonColor="#1b0a3f"
          waveColor="#e05666"
          crestColor="#ffd6e0"
          speed={0.4}
          amplitude={2.6}
          swell={32}
          turbulence={22}
          height={4.6}
          fogDepth={16}
          detail="medium"
        />
      </div>

      <div className="login-floaters">
        {SHAPES.map((s, i) => (
          <span
            key={i}
            className={`login-floater s-${s}`}
            style={{
              left: `${(i * 137 + 20) % 100}%`,
              top: `${(i * 53 + 10) % 90}%`,
              '--s': `${18 + ((i * 17) % 26)}px`,
              animationDuration: `${8 + ((i * 3) % 8)}s`,
              animationDelay: `${(i * 1.1) % 6}s`,
            }}
          />
        ))}
      </div>

      <div className="login-overlay" />

      <div className="login-content">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 40, scale: .94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: .7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="login-logo">
            <span className="login-logo-emoji">
              <Icon name="grad" size={34} strokeWidth={1.5} />
            </span>
          </div>
          <h1 className="grad-text">SIAM U Connect</h1>
          <p className="login-sub">ระบบจัดการข้อมูลนักศึกษา<br />เข้าสู่ระบบด้วย LINE (โหมดสาธิต)</p>

          {err && <div className="login-err">{err}</div>}

          <div className="login-actions">
            <motion.button
              className="btn line-btn"
              disabled={busy}
              onClick={() => doLogin('student')}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: .97 }}
            >
              <LineIcon /> เข้าสู่ระบบด้วย LINE — นักศึกษา
            </motion.button>
            <motion.button
              className="btn btn-green"
              disabled={busy}
              onClick={() => doLogin('admin')}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: .97 }}
            >
              <Icon name="cog" size={18} strokeWidth={1.8} /> เข้าสู่ระบบ — ผู้ดูแลระบบ
            </motion.button>
          </div>

          <div className="login-demo">
            <label className="field" style={{ marginBottom: 0 }}>
              <span>รหัสนักศึกษา (ทดสอบข้อมูลจริงจาก API)</span>
              <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="เช่น 6705100003" />
            </label>
          </div>

          <p className="login-note">* โหมดสาธิต — กดปุ่ม LINE เพื่อจำลองการล็อคอินผ่าน LINE OAuth</p>
        </motion.div>
      </div>
    </div>
  )
}

function LineIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">
      <path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.67 1.34 5.06 3.48 6.65-.13.48-.48 1.74-.55 2.02-.09.37-.32.47.11.66l2.13.9c.4.18.66.04.76-.4.07-.31.42-1.67.55-2.18.66.18 1.36.28 2.07.28 5.52 0 10-3.94 10-8.8S17.52 2 12 2z"/>
    </svg>
  )
}
