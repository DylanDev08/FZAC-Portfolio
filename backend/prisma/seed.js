import { prisma } from '../db/prisma.js';
import { env } from '../config/env.js';
import { syncPortfolioCatalog } from '../models/admin.model.js';
import { fallbackProjects } from '../../frontend/src/data/projects.js';

function slugify(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const categories = [
  { name: 'Locales comerciales', description: 'Obras para locales, fachadas, interiorismo y espacios de atención.', displayOrder: 1 },
  { name: 'Gastronomía', description: 'Bares, restaurantes, hamburgueserías y puntos gastronómicos.', displayOrder: 2 },
  { name: 'Entretenimiento', description: 'Locales de juegos, espacios recreativos y experiencias comerciales.', displayOrder: 3 },
  { name: 'Viviendas', description: 'Reformas, ampliaciones y obras residenciales.', displayOrder: 4 },
  { name: 'Trabajos varios', description: 'Servicios, mantenimiento, instalaciones y tareas puntuales.', displayOrder: 5 },
];

const siteTexts = [
  {
    key: 'home.hero.title',
    title: 'Título principal del inicio',
    value: 'Fortaleza Construcciones',
    section: 'home',
    description: 'Texto principal visible en la primera pantalla del portfolio.',
  },
  {
    key: 'home.hero.subtitle',
    title: 'Subtítulo principal del inicio',
    value: 'Planificación, ejecución y terminaciones para obras comerciales y residenciales.',
    section: 'home',
    description: 'Bajada institucional del hero.',
  },
  {
    key: 'footer.terms',
    title: 'Términos del portfolio',
    value: 'Este portfolio expone obras, servicios y registros visuales realizados por Fortaleza Construcciones.',
    section: 'footer',
    description: 'Texto legal breve visible o administrable para el pie del sitio.',
  },
];

async function main() {
  for (const adminEmail of env.adminEmails) {
    await prisma.profile.upsert({
      where: { email: adminEmail },
      update: { role: 'admin', name: 'Fortaleza Construcciones' },
      create: { email: adminEmail, role: 'admin', name: 'Fortaleza Construcciones' },
    });
  }

  for (const category of categories) {
    const slug = slugify(category.name);
    await prisma.category.upsert({
      where: { slug },
      update: category,
      create: { ...category, slug },
    });
  }

  for (const text of siteTexts) {
    await prisma.siteText.upsert({
      where: { key: text.key },
      update: text,
      create: text,
    });
  }

  const catalog = await syncPortfolioCatalog(fallbackProjects, env.adminEmails[0]);
  console.log(`[seed] Portfolio administrable sincronizado. Obras nuevas: ${catalog.created}. Total: ${catalog.total}.`);

  console.log('[seed] Categorías, textos iniciales y admin sincronizados.');
}

main()
  .catch((error) => {
    console.error('[seed] Error al cargar datos iniciales:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
