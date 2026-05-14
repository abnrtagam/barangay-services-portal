import React from 'react'
import { FiCheckCircle, FiClock } from 'react-icons/fi'
import { formatDate } from '../utils/date'

export default function StatusTimeline({ history }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-400)' }}>
        No status history available
      </div>
    )
  }

  const finalSuccessStatuses = ['Resolved', 'Completed']

  // Build timeline steps from actual history records
  const steps = history.map((h, idx) => {
    const isLast = idx === history.length - 1
    const isFinalSuccess = finalSuccessStatuses.includes(h.new_status)

    return {
      id: h.id,
      status: h.new_status,
      oldStatus: h.old_status,
      timestamp: h.changed_at,
      notes: h.notes,
      stepStatus: isLast && !isFinalSuccess ? 'current' : 'completed',
    }
  })

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'var(--success-100)', border: 'var(--success-500)', text: 'var(--success-700)', icon: 'var(--success-500)' }
      case 'current':
        return { bg: 'var(--primary-100)', border: 'var(--primary-500)', text: 'var(--primary-700)', icon: 'var(--primary-500)' }
      default:
        return { bg: 'var(--gray-100)', border: 'var(--gray-300)', text: 'var(--gray-500)', icon: 'var(--gray-400)' }
    }
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
        {/* Vertical line connecting all steps */}
        <div
          style={{
            position: 'absolute',
            left: '19px',
            top: '40px',
            bottom: '0',
            width: '2px',
            background: 'var(--gray-200)',
          }}
        />

        {/* Timeline steps */}
        {steps.map((step, idx) => {
          const colors = getStepColor(step.stepStatus)

          return (
            <div key={step.id} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
              {/* Circle indicator */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  borderRadius: '50%',
                  background: colors.bg,
                  border: `2px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.icon,
                  fontSize: '1.2rem',
                }}
              >
                {step.stepStatus === 'completed' ? (
                  <FiCheckCircle size={20} />
                ) : (
                  <FiClock size={20} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: '4px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: colors.text,
                    marginBottom: '4px',
                  }}
                >
                  {step.status}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                  {formatDate(step.timestamp, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {step.notes && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '10px 12px',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      color: 'var(--gray-700)',
                      borderLeft: `3px solid ${colors.border}`,
                    }}
                  >
                    {step.notes}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
