import { useEffect } from 'react';

const DEFAULT_DESCRIPTION = 'Fortaleza Construcciones: obras comerciales y residenciales, Steel Framing, Drywall, construcción en seco, construcción húmeda y terminaciones profesionales en Rosario y Santa Fe.';
const DEFAULT_IMAGE = '/assets/img/logo/fzac-logo.jpg';

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

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export default function Seo({
  title = 'Fortaleza Construcciones | Obras, Steel Framing y Construcción en Seco',
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  canonicalPath = '/',
}) {
  useEffect(() => {
    const cleanTitle = String(title).trim();
    const cleanDescription = String(description || DEFAULT_DESCRIPTION).trim();
    const cleanImage = String(image || DEFAULT_IMAGE).trim();
    const origin = window.location.origin;
    const canonical = canonicalPath?.startsWith('http') ? canonicalPath : `${origin}${canonicalPath || window.location.pathname}`;
    const absoluteImage = cleanImage.startsWith('http') ? cleanImage : `${origin}${cleanImage}`;

    document.title = cleanTitle;
    upsertMeta('meta[name="description"]', { content: cleanDescription });
    upsertMeta('meta[name="robots"]', { content: 'index, follow' });
    upsertMeta('meta[property="og:title"]', { content: cleanTitle });
    upsertMeta('meta[property="og:description"]', { content: cleanDescription });
    upsertMeta('meta[property="og:type"]', { content: type });
    upsertMeta('meta[property="og:url"]', { content: canonical });
    upsertMeta('meta[property="og:image"]', { content: absoluteImage });
    upsertMeta('meta[name="twitter:card"]', { content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { content: cleanTitle });
    upsertMeta('meta[name="twitter:description"]', { content: cleanDescription });
    upsertMeta('meta[name="twitter:image"]', { content: absoluteImage });
    upsertLink('canonical', canonical);
  }, [title, description, image, type, canonicalPath]);

  return null;
}
