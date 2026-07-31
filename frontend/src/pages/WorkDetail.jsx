import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ProjectGallery } from '../components/ProjectGallery.jsx';
import Seo from '../components/Seo.jsx';
import { buildGalleryGroupsFromSource, imagesFromSource, uniqueImages } from '../lib/gallery.js';
import { getTrabajos } from '../services/contentService.js';

function slugFromText(value) {
  return String(value || 'trabajo')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function sectionImages(section = {}) {
  return uniqueImages([
    ...(Array.isArray(section.images) ? section.images : []),
    ...imagesFromSource(section),
  ]);
}

function galleryGroupsFromSection(section = {}, description = '') {
  const stageGroups = buildGalleryGroupsFromSource(section);
  if (stageGroups.length) return stageGroups;

  const images = sectionImages(section);
  return images.length
    ? [{
      title: 'Galería',
      text: description || 'Registro visual de trabajos realizados por Fortaleza Construcciones.',
      images,
      altByUrl: {},
    }]
    : [];
}

function normalizeWorkSection(section = {}, fallbackTitle = 'Trabajo') {
  const title = section.titulo || section.nombre || section.title || fallbackTitle;
  const description = section.descripcion || section.description || '';

  return {
    id: section.slug || section.id || slugFromText(title),
    title,
    description,
    images: sectionImages(section),
    galleryGroups: galleryGroupsFromSection(section, description),
  };
}

function WorkRubroGallery({ section, index, total, onOpen }) {
  if (!section.galleryGroups.length) {
    return (
      <article id={section.id} className="obra-branch-block trabajos-rubro-block trabajos-rubro-block--empty reveal is-visible">
        <div className="obra-branch-block__header trabajos-rubro-block__header">
          <span>Rubro {index + 1} de {total}</span>
          <h3>{section.title}</h3>
          {section.description && <p>{section.description}</p>}
        </div>
        <div className="trabajos-gallery-empty">
          <strong>Sin imágenes publicadas</strong>
          <p>Este rubro queda listo para cargar fotos desde el panel administrativo.</p>
        </div>
      </article>
    );
  }

  return (
    <article id={section.id} className="obra-branch-block trabajos-rubro-block reveal is-visible">
      <div className="obra-branch-block__header trabajos-rubro-block__header">
        <span>Rubro {index + 1} de {total}</span>
        <h3>{section.title}</h3>
        {section.description && <p>{section.description}</p>}
      </div>
      <ProjectGallery
        groups={section.galleryGroups}
        projectName={`Trabajos varios - ${section.title}`}
        onOpen={onOpen}
        sectionTitle="Galería del rubro"
        sectionIntro={section.description || 'Registro fotográfico de trabajos ejecutados por Fortaleza Construcciones.'}
        compact
      />
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
      return item.secciones.map((section) => normalizeWorkSection(section));
    }

    return [normalizeWorkSection(item, item.nombre || 'Trabajo')]
      .filter((section) => section.images.length || section.galleryGroups.length);
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
          <span className="eyebrow">Servicios</span>
          <h1>Cargando trabajos...</h1>
        </div>
      </main>
    );
  }

  const cover = item.portada || sections[0]?.images?.[0] || sections[0]?.galleryGroups?.[0]?.images?.[0] || '/assets/img/obras/trabajos-varios/instalacion-ceramicos/instalacionCeramicos-final-03.jpg';

  return (
    <main>
      <Seo
        title={`${item.nombre} | Fortaleza Construcciones`}
        description={item.descripcion}
        image={cover}
        keywords={`${item.nombre}, Fortaleza Construcciones, trabajos varios Rosario, Steel Framing, Drywall, plomería, electricidad, pisos, revestimientos, cielorrasos, construcción en seco, construcción húmeda`}
        type="article"
        canonicalPath={`/trabajos/${item.slug || item.id}`}
      />
      <section className="obra-hero obra-hero--premium trabajos-hero--clean">
        <div className="obra-hero__bg" style={{ background: `linear-gradient(180deg, rgba(8,8,8,.28), rgba(8,8,8,.94)), linear-gradient(90deg, rgba(8,8,8,.9), rgba(8,8,8,.34), rgba(8,8,8,.82)), url('${cover}') center/cover no-repeat` }} />
        <div className="container obra-hero__container">
          <div className="obra-hero__content reveal is-visible">
            <div className="breadcrumb"><Link to="/">Inicio</Link><span>/</span><Link to="/proyectos">Servicios</Link><span>/</span><strong>{item.nombre}</strong></div>
            <span className="eyebrow">Trabajos realizados</span>
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
        <div className="container obra-layout obra-layout--single trabajos-rubros-layout">
          <section className="obra-branches-gallery trabajos-rubros-gallery" aria-label={`Rubros de ${item.nombre}`}>
            <div className="obra-branches-gallery__head trabajos-rubros-heading reveal is-visible">
              <span className="eyebrow">Galerías por rubro</span>
              <h2>Nuestros trabajos, rubro por rubro</h2>
              <p>Recorré una selección de trabajos terminados y soluciones aplicadas en obras comerciales y residenciales.</p>
            </div>

            {sections.length > 0 ? (
              <div className="obra-branches-gallery__list trabajos-rubros-list">
                {sections.map((section, index) => (
                  <WorkRubroGallery
                    key={`${section.id}-${section.title}-${index}`}
                    section={section}
                    index={index}
                    total={sections.length}
                    onOpen={(images, idx) => setLightbox({ images, index: idx })}
                  />
                ))}
              </div>
            ) : (
              <article className="obra-gallery-empty reveal is-visible">
                <span className="eyebrow">Galería</span>
                <h2>Registro fotográfico próximamente</h2>
                <p>Estamos preparando las imágenes de este apartado para incorporarlas al sitio.</p>
              </article>
            )}
          </section>
        </div>
      </section>

      {lightbox && (
        <div className="lightbox lightbox--carousel" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <button className="lightbox__close" type="button" aria-label="Cerrar imagen" onClick={() => setLightbox(null)}>&times;</button>
          {lightbox.images.length > 1 && <button className="lightbox__arrow lightbox__arrow--left" type="button" onClick={(event) => { event.stopPropagation(); moveLightbox(-1); }} aria-label="Imagen anterior">&lsaquo;</button>}
          <img src={lightbox.images[lightbox.index]} alt="Vista ampliada" onClick={(event) => event.stopPropagation()} />
          <span className="lightbox__counter">{lightbox.index + 1} / {lightbox.images.length}</span>
          {lightbox.images.length > 1 && <button className="lightbox__arrow lightbox__arrow--right" type="button" onClick={(event) => { event.stopPropagation(); moveLightbox(1); }} aria-label="Imagen siguiente">&rsaquo;</button>}
        </div>
      )}
    </main>
  );
}
