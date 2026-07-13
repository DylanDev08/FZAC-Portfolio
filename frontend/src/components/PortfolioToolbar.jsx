import React from 'react';
import { Building2, CheckCircle2, Clock3, LayoutGrid, Search, SlidersHorizontal, X } from 'lucide-react';
import { STATUS_FILTERS } from '../lib/portfolio.js';

const STATUS_ICONS = {
  all: LayoutGrid,
  finalizada: CheckCircle2,
  construyendo: Building2,
  'por-comenzar': Clock3,
};

export default function PortfolioToolbar({
  search,
  onSearchChange,
  estado,
  onEstadoChange,
  tipo,
  onTipoChange,
  tipos,
  resultCount = 0,
  totalCount = 0,
}) {
  const hasFilters = Boolean(search.trim() || estado !== 'all' || tipo !== 'all');
  const clearFilters = () => {
    onSearchChange('');
    onEstadoChange('all');
    onTipoChange('all');
  };

  return (
    <section className="portfolio-toolbar reveal is-visible" aria-label="Filtros de obras">
      <header className="portfolio-toolbar__header">
        <div>
          <span className="portfolio-toolbar__kicker"><SlidersHorizontal aria-hidden="true" size={17} /> Explorar portfolio</span>
          <strong>{resultCount} de {totalCount} obras</strong>
        </div>
        {hasFilters && (
          <button className="portfolio-toolbar__clear" type="button" onClick={clearFilters}>
            <X aria-hidden="true" size={16} /> Limpiar
          </button>
        )}
      </header>

      <div className="portfolio-toolbar__controls">
        <label className="portfolio-toolbar__search">
          <span>Buscar obra</span>
          <div>
            <Search aria-hidden="true" size={18} />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Nombre, rubro o ubicación"
              aria-label="Buscar obra"
            />
            {search && (
              <button type="button" onClick={() => onSearchChange('')} title="Borrar búsqueda" aria-label="Borrar búsqueda">
                <X size={17} />
              </button>
            )}
          </div>
        </label>

        <label className="portfolio-toolbar__type">
          <span>Tipo de obra</span>
          <select value={tipo} onChange={(event) => onTipoChange(event.target.value)}>
            <option value="all">Todos los tipos</option>
            {tipos.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className="portfolio-toolbar__status" role="group" aria-label="Filtrar por estado">
        {STATUS_FILTERS.map(([value, label]) => {
          const Icon = STATUS_ICONS[value] || LayoutGrid;
          return (
            <button key={value} type="button" className={estado === value ? 'is-active' : ''} onClick={() => onEstadoChange(value)}>
              <Icon aria-hidden="true" size={17} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
