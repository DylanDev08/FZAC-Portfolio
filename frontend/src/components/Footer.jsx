import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_SITE_TEXTS, getPublicSiteTexts } from '../services/siteTextService.js';

const adtechUrl = 'https://www.instagram.com/adtech.ros/';

const adtechServices = [
  'Renders 3D interiores y exteriores',
  'Identidad de marca',
  'Meta Ads y Google Ads',
  'Landings, e-commerce y app webs',
  'CRM, ERP y bases de datos'
];

export default function Footer() {
  const [terms, setTerms] = useState(DEFAULT_SITE_TEXTS['footer.terms']);

  useEffect(() => {
    getPublicSiteTexts().then((texts) => setTerms(texts['footer.terms']));
  }, []);

  return (
    <footer className="site-footer site-footer--clean">
      <div className="container site-footer__container site-footer__container--balanced">
        <section className="site-footer__column site-footer__brand">
          <span className="site-footer__label">Fortaleza Construcciones</span>
          <h3>Construimos tu proyecto de principio a fin</h3>
          <p>
            Obras comerciales y residenciales con planificación, coordinación
            integral y terminaciones cuidadas.
          </p>
        </section>

        <nav className="site-footer__column site-footer__nav" aria-label="Navegación del footer">
          <span className="site-footer__label">Navegación</span>
          <Link to="/">Inicio</Link>
          <Link to="/proyectos">Portfolio</Link>
          <Link to="/trabajos/trabajos-varios">Trabajos varios</Link>
          <a href="/#contacto">Contacto</a>
        </nav>

        <section className="site-footer__column site-footer__partner" aria-label="Soluciones digitales asociadas">
          <span className="site-footer__label">Soluciones asociadas</span>
          <h4>AdTech</h4>
          <p>
            Equipo asociado para complementar proyectos con renders, identidad visual
            y soluciones digitales.
          </p>
          <ul className="site-footer__chips" aria-label="Servicios de AdTech">
            {adtechServices.map((service) => <li key={service}>{service}</li>)}
          </ul>
          <a className="site-footer__cta" href={adtechUrl} target="_blank" rel="noreferrer">
            Conocer AdTech →
          </a>
        </section>

        <section className="site-footer__column site-footer__commerce">
          <span className="site-footer__label">Contacto</span>
          <h4>¿Tenés un proyecto?</h4>
          <p>Escribinos para coordinar una visita, solicitar un presupuesto o conversar sobre tu próxima obra.</p>
          <a className="site-footer__cta" href="https://wa.me/5493415847000?text=Hola%20Fortaleza%20Construcciones%2C%20quiero%20consultar%20por%20una%20obra" target="_blank" rel="noreferrer">
            Hablar por WhatsApp →
          </a>
        </section>

        <section className="site-footer__column site-footer__legal" aria-label="Términos y condiciones">
          <span className="site-footer__label">Información legal</span>
          <h4>Uso del contenido</h4>
          <p>{terms}</p>
          <p className="site-footer__author">© {new Date().getFullYear()} Fortaleza Construcciones.</p>
        </section>
      </div>
    </footer>
  );
}
