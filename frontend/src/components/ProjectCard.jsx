import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Images, MapPin } from 'lucide-react';
import { getProjectPath } from '../lib/routes.js';

function getBadge(project) {
  if (project.estado === 'finalizada') return ['project-badge--done', 'Finalizada'];
  if (project.estado === 'por-arrancar' || project.estado === 'por-comenzar') return ['project-badge--pending', 'Por iniciar'];
  return ['project-badge--progress', 'Construyendo'];
}

function imageUrl(item) {
  return typeof item === 'string' ? item : (item?.url || item?.imageUrl || item?.image_url || '');
}

function getPhotoCount(project) {
  const sources = Array.isArray(project.sucursales) && project.sucursales.length
    ? project.sucursales
    : [project];
  const urls = sources.flatMap((source) => [
    source.portada,
    ...(source.imagenes || []),
    ...(source.imagenesAntes || []),
    ...(source.imagenesProceso || []),
    ...(source.imagenesFinal || []),
  ]).map(imageUrl).filter(Boolean);
  return new Set(urls).size;
}

export default function ProjectCard({ project }) {
  const [badgeClass, badgeText] = getBadge(project);
  const description = project.descripcion || 'Obra desarrollada por Fortaleza Construcciones.';
  const cover = project.portada || project.imagenes?.[0] || '';
  const hasCover = Boolean(cover);
  const projectPath = getProjectPath(project);
  const branchCount = Array.isArray(project.sucursales) ? project.sucursales.length : 0;
  const locationText = project.resumenPortada || (branchCount > 1
    ? `${branchCount} sucursales · ${project.ubicacion}`
    : (project.direccion || project.ubicacion));
  const photoCount = getPhotoCount(project);

  return (
    <article className={`project-card project-card--premium project-card--${project.slug || project.id} reveal is-visible`}>
      <Link to={projectPath} className={`project-card__media ${hasCover ? '' : 'project-card__media--empty'}`} aria-label={`Ver obra ${project.nombre}`}>
        {hasCover ? (
          <img
            src={cover}
            alt={project.nombre}
            loading="lazy"
            decoding="async"
            onError={(event) => { event.currentTarget.src = '/assets/img/logo/fzac-logo.jpg'; }}
          />
        ) : (
          <span className="project-card__placeholder">Imagen no disponible</span>
        )}
        <span className={`project-badge ${badgeClass}`}>{badgeText}</span>
      </Link>

      <div className="project-card__body">
        <span className="project-card__type">{project.tipo}</span>
        <h3>{project.nombre}</h3>
        <p>{description.length > 145 ? `${description.slice(0, 145).trim()}...` : description}</p>
        <div className="project-card__meta">
          <span><MapPin aria-hidden="true" size={16} /> {locationText}</span>
          {photoCount > 0 && <span><Images aria-hidden="true" size={16} /> {photoCount} fotos</span>}
        </div>
        <div className="project-card__footer">
          <Link to={projectPath} className="text-link">Ver obra <ArrowUpRight aria-hidden="true" size={17} /></Link>
        </div>
      </div>
    </article>
  );
}
