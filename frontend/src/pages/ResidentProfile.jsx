import React, { useState, useEffect } from 'react'
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiShield, 
  FiFileText, FiCamera, FiEdit2, FiCheckCircle 
} from 'react-icons/fi'

export default function ResidentProfile() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('resident_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (err) {
      console.error("Error parsing user data", err)
    }
  }, [])

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
              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12 }}>
                <FiEdit2 size={16} /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Navigation Tabs */}
        <div className="card" style={{ padding: 12, borderRadius: 20, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', background: 'white' }}>
          <button 
            onClick={() => setActiveTab('info')}
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
            onClick={() => setActiveTab('docs')}
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
            onClick={() => setActiveTab('security')}
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
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)' }}>
                    {user.first_name}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Last Name</label>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)' }}>
                    {user.last_name}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Email Address</label>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiMail size={16} color="var(--gray-400)" /> {user.email}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Phone Number</label>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiPhone size={16} color="var(--gray-400)" /> {user.phone}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 32 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Home Address</label>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)', padding: '16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <FiMapPin size={16} color="var(--gray-400)" style={{ marginTop: 3 }} /> {user.address}
                </div>
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
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: 20, background: 'var(--gray-50)', borderRadius: 16, border: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-600)' }}>
                      <FiLock size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>Change Password</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Update your account password regularly</div>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-secondary" style={{ borderRadius: 8 }}>Update</button>
                </div>

                <div style={{ padding: 20, background: 'var(--gray-50)', borderRadius: 16, border: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-600)' }}>
                      <FiShield size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>Two-Factor Authentication</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Add an extra layer of security</div>
                    </div>
                  </div>
                  <div style={{ 
                    background: 'var(--gray-200)', width: 40, height: 20, borderRadius: 20,
                    position: 'relative', cursor: 'pointer'
                  }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'white', position: 'absolute', left: 3, top: 3 }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
