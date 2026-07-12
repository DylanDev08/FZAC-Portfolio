export function uniqueImages(images = []) {
  const seen = new Set();
  return (Array.isArray(images) ? images : [])
    .map((item) => typeof item === 'string' ? item : (item?.url || item?.publicUrl || item?.imageUrl || item?.image_url || ''))
    .filter(Boolean)
    .filter((src) => {
      if (seen.has(src)) return false;
      seen.add(src);
      return true;
    });
}

export function imagesFromSource(source) {
  return uniqueImages([
    source?.portada,
    ...(Array.isArray(source?.imagenesAntes) ? source.imagenesAntes : []),
    ...(Array.isArray(source?.imagenesProceso) ? source.imagenesProceso : []),
    ...(Array.isArray(source?.imagenesFinal) ? source.imagenesFinal : []),
    ...(Array.isArray(source?.imagenes) ? source.imagenes : []),
  ]);
}

export function buildGalleryGroupsFromSource(source) {
  const seen = new Set();
  const groups = [
    ['Portada', 'Vista principal de la obra o del local.', source?.portada ? [source.portada] : []],
    ['Antes', 'Estado inicial / cómo estaba el espacio.', source?.imagenesAntes],
    ['En proceso', 'Avances, preparación y ejecución de obra.', source?.imagenesProceso],
    ['Después', 'Resultado final y obra terminada.', source?.imagenesFinal],
    ['Galería', 'Registro visual complementario de la obra.', source?.imagenes],
  ];

  return groups
    .map(([title, text, images]) => ({
      title,
      text,
      images: uniqueImages(images).filter((src) => {
        if (seen.has(src)) return false;
        seen.add(src);
        return true;
      }),
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
