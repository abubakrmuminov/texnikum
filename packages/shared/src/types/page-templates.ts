import { GridRow } from './page-grid';

export interface PageTemplateDefinition {
  id: string;
  titleUz: string;
  titleRu: string;
  descriptionUz: string;
  descriptionRu: string;
  category: 'general' | 'academic' | 'admissions' | 'info';
  icon: string;
  rows: GridRow[];
}

export const COLLEGE_PAGE_TEMPLATES: PageTemplateDefinition[] = [
  // 1. Главная страница (Home Academic)
  {
    id: 'bosh_sahifa',
    titleUz: 'Bosh sahifa (Akademik)',
    titleRu: 'Главная страница (Академическая)',
    descriptionUz: 'Hero-blok, asosiy statistika koʻrsatkichlari, yoʻnalishlar va soʻnggi yangiliklar',
    descriptionRu: 'Hero-экран, ключевые показатели, популярные направления и лента новостей',
    category: 'general',
    icon: 'Home',
    rows: [
      {
        id: 'tmpl-home-row-1',
        style: {
          backgroundStyle: 'brand',
          paddingVertical: 'relaxed',
          containerWidth: 'wide',
        },
        cells: [
          {
            id: 'tmpl-home-cell-1',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-home-blk-hero',
                type: 'hero',
                sortOrder: 1,
                isVisible: true,
                config: {
                  badgeUz: '[NAMUNA] Davlat professional taʼlim muassasasi',
                  badgeRu: '[ПРИМЕР] Государственное профессиональное образовательное учреждение',
                  titleUz: '[NAMUNA] Kelajak kasblarini professional darajada egallang',
                  titleRu: '[ПРИМЕР] Освойте профессии будущего на профессиональном уровне',
                  subtitleUz: '[NAMUNA] Amaliy koʻnikmalar, xalqaro andozalarga mos ustaxonalar va 100% kafolatlangan amaliyot',
                  subtitleRu: '[ПРИМЕР] Практические навыки, мастерские международных стандартов и гарантированная практика',
                  primaryActionTextUz: 'Mutaxassisliklar',
                  primaryActionTextRu: 'Специальности',
                  primaryActionUrl: '/specialties',
                  secondaryActionTextUz: 'Qabul 2026',
                  secondaryActionTextRu: 'Прием 2026',
                  secondaryActionUrl: '/info/info-education',
                  align: 'center',
                  backgroundVariant: 'brand',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl-home-row-2',
        style: {
          backgroundStyle: 'none',
          paddingVertical: 'normal',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-home-cell-2',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-home-blk-stats',
                type: 'stats_counter',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Asosiy yutuq va koʻrsatkichlarimiz',
                  titleRu: '[ПРИМЕР] Наши ключевые достижения и показатели',
                  columns: 4,
                  stats: [
                    { id: 's1', value: '1,200+', labelUz: 'Talabalar soni', labelRu: 'Студентов', icon: 'GraduationCap' },
                    { id: 's2', value: '85+', labelUz: 'Malakali pedagoglar', labelRu: 'Педагогов', icon: 'Users' },
                    { id: 's3', value: '14 ta', labelUz: 'Oʻquv laboratoriyalari', labelRu: 'Лабораторий', icon: 'Building' },
                    { id: 's4', value: '92%', labelUz: 'Ishga joylashish', labelRu: 'Трудоустройство', icon: 'Award' },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl-home-row-3',
        style: {
          backgroundStyle: 'subtle',
          paddingVertical: 'normal',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-home-cell-3',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-home-blk-cards',
                type: 'cards_grid',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Talabgir taʼlim yoʻnalishlari',
                  titleRu: '[ПРИМЕР] Востребованные направления подготовки',
                  columns: 3,
                  cards: [
                    {
                      id: 'c1',
                      titleUz: 'Dasturiy injiniring',
                      titleRu: 'Программная инженерия',
                      descriptionUz: '[NAMUNA] Veb va mobil ilovalarni ishlab chiqish, maʼlumotlar bazasi va sunʼiy intellekt asoslari',
                      descriptionRu: '[ПРИМЕР] Разработка веб и мобильных приложений, основы БД и ИИ',
                      badgeUz: 'IT yoʻnalishi',
                      badgeRu: 'IT профиль',
                      linkUrl: '/specialties',
                    },
                    {
                      id: 'c2',
                      titleUz: 'Avtomobillarga texnik xizmat koʻrsatish',
                      titleRu: 'Техобслуживание автотранспорта',
                      descriptionUz: '[NAMUNA] Zamonaviy diagnostika stendlari va gibrid avtomobillarni taʼmirlash',
                      descriptionRu: '[ПРИМЕР] Современные диагностические стенды и ремонт гибридных автомобилей',
                      badgeUz: 'Muhandislik',
                      badgeRu: 'Инженерия',
                      linkUrl: '/specialties',
                    },
                    {
                      id: 'c3',
                      titleUz: 'Buxgalteriya hisobi va audit',
                      titleRu: 'Бухгалтерский учет и аудит',
                      descriptionUz: '[NAMUNA] 1C dasturi, xalqaro moliyaviy hisobot standartlari (MHXS) va soliq tizimi',
                      descriptionRu: '[ПРИМЕР] Программа 1С, МСФО и налогообложение',
                      badgeUz: 'Iqtisodiyot',
                      badgeRu: 'Экономика',
                      linkUrl: '/specialties',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl-home-row-4',
        style: {
          backgroundStyle: 'none',
          paddingVertical: 'normal',
          containerWidth: 'wide',
        },
        cells: [
          {
            id: 'tmpl-home-cell-4a',
            colSpan: 8,
            blocks: [
              {
                id: 'tmpl-home-blk-news',
                type: 'latest_news_list',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Soʻnggi yangiliklar',
                  titleRu: '[ПРИМЕР] Последние новости',
                  limit: 4,
                  showCover: true,
                  categoryId: null,
                },
              },
            ],
          },
          {
            id: 'tmpl-home-cell-4b',
            colSpan: 4,
            isCard: true,
            blocks: [
              {
                id: 'tmpl-home-blk-events',
                type: 'events_feed',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Muhim tadbirlar',
                  titleRu: '[ПРИМЕР] Важные события',
                  limit: 4,
                  upcomingOnly: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // 2. О техникуме (About)
  {
    id: 'texnikum_haqida',
    titleUz: 'Muassasa haqida (About)',
    titleRu: 'Об учреждении (О техникуме)',
    descriptionUz: 'Rahbar iqtibosi, rivojlanish bosqichlari (Timeline), moddiy-texnik baza va hujjatlar',
    descriptionRu: 'Цитата директора, хроника развития (Timeline), маттехбаза и документы',
    category: 'academic',
    icon: 'Building2',
    rows: [
      {
        id: 'tmpl-abt-row-1',
        style: {
          backgroundStyle: 'subtle',
          paddingVertical: 'normal',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-abt-cell-1',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-abt-blk-quote',
                type: 'quote',
                sortOrder: 1,
                isVisible: true,
                config: {
                  quoteTextUz: '[NAMUNA] «Bizning bosh maqsadimiz — har bir talabaning kasbiy orzularini amaliy natijaga aylantirib, yurtimiz ravnaqiga xizmat qiladigan raqobatbardosh mutaxassislarni tayyorlashdir».',
                  quoteTextRu: '[ПРИМЕР] «Наша главная цель — превратить профессиональные устремления каждого студента в реальные результаты и подготовить конкурентоспособных специалистов».',
                  authorUz: 'Rahimova Dilnoza Mansurovna',
                  authorRu: 'Рахимова Дильноза Мансуровна',
                  roleUz: 'Texnikum direktori, pedagogika fanlari nomzodi',
                  roleRu: 'Директор техникума, кандидат педагогических наук',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl-abt-row-2',
        style: {
          backgroundStyle: 'none',
          paddingVertical: 'normal',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-abt-cell-2',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-abt-blk-timeline',
                type: 'timeline',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Rivojlanish va shakllanish bosqichlari',
                  titleRu: '[ПРИМЕР] Основные этапы развития техникума',
                  items: [
                    {
                      id: 't1',
                      dateOrYear: '1978-yil',
                      titleUz: 'Taʼlim maskanining tashkil etilishi',
                      titleRu: 'Основание учебного заведения',
                      descriptionUz: '[NAMUNA] Hududiy sanoat korxonalari uchun texnik kadrlar tayyorlovchi bilim yurti sifatida faoliyat boshlagan.',
                      descriptionRu: '[ПРИМЕР] Начало работы в качестве училища по подготовке технических кадров для промышленности.',
                    },
                    {
                      id: 't2',
                      dateOrYear: '2020-yil',
                      titleUz: 'Kollej tizimiga transformatsiya',
                      titleRu: 'Трансформация в систему колледжа',
                      descriptionUz: '[NAMUNA] Taʼlim dasturlari xalqaro kasbiy standartlar asosida yangilandi.',
                      descriptionRu: '[ПРИМЕР] Образовательные программы обновлены по международным стандартам.',
                    },
                    {
                      id: 't3',
                      dateOrYear: '2024-yil',
                      titleUz: 'PF-158-son Farmon asosida texnikumga aylantirilishi',
                      titleRu: 'Преобразование в техникум по Указу УП-158',
                      descriptionUz: '[NAMUNA] Oliy taʼlim bilan uzviylik taʼminlandi, kredit-modul tizimi joriy etildi.',
                      descriptionRu: '[ПРИМЕР] Обеспечена преемственность с вузами, внедрена кредитно-модульная система.',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl-abt-row-3',
        style: {
          backgroundStyle: 'card',
          paddingVertical: 'normal',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-abt-cell-3',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-abt-blk-docs',
                type: 'documents_list',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Taʼsis hujjatlari va davlat litsenziyalari',
                  titleRu: '[ПРИМЕР] Учредительные документы и лицензии',
                  enableSearch: true,
                  documents: [
                    {
                      id: 'd1',
                      titleUz: 'Texnikum Ustavi (Tasdiqlangan nusxa)',
                      titleRu: 'Устав техникума (Утвержденная копия)',
                      documentNumber: 'Ustav № 14-B',
                      issueDate: '2024-11-10',
                      fileUrl: '/documents/sample-ustav.pdf',
                      fileType: 'pdf',
                      fileSizeBytes: 2450000,
                    },
                    {
                      id: 'd2',
                      titleUz: 'Taʼlim faoliyatini yuritish davlat litsenziyasi',
                      titleRu: 'Государственная лицензия на образовательную деятельность',
                      documentNumber: 'Litsenziya № 048123',
                      issueDate: '2024-09-01',
                      fileUrl: '/documents/sample-license.pdf',
                      fileType: 'pdf',
                      fileSizeBytes: 1850000,
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // 3. Приемная кампания (Admissions 2026)
  {
    id: 'qabul_komissiyasi',
    titleUz: 'Qabul komissiyasi (Admissions)',
    titleRu: 'Приемная комиссия (Поступление)',
    descriptionUz: 'Qabul muddatlari bildirishnomasi, 9/11-sinf negizida qabul shartlari, FAQ va CTA',
    descriptionRu: 'Баннер сроков приема, условия на базе 9/11 классов, аккордеон вопросов и CTA',
    category: 'admissions',
    icon: 'GraduationCap',
    rows: [
      {
        id: 'tmpl-qbl-row-1',
        style: {
          backgroundStyle: 'none',
          paddingVertical: 'compact',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-qbl-cell-1',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-qbl-blk-alert',
                type: 'banner_alert',
                sortOrder: 1,
                isVisible: true,
                config: {
                  variant: 'warning',
                  titleUz: '[NAMUNA] Qabul 2026/2027 oʻquv yili arizalari qabuli',
                  titleRu: '[ПРИМЕР] Прием заявлений на 2026/2027 учебный год',
                  messageUz: 'Hujjatlar 20-iyundan 15-avgustgacha yagona my.edu.uz portali orqali onlayn qabul qilinadi.',
                  messageRu: 'Документы принимаются онлайн с 20 июня по 15 августа через единый портал my.edu.uz.',
                  actionTextUz: 'my.edu.uz orqali topshirish',
                  actionTextRu: 'Подать через my.edu.uz',
                  actionUrl: 'https://my.edu.uz',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl-qbl-row-2',
        style: {
          backgroundStyle: 'none',
          paddingVertical: 'normal',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-qbl-cell-2',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-qbl-blk-tabs',
                type: 'tabs',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Taʼlim shakllari va qabul shartlari',
                  titleRu: '[ПРИМЕР] Формы обучения и условия поступления',
                  defaultActiveIndex: 0,
                  items: [
                    {
                      id: 'tab-9',
                      labelUz: '9-sinf negizida (Davlat granti)',
                      labelRu: 'На базе 9 классов (Госгрант)',
                      contentUzHtml: '<p>[NAMUNA] 9-sinf bitiruvchilari umumtaʼlim fanlari va kasbiy koʻnikmalarni 3 yil davomida toʻliq davlat granti asosida oʻrganadilar. Talabalarga stipendiya toʻlanadi va yotoqxona bilan taʼminlanadi.</p>',
                      contentRuHtml: '<p>[ПРИМЕР] Выпускники 9 классов обучаются 3 года на основе государственного гранта. Студентам выплачивается стипендия и предоставляется общежитие.</p>',
                    },
                    {
                      id: 'tab-11',
                      labelUz: '11-sinf negizida (Grant va kontrakt)',
                      labelRu: 'На базе 11 классов (Грант и контракт)',
                      contentUzHtml: '<p>[NAMUNA] 11-sinf bitiruvchilari uchun kunduzgi va dual taʼlim shakllari mavjud. Oʻqish muddati — 2 yil. Oliy taʼlim muassasalariga 2-bosqichdan imtihonsiz suhbat asosida oʻtish imkoniyati beriladi.</p>',
                      contentRuHtml: '<p>[ПРИМЕР] Для выпускников 11 классов доступны дневная и дуальная формы обучения (2 года). Предоставляется возможность перевода в вуз на 2 курс по результатам собеседования.</p>',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl-qbl-row-3',
        style: {
          backgroundStyle: 'subtle',
          paddingVertical: 'normal',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-qbl-cell-3',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-qbl-blk-faq',
                type: 'accordion',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Eng koʻp beriladigan savollar (FAQ)',
                  titleRu: '[ПРИМЕР] Часто задаваемые вопросы абитуриентов',
                  allowMultiple: true,
                  items: [
                    {
                      id: 'f1',
                      questionUz: 'Hujjat topshirish uchun qanday maʼlumotlar kerak?',
                      questionRu: 'Какие документы необходимы для подачи?',
                      answerUzHtml: '<p>[NAMUNA] Pasport yoki ID-karta (JShShIR), umumiy oʻrta taʼlim shahodatnomasi va 3x4 hajmdagi elektron fotosurat kifoya qiladi.</p>',
                      answerRuHtml: '<p>[ПРИМЕР] Паспорт/ID-карта (ПИНФЛ), аттестат об общем среднем образовании и электронное фото 3х4.</p>',
                    },
                    {
                      id: 'f2',
                      questionUz: 'Texnikum bitiruvchilari oliy taʼlimga qanday kirishadi?',
                      questionRu: 'Как выпускники техникума поступают в вузы?',
                      answerUzHtml: '<p>[NAMUNA] Oʻzbekiston Respublikasi Vazirlar Mahkamasining tegishli qaroriga koʻra, namunali baholarga ega bitiruvchilar oʻz yoʻnalishidagi OTMlarga suhbat asosida 2-bosqichdan qabul qilinadi.</p>',
                      answerRuHtml: '<p>[ПРИМЕР] Успешные выпускники принимаются на 2 курс профильных вузов по результатам собеседования без вступительных тестовых испытаний.</p>',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl-qbl-row-4',
        style: {
          backgroundStyle: 'brand',
          paddingVertical: 'normal',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-qbl-cell-4',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-qbl-blk-cta',
                type: 'call_to_action',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Savollaringiz bormi? Qabul komissiyasi aloqada!',
                  titleRu: '[ПРИМЕР] Остались вопросы? Приемная комиссия на связи!',
                  descriptionUz: 'Mutaxassislarimiz taʼlim yoʻnalishini toʻgʻri tanlash va onlayn ariza topshirishda yordam berishadi.',
                  descriptionRu: 'Наши консультанты помогут выбрать направление и оформить заявку онлайн.',
                  primaryButtonTextUz: 'Qabul komissiyasiga qoʻngʻiroq',
                  primaryButtonTextRu: 'Позвонить в комиссию',
                  primaryButtonUrl: 'tel:+998732440000',
                  secondaryButtonTextUz: 'Telegram bot orqali savol',
                  secondaryButtonTextRu: 'Вопрос в Telegram бот',
                  secondaryButtonUrl: 'https://t.me/texnikum_bot',
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // 4. Отделение / Кафедра (Department)
  {
    id: 'kafedra_bolim',
    titleUz: 'Kafedra va boʻlim (Department)',
    titleRu: 'Отделение и кафедра (Факультет)',
    descriptionUz: 'Boʻlim tavsifi, yoʻnalishlar kartochkalari, pedagoglar tarkibi va laboratoriyalar',
    descriptionRu: 'Описание отделения, карточки программ, состав педагогов и мастерские',
    category: 'academic',
    icon: 'FolderTree',
    rows: [
      {
        id: 'tmpl-dept-row-1',
        style: {
          backgroundStyle: 'none',
          paddingVertical: 'normal',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-dept-cell-1',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-dept-blk-imtxt',
                type: 'image_text',
                sortOrder: 1,
                isVisible: true,
                config: {
                  badgeUz: '[NAMUNA] Yetakchi kafedra',
                  badgeRu: '[ПРИМЕР] Профильное отделение',
                  titleUz: '[NAMUNA] Axborot texnologiyalari va raqamli tizimlar kafedrasi',
                  titleRu: '[ПРИМЕР] Кафедра информационных технологий и цифровых систем',
                  contentUzHtml: '<p>[NAMUNA] Kafedra 2018-yilda tashkil topgan boʻlib, mintaqamizning yetakchi IT-kompaniyalari bilan integratsiyalashgan holda dasturiy taʼminot, kiberxavfsizlik va maʼlumotlar bazasi mutaxassislarini tayyorlaydi. Oʻquv jarayonida 4 ta zamonaviy ixtisoslashgan kompyuter laboratoriyasi faoliyat yuritadi.</p>',
                  contentRuHtml: '<p>[ПРИМЕР] Кафедра готовит специалистов по разработке ПО, кибербезопасности и базам данных в тесной кооперации с IT-индустрией. В учебном процессе задействованы 4 компьютерные лаборатории.</p>',
                  imageUrl: '/images/news/lab-opening.svg',
                  imageAltUz: 'IT laboratoriyasi',
                  imageAltRu: 'IT лаборатория',
                  imagePosition: 'right',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl-dept-row-2',
        style: {
          backgroundStyle: 'subtle',
          paddingVertical: 'normal',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-dept-cell-2',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-dept-blk-staff',
                type: 'staff_cards',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Kafedra professor-oʻqituvchilari',
                  titleRu: '[ПРИМЕР] Профессорско-преподавательский состав',
                  limit: 6,
                  category: 'pedagogical',
                  layout: 'grid',
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // 5. Контакты и филиалы (Contacts & Campuses)
  {
    id: 'aloqa_manzil',
    titleUz: 'Aloqa va korpuslar (Contacts)',
    titleRu: 'Контакты и корпуса (Геолокация)',
    descriptionUz: 'Bino va korpuslar kartalari, OpenStreetMap xaritasi, telefonlar va ijtimoiy tarmoqlar',
    descriptionRu: 'Карточки учебных корпусов, карта OpenStreetMap, телефоны и соцсети',
    category: 'info',
    icon: 'MapPin',
    rows: [
      {
        id: 'tmpl-cnt-row-1',
        style: {
          backgroundStyle: 'none',
          paddingVertical: 'normal',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-cnt-cell-1a',
            colSpan: 6,
            isCard: true,
            blocks: [
              {
                id: 'tmpl-cnt-blk-c1',
                type: 'contact_card',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Bosh oʻquv binosi',
                  titleRu: '[ПРИМЕР] Главный учебный корпус',
                  addressUz: 'Fargʻona shahri, B. Margʻiloniy koʻchasi, 42-uy',
                  addressRu: 'г. Фергана, ул. Б. Маргилоний, дом 42',
                  phone: '+998 (73) 244-00-00',
                  email: 'info@texnikum2.uz',
                  workHoursUz: 'Dushanba – Shanba: 08:30 – 17:30',
                  workHoursRu: 'Понедельник – Суббота: 08:30 – 17:30',
                },
              },
            ],
          },
          {
            id: 'tmpl-cnt-cell-1b',
            colSpan: 6,
            isCard: true,
            blocks: [
              {
                id: 'tmpl-cnt-blk-c2',
                type: 'contact_card',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Amaliy ustaxonalar va Talabalar turar joyi',
                  titleRu: '[ПРИМЕР] Мастерские и Студенческое общежитие',
                  addressUz: 'Fargʻona shahri, B. Margʻiloniy koʻchasi, 44-uy',
                  addressRu: 'г. Фергана, ул. Б. Маргилоний, дом 44',
                  phone: '+998 (73) 244-00-05',
                  email: 'yotoqxona@texnikum2.uz',
                  workHoursUz: 'Navbatchilik: 24/7 rejimida',
                  workHoursRu: 'Дежурство: круглосуточно 24/7',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl-cnt-row-2',
        style: {
          backgroundStyle: 'card',
          paddingVertical: 'normal',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-cnt-cell-2',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-cnt-blk-map',
                type: 'map_embed',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Texnikum korpuslari xaritasi',
                  titleRu: '[ПРИМЕР] Интерактивная карта расположения',
                  latitude: 40.3864,
                  longitude: 71.7864,
                  zoom: 16,
                  addressUz: 'Fargʻona shahri, B. Margʻiloniy koʻchasi, 42-uy',
                  addressRu: 'г. Фергана, ул. Б. Маргилоний, 42',
                  markerTitleUz: 'Fargʻona shahri 2-son texnikumi',
                  markerTitleRu: 'Ферганский техникум № 2',
                  height: 380,
                },
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl-cnt-row-3',
        style: {
          backgroundStyle: 'subtle',
          paddingVertical: 'compact',
          containerWidth: 'standard',
        },
        cells: [
          {
            id: 'tmpl-cnt-cell-3',
            colSpan: 12,
            blocks: [
              {
                id: 'tmpl-cnt-blk-soc',
                type: 'social_links',
                sortOrder: 1,
                isVisible: true,
                config: {
                  titleUz: '[NAMUNA] Rasmiy ijtimoiy tarmoqlarimiz',
                  titleRu: '[ПРИМЕР] Официальные каналы в соцсетях',
                  links: [
                    { id: 'tg', platform: 'telegram', titleUz: 'Telegram rasmiy kanali', titleRu: 'Telegram канал', url: 'https://t.me/texnikum2' },
                    { id: 'yt', platform: 'youtube', titleUz: 'YouTube video darslar', titleRu: 'YouTube канал', url: 'https://youtube.com/@texnikum2' },
                    { id: 'fb', platform: 'facebook', titleUz: 'Facebook sahifasi', titleRu: 'Facebook', url: 'https://facebook.com/texnikum2' },
                    { id: 'ig', platform: 'instagram', titleUz: 'Instagram rasmlar', titleRu: 'Instagram', url: 'https://instagram.com/texnikum2' },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
];
