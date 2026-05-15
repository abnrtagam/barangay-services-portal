import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FiGrid, FiAlertCircle, FiCalendar, FiUsers,
  FiBell, FiFileText, FiLogOut, FiSettings
} from 'react-icons/fi'

const NAV = [
  { label: 'Dashboard',     icon: <FiGrid />,        to: '/admin/dashboard' },
  { label: 'Verifications', icon: <FiFileText />,    to: '/admin/verifications' },
  { label: 'Complaints',    icon: <FiAlertCircle />, to: '/admin/complaints' },
  { label: 'Appointments',  icon: <FiCalendar />,    to: '/admin/appointments' },
  { label: 'Residents',     icon: <FiUsers />,       to: '/admin/residents' },
  { label: 'Announcements', icon: <FiBell />,        to: '/admin/announcements' },
  { label: 'Reports',       icon: <FiFileText />,    to: '/admin/reports' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    navigate('/admin/login')
  }

  const getAdminUser = () => {
    try {
      const data = localStorage.getItem('admin_user')
      if (!data || data === 'undefined') return {}
      return JSON.parse(data)
    } catch (e) {
      return {}
    }
  }
  const admin = getAdminUser()

  return (
    <aside style={{
      width: 'var(--sidebar-w)', height: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'sticky', top: 0, overflowY: 'auto',
      boxShadow: '4px 0 24px rgba(0,0,0,.15)',
      zIndex: 100
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '32px 24px 24px',
        borderBottom: '1px solid rgba(255,255,255,.05)'
      }}>
        <div style={{ overflow: 'hidden', borderRadius: '50%', width: 44, height: 44, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="Barangay Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.15rem', color: 'white', letterSpacing: '-0.01em' }}>Barangay Bulua</div>
          <div style={{ fontSize: '.72rem', color: '#94a3b8', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: '2px' }}>Admin Portal</div>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.05)'
      }}>
        <div style={{
          width: 40, height: 40, border_radius: '12px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem',
          boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)',
          borderRadius: '12px'
        }}>
          {admin.name?.[0] || 'A'}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '.9rem', color: 'white' }}>{admin.name || 'Administrator'}</div>
          <div style={{ fontSize: '.72rem', color: '#64748b' }}>System Admin</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '24px 16px' }}>
        <div style={{
          fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase',
          color: '#475569', fontFamily: 'var(--font-heading)', fontWeight: 800,
          padding: '0 12px 14px'
        }}>Main Menu</div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px',
              fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.92rem',
              color: isActive ? 'white' : '#94a3b8', cursor: 'pointer', border: 'none',
              background: isActive ? '#2563eb' : 'transparent', width: '100%', textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: '6px',
              boxShadow: isActive ? '0 8px 20px rgba(37, 99, 235, 0.25)' : 'none'
            })}
          >
            <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <button 
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '12px',
            fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.92rem',
            color: '#f87171', cursor: 'pointer', border: 'none',
            background: 'none', width: '100%', textAlign: 'left',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem' }}><FiLogOut /></span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
