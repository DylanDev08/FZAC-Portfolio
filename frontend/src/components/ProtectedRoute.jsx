import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthorizedAdmin } from '../supabase/config.js';
import { clearToken, logout, setStoredUser, setToken, subscribeAuth } from '../services/authService.js';

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    return subscribeAuth(async (user, session, error) => {
      if (error) {
        setStatus('missing-config');
        return;
      }

      if (!user) {
        clearToken();
        setStatus('guest');
        return;
      }

      if (!isAuthorizedAdmin(user)) {
        await logout().catch(() => clearToken());
        setStatus('unauthorized');
        return;
      }

      setToken(session?.access_token || '');
      setStoredUser(user);
      setStatus('admin');
    });
  }, []);

  if (status === 'checking') {
    return (
      <main className="auth-loading">
        <div className="container">
          <span className="eyebrow">Validando acceso</span>
          <h1>Cargando panel administrativo...</h1>
        </div>
      </main>
    );
  }

  if (status === 'missing-config') {
    return (
      <main className="auth-loading">
        <div className="container">
          <span className="eyebrow">Acceso no disponible</span>
          <h1>No se pudo abrir el panel.</h1>
          <p>Revisá que el backend esté corriendo y que SUPABASE_URL y SUPABASE_ANON_KEY estén completos en backend/.env.</p>
        </div>
      </main>
    );
  }

  if (status !== 'admin') return <Navigate to="/login" replace />;

  return children;
}
