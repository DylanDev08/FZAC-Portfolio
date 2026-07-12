import { listWorks } from '../models/admin.model.js';
import { prisma } from '../db/prisma.js';

try {
  const works = await listWorks();
  console.table(works.map((work) => ({
    slug: work.slug,
    nombre: work.nombre,
    fotos: work.workImages.length,
    sucursales: work.sucursales.length,
    estado: work.estado,
  })));

  const fileName = (value = '') => decodeURIComponent(String(value).split('?')[0].split('/').pop() || '');
  for (const work of works.filter((item) => ['marvel', 'sliders-hamburger'].includes(item.slug))) {
    for (const branch of work.sucursales) {
      console.log(JSON.stringify({
        obra: work.slug,
        sucursal: branch.nombre,
        portada: fileName(branch.portada),
        antes: (branch.imagenesAntes || []).map(fileName),
        proceso: (branch.imagenesProceso || []).map(fileName),
        final: (branch.imagenesFinal || []).map(fileName),
        general: (branch.imagenes || []).map(fileName),
      }));
    }
  }
} finally {
  await prisma.$disconnect();
}
