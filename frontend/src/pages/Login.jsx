import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  bootstrapAdminProfile,
  login,
  logout,
  setStoredUser,
  setToken,
  subscribeAuth,
} from '../services/authService.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => subscribeAuth(async (user, session, error) => {
    if (error || !user || !session?.access_token) return;

    try {
      setToken(session.access_token);
      setStoredUser(user);
      await bootstrapAdminProfile();
      nav('/admin', { replace: true });
    } catch {
      await logout().catch(() => {});
    }
  }), [nav]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErr('');
    setLoading(true);

    try {
      await login(email, password);
      nav('/admin', { replace: true });
    } catch (error) {
      setErr(error.message || 'No se pudo validar el acceso.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell" style={{ background: 'var(--color-bg)' }}>
      <section className="login-panel">
        <div className="login-panel__brand glass-card">
          <Link to="/" className="brand brand--login">
            <img src="/assets/img/logo/fzac-logo.jpg" className="brand__logo" alt="FZAC logo" />
            <div className="brand__text">
              <span className="brand__name">FORTALEZA</span>
              <span className="brand__sub">CONSTRUCCIONES</span>
            </div>
          </Link>

          <span className="eyebrow" style={{ marginTop: 32 }}>Gestion interna</span>
          <h1>Panel administrativo</h1>
          <p>
            Acceso privado para cargar obras, imagenes, textos, eventos y trabajos del portfolio.
          </p>

          <div className="login-benefits">
            <div className="login-benefit glass-card">
              <h3>Simple para administrar</h3>
              <p style={{ color: 'var(--color-text-soft)', margin: 0, lineHeight: 1.72 }}>
                Secciones claras, carga por botones y textos pensados para una gestion cotidiana sencilla.
              </p>
            </div>
            <div className="login-benefit glass-card">
              <h3>Acceso protegido</h3>
              <p style={{ color: 'var(--color-text-soft)', margin: 0, lineHeight: 1.72 }}>
                El servidor valida la sesion y los permisos antes de habilitar cualquier accion administrativa.
              </p>
            </div>
          </div>
        </div>

        <div className="login-card glass-card">
          <div className="login-card__header">
            <span className="eyebrow">Ingreso seguro</span>
            <h2>Acceder al panel</h2>
            <p style={{ color: 'var(--color-text-soft)', fontSize: '0.92rem' }}>
              Ingresa con una cuenta administrativa previamente habilitada.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <label htmlFor="login-email">Email</label>
              <input id="login-email" type="email" autoComplete="email" placeholder="correo@empresa.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>

            <div className="form-row">
              <label htmlFor="login-pass">Contrasena</label>
              <input id="login-pass" type="password" autoComplete="current-password" placeholder="Ingresa tu contrasena" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>

            {err && <p className="form-feedback" role="alert">{err}</p>}

            <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
              {loading ? 'Validando...' : 'Ingresar'}
            </button>
          </form>

          <div className="login-card__footer">
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', textAlign: 'center', marginTop: 16 }}>
              Las cuentas se habilitan de forma privada y no se registran desde esta pantalla.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
