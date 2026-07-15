// Datos locales curados para el portfolio público.
// Slugs estables: son usados por rutas, SEO y redirects de produccion.

const unique = (items) => items.filter(Boolean).filter((item, index, array) => array.indexOf(item) === index);
const obra = (path) => `/assets/img/obras/${path}`;

const makeGallery = ({ portada, inicio = [], proceso = [], final = [], extra = [] }) => {
  const cover = portada || inicio[0] || proceso[0] || final[0] || extra[0] || '';
  const imagenesAntes = unique(inicio.filter((src) => src !== cover));
  const imagenesProceso = unique(proceso.filter((src) => src !== cover));
  const imagenesFinal = unique(final.filter((src) => src !== cover));
  const imagenes = unique([cover, ...inicio, ...proceso, ...final, ...extra]);

  return {
    portada: cover,
    imagenes,
    imagenesAntes,
    imagenesProceso,
    imagenesFinal,
  };
};

export const portfolioLocations = [
  { brand: 'Sliders Hamburgers', name: 'Jujuy', address: 'Jujuy 2514, Rosario, Santa Fe', slug: 'sliders-hamburger' },
  { brand: 'Sliders Hamburgers', name: 'Juan Manuel de Rosas', address: 'Juan Manuel de Rosas 1062, Rosario, Santa Fe', slug: 'sliders-hamburger' },
  { brand: 'Sliders Hamburgers', name: 'Funes', address: 'Ruta Nacional 9 1832, Funes, Santa Fe', slug: 'sliders-hamburger' },
  { brand: 'Marvel’s Food', name: 'Pellegrini', address: 'Av. Pellegrini 1149, Rosario, Santa Fe', slug: 'marvel' },
  { brand: 'Marvel’s Food', name: 'Rondeau 2430', address: 'Rondeau 2430, Rosario, Santa Fe', slug: 'marvel' },
  { brand: 'Marvel’s Food', name: 'Funes', address: 'Ruta Nacional 9 972, Funes, Santa Fe', slug: 'marvel' },
  { brand: 'Marvel’s Food', name: 'Viamonte', address: 'Viamonte 1434, Rosario, Santa Fe', slug: 'marvel' },
  { brand: 'Burger House Grill', name: 'Pellegrini', address: 'Av. Pellegrini 916, Rosario, Santa Fe', slug: 'burger-house' },
  { brand: 'Burger House Grill', name: 'Mariano Perdriel', address: 'Mariano Perdriel 115, Rosario, Santa Fe', slug: 'burger-house' },
  { brand: 'Armstrong', name: 'Santa Fe', address: 'Armstrong, Santa Fe', slug: 'armstrong' },
];

const slidersJujuy = makeGallery({
  portada: obra('sliders-jujuy/sliders-jujuy-final-01.jpg'),
  inicio: [
    obra('sliders-jujuy/sliders-jujuy-inicio-01.jpg'),
    obra('sliders-jujuy/sliders-jujuy-inicio-02.jpg'),
    obra('sliders-jujuy/sliders-jujuy-inicio-03.jpg'),
    obra('sliders-jujuy/sliders-jujuy-inicio-04.jpg'),
  ],
  final: [
    obra('sliders-jujuy/sliders-jujuy-final-02.jpg'),
    obra('sliders-jujuy/sliders-jujuy-final-03.jpg'),
  ],
});

const slidersRosas = makeGallery({
  portada: obra('sliders-rosas/sliders-rosas-final-01.jpg'),
  proceso: [
    obra('sliders-rosas/sliders-rosas-inicio-02.jpg'),
    obra('sliders-rosas/sliders-rosas-inicio-03.jpg'),
    obra('sliders-rosas/sliders-rosas-inicio-01.jpg'),
    obra('sliders-rosas/sliders-rosas-final-04.jpg'),
  ],
  final: [
    obra('sliders-rosas/sliders-rosas-final-02.jpg'),
    obra('sliders-rosas/sliders-rosas-final-03.webp'),
  ],
});

const slidersFunes = makeGallery({
  portada: obra('sliders-funes/sliders-funes-final-05.jpg'),
  inicio: [
    obra('sliders-funes/sliders-funes-inicio-01.jpg'),
    obra('sliders-funes/sliders-funes-inicio-02.jpg'),
  ],
  final: [
    obra('sliders-funes/sliders-funes-final-01.jpg'),
    obra('sliders-funes/sliders-funes-final-02.jpg'),
    obra('sliders-funes/sliders-funes-final-03.jpg'),
    obra('sliders-funes/sliders-funes-final-04.jpg'),
  ],
});

const marvelPellegrini = makeGallery({
  portada: obra('marvel-pellegrini/marvel-pellegrini-02.jpg'),
  proceso: [obra('marvel-pellegrini/05.jpg')],
  final: [
    obra('marvel-pellegrini/04.jpg'),
    obra('marvel-pellegrini/09.jpg'),
    obra('marvel-pellegrini/10.jpg'),
  ],
});

const marvelRondeau = makeGallery({
  portada: obra('marvel-rondeau/marvel-rondeau-final-01.jpg'),
  proceso: [
    obra('marvel-rondeau/marvel-rondeau-inicio-01.jpg'),
    obra('marvel-rondeau/marvel-rondeau-inicio-02.jpg'),
    obra('marvel-rondeau/marvel-rondeau-inicio-03.jpg'),
    obra('marvel-rondeau/marvel-rondeau-final-02.jpg'),
  ],
  final: [
    obra('marvel-rondeau/marvel-rondeau-final-03.webp'),
  ],
});

const marvelFunes = makeGallery({
  portada: obra('marvel-funes/marvel-funes-frente.jpg'),
  final: [
    obra('marvel-funes/marvel-funes-dibujos.jpg'),
    obra('marvel-funes/01.jpg'),
    obra('marvel-funes/03.jpg'),
  ],
});

const marvelViamonte = makeGallery({
  portada: obra('marvel-viamonte/00-portada-viamonte.jpg'),
  inicio: [
    obra('marvel-viamonte/marvel-viamonte-inicio-01.jpg'),
    obra('marvel-viamonte/marvel-viamonte-inicio-02.jpg'),
    obra('marvel-viamonte/marvel-viamonte-inicio-03.jpg'),
    obra('marvel-viamonte/marvel-viamonte-inicio-04.jpg'),
  ],
  final: [
    obra('marvel-viamonte/marvel-viamonte-final-01.jpg'),
    obra('marvel-viamonte/marvel-viamonte-final-02.jpg'),
    obra('marvel-viamonte/marvel-viamonte-final-03.jpg'),
  ],
});

const burgerPellegrini = makeGallery({
  portada: obra('burger-house-pellegrini/BurgerHousePellegriniFinal01.webp'),
  inicio: [
    obra('burger-house-pellegrini/burger-pellegrini-inicio-01.jpg'),
    obra('burger-house-pellegrini/burger-pellegrini-inicio-02.jpg'),
    obra('burger-house-pellegrini/burger-pellegrini-inicio-03.jpg'),
  ],
  final: [
    obra('burger-house-pellegrini/BurgerHousePellegriniFinal02.webp'),
    obra('burger-house-pellegrini/BurgerHousePellegriniFinal03.webp'),
  ],
});

const burgerFlorida = makeGallery({
  portada: obra('burger-house-florida/burger-florida-final-01.jpg'),
  inicio: [
    obra('burger-house-florida/burger-florida-antes-01.jpg'),
    obra('burger-house-florida/burger-florida-antes-02.jpg'),
  ],
  final: [
    obra('burger-house-florida/burger-florida-final-02.jpg'),
    obra('burger-house-florida/burger-florida-final-03.jpg'),
    obra('burger-house-florida/burger-florida-final-04.webp'),
  ],
});

const armstrong = makeGallery({
  portada: obra('armstrong/05.jpg'),
  proceso: [
    obra('armstrong/02.jpg'),
  ],
  final: [
    obra('armstrong/08.jpg'),
    obra('armstrong/09.jpg'),
    obra('armstrong/11.jpg'),
  ],
});

const fichines = makeGallery({
  portada: obra('fichines/fichines-final-fachada.jpeg'),
  inicio: [
    obra('fichines/fichines-clean-01.jpg'),
    obra('fichines/fichines-antes-terraza.jpeg'),
    obra('fichines/fichines-antes-interior.jpeg'),
  ],
  proceso: [obra('fichines/foto-3.jpg')],
  final: [
    obra('fichines/fichines-final-maquinas.jpeg'),
    obra('fichines/fichines-final-pool.jpeg'),
  ],
});

const flama = makeGallery({});

const roldan = makeGallery({
  portada: obra('roldan/portada.jpg'),
  inicio: [
    obra('roldan/foto-1.jpg'),
    obra('roldan/foto-2.jpg'),
    obra('roldan/foto-3.jpg'),
    obra('roldan/foto-4.jpg'),
  ],
});

const drywallGallery = unique([
  obra('trabajos-varios/drywall/drywall-casas-01.jpg'),
  obra('trabajos-varios/drywall/drywall-casas-02.jpg'),
  obra('trabajos-varios/drywall/drywall-casas-03.jpg'),
  obra('trabajos-varios/drywall/drywall-inicio-01.jpg'),
  obra('trabajos-varios/drywall/drywall-inicio-02.jpg'),
  obra('trabajos-varios/drywall/drywall-inicio-03.jpg'),
  obra('trabajos-varios/drywall/drywall-final-01.jpg'),
  obra('trabajos-varios/drywall/drywall-final-02.jpg'),
  obra('trabajos-varios/drywall/drywall-final-03.jpg'),
]);

const construccionSecoGallery = unique([
  obra('trabajos-varios/construccion-en-seco/construccion-seco-01.jpg'),
  obra('trabajos-varios/construccion-en-seco/construccion-seco-02.jpg'),
  obra('trabajos-varios/construccion-en-seco/IMG-20210507-WA0196-1-.jpg'),
  obra('trabajos-varios/construccion-en-seco/IMG-20210509-WA0007-1-.jpeg'),
]);

const construccionHumedaGallery = unique([
  obra('trabajos-varios/construccion-humeda/construccion-humeda-01.jpg'),
  obra('trabajos-varios/construccion-humeda/IMG-20210518-WA0085-1-.jpg'),
  obra('trabajos-varios/construccion-humeda/IMG-20210518-WA0085-2-.jpg'),
]);

const electricidadGallery = unique([
  obra('trabajos-varios/electricidad/Electricidad-fzac-01-v2.jpg'),
  obra('trabajos-varios/electricidad/Electricidad-fzac-02-v2.jpg'),
  obra('trabajos-varios/electricidad/Electricidad-fzac-03-v2.jpg'),
  obra('trabajos-varios/electricidad/Electricidad-fzac-04-v2.jpg'),
]);

const plomeriaGallery = unique([
  obra('trabajos-varios/servicios-integrales-finalizados/plomería-01.jpg'),
  obra('trabajos-varios/plomeria/Plomeria-fzac-01-v2.jpg'),
  obra('trabajos-varios/plomeria/Plomeria-fzac-02-v2.jpg'),
  obra('trabajos-varios/plomeria/Plomeria-fzac-03-v2.jpg'),
]);

const instalacionCeramicosGallery = unique([
  obra('trabajos-varios/instalacion-ceramicos/instalacion-ceramicos-inicio-01.jpg'),
  obra('trabajos-varios/instalacion-ceramicos/instalacion-ceramicos-final-01.jpg'),
  obra('trabajos-varios/instalacion-ceramicos/instalacion-ceramicos-final-02.jpg'),
  obra('trabajos-varios/instalacion-ceramicos/instalacionCeramicos-final-03.jpg'),
]);

const pinturaRevestimientosGallery = [];

const sistemaAluminioGallery = unique([
  obra('trabajos-varios/sistema-aluminio-completo/sistema-aluminio-01.jpg'),
  obra('trabajos-varios/sistema-aluminio-completo/sistema-aluminio-02.jpg'),
  obra('trabajos-varios/sistema-aluminio-completo/sistema-aluminio-03.jpg'),
  obra('trabajos-varios/sistema-aluminio-completo/sistema-aluminio-04.jpg'),
  obra('trabajos-varios/sistema-aluminio-completo/sistema-aluminio-05.jpg'),
  obra('trabajos-varios/sistema-aluminio-completo/sistema-aluminio-06.jpg'),
  obra('trabajos-varios/sistema-aluminio-completo/sistema-aluminio-07.jpg'),
]);

const cielorrasosGallery = unique([
  obra('trabajos-varios/cielorraso/cielorraso-01.jpg'),
  obra('trabajos-varios/cielorraso/cielorraso-02.jpg'),
  obra('trabajos-varios/cielorraso/cielorras-fzac-03.jpg'),
  obra('trabajos-varios/cielorraso/cielorras-fzac-04.jpg'),
]);

const localesAmbientacionesGallery = unique([
  obra('trabajos-varios/dark-side/dark-side-01.jpg'),
  obra('trabajos-varios/dark-side/dark-side-02.jpg'),
  obra('trabajos-varios/dark-side/dark-side-03.jpg'),
  obra('trabajos-varios/dark-side/dark-side-04.jpg'),
  obra('trabajos-varios/dark-side/dark-side-05.jpg'),
  obra('trabajos-varios/dark-side/dark-side-06.jpg'),
  obra('trabajos-varios/dark-side/dark-side-07.jpg'),
  obra('trabajos-varios/dark-side/dark-side-08.jpg'),
]);

const institucionalesGallery = unique([
  obra('trabajos-varios/sindicato-empleados/sindicato-empleados-01.jpg'),
  obra('trabajos-varios/sindicato-empleados/sindicato-empleados-02.jpg'),
  obra('trabajos-varios/sindicato-empleados/sindicato-empleados-04.jpg'),
  obra('trabajos-varios/sindicato-empleados/sindicato-empleados-05.jpg'),
  obra('trabajos-varios/sindicato-empleados/sindicato-empleados-06.jpg'),
]);

const casasGallery = [];

const fachadasGallery = [];

const interioresGallery = [];

const slidersAll = unique([...slidersJujuy.imagenes, ...slidersRosas.imagenes, ...slidersFunes.imagenes]);
const marvelAll = unique([...marvelPellegrini.imagenes, ...marvelRondeau.imagenes, ...marvelFunes.imagenes, ...marvelViamonte.imagenes]);
const burgerAll = unique([...burgerPellegrini.imagenes, ...burgerFlorida.imagenes]);

export const fallbackProjects = [
  {
    id: 'sliders-hamburger',
    slug: 'sliders-hamburger',
    aliases: ['slider', 'sliders', 'sliders-hamburgers'],
    nombre: 'Sliders Hamburgers',
    tipo: 'Locales gastronómicos',
    categoria: 'Marca gastronómica',
    esFranquicia: true,
    resumenPortada: '3 locales',
    direccion: 'Jujuy 2514 · Juan Manuel de Rosas 1062 · Ruta Nacional 9 1832',
    ubicacion: 'Rosario y Funes, Santa Fe',
    anio: '2025',
    estado: 'finalizada',
    avance: 100,
    destacado: true,
    order: 1,
    descripcion: 'Ejecución integral de tres locales gastronómicos, desde la preparación de cada espacio hasta las instalaciones, terminaciones y aplicación de la identidad comercial.',
    portada: slidersFunes.portada || slidersAll[0],
    imagenes: slidersAll,
    imagenesAntes: slidersAll,
    imagenesProceso: [],
    imagenesFinal: [],
    sucursales: [
      {
        nombre: 'Sliders Hamburgers — Jujuy 2514',
        direccion: 'Jujuy 2514, Rosario, Santa Fe',
        ubicacion: 'Rosario',
        descripcion: 'Ejecución del local de Jujuy 2514, con trabajos de obra interior, frente comercial y terminaciones.',
        portada: slidersJujuy.portada,
        ...slidersJujuy,
      },
      {
        nombre: 'Sliders Hamburgers — Juan Manuel de Rosas 1062',
        direccion: 'Juan Manuel de Rosas 1062, Rosario, Santa Fe',
        ubicacion: 'Rosario',
        descripcion: 'Desarrollo del local de Juan Manuel de Rosas 1062, con adecuación del espacio e identidad de marca.',
        portada: slidersRosas.portada,
        ...slidersRosas,
      },
      {
        nombre: 'Sliders Hamburgers — Ruta Nacional 9 1832',
        direccion: 'Ruta Nacional 9 1832, Funes, Santa Fe',
        ubicacion: 'Funes',
        descripcion: 'Construcción y terminación del local de Funes, sobre Ruta Nacional 9.',
        portada: slidersFunes.portada,
        ...slidersFunes,
      },
    ],
    video: '',
    galeriaVideo: [],
    stages: ['Planificación', 'Ejecución integral', 'Terminaciones', 'Entrega final'],
    proceso: 'Planificación y ejecución coordinada según las condiciones y necesidades de cada sucursal.',
    finalizacion: 'Tres locales entregados con una identidad consistente y soluciones adaptadas a cada ubicación.',
  },
  {
    id: 'marvel',
    slug: 'marvel',
    aliases: ['marvel-food', 'marvels-food'],
    nombre: 'Marvel’s Food',
    tipo: 'Locales gastronómicos',
    categoria: 'Marca gastronómica',
    esFranquicia: true,
    resumenPortada: '4 locales',
    direccion: 'Pellegrini · Rondeau · Funes · Viamonte',
    ubicacion: 'Rosario y Funes, Santa Fe',
    anio: '2025',
    estado: 'finalizada',
    avance: 100,
    destacado: true,
    order: 2,
    descripcion: 'Desarrollo de cuatro locales gastronómicos, integrando obra civil, frentes comerciales, revestimientos, iluminación y terminaciones acordes a la identidad de la marca.',
    portada: marvelPellegrini.portada || marvelAll[0],
    imagenes: marvelAll,
    imagenesAntes: marvelAll,
    imagenesProceso: [],
    imagenesFinal: [],
    sucursales: [
      {
        nombre: 'Marvel’s Food — Av. Pellegrini 1149',
        direccion: 'Av. Pellegrini 1149, Rosario, Santa Fe',
        ubicacion: 'Rosario',
        descripcion: 'Intervención del local de Av. Pellegrini, con renovación del frente, el salón y las terminaciones interiores.',
        portada: marvelPellegrini.portada,
        ...marvelPellegrini,
      },
      {
        nombre: 'Marvel’s Food — Rondeau 2430',
        direccion: 'Rondeau 2430, Rosario, Santa Fe',
        ubicacion: 'Rosario',
        descripcion: 'Ejecución del local de Rondeau 2430, desde la adecuación inicial hasta la puesta a punto del espacio comercial.',
        portada: marvelRondeau.portada,
        ...marvelRondeau,
      },
      {
        nombre: 'Marvel’s Food — Ruta Nacional 9 972',
        direccion: 'Ruta Nacional 9 972, Funes, Santa Fe',
        ubicacion: 'Funes',
        descripcion: 'Desarrollo del local de Funes, con frente comercial, ambientación interior e identidad gráfica aplicada.',
        portada: marvelFunes.portada,
        ...marvelFunes,
      },
      {
        nombre: 'Marvel’s Food — Viamonte 1434',
        direccion: 'Viamonte 1434, Rosario, Santa Fe',
        ubicacion: 'Rosario',
        descripcion: 'Transformación del local de Viamonte 1434, incluyendo obra interior, instalaciones y terminaciones finales.',
        portada: marvelViamonte.portada,
        ...marvelViamonte,
      },
    ],
    video: '',
    galeriaVideo: [],
    stages: ['Planificación', 'Ejecución integral', 'Identidad comercial', 'Entrega final'],
    proceso: 'Cada local se resolvió de acuerdo con su distribución, su entorno y las necesidades operativas de la marca.',
    finalizacion: 'Cuatro espacios comerciales terminados y listos para su funcionamiento.',
  },
  {
    id: 'burger-house',
    slug: 'burger-house',
    nombre: 'Burger House Grill',
    tipo: 'Locales gastronómicos',
    categoria: 'Marca gastronómica',
    esFranquicia: false,
    resumenPortada: 'Pellegrini y Mariano Perdriel',
    direccion: 'Av. Pellegrini 916 · Mariano Perdriel 115',
    ubicacion: 'Rosario, Santa Fe',
    anio: '2025',
    estado: 'finalizada',
    avance: 100,
    destacado: true,
    order: 3,
    descripcion: 'Ejecución integral de dos locales gastronómicos, con adecuación del espacio, ambientación comercial, instalaciones y terminaciones interiores.',
    portada: burgerPellegrini.portada || burgerFlorida.portada,
    imagenes: burgerAll,
    imagenesAntes: [],
    imagenesProceso: [],
    imagenesFinal: [],
    sucursales: [
      {
        nombre: 'Burger House Grill Pellegrini',
        direccion: 'Av. Pellegrini 916, Rosario, Santa Fe',
        ubicacion: 'Rosario',
        descripcion: 'Desarrollo del local de Av. Pellegrini 916, con intervención interior y resolución de la imagen comercial.',
        portada: burgerPellegrini.portada,
        ...burgerPellegrini,
      },
      {
        nombre: 'Burger House Grill Mariano Perdriel',
        direccion: 'Mariano Perdriel 115, Rosario, Santa Fe',
        ubicacion: 'Rosario',
        descripcion: 'Ejecución del local de Mariano Perdriel 115, desde la preparación inicial hasta el frente y las terminaciones finales.',
        portada: burgerFlorida.portada,
        ...burgerFlorida,
      },
    ],
    video: '',
    galeriaVideo: [],
    stages: ['Planificación', 'Ejecución integral', 'Ambientación', 'Entrega final'],
    proceso: 'Coordinación integral de obra y terminaciones, respetando la identidad y la operación de cada local.',
    finalizacion: 'Dos locales finalizados con soluciones funcionales y una imagen comercial coherente.',
  },
  {
    id: 'armstrong',
    slug: 'armstrong',
    aliases: ['amstrong'],
    nombre: 'Armstrong — Santa Fe',
    tipo: 'Proyecto residencial',
    categoria: 'Residencial',
    esFranquicia: false,
    resumenPortada: '',
    direccion: 'Armstrong, Santa Fe',
    ubicacion: 'Armstrong, Santa Fe',
    anio: '2026',
    estado: 'finalizada',
    avance: 100,
    destacado: false,
    order: 4,
    descripcion: 'Intervención residencial en Armstrong, con trabajos en fachada, galería e interiores, colocación de revestimientos y terminaciones generales.',
    portada: armstrong.portada,
    ...armstrong,
    video: '',
    galeriaVideo: [],
    stages: ['Ejecución exterior', 'Interiores', 'Terminaciones', 'Finalización'],
    proceso: 'La obra se desarrolló por sectores para coordinar tareas exteriores, interiores y detalles de terminación.',
    finalizacion: 'Vivienda finalizada con espacios renovados y terminaciones listas para su uso.',
  },
  {
    id: 'fichines',
    slug: 'fichines',
    nombre: 'Fichines',
    tipo: 'Local recreativo',
    categoria: 'Comercial',
    esFranquicia: false,
    direccion: 'Jujuy 2254, Rosario, Santa Fe',
    ubicacion: 'Rosario, Santa Fe',
    anio: '2026',
    estado: 'finalizada',
    avance: 100,
    order: 5,
    descripcion: 'Acondicionamiento integral de un local recreativo, con intervención de fachada, distribución interior y preparación de los sectores de juegos.',
    portada: fichines.portada,
    ...fichines,
    video: '',
    galeriaVideo: [],
    stages: ['Inicio de obra', 'Preparación del espacio', 'Desarrollo interior', 'Entrega final'],
    proceso: 'Adecuación del espacio, resolución de circulaciones y ejecución de las terminaciones interiores y exteriores.',
    finalizacion: 'Local entregado con fachada e interiores listos para recibir al público.',
  },
  {
    id: 'flama',
    slug: 'flama',
    nombre: 'Local de Flama',
    tipo: 'Local comercial',
    categoria: 'Comercial',
    esFranquicia: false,
    direccion: 'Jujuy 2238, Rosario, Santa Fe',
    ubicacion: 'Rosario, Santa Fe',
    anio: '2026',
    estado: 'por-comenzar',
    avance: 0,
    order: 6,
    descripcion: 'Próxima intervención comercial en Jujuy 2238, Rosario, actualmente en etapa de relevamiento y definición de alcance.',
    portada: flama.portada,
    ...flama,
    video: '',
    galeriaVideo: [],
    stages: ['Relevamiento', 'Planificación', 'Seguimiento de obra'],
    proceso: 'Relevamiento del espacio y planificación de las tareas necesarias antes del inicio de obra.',
    finalizacion: 'Proyecto en planificación.',
  },
  {
    id: 'roldan',
    slug: 'roldan',
    nombre: 'Roldán',
    tipo: 'Vivienda residencial',
    categoria: 'Residencial',
    esFranquicia: false,
    direccion: 'Roldán, Santa Fe',
    ubicacion: 'Roldán, Santa Fe',
    anio: '2025',
    estado: 'por-comenzar',
    avance: 0,
    order: 7,
    descripcion: 'Proyecto residencial en Roldán, en etapa de planificación y preparación para el inicio de obra.',
    portada: roldan.portada,
    ...roldan,
    video: '',
    galeriaVideo: [],
    stages: ['Planificación', 'Organización de recursos', 'Inicio de obra'],
    proceso: 'Definición de etapas, recursos y prioridades para comenzar la ejecución.',
    finalizacion: 'Obra por iniciar.',
  },
];

export const trabajosVariosItems = [
  {
    id: 'trabajos-varios',
    slug: 'trabajos-varios',
    nombre: 'Trabajos varios',
    titulo: 'Trabajos varios',
    tipo: 'Servicios por rubro',
    categoria: 'Servicios',
    ubicacion: 'Rosario y Santa Fe',
    anio: '2025',
    descripcion: 'Una selección de trabajos realizados por Fortaleza Construcciones, organizada por especialidad para mostrar la variedad de soluciones que ofrecemos.',
    portada: obra('trabajos-varios/instalacion-ceramicos/instalacionCeramicos-final-03.jpg'),
    imagenes: unique([
      ...drywallGallery,
      ...construccionSecoGallery,
      ...construccionHumedaGallery,
      ...electricidadGallery,
      ...plomeriaGallery,
      ...cielorrasosGallery,
      ...instalacionCeramicosGallery,
      ...sistemaAluminioGallery,
      ...localesAmbientacionesGallery,
      ...institucionalesGallery,
    ]),
    secciones: [
      {
        id: 'drywall',
        slug: 'drywall',
        titulo: 'Drywall',
        descripcion: 'Tabiquería, revestimientos, masillado y terminaciones interiores ejecutadas con sistema drywall.',
        imagenes: drywallGallery,
      },
      {
        id: 'construccion-en-seco',
        slug: 'construccion-en-seco',
        titulo: 'Steel Framing',
        descripcion: 'Soluciones livianas con placas y perfilería para interiores, ampliaciones y terminaciones técnicas.',
        imagenes: construccionSecoGallery,
      },
      {
        id: 'construccion-humeda',
        slug: 'construccion-humeda',
        titulo: 'Mampostería',
        descripcion: 'Trabajos de albañilería convencional, mampostería, revoques, carpetas y tareas de obra tradicional.',
        imagenes: construccionHumedaGallery,
      },
      {
        id: 'electricidad',
        slug: 'electricidad',
        titulo: 'Electricidad',
        descripcion: 'Canalizaciones, bocas, llaves, puntos eléctricos y preparación técnica para instalaciones de obra.',
        imagenes: electricidadGallery,
      },
      {
        id: 'plomeria',
        slug: 'plomeria',
        titulo: 'Plomería',
        descripcion: 'Instalaciones sanitarias, cañerías, desagües y soluciones técnicas vinculadas al funcionamiento de obra.',
        imagenes: plomeriaGallery,
      },
      {
        id: 'cielorrasos',
        slug: 'cielorrasos',
        titulo: 'Cielorrasos',
        descripcion: 'Montaje de cielorrasos, perfilería, placas y terminaciones superiores con criterio técnico.',
        imagenes: cielorrasosGallery,
      },
      {
        id: 'pisos-revestimientos',
        slug: 'pisos-revestimientos',
        titulo: 'Pisos y revestimientos cerámicos',
        descripcion: 'Colocación de pisos, cerámicos y revestimientos con terminaciones prolijas para espacios residenciales y comerciales.',
        imagenes: instalacionCeramicosGallery,
      },
      {
        id: 'sistemas-aluminio',
        slug: 'sistemas-aluminio',
        titulo: 'Sistemas de aluminio',
        descripcion: 'Cerramientos, frentes y soluciones de aluminio aplicadas a espacios interiores y exteriores.',
        imagenes: sistemaAluminioGallery,
      },
      {
        id: 'locales-ambientaciones',
        slug: 'locales-ambientaciones',
        titulo: 'Locales y ambientaciones',
        descripcion: 'Trabajos comerciales, ambientaciones independientes y espacios de atención al público.',
        imagenes: localesAmbientacionesGallery,
      },
      {
        id: 'trabajos-institucionales',
        slug: 'trabajos-institucionales',
        titulo: 'Trabajos institucionales',
        descripcion: 'Obras e intervenciones realizadas en espacios institucionales, laborales y de uso público.',
        imagenes: institucionalesGallery,
      },
    ],
    puntos: ['Drywall', 'Steel Framing', 'Mampostería', 'Electricidad', 'Plomería', 'Cielorrasos', 'Pisos y revestimientos', 'Aluminio', 'Locales comerciales', 'Institucionales'],
    destacado: true,
    order: 1,
  },
];
