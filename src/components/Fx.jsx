import { motion } from 'framer-motion'
import useCountUp from '../hooks/useCountUp'

/** เลื่อนเข้าแล้วค่อยโผล่ (scroll reveal) */
export function Reveal({ children, delay = 0, className = '', y = 26 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** ตัวเลขอนิเมชั่นนับขึ้น */
export function Counter({ value, decimals = 0, duration = 1.2, className = '' }) {
  const [ref, formatted] = useCountUp(value, { duration, decimals })
  return <span ref={ref} className={className}>{formatted}</span>
}

/* ---------------- ฉากหลัง Aurora ---------------- */

const SHAPES = ['ring', 'dot', 'diamond', 'cross', 'ring', 'dot', 'cross', 'diamond', 'ring', 'cross', 'dot', 'diamond']

/** พื้นหลังแบบไล่แสงเลื่อนไหล + รูปทรงเรขาคณิตเป็นประกาย */
export function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora-blob b1" />
      <div className="aurora-blob b2" />
      <div className="aurora-blob b3" />
      <div className="aurora-grid" />
      {SHAPES.map((s, i) => (
        <span
          key={i}
          className={`aurora-shape s-${s}`}
          style={{
            left: `${(i * 137) % 100}%`,
            top: `${(i * 61 + 13) % 100}%`,
            '--s': `${16 + ((i * 13) % 22)}px`,
            animationDuration: `${9 + ((i * 3) % 7)}s`,
            animationDelay: `${(i * 0.9) % 5}s`,
          }}
        />
      ))}
      <div className="aurora-vignette" />
    </div>
  )
}
