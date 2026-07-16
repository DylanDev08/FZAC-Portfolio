import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { BranchGalleries, ProjectGallery, ProjectLocation } from '../components/ProjectGallery.jsx';
import Seo from '../components/Seo.jsx';
import { buildGalleryGroupsFromSource } from '../lib/gallery.js';
import { getCanonicalProjectSlug } from '../lib/routes.js';
import { getProjects } from '../services/projectsService.js';

export default function ProjectDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const canonicalSlug = getCanonicalProjectSlug(slug);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState('');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProjects().then((list) => {
      const selected = list.find((item) => item.slug === canonicalSlug) || null;
      setProject(selected);
      setCurrentVideo(selected?.video || selected?.galeriaVideo?.[0] || '');
    }).catch(() => setProject(null)).finally(() => setLoading(false));
  }, [canonicalSlug]);

  const videos = useMemo(() => {
    if (!project) return [];
    return [project.video, ...(project.galeriaVideo || [])]
      .filter(Boolean)
      .filter((item, index, array) => array.indexOf(item) === index);
  }, [project]);

  const galleryGroups = useMemo(() => {
    if (!project) return [];
    return buildGalleryGroupsFromSource(project);
  }, [project]);

  const hasBranchGalleries = Boolean(Array.isArray(project?.sucursales) && project.sucursales.length);

  useEffect(() => {
    if (!project || !location.hash) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const targetId = decodeURIComponent(location.hash.slice(1));
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, project]);

  function openLightbox(images, index) {
    setLightbox({ images, index });
  }

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

  if (canonicalSlug && canonicalSlug !== slug) {
    return <Navigate to={`/obra/${canonicalSlug}`} replace />;
  }

  if (!project) {
    return (
      <main className="page-hero">
        <div className="container">
          <span className="eyebrow">Obra</span>
          <h1>{loading ? 'Cargando proyecto...' : 'Obra no encontrada'}</h1>
          {!loading && <p>La obra solicitada no está publicada o la dirección cambió. <Link to="/proyectos">Volver al portfolio</Link>.</p>}
        </div>
      </main>
    );
  }

  const cover = project.portada || galleryGroups[0]?.images?.[0] || '/assets/img/logo/fzac-logo.jpg';

  return (
    <main>
      <Seo
        title={`${project.nombre} | Fortaleza Construcciones`}
        description={`${project.descripcion} Servicio de obra comercial y residencial con planificación, ejecución y terminaciones profesionales.`}
        image={cover}
        type="article"
        canonicalPath={`/obra/${project.slug}`}
      />
      <section className="obra-hero obra-hero--premium">
        <div
          className="obra-hero__bg"
          style={{
            background: `linear-gradient(180deg, rgba(8,8,8,.28), rgba(8,8,8,.94)), linear-gradient(90deg, rgba(8,8,8,.9), rgba(8,8,8,.34), rgba(8,8,8,.82)), url('${cover}') center/cover no-repeat`,
          }}
        />
        <div className="container obra-hero__container">
          <div className="obra-hero__content reveal is-visible">
            <div className="breadcrumb"><Link to="/">Inicio</Link><span>/</span><Link to="/proyectos">Obras</Link><span>/</span><strong>{project.nombre}</strong></div>
            <span className="eyebrow">{project.tipo}</span>
            <h1>{project.nombre}</h1>
            <p>{project.descripcion}</p>
          </div>
        </div>
      </section>

      <section className="section obra-detail-section">
        <div className="container obra-layout obra-layout--single">
          <div className="obra-main">
            {hasBranchGalleries ? (
              <BranchGalleries project={project} onOpen={openLightbox} />
            ) : (
              galleryGroups.length > 0 ? (
                <ProjectGallery groups={galleryGroups} projectName={project.nombre} onOpen={openLightbox} />
              ) : (
                <article className="obra-gallery-empty reveal is-visible">
                  <span className="eyebrow">Galería</span>
                  <h2>Registro fotográfico próximamente</h2>
                  <p>Estamos preparando las imágenes de esta obra para incorporarlas al sitio.</p>
                </article>
              )
            )}

            {!hasBranchGalleries && <ProjectLocation project={project} />}

            {videos.length > 0 && (
              <article className="obra-panel reveal is-visible">
                <div className="obra-panel__header">
                  <span className="eyebrow">Video</span>
                  <h2>Registro audiovisual</h2>
                </div>
                <div className="obra-video-wrap">
                  <video key={currentVideo} controls playsInline preload="metadata" onError={() => setCurrentVideo('')}>
                    <source src={currentVideo} type="video/mp4" />
                    Tu navegador no soporta video HTML5.
                  </video>
                </div>
                {videos.length > 1 && (
                  <div className="obra-video-gallery">
                    {videos.map((video, index) => (
                      <button key={video} type="button" className={`video-pill ${currentVideo === video ? 'is-active' : ''}`} onClick={() => setCurrentVideo(video)}>
                        Video {index + 1}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            )}
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="lightbox lightbox--carousel" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <button className="lightbox__close" type="button" aria-label="Cerrar imagen" onClick={() => setLightbox(null)}>×</button>
          {lightbox.images.length > 1 && <button className="lightbox__arrow lightbox__arrow--left" type="button" onClick={(event) => { event.stopPropagation(); moveLightbox(-1); }} aria-label="Imagen anterior">&lsaquo;</button>}
          <img src={lightbox.images[lightbox.index]} alt={`Vista ampliada ${project.nombre}`} onClick={(event) => event.stopPropagation()} />
          <span className="lightbox__counter">{lightbox.index + 1} / {lightbox.images.length}</span>
          {lightbox.images.length > 1 && <button className="lightbox__arrow lightbox__arrow--right" type="button" onClick={(event) => { event.stopPropagation(); moveLightbox(1); }} aria-label="Imagen siguiente">&rsaquo;</button>}
        </div>
      )}
    </main>
  );
}
