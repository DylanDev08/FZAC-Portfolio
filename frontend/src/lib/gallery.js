export function uniqueImages(images = []) {
  const seen = new Set();
  return (Array.isArray(images) ? images : [])
    .filter(Boolean)
    .filter((src) => {
      if (seen.has(src)) return false;
      seen.add(src);
      return true;
    });
}

export function imagesFromSource(source) {
  if (Array.isArray(source?.imagenes) && source.imagenes.length) {
    return uniqueImages(source.imagenes);
  }

  return uniqueImages([
    ...(Array.isArray(source?.imagenesAntes) ? source.imagenesAntes : []),
    ...(Array.isArray(source?.imagenesProceso) ? source.imagenesProceso : []),
    ...(Array.isArray(source?.imagenesFinal) ? source.imagenesFinal : []),
  ]);
}

export function buildGalleryGroupsFromSource(source) {
  return [
    ['Antes', 'Estado inicial / cómo estaba el espacio.', source?.imagenesAntes],
    ['En proceso', 'Avances, preparación y ejecución de obra.', source?.imagenesProceso],
    ['Después', 'Resultado final y obra terminada.', source?.imagenesFinal],
  ]
    .map(([title, text, images]) => ({
      title,
      text,
      images: uniqueImages(images),
    }))
    .filter((group) => group.images.length);
}

export function flattenGalleryGroups(groups = []) {
  const seen = new Set();

  return (Array.isArray(groups) ? groups : [])
    .flatMap((group = {}) => {
      const images = uniqueImages(group.images);

      return images
        .filter((src) => {
          if (seen.has(src)) return false;
          seen.add(src);
          return true;
        })
        .map((src, imageIndex) => ({
          src,
          stage: group.title,
          stageText: group.text,
          imageIndex,
          stageTotal: images.length,
        }));
    });
}
