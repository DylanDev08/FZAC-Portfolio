import { useEffect } from 'react';

const SITE_NAME = 'Fortaleza Construcciones';
const SITE_URL = String(import.meta.env.VITE_PUBLIC_SITE_URL || 'https://fortalezaconstrucciones.com.ar').replace(/\/$/, '');
const DEFAULT_DESCRIPTION = 'Fortaleza Construcciones: obras comerciales y residenciales, reformas, Steel Framing, Drywall, construcción en seco, construcción húmeda, instalaciones y terminaciones profesionales en Rosario y Santa Fe.';
const DEFAULT_KEYWORDS = 'Fortaleza Construcciones, FZAC, constructora en Rosario, obras comerciales Rosario, reformas Rosario, Steel Framing Rosario, Drywall Rosario, construcción en seco, construcción húmeda, plomería, electricidad, pintura, terminaciones, Santa Fe';
const DEFAULT_IMAGE = '/assets/img/logo/fzac-logo.webp';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    const match = selector.match(/\[(name|property)="([^"]+)"\]/);
    if (match) element.setAttribute(match[1], match[2]);
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

function upsertLink(rel, href, attributes = {}) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

function upsertJsonLd(id, payload) {
  let element = document.head.querySelector(`script#${id}`);
  if (!element) {
    element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(payload);
}

function absoluteUrl(value, origin = SITE_URL) {
  const clean = String(value || '').trim();
  if (!clean) return origin;
  if (clean.startsWith('http')) return clean;
  return `${origin}${clean.startsWith('/') ? clean : `/${clean}`}`;
}

export default function Seo({
  title = 'Fortaleza Construcciones | Obras, Steel Framing y Construcción en Seco',
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  type = 'website',
  canonicalPath = '/',
}) {
  useEffect(() => {
    const cleanTitle = String(title).trim();
    const cleanDescription = String(description || DEFAULT_DESCRIPTION).trim();
    const cleanKeywords = String(keywords || DEFAULT_KEYWORDS).trim();
    const canonical = canonicalPath?.startsWith('http') ? canonicalPath : absoluteUrl(canonicalPath || window.location.pathname);
    const absoluteImage = absoluteUrl(image || DEFAULT_IMAGE);
    const schemaType = type === 'article' ? 'Article' : 'WebPage';

    document.title = cleanTitle;
    upsertMeta('meta[name="description"]', { content: cleanDescription });
    upsertMeta('meta[name="keywords"]', { content: cleanKeywords });
    upsertMeta('meta[name="author"]', { content: SITE_NAME });
    upsertMeta('meta[name="robots"]', { content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
    upsertMeta('meta[name="googlebot"]', { content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
    upsertMeta('meta[name="geo.region"]', { content: 'AR-S' });
    upsertMeta('meta[name="geo.placename"]', { content: 'Rosario, Santa Fe, Argentina' });
    upsertMeta('meta[name="geo.position"]', { content: '-32.9442;-60.6505' });
    upsertMeta('meta[name="ICBM"]', { content: '-32.9442, -60.6505' });

    upsertMeta('meta[property="og:title"]', { content: cleanTitle });
    upsertMeta('meta[property="og:description"]', { content: cleanDescription });
    upsertMeta('meta[property="og:type"]', { content: type });
    upsertMeta('meta[property="og:url"]', { content: canonical });
    upsertMeta('meta[property="og:image"]', { content: absoluteImage });
    upsertMeta('meta[property="og:image:alt"]', { content: `${SITE_NAME} - portfolio de obras` });
    upsertMeta('meta[property="og:site_name"]', { content: SITE_NAME });
    upsertMeta('meta[property="og:locale"]', { content: 'es_AR' });

    upsertMeta('meta[name="twitter:card"]', { content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { content: cleanTitle });
    upsertMeta('meta[name="twitter:description"]', { content: cleanDescription });
    upsertMeta('meta[name="twitter:image"]', { content: absoluteImage });
    upsertMeta('meta[name="twitter:image:alt"]', { content: `${SITE_NAME} - portfolio de obras` });

    upsertLink('canonical', canonical);

    upsertJsonLd('fzac-page-schema', {
      '@context': 'https://schema.org',
      '@type': schemaType,
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: cleanTitle,
      description: cleanDescription,
      inLanguage: 'es-AR',
      image: absoluteImage,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      about: {
        '@type': 'LocalBusiness',
        name: SITE_NAME,
        areaServed: ['Rosario', 'Santa Fe', 'Argentina'],
      },
    });
  }, [title, description, keywords, image, type, canonicalPath]);

  return null;
}
