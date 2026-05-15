import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Modal } from '../components/DashboardCard'
import { FiEye, FiSearch, FiUser, FiUsers } from 'react-icons/fi'
import { formatDate } from '../utils/date'

export default function ManageResidents() {
  const [residents, setResidents] = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [search, setSearch]       = useState('')
  const token = localStorage.getItem('admin_token')

  const load = (q = '') => {
    setLoading(true)
    axios.get('/api/admin/residents', {
      headers: { Authorization: `Bearer ${token}` },
      params: q ? { search: q } : {}
    }).then(r => setResidents(r.data.data || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      {/* Premium Gradient Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)',
        padding: '32px 40px',
        borderRadius: '16px',
        marginBottom: '24px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', color: '#ffffff' }}>Manage Residents</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', letterSpacing: '0.02em' }}>View all registered residents and their records.</p>
          </div>
        </div>
      </div>
      
      {/* Filters (Elevated Card) */}
      <div className="card mb-3" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="card-body" style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--gray-600)', fontSize: '.75rem', textTransform: 'uppercase' }}>Search Residents</label>
              <input className="form-control" style={{ borderRadius: '8px', border: '1px solid var(--gray-200)', background: 'var(--gray-50)' }} placeholder="Search by name, email, or phone..." value={search}
                onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(search)}/>
            </div>
            <button className="btn btn-primary" style={{ borderRadius: '8px', fontWeight: 700, padding: '10px 24px' }} onClick={() => load(search)}><FiSearch/> Search</button>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Registered</th><th>Action</th></tr></thead>
              <tbody>
                {residents.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--gray-400)' }}>No residents found.</td></tr>
                  : residents.map((r, i) => (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--gray-400)', fontSize: '.8rem' }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-100)',
                            color: 'var(--primary-700)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.9rem', flexShrink: 0,
                          }}>{r.first_name?.[0]}{r.last_name?.[0]}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', fontSize: '.9rem' }}>{r.first_name} {r.last_name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '.85rem' }}>{r.email}</td>
                      <td style={{ fontSize: '.85rem' }}>{r.phone}</td>
                      <td style={{ fontSize: '.82rem', color: 'var(--gray-500)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.address}</td>
                      <td style={{ fontSize: '.8rem', color: 'var(--gray-400)' }}>{formatDate(r.created_at)}</td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => setSelected(r)}><FiEye/> View</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Resident Details"
        footer={<button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>}
      >
        {selected && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-100)',
                color: 'var(--primary-700)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 12px',
                fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem',
              }}>{selected.first_name?.[0]}{selected.last_name?.[0]}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>{selected.first_name} {selected.last_name}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px 16px', fontSize: '.9rem' }}>
              {[['Email', selected.email], ['Phone', selected.phone], ['Address', selected.address], ['Registered', formatDate(selected.created_at)]].map(([l, v]) => (
                <React.Fragment key={l}>
                  <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>{l}</span>
                  <span>{v}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
