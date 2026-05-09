import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { AlertMessage } from '../components/DashboardCard'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/admin-login', form)
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user', JSON.stringify(data.user))
      navigate('/admin/dashboard')
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Invalid admin credentials.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-700) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28, color: 'white' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            border: '1.5px solid rgba(255,255,255,.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L4 11v2h24v-2L16 4zM6 14v10h4V14H6zm8 0v10h4V14h-4zm8 0v10h4V14h-4zM4 26h24v2H4v-2z" fill="white"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6 }}>Admin Portal</h1>
          <p style={{ color: 'var(--primary-200)', fontSize: '.9rem' }}>Authorized personnel only</p>
        </div>

        <div className="card">
          <div className="card-body">
            {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <input className="form-control" name="email" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="admin@barangay.gov.ph" autoFocus/>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-control" name="password" type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} placeholder="••••••••"/>
              </div>
              <button className="btn btn-primary w-full mt-2" disabled={loading}>
                {loading ? 'Authenticating...' : 'Admin Sign In'}
              </button>
            </form>
            <p className="text-center mt-3 text-sm text-muted">
              <Link to="/login">← Back to Resident Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
