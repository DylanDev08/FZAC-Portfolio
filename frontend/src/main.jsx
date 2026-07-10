import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import App from './App.jsx';

const rootElement = document.getElementById('root');

function FatalFallback({ message }) {
  return (
    <main className="error-screen">
      <div className="container">
        <span className="eyebrow">Error de carga</span>
        <h1>No se pudo cargar el portfolio.</h1>
        <p>{message || 'Revisá la consola del navegador y la configuración de Supabase.'}</p>
      </div>
    </main>
  );
}

try {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('[FZAC] Error fatal al iniciar React:', error);
  createRoot(rootElement).render(<FatalFallback message={error?.message} />);
}
