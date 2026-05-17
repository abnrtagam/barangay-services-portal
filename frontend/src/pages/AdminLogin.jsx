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
      background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative background blobs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 80, height: 80,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          }}>
            <img src="/logo.png" alt="Barangay Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2.2rem', marginBottom: 8, color: 'white', letterSpacing: '-0.02em' }}>Admin Portal</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>Authorized personnel login for Barangay Bulua</p>
        </div>

        <div style={{ background: '#1e293b', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #334155' }}>
          {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#e2e8f0', letterSpacing: '0.05em', marginBottom: 10 }}>Admin Email</label>
              <input name="email" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="admin@bulua.gov.ph" autoFocus 
                     style={{ width: '100%', borderRadius: '12px', padding: '14px 18px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '1rem' }} />
            </div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#e2e8f0', letterSpacing: '0.05em', margin: 0 }}>Password</label>
                <Link to="/admin/forgot-password" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#60a5fa', textDecoration: 'none' }}>Forgot Password?</Link>
              </div>
              <input name="password" type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} placeholder="••••••••"
                     style={{ width: '100%', borderRadius: '12px', padding: '14px 18px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '1rem' }} />
            </div>
            <button disabled={loading} style={{ width: '100%', borderRadius: '12px', padding: '16px', fontSize: '1.05rem', fontWeight: 800, background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)' }}>
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Resident Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
