import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Modal } from '../components/DashboardCard'
import { FiEye, FiSearch, FiUser, FiUsers, FiFilter, FiMapPin } from 'react-icons/fi'
import { formatDate } from '../utils/date'

const ZONES = ['All Zones', 'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6', 'Zone 7', 'Zone 8', 'Zone 9', 'Zone 10']

export default function ManageResidents() {
  const [residents, setResidents] = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [search, setSearch]       = useState('')
  const [zone, setZone]           = useState('All Zones')
  const [zoneStats, setZoneStats] = useState([])
  
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const token = localStorage.getItem('admin_token')

  const load = (page = 1, q = search, z = zone) => {
    setLoading(true)
    axios.get('/api/admin/residents', {
      headers: { Authorization: `Bearer ${token}` },
      params: { 
        search: q,
        zone: z === 'All Zones' ? '' : z,
        page,
        limit: pagination.limit
      }
    }).then(r => {
      setResidents(r.data.data || [])
      setPagination(p => ({ ...p, page, total: r.data.total || 0 }))
    }).catch(() => {}).finally(() => setLoading(false))
  }

  const loadStats = () => {
    axios.get('/api/admin/residents/zone-stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => {
      setZoneStats(r.data.data || [])
    }).catch(() => {})
  }

  useEffect(() => { 
    load(1)
    loadStats()
  }, [])

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  const Pagination = () => {
    if (totalPages <= 1) return null
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
        <button 
          className="btn btn-secondary btn-sm" 
          disabled={pagination.page <= 1} 
          onClick={() => load(pagination.page - 1)}
          style={{ padding: '8px 16px', fontWeight: 700 }}
        >
          Previous
        </button>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
          Page <span style={{ color: '#0f172a' }}>{pagination.page}</span> of {totalPages}
        </div>
        <button 
          className="btn btn-secondary btn-sm" 
          disabled={pagination.page >= totalPages} 
          onClick={() => load(pagination.page + 1)}
          style={{ padding: '8px 16px', fontWeight: 700 }}
        >
          Next
        </button>
      </div>
    )
  }

  const handleSearch = (e) => {
    e.preventDefault()
    load(search, zone)
  }

  const handleZoneChange = (newZone) => {
    setZone(newZone)
    load(search, newZone)
  }

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
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4, color: 'rgba(255,255,255,0.8)' }}>Total Residents</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{residents.length}</div>
          </div>
        </div>
      </div>

      {/* Zone Summary Bar */}
      <div className="card mb-3" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflowX: 'auto' }}>
        <div className="card-body" style={{ padding: '16px 24px', display: 'flex', gap: 24, whiteSpace: 'nowrap' }}>
          <div style={{ fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiMapPin size={14} color="var(--primary-600)" /> Zone Summary:
          </div>
          {zoneStats.length === 0 ? (
            <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>No zone data available.</span>
          ) : zoneStats.map(s => (
            <div key={s.zone} style={{ fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--gray-700)' }}>{s.zone}:</span> <span style={{ color: 'var(--primary-600)', fontWeight: 800 }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Filters (Elevated Card) */}
      <div className="card mb-3" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="card-body" style={{ padding: '18px 24px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--gray-600)', fontSize: '.75rem', textTransform: 'uppercase' }}>Search Residents</label>
              <div style={{ position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: 12, top: 11, color: 'var(--gray-400)' }} />
                <input 
                  className="form-control" 
                  style={{ borderRadius: '8px', border: '1px solid var(--gray-200)', background: 'var(--gray-50)', paddingLeft: 36 }} 
                  placeholder="Search by name, email, or phone..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
            </div>
            <div className="form-group" style={{ width: 200, marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--gray-600)', fontSize: '.75rem', textTransform: 'uppercase' }}>Zone Filter</label>
              <div style={{ position: 'relative' }}>
                <select 
                  className="form-select" 
                  style={{ 
                    borderRadius: '8px', 
                    border: '1px solid var(--gray-200)', 
                    background: 'var(--gray-50)',
                    padding: '10px 16px',
                    fontSize: '0.9rem',
                    height: '42px'
                  }}
                  value={zone}
                  onChange={e => handleZoneChange(e.target.value)}
                >



                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px', fontWeight: 700, padding: '10px 24px' }}>Search</button>
          </form>
        </div>
      </div>
      
      <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? <div className="spinner-wrap" style={{ padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }}/></div> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Zone</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {residents.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--gray-400)' }}>No residents found.</td></tr>
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
                      <td>
                        <span style={{ 
                          padding: '4px 10px', background: 'var(--gray-100)', borderRadius: 6, 
                          fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-700)' 
                        }}>
                          {r.zone || 'Unset'}
                        </span>
                      </td>
                      <td style={{ fontSize: '.85rem' }}>{r.email}</td>
                      <td style={{ fontSize: '.85rem' }}>{r.phone}</td>
                      <td style={{ fontSize: '.82rem', color: 'var(--gray-500)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.address}</td>
                      <td style={{ fontSize: '.8rem', color: 'var(--gray-400)' }}>{formatDate(r.created_at)}</td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => setSelected(r)}><FiEye/> View</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination />
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
              <div style={{ marginTop: 8 }}>
                <span style={{ padding: '4px 12px', background: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800 }}>
                  {selected.zone || 'No Zone Assigned'}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px 16px', fontSize: '.9rem' }}>
              {[['Email', selected.email], ['Phone', selected.phone], ['Zone', selected.zone || 'Unset'], ['Address', selected.address], ['Registered', formatDate(selected.created_at)]].map(([l, v]) => (
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
