const PROJECT_ALIASES = {
  slider: 'sliders-hamburger',
  sliders: 'sliders-hamburger',
  'sliders-jujuy': 'sliders-hamburger',
  'sliders-rosas': 'sliders-hamburger',
  'sliders-funes': 'sliders-hamburger',
  amstrong: 'armstrong',
  'fichines-pichincha': 'fichines',
  'local-flama': 'flama',
  'flama-local': 'flama',
};

export function getCanonicalProjectSlug(slug = '') {
  const cleanSlug = String(slug || '').trim();
  return PROJECT_ALIASES[cleanSlug] || cleanSlug;
}

export function getProjectPath(projectOrSlug = '') {
  const slug = typeof projectOrSlug === 'string' ? projectOrSlug : projectOrSlug?.slug || projectOrSlug?.id || '';
  return `/obra/${getCanonicalProjectSlug(slug)}`;
}

