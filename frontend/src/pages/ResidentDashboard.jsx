import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { DashboardCard, StatusBadge, AlertMessage } from '../components/DashboardCard'
import { FiAlertCircle, FiCalendar, FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi'

const parseLocalStorageJSON = value => {
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

const toArray = value => Array.isArray(value) ? value : []

export default function ResidentDashboard() {
  const navigate = useNavigate()
  const [stats, setStats]  = useState({ totalComplaints: 0, pendingComplaints: 0, totalAppointments: 0, upcomingAppointments: 0 })
  const [complaints, setComplaints] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = parseLocalStorageJSON(localStorage.getItem('resident_user') || '{}')

  useEffect(() => {
    const token = localStorage.getItem('resident_token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      axios.get('/api/residents/dashboard-stats', { headers }),
      axios.get('/api/residents/complaints?limit=5', { headers }),
      axios.get('/api/residents/appointments?limit=5', { headers }),
    ]).then(([s, c, a]) => {
      setStats(s.data || {})
      setComplaints(toArray(c.data?.data ?? c.data))
      setAppointments(toArray(a.data?.data ?? a.data))
    }).catch(err => {
      const status = err.response?.status
      if (status === 401 || status === 419) {
        localStorage.removeItem('resident_token')
        localStorage.removeItem('resident_user')
        navigate('/login', { replace: true })
        return
      }
      setError(err.response?.data?.message || 'Unable to load dashboard data.')
    }).finally(() => setLoading(false))
  }, [navigate])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', border: '5px solid var(--primary-200)', borderTopColor: 'var(--primary-700)', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div>
      {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-700), var(--primary-500))',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px', marginBottom: 28,
        color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6 }}>
            Welcome back, {user.first_name || 'Resident'}! 👋
          </h1>
          <p style={{ color: 'var(--primary-100)', fontSize: '.95rem' }}>Here's an overview of your barangay service requests.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <Link to="/resident/complaints/submit" className="btn btn-sm" style={{ background: 'white', color: 'var(--primary-700)' }}>
            File Complaint
          </Link>
          <Link to="/resident/appointments/book" className="btn btn-sm" style={{ background: 'rgba(255,255,255,.15)', color: 'white', border: '1.5px solid rgba(255,255,255,.3)' }}>
            Book Appointment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-3">
        <DashboardCard title="Total Complaints"      value={stats.totalComplaints}      icon={<FiAlertCircle/>} color="blue" />
        <DashboardCard title="Pending Complaints"    value={stats.pendingComplaints}    icon={<FiClock/>}       color="orange" />
        <DashboardCard title="Total Appointments"    value={stats.totalAppointments}    icon={<FiCalendar/>}    color="purple" />
        <DashboardCard title="Upcoming Appointments" value={stats.upcomingAppointments} icon={<FiCheckCircle/>} color="green" />
      </div>

      {/* Recent */}
      <div className="grid-2">
        {/* Recent Complaints */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Complaints</span>
            <Link to="/resident/complaints/history" className="btn btn-secondary btn-sm">View All <FiArrowRight/></Link>
          </div>
          <div>
            {complaints.length === 0
              ? <div className="empty-state"><p>No complaints filed yet.</p></div>
              : complaints.map(c => (
                <div key={c.id} style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--gray-100)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '.9rem', marginBottom: 2 }}>{c.subject}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--gray-400)' }}>{c.category_name || c.category?.name || 'Unknown category'} · {new Date(c.created_at).toLocaleDateString()}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Appointments</span>
            <Link to="/resident/appointments/history" className="btn btn-secondary btn-sm">View All <FiArrowRight/></Link>
          </div>
          <div>
            {appointments.length === 0
              ? <div className="empty-state"><p>No appointments booked yet.</p></div>
              : appointments.map(a => (
                <div key={a.id} style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--gray-100)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '.9rem', marginBottom: 2 }}>{a.purpose}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--gray-400)' }}>{a.appointment_date} · {a.time_slot}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
          </div>
        </div>
      </div>

    </div>
  )
}
