import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { DashboardCard, StatusBadge } from '../components/DashboardCard'
import { FiUsers, FiAlertCircle, FiClock, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi'

export default function AdminDashboard() {
  const [stats, setStats]            = useState({})
  const [recentComplaints, setRC]    = useState([])
  const [recentAppointments, setRA]  = useState([])
  const [loading, setLoading]        = useState(true)
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

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Overview of all barangay service requests.</p>
        </div>
        <div style={{ fontSize: '.85rem', color: 'var(--gray-400)' }}>
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Row 1 */}
      <div className="grid-4 mb-3">
        <DashboardCard title="Total Residents"    value={stats.totalResidents    || 0} icon={<FiUsers/>}       color="blue"   sub="Registered accounts"/>
        <DashboardCard title="Total Complaints"   value={stats.totalComplaints   || 0} icon={<FiAlertCircle/>} color="red"    sub="All time"/>
        <DashboardCard title="Pending Complaints" value={stats.pendingComplaints || 0} icon={<FiClock/>}       color="orange" sub="Needs attention"/>
        <DashboardCard title="Total Appointments" value={stats.totalAppointments || 0} icon={<FiCalendar/>}    color="purple" sub="All time"/>
      </div>

      {/* Stats Row 2 */}
      <div className="grid-4 mb-3">
        <DashboardCard title="Approved"     value={stats.approvedComplaints || 0}   icon={<FiCheckCircle/>} color="green"  sub="Complaints"/>
        <DashboardCard title="Resolved"     value={stats.resolvedComplaints || 0}   icon={<FiCheckCircle/>} color="purple" sub="Complaints"/>
        <DashboardCard title="Pending Appt" value={stats.pendingAppointments || 0}  icon={<FiClock/>}       color="orange" sub="Appointments"/>
        <DashboardCard title="Completed"    value={stats.completedAppointments || 0} icon={<FiCalendar/>}   color="green"  sub="Appointments"/>
      </div>

      {/* Recent Tables */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Complaints</span>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead><tr><th>Resident</th><th>Subject</th><th>Status</th></tr></thead>
              <tbody>
                {recentComplaints.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontSize: '.82rem' }}>{c.resident_name}</td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', fontSize: '.88rem' }}>{c.subject}</td>
                    <td><StatusBadge status={c.status}/></td>
                  </tr>
                ))}
                {recentComplaints.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 20 }}>No recent complaints.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Appointments</span>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead><tr><th>Resident</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {recentAppointments.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontSize: '.82rem' }}>{a.resident_name}</td>
                    <td style={{ fontSize: '.85rem' }}>{a.appointment_date} {a.time_slot}</td>
                    <td><StatusBadge status={a.status}/></td>
                  </tr>
                ))}
                {recentAppointments.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 20 }}>No recent appointments.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
