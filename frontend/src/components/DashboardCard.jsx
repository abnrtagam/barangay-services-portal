// ── DashboardCard ──────────────────────────────────────────
export function DashboardCard({ title, value, icon, color = 'blue', sub }) {
  const colors = {
    blue:   { bg: 'var(--primary-600)', light: 'var(--primary-50)',  text: 'var(--primary-700)' },
    green:  { bg: '#10b981',            light: '#d1fae5',            text: '#065f46' },
    orange: { bg: '#f59e0b',            light: '#fef3c7',            text: '#92400e' },
    red:    { bg: '#ef4444',            light: '#fee2e2',            text: '#991b1b' },
    purple: { bg: '#8b5cf6',            light: '#ede9fe',            text: '#4c1d95' },
  }
  const c = colors[color] || colors.blue

  return (
    <div style={{
      background: 'white', borderRadius: 'var(--radius-lg)',
      padding: '24px', display: 'flex', alignItems: 'center', gap: '18px',
      boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--radius-md)',
        background: c.light, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: c.bg, fontSize: '1.5rem', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '.82rem', fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--gray-500)', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: c.text, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '.78rem', color: 'var(--gray-400)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── StatusBadge ────────────────────────────────────────────
export function StatusBadge({ status }) {
  const normalized = typeof status === 'string' ? status : String(status || '')
  const s = normalized.toLowerCase().replace(/\s/g, '-')
  return <span className={`badge badge-${s}`}>{normalized}</span>
}

// ── AlertMessage ───────────────────────────────────────────
export function AlertMessage({ type = 'info', message, onClose }) {
  if (!message) return null
  const cfg = {
    success: { bg: '#d1fae5', border: '#6ee7b7', color: '#065f46' },
    error:   { bg: '#fee2e2', border: '#fca5a5', color: '#991b1b' },
    warning: { bg: '#fef3c7', border: '#fcd34d', color: '#92400e' },
    info:    { bg: 'var(--primary-50)', border: 'var(--primary-200)', color: 'var(--primary-800)' },
  }[type]

  return (
    <div style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, borderRadius: 'var(--radius-md)',
      padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 16, fontSize: '.9rem',
      fontFamily: 'var(--font-heading)', fontWeight: 500,
    }}>
      {message}
      {onClose && (
        <button onClick={onClose} style={{
          border: 'none', background: 'none', cursor: 'pointer',
          color: cfg.color, fontSize: '1.1rem', lineHeight: 1,
        }}>×</button>
      )}
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        position: 'absolute', inset: 0, background: 'rgba(15,23,42,.5)',
        backdropFilter: 'blur(2px)',
      }} onClick={onClose} />
      <div style={{
        position: 'relative', background: 'white',
        borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)',
        width: '100%', maxWidth: 540, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        animation: 'modalIn .2s ease',
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--gray-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem',
        }}>
          {title}
          <button onClick={onClose} style={{
            border: 'none', background: 'var(--gray-100)', borderRadius: 8,
            width: 30, height: 30, cursor: 'pointer', fontSize: '1.1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--gray-100)',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>{footer}</div>}
      </div>
      <style>{`@keyframes modalIn { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  )
}
