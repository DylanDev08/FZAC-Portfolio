import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { buildGalleryGroupsFromSource, flattenGalleryGroups } from '../lib/gallery.js';

export function ProjectLocation({ project }) {
  const locations = Array.isArray(project.sucursales) && project.sucursales.length
    ? project.sucursales.map((branch) => branch.direccion).filter(Boolean)
    : [project.direccion].filter(Boolean);

  const uniqueLocations = locations.filter((item, index, array) => array.indexOf(item) === index);
  if (!uniqueLocations.length) return null;

  return (
    <article className="obra-location-inline reveal is-visible">
      <span className="eyebrow">Ubicación</span>
      {uniqueLocations.length === 1 ? (
        <h2>{uniqueLocations[0]}</h2>
      ) : (
        <div className="obra-location-inline__list">
          {uniqueLocations.map((location) => (
            <p key={location}>{location}</p>
          ))}
        </div>
      )}
    </article>
  );
}

export function ProjectGallery({
  groups,
  projectName,
  onOpen,
  sectionTitle = 'Galería del proyecto',
  sectionIntro = 'Recorrido visual del proyecto, desde el inicio de obra hasta el resultado final.',
  compact = false,
}) {
  const sequence = useMemo(() => flattenGalleryGroups(groups), [groups]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const safeActiveIndex = sequence.length ? Math.min(activeIndex, sequence.length - 1) : 0;
  const active = sequence[safeActiveIndex] || null;

  const goTo = useCallback((nextIndex) => {
    if (!sequence.length) return;
    setActiveIndex((nextIndex + sequence.length) % sequence.length);
  }, [sequence.length]);

  const openActive = useCallback(() => {
    if (!sequence.length) return;
    onOpen?.(sequence.map((item) => item.src), safeActiveIndex);
  }, [onOpen, safeActiveIndex, sequence]);

  useEffect(() => {
    setActiveIndex(0);
    setIsKeyboardActive(false);
  }, [sequence.length, projectName]);

  useEffect(() => {
    if (!isKeyboardActive || sequence.length <= 1) return undefined;

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
  }, [goTo, isKeyboardActive, safeActiveIndex, sequence.length]);

  if (!active) return null;

  return (
    <article
      className={`obra-gallery-compact obra-gallery-compact--carousel reveal is-visible ${compact ? 'obra-gallery-compact--branch' : ''} ${isKeyboardActive ? 'is-keyboard-active' : ''}`}
      tabIndex={0}
      onFocus={() => setIsKeyboardActive(true)}
      onClick={() => setIsKeyboardActive(true)}
      onMouseEnter={() => setIsKeyboardActive(true)}
      aria-label={`Galería seleccionada de ${projectName}. Usá las flechas izquierda y derecha del teclado para navegar.`}
    >
      <div className="obra-gallery-compact__top">
        <div>
          <span className="eyebrow">Galería</span>
          <h2>{sectionTitle}</h2>
          {sectionIntro && <p>{sectionIntro}</p>}
        </div>
        <span className="obra-gallery-compact__count">{safeActiveIndex + 1} / {sequence.length}</span>
      </div>

      <div className="obra-gallery-viewer obra-gallery-viewer--single" aria-label={`Galería de ${projectName}`}>
        {sequence.length > 1 && (
          <button className="obra-gallery-viewer__arrow obra-gallery-viewer__arrow--left" type="button" onClick={() => goTo(safeActiveIndex - 1)} aria-label="Foto anterior">&lsaquo;</button>
        )}

        <button className="obra-gallery-viewer__image" type="button" onClick={openActive} aria-label={`Ampliar ${projectName}`}>
          <img src={active.src} alt={`${projectName} - imagen ${safeActiveIndex + 1}`} loading="lazy" />
          <span>{safeActiveIndex + 1}/{sequence.length}</span>
        </button>

        {sequence.length > 1 && (
          <button className="obra-gallery-viewer__arrow obra-gallery-viewer__arrow--right" type="button" onClick={() => goTo(safeActiveIndex + 1)} aria-label="Foto siguiente">&rsaquo;</button>
        )}
      </div>

      {sequence.length > 1 && (
        <div className="obra-gallery-miniatures" aria-label={`Miniaturas de ${projectName}`}>
          {sequence.map((item, index) => (
            <button
              key={`${item.stage}-${item.src}-${index}`}
              type="button"
              className={`obra-gallery-miniatures__item ${index === safeActiveIndex ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <img src={item.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

export function BranchGalleries({ project, onOpen }) {
  const branches = Array.isArray(project.sucursales) ? project.sucursales : [];
  if (!branches.length) return null;

  return (
    <section className="obra-branches-gallery reveal is-visible" aria-label={`Sucursales de ${project.nombre}`}>
      <div className="obra-branches-gallery__head">
        <span className="eyebrow">Locales por dirección</span>
        <h2>{project.nombre}</h2>
        <p>Cada local queda separado con su dirección y su galería propia, mostrando el recorrido completo del proyecto de forma limpia y cronológica.</p>
      </div>

      <div className="obra-branches-gallery__list">
        {branches.map((branch, index) => {
          const groups = buildGalleryGroupsFromSource(branch);
          if (!groups.length) return null;
          const title = branch.nombre || `${project.nombre} ${index + 1}`;

          return (
            <article className="obra-branch-block" key={`${title}-${branch.direccion || index}`}>
              <div className="obra-branch-block__header">
                <span>Local {index + 1}</span>
                <h3>{title}</h3>
                {branch.direccion && <p>{branch.direccion}</p>}
              </div>
              <ProjectGallery
                groups={groups}
                projectName={`${project.nombre} - ${title}`}
                onOpen={onOpen}
                sectionTitle="Galería del local"
                sectionIntro="Recorrido visual ordenado de forma cronológica."
                compact
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
