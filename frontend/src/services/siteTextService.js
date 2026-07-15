import { apiRequest, unwrapData } from './httpService.js';

export const DEFAULT_SITE_TEXTS = {
  'home.hero.title': 'Construimos espacios que hacen crecer tus proyectos',
  'home.hero.subtitle': 'Planificamos y ejecutamos obras comerciales y residenciales, desde la estructura hasta las terminaciones.',
  'footer.terms': 'Las imágenes publicadas corresponden a trabajos y participaciones de Fortaleza Construcciones. Todos los derechos reservados.',
};

const PRODUCTION_COPY_CUTOFF = Date.parse('2026-07-15T00:00:00.000Z');

let siteTextsPromise = null;

export async function getPublicSiteTexts() {
  if (siteTextsPromise) return siteTextsPromise;
  siteTextsPromise = loadPublicSiteTexts();
  return siteTextsPromise;
}

async function loadPublicSiteTexts() {
  try {
    const payload = await apiRequest('/fzac/site-texts');
    const rows = unwrapData(payload);
    return (Array.isArray(rows) ? rows : []).reduce((texts, row) => {
      const isNewerAdminCopy = row?.updatedAt && Date.parse(row.updatedAt) >= PRODUCTION_COPY_CUTOFF;
      if (row?.key && row?.value && (!DEFAULT_SITE_TEXTS[row.key] || isNewerAdminCopy)) texts[row.key] = row.value;
      return texts;
    }, { ...DEFAULT_SITE_TEXTS });
  } catch (error) {
    console.warn('[FZAC] No se pudieron cargar los textos administrables. Se usa el contenido local.', error.message);
    return { ...DEFAULT_SITE_TEXTS };
  }
}
