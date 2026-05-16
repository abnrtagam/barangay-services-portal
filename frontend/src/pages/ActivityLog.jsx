import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiActivity, FiAlertCircle, FiCalendar, FiShield, FiClock, FiFilter } from 'react-icons/fi'
import { formatDate } from '../utils/date'

const ACTION_ICONS = {
  status_update: <FiAlertCircle />,
  password_change: <FiShield />,
  verification: <FiCalendar />,
}

const ACTION_COLORS = {
  status_update: { bg: 'var(--primary-100)', color: 'var(--primary-700)' },
  password_change: { bg: 'var(--warning-100)', color: 'var(--warning-700)' },
  verification: { bg: '#dcfce7', color: '#15803d' },
}

const ACTION_LABELS = {
  status_update: 'Status Update',
  password_change: 'Password Change',
  verification: 'Verification',
}

export default function ActivityLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 })
  const [filterType, setFilterType] = useState('')
  const token = localStorage.getItem('admin_token')

  const load = (page = 1) => {
    setLoading(true)
    const params = { page, limit: pagination.limit }
    if (filterType) params.action_type = filterType
    axios.get('/api/admin/activity-log', { headers: { Authorization: `Bearer ${token}` }, params })
      .then(r => {
        setLogs(r.data.data || [])
        setPagination(p => ({ ...p, page, total: r.data.total || 0 }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(1) }, [filterType])

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div>
      {/* Premium Gradient Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)',
        padding: '32px 40px', borderRadius: '16px', marginBottom: '24px',
        color: 'white', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', color: '#ffffff' }}>Activity Log</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>Track all administrative actions and audit trail.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4, color: 'rgba(255,255,255,0.8)' }}>Total Actions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{pagination.total}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card mb-3" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="card-body" style={{ padding: '18px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <FiFilter size={16} color="var(--gray-400)" />
          <select
            className="form-control"
            style={{ maxWidth: 220, borderRadius: '8px', border: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="status_update">Status Updates</option>
            <option value="password_change">Password Changes</option>
            <option value="verification">Verifications</option>
          </select>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? (
          <div className="spinner-wrap" style={{ padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray-400)' }}>
            <FiActivity size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>No activity yet</div>
            <div style={{ fontSize: '0.85rem' }}>Admin actions will appear here as they happen.</div>
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {logs.map((log, i) => {
              const colors = ACTION_COLORS[log.action_type] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' }
              const icon = ACTION_ICONS[log.action_type] || <FiActivity />
              const label = ACTION_LABELS[log.action_type] || log.action_type
              return (
                <div key={log.id} style={{
                  display: 'flex', gap: 16, padding: '18px 24px', alignItems: 'flex-start',
                  borderBottom: i < logs.length - 1 ? '1px solid var(--gray-50)' : 'none',
                  transition: 'background 0.15s',
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                    background: colors.bg, color: colors.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                  }}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 4 }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)' }}>
                        {log.admin_name}
                      </div>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px', fontSize: '0.68rem',
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                        background: colors.bg, color: colors.color, flexShrink: 0
                      }}>
                        {label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 6 }}>
                      {log.description}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                      <FiClock size={12} />
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
            <button className="btn btn-secondary btn-sm" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)} style={{ padding: '8px 16px', fontWeight: 700 }}>Previous</button>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Page <span style={{ color: '#0f172a' }}>{pagination.page}</span> of {totalPages}</div>
            <button className="btn btn-secondary btn-sm" disabled={pagination.page >= totalPages} onClick={() => load(pagination.page + 1)} style={{ padding: '8px 16px', fontWeight: 700 }}>Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
