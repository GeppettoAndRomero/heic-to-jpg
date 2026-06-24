import type { ToolContent } from './types';

export const en: ToolContent = {
  htmlLang: 'en',

  meta: {
    title: 'HEIC to JPG — Convert in Your Browser, No Upload | runlocally',
    description:
      'Convert HEIC and HEIF photos to JPG or PNG directly in your browser. Files are processed on your device and never uploaded. Open source, works offline.',
    ogTitle: 'HEIC to JPG — Convert in Your Browser, No Upload',
    ogDescription:
      'Convert HEIC/HEIF photos to JPG or PNG in your browser. Nothing is uploaded. Open source, works offline.',
  },

  hero: {
    h1: 'HEIC to JPG',
    tagline:
      'Convert iPhone HEIC & HEIF photos to JPG or PNG — in your browser. Nothing is uploaded.',
  },

  intro: {
    h2: 'HEIC to JPG, in your browser',
    paras: [
      'This tool converts HEIC and HEIF photos — the format iPhones and iPads use — to JPG or PNG. Windows PCs, Android devices and many websites cannot open HEIC directly, so a conversion to a widely supported format is often needed.',
      'Decoding runs in the browser with WebAssembly, so it also works where the browser has no native HEIC support (Chrome, Edge and Firefox on Windows and Android).',
    ],
  },

  privacy: {
    h2: 'Why your files stay on your device',
    lead: 'Privacy here is structural, not a promise. There is no upload step because there is no server to upload to:',
    points: [
      'The conversion runs entirely in your browser.',
      'The page is served as static files and makes no request with your image data.',
      'The source is open and anyone can read it (MIT).',
      'It works offline, which is only possible because nothing leaves the device.',
    ],
    note: "If you want to check for yourself, open your browser's Network panel while converting — no request carries your file.",
    sourceLinkText: 'Read the source.',
  },

  howto: {
    h2: 'How to use it',
    steps: [
      {
        h3: 'Choose files',
        p: 'Click to select HEIC/HEIF files, or drop them anywhere on the page. Multiple files at once is fine.',
      },
      {
        h3: 'Adjust settings (optional)',
        p: 'Choose JPG or PNG, set JPG quality, or resize. The defaults produce good results.',
      },
      {
        h3: 'Download',
        p: 'Each file downloads when it finishes; a batch can be downloaded as a ZIP.',
      },
    ],
  },

  faqHeading: 'FAQ',
  faq: [
    {
      q: 'Are my photos uploaded anywhere?',
      a: "No. The conversion runs entirely in your browser. There is no server component, so your files have no path off your device. The source is open and you can confirm this in your browser's Network panel.",
    },
    {
      q: 'What is a HEIC file?',
      a: 'HEIC (High Efficiency Image Container) is the image format iPhones and iPads use by default since iOS 11. It stores photos at smaller sizes than JPEG, but Windows and many Android devices or websites cannot open it directly, so converting to JPG or PNG is often needed.',
    },
    {
      q: 'Can I convert HEIC to JPG on Windows?',
      a: 'Yes. Decoding is done with WebAssembly (libheif), so it works in Chrome, Edge and Firefox on Windows even though those browsers cannot open HEIC natively.',
    },
    {
      q: 'Does converting reduce quality?',
      a: 'JPG output uses an adjustable quality setting (default 92%), which is visually close to the original for most photos. PNG output is lossless from the decoded image.',
    },
    {
      q: 'Does it work offline?',
      a: 'Yes. It is a PWA. After the first visit it is cached, so conversion works without a network connection. You can also install it to your home screen.',
    },
    {
      q: 'Is there a file size or count limit?',
      a: "There is no fixed limit. Because everything runs in your browser, the practical ceiling depends on your device's memory. Very large images may be slower or need to be downsized.",
    },
  ],

  footer: {
    openSourceLabel: 'Open source (MIT)',
    partOf: 'part of',
    brandTail: '— small tools that run locally on your device.',
    colophon:
      "Built and maintained by Geppetto. Some code is written with AI assistance; all review and decisions are the maintainer's.",
    securityText: 'Security',
  },
};
