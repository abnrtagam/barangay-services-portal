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

  const admin = JSON.parse(localStorage.getItem('admin_user') || '{}')

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.15"/>
            <path d="M16 4L4 11v2h24v-2L16 4zM6 14v10h4V14H6zm8 0v10h4V14h-4zm8 0v10h4V14h-4zM4 26h24v2H4v-2z" fill="white"/>
          </svg>
        </div>
        <div>
          <div className="brand-title">Barangay</div>
          <div className="brand-sub">Admin Portal</div>
        </div>
      </div>

      <div className="sidebar-admin-info">
        <div className="admin-avatar">{admin.name?.[0] || 'A'}</div>
        <div>
          <div className="admin-name">{admin.name || 'Administrator'}</div>
          <div className="admin-role">System Admin</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link logout-btn" onClick={handleLogout}>
          <span className="link-icon"><FiLogOut /></span>
          <span>Logout</span>
        </button>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-w); height: 100vh;
          background: linear-gradient(180deg, var(--primary-900) 0%, var(--primary-800) 100%);
          display: flex; flex-direction: column; flex-shrink: 0;
          position: sticky; top: 0; overflow-y: auto;
          box-shadow: 2px 0 12px rgba(0,0,0,.15);
        }
        .sidebar-brand {
          display: flex; align-items: center; gap: 12px;
          padding: 24px 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }
        .brand-title { font-family: var(--font-heading); font-weight: 800; font-size: 1.1rem; color: white; }
        .brand-sub   { font-size: .7rem; color: var(--primary-300); letter-spacing: .04em; }
        .sidebar-admin-info {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .admin-avatar {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,.15); color: white;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-heading); font-weight: 700; font-size: 1.1rem;
        }
        .admin-name { font-family: var(--font-heading); font-weight: 600; font-size: .9rem; color: white; }
        .admin-role { font-size: .72rem; color: var(--primary-300); }
        .sidebar-nav { flex: 1; padding: 16px 12px; }
        .nav-section-label {
          font-size: .68rem; letter-spacing: .08em; text-transform: uppercase;
          color: var(--primary-400); font-family: var(--font-heading); font-weight: 700;
          padding: 0 10px 10px;
        }
        .sidebar-link {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 12px; border-radius: var(--radius-md);
          font-family: var(--font-heading); font-weight: 600; font-size: .9rem;
          color: var(--primary-200); cursor: pointer; border: none;
          background: none; width: 100%; text-align: left;
          transition: var(--transition); margin-bottom: 2px;
        }
        .sidebar-link:hover { background: rgba(255,255,255,.1); color: white; }
        .sidebar-link.active { background: rgba(255,255,255,.15); color: white; }
        .sidebar-link.active .link-icon { color: var(--primary-300); }
        .link-icon { display: flex; align-items: center; font-size: 1.05rem; }
        .sidebar-footer {
          padding: 12px; border-top: 1px solid rgba(255,255,255,.1);
        }
        .logout-btn { color: #fca5a5 !important; }
        .logout-btn:hover { background: rgba(239,68,68,.15) !important; }
      `}</style>
    </aside>
  )
}
