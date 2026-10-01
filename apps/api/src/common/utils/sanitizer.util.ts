import * as sanitizeHtml from 'sanitize-html';
import { ALLOWED_VIDEO_DOMAINS, isAllowedVideoUrl } from '@college/shared';

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'p',
    'a',
    'ul',
    'ol',
    'nl',
    'li',
    'b',
    'i',
    'strong',
    'em',
    'strike',
    'code',
    'hr',
    'br',
    'div',
    'table',
    'thead',
    'caption',
    'tbody',
    'tr',
    'th',
    'td',
    'pre',
    'iframe',
    'img',
    'figure',
    'figcaption',
    'span',
    'u',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title', 'class'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title'],
    '*': ['class', 'id', 'aria-label', 'aria-hidden'],
  },
  selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  allowProtocolRelative: false,
  allowedIframeHostnames: ALLOWED_VIDEO_DOMAINS,
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === '_blank') {
        attribs.rel = 'noopener noreferrer';
      }
      return { tagName, attribs };
    },
    iframe: (tagName, attribs) => {
      if (attribs.src && !isAllowedVideoUrl(attribs.src)) {
        return { tagName: 'div', attribs: { class: 'blocked-unsafe-embed' } };
      }
      return { tagName, attribs };
    },
  },
};

/**
 * Санитизирует HTML-строку, удаляя скрипты, инлайн-обработчики и небезопасные фреймы
 */
export function sanitizeHtmlContent(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';
  return sanitizeHtml(dirty, sanitizeOptions);
}

/**
 * Рекурсивно санитизирует все HTML-поля внутри объекта конфигурации блоков
 */
export function sanitizeBlockConfig(config: Record<string, unknown>): Record<string, unknown> {
  if (!config || typeof config !== 'object') return {};

  const clean = { ...config };

  for (const [key, val] of Object.entries(clean)) {
    if (typeof val === 'string') {
      if (key.toLowerCase().includes('html') || key.toLowerCase().includes('content')) {
        clean[key] = sanitizeHtmlContent(val);
      }
    } else if (Array.isArray(val)) {
      clean[key] = val.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return sanitizeBlockConfig(item as Record<string, unknown>);
        }
        if (typeof item === 'string' && key.toLowerCase().includes('html')) {
          return sanitizeHtmlContent(item);
        }
        return item;
      });
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = sanitizeBlockConfig(val as Record<string, unknown>);
    }
  }

  return clean;
}
