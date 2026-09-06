import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import StudentCard from './pages/StudentCard'
import Ranking from './pages/Ranking'
import MyScore from './pages/MyScore'
import Admin from './pages/Admin'
import Games from './pages/Games'
import GamePlay from './pages/GamePlay'
import { getSession } from './api'

function RequireAuth({ children }) {
  return getSession() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/student-card" element={<StudentCard />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/my-score" element={<MyScore />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:gameType" element={<GamePlay />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
