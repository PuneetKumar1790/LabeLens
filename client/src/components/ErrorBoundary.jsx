import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('LabelLens Frontend Exception caught by ErrorBoundary:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg text-text-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-border bg-surface p-8 text-center shadow-2xl">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20 mb-5">
              <span className="text-2xl font-bold font-mono">!</span>
            </div>
            <h1 className="font-syne text-2xl font-bold text-text-1 mb-2">Something went wrong</h1>
            <p className="font-syne text-sm text-text-2 mb-6">
              An unexpected display error occurred. You can reload the page or return to the homepage.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="rounded-xl bg-accent px-5 py-3 font-syne text-sm font-bold text-bg hover:bg-accent/90 transition-colors"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="rounded-xl border border-border px-5 py-3 font-syne text-sm font-semibold text-text-1 hover:border-text-3 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
