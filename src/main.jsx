import React from 'react'
import ReactDOM from 'react-dom/client'
import { NextUIProvider } from "@nextui-org/react"
import { BrowserRouter } from "react-router-dom"
import App from './App.jsx'
import './index.css'

// ErrorBoundary: evita pantalla blanca en caso de errores de runtime
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('❌ Error capturado por ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', padding: '2rem',
          background: '#09090b', color: '#fafafa', fontFamily: 'sans-serif', textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💥</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Algo salió mal
          </h1>
          <p style={{ color: '#71717a', marginBottom: '1.5rem', maxWidth: '400px' }}>
            {this.state.error?.message || 'Error inesperado de la aplicación.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1.5rem', borderRadius: '0.5rem',
              background: '#6366f1', color: 'white', border: 'none',
              cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <NextUIProvider>
          <main className="text-foreground bg-background min-h-screen">
            <App />
          </main>
        </NextUIProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)