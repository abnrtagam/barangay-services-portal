import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AlertMessage } from '../components/DashboardCard'
import { FiCalendar, FiCheck, FiClock, FiSend } from 'react-icons/fi'

const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM',
]

const PURPOSE_OPTIONS = [
  'Complaint Follow-up',
  'Barangay Clearance',
  'Certificate Request',
  'Mediation',
  'Community Concern',
  'Appointment with Barangay Official',
  'Other'
]

const INIT = { appointment_date: '', time_slot: '', purpose: '', custom_purpose: '', notes: '' }

export default function BookAppointment() {
  const navigate   = useNavigate()
  const [form, setForm]           = useState(INIT)
  const [takenSlots, setTakenSlots] = useState([])
  const [errors, setErrors]       = useState({})
  const [alert, setAlert]         = useState(null)
  const [loading, setLoading]     = useState(false)
  const token = localStorage.getItem('resident_token')

  // Get minimum date (tomorrow)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  // Max date (30 days ahead)
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  useEffect(() => {
    if (!form.appointment_date) return
    axios.get(`/api/appointments/taken-slots?date=${form.appointment_date}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => setTakenSlots(r.data || [])).catch(() => {})
  }, [form.appointment_date])

  const validate = () => {
    const e = {}
    if (!form.appointment_date) e.appointment_date = 'Please select a date.'
    if (!form.time_slot) e.time_slot = 'Please select a time slot.'
    if (!form.purpose) e.purpose = 'Please select a purpose of visit.'
    if (form.purpose === 'Other' && (!form.custom_purpose.trim() || form.custom_purpose.length < 5)) {
      e.custom_purpose = 'Please specify your purpose (at least 5 characters).'
    }
    return e
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value, ...(name === 'appointment_date' ? { time_slot: '' } : {}) }))
    setErrors(p => ({ ...p, [name]: '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) { setErrors(v); return }
    setLoading(true)
    try {
      // Use custom_purpose if "Other" is selected, otherwise use the selected purpose
      const finalPurpose = form.purpose === 'Other' ? form.custom_purpose : form.purpose
      const appointmentData = {
        appointment_date: form.appointment_date,
        time_slot: form.time_slot,
        purpose: finalPurpose,
        notes: form.notes
      }
      await axios.post('/api/appointments', appointmentData, { headers: { Authorization: `Bearer ${token}` } })
      setAlert({ type: 'success', message: 'Appointment booked successfully! Awaiting approval.' })
      setTimeout(() => navigate('/resident/appointments/history'), 1800)
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Booking failed.' })
    } finally {
      setLoading(false)
    }
  }

  // Disable weekends
  const isWeekend = (dateStr) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    return d.getDay() === 0 || d.getDay() === 6
  }

  const selectedIsWeekend = isWeekend(form.appointment_date)

  return (
    <div>
      {/* Premium Gradient Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)',
        padding: '32px 40px',
        borderRadius: '16px',
        marginBottom: '24px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', color: 'white' }}>Book an Appointment</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', letterSpacing: '0.02em' }}>Schedule your visit to the barangay hall.</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div className="card-header">
            <span className="card-title">Appointment Form</span>
          </div>
          <div className="card-body">
            {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label"><FiCalendar style={{ marginRight: 6, verticalAlign: 'middle' }}/>Preferred Date *</label>
                <input
                  className="form-control"
                  type="date" name="appointment_date"
                  value={form.appointment_date}
                  onChange={handleChange}
                  min={minDateStr} max={maxDateStr}
                />
                {errors.appointment_date && <div className="form-error">{errors.appointment_date}</div>}
                {selectedIsWeekend && (
                  <div className="form-error">Weekends are not available. Please select a weekday.</div>
                )}
              </div>

              {form.appointment_date && !selectedIsWeekend && (
                <div className="form-group">
                  <label className="form-label"><FiClock style={{ marginRight: 6, verticalAlign: 'middle' }}/>Time Slot *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {TIME_SLOTS.map(slot => {
                      const taken = takenSlots.includes(slot)
                      const selected = form.time_slot === slot
                      return (
                        <button
                          key={slot} type="button"
                          disabled={taken}
                          onClick={() => { setForm(p => ({ ...p, time_slot: slot })); setErrors(p => ({ ...p, time_slot: '' })) }}
                          style={{
                            padding: '9px 6px', borderRadius: 'var(--radius-md)',
                            border: selected ? '2px solid var(--primary-600)' : '1.5px solid var(--gray-200)',
                            background: taken ? 'var(--gray-100)' : selected ? 'var(--primary-50)' : 'white',
                            color: taken ? 'var(--gray-400)' : selected ? 'var(--primary-700)' : 'var(--gray-700)',
                            fontFamily: 'var(--font-heading)', fontWeight: selected ? 700 : 500,
                            fontSize: '.82rem', cursor: taken ? 'not-allowed' : 'pointer',
                            transition: 'var(--transition)',
                          }}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                  {errors.time_slot && <div className="form-error">{errors.time_slot}</div>}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Purpose of Visit *</label>
                <select
                  className="form-control" 
                  name="purpose"
                  value={form.purpose} 
                  onChange={handleChange}
                >
                  <option value="">Select purpose</option>
                  {PURPOSE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.purpose && <div className="form-error">{errors.purpose}</div>}
              </div>

              {form.purpose === 'Other' && (
                <div className="form-group">
                  <label className="form-label">Please specify your purpose *</label>
                  <input
                    className="form-control" 
                    name="custom_purpose"
                    value={form.custom_purpose} 
                    onChange={handleChange}
                    placeholder="e.g. Request for ID renewal, Business consultation..."
                  />
                  {errors.custom_purpose && <div className="form-error">{errors.custom_purpose}</div>}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Additional Notes (optional)</label>
                <textarea className="form-control" name="notes" value={form.notes} onChange={handleChange}
                  rows={3} placeholder="Any additional information for the barangay staff..."/>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading || selectedIsWeekend} style={{ flex: 1 }}>
                  <FiSend/> {loading ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Panel */}
        <div>
          <div className="card" style={{ marginBottom: 16, border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div className="card-body">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 14, fontSize: '.95rem' }}>Office Hours</h3>
              {[['Monday – Friday', '8:00 AM – 12:00 PM, 1:00 PM – 5:00 PM'], ['Saturday & Sunday', 'Closed']].map(([day, time]) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '.88rem' }}>
                  <span style={{ color: 'var(--gray-600)' }}>{day}</span>
                  <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{time}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div className="card-body">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 14, fontSize: '.95rem' }}>What to Bring</h3>
              {['Valid government ID', 'Proof of residency', 'Supporting documents (if needed)', 'Completed forms (if applicable)'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: '.88rem', color: 'var(--gray-600)' }}>
                  <FiCheck size={14} color='var(--success)' />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}