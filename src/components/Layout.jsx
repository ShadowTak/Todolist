import { motion } from 'framer-motion'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getSession, logout } from '../api'
import { Aurora } from './Fx'
import Icon from './Icon'
import './Layout.css'

const NAV = [
  { to: '/', label: 'ภาพรวม', icon: 'home', end: true },
  { to: '/student-card', label: 'บัตรนักศึกษา', icon: 'id', end: false },
  { to: '/ranking', label: 'อันดับ', icon: 'trophy', end: false },
  { to: '/my-score', label: 'คะแนนของฉัน', icon: 'chart', end: false },
  { to: '/games', label: 'เล่นเกม', icon: 'gamepad', end: false },
  { to: '/admin', label: 'ผู้ดูแลระบบ', icon: 'cog', end: false },
]

export default function Layout() {
  const navigate = useNavigate()
  const session = getSession()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <Aurora />
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <Icon name="grad" size={22} strokeWidth={1.7} />
          </div>
          <div>
            <div className="brand-name">SIAM U Connect</div>
            <div className="brand-sub">Student Portal</div>
          </div>
        </div>

        <nav className="nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      className="nav-pill"
                      layoutId="nav-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="nav-icon">
                    <Icon name={item.icon} size={19} strokeWidth={1.7} />
                  </span>
                  <span className="nav-label">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="user-avatar">{session?.name?.charAt(0) || 'U'}</div>
            <div className="user-info">
              <div className="user-name">{session?.name}</div>
              <div className="user-role">
                <Icon name={session?.role === 'admin' ? 'shield' : 'grad'} size={12} strokeWidth={2} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                {session?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักศึกษา'}
              </div>
            </div>
            <div className="user-online" title="ออนไลน์" />
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <Icon name="logout" size={16} strokeWidth={1.8} style={{ verticalAlign: '-3px', marginRight: 6 }} />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
