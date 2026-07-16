import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getProjectBranchAnchor } from '../lib/routes.js';

const FALLBACK_OBRAS = [
  {
    slug: 'sliders-hamburger',
    label: 'Sliders Hamburgers',
    children: [
      { label: 'Jujuy 2514', anchor: 'sucursal-jujuy-2514-rosario-santa-fe' },
      { label: 'Juan Manuel de Rosas 1062', anchor: 'sucursal-juan-manuel-de-rosas-1062-rosario-santa-fe' },
      { label: 'Ruta Nacional 9 1832, Funes', anchor: 'sucursal-ruta-nacional-9-1832-funes-santa-fe' },
    ],
  },
  {
    slug: 'marvel',
    label: 'Marvel’s Food',
    children: [
      { label: 'Av. Pellegrini 1149', anchor: 'sucursal-av.-pellegrini-1149-rosario-santa-fe' },
      { label: 'Rondeau 2430', anchor: 'sucursal-rondeau-2430-rosario-santa-fe' },
      { label: 'Ruta Nacional 9 972, Funes', anchor: 'sucursal-ruta-nacional-9-972-funes-santa-fe' },
      { label: 'Viamonte 1434', anchor: 'sucursal-viamonte-1434-rosario-santa-fe' },
    ],
  },
  {
    slug: 'burger-house',
    label: 'Burger House Grill',
    children: [
      { label: 'Av. Pellegrini 916', anchor: 'sucursal-av.-pellegrini-916-rosario-santa-fe' },
      { label: 'Mariano Perdriel 115', anchor: 'sucursal-mariano-perdriel-115-rosario-santa-fe' },
    ],
  },
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
  { label: 'Electricidad', hash: 'electricidad' },
  { label: 'Plomería y gas', hash: 'plomeria' },
  { label: 'Gestión de obra', hash: 'trabajos-institucionales' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState('portfolio');
  const [isAdmin, setIsAdmin] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState(FALLBACK_OBRAS);
  const location = useLocation();
  const navigate = useNavigate();
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);
  const firstMobileLinkRef = useRef(null);

  useEffect(() => {
    let active = true;
    let unsubscribe;

    async function watchAdminSession() {
      try {
        const {
          bootstrapAdminProfile,
          setStoredUser,
          setToken,
          subscribeAuth,
        } = await import('../services/authService.js');

        if (!active) return;
        unsubscribe = subscribeAuth(async (user, session) => {
          if (!user || !session?.access_token) {
            if (active) setIsAdmin(false);
            return;
          }

          setToken(session.access_token);
          setStoredUser(user);

          try {
            await bootstrapAdminProfile();
            if (active) setIsAdmin(true);
          } catch {
            if (active) setIsAdmin(false);
          }
        });
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
    setOpen(false);
    setOpenMobileSection('portfolio');
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const menu = menuRef.current;
    document.body.style.overflow = 'hidden';
    firstMobileLinkRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus({ preventScroll: true });
        return;
      }

      if (event.key !== 'Tab' || !menu) return;
      const focusable = [...menu.querySelectorAll('a[href], button:not([disabled]), summary')]
        .filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 860) setOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  useEffect(() => {
    let active = true;

    async function loadPortfolioMenu() {
      try {
        const { getProjects } = await import('../services/projectsService.js');
        const projects = await getProjects();
        const nextItems = projects
          .filter((project) => project?.slug && (project.nombre || project.titulo))
          .map((project) => ({
            slug: project.slug,
            label: project.nombre || project.titulo,
            children: Array.isArray(project.sucursales)
              ? project.sucursales.map((branch, index) => ({
                  label: branch.nombre || branch.direccion || `Local ${index + 1}`,
                  anchor: getProjectBranchAnchor(branch, index),
                }))
              : [],
          }));

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

  function toggleMenu() {
    if (!open) setOpenMobileSection('portfolio');
    setOpen((current) => !current);
  }

  function toggleMobileSection(section) {
    setOpenMobileSection((current) => current === section ? '' : section);
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

          <button
            ref={menuButtonRef}
            className={`mobile-menu-btn ${open ? 'is-open' : ''}`}
            type="button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={toggleMenu}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div
          ref={menuRef}
          id="mobile-navigation"
          className={`mobile-nav ${open ? 'is-open' : ''}`}
          aria-hidden={!open}
          inert={open ? undefined : ''}
        >
          <div className="mobile-nav__head">
            <div>
              <span>Menú</span>
              <strong>Fortaleza Construcciones</strong>
            </div>
            <button type="button" onClick={close} aria-label="Cerrar menú">×</button>
          </div>

          <nav className="mobile-nav__inner" aria-label="Navegación móvil">
            <div className="mobile-nav__primary">
              <Link ref={firstMobileLinkRef} onClick={close} to="/">Inicio</Link>
              <Link onClick={close} to="/proyectos">Todas las obras</Link>
              <Link onClick={close} to="/eventos">Eventos</Link>
              <a onClick={close} href="/#contacto">Contacto</a>
            </div>

            <div className={`mobile-nav__section ${openMobileSection === 'portfolio' ? 'is-open' : ''}`}>
              <button
                className="mobile-nav__section-trigger"
                type="button"
                aria-expanded={openMobileSection === 'portfolio'}
                aria-controls="mobile-portfolio-links"
                onClick={() => toggleMobileSection('portfolio')}
              >
                Obras por proyecto <span aria-hidden="true">+</span>
              </button>
              {openMobileSection === 'portfolio' && (
                <div className="mobile-nav__links mobile-nav__portfolio-links" id="mobile-portfolio-links">
                  {portfolioItems.map((obra) => {
                    const children = Array.isArray(obra.children) ? obra.children : [];
                    return (
                      <div className="mobile-nav__project-group" key={obra.slug}>
                        <Link className="mobile-nav__project-title" onClick={close} to={`/obra/${obra.slug}`}>
                          {obra.label}
                        </Link>
                        {children.length > 0 && (
                          <div className="mobile-nav__project-branches">
                            {children.map((branch) => (
                              <Link
                                key={`${obra.slug}-${branch.anchor}`}
                                onClick={close}
                                to={`/obra/${obra.slug}#${branch.anchor}`}
                              >
                                {branch.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`mobile-nav__section ${openMobileSection === 'services' ? 'is-open' : ''}`}>
              <button
                className="mobile-nav__section-trigger"
                type="button"
                aria-expanded={openMobileSection === 'services'}
                aria-controls="mobile-services-links"
                onClick={() => toggleMobileSection('services')}
              >
                Servicios <span aria-hidden="true">+</span>
              </button>
              {openMobileSection === 'services' && <div className="mobile-nav__links" id="mobile-services-links">
                {SERVICIOS.map((servicio) => (
                  <Link key={servicio.hash} onClick={close} to={`/trabajos/trabajos-varios#${servicio.hash}`}>
                    {servicio.label}
                  </Link>
                ))}
              </div>}
            </div>

            <a
              className="mobile-nav__cta"
              href="https://wa.me/5493415847000?text=Hola%20Fortaleza%20Construcciones%2C%20quiero%20consultar%20por%20una%20obra"
              target="_blank"
              rel="noreferrer"
            >
              Solicitar presupuesto
            </a>

            {isAdmin && <Link className="mobile-nav__admin" onClick={close} to="/admin">Administración</Link>}
            {isAdmin && <button onClick={handleLogout} className="mobile-logout" type="button">Cerrar sesión</button>}
          </nav>
          </div>
      </header>
    </>
  );
}
