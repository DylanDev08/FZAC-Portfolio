import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
// Load project styles once with the entry bundle to avoid CSS chunk preload failures.
import './styles/projectsBackground.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import App from './App.jsx';

// When a user opens a lazy route after a deploy, cached HTML may reference
// CSS/JS chunks that are no longer available. Vite emits this specific event.
// Try one page reload, while retaining the normal error boundary on failure.
window.addEventListener('vite:preloadError', (event) => {
  const key = 'fzac:preload-retry-at';
  try {
    const previous = Number(window.sessionStorage.getItem(key) || 0);
    if (Date.now() - previous < 60_000) return;
    window.sessionStorage.setItem(key, String(Date.now()));
    event.preventDefault();
    window.location.reload();
  } catch {
    // Keep standard error handling when browser storage is unavailable.
  }
});

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
