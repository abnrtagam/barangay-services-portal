export function formatDate(dateString, options = {}) {
  if (!dateString) return 'N/A'

  // If MySQL returns a string like '2023-05-15 10:00:00', 
  // some browsers might struggle without the 'T' separator
  const isoString = typeof dateString === 'string' && !dateString.includes('T') 
    ? dateString.replace(' ', 'T') 
    : dateString

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'N/A'

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

