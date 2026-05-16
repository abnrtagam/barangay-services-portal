import React, { useState } from 'react'
import axios from 'axios'
import { AlertMessage } from '../components/DashboardCard'
import { FiUser, FiLock, FiShield, FiCheck } from 'react-icons/fi'

export default function AdminProfile() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('admin_token')

  const getAdmin = () => {
    try {
      const data = localStorage.getItem('admin_user')
      if (!data || data === 'undefined') return {}
      return JSON.parse(data)
    } catch { return {} }
  }
  const admin = getAdmin()

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setAlert(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setAlert(null)

    if (!form.current_password || !form.new_password) {
      return setAlert({ type: 'error', message: 'All fields are required.' })
    }
    if (form.new_password.length < 8) {
      return setAlert({ type: 'error', message: 'New password must be at least 8 characters.' })
    }
    if (form.new_password !== form.confirm_password) {
      return setAlert({ type: 'error', message: 'New passwords do not match.' })
    }

    setLoading(true)
    try {
      await axios.patch('/api/admin/profile/password', {
        current_password: form.current_password,
        new_password: form.new_password
      }, { headers: { Authorization: `Bearer ${token}` } })
      setAlert({ type: 'success', message: 'Password changed successfully!' })
      setForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to change password.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Premium Gradient Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)',
        padding: '32px 40px', borderRadius: '16px', marginBottom: '24px',
        color: 'white', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', color: '#ffffff' }}>Admin Profile</h1>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>Manage your account settings and security.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Profile Info */}
        <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div className="card-header">
            <span className="card-title"><FiUser style={{ marginRight: 8 }} />Account Information</span>
          </div>
          <div className="card-body">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-100)',
                color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem',
              }}>
                {admin.first_name?.[0]}{admin.last_name?.[0]}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>
                {admin.first_name} {admin.last_name}
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ padding: '4px 14px', background: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  Administrator
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px 16px', fontSize: '.9rem' }}>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Email</span>
              <span>{admin.email || '—'}</span>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Phone</span>
              <span>{admin.phone || '—'}</span>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Role</span>
              <span style={{ textTransform: 'capitalize' }}>{admin.role || 'admin'}</span>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div className="card-header">
            <span className="card-title"><FiLock style={{ marginRight: 8 }} />Change Password</span>
          </div>
          <div className="card-body">
            {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <input className="form-control" type="password" name="current_password" value={form.current_password} onChange={handleChange} placeholder="Enter your current password" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input className="form-control" type="password" name="new_password" value={form.new_password} onChange={handleChange} placeholder="Minimum 8 characters" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input className="form-control" type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} placeholder="Re-enter new password" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                <FiCheck /> {loading ? 'Changing...' : 'Update Password'}
              </button>
            </form>

            <div style={{
              display: 'flex', alignItems: 'start', gap: '10px', padding: '12px',
              background: 'var(--info-50)', borderRadius: '8px', border: '1px solid var(--info-200)',
              color: 'var(--info-700)', fontSize: '0.78rem', lineHeight: 1.4, marginTop: 16
            }}>
              <FiShield size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>
                <strong>Security:</strong> Your password is encrypted with bcrypt before storage. 
                We recommend using a unique, strong password that you don't use elsewhere.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
