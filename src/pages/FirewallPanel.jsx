import { useMemo, useState } from 'react'
import { Reveal } from '../components/Fx'
import Icon from '../components/Icon'

const RULES = [
  { id: 'auth', title: 'ตรวจการล็อกอิน', detail: 'จำลอง 401 เมื่อเรียกข้อมูลโดยไม่มี session', icon: 'lock', color: 'blue' },
  { id: 'role', title: 'ตรวจสิทธิ์และเจ้าของข้อมูล', detail: 'จำลอง 403 เมื่อ role ไม่ตรงหรือขอดูข้อมูลผู้อื่น', icon: 'shield', color: 'red' },
  { id: 'rate', title: 'จำกัดคำขอ OTP', detail: 'จำลอง 429 เมื่อเกิน 5 ครั้งใน 60 วินาที', icon: 'bolt', color: 'gold' },
  { id: 'waf', title: 'WAF ตรวจ payload', detail: 'จำลองบล็อกข้อความ SQL injection และ XSS', icon: 'target', color: 'purple' },
  { id: 'cors', title: 'CORS allowlist', detail: 'จำลองไม่ให้ origin ที่ไม่รู้จักอ่าน response', icon: 'globe', color: 'green' },
  { id: 'errors', title: 'ซ่อนรายละเอียดข้อผิดพลาด', detail: 'จำลอง 500 แบบไม่เปิดเผย SQL หรือ stack trace', icon: 'cog', color: 'blue' },
]

const SCENARIOS = [
  { id: 'no-auth', label: 'เรียกข้อมูลโดยไม่ล็อกอิน', rule: 'auth', result: '401 Unauthorized', reason: 'ไม่พบ session ที่ยืนยันแล้ว' },
  { id: 'wrong-role', label: 'นักศึกษาเปิดหน้าแอดมิน', rule: 'role', result: '403 Forbidden', reason: 'role ไม่ได้รับอนุญาต' },
  { id: 'otp', label: 'ยิง OTP ครั้งที่ 6 ใน 60 วินาที', rule: 'rate', result: '429 Too Many Requests', reason: 'เกินโควตาคำขอเดโม' },
  { id: 'injection', label: 'payload มี SQL injection / XSS', rule: 'waf', result: 'บล็อกคำขอ', reason: 'พบรูปแบบ payload ที่เป็นอันตราย' },
  { id: 'origin', label: 'Origin = https://evil.example', rule: 'cors', result: 'อ่าน response ไม่ได้', reason: 'origin ไม่อยู่ใน allowlist' },
  { id: 'error', label: 'ระบบภายในเกิด SQL error', rule: 'errors', result: '500 Internal Server Error', reason: 'ส่งข้อความทั่วไปให้ผู้ใช้' },
]

export default function FirewallPanel() {
  const [enabled, setEnabled] = useState(() => Object.fromEntries(RULES.map((r) => [r.id, true])))
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('all')
  const blocked = events.filter((event) => event.blocked).length
  const stats = useMemo(() => ({ total: events.length, blocked, allowed: events.length - blocked }), [events, blocked])

  const runScenario = (scenario) => {
    const active = enabled[scenario.rule]
    const event = { ...scenario, id: `${Date.now()}-${Math.random()}`, blocked: active, at: new Date().toLocaleTimeString('th-TH') }
    setEvents((current) => [event, ...current].slice(0, 100))
  }
  const reset = () => setEvents([])
  const visibleEvents = filter === 'all' ? events : events.filter((event) => filter === 'blocked' ? event.blocked : !event.blocked)

  return <div className="firewall-wrap">
    <Reveal><div className="firewall-hero card"><div className="firewall-hero-icon"><Icon name="shield" size={28}/></div><div><div className="firewall-kicker">SECURITY CENTER · DEMO</div><h2>Firewall สถานะระบบ</h2><p>ภาพจำลองมาตรการที่ควรมีสำหรับ API และเว็บ SIAM U Connect</p></div><span className="badge badge-gold">เดโมเท่านั้น</span></div></Reveal>
    <div className="firewall-warning"><Icon name="bolt" size={16}/><span>หน้านี้จำลองผลลัพธ์ในเบราว์เซอร์ ไม่ได้บล็อกทราฟฟิกจริงและไม่ส่ง payload ออกไปยัง Backend</span></div>
    <div className="firewall-stats"><div className="card firewall-stat"><span>กฎที่เปิด</span><strong>{Object.values(enabled).filter(Boolean).length}/{RULES.length}</strong></div><div className="card firewall-stat"><span>เหตุการณ์ทั้งหมด</span><strong>{stats.total}</strong></div><div className="card firewall-stat"><span>จำลองบล็อก</span><strong className="firewall-green">{stats.blocked}</strong></div><div className="card firewall-stat"><span>ผ่านการจำลอง</span><strong>{stats.allowed}</strong></div></div>
    <div className="grid grid-2 firewall-columns">
      <Reveal><div className="card"><div className="firewall-section-head"><div><h3 className="card-title">มาตรการป้องกัน</h3><p className="card-sub">เปิด/ปิดกฎเพื่อดูผลในเดโม</p></div><span className="badge badge-blue">6 controls</span></div><div className="firewall-rules">{RULES.map((rule) => <div key={rule.id} className={`firewall-rule ${enabled[rule.id] ? 'is-on' : 'is-off'}`}><div className={`firewall-rule-icon ${rule.color}`}><Icon name={rule.icon} size={18}/></div><div className="firewall-rule-copy"><strong>{rule.title}</strong><span>{rule.detail}</span></div><button className={`toggle ${enabled[rule.id] ? 'on' : ''}`} onClick={() => setEnabled((current) => ({ ...current, [rule.id]: !current[rule.id] }))} aria-label={`${enabled[rule.id] ? 'ปิด' : 'เปิด'} ${rule.title}`}><span/></button></div>)}</div></div></Reveal>
      <Reveal delay={0.1}><div className="card"><div className="firewall-section-head"><div><h3 className="card-title">ทดลองเหตุการณ์</h3><p className="card-sub">กดเพื่อเพิ่มรายการลงใน audit log เดโม</p></div><button className="btn btn-ghost btn-sm" onClick={reset}>ล้าง log</button></div><div className="scenario-list">{SCENARIOS.map((scenario) => <button key={scenario.id} className="scenario-btn" onClick={() => runScenario(scenario)}><span>{scenario.label}</span><Icon name="bolt" size={15}/></button>)}</div></div></Reveal>
    </div>
    <Reveal delay={0.15}><div className="card firewall-log"><div className="firewall-section-head"><div><h3 className="card-title">Audit log จำลอง</h3><p className="card-sub">แสดงเหตุการณ์ล่าสุดไม่เกิน 100 รายการ</p></div><div className="log-filters">{[['all','ทั้งหมด'],['blocked','บล็อก'],['allowed','ผ่าน']].map(([key,label]) => <button key={key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}</button>)}</div></div>{visibleEvents.length === 0 ? <div className="firewall-empty"><Icon name="shield" size={24}/><span>ยังไม่มีเหตุการณ์ ลองกดสถานการณ์ด้านบน</span></div> : <div className="firewall-events">{visibleEvents.map((event) => <div key={event.id} className="firewall-event"><span className={`event-dot ${event.blocked ? 'blocked' : 'allowed'}`}/><div className="event-main"><strong>{event.label}</strong><span>{event.reason}</span></div><span className={`event-status ${event.blocked ? 'blocked' : 'allowed'}`}>{event.blocked ? event.result : 'อนุญาตในเดโม'}</span><time>{event.at}</time></div>)}</div>}</div></Reveal>
  </div>
}
