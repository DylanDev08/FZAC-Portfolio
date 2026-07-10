import React from 'react';
import { STATUS_FILTERS } from '../lib/portfolio.js';

export default function PortfolioToolbar({
  search,
  onSearchChange,
  estado,
  onEstadoChange,
  tipo,
  onTipoChange,
  tipos,
}) {
  return (
    <div className="portfolio-toolbar reveal is-visible">
      <div className="portfolio-toolbar__search">
        <span className="toolbar-label">Buscar obra</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre, tipo o ubicación"
          aria-label="Buscar obra"
        />
      </div>

      <div className="portfolio-toolbar__group">
        <span className="toolbar-label">Estado</span>
        <div className="filter-pills">
          {STATUS_FILTERS.map(([value, label]) => (
            <button key={value} type="button" className={`filter-pill ${estado === value ? 'is-active' : ''}`} onClick={() => onEstadoChange(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="portfolio-toolbar__group">
        <span className="toolbar-label">Tipo</span>
        <div className="filter-pills">
          <button type="button" className={`filter-pill ${tipo === 'all' ? 'is-active' : ''}`} onClick={() => onTipoChange('all')}>Todos</button>
          {tipos.map((item) => (
            <button key={item} type="button" className={`filter-pill ${tipo === item ? 'is-active' : ''}`} onClick={() => onTipoChange(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
