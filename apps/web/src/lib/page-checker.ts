import { PageItem, PageBlock, validateRowContrast } from '@college/shared';

export interface ContentCheckIssue {
  id: string;
  severity: 'error' | 'warning';
  blockId?: string;
  blockType?: string;
  titleUz: string;
  titleRu: string;
  descriptionUz: string;
  descriptionRu: string;
}

export interface ContentCheckResult {
  passed: boolean;
  canPublish: boolean;
  errors: ContentCheckIssue[];
  warnings: ContentCheckIssue[];
}

const VAGUE_LINK_WORDS = [
  'batafsil',
  'shu yerda',
  'bu yerga bosing',
  'bosish',
  'koʻrish',
  'havola',
  'link',
  'подробнее',
  'кликните тут',
  'нажмите здесь',
  'ссылка',
  'тут',
  'здесь',
  'читать далее',
  'click here',
  'read more',
  'here',
];

/**
 * Проверка контента страницы перед публикацией на соответствие доступности WCAG 2.1/2.2 AA
 * и редакционным стандартам СПО.
 */
export function checkPageContent(page: Partial<PageItem>): ContentCheckResult {
  const errors: ContentCheckIssue[] = [];
  const warnings: ContentCheckIssue[] = [];

  const titleUz = page.titleUz || page.title || '';
  const titleRu = page.titleRu || page.title || '';
  const slug = page.slug?.trim() || '';

  // 1. Базовые свойства страницы (Блокирующие)
  if (!titleUz.trim()) {
    errors.push({
      id: 'page-title-uz-missing',
      severity: 'error',
      titleUz: 'Oʻzbekcha sarlavha kiritilmagan',
      titleRu: 'Отсутствует заголовок на узбекском языке',
      descriptionUz: 'Sahifaning oʻzbekcha rasmiy sarlavhasini kiriting.',
      descriptionRu: 'Укажите официальный заголовок страницы на узбекском языке.',
    });
  }

  if (!titleRu.trim()) {
    errors.push({
      id: 'page-title-ru-missing',
      severity: 'error',
      titleUz: 'Ruscha sarlavha kiritilmagan',
      titleRu: 'Отсутствует заголовок на русском языке',
      descriptionUz: 'Sahifaning ruscha rasmiy sarlavhasini kiriting.',
      descriptionRu: 'Укажите официальный заголовок страницы на русском языке.',
    });
  }

  if (!slug) {
    errors.push({
      id: 'page-slug-missing',
      severity: 'error',
      titleUz: 'Sahifa manzili (slug) koʻrsatilmagan',
      titleRu: 'Не указан URL-адрес (slug) страницы',
      descriptionUz: 'Sahifaning qisqa URL manzilini kiriting (masalan, «bitiruvchilar»).',
      descriptionRu: 'Задайте короткий URL-слаг страницы (например, «alumni»).',
    });
  }

  // 1.5. Проверка цветового контраста строк (WCAG 1.4.3 Contrast Minimum)
  if (page.rows && page.rows.length > 0) {
    page.rows.forEach((row, rIdx) => {
      const bg = row.style?.backgroundStyle;
      if (bg && bg !== 'none') {
        const contrast = validateRowContrast(bg, false);
        if (!contrast.passes) {
          errors.push({
            id: `row-contrast-${row.id || rIdx}`,
            severity: 'error',
            titleUz: `Qatorda matn va fon kontrasti yetarli emas (${contrast.ratio}:1)`,
            titleRu: `Недостаточный контраст текста и фона в строке (${contrast.ratio}:1)`,
            descriptionUz:
              'WCAG 2.1 AA standarti talabiga koʻra oddiy matn kontrasti kamida 4.5:1 boʻlishi shart. Ushbu xatolik bartaraf etilmaguncha sahifa eʼlon qilinmaydi.',
            descriptionRu:
              'По стандарту WCAG 2.1 AA контраст обычного текста и фона должен быть не менее 4.5:1. Блокирует публикацию.',
          });
        }
      }
    });
  }

  // Извлечение всех блоков (из строк сетки или плоского массива)
  let blocks: PageBlock[] = [];
  if (page.rows && page.rows.length > 0) {
    for (const r of page.rows) {
      for (const c of r.cells) {
        blocks.push(...c.blocks);
      }
    }
  } else if (page.blocks) {
    blocks = page.blocks;
  }

  // 2. Проверка иерархии заголовков (Heading levels hierarchy)
  let lastHeadingLevel = 1; // H1 — это заголовок самой страницы
  blocks.forEach((block) => {
    if (block.type === 'heading') {
      const cfg = block.config as {
        level: number;
        textUz: string;
        textRu: string;
      };

      // Проверка пустого заголовка
      if (!cfg.textUz?.trim() || !cfg.textRu?.trim()) {
        warnings.push({
          id: `heading-empty-${block.id}`,
          severity: 'warning',
          blockId: block.id,
          blockType: 'heading',
          titleUz: 'Boʻsh sarlavha bloki',
          titleRu: 'Пустой блок заголовка',
          descriptionUz: 'Sarlavha matni oʻzbek yoki rus tilida toʻldirilmagan.',
          descriptionRu: 'Текст заголовка не заполнен на одном из языков.',
        });
      }

      // Пропуск уровней заголовков (например: с H2 сразу на H4)
      if (cfg.level > lastHeadingLevel + 1) {
        warnings.push({
          id: `heading-skip-${block.id}`,
          severity: 'warning',
          blockId: block.id,
          blockType: 'heading',
          titleUz: `Sarlavha darajasi oʻtkazib yuborilgan (H${lastHeadingLevel} dan H${cfg.level} ga)`,
          titleRu: `Пропущен уровень заголовка (с H${lastHeadingLevel} до H${cfg.level})`,
          descriptionUz: `Ekran oʻquvchi dasturlar (screen readers) uchun sarlavha darajalarini ketma-ket qoʻllash tavsiya etiladi.`,
          descriptionRu: `Для программ экранного чтения рекомендуется соблюдать строгую последовательность уровней H2 -> H3.`,
        });
      }

      lastHeadingLevel = cfg.level;
    }

    // 3. Проверка изображений на Alt-текст (БЛОКИРУЮЩАЯ ОШИБКА WCAG 1.1.1)
    if (block.type === 'image') {
      const cfg = block.config as {
        url: string;
        altTextUz?: string;
        altTextRu?: string;
        isDecorative?: boolean;
      };

      if (!cfg.isDecorative) {
        const missingUz = !cfg.altTextUz?.trim();
        const missingRu = !cfg.altTextRu?.trim();

        if (missingUz || missingRu) {
          errors.push({
            id: `image-alt-missing-${block.id}`,
            severity: 'error',
            blockId: block.id,
            blockType: 'image',
            titleUz: 'Rasmda muqobil matn (Alt-text) kiritilmagan',
            titleRu: 'У изображения отсутствует Alt-текст (описание)',
            descriptionUz:
              'Koʻrishida nuqsoni boʻlgan foydalanuvchilar va qonun talablariga koʻra, barcha rasmlarga tavsiflovchi Alt-matn kiritilishi shart (yoki rasmni dekorativ deb belgilang). Bu xatolik bartaraf etilmaguncha sahifa eʼlon qilinmaydi.',
            descriptionRu:
              'Согласно WCAG 2.1 AA и нормам цифровой доступности, каждое изображение должно иметь описание для незрячих пользователей. Добавьте Alt-текст или отметьте изображение как декоративное. Блокирует публикацию.',
          });
        }
      }
    }

    // 4. Проверка галерей на Alt-текст (БЛОКИРУЮЩАЯ)
    if (block.type === 'gallery') {
      const cfg = block.config as {
        items?: Array<{ id: string; url: string; altTextUz?: string; altTextRu?: string }>;
      };

      (cfg.items || []).forEach((item, idx) => {
        if (!item.altTextUz?.trim() || !item.altTextRu?.trim()) {
          errors.push({
            id: `gallery-alt-missing-${block.id}-${item.id || idx}`,
            severity: 'error',
            blockId: block.id,
            blockType: 'gallery',
            titleUz: `Galereyadagi ${idx + 1}-rasmda Alt-matn yoʻq`,
            titleRu: `В галерее у изображения №${idx + 1} отсутствует Alt-текст`,
            descriptionUz: 'Galereyadagi barcha fotosuratlar uchun oʻzbek va rus tillarida qisqa izoh kiriting.',
            descriptionRu: 'Заполните краткое описание для каждого фотоснимка в галерее на обоих языках.',
          });
        }
      });
    }

    // 5. Проверка кнопок и ссылок на абстрактный текст (WCAG 2.4.4 Link Purpose)
    if (block.type === 'button') {
      const cfg = block.config as { textUz?: string; textRu?: string; url?: string };
      const uzLower = (cfg.textUz || '').toLowerCase().trim();
      const ruLower = (cfg.textRu || '').toLowerCase().trim();

      const isVagueUz = VAGUE_LINK_WORDS.some((word) => uzLower === word);
      const isVagueRu = VAGUE_LINK_WORDS.some((word) => ruLower === word);

      if (isVagueUz || isVagueRu) {
        warnings.push({
          id: `button-vague-text-${block.id}`,
          severity: 'warning',
          blockId: block.id,
          blockType: 'button',
          titleUz: 'Tugmada umumiy mavhum matn ishlatilgan («Batafsil» / «Shu yerda»)',
          titleRu: 'Неопределенный текст ссылки («Подробнее» / «Кликните тут»)',
          descriptionUz:
            'Foydalanuvchi tugma bosilganda qayerga oʻtishini aniq anglashi maqsadga muvofiq (masalan: «Oʻquv rejasini yuklab olish» yoki «Hujjatlar boʻlimiga oʻtish»).',
          descriptionRu:
            'Экранные дикторы читают список ссылок вне контекста. Рекомендуется конкретизировать действие (например: «Скачать учебный план» вместо «Подробнее»).',
        });
      }
    }

    // 6. Проверка таблиц (доступность заголовков и подписей)
    if (block.type === 'table') {
      const cfg = block.config as {
        captionUz?: string;
        captionRu?: string;
        headersUz?: string[];
        headersRu?: string[];
        rowsUz?: string[][];
        rowsRu?: string[][];
      };

      const rowCount = Math.max(cfg.rowsUz?.length || 0, cfg.rowsRu?.length || 0);
      const hasCaption = Boolean(cfg.captionUz?.trim() || cfg.captionRu?.trim());

      if (rowCount > 15 && !hasCaption) {
        warnings.push({
          id: `table-no-caption-${block.id}`,
          severity: 'warning',
          blockId: block.id,
          blockType: 'table',
          titleUz: 'Katta jadvalda izoh (caption) kiritilmagan',
          titleRu: 'У большой таблицы отсутствует поясняющая подпись (caption)',
          descriptionUz:
            '15 dan ortiq qatorga ega boʻlgan jadvallarga sarlavha-izoh (caption) kiritish koʻrishida nuqsoni boʻlgan foydalanuvchilar uchun qulaylik yaratadi.',
          descriptionRu:
            'Таблицам объемом более 15 строк рекомендуется добавлять подпись (caption) для навигации экранных дикторов.',
        });
      }
    }

    // 7. Проверка видео на белый список
    if (block.type === 'video_embed') {
      const cfg = block.config as { url?: string };
      const url = cfg.url || '';
      if (url) {
        try {
          const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
          const host = parsed.hostname.toLowerCase();
          const isAllowed = ['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com', 'mover.uz', 'www.mover.uz'].some(
            (d) => host === d || host.endsWith(`.${d}`),
          );
          if (!isAllowed) {
            errors.push({
              id: `video-domain-disallowed-${block.id}`,
              severity: 'error',
              blockId: block.id,
              blockType: 'video_embed',
              titleUz: 'Ruxsat etilmagan video xizmati',
              titleRu: 'Недопустимый видеохостинг',
              descriptionUz: 'Faqat YouTube, Vimeo va Mover.uz platformalaridan video oʻrnatishga ruxsat berilgan.',
              descriptionRu: 'Разрешены только безопасные видеохостинги из белого списка: YouTube, Vimeo, Mover.uz.',
            });
          }
        } catch {
          errors.push({
            id: `video-url-invalid-${block.id}`,
            severity: 'error',
            blockId: block.id,
            blockType: 'video_embed',
            titleUz: 'Notoʻgʻri video manzili',
            titleRu: 'Некорректный URL видео',
            descriptionUz: 'Video manzilini toʻgʻri formatda kiriting.',
            descriptionRu: 'Укажите корректный URL адрес видеоролика.',
          });
        }
      }
    }

    // 8. Проверка «Изображение + Текст» (WCAG 1.1.1 Нетекстовый контент)
    if (block.type === 'image_text') {
      const cfg = block.config as {
        imageUrl?: string;
        imageAltUz?: string;
        imageAltRu?: string;
        isDecorative?: boolean;
      };

      if (cfg.imageUrl && !cfg.isDecorative) {
        if (!cfg.imageAltUz?.trim() || !cfg.imageAltRu?.trim()) {
          errors.push({
            id: `image-text-alt-missing-${block.id}`,
            severity: 'error',
            blockId: block.id,
            blockType: 'image_text',
            titleUz: '«Rasm va matn» blokidagi rasmda Alt-matn kiritilmagan',
            titleRu: 'У изображения в блоке «Изображение + Текст» отсутствует Alt-текст',
            descriptionUz:
              'Koʻrishida nuqsoni boʻlgan foydalanuvchilar uchun rasm tavsifini oʻzbek va rus tillarida kiriting yoki rasmni dekorativ deb belgilang.',
            descriptionRu:
              'Согласно WCAG 2.1 AA требуется указать текстовое описание изображения на обоих языках (или отметить как декоративное). Блокирует публикацию.',
          });
        }
      }
    }

    // 9. Проверка фотокарусели (Alt-тексты слайдов и WCAG 2.2.2 Pause)
    if (block.type === 'image_carousel') {
      const cfg = block.config as {
        autoAdvance?: boolean;
        intervalSeconds?: number;
        slides?: Array<{ id: string; imageUrl: string; altTextUz?: string; altTextRu?: string }>;
      };

      (cfg.slides || []).forEach((slide, idx) => {
        if (!slide.altTextUz?.trim() || !slide.altTextRu?.trim()) {
          errors.push({
            id: `carousel-slide-alt-missing-${block.id}-${slide.id || idx}`,
            severity: 'error',
            blockId: block.id,
            blockType: 'image_carousel',
            titleUz: `Karuselning ${idx + 1}-slaydida Alt-matn yoʻq`,
            titleRu: `У слайда №${idx + 1} в фотокарусели отсутствует Alt-текст`,
            descriptionUz: 'Karuseldagi barcha fotosuratlar uchun oʻzbek va rus tillarida tushuntirish matni kiritilishi shart.',
            descriptionRu: 'Каждый слайд фотокарусели должен содержать текстовое описание для экранных дикторов. Блокирует публикацию.',
          });
        }
      });

      if (cfg.autoAdvance && (cfg.intervalSeconds || 5) < 4) {
        warnings.push({
          id: `carousel-fast-interval-${block.id}`,
          severity: 'warning',
          blockId: block.id,
          blockType: 'image_carousel',
          titleUz: 'Karusel slaydlari juda tez aylanmoqda (< 4 soniya)',
          titleRu: 'Слишком быстрое автоматическое переключение слайдов (< 4 сек)',
          descriptionUz: 'Foydalanuvchilar axborotni toʻliq qabul qilishi uchun intervalni kamida 5 soniya qilib belgilash tavsiya etiladi.',
          descriptionRu: 'По стандарту WCAG 2.2.2 рекомендуется интервал смены не менее 5 секунд для комфортного восприятия.',
        });
      }
    }

    // 10. Проверка главного экрана (Hero)
    if (block.type === 'hero') {
      const cfg = block.config as {
        imageUrl?: string;
        imageAltUz?: string;
        imageAltRu?: string;
        isDecorative?: boolean;
        primaryActionUrl?: string;
      };

      if (cfg.imageUrl && !cfg.isDecorative) {
        if (!cfg.imageAltUz?.trim() || !cfg.imageAltRu?.trim()) {
          errors.push({
            id: `hero-image-alt-missing-${block.id}`,
            severity: 'error',
            blockId: block.id,
            blockType: 'hero',
            titleUz: 'Bosh ekran (Hero) tasvirida Alt-matn koʻrsatilmagan',
            titleRu: 'У главного изображения экрана (Hero) отсутствует Alt-текст',
            descriptionUz: 'Bosh ekran tasviri uchun tavsiflovchi Alt-matn kiriting yoki uni dekorativ deb belgilang.',
            descriptionRu: 'Укажите краткое описание фонового изображения главного экрана на двух языках. Блокирует публикацию.',
          });
        }
      }

      if (cfg.primaryActionUrl && (cfg.primaryActionUrl.trim() === '#' || cfg.primaryActionUrl.trim() === '')) {
        warnings.push({
          id: `hero-empty-action-${block.id}`,
          severity: 'warning',
          blockId: block.id,
          blockType: 'hero',
          titleUz: 'Bosh ekran asosiy tugmasida havola boʻsh (#)',
          titleRu: 'У главной кнопки Hero указана пустая ссылка (#)',
          descriptionUz: 'Tugmaga yoʻnaltirilgan sahifaning toʻliq manzilini kiriting.',
          descriptionRu: 'Укажите рабочий URL адрес для целевой кнопки перехода.',
        });
      }
    }

    // 11. Проверка карточек (Cards Grid) на доступность изображений
    if (block.type === 'cards_grid') {
      const cfg = block.config as {
        cards?: Array<{ id: string; imageUrl?: string; imageAltUz?: string; imageAltRu?: string; titleUz?: string }>;
      };

      (cfg.cards || []).forEach((card, idx) => {
        if (card.imageUrl) {
          if (!card.imageAltUz?.trim() && !card.titleUz?.trim()) {
            errors.push({
              id: `card-image-alt-missing-${block.id}-${card.id || idx}`,
              severity: 'error',
              blockId: block.id,
              blockType: 'cards_grid',
              titleUz: `Kartochkalar toʻplamidagi ${idx + 1}-kartochka rasmida Alt-matn yoʻq`,
              titleRu: `У карточки №${idx + 1} отсутствует Alt-текст изображения`,
              descriptionUz: 'Kartochka tasviri uchun tavsif matni yoki sarlavha kiritilishi shart.',
              descriptionRu: 'Изображение карточки должно иметь поясняющий текст. Блокирует публикацию.',
            });
          }
        }
      });
    }

    // 12. Проверка призыва к действию (CTA)
    if (block.type === 'call_to_action') {
      const cfg = block.config as {
        primaryButtonUrl?: string;
        primaryButtonTextUz?: string;
        primaryButtonTextRu?: string;
      };

      const url = (cfg.primaryButtonUrl || '').trim();
      if (!url || url === '#' || url.startsWith('javascript:')) {
        warnings.push({
          id: `cta-empty-url-${block.id}`,
          severity: 'warning',
          blockId: block.id,
          blockType: 'call_to_action',
          titleUz: 'CTA blokida maqsadli havola manzili koʻrsatilmagan',
          titleRu: 'В блоке призыва к действию (CTA) отсутствует целевой URL',
          descriptionUz: 'Foydalanuvchi tugmani bosganda oʻtishi lozim boʻlgan manzilni kiriting.',
          descriptionRu: 'Укажите рабочий URL адрес страницы для перехода.',
        });
      }

      const isVagueUz = VAGUE_LINK_WORDS.some((w) => (cfg.primaryButtonTextUz || '').toLowerCase().trim() === w);
      const isVagueRu = VAGUE_LINK_WORDS.some((w) => (cfg.primaryButtonTextRu || '').toLowerCase().trim() === w);
      if (isVagueUz || isVagueRu) {
        warnings.push({
          id: `cta-vague-link-${block.id}`,
          severity: 'warning',
          blockId: block.id,
          blockType: 'call_to_action',
          titleUz: 'CTA tugmasida mavhum havola matni ishlatilgan',
          titleRu: 'В кнопке CTA используется неопределенный текст ссылки',
          descriptionUz: 'Harakat maqsadini aniqroq koʻrsatuvchi matn yozish tavsiya etiladi.',
          descriptionRu: 'Рекомендуется конкретизировать действие на кнопке.',
        });
      }
    }

    // 13. Проверка ссылок на соцсети
    if (block.type === 'social_links') {
      const cfg = block.config as { links?: Array<{ id: string; url?: string; platform?: string }> };
      (cfg.links || []).forEach((link, idx) => {
        if (!link.url || link.url.trim() === '' || link.url.trim() === '#') {
          warnings.push({
            id: `social-empty-url-${block.id}-${link.id || idx}`,
            severity: 'warning',
            blockId: block.id,
            blockType: 'social_links',
            titleUz: `Ijtimoiy tarmoq havolasida URL manzil boʻsh (${link.platform || idx + 1})`,
            titleRu: `Пустой URL в ссылке на соцсеть (${link.platform || idx + 1})`,
            descriptionUz: 'Ijtimoiy tarmoq sahifangizga toʻliq havolani kiriting.',
            descriptionRu: 'Укажите реальный адрес профиля в социальной сети.',
          });
        }
      });
    }
  });

  return {
    passed: errors.length === 0,
    canPublish: errors.length === 0,
    errors,
    warnings,
  };
}
