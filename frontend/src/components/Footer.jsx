import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_SITE_TEXTS, getPublicSiteTexts } from '../services/siteTextService.js';

const ecommerceUrl = '';
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
          <h3>Planificación y ejecución de obras desde cero</h3>
          <p>
            Desarrollo de obras comerciales y residenciales con planificación,
            estructura, ejecución integral y terminaciones profesionales.
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
            Servicio externo asociado para complementar proyectos con identidad visual,
            comunicación digital, renders y desarrollo tecnológico.
          </p>
          <ul className="site-footer__chips" aria-label="Servicios de AdTech">
            {adtechServices.map((service) => <li key={service}>{service}</li>)}
          </ul>
          <a className="site-footer__cta" href={adtechUrl} target="_blank" rel="noreferrer">
            Conocer AdTech →
          </a>
        </section>

        <section className="site-footer__column site-footer__commerce">
          <span className="site-footer__label">FZAC</span>
          <h4>E-Commerce</h4>
          <p>Próximo espacio para recursos, productos y soluciones vinculadas a la construcción.</p>
          {ecommerceUrl ? (
            <a className="site-footer__cta" href={ecommerceUrl} target="_blank" rel="noreferrer">Entrar al e-commerce →</a>
          ) : (
            <span className="site-footer__status">Próximamente</span>
          )}
        </section>

        <section className="site-footer__column site-footer__legal" aria-label="Términos y condiciones">
          <span className="site-footer__label">Términos</span>
          <h4>Portfolio institucional</h4>
          <p>{terms}</p>
          <p className="site-footer__author">Autor: Fortaleza Construcciones.</p>
        </section>
      </div>
    </footer>
  );
}
