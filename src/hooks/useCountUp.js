import { useEffect, useRef, useState } from 'react'

/**
 * นับตัวเลขขึ้นเมื่อเข้า viewport (อนิเมชั่นตัวเลขคะแนน/สถิติ)
 */
export default function useCountUp(target, { duration = 1.2, decimals = 0 } = {}) {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const t0 = performance.now()
    const num = Number(target) || 0
    let raf = 0
    const step = (t) => {
      const p = Math.min(1, (t - t0) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      setValue(num * eased)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [started, target, duration])

  const formatted = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString('th-TH')

  return [ref, formatted, started]
}
