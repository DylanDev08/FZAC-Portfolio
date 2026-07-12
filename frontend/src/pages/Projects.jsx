import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PortfolioToolbar from '../components/PortfolioToolbar.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Seo from '../components/Seo.jsx';
import { filterProjects, getProjectTypes, groupProjectsByStatus } from '../lib/portfolio.js';
import { getTrabajos } from '../services/contentService.js';
import { getProjects } from '../services/projectsService.js';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [trabajos, setTrabajos] = useState([]);
  const [estado, setEstado] = useState('all');
  const [tipo, setTipo] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProjects(), getTrabajos()])
      .then(([projectList, trabajosList]) => {
        setProjects(projectList);
        setTrabajos(trabajosList);
      })
      .catch(() => {
        setProjects([]);
        setTrabajos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const tipos = useMemo(() => getProjectTypes(projects), [projects]);
  const filtered = useMemo(
    () => filterProjects(projects, { estado, tipo, search }),
    [projects, estado, tipo, search]
  );
  const groupedProjects = useMemo(() => groupProjectsByStatus(filtered), [filtered]);
  const showGroupedSections = estado === 'all' && tipo === 'all' && !search.trim();

  return (
    <main>
      <Seo
        title="Obras y proyectos | Fortaleza Construcciones"
        description="Portfolio de obras de Fortaleza Construcciones: locales gastronómicos, proyectos comerciales, residenciales, Steel Framing, Drywall y construcción tradicional."
        image="/assets/img/obras/marvel-pellegrini/marvel-pellegrini-02.jpg"
        canonicalPath="/proyectos"
      />
      <section className="page-hero projects-hero">
        <div className="container">
          <span className="eyebrow">Obras</span>
          <h1>Obras comerciales y residenciales ejecutadas con criterio técnico</h1>
          <p>Explorá obras finalizadas, proyectos en ejecución y próximos desarrollos, con registros visuales ordenados por etapas y soluciones constructivas reales.</p>
        </div>
      </section>

      <section className="section portfolio-controls-section">
        <div className="container">
          <PortfolioToolbar
            search={search}
            onSearchChange={setSearch}
            estado={estado}
            onEstadoChange={setEstado}
            tipo={tipo}
            onTipoChange={setTipo}
            tipos={tipos}
          />

          {loading ? (
            <div className="portfolio-grid" aria-label="Cargando obras">
              {[1, 2, 3].map((item) => <div className="project-card-skeleton" key={item} aria-hidden="true" />)}
            </div>
          ) : showGroupedSections ? (
            <div className="obra-status-sections">
              {groupedProjects.map((group) => (
                <section className="obra-status-section" key={group.key}>
                  <div className="obra-status-section__head">
                    <span className="eyebrow">Sector de obras</span>
                    <h2>{group.title}</h2>
                    <p>{group.text}</p>
                  </div>
                  <div className="portfolio-grid">
                    {group.items.map((project) => <ProjectCard key={project.id} project={project} />)}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="portfolio-grid">
              {filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          )}

          {!loading && !filtered.length && <div className="empty-state"><h3>No hay obras con ese filtro.</h3><p>Probá con otra categoría o búsqueda.</p></div>}
        </div>
      </section>

      <section className="section trabajos-section trabajos-section--compact">
        <div className="container">
          <div className="section-heading reveal is-visible">
            <span className="eyebrow">+ trabajos</span>
            <h2>Referencias vinculadas a servicios</h2>
            <p>Estos registros complementan el portfolio principal y ayudan a mostrar soluciones puntuales de aluminio, mantenimiento, pintura e interiores.</p>
          </div>
          <div className="reference-grid">
            {trabajos.map((item) => (
              <Link className="reference-card" key={item.id} to={`/trabajos/${item.slug || item.id}`}>
                <img src={item.portada || '/assets/img/logo/fzac-logo.jpg'} alt={item.nombre} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = '/assets/img/logo/fzac-logo.jpg'; }} />
                <div>
                  <span>{item.tipo}</span>
                  <h3>{item.nombre}</h3>
                  <p>{item.descripcion}</p>
                  <strong>Ver referencia →</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
