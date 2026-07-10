export const STATUS_FILTERS = [
  ['all', 'Todas'],
  ['finalizada', 'Finalizadas'],
  ['construyendo', 'En proceso'],
  ['por-comenzar', 'Por iniciar'],
];

export const STATUS_GROUPS = [
  ['por-comenzar', 'Por iniciar', 'Proyectos listos para iniciar o en etapa previa.'],
  ['construyendo', 'En proceso', 'Obras activas con seguimiento y avance operativo.'],
  ['finalizada', 'Finalizadas', 'Obras entregadas y registros consolidados.'],
];

export function getProjectTypes(projects = []) {
  return [...new Set(projects.map((project) => project.tipo).filter(Boolean))];
}

export function filterProjects(projects = [], { estado = 'all', tipo = 'all', search = '' } = {}) {
  const query = search.trim().toLowerCase();

  return projects.filter((project) => {
    const byEstado = estado === 'all' || project.estado === estado;
    const byTipo = tipo === 'all' || project.tipo === tipo;
    const searchable = `${project.nombre || ''} ${project.tipo || ''} ${project.ubicacion || ''} ${project.direccion || ''}`.toLowerCase();
    const bySearch = !query || searchable.includes(query);

    return byEstado && byTipo && bySearch;
  });
}

export function groupProjectsByStatus(projects = []) {
  return STATUS_GROUPS
    .map(([key, title, text]) => ({
      key,
      title,
      text,
      items: projects.filter((project) => project.estado === key),
    }))
    .filter((group) => group.items.length > 0);
}
