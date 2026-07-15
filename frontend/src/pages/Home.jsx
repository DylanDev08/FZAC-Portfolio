import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard.jsx';
import EventCard from '../components/EventCard.jsx';
import Seo from '../components/Seo.jsx';
import { getProjects } from '../services/projectsService.js';
import { getTrabajos, getEventos } from '../services/contentService.js';
import { DEFAULT_SITE_TEXTS, getPublicSiteTexts } from '../services/siteTextService.js';

const services = [
  { title: 'Steel Framing', tag: 'Construcción en seco', text: 'Estructuras de perfiles galvanizados para viviendas, locales y ampliaciones, con montaje preciso y menor tiempo de obra.', points: ['Montaje preciso', 'Obra limpia', 'Versatilidad'], workHash: 'construccion-en-seco' },
  { title: 'Drywall', tag: 'Interiores', text: 'Tabiques, cielorrasos y revestimientos interiores resueltos con terminaciones prolijas y funcionales.', points: ['Cielorrasos', 'Tabiques', 'Revestimientos'], workHash: 'drywall' },
  { title: 'Construcción húmeda', tag: 'Obra tradicional', text: 'Mampostería, revoques, carpetas, contrapisos y reparaciones ejecutadas con criterio técnico.', points: ['Mampostería', 'Revoques', 'Contrapisos'], workHash: 'construccion-humeda' },
  { title: 'Herrería y montaje', tag: 'Estructuras', text: 'Fabricación y montaje de pérgolas, escaleras, entrepisos y estructuras metálicas adaptadas a cada espacio.', points: ['Pérgolas', 'Entrepisos', 'Montajes'], workHash: 'herreria' },
  { title: 'Pintura e impermeabilización', tag: 'Terminaciones', text: 'Preparación, protección y terminación de superficies interiores y exteriores para un resultado duradero.', points: ['Interiores', 'Exteriores', 'Protección'], workHash: 'pintura-terminaciones' },
  { title: 'Electricidad', tag: 'Instalaciones', text: 'Instalaciones, tableros y mantenimiento eléctrico para viviendas, locales comerciales e industrias.', points: ['Instalaciones', 'Tableros', 'Mantenimiento'], workHash: 'electricidad' },
  { title: 'Plomería y gas', tag: 'Instalaciones', text: 'Instalaciones de agua, gas y desagües con materiales y sistemas adecuados para cada proyecto.', points: ['Agua', 'Gas', 'Desagües'], workHash: 'plomeria' },
  { title: 'Gestión de obra', tag: 'Planificación', text: 'Coordinación de etapas, equipos y materiales para cumplir objetivos, tiempos y calidad de ejecución.', points: ['Planificación', 'Seguimiento', 'Coordinación'], workHash: 'trabajos-institucionales' },
];


const processSteps = [
  ['01', 'Relevamiento', 'Analizamos el espacio, las necesidades y el alcance de la intervención.'],
  ['02', 'Planificación', 'Definimos etapas, materiales, recursos y tiempos de trabajo.'],
  ['03', 'Ejecución', 'Coordinamos la obra y controlamos cada avance en el lugar.'],
  ['04', 'Entrega', 'Revisamos terminaciones y entregamos el espacio listo para usar.'],
];

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [trabajos, setTrabajos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [siteTexts, setSiteTexts] = useState(DEFAULT_SITE_TEXTS);
  useEffect(() => {
    Promise.all([getProjects(), getTrabajos(), getEventos(), getPublicSiteTexts()])
      .then(([projectList, trabajosList, eventosList, nextSiteTexts]) => {
        setProjects(projectList);
        setTrabajos(trabajosList);
        setEventos(eventosList);
        setSiteTexts(nextSiteTexts);
      })
      .catch(() => {
        setProjects([]);
        setTrabajos([]);
        setEventos([]);
      });
  }, []);

  const featuredProjects = useMemo(() => {
    const base = projects.length ? projects : [];

    // Obras destacadas: solo proyectos principales.
    // "Trabajos varios" queda en su sección propia para no mezclarse con obras completas.
    const preferredSlugs = ['sliders-hamburger', 'marvel', 'burger-house'];
    const selected = preferredSlugs
      .map((slug) => base.find((project) => project.slug === slug))
      .filter(Boolean);

    if (selected.length >= 3) return selected;

    const extra = base.filter((project) =>
      !preferredSlugs.includes(project.slug) &&
      project.slug !== 'trabajos-varios' &&
      project.estado !== 'construyendo' &&
      project.estado !== 'por-comenzar'
    );

    return [...selected, ...extra].slice(0, 3);
  }, [projects]);

  return (
    <main>
      <Seo
        title="Fortaleza Construcciones | Obras, Steel Framing y Construcción en Seco"
        description="Fortaleza Construcciones desarrolla obras comerciales y residenciales, Steel Framing, Drywall, construcción húmeda, plomería, electricidad, pintura, herrería y terminaciones en Rosario y Santa Fe."
        image="/assets/img/logo/fzac-logo.jpg"
        canonicalPath="/"
      />
      <section className="hero-section" id="inicio">
        <div className="hero-section__bg" />
        <div className="container hero-section__container">
          <div className="hero-copy reveal is-visible">
            <span className="eyebrow">Fortaleza Construcciones</span>
            <h1>{siteTexts['home.hero.title']}</h1>
            <p>{siteTexts['home.hero.subtitle']}</p>
            <div className="hero-actions">
              <a href="/proyectos" className="btn btn--primary">Ver obras</a>
              <a href="#contacto" className="btn btn--ghost">Solicitar presupuesto</a>
            </div>
            <div className="hero-metrics">
              <div className="hero-metric"><strong>+8</strong><span>Años de experiencia</span></div>
              <div className="hero-metric"><strong>360°</strong><span>Gestión técnica de obra</span></div>
              <div className="hero-metric"><strong>Comercial</strong><span>Locales, marcas y obras</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section services-section" id="servicios">
        <div className="container">
          <div className="section-heading reveal is-visible">
            <span className="eyebrow">Servicios</span>
            <h2>Todo lo que tu obra necesita, en un solo equipo</h2>
            <p>Resolvemos estructura, instalaciones y terminaciones con una coordinación integral de principio a fin.</p>
          </div>
          <div className="services-grid services-grid--premium services-grid--delivery">
            {services.map((service, index) => (
              <article className="service-card service-card--delivery reveal is-visible" key={service.title}>
                <div className="service-card__head">
                  <span className="service-card__number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="service-card__tag">{service.tag}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <ul className="service-card__points">
                  {service.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
                <Link className="text-link service-card__link" to={`/trabajos/trabajos-varios#${service.workHash}`}>
                  Ver trabajos de {service.title}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section featured-projects-section">
        <div className="container">
          <div className="section-heading reveal is-visible">
            <span className="eyebrow">Obras destacadas</span>
            <h2>Proyectos que reflejan nuestra forma de trabajar</h2>
            <p>Una selección de obras comerciales y residenciales ejecutadas por Fortaleza Construcciones.</p>
          </div>
          <div className="projects-grid projects-grid--featured">
            {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        </div>
      </section>

      <section className="section trabajos-section">
        <div className="container">
          <div className="section-heading reveal is-visible">
            <span className="eyebrow">Otros trabajos</span>
            <h2>Soluciones para cada etapa de obra</h2>
            <p>Conocé nuestros trabajos de construcción en seco, instalaciones, revestimientos, cielorrasos y terminaciones.</p>
          </div>
          <div className="reference-grid">
            {trabajos.map((item) => (
              <Link className="reference-card" key={item.id} to={`/trabajos/${item.slug || item.id}`}>
                <img src={item.portada} alt={item.nombre} loading="lazy" />
                <div>
                  <span>{item.tipo}</span>
                  <h3>{item.nombre}</h3>
                  <p>{item.descripcion}</p>
                  <strong>Ver todos los trabajos →</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section events-preview-section">
        <div className="container events-preview-layout">
          <div className="section-heading reveal is-visible">
            <span className="eyebrow">Eventos y participaciones</span>
            <h2>Experiencia aplicada a eventos y espacios comerciales</h2>
            <p>Acompañamos montajes y desarrollos gastronómicos que exigen coordinación, velocidad y atención al detalle.</p>
            <a href="/eventos" className="btn btn--primary">Ver eventos</a>
          </div>
          {eventos[0] && <EventCard event={eventos[0]} />}
        </div>
      </section>

      <section className="section process-section">
        <div className="container">
          <div className="section-heading reveal is-visible">
            <span className="eyebrow">Metodología</span>
            <h2>Un proceso claro de principio a fin</h2>
          </div>
          <div className="process-grid">
            {processSteps.map(([number, title, text]) => (
              <article className="process-card" key={title}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section diferencial-section why-feature-section">
        <div className="container diferencial-layout why-feature-layout">
          <figure className="why-feature-image reveal is-visible">
            <img src="/assets/img/obras/marvel-pellegrini/marvel-pellegrini-02.jpg" alt="Interior comercial Marvel’s Food ejecutado por Fortaleza Construcciones" loading="lazy" />
            <figcaption>Local gastronómico ejecutado por Fortaleza Construcciones</figcaption>
          </figure>

          <div className="diferencial-copy reveal is-visible">
            <span className="eyebrow">Por qué elegirnos</span>
            <h2>Un equipo que se hace cargo de cada etapa</h2>
            <p>Integramos planificación, ejecución y terminaciones para que cada proyecto avance con orden y una única coordinación.</p>
            <div className="diferencial-points">
              <article className="diferencial-point glass-card"><h3>Planificación</h3><p>Ordenamos etapas, materiales y prioridades antes de comenzar.</p></article>
              <article className="diferencial-point glass-card"><h3>Resolución técnica</h3><p>Adaptamos cada decisión al espacio, al uso y al objetivo del proyecto.</p></article>
              <article className="diferencial-point glass-card"><h3>Terminaciones cuidadas</h3><p>Revisamos los detalles para entregar un resultado funcional y prolijo.</p></article>
            </div>
          </div>
        </div>
      </section>

      <section className="section contact-section contact-section--direct" id="contacto">
        <div className="container">
          <div className="contact-panel contact-panel--direct reveal is-visible">
            <div className="contact-panel__copy">
              <span className="eyebrow">Contacto directo</span>
              <h2>Hablemos de tu proyecto</h2>
              <p>Contanos qué necesitás y coordinamos una primera conversación para evaluar el proyecto.</p>
            </div>

            <div className="contact-direct-grid" aria-label="Canales de contacto">
              <a className="contact-direct-card contact-direct-card--primary" href="https://wa.me/5493415847000?text=Hola%20Fortaleza%20Construcciones%2C%20quiero%20consultar%20por%20una%20obra" target="_blank" rel="noreferrer">
                <span>WhatsApp</span>
                <strong>Solicitar presupuesto</strong>
                <small>Respuesta directa por WhatsApp</small>
              </a>

              <a className="contact-direct-card" href="mailto:fortalezaconstruccionesrosario@gmail.com?subject=Consulta%20desde%20la%20web%20FZAC">
                <span>Email</span>
                <strong>Enviar consulta formal</strong>
                <small>Email corporativo de FZAC</small>
              </a>

              <a className="contact-direct-card" href="https://www.instagram.com/fzaconstrucciones/" target="_blank" rel="noreferrer">
                <span>Instagram</span>
                <strong>@fzaconstrucciones</strong>
                <small>Ver trabajos y novedades</small>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
