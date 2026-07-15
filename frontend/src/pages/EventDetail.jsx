import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEventos } from '../services/contentService.js';
import Seo from '../components/Seo.jsx';

export default function EventDetail() {
  const { slug } = useParams();
  const [events, setEvents] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [currentVideo, setCurrentVideo] = useState('');

  useEffect(() => {
    getEventos().then(setEvents).catch(() => setEvents([]));
  }, []);

  const event = useMemo(() => events.find((item) => item.slug === slug) || events[0] || null, [events, slug]);
  const eventVideos = useMemo(() => {
    if (!event) return [];
    return [event.video, ...(event.videos || []), ...(event.galeriaVideo || [])]
      .filter(Boolean)
      .filter((item, index, array) => array.indexOf(item) === index);
  }, [event]);

  useEffect(() => {
    if (!event) return;
    setCurrentVideo(eventVideos[0] || '');
  }, [event, eventVideos]);

  if (!event) {
    return (
      <main className="page-hero">
        <div className="container">
          <span className="eyebrow">Eventos</span>
          <h1>Cargando participación...</h1>
        </div>
      </main>
    );
  }

  const images = event.imagenes?.length ? event.imagenes : [event.portada].filter(Boolean);

  return (
    <main>
      <Seo
        title={`${event.nombre} | Eventos FZAC`}
        description={event.descripcion}
        image={event.portada}
        type="article"
        canonicalPath={`/eventos/${event.slug}`}
      />
      <section className="obra-hero event-detail-hero">
        <div
          className="obra-hero__bg"
          style={{ background: `linear-gradient(180deg, rgba(8,8,8,.34), rgba(8,8,8,.94)), linear-gradient(90deg, rgba(8,8,8,.9), rgba(8,8,8,.3)), url('${event.portada}') center/cover no-repeat` }}
        />
        <div className="container obra-hero__container">
          <div className="obra-hero__content reveal is-visible">
            <div className="breadcrumb"><Link to="/">Inicio</Link><span>/</span><Link to="/eventos">Eventos</Link><span>/</span><strong>{event.nombre}</strong></div>
            <span className="eyebrow">{event.tipo}</span>
            <h1>{event.nombre}</h1>
            <p>{event.descripcion}</p>
            <div className="obra-hero__meta">
              <div className="obra-meta-card"><span>Tipo</span><strong>{event.tipo}</strong></div>
              <div className="obra-meta-card"><span>Ubicación</span><strong>{event.ubicacion || '-'}</strong></div>
              <div className="obra-meta-card"><span>Año</span><strong>{event.anio || '-'}</strong></div>
              <div className="obra-meta-card"><span>Categoría</span><strong>{event.categoria || 'Participación'}</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section obra-detail-section">
        <div className="container obra-layout">
          <div className="obra-main">
            <article className="obra-panel reveal is-visible">
              <div className="obra-panel__header">
                <span className="eyebrow">Participación</span>
                <h2>Presencia de FZAC en el evento</h2>
              </div>
              <p>{event.descripcion}</p>
            </article>

            <article className="obra-panel reveal is-visible">
              <div className="obra-panel__header">
                <span className="eyebrow">Galería</span>
                <h2>Registro visual</h2>
              </div>
              <div className="obra-gallery obra-gallery--premium">
                {images.map((img, index) => (
                  <button key={`${img}-${index}`} type="button" className="obra-gallery__item" onClick={() => setLightbox(img)} aria-label={`Ver imagen ${index + 1}`}>
                    <img src={img} alt={`${event.nombre} registro ${index + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            </article>

            {eventVideos.length > 0 && currentVideo && (
              <article className="obra-panel reveal is-visible">
                <div className="obra-panel__header">
                  <span className="eyebrow">Video</span>
                  <h2>Registro audiovisual</h2>
                </div>
                <div className="obra-video-wrap event-video-wrap">
                  <video key={currentVideo} controls playsInline preload="metadata" onError={() => setCurrentVideo('')}>
                    <source src={currentVideo} type="video/mp4" />
                  </video>
                </div>
                {eventVideos.length > 1 && (
                  <div className="obra-video-gallery">
                    {eventVideos.map((video, index) => (
                      <button key={video} type="button" className={`video-pill ${currentVideo === video ? 'is-active' : ''}`} onClick={() => setCurrentVideo(video)}>
                        Video {index + 1}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            )}
          </div>

          <aside className="obra-sidebar">
            <article className="obra-side-card glass-card reveal is-visible">
              <span className="eyebrow">Rol</span>
              <h3>Qué aporta esta participación</h3>
              <ul className="obra-stages">
                {(event.puntos || event.stages || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className="obra-side-card glass-card reveal is-visible">
              <span className="eyebrow">Contacto</span>
              <h3>Proyectos comerciales</h3>
              <p>Planificamos y ejecutamos locales, stands y espacios comerciales adaptados a cada necesidad.</p>
              <a href="/#contacto" className="btn btn--primary btn--full">Solicitar presupuesto</a>
            </article>
          </aside>
        </div>
      </section>

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <button type="button" aria-label="Cerrar imagen" onClick={() => setLightbox(null)}>×</button>
          <img src={lightbox} alt={`Vista ampliada ${event.nombre}`} />
        </div>
      )}
    </main>
  );
}
