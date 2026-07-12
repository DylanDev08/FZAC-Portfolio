import { prisma } from '../db/prisma.js';
import { fallbackProjects } from '../../frontend/src/data/projects.js';

const targets = [
  { workSlug: 'marvel', addressPart: 'Rondeau 2430' },
  { workSlug: 'sliders-hamburger', addressPart: 'Juan Manuel de Rosas 1062' },
];

try {
  for (const target of targets) {
    const sourceWork = fallbackProjects.find((work) => work.slug === target.workSlug);
    const sourceBranch = sourceWork?.sucursales?.find((branch) => branch.direccion?.includes(target.addressPart));
    const storedWork = await prisma.work.findUnique({ where: { slug: target.workSlug } });
    const storedBranches = Array.isArray(storedWork?.branches) ? storedWork.branches : [];

    if (!sourceBranch || !storedWork) {
      throw new Error(`No se encontró ${target.workSlug} / ${target.addressPart}.`);
    }

    const nextBranches = storedBranches.map((branch) => (
      branch.direccion?.includes(target.addressPart) ? sourceBranch : branch
    ));

    await prisma.work.update({
      where: { id: storedWork.id },
      data: { branches: nextBranches },
    });

    const count = 1
      + sourceBranch.imagenesAntes.length
      + sourceBranch.imagenesProceso.length
      + sourceBranch.imagenesFinal.length;
    console.log(`[gallery-sync] ${target.addressPart}: ${count} fotos sincronizadas.`);
  }
} finally {
  await prisma.$disconnect();
}
