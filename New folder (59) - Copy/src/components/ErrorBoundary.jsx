import React from 'react';
import { Download, AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Critical System Crash Detected:", error, errorInfo);
    
    // Emergency Rescue: Save local storage and session data immediately before browser kills context
    this.performEmergencyRescue(error, errorInfo);
  }

  performEmergencyRescue(error, errorInfo) {
    try {
      const emergencyData = {
        timestamp: new Date().toISOString(),
        error: error.toString(),
        stack: errorInfo.componentStack,
        localStorageSnapshot: { ...localStorage },
        sessionStorageSnapshot: { ...sessionStorage }
      };

      // We save it to localStorage so it survives the crash
      localStorage.setItem('LAST_CRASH_REPORT', JSON.stringify(emergencyData));
      console.log('Emergency rescue state saved to local storage.');
    } catch (e) {
      console.error('Failed to perform emergency rescue:', e);
    }
  }

  handleDownloadReport = () => {
    try {
      const data = localStorage.getItem('LAST_CRASH_REPORT') || JSON.stringify({ error: this.state.error?.toString() });
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CRASH_REPORT_${new Date().toISOString().replace(/:/g, '-')}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Could not download crash report.');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: 20 }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Critical System Error</h1>
          <p style={{ maxWidth: 600, color: '#94a3b8', marginBottom: 30, lineHeight: 1.6 }}>
            The application encountered a fatal error. Your real-time data is safe in the cloud, but the interface crashed. We have attempted to auto-save your current local session state.
          </p>
          
          <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <RefreshCcw size={18} /> Reload Application
            </button>
            <button 
              onClick={this.handleDownloadReport}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', backgroundColor: 'transparent', color: '#f8fafc',
                border: '1px solid #475569', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Download size={18} /> Download Error Log
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
