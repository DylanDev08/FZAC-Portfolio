import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthorizedAdmin } from '../supabase/config.js';
import { login, registerAdmin, subscribeAuth } from '../services/authService.js';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const isRegister = mode === 'register';

  useEffect(() => {
    return subscribeAuth((user) => {
      if (isAuthorizedAdmin(user)) nav('/admin', { replace: true });
    });
  }, [nav]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErr('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerAdmin(email, password);
      } else {
        await login(email, password);
      }
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

          <span className="eyebrow" style={{ marginTop: 32 }}>Gestión interna</span>
          <h1>Panel administrativo</h1>
          <p>
            Acceso privado para cargar obras, imágenes, textos, eventos y trabajos del portfolio.
          </p>

          <div className="login-benefits">
            <div className="login-benefit glass-card">
              <h3>Simple para administrar</h3>
              <p style={{ color: 'var(--color-text-soft)', margin: 0, lineHeight: 1.72 }}>
                Secciones claras, carga por botones y textos pensados para alguien sin conocimientos técnicos.
              </p>
            </div>
            <div className="login-benefit glass-card">
              <h3>Acceso protegido</h3>
              <p style={{ color: 'var(--color-text-soft)', margin: 0, lineHeight: 1.72 }}>
                Solo los emails administradores autorizados pueden registrarse y entrar al panel.
              </p>
            </div>
          </div>
        </div>

        <div className="login-card glass-card">
          <div className="login-card__header">
            <span className="eyebrow">Ingreso seguro</span>
            <h2>{isRegister ? 'Registrar administrador' : 'Acceder al panel'}</h2>
            <p style={{ color: 'var(--color-text-soft)', fontSize: '0.92rem' }}>
              {isRegister
                ? 'Creá la cuenta una sola vez con un email administrador autorizado.'
                : 'Ingresá con tu email administrador para abrir el panel.'}
            </p>
          </div>

          <div className="login-mode-switch" role="tablist" aria-label="Modo de acceso">
            <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => { setMode('login'); setErr(''); }}>Ingresar</button>
            <button type="button" className={mode === 'register' ? 'is-active' : ''} onClick={() => { setMode('register'); setErr(''); }}>Registrar admin</button>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <label htmlFor="login-email">Email administrador</label>
              <input id="login-email" type="email" autoComplete="email" placeholder="fortalezaconstruccionesrosario@gmail.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>

            <div className="form-row">
              <label htmlFor="login-pass">Contraseña</label>
              <input id="login-pass" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="Contraseña segura" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>

            {err && <p className="form-feedback" role="alert">{err}</p>}

            <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
              {loading ? 'Validando...' : (isRegister ? 'Crear acceso admin' : 'Ingresar')}
            </button>
          </form>

          <div className="login-card__footer">
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', textAlign: 'center', marginTop: 16 }}>
              No se crean cuentas públicas. El registro queda limitado a los administradores definidos en Supabase.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
