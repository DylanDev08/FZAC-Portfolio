import { apiRequest, unwrapData } from './httpService.js';

export const DEFAULT_SITE_TEXTS = {
  'home.hero.title': 'Fortaleza Construcciones',
  'home.hero.subtitle': 'Desarrollamos obras comerciales y residenciales, integrando planificación, ejecución y control de obra.',
  'footer.terms': 'Este sitio expone obras, servicios, referencias visuales, canales de contacto y material institucional de Fortaleza Construcciones. El contenido se publica con fines informativos y comerciales.',
};

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
      if (row?.key && row?.value) texts[row.key] = row.value;
      return texts;
    }, { ...DEFAULT_SITE_TEXTS });
  } catch (error) {
    console.warn('[FZAC] No se pudieron cargar los textos administrables. Se usa el contenido local.', error.message);
    return { ...DEFAULT_SITE_TEXTS };
  }
}
