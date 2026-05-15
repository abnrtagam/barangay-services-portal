import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { DashboardCard, StatusBadge, AlertMessage } from '../components/DashboardCard'
import { FiAlertCircle, FiCalendar, FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import { formatDate } from '../utils/date'

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
      {/* Premium Gradient Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)',
        padding: '32px 40px',
        borderRadius: '16px',
        marginBottom: '28px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', marginBottom: 8, color: 'white' }}>
            Welcome back, {user.first_name || 'Resident'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '.95rem', letterSpacing: '0.02em', margin: 0 }}>Here is your current barangay service overview.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          <Link to="/resident/complaints/submit" className="btn btn-primary" style={{ background: 'white', color: 'var(--primary-700)', border: 'none', fontWeight: 700, borderRadius: '8px', padding: '12px 24px' }}>
            File Complaint
          </Link>
          <Link to="/resident/appointments/book" className="btn" style={{ background: 'rgba(255,255,255,.15)', color: 'white', border: 'none', fontWeight: 700, borderRadius: '8px', padding: '12px 24px' }}>
            Book Appointment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-3">
        <DashboardCard title="Total Complaints"      value={stats.totalComplaints}      icon={<FiAlertCircle/>} color="blue" />
        <DashboardCard title="Pending Complaints"    value={stats.pendingComplaints}    icon={<FiClock/>}       color="warning" />
        <DashboardCard title="Total Appointments"    value={stats.totalAppointments}    icon={<FiCalendar/>}    color="info" />
        <DashboardCard title="Upcoming Appointments" value={stats.upcomingAppointments} icon={<FiCheckCircle/>} color="success" />
      </div>

      {/* Recent Activity (Elevated Cards) */}
      <div className="grid-2">
        {/* Recent Complaints */}
        <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
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
                    <div style={{ fontSize: '.78rem', color: 'var(--gray-400)' }}>{c.category_name || c.category?.name || 'Unknown category'} · {formatDate(c.created_at)}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
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
