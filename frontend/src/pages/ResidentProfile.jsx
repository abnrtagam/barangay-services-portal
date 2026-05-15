import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiShield, 
  FiFileText, FiCamera, FiEdit2, FiCheckCircle, FiSave, FiX, FiLock, FiEye, FiEyeOff
} from 'react-icons/fi'

export default function ResidentProfile() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('info')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false })
  
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  })

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = () => {
    try {
      const storedUser = localStorage.getItem('resident_user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        setForm({
          first_name: parsed.first_name || '',
          last_name: parsed.last_name || '',
          phone: parsed.phone || '',
          address: parsed.address || ''
        })
      }
    } catch (err) {
      console.error("Error parsing user data", err)
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || ''
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('resident_token')
      const res = await axios.patch('/api/residents/profile', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const updatedUser = res.data.user
      setUser(updatedUser)
      localStorage.setItem('resident_user', JSON.stringify(updatedUser))
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      return toast.error('New passwords do not match.')
    }
    if (securityForm.newPassword.length < 5) {
      return toast.error('Password must be at least 5 characters.')
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('resident_token')
      await axios.post('/api/residents/change-password', securityForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Password changed successfully!')
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div style={{ padding: '100px 24px', textAlign: 'center', color: 'var(--gray-500)' }}>
        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
        <p>Loading your profile...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <div className="card" style={{ 
        border: 'none', borderRadius: 24, overflow: 'hidden', marginBottom: 28,
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)', background: 'white'
      }}>
        <div style={{ 
          height: 140, 
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          position: 'relative'
        }}>
          <div style={{ 
            position: 'absolute', right: -20, top: -20, width: 150, height: 150, 
            borderRadius: '50%', background: 'rgba(255,255,255,0.1)' 
          }} />
        </div>
        <div style={{ padding: '0 40px 32px', marginTop: -50, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: 120, height: 120, borderRadius: 32, background: 'white', 
                padding: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' 
              }}>
                <div style={{ 
                  width: '100%', height: '100%', borderRadius: 26, 
                  background: 'var(--primary-100)', color: 'var(--primary-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)'
                }}>
                  {user.first_name?.[0] || 'R'}
                </div>
              </div>
              <button style={{
                position: 'absolute', bottom: -5, right: -5, width: 36, height: 36,
                borderRadius: '12px', background: 'white', border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--primary-600)',
                cursor: 'pointer'
              }}>
                <FiCamera size={18} />
              </button>
            </div>
            <div style={{ flex: 1, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                  {user.first_name} {user.last_name}
                </h1>
                <div style={{ 
                  background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a',
                  padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', 
                  fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4
                }}>
                  <FiCheckCircle size={12} /> Verified Resident
                </div>
              </div>
              <p style={{ margin: '4px 0 0', color: 'var(--gray-500)', fontWeight: 500 }}>
                {user.email}
              </p>
            </div>
            <div style={{ marginBottom: 8 }}>
              {activeTab === 'info' && (!isEditing ? (
                <button onClick={handleEditToggle} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12 }}>
                  <FiEdit2 size={16} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleSave} disabled={loading} className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12 }}>
                    <FiSave size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={handleEditToggle} disabled={loading} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12 }}>
                    <FiX size={16} /> Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Navigation Tabs */}
        <div className="card" style={{ padding: 12, borderRadius: 20, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', background: 'white' }}>
          <button 
            onClick={() => { setActiveTab('info'); setIsEditing(false); }}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none',
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              background: activeTab === 'info' ? 'var(--primary-50)' : 'transparent',
              color: activeTab === 'info' ? 'var(--primary-700)' : 'var(--gray-600)',
              fontWeight: 600, transition: 'all 0.2s', textAlign: 'left'
            }}
          >
            <FiUser size={18} /> Account Info
          </button>
          <button 
            onClick={() => { setActiveTab('docs'); setIsEditing(false); }}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none',
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              background: activeTab === 'docs' ? 'var(--primary-50)' : 'transparent',
              color: activeTab === 'docs' ? 'var(--primary-700)' : 'var(--gray-600)',
              fontWeight: 600, transition: 'all 0.2s', textAlign: 'left', marginTop: 4
            }}
          >
            <FiFileText size={18} /> My Documents
          </button>
          <button 
            onClick={() => { setActiveTab('security'); setIsEditing(false); }}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none',
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              background: activeTab === 'security' ? 'var(--primary-50)' : 'transparent',
              color: activeTab === 'security' ? 'var(--primary-700)' : 'var(--gray-600)',
              fontWeight: 600, transition: 'all 0.2s', textAlign: 'left', marginTop: 4
            }}
          >
            <FiShield size={18} /> Security
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'info' && (
            <div className="card" style={{ padding: 32, borderRadius: 20, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', background: 'white' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 24, color: 'var(--gray-900)' }}>Personal Information</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>First Name</label>
                  {!isEditing ? (
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)' }}>
                      {user.first_name}
                    </div>
                  ) : (
                    <input 
                      className="form-control"
                      value={form.first_name}
                      onChange={(e) => setForm({...form, first_name: e.target.value})}
                      style={{ borderRadius: 12 }}
                    />
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Last Name</label>
                  {!isEditing ? (
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)' }}>
                      {user.last_name}
                    </div>
                  ) : (
                    <input 
                      className="form-control"
                      value={form.last_name}
                      onChange={(e) => setForm({...form, last_name: e.target.value})}
                      style={{ borderRadius: 12 }}
                    />
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Email Address</label>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-400)', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiMail size={16} color="var(--gray-400)" /> {user.email}
                  </div>
                  {isEditing && <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 4 }}>Email cannot be changed.</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Phone Number</label>
                  {!isEditing ? (
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FiPhone size={16} color="var(--gray-400)" /> {user.phone}
                    </div>
                  ) : (
                    <input 
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => setForm({...form, phone: e.target.value})}
                      style={{ borderRadius: 12 }}
                    />
                  )}
                </div>
              </div>

              <div style={{ marginTop: 32 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Home Address</label>
                {!isEditing ? (
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', padding: '16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <FiMapPin size={16} color="var(--gray-400)" style={{ marginTop: 3 }} /> {user.address}
                  </div>
                ) : (
                  <textarea 
                    className="form-control"
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    style={{ borderRadius: 12, minHeight: 100 }}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="card" style={{ padding: 32, borderRadius: 20, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', background: 'white' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, color: 'var(--gray-900)' }}>Verification Documents</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: 24 }}>Official documents submitted for residency verification.</p>
              
              <div style={{ 
                padding: '40px', background: 'var(--gray-50)', borderRadius: 16, 
                border: '1px dashed var(--gray-300)', textAlign: 'center' 
              }}>
                <FiFileText size={48} color="var(--gray-300)" style={{ marginBottom: 16 }} />
                <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
                  Your documents are securely stored and verified by the barangay administration.
                </p>
                <button className="btn btn-secondary mt-3" style={{ borderRadius: 10 }}>
                  Request Document Update
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card" style={{ padding: 32, borderRadius: 20, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', background: 'white' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 24, color: 'var(--gray-900)' }}>Security Settings</h2>
              
              <form onSubmit={handleChangePassword} style={{ maxWidth: '450px' }}>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <FiLock style={{ position: 'absolute', left: 14, top: 13, color: 'var(--gray-400)' }} />
                    <input 
                      type={showPass.current ? "text" : "password"}
                      className="form-control"
                      placeholder="••••••••"
                      style={{ paddingLeft: 40, borderRadius: 12 }}
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass({...showPass, current: !showPass.current})}
                      style={{ position: 'absolute', right: 14, top: 13, background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}
                    >
                      {showPass.current ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <FiLock style={{ position: 'absolute', left: 14, top: 13, color: 'var(--gray-400)' }} />
                    <input 
                      type={showPass.new ? "text" : "password"}
                      className="form-control"
                      placeholder="••••••••"
                      style={{ paddingLeft: 40, borderRadius: 12 }}
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass({...showPass, new: !showPass.new})}
                      style={{ position: 'absolute', right: 14, top: 13, background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}
                    >
                      {showPass.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 32 }}>
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <FiLock style={{ position: 'absolute', left: 14, top: 13, color: 'var(--gray-400)' }} />
                    <input 
                      type={showPass.confirm ? "text" : "password"}
                      className="form-control"
                      placeholder="••••••••"
                      style={{ paddingLeft: 40, borderRadius: 12 }}
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}
                      style={{ position: 'absolute', right: 14, top: 13, background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}
                    >
                      {showPass.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700 }}
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
