import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const FALLBACK_OBRAS = [
  { slug: 'sliders-hamburger', label: 'Sliders Hamburgers' },
  { slug: 'marvel', label: 'Marvel’s Food' },
  { slug: 'burger-house', label: 'Burger House Grill' },
  { slug: 'armstrong', label: 'Armstrong' },
  { slug: 'fichines', label: 'Fichines' },
  { slug: 'flama', label: 'Local de Flama' },
  { slug: 'roldan', label: 'Roldán' },
];

const SERVICIOS = [
  { label: 'Steel Framing', hash: 'construccion-en-seco' },
  { label: 'Drywall', hash: 'drywall' },
  { label: 'Construcción húmeda', hash: 'construccion-humeda' },
  { label: 'Herrería y montaje', hash: 'herreria' },
  { label: 'Pintura e impermeabilización', hash: 'pintura-terminaciones' },
  { label: 'Electricidad integral', hash: 'electricidad' },
  { label: 'Plomería y gas', hash: 'plomeria' },
  { label: 'Gestión de obra', hash: 'trabajos-institucionales' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState(FALLBACK_OBRAS);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    let unsubscribe;

    async function watchAdminSession() {
      try {
        const [{ isAuthorizedAdmin }, { subscribeAuth }] = await Promise.all([
          import('../supabase/config.js'),
          import('../services/authService.js'),
        ]);

        if (!active) return;
        unsubscribe = subscribeAuth((user) => setIsAdmin(isAuthorizedAdmin(user)));
      } catch {
        if (active) setIsAdmin(false);
      }
    }

    watchAdminSession();

    return () => {
      active = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadPortfolioMenu() {
      try {
        const { getProjects } = await import('../services/projectsService.js');
        const projects = await getProjects();
        const nextItems = projects
          .filter((project) => project?.slug && (project.nombre || project.titulo))
          .map((project) => ({ slug: project.slug, label: project.nombre || project.titulo }));

        if (active && nextItems.length) setPortfolioItems(nextItems);
      } catch {
        if (active) setPortfolioItems(FALLBACK_OBRAS);
      }
    }

    loadPortfolioMenu();

    return () => {
      active = false;
    };
  }, []);

  function close() {
    setOpen(false);
  }

  async function handleLogout() {
    try {
      const { clearToken, logout } = await import('../services/authService.js');
      await logout().catch(() => clearToken());
    } catch {
      // El cierre de sesión no debe romper la navegación pública.
    }
    close();
    navigate('/');
  }

  return (
    <>
      <div className={`mobile-backdrop ${open ? 'is-open' : ''}`} onClick={close} aria-hidden="true" />

      <header className="site-header">
        <div className="container site-header__container">
          <Link to="/" className="brand" onClick={close} aria-label="Ir al inicio">
            <img src="/assets/img/logo/fzac-logo.jpg" alt="Fortaleza Construcciones" className="brand__logo" width="50" height="50" />
            <div className="brand__text">
              <span className="brand__name">FORTALEZA</span>
              <span className="brand__sub">CONSTRUCCIONES</span>
            </div>
          </Link>

          <nav className="desktop-nav" aria-label="Navegación principal">
            <NavLink to="/" end className={({ isActive }) => `desktop-nav__link ${isActive ? 'desktop-nav__link--active' : ''}`}>Inicio</NavLink>
            <NavLink to="/proyectos" className={({ isActive }) => `desktop-nav__link ${isActive ? 'desktop-nav__link--active' : ''}`}>Obras</NavLink>

            <div className="nav-dropdown">
              <button className="nav-dropdown__trigger" type="button">
                Portfolio <span className="nav-dropdown__caret">+</span>
              </button>
              <div className="nav-dropdown__menu">
                {portfolioItems.map((obra) => <Link key={obra.slug} to={`/obra/${obra.slug}`}>{obra.label}</Link>)}
              </div>
            </div>

            <div className="nav-dropdown">
              <button className="nav-dropdown__trigger" type="button">
                Servicios <span className="nav-dropdown__caret">+</span>
              </button>
              <div className="nav-dropdown__menu nav-dropdown__menu--wide">
                {SERVICIOS.map((servicio) => <Link key={servicio.hash} to={`/trabajos/trabajos-varios#${servicio.hash}`}>{servicio.label}</Link>)}
              </div>
            </div>

            <NavLink to="/eventos" className={({ isActive }) => `desktop-nav__link ${isActive ? 'desktop-nav__link--active' : ''}`}>Eventos</NavLink>
            <a href="/#contacto" className="desktop-nav__link desktop-nav__link--contact">Contacto</a>

            {isAdmin && (
              <div className="nav-dropdown">
                <button className="nav-dropdown__trigger desktop-nav__link--admin" type="button">
                  Panel <span className="nav-dropdown__caret">+</span>
                </button>
                <div className="nav-dropdown__menu">
                  <Link to="/admin">Administración</Link>
                  <button className="nav-dropdown__button" type="button" onClick={handleLogout}>Cerrar sesión</button>
                </div>
              </div>
            )}
          </nav>

          <button className={`mobile-menu-btn ${open ? 'is-open' : ''}`} type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={() => setOpen((prev) => !prev)}>
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`mobile-nav ${open ? 'is-open' : ''}`} aria-hidden={!open}>
          <div className="mobile-nav__inner">
            <Link onClick={close} to="/">Inicio</Link>
            <Link onClick={close} to="/proyectos">Obras</Link>
            {portfolioItems.map((obra) => <Link key={obra.slug} onClick={close} to={`/obra/${obra.slug}`}>{obra.label}</Link>)}
            <Link onClick={close} to="/trabajos/trabajos-varios">Servicios</Link>
            <Link onClick={close} to="/eventos">Eventos</Link>
            <a onClick={close} href="/#contacto">Contacto</a>
            {isAdmin && <Link onClick={close} to="/admin">Administración</Link>}
            {isAdmin && <button onClick={handleLogout} className="mobile-logout" type="button">Cerrar sesión</button>}
          </div>
        </div>
      </header>
    </>
  );
}
