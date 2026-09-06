/**
 * ชุดไอคอน SVG (stroke-based) — ใช้แทนอีโมจิทั่วทั้งแอป
 */
const PATHS = {
  home: (<><path d="M3 11.2 12 3l9 8.2" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></>),
  grad: (<><path d="M12 3 2 8.5l10 5.5 10-5.5L12 3Z" /><path d="M6.5 11v4.5c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8V11" /><path d="M20 8.5V14" /></>),
  trophy: (<><path d="M7 3h10v5a5 5 0 0 1-10 0V3Z" /><path d="M7 5H4a2 2 0 0 0 2 4h1" /><path d="M17 5h3a2 2 0 0 1-2 4h-1" /><path d="M12 13v4" /><path d="M8 21h8" /><path d="M9 17h6v4H9v-4Z" /></>),
  chart: (<><path d="M4 20h16" /><path d="M7 20v-7" /><path d="M12 20V5" /><path d="M17 20v-9" /></>),
  cog: (<><path d="M4 21v-6" /><path d="M4 11V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-4" /><path d="M20 13V3" /><path d="M1 15h6" /><path d="M9 8h6" /><path d="M17 17h6" /></>),
  logout: (<><path d="M15 12H3" /><path d="M3 12l4-4" /><path d="M3 12l4 4" /><path d="M10 5h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8" /></>),
  star: (<path d="M12 2.8 14.8 8.6l6.4.9-4.6 4.4 1.1 6.3L12 17.4 6.3 20.2l1.1-6.3L2.8 9.5l6.4-.9L12 2.8Z" fill="currentColor" stroke="none" />),
  gamepad: (<><path d="M7 12h2M8 11v2" /><path d="M16.2 10.7h.01M18.2 13h.01" /><path d="M12 3c-4 0-6.7 1-8.3 3.4A7.5 7.5 0 0 0 2 12c0 2.3 1.6 3.4 2.9 3.4 1.6 0 2.2-1.2 3-2.4.7-1.1 1.3-2 3.1-2s2.4.9 3.1 2c.8 1.2 1.4 2.4 3 2.4C20.4 15.4 22 14.3 22 12a7.5 7.5 0 0 0-1.7-5.6C18.7 4 15.9 3 12 3Z" /></>),
  target: (<><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" /><path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" stroke="none" /></>),
  trending: (<><path d="M3 17l6-6 4 4 8-8" /><path d="M21 7v6" /><path d="M15 7h6" /></>),
  check: (<><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /><path d="M8.5 12l2.4 2.4L15.5 9.6" /></>),
  building: (<><path d="M3 21h18" /><path d="M5 21V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16" /><path d="M15 21V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v12" /><path d="M8 7h2M8 11h2M8 15h2" /></>),
  user: (<><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  id: (<><path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" /><path d="M7 9h6M7 13h6M7 17h4" /></>),
  lock: (<><path d="M6 11V7a6 6 0 1 1 12 0v4" /><rect x="4.5" y="11" width="15" height="10" rx="2" /><path d="M12 15v3" /></>),
  printer: (<><path d="M6 9V3h12v6" /><path d="M4 9h16a2 2 0 0 1 2 2v6h-4" /><path d="M6 17h12v4H6v-4Z" /><path d="M4 9v4M20 9v4" /></>),
  qr: (<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3v-3ZM20 14v.01M14 20h3v.01M20 20h.01" /></>),
  medal: (<><circle cx="12" cy="9" r="6" /><path d="M9.5 13.5 8 21l4-2.2L16 21l-1.5-7.5" /><path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /></>),
  sparkles: (<><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" /><path d="M19 15l.9 2.1 2.1.9-2.1.9L19 21l-.9-2.1-2.1-.9 2.1-.9L19 15Z" /><path d="M5 15l.8 1.7 1.7.8-1.7.8L5 20l-.8-1.7-1.7-.8 1.7-.8L5 15Z" /></>),
  plus: (<path d="M12 5v14M5 12h14" />),
  trash: (<><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 14h10l1-14" /><path d="M10 11v6M14 11v6" /></>),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></>),
  tag: (<><path d="M20 13 13 20a2 2 0 0 1-2.8 0L3 13V3h10l7 7a2 2 0 0 1 0 3Z" /><path d="M7 7h.01" /></>),
  bolt: (<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />),
  crown: (<><path d="M4 18l-1-9 5 4 4-8 4 8 5-4-1 9" /><path d="M3 18h18M3 21h18" /></>),
  shield: (<><path d="M12 3l7 3v5c0 4.5-3.3 8-7 9-3.7-1-7-4.5-7-9V6l7-3Z" /><path d="M9 12l2 2 4-4" /></>),
  book: (<><path d="M12 6c-1.8-1.3-4.3-2-7-2v14c2.7 0 5.2.7 7 2 1.8-1.3 4.3-2 7-2V4c-2.7 0-5.2.7-7 2Z" /><path d="M12 6v14" /></>),
}

export default function Icon({ name, size = 20, className = '', style, strokeWidth = 1.8 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {PATHS[name] || null}
    </svg>
  )
}
