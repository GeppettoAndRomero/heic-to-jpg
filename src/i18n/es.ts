import type { ToolContent } from './types';

// Español. Transcreación basada en el vocabulario que usan los conversores HEIC en
// español, no traducción literal. Sin palabras publicitarias (fácil / rápido / perfecto…);
// la privacidad se explica de forma estructural, no como promesa. Español pan-regional
// (España y Latinoamérica), registro «tú». htmlLang 'es'. QA por revisor independiente.

export const es: ToolContent = {
  htmlLang: 'es',

  meta: {
    title: 'Convertir HEIC a JPG — en tu navegador, sin subir nada | runlocally',
    description:
      'Convierte fotos HEIC y HEIF (iPhone, iPad) a JPG o PNG directamente en tu navegador. Los archivos se procesan en tu dispositivo y no se suben a ningún sitio. Código abierto, funciona sin conexión.',
    ogTitle: 'Convertir HEIC a JPG — en tu navegador, sin subir nada',
    ogDescription:
      'Convierte fotos HEIC/HEIF a JPG o PNG en tu navegador. No se sube nada. Código abierto, funciona sin conexión.',
  },

  hero: {
    h1: 'Convertir HEIC a JPG',
    tagline:
      'Convierte fotos HEIC y HEIF del iPhone a JPG o PNG, en tu navegador. No se sube nada.',
  },

  intro: {
    h2: 'Convertir HEIC a JPG, en tu navegador',
    paras: [
      'Esta herramienta convierte fotos HEIC y HEIF —el formato que usan el iPhone y el iPad— a JPG o PNG. Windows, los dispositivos Android y muchos sitios web no pueden abrir HEIC de forma directa, así que a menudo hace falta convertirlo a un formato compatible con casi todo.',
      'La decodificación se ejecuta en el navegador con WebAssembly, por lo que también funciona donde el navegador no admite HEIC de forma nativa (Chrome, Edge y Firefox en Windows y Android).',
    ],
  },

  privacy: {
    h2: 'Por qué tus archivos no salen de tu dispositivo',
    lead: 'Aquí la privacidad es estructural, no una promesa. No hay un paso de subida porque no hay ningún servidor al que subir nada:',
    points: [
      'La conversión se ejecuta por completo en tu navegador.',
      'La página se sirve como archivos estáticos y no envía ninguna petición con los datos de tus imágenes.',
      'El código es abierto y cualquiera puede leerlo (MIT).',
      'Funciona sin conexión, algo que solo es posible porque nada sale del dispositivo.',
    ],
    note: 'Si quieres comprobarlo tú mismo, abre el panel de Red de tu navegador mientras conviertes: ninguna petición lleva tu archivo.',
    sourceLinkText: 'Leer el código fuente.',
  },

  howto: {
    h2: 'Cómo se usa',
    steps: [
      {
        h3: 'Elige los archivos',
        p: 'Haz clic para seleccionar archivos HEIC/HEIF, o suéltalos en cualquier parte de la página. Puedes añadir varios a la vez.',
      },
      {
        h3: 'Ajusta la configuración (opcional)',
        p: 'Elige JPG o PNG, fija la calidad del JPG o cambia el tamaño. Los valores por defecto dan buenos resultados.',
      },
      {
        h3: 'Descarga',
        p: 'Cada archivo se descarga al terminar; un lote se puede descargar como ZIP.',
      },
    ],
  },

  faqHeading: 'Preguntas frecuentes',
  faq: [
    {
      q: '¿Se suben mis fotos a algún sitio?',
      a: 'No. La conversión se ejecuta por completo en tu navegador. No hay ningún componente de servidor, así que tus archivos no tienen forma de salir del dispositivo. El código es abierto y puedes confirmarlo en el panel de Red de tu navegador.',
    },
    {
      q: '¿Qué es un archivo HEIC?',
      a: 'HEIC (High Efficiency Image Container) es el formato de imagen que el iPhone y el iPad usan por defecto desde iOS 11. Guarda las fotos en menos espacio que JPEG, pero Windows y muchos dispositivos Android o sitios web no pueden abrirlo de forma directa, así que a menudo hace falta convertirlo a JPG o PNG.',
    },
    {
      q: '¿Puedo convertir HEIC a JPG en Windows?',
      a: 'Sí. La decodificación se hace con WebAssembly (libheif), por lo que funciona en Chrome, Edge y Firefox en Windows aunque esos navegadores no puedan abrir HEIC de forma nativa.',
    },
    {
      q: '¿La conversión reduce la calidad?',
      a: 'La salida en JPG usa un ajuste de calidad regulable (92 % por defecto), que en la mayoría de las fotos se ve muy parecido al original. La salida en PNG es sin pérdidas a partir de la imagen ya decodificada.',
    },
    {
      q: '¿Funciona sin conexión?',
      a: 'Sí. Es una PWA. Tras la primera visita queda guardada en la caché, de modo que la conversión funciona sin conexión a la red. También puedes instalarla en tu pantalla de inicio.',
    },
    {
      q: '¿Hay un límite de tamaño o de número de archivos?',
      a: 'No hay un límite fijo. Como todo se ejecuta en tu navegador, el tope práctico depende de la memoria de tu dispositivo. Las imágenes muy grandes pueden ir más lentas o necesitar que se reduzca su tamaño.',
    },
  ],

  footer: {
    openSourceLabel: 'Código abierto (MIT)',
    partOf: 'parte de',
    brandTail: '— pequeñas herramientas que funcionan localmente en tu dispositivo.',
    colophon:
      'Creado y mantenido por Geppetto. Parte del código se escribe con ayuda de IA; la revisión y las decisiones son del responsable del proyecto.',
    securityText: 'Seguridad',
  },
};
