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
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative background blobs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '20px', 
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
          }}>
            <img src="/logo.png" alt="Barangay Logo" style={{ width: 50, height: 50, objectFit: 'contain' }} 
                 onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" style={{ display: 'none' }}>
               <path d="M16 4L4 11v2h24v-2L16 4zM6 14v10h4V14H6zm8 0v10h4V14h-4zm8 0v10h4V14h-4zM4 26h24v2H4v-2z" fill="white"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2.2rem', marginBottom: 8, color: '#0f172a', letterSpacing: '-0.02em' }}>Admin Portal</h1>
          <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>Authorized personnel login for Barangay Bulua</p>
        </div>

        <div className="card" style={{ border: 'none', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '12px' }}>
          <div className="card-body" style={{ padding: '32px' }}>
            {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: 10 }}>Admin Email</label>
                <input className="form-control" name="email" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="admin@bulua.gov.ph" autoFocus 
                       style={{ borderRadius: '12px', padding: '14px 18px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 32 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: 10 }}>Password</label>
                <input className="form-control" name="password" type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} placeholder="••••••••"
                       style={{ borderRadius: '12px', padding: '14px 18px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }} />
              </div>
              <button className="btn btn-primary w-full" disabled={loading} style={{ borderRadius: '12px', padding: '16px', fontSize: '1.05rem', fontWeight: 700, background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', border: 'none', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)' }}>
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <Link to="/login" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to Resident Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
