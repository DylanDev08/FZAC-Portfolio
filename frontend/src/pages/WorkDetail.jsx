import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { imagesFromSource, uniqueImages } from '../lib/gallery.js';
import { getTrabajos } from '../services/contentService.js';

function slugFromText(value) {
  return String(value || 'trabajo')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function RubroCarousel({ id, title, description, images, onOpen }) {
  const cleanImages = useMemo(() => uniqueImages(images), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const safeActiveIndex = cleanImages.length ? Math.min(activeIndex, cleanImages.length - 1) : 0;
  const active = cleanImages[safeActiveIndex] || '';

  const goTo = useCallback((nextIndex) => {
    if (!cleanImages.length) return;
    setActiveIndex((nextIndex + cleanImages.length) % cleanImages.length);
  }, [cleanImages.length]);

  useEffect(() => {
    setActiveIndex(0);
    setIsKeyboardActive(false);
  }, [title, cleanImages.length]);

  useEffect(() => {
    if (!isKeyboardActive || cleanImages.length <= 1) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const activeElement = document.activeElement;
      const isTyping = activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName);
      if (isTyping) return;
      event.preventDefault();
      goTo(safeActiveIndex + (event.key === 'ArrowRight' ? 1 : -1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cleanImages.length, goTo, isKeyboardActive, safeActiveIndex]);

  if (!cleanImages.length) {
    return (
      <article id={id} className="trabajos-rubro-card reveal is-visible" tabIndex={0}>
        <div className="trabajos-rubro-card__header">
          <div>
            <span className="eyebrow">Rubro</span>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <strong>0 / 0</strong>
        </div>
        <div className="trabajos-carousel trabajos-carousel--empty">
          <p>Sin imágenes publicadas para este rubro.</p>
        </div>
      </article>
    );
  }

  return (
    <article
      id={id}
      className={`trabajos-rubro-card reveal is-visible ${isKeyboardActive ? 'is-keyboard-active' : ''}`}
      tabIndex={0}
      onFocus={() => setIsKeyboardActive(true)}
      onClick={() => setIsKeyboardActive(true)}
      onMouseEnter={() => setIsKeyboardActive(true)}
      aria-label={`Galería seleccionada de ${title}. Usá las flechas izquierda y derecha del teclado para navegar.`}
    >
      <div className="trabajos-rubro-card__header">
        <div>
          <span className="eyebrow">Rubro</span>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <strong>{safeActiveIndex + 1} / {cleanImages.length}</strong>
      </div>

      <div className="trabajos-carousel" aria-label={`Galería de ${title}`}>
        {cleanImages.length > 1 && (
          <button className="trabajos-carousel__arrow trabajos-carousel__arrow--left" type="button" onClick={() => goTo(safeActiveIndex - 1)} aria-label="Foto anterior">
            &lsaquo;
          </button>
        )}
        <button className="trabajos-carousel__image" type="button" onClick={() => onOpen(cleanImages, safeActiveIndex)} aria-label={`Ampliar ${title}`}>
          <img src={active} alt={`${title} - imagen ${safeActiveIndex + 1}`} loading="lazy" />
        </button>
        {cleanImages.length > 1 && (
          <button className="trabajos-carousel__arrow trabajos-carousel__arrow--right" type="button" onClick={() => goTo(safeActiveIndex + 1)} aria-label="Foto siguiente">
            &rsaquo;
          </button>
        )}
      </div>

      {cleanImages.length > 1 && (
        <div className="trabajos-carousel__thumbs" aria-label={`Miniaturas de ${title}`}>
          {cleanImages.map((src, index) => (
            <button key={`${src}-${index}`} type="button" className={index === safeActiveIndex ? 'is-active' : ''} onClick={() => setActiveIndex(index)} aria-label={`Ver imagen ${index + 1} de ${title}`}>
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

export default function WorkDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    getTrabajos().then((list) => {
      const selected = list.find((work) => work.slug === slug || work.id === slug) || null;
      setItem(selected);
    }).catch(() => setItem(null));
  }, [slug]);

  const sections = useMemo(() => {
    if (!item) return [];
    if (Array.isArray(item.secciones) && item.secciones.length) {
      return item.secciones.map((section) => ({
        id: section.slug || section.id || slugFromText(section.titulo || section.nombre),
        title: section.titulo || section.nombre || 'Trabajo',
        description: section.descripcion || '',
        images: imagesFromSource(section),
      }));
    }

    return [{ title: item.nombre, description: item.descripcion, images: imagesFromSource(item) }]
      .filter((section) => section.images.length);
  }, [item]);

  useEffect(() => {
    if (!item || !location.hash) return;
    const id = location.hash.replace('#', '');
    window.requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [item, location.hash]);

  function moveLightbox(direction) {
    setLightbox((current) => {
      if (!current) return null;
      const nextIndex = (current.index + direction + current.images.length) % current.images.length;
      return { ...current, index: nextIndex };
    });
  }

  useEffect(() => {
    if (!lightbox) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') moveLightbox(-1);
      if (event.key === 'ArrowRight') moveLightbox(1);
      if (event.key === 'Escape') setLightbox(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  if (!item) {
    return (
      <main className="page-hero">
        <div className="container">
          <span className="eyebrow">+ trabajos</span>
          <h1>Cargando referencia...</h1>
        </div>
      </main>
    );
  }

  const cover = item.portada || sections[0]?.images?.[0] || '/assets/img/obras/trabajos-varios/instalacion-ceramicos/instalacionCeramicos-final-03.jpg';

  return (
    <main>
      <Seo
        title={`${item.nombre} | Fortaleza Construcciones`}
        description={item.descripcion}
        image={cover}
        type="article"
        canonicalPath={`/trabajos/${item.slug || item.id}`}
      />
      <section className="obra-hero obra-hero--premium trabajos-hero--clean">
        <div className="obra-hero__bg" style={{ background: `linear-gradient(180deg, rgba(8,8,8,.28), rgba(8,8,8,.94)), linear-gradient(90deg, rgba(8,8,8,.9), rgba(8,8,8,.34), rgba(8,8,8,.82)), url('${cover}') center/cover no-repeat` }} />
        <div className="container obra-hero__container">
          <div className="obra-hero__content reveal is-visible">
            <div className="breadcrumb"><Link to="/">Inicio</Link><span>/</span><Link to="/proyectos">+ trabajos</Link><span>/</span><strong>{item.nombre}</strong></div>
            <span className="eyebrow">Referencias técnicas</span>
            <h1>{item.nombre}</h1>
            <p>{item.descripcion}</p>
            <div className="obra-hero__meta">
              <div className="obra-meta-card"><span>Rubros</span><strong>{sections.length}</strong></div>
              {item.ubicacion && <div className="obra-meta-card"><span>Ubicación</span><strong>{item.ubicacion}</strong></div>}
              {item.anio && <div className="obra-meta-card"><span>Año</span><strong>{item.anio}</strong></div>}
            </div>
          </div>
        </div>
      </section>

      <section className="section trabajos-detail-section trabajos-detail-section--rubros">
        <div className="container trabajos-rubros-layout">
          <div className="section-heading reveal is-visible trabajos-rubros-heading">
            <span className="eyebrow">Galerías por rubro</span>
            <h2>Trabajos varios organizados por especialidad</h2>
            <p>Cada rubro tiene su propia galería real para recorrer foto por foto, con material organizado por especialidad y sin imágenes sueltas.</p>
          </div>

          <div className="trabajos-rubros-list">
            {sections.map((section, index) => (
              <RubroCarousel
                key={`${section.title}-${index}`}
                id={section.id}
                title={section.title}
                description={section.description}
                images={section.images}
                onOpen={(images, idx) => setLightbox({ images, index: idx })}
              />
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="lightbox lightbox--carousel" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <button className="lightbox__close" type="button" aria-label="Cerrar imagen" onClick={() => setLightbox(null)}>×</button>
          {lightbox.images.length > 1 && <button className="lightbox__arrow lightbox__arrow--left" type="button" onClick={(event) => { event.stopPropagation(); moveLightbox(-1); }} aria-label="Imagen anterior">&lsaquo;</button>}
          <img src={lightbox.images[lightbox.index]} alt="Vista ampliada" onClick={(event) => event.stopPropagation()} />
          <span className="lightbox__counter">{lightbox.index + 1} / {lightbox.images.length}</span>
          {lightbox.images.length > 1 && <button className="lightbox__arrow lightbox__arrow--right" type="button" onClick={(event) => { event.stopPropagation(); moveLightbox(1); }} aria-label="Imagen siguiente">&rsaquo;</button>}
        </div>
      )}
    </main>
  );
}
