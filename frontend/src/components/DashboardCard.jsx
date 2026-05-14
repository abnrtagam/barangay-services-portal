import React from 'react'

const COLOR_MAP = {
  blue: {
    background: 'var(--info-100)',
    iconBg: 'var(--info-200)',
    icon: 'var(--info-700)',
    text: 'var(--gray-950)',
  },
  info: {
    background: 'var(--info-100)',
    iconBg: 'var(--info-200)',
    icon: 'var(--info-700)',
    text: 'var(--gray-950)',
  },
  success: {
    background: 'var(--success-100)',
    iconBg: 'var(--success-200)',
    icon: 'var(--success-700)',
    text: 'var(--gray-950)',
  },
  green: {
    background: 'var(--success-100)',
    iconBg: 'var(--success-200)',
    icon: 'var(--success-700)',
    text: 'var(--gray-950)',
  },
  warning: {
    background: 'var(--warning-100)',
    iconBg: 'var(--warning-200)',
    icon: 'var(--warning-700)',
    text: 'var(--gray-950)',
  },
  danger: {
    background: 'var(--danger-100)',
    iconBg: 'var(--danger-200)',
    icon: 'var(--danger-700)',
    text: 'var(--gray-950)',
  },
  red: {
    background: 'var(--danger-100)',
    iconBg: 'var(--danger-200)',
    icon: 'var(--danger-700)',
    text: 'var(--gray-950)',
  },
  neutral: {
    background: 'var(--gray-100)',
    iconBg: 'var(--gray-200)',
    icon: 'var(--gray-700)',
    text: 'var(--gray-950)',
  },
}

export function DashboardCard({ title, value, icon, color = 'blue', sub }) {
  const palette = COLOR_MAP[color] || COLOR_MAP.blue

  return (
    <article className="dashboard-card">
      <div 
        className="dashboard-card-icon" 
        style={{ 
          background: palette.iconBg, 
          color: palette.icon,
          borderRadius: 'var(--radius-md)',
        }}
      >
        {icon}
      </div>
      <div className="dashboard-card-content">
        <div className="dashboard-card-title">{title}</div>
        <div className="dashboard-card-value">{value}</div>
        {sub && <div className="dashboard-card-sub">{sub}</div>}
      </div>
    </article>
  )
}

export function StatusBadge({ status }) {
  const normalized = typeof status === 'string' ? status : String(status || '')
  const slug = normalized.toLowerCase().replace(/\s+/g, '-')
  return <span className={`badge badge-${slug}`}>{normalized}</span>
}

export function AlertMessage({ type = 'info', message, onClose }) {
  if (!message) return null
  const cfg = {
    success: { bg: 'var(--success-100)', border: 'var(--success-700)', color: 'var(--success-700)' },
    error: { bg: 'var(--danger-100)', border: 'var(--danger-700)', color: 'var(--danger-700)' },
    warning: { bg: 'var(--warning-100)', border: 'var(--warning-700)', color: 'var(--warning-700)' },
    info: { bg: 'var(--info-100)', border: 'var(--info-700)', color: 'var(--info-700)' },
  }[type] || {
    bg: 'var(--gray-100)', border: 'var(--gray-200)', color: 'var(--gray-800)',
  }

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.color,
      borderRadius: 'var(--radius-md)',
      padding: '14px 18px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-heading)',
      fontWeight: 600,
    }}>
      <span>{message}</span>
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} type="button">×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid var(--gray-150)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>{footer}</div>}
      </div>
    </div>
  )
}
