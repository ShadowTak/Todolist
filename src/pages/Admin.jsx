import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { getSession } from '../api'
import {
  getUniversities, saveUniversities, getAdminStudents,
  addAdminStudent, removeAdminStudent,
} from '../api'
import { Reveal } from '../components/Fx'
import Icon from '../components/Icon'
import './Admin.css'
import FirewallPanel from './FirewallPanel'

const COLORS = ['#e05666', '#38bdf8', '#8b5cf6', '#34d399', '#f0b429', '#f472b6', '#0ea5e9', '#d4762b', '#3a7ca5', '#7b5aa6']

export default function Admin() {
  const session = getSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(() => searchParams.get('tab') || 'unis')
  const [unis, setUnis] = useState(getUniversities)
  const [students, setStudents] = useState(getAdminStudents)

  const [uniForm, setUniForm] = useState({ name: '', name_en: '', short: '' })
  const [stuForm, setStuForm] = useState({ name: '', surname: '', code: '', faculty: '', university: '' })
  const [toast, setToast] = useState('')

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }
  const selectTab = (nextTab) => { setTab(nextTab); setSearchParams(nextTab === 'unis' ? {} : { tab: nextTab }) }

  /* ---------- มหาวิทยาลัย ---------- */
  const addUni = () => {
    if (!uniForm.name.trim()) { notify('กรุณากรอกชื่อมหาวิทยาลัย', 'err'); return }
    const list = [...unis, {
      id: 'u' + Date.now(),
      name: uniForm.name.trim(),
      name_en: uniForm.name_en.trim(),
      short: uniForm.short.trim() || uniForm.name.trim().slice(0, 4).toUpperCase(),
      color: COLORS[unis.length % COLORS.length],
    }]
    setUnis(list)
    saveUniversities(list)
    setUniForm({ name: '', name_en: '', short: '' })
    notify('เพิ่มมหาวิทยาลัยเรียบร้อย')
  }
  const removeUni = (id) => {
    const list = unis.filter((u) => u.id !== id)
    setUnis(list)
    saveUniversities(list)
    notify('ลบมหาวิทยาลัยแล้ว')
  }

  /* ---------- นักศึกษา ---------- */
  const addStu = () => {
    if (!stuForm.name.trim() || !stuForm.surname.trim() || !stuForm.code.trim()) {
      notify('กรุณากรอกชื่อ นามสกุล และรหัสนักศึกษา', 'err')
      return
    }
    const list = addAdminStudent({
      name: stuForm.name.trim(),
      surname: stuForm.surname.trim(),
      code: stuForm.code.trim(),
      faculty: stuForm.faculty.trim(),
      university: stuForm.university.trim() || 'มหาวิทยาลัยสยาม',
    })
    setStudents(list)
    setStuForm({ name: '', surname: '', code: '', faculty: '', university: '' })
    notify('เพิ่มนักศึกษาเรียบร้อย')
  }
  const removeStu = (id) => {
    setStudents(removeAdminStudent(id))
    notify('ลบนักศึกษาแล้ว')
  }

  if (session?.role !== 'admin') {
    return (
      <div className="fade-in">
        <h1 className="grad-text">ผู้ดูแลระบบ</h1>
        <div className="card" style={{ marginTop: 20 }}>
          <p className="muted">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น — กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแล</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <h1 className="grad-text">หน้าผู้ดูแลระบบ</h1>
          <p className="muted">จัดการมหาวิทยาลัย และนักศึกษา (ฟีเจอร์ใหม่)</p>
        </div>
        <span className="badge badge-red">
          <Icon name="shield" size={13} strokeWidth={2} /> Admin Mode
        </span>
      </div>

      <div className="admin-tabs">
        {[
          { key: 'unis', label: `มหาวิทยาลัย (${unis.length})`, icon: 'building' },
          { key: 'students', label: `นักศึกษา (${students.length})`, icon: 'grad' },
          { key: 'add-student', label: 'เพิ่มนักศึกษา', icon: 'plus' },
          { key: 'firewall', label: 'Firewall เดโม', icon: 'shield' },
        ].map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => selectTab(t.key)}>
            <Icon name={t.icon} size={16} strokeWidth={1.9} style={{ verticalAlign: '-3px', marginRight: 6 }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ============ มหาวิทยาลัย ============ */}
      {tab === 'unis' && (
        <motion.div
          className="grid grid-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .4 }}
        >
          <Reveal>
            <div className="card">
              <h3 className="card-title">เพิ่มมหาวิทยาลัยใหม่</h3>
              <p className="card-sub">เพิ่มรายชื่อมหาวิทยาลัยอื่น ๆ ที่เข้าร่วมระบบ</p>
              <div className="field">
                <label>ชื่อมหาวิทยาลัย (ไทย) *</label>
                <input className="input" value={uniForm.name} onChange={(e) => setUniForm({ ...uniForm, name: e.target.value })} placeholder="เช่น มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี" />
              </div>
              <div className="field">
                <label>ชื่อภาษาอังกฤษ</label>
                <input className="input" value={uniForm.name_en} onChange={(e) => setUniForm({ ...uniForm, name_en: e.target.value })} placeholder="เช่น King Mongkut's University of Technology Thonburi" />
              </div>
              <div className="field">
                <label>ชื่อย่อ</label>
                <input className="input" value={uniForm.short} onChange={(e) => setUniForm({ ...uniForm, short: e.target.value })} placeholder="เช่น KMUTT" />
              </div>
              <button className="btn btn-block" onClick={addUni}>เพิ่มมหาวิทยาลัย</button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card">
              <h3 className="card-title">รายชื่อมหาวิทยาลัย ({unis.length})</h3>
              <p className="card-sub">มหาวิทยาลัยทั้งหมดในระบบ — เก็บใน localStorage</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {unis.map((u) => (
                  <div key={u.id} className="uni-card">
                    <div className="uni-avatar" style={{ background: u.color }}>{u.short || u.name.slice(0, 3)}</div>
                    <div>
                      <div className="uni-name">{u.name}</div>
                      <div className="uni-en">{u.name_en}</div>
                    </div>
                    <div className="uni-actions">
                      <button title="ลบ" onClick={() => removeUni(u.id)}>
                        <Icon name="trash" size={17} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                ))}
                {unis.length === 0 && <p className="muted">ยังไม่มีมหาวิทยาลัย</p>}
              </div>
            </div>
          </Reveal>
        </motion.div>
      )}

      {/* ============ นักศึกษา ============ */}
      {tab === 'students' && (
        <motion.div
          className="card"
          style={{ padding: 0, overflow: 'hidden' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .4 }}
        >
          <div style={{ padding: '20px 24px 6px' }}>
            <h3 className="card-title">นักศึกษาในระบบ ({students.length})</h3>
            <p className="card-sub">นักศึกษาที่เพิ่มโดยผู้ดูแล — รวมนักศึกษาจากมหาวิทยาลัยอื่น</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>รหัสนักศึกษา</th><th>ชื่อ-นามสกุล</th><th>คณะ</th><th>มหาวิทยาลัย</th><th></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="mono">{s.code}</td>
                    <td>{s.name} {s.surname}</td>
                    <td>{s.faculty || '—'}</td>
                    <td>{s.university}</td>
                    <td><button className="del-btn" onClick={() => removeStu(s.id)}>ลบ</button></td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: 30 }}>ยังไม่มีนักศึกษา — ไปแท็บ "เพิ่มนักศึกษา" ได้เลย</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ============ เพิ่มนักศึกษา ============ */}
      {tab === 'add-student' && (
        <motion.div
          className="card"
          style={{ maxWidth: 640 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .4 }}
        >
          <h3 className="card-title">เพิ่มนักศึกษาใหม่</h3>
          <p className="card-sub">เพิ่มนักศึกษาได้ทั้งจากมหาวิทยาลัยสยาม และมหาวิทยาลัยอื่นที่เข้าร่วม</p>
          <div className="form-grid">
            <div className="field">
              <label>ชื่อ *</label>
              <input className="input" value={stuForm.name} onChange={(e) => setStuForm({ ...stuForm, name: e.target.value })} placeholder="ชื่อ" />
            </div>
            <div className="field">
              <label>นามสกุล *</label>
              <input className="input" value={stuForm.surname} onChange={(e) => setStuForm({ ...stuForm, surname: e.target.value })} placeholder="นามสกุล" />
            </div>
            <div className="field">
              <label>รหัสนักศึกษา *</label>
              <input className="input mono" value={stuForm.code} onChange={(e) => setStuForm({ ...stuForm, code: e.target.value })} placeholder="เช่น 6705100099" />
            </div>
            <div className="field">
              <label>คณะ</label>
              <input className="input" value={stuForm.faculty} onChange={(e) => setStuForm({ ...stuForm, faculty: e.target.value })} placeholder="เช่น วิศวกรรมศาสตร์" />
            </div>
            <div className="field full">
              <label>มหาวิทยาลัย</label>
              <select className="select" value={stuForm.university} onChange={(e) => setStuForm({ ...stuForm, university: e.target.value })}>
                <option value="">เลือกมหาวิทยาลัย...</option>
                {unis.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-block" style={{ marginTop: 6 }} onClick={addStu}>บันทึกนักศึกษา</button>
        </motion.div>
      )}

      {tab === 'firewall' && <FirewallPanel />}

      {toast && <div className={`toast ${toast.startsWith('กรุณา') ? 'err' : 'ok'}`}>{toast}</div>}
    </div>
  )
}
