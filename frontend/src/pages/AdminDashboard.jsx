import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { DashboardCard, StatusBadge } from '../components/DashboardCard'
import {
  FiUsers, FiAlertCircle, FiClock,
  FiCalendar, FiCheckCircle, FiClipboard,
} from 'react-icons/fi'

const EmptyState = ({ message }) => (
  <tr>
    <td colSpan={3}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '36px 20px',
        color: '#94a3b8',
        gap: '10px',
      }}>
        <FiClipboard size={32} strokeWidth={1.5} />
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
      </div>
    </td>
  </tr>
)

export default function AdminDashboard() {
  const [stats, setStats]           = useState({})
  const [recentComplaints, setRC]   = useState([])
  const [recentAppointments, setRA] = useState([])
  const [loading, setLoading]       = useState(true)
  const token = localStorage.getItem('admin_token')

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      axios.get('/api/admin/stats', { headers }),
      axios.get('/api/admin/complaints?limit=6', { headers }),
      axios.get('/api/admin/appointments?limit=6', { headers }),
    ]).then(([s, c, a]) => {
      setStats(s.data)
      setRC(c.data.data || [])
      setRA(a.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  const today = new Date().toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div style={{ padding: '24px', maxWidth: '1400px' }}>

      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(37, 99, 235, 0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-40px', top: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: '60px', bottom: '-60px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
        }} />
        <div>
          <p style={{
            color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem',
            fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase', margin: '0 0 6px 0',
          }}>
            Admin Portal
          </p>
          <h1 style={{
            color: '#ffffff', fontSize: '1.75rem', fontWeight: 800,
            margin: '0 0 6px 0', letterSpacing: '-0.02em',
          }}>
            Admin Dashboard
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', margin: 0,
          }}>
            Overview of all barangay service requests.
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          borderRadius: '10px',
          padding: '10px 18px',
          color: '#ffffff',
          fontSize: '0.82rem',
          fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.2)',
          whiteSpace: 'nowrap',
        }}>
          {today}
        </div>
      </div>

      {/* Section Label */}
      <p style={{
        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 14px 2px',
      }}>
        Performance Overview
      </p>

      {/* Stats Row 1 */}
      <div className="grid-4 mb-3">
        <DashboardCard title="Total Residents"    value={stats.totalResidents    || 0} icon={<FiUsers />}       color="blue"    sub="Registered accounts" />
        <DashboardCard title="Total Complaints"   value={stats.totalComplaints   || 0} icon={<FiAlertCircle />} color="red"     sub="All time" />
        <DashboardCard title="Pending Complaints" value={stats.pendingComplaints || 0} icon={<FiClock />}       color="warning" sub="Needs attention" />
        <DashboardCard title="Total Appointments" value={stats.totalAppointments || 0} icon={<FiCalendar />}    color="info"    sub="All time" />
      </div>

      {/* Stats Row 2 */}
      <div className="grid-4 mb-3">
        <DashboardCard title="Approved"     value={stats.approvedComplaints    || 0} icon={<FiCheckCircle />} color="green"   sub="Complaints" />
        <DashboardCard title="Resolved"     value={stats.resolvedComplaints    || 0} icon={<FiCheckCircle />} color="success" sub="Complaints" />
        <DashboardCard title="Pending Appt" value={stats.pendingAppointments   || 0} icon={<FiClock />}       color="warning" sub="Appointments" />
        <DashboardCard title="Completed"    value={stats.completedAppointments || 0} icon={<FiCalendar />}    color="green"   sub="Appointments" />
      </div>

      {/* Section Label */}
      <p style={{
        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#94a3b8', margin: '8px 0 14px 2px',
      }}>
        Recent Activity
      </p>

      {/* Recent Tables */}
      <div className="grid-2">

        <div style={{
          background: '#ffffff', borderRadius: '16px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '18px 24px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Recent Complaints
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Latest complaint activity
              </p>
            </div>
            <span style={{
              background: '#dbeafe', color: '#1d4ed8', fontSize: '0.68rem',
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: '999px', border: '1px solid #bfdbfe',
            }}>
              Live
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={thStyle}>Resident</th>
                  <th style={thStyle}>Subject</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.length === 0
                  ? <EmptyState message="No recent complaints." />
                  : recentComplaints.map(c => (
                    <tr key={c.id}>
                      <td style={{ ...tdStyle, fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>
                        {c.resident_name}
                      </td>
                      <td style={{
                        ...tdStyle, fontSize: '0.85rem', color: '#334155',
                        maxWidth: '200px', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {c.subject}
                      </td>
                      <td style={tdStyle}><StatusBadge status={c.status} /></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        <div style={{
          background: '#ffffff', borderRadius: '16px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '18px 24px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Recent Appointments
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Upcoming appointment requests
              </p>
            </div>
            <span style={{
              background: '#dcfce7', color: '#15803d', fontSize: '0.68rem',
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: '999px', border: '1px solid #bbf7d0',
            }}>
              Fresh
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={thStyle}>Resident</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.length === 0
                  ? <EmptyState message="No recent appointments." />
                  : recentAppointments.map(a => (
                    <tr key={a.id}>
                      <td style={{ ...tdStyle, fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>
                        {a.resident_name}
                      </td>
                      <td style={{ ...tdStyle, fontSize: '0.82rem', color: '#334155' }}>
                        {a.appointment_date} {a.time_slot}
                      </td>
                      <td style={tdStyle}><StatusBadge status={a.status} /></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

const thStyle = {
  padding: '10px 16px',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: '#64748b',
  textAlign: 'left',
  borderBottom: '1px solid #f1f5f9',
}

const tdStyle = {
  padding: '13px 16px',
  borderBottom: '1px solid #f8fafc',
}