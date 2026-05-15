import React from 'react'

const COLOR_MAP = {
  blue:    { border: '#2563eb', iconBg: '#dbeafe', icon: '#1d4ed8' },
  info:    { border: '#0891b2', iconBg: '#cffafe', icon: '#0e7490' },
  success: { border: '#16a34a', iconBg: '#dcfce7', icon: '#15803d' },
  green:   { border: '#16a34a', iconBg: '#dcfce7', icon: '#15803d' },
  warning: { border: '#d97706', iconBg: '#fef3c7', icon: '#b45309' },
  danger:  { border: '#dc2626', iconBg: '#fee2e2', icon: '#b91c1c' },
  red:     { border: '#dc2626', iconBg: '#fee2e2', icon: '#b91c1c' },
  neutral: { border: '#64748b', iconBg: '#f1f5f9', icon: '#475569' },
}

const cardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  border: 'none',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'default',
  position: 'relative',
  overflow: 'hidden',
}

export function DashboardCard({ title, value, icon, color = 'blue', sub }) {
  const palette = COLOR_MAP[color] || COLOR_MAP.blue
  const [hovered, setHovered] = React.useState(false)

  return (
    <article
      style={{
        ...cardStyle,
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 12px 30px rgba(0,0,0,0.08)'
          : cardStyle.boxShadow,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        background: palette.border
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#64748b',
          margin: 0,
        }}>
          {title}
        </p>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: palette.iconBg,
          color: palette.icon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      <div>
        <div style={{
          fontSize: '2.6rem',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          {value}
        </div>
        {sub && (
          <div style={{
            fontSize: '0.8rem',
            color: '#94a3b8',
            marginTop: '6px',
            fontWeight: 500,
          }}>
            {sub}
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute',
        bottom: '-20px',
        right: '-20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: palette.iconBg,
        opacity: 0.4,
        pointerEvents: 'none',
      }} />
    </article>
  )
}

export function StatusBadge({ status }) {
  const normalized = typeof status === 'string' ? status : String(status || '')
  const slug = normalized.toLowerCase().replace(/\s+/g, '-')

  const badgeColors = {
    pending:   { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
    approved:  { bg: '#dcfce7', color: '#14532d', border: '#bbf7d0' },
    rejected:  { bg: '#fee2e2', color: '#7f1d1d', border: '#fecaca' },
    resolved:  { bg: '#dbeafe', color: '#1e3a8a', border: '#bfdbfe' },
    scheduled: { bg: '#ede9fe', color: '#3b0764', border: '#ddd6fe' },
    completed: { bg: '#dcfce7', color: '#14532d', border: '#bbf7d0' },
  }

  const style = badgeColors[slug] || { bg: '#f1f5f9', color: '#334155', border: '#e2e8f0' }

  return (
    <span style={{
      background: style.bg,
      color: style.color,
      borderRadius: '999px',
      padding: '4px 12px',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
      display: 'inline-block',
      textTransform: 'uppercase'
    }}>
      {normalized}
    </span>
  )
}

export function AlertMessage({ type = 'info', title, message, onClose }) {
  if (!message) return null
  const cfg = {
    success: { bg: 'var(--success-100)', border: 'var(--success-700)', color: 'var(--success-700)' },
    error:   { bg: 'var(--danger-100)',  border: 'var(--danger-700)',  color: 'var(--danger-700)' },
    warning: { bg: 'var(--warning-100)', border: 'var(--warning-700)', color: 'var(--warning-700)' },
    info:    { bg: 'var(--info-100)',    border: 'var(--info-700)',    color: 'var(--info-700)' },
  }[type] || { bg: 'var(--gray-100)', border: 'var(--gray-200)', color: 'var(--gray-800)' }

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.color,
      borderRadius: 'var(--radius-md)',
      padding: '16px 18px',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 10,
      alignItems: 'start',
      marginBottom: 18,
    }} role="alert">
      <div>
        {title && <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>}
        <div style={{ fontWeight: 500, lineHeight: 1.5 }}>{message}</div>
      </div>
      {onClose && (
        <button onClick={onClose} style={{
          border: 'none', background: 'none', cursor: 'pointer',
          color: cfg.color, fontSize: '1.1rem', lineHeight: 1,
        }}>×</button>
      )}
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} type="button">×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--gray-150)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
