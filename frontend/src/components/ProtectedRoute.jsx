import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  bootstrapAdminProfile,
  clearToken,
  logout,
  setStoredUser,
  setToken,
  subscribeAuth,
} from '../services/authService.js';

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => subscribeAuth(async (user, session, error) => {
    if (error) {
      setStatus('missing-config');
      return;
    }

    if (!user || !session?.access_token) {
      clearToken();
      setStatus('guest');
      return;
    }

    setToken(session.access_token);
    setStoredUser(user);

    try {
      await bootstrapAdminProfile();
      setStatus('admin');
    } catch (bootstrapError) {
      if ([401, 403].includes(bootstrapError?.status)) {
        await logout().catch(() => clearToken());
        setStatus('unauthorized');
        return;
      }
      setStatus('missing-config');
    }
  }), []);

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
          <p>Revisa la conexion con el backend y la configuracion de Supabase.</p>
        </div>
      </main>
    );
  }

  if (status !== 'admin') return <Navigate to="/login" replace />;

  return children;
}
