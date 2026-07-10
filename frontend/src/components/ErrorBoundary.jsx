import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Error desconocido' };
  }

  componentDidCatch(error, info) {
    console.error('[FZAC] Error de React:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="error-screen">
        <div className="container">
          <span className="eyebrow">Error de carga</span>
          <h1>No se pudo cargar el portfolio.</h1>
          <p>{this.state.message}</p>
          <p>Revisá la consola del navegador o reiniciá Vite con <strong>npm run dev</strong>.</p>
        </div>
      </main>
    );
  }
}
