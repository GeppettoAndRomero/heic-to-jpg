import type { ToolContent } from './types';

// 简体中文。直译ではなく、簡体圏の HEIC 変換ツールで実際に使われる語彙・言い回しに
// 合わせた意訳。誇大語（轻松 / 快速 / 一键 / 秒变 / 完美 など）は使わず、privacy は
// 「約束」でなく「構造」で語る方針（BRAND-OPERATING-MODEL / I18N-SEO-GUIDELINE）。
// 方針：本土（Baidu・中国本土市場）の SEO は追わないが、言語としての简体提供は行う。
// htmlLang は字体ベースの 'zh-Hans'（国指定 zh-CN より堅い、ガイドライン §4）。

export const zh: ToolContent = {
  htmlLang: 'zh-Hans',

  meta: {
    title: 'HEIC 转 JPG — 在浏览器内转换，无需上传 | runlocally',
    description:
      '将 HEIC、HEIF 照片（iPhone / iPad）转换为 JPG 或 PNG。全部在浏览器内处理，图片不会上传到服务器。开源，支持离线。',
    ogTitle: 'HEIC 转 JPG — 在浏览器内转换，无需上传',
    ogDescription:
      '在浏览器内将 HEIC / HEIF 转换为 JPG / PNG。图片不会上传。开源，支持离线。',
  },

  hero: {
    h1: 'HEIC 转 JPG',
    tagline:
      '在浏览器内将 iPhone、iPad 的 HEIC / HEIF 照片转换为 JPG 或 PNG。不会上传。',
  },

  intro: {
    h2: '在浏览器里把 HEIC 转成 JPG',
    paras: [
      '这个工具把 iPhone、iPad 使用的 HEIC、HEIF 照片转换为 JPG 或 PNG。Windows 电脑、安卓设备和很多网站无法直接打开 HEIC，因此常常需要转换为通用格式。',
      '解码通过 WebAssembly 在浏览器内完成，所以即使浏览器本身不支持 HEIC（Windows 和安卓上的 Chrome、Edge、Firefox），也能转换。',
    ],
  },

  privacy: {
    h2: '为什么你的文件不会离开设备',
    lead: '这里的隐私来自结构，而不是承诺。没有“上传”这一步，是因为根本没有可供上传的服务器：',
    points: [
      '转换全部在你的浏览器内运行。',
      '页面以静态文件的形式分发，不会发出携带图片数据的请求。',
      '源代码公开，任何人都可以查看（MIT）。',
      '可以离线使用——既然不依赖服务器，离线自然也能用。',
    ],
    note: '想自己确认的话，转换时打开浏览器的网络（Network）面板——没有任何请求携带你的文件。',
    sourceLinkText: '查看源代码。',
  },

  howto: {
    h2: '使用方法',
    steps: [
      {
        h3: '选择文件',
        p: '点击选择 HEIC / HEIF 文件，或把文件拖到页面任意位置。可以一次选择多个。',
      },
      {
        h3: '调整设置（可选）',
        p: '选择 JPG 或 PNG、设定 JPG 质量，或调整尺寸。默认设置就能得到不错的结果。',
      },
      {
        h3: '下载',
        p: '每个文件转换完成后会依次下载；多个文件也可以打包成 ZIP 下载。',
      },
    ],
  },

  faqHeading: '常见问题',
  faq: [
    {
      q: '我的照片会被上传到某个地方吗？',
      a: '不会。转换全部在你的浏览器内完成。没有服务器端处理，所以你的文件没有离开设备的途径。源代码公开，你可以在浏览器的网络（Network）面板里确认这一点。',
    },
    {
      q: 'HEIC 文件是什么？',
      a: 'HEIC（High Efficiency Image Container，高效率图像容器）是 iOS 11 之后 iPhone、iPad 默认使用的图片格式。它的体积比 JPEG 更小，但 Windows、很多安卓设备和网站无法直接打开，因此常常需要转换为 JPG 或 PNG。',
    },
    {
      q: '可以在 Windows 上把 HEIC 转成 JPG 吗？',
      a: '可以。解码使用 WebAssembly（libheif），所以即使 Windows 上的 Chrome、Edge、Firefox 无法原生打开 HEIC，也能完成转换。',
    },
    {
      q: '转换会降低画质吗？',
      a: 'JPG 输出可以调整质量（默认 92%），对大多数照片来说，与原图在视觉上很接近。PNG 输出为无损格式，会完整保存解码后的图像。',
    },
    {
      q: '可以离线使用吗？',
      a: '可以。它是 PWA，第一次访问后会被缓存，没有网络也能转换。你也可以把它添加到主屏幕，像应用一样使用。',
    },
    {
      q: '对文件大小或数量有限制吗？',
      a: '没有固定上限。因为全部在浏览器内处理，实际上限取决于你设备的内存。非常大的图片可能会更慢，或需要缩小尺寸。',
    },
  ],

  footer: {
    openSourceLabel: '开源（MIT）',
    partOf: '',
    brandTail: ' 的一部分 — 在你设备上本地运行的小工具。',
    colophon:
      '由 Geppetto 制作和维护。部分代码在 AI 协助下编写，但所有审查和决定都由维护者负责。',
    securityText: '安全',
  },
};
