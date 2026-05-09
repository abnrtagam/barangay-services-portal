import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
    console.error('React error boundary caught:', error, errorInfo)
    localStorage.setItem('latestReactError', JSON.stringify({
      message: error?.message ?? 'Unknown error',
      stack: error?.stack ?? '',
      info: errorInfo?.componentStack ?? '',
      time: new Date().toISOString(),
    }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', padding: 32, background: '#f8fafc', color: '#111827' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>Something went wrong</h1>
          <p style={{ marginBottom: 24 }}>A runtime error occurred while rendering the dashboard. Please refresh the page.</p>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, overflowX: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error?.message}
              {this.state.errorInfo?.componentStack && `\n\n${this.state.errorInfo.componentStack}`}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
