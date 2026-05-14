import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AlertMessage } from '../components/DashboardCard'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('request') // 'request' or 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  // Step 1: Request Password Reset OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setAlert({ type: 'error', message: 'Email is required.' })
      return
    }

    if (!email.includes('@')) {
      setAlert({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email })
      setAlert({ 
        type: 'success', 
        message: 'Check your email for the password reset code. It will expire in 15 minutes.' 
      })
      setStep('reset')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send reset code.'
      setAlert({ type: 'error', message: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!otp || !newPassword || !confirmPassword) {
      setAlert({ type: 'error', message: 'All fields are required.' })
      return
    }

    if (otp.length !== 6) {
      setAlert({ type: 'error', message: 'Reset code must be 6 digits.' })
      return
    }

    if (newPassword.length < 5) {
      setAlert({ type: 'error', message: 'Password must be at least 5 characters.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword
      })
      setAlert({ type: 'success', message: data.message })
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Password reset failed.'
      setAlert({ type: 'error', message: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  // Request OTP form
  if (step === 'request') {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--primary-50)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: 'var(--primary-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2a10 10 0 0 1 10 10M12 2a10 10 0 0 0-10 10M12 2v10m0 0l-3-3m3 3l3-3M12 12v8"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6 }}>Reset Password</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '.9rem' }}>Enter your email to receive a reset code</p>
          </div>

          <div className="card">
            <div className="card-body">
              {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}
              
              <form onSubmit={handleRequestOTP}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input 
                    className="form-control" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="juan@email.com"
                    autoFocus
                  />
                </div>

                <button 
                  className="btn btn-primary w-full mt-4" 
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>

              <div style={{ 
                background: 'var(--primary-50)', 
                padding: 12, 
                borderRadius: 8, 
                marginTop: 16,
                fontSize: '13px',
                color: 'var(--gray-600)',
                lineHeight: '1.5'
              }}>
                <strong>💡 Tip:</strong> We'll send a 6-digit code to your email. Check your spam folder if you don't see it.
              </div>

              <p className="text-center mt-4 text-sm text-muted">
                Remember your password? <Link to="/login" style={{ color: 'var(--primary-600)' }}>Sign in instead</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--primary-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'var(--primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2a10 10 0 0 1 10 10M12 2a10 10 0 0 0-10 10M12 2v10m0 0l-3-3m3 3l3-3M12 12v8"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6 }}>Create New Password</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '.9rem' }}>Enter the code and your new password</p>
        </div>

        <div className="card">
          <div className="card-body">
            {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}
            
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">Reset Code *</label>
                <input 
                  className="form-control" 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                  placeholder="000000"
                  maxLength="6"
                  autoFocus
                  style={{ fontSize: '18px', letterSpacing: '8px', textAlign: 'center' }}
                />
                <small style={{ color: 'var(--gray-500)', marginTop: 4, display: 'block' }}>
                  6-digit code from your email
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input 
                  className="form-control" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="••••••••"
                />
                <small style={{ color: 'var(--gray-500)', marginTop: 4, display: 'block' }}>
                  Min. 5 characters
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input 
                  className="form-control" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••"
                />
              </div>

              <button 
                className="btn btn-primary w-full mt-4" 
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div style={{ 
              background: 'var(--warning-50)', 
              padding: 12, 
              borderRadius: 8, 
              marginTop: 16,
              fontSize: '13px',
              color: 'var(--warning-900)',
              lineHeight: '1.5',
              borderLeft: '3px solid var(--warning-500)'
            }}>
              <strong>⚠️ Important:</strong> Use a strong, unique password. Never share your reset code with anyone.
            </div>

            <p className="text-center mt-4 text-sm text-muted">
              <button 
                type="button"
                onClick={() => {
                  setStep('request')
                  setOtp('')
                  setNewPassword('')
                  setConfirmPassword('')
                  setAlert(null)
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ← Use a different email
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
