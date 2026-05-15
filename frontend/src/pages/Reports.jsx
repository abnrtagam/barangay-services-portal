import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { DashboardCard } from '../components/DashboardCard'
import { FiFileText, FiAlertCircle, FiCalendar, FiUsers } from 'react-icons/fi'

export default function Reports() {
  const [stats, setStats]     = useState({})
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const token = localStorage.getItem('admin_token')

  const load = () => {
    setLoading(true)
    const params = {}
    if (dateRange.from) params.from = dateRange.from
    if (dateRange.to)   params.to   = dateRange.to
    axios.get('/api/admin/reports', { headers: { Authorization: `Bearer ${token}` }, params })
      .then(r => setStats(r.data))
      .catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const exportCsv = async (type) => {
    try {
      const res = await axios.get(`/api/admin/reports/export?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }, responseType: 'blob'
      })
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type}-report-${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {}
  }

  return (
    <div>
      {/* Premium Gradient Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)',
        padding: '32px 40px',
        borderRadius: '16px',
        marginBottom: '24px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', color: '#ffffff' }}>Reports & Analytics</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', letterSpacing: '0.02em' }}>Generate and export barangay service reports.</p>
        </div>
      </div>

      {/* Date Filter (Elevated Card) */}
      <div className="card mb-3" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="card-body" style={{ padding: '18px 24px' }}>
          <div className="filter-bar">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--gray-600)', fontSize: '.75rem', textTransform: 'uppercase' }}>From</label>
              <input className="form-control" style={{ borderRadius: '8px', border: '1px solid var(--gray-200)', background: 'var(--gray-50)' }} type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))}/>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--gray-600)', fontSize: '.75rem', textTransform: 'uppercase' }}>To</label>
              <input className="form-control" style={{ borderRadius: '8px', border: '1px solid var(--gray-200)', background: 'var(--gray-50)' }} type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))}/>
            </div>
            <div style={{ paddingBottom: 2 }}>
              <button className="btn btn-primary" style={{ borderRadius: '8px', fontWeight: 700, padding: '10px 24px' }} onClick={load}>Generate</button>
            </div>
          </div>
        </div>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
        <>
          <div className="grid-4 mb-3">
            <DashboardCard title="Total Residents"    value={stats.totalResidents    || 0} icon={<FiUsers/>}       color="blue"/>
            <DashboardCard title="Total Complaints"   value={stats.totalComplaints   || 0} icon={<FiAlertCircle/>} color="red"/>
            <DashboardCard title="Total Appointments" value={stats.totalAppointments || 0} icon={<FiCalendar/>}    color="info"/>
            <DashboardCard title="Resolved Cases"     value={stats.resolvedComplaints || 0} icon={<FiFileText/>}  color="green"/>
          </div>

          {/* Breakdown Cards */}
          <div className="grid-2 mb-3">
            <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div className="card-header">
                <span className="card-title">Complaints by Status</span>
                <button className="btn btn-secondary btn-sm" onClick={() => exportCsv('complaints')}>Export CSV</button>
              </div>
              <div className="card-body">
                {[['Pending', stats.pendingComplaints, 'var(--warning)'],
                  ['Approved', stats.approvedComplaints, 'var(--success)'],
                  ['Scheduled', stats.scheduledComplaints, 'var(--info)'],
                  ['Resolved', stats.resolvedComplaints, '#8b5cf6'],
                  ['Rejected', stats.rejectedComplaints, 'var(--danger)'],
                ].map(([label, count, color]) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '.86rem' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{label}</span>
                      <span style={{ color: 'var(--gray-500)' }}>{count || 0}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 'var(--radius-full)', background: 'var(--gray-100)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 'var(--radius-full)',
                        background: color, width: `${Math.min(100, ((count || 0) / (stats.totalComplaints || 1)) * 100)}%`,
                        transition: 'width .4s ease',
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div className="card-header">
                <span className="card-title">Appointments by Status</span>
                <button className="btn btn-secondary btn-sm" onClick={() => exportCsv('appointments')}>Export CSV</button>
              </div>
              <div className="card-body">
                {[['Pending', stats.pendingAppointments, 'var(--warning)'],
                  ['Approved', stats.approvedAppointments, 'var(--success)'],
                  ['Completed', stats.completedAppointments, '#8b5cf6'],
                  ['Cancelled', stats.cancelledAppointments, 'var(--gray-400)'],
                  ['Rejected', stats.rejectedAppointments, 'var(--danger)'],
                ].map(([label, count, color]) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '.86rem' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{label}</span>
                      <span style={{ color: 'var(--gray-500)' }}>{count || 0}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 'var(--radius-full)', background: 'var(--gray-100)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 'var(--radius-full)',
                        background: color, width: `${Math.min(100, ((count || 0) / (stats.totalAppointments || 1)) * 100)}%`,
                        transition: 'width .4s ease',
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Complaints by Category */}
          {stats.complaintsByCategory && stats.complaintsByCategory.length > 0 && (
            <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div className="card-header">
                <span className="card-title">Complaints by Category</span>
              </div>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead><tr><th>Category</th><th>Total</th><th>Pending</th><th>Resolved</th></tr></thead>
                  <tbody>
                    {stats.complaintsByCategory.map(cat => (
                      <tr key={cat.name}>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{cat.name}</td>
                        <td>{cat.total}</td>
                        <td>{cat.pending}</td>
                        <td>{cat.resolved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
