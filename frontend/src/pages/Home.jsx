import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard.jsx';
import EventCard from '../components/EventCard.jsx';
import Seo from '../components/Seo.jsx';
import { getProjects } from '../services/projectsService.js';
import { getTrabajos, getEventos } from '../services/contentService.js';

const services = [
  { title: 'Steel Framing', tag: 'Construcción en seco', text: 'Estructuras livianas con perfiles galvanizados para viviendas, locales y ampliaciones con ejecución rápida y precisa.', points: ['Menor carga húmeda', 'Montaje limpio', 'Alta precisión'], workHash: 'construccion-en-seco' },
  { title: 'Drywall', tag: 'Interiores', text: 'Tabiquería, cielorrasos, revestimientos y soluciones interiores con terminaciones prolijas y funcionales.', points: ['Cielorrasos', 'Tabiques', 'Revestimientos'], workHash: 'drywall' },
  { title: 'Construcción húmeda', tag: 'Obra tradicional', text: 'Albañilería, mampostería, revoques, carpetas, contrapisos y reparaciones con criterio técnico.', points: ['Revoques', 'Carpetas', 'Contrapisos'], workHash: 'construccion-humeda' },
  { title: 'Herrería y montaje', tag: 'Estructuras', text: 'Pérgolas, escaleras, entrepisos, estructuras y soluciones metálicas livianas integradas al proyecto.', points: ['Pérgolas', 'Entrepisos', 'Montajes'], workHash: 'herreria' },
  { title: 'Pintura e impermeabilización', tag: 'Terminaciones', text: 'Preparación de superficies, pintura interior/exterior, enlucidos y protección de muros o sectores críticos.', points: ['Interior/exterior', 'Enlucidos', 'Protección'], workHash: 'pintura-terminaciones' },
  { title: 'Electricidad integral', tag: 'Instalaciones', text: 'Instalaciones para viviendas, locales comerciales e industrias con lectura funcional del espacio.', points: ['Locales', 'Viviendas', 'Mantenimiento'], workHash: 'electricidad' },
  { title: 'Plomería y gas', tag: 'Instalaciones', text: 'Gasista matriculado, termofusión, sistemas epoxi/fusión y desagües cloacales o pluviales.', points: ['Agua', 'Gas', 'Desagües'], workHash: 'plomeria' },
  { title: 'Gestión de obra', tag: 'Planificación', text: 'Organización de etapas, coordinación operativa, control de avance y asesoramiento para ejecutar con orden.', points: ['Etapas', 'Control', 'Coordinación'], workHash: 'trabajos-institucionales' },
];


const processSteps = [
  ['01', 'Planificación inicial', 'Análisis del espacio, necesidades, uso proyectado y alcance real de obra.'],
  ['02', 'Planificación', 'Definición de etapas, materiales, recursos y tiempos para ejecutar con orden.'],
  ['03', 'Ejecución', 'Desarrollo de obra con control de avance, coordinación y resolución técnica.'],
  ['04', 'Terminaciones', 'Detalles finales, limpieza, revisión y entrega con presencia profesional.'],
];

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [trabajos, setTrabajos] = useState([]);
  const [eventos, setEventos] = useState([]);
  useEffect(() => {
    Promise.all([getProjects(), getTrabajos(), getEventos()])
      .then(([projectList, trabajosList, eventosList]) => {
        setProjects(projectList);
        setTrabajos(trabajosList);
        setEventos(eventosList);
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
            <h1>Soluciones constructivas con criterio técnico, presencia y terminación profesional</h1>
            <p>Desarrollamos obras comerciales y residenciales, integrando planificación, ejecución y control de obra.</p>
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
            <h2>Soluciones técnicas para obras comerciales y residenciales</h2>
            <p>Cada servicio se plantea desde una lógica constructiva real: desempeño, tiempos, terminación y adaptabilidad.</p>
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
            <h2>Obras comerciales y residenciales ejecutadas con criterio técnico</h2>
            <p>Proyectos reales desarrollados por Fortaleza Construcciones, mostrando procesos, soluciones constructivas, terminaciones y resultados aplicados.</p>
          </div>
          <div className="projects-grid projects-grid--featured">
            {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        </div>
      </section>

      <section className="section trabajos-section">
        <div className="container">
          <div className="section-heading reveal is-visible">
            <span className="eyebrow">+ trabajos</span>
            <h2>Trabajos varios organizados por secciones</h2>
            <p>Registros complementarios de fachadas, casas, interiores, cielorrasos, revestimientos, instalaciones y terminaciones, organizados por tipo de trabajo.</p>
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
            <h2>Presencia de FZAC en espacios comerciales, eventos y desarrollos gastronómicos</h2>
            <p>Estas participaciones no se muestran como obra principal: funcionan como validación de experiencia, armado de espacios y capacidad operativa en entornos de alto movimiento.</p>
            <a href="/eventos" className="btn btn--primary">Ver eventos</a>
          </div>
          {eventos[0] && <EventCard event={eventos[0]} />}
        </div>
      </section>

      <section className="section process-section">
        <div className="container">
          <div className="section-heading reveal is-visible">
            <span className="eyebrow">Metodología</span>
            <h2>Proceso de trabajo claro, medible y profesional</h2>
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
            <figcaption>Proyecto gastronómico ejecutado · Marvel Burger Co</figcaption>
          </figure>

          <div className="diferencial-copy reveal is-visible">
            <span className="eyebrow">Por qué elegirnos</span>
            <h2>Capacidad técnica, lectura de proyecto y ejecución con presencia profesional</h2>
            <p>Trabajamos integrando planificación, ejecución, terminación y resolución de obra para responder a requerimientos comerciales y residenciales con enfoque serio y operativo.</p>
            <div className="diferencial-points">
              <article className="diferencial-point glass-card"><h3>Planificación consistente</h3><p>Ordenamos etapas, materiales y prioridades antes de ejecutar.</p></article>
              <article className="diferencial-point glass-card"><h3>Resolución técnica</h3><p>Ajustamos cada decisión técnica al proyecto, al uso final y al resultado esperado.</p></article>
              <article className="diferencial-point glass-card"><h3>Terminaciones profesionales</h3><p>La entrega final cuida funcionalidad, estética e imagen del proyecto.</p></article>
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
              <p>Para consultas, presupuestos o coordinación de obra, contactanos por el canal que te resulte más cómodo. La respuesta llega directo al equipo de Fortaleza Construcciones, sin formularios ni pasos intermedios.</p>
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
