import {
  AdminSectionKey,
  UserRole,
} from '@college/shared';
import {
  Calendar,
  FileText,
  GraduationCap,
  History,
  Image as ImageIcon,
  LucideIcon,
  MapPin,
  Newspaper,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export interface OnboardingSectionItem {
  key: AdminSectionKey;
  path: string;
  roles: UserRole[];
  accentColor: string;
  icon: LucideIcon;
  title: {
    uz: string;
    ru: string;
  };
  blurb: {
    uz: string;
    ru: string;
  };
  steps: {
    uz: string[];
    ru: string[];
  };
}

export const ADMIN_SECTIONS_DATA: Record<AdminSectionKey, OnboardingSectionItem> = {
  news: {
    key: 'news',
    path: '/admin/news',
    roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
    accentColor: 'border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10',
    icon: Newspaper,
    title: {
      uz: 'Yangiliklar va maqolalar',
      ru: 'Новости и статьи',
    },
    blurb: {
      uz: 'Texnikum yangiliklarini yaratish, tahrirlash, fotosuratlar biriktirish va nashr etish boshqaruvi.',
      ru: 'Создание, редактирование, прикрепление фото и публикация новостных материалов техникума.',
    },
    steps: {
      uz: [
        '«Yangi maqola yaratish» tugmasini bosing va sarlavha hamda qisqa izoh kiriting',
        'WYSIWYG tahrirlovchida matnni shakllantiring va matn ichiga yoki qopqoqqa fotosurat yuklang',
        'Holatni «Nashr qilingan» deb belgilang yoki qoralama sifatida saqlang',
      ],
      ru: [
        'Нажмите «Создать публикацию», укажите заголовок и краткий лид статьи',
        'Сформируйте текст в WYSIWYG-редакторе и загрузите фото в текст или на обложку',
        'Установите статус «Опубликовано» или сохраните как черновик',
      ],
    },
  },

  events: {
    key: 'events',
    path: '/admin/events',
    roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
    accentColor: 'border-violet-500/40 text-violet-600 dark:text-violet-400 bg-violet-500/10',
    icon: Calendar,
    title: {
      uz: 'Tadbirlar va taqvim',
      ru: 'События и календарь',
    },
    blurb: {
      uz: 'Ochiq eshiklar kuni, sport musobaqalari va taʼlim anjumanlari taqvimini yuritish.',
      ru: 'Ведение календаря дней открытых дверей, олимпиад, спортивных и академических событий.',
    },
    steps: {
      uz: [
        '«Yangi tadbir qoʻshish» tugmasi orqali sana, vaqt va oʻtkazilish manzilini kiriting',
        'Tadbir yoʻnalishi toifasini tanlang (Fan, Sport, Madaniyat, Ochiq eshiklar)',
        'Ishtirokchilar va roʻyxatdan oʻtish tartibini eʼlon qilib saqlang',
      ],
      ru: [
        'Через «Добавить событие» укажите дату, время и место проведения',
        'Выберите категорию события (Наука, Спорт, Культура, День открытых дверей)',
        'Опубликуйте условия участия и регламент регистрации',
      ],
    },
  },

  teachers: {
    key: 'teachers',
    path: '/admin/teachers',
    roles: [UserRole.ADMIN, UserRole.EDITOR],
    accentColor: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    icon: UserCheck,
    title: {
      uz: 'Oʻqituvchilar tarkibi',
      ru: 'Педагогический состав',
    },
    blurb: {
      uz: 'Pedagoglar, kafedralar, ilmiy darajalar va oʻqitiladigan fanlar reestrini yuritish.',
      ru: 'Реестр преподавателей, кафедр, ученых степеней и преподаваемых дисциплин.',
    },
    steps: {
      uz: [
        '«Oʻqituvchi qoʻshish» tugmasini bosib, F.I.Sh. va kafedrani tanlang',
        'Umumiy va pedagogik ish stajini, oʻqitadigan fanlarini koʻrsating',
        'Rasmiy portret fotosuratini yuklang va faol holatda saqlang',
      ],
      ru: [
        'Нажмите «Добавить преподавателя», выберите кафедру и укажите ФИО',
        'Заполните общий и педагогический стаж, квалификацию и предметы',
        'Загрузите официальное фото и сохраните профиль преподавателя',
      ],
    },
  },

  administration: {
    key: 'administration',
    path: '/admin/administration',
    roles: [UserRole.ADMIN, UserRole.EDITOR],
    accentColor: 'border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10',
    icon: ShieldCheck,
    title: {
      uz: 'Rahbariyat va maʼmuriyat',
      ru: 'Руководство и администрация',
    },
    blurb: {
      uz: 'Direktor, oʻrinbosarlar va boʻlim boshliqlarining qabul vaqtlari hamda vazifalari boshqaruvi.',
      ru: 'Управление составом дирекции, часами приема граждан и функциональными обязанностями.',
    },
    steps: {
      uz: [
        '«Rahbar qoʻshish» tugmasi orqali toifani (Direksiya, Boʻlimlar) tanlang',
        'Fuqarolarni qabul qilish kunlari, xona raqami va toʻgʻridan-toʻgʻri telefonini kiriting',
        'Lavozim majburiyatlari va biografik maʼlumotlarni kiritib saqlang',
      ],
      ru: [
        'Через кнопку «Добавить руководителя» выберите категорию (Дирекция, Отделы)',
        'Укажите дни и часы приема граждан, номер кабинета и рабочий телефон',
        'Заполните должностные обязанности и сохраните данные',
      ],
    },
  },

  specialties: {
    key: 'specialties',
    path: '/admin/specialties',
    roles: [UserRole.ADMIN, UserRole.EDITOR],
    accentColor: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10',
    icon: GraduationCap,
    title: {
      uz: 'Mutaxassisliklar va yoʻnalishlar',
      ru: 'Специальности техникума',
    },
    blurb: {
      uz: 'Davlat klassifikatori boʻyicha taʼlim yoʻnalishlari, kvotalar (grant/kontrakt) va oʻqish muddatlari.',
      ru: 'Направления по Национальному классификатору, квоты (грант/контракт) и сроки обучения.',
    },
    steps: {
      uz: [
        '«Mutaxassislik qoʻshish» tugmasini bosing va klassifikator kodini (masalan, 40610101) kiriting',
        'Taʼlim shakli (9 yoki 11-sinf negizida) va oʻqish muddatini belgilang',
        'Davlat granti va toʻlov-kontrakt oʻrinlari soni hamda oʻtish ballarini kiriting',
      ],
      ru: [
        'Нажмите «Добавить специальность» и введите код классификатора (например, 40610101)',
        'Укажите базу образования (на базе 9 или 11 классов) и срок обучения',
        'Задайте количество мест на грант и контракт, а также проходной балл',
      ],
    },
  },

  pages: {
    key: 'pages',
    path: '/admin/pages',
    roles: [UserRole.ADMIN, UserRole.EDITOR],
    accentColor: 'border-teal-500/40 text-teal-600 dark:text-teal-400 bg-teal-500/10',
    icon: FileText,
    title: {
      uz: 'Muassasa haqida (37-modda)',
      ru: 'Сведения об ОО (37-модда)',
    },
    blurb: {
      uz: '«Taʼlim toʻgʻrisida»gi Qonunning 37-moddasi boʻyicha 12 ta majburiy ustav boʻlimlarini yangilash.',
      ru: '12 обязательных разделов согласно статье 37 Закона РУз «Об образовании».',
    },
    steps: {
      uz: [
        'Roʻyxatdan kerakli qonuniy boʻlimni (hujjatlar, moliyaviy faoliyat, MTO) tanlang',
        '«Tahrirlash» tugmasini bosib, matn va meʼyoriy havolalarni yangilang',
        'Oʻzgarishlarni saqlang — ular darhol ommaviy /info boʻlimida aks etadi',
      ],
      ru: [
        'Выберите требуемый обязательный подраздел из реестра 12 страниц',
        'Нажмите «Редактировать» и обновите нормативные сведения и ссылки на акты',
        'Сохраните изменения для немедленного отображения в разделе /info',
      ],
    },
  },

  contacts: {
    key: 'contacts',
    path: '/admin/contacts',
    roles: [UserRole.ADMIN, UserRole.EDITOR],
    accentColor: 'border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10',
    icon: MapPin,
    title: {
      uz: 'Bogʻlanish va aloqa (Aloqa)',
      ru: 'Контакты и реквизиты (Aloqa)',
    },
    blurb: {
      uz: 'Oʻquv korpuslari, xizmatlar telefon maʼlumotnomasi va OpenStreetMap xaritasi maʼlumotlari.',
      ru: 'Учебные корпуса, телефонный справочник служб и координаты карты OpenStreetMap.',
    },
    steps: {
      uz: [
        'Oʻquv binolari va korpuslar manzillarini tahrirlang yoki yangisini qoʻshing',
        'Qabul komissiyasi va boʻlimlar telefon maʼlumotnomasini yangilang',
        'Jamoat transporti yoʻnalishlari hamda xarita koordinatalarini saqlang',
      ],
      ru: [
        'Отредактируйте адреса корпусов или добавьте новый учебный корпус',
        'Обновите номера телефонов приемной комиссии и отделов техникума',
        'Сохраните маршруты подъезда и GPS-координаты для интерактивной карты',
      ],
    },
  },

  media: {
    key: 'media',
    path: '/admin/media',
    roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
    accentColor: 'border-fuchsia-500/40 text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10',
    icon: ImageIcon,
    title: {
      uz: 'Mediateka va fayllar ombori',
      ru: 'Медиатека / Файлы',
    },
    blurb: {
      uz: 'Rasmiy hujjatlar (PDF), qabul qoidalari va nashrlar uchun fotosuratlar arxivi.',
      ru: 'Хранилище официальных PDF-документов, бланков и медиафайлов для публикаций.',
    },
    steps: {
      uz: [
        '«Fayl yuklash» tugmasi orqali kompyuterdan hujjat yoki fotosurat tanlang',
        'Tegishli xotira omborini (news-media yoki documents) belgilang',
        'Fayl havolasini (URL) bir marta bosish bilan nusxalab, maqolalarda qoʻllang',
      ],
      ru: [
        'Через кнопку «Загрузить файл» выберите документ или фото с компьютера',
        'Укажите целевой бакет хранилища (news-media или documents)',
        'Скопируйте URL одним кликом для вставки в статьи и приказы',
      ],
    },
  },

  users: {
    key: 'users',
    path: '/admin/users',
    roles: [UserRole.ADMIN],
    accentColor: 'border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10',
    icon: Shield,
    title: {
      uz: 'Foydalanuvchilar va rollar',
      ru: 'Пользователи и роли',
    },
    blurb: {
      uz: 'Xodimlar hisoblari, rollar huquqlari (Admin, Muharrir, Moderator) va onbordingni qayta boshlash.',
      ru: 'Управление учетными записями сотрудников, распределение ролей и сброс онбординга.',
    },
    steps: {
      uz: [
        'Xodimlar jadvalidan kerakli foydalanuvchini toping',
        'Rol menyusidan Administrator, Muharrir yoki Moderator huquqini biriktiring',
        'Zarurat boʻlganda «Onbordingni tiklash» tugmasi bilan ekskursiyani qayta faollashtiring',
      ],
      ru: [
        'Найдите нужного сотрудника в таблице пользователей',
        'Назначьте роль: Администратор, Редактор или Модератор через выпадающий список',
        'При необходимости нажмите «Сбросить тур» для повторного прохождения обучения',
      ],
    },
  },

  audit: {
    key: 'audit',
    path: '/admin/audit',
    roles: [UserRole.ADMIN],
    accentColor: 'border-orange-500/40 text-orange-600 dark:text-orange-400 bg-orange-500/10',
    icon: History,
    title: {
      uz: 'Tizim audit jurnali',
      ru: 'Журнал аудита',
    },
    blurb: {
      uz: 'Barcha harakatlar (yaratish, tahrirlash, oʻchirish, kirish) xavfsizlik jurnali va diff-tahlili.',
      ru: 'Хронологический журнал операций безопасности, фиксация изменений и сравнение снимков (Diff).',
    },
    steps: {
      uz: [
        'Amallar boʻyicha filtrlardan foydalaning (CREATE, UPDATE, DELETE, PUBLISH)',
        'Xodimning roli va IP-manzilini tekshiring',
        '«Tafsilotlar» tugmasi orqali oʻzgarishlarning oldingi va yangi qiymatlarini solishtiring',
      ],
      ru: [
        'Используйте фильтрацию по операциям (CREATE, UPDATE, DELETE, PUBLISH)',
        'Контролируйте роли исполнителей и IP-адреса сессий',
        'Открывайте окно снимка (Diff) для наглядного сравнения старых и новых данных',
      ],
    },
  },
};

export const ORDERED_SECTION_KEYS: AdminSectionKey[] = [
  'news',
  'events',
  'teachers',
  'administration',
  'specialties',
  'pages',
  'contacts',
  'media',
  'users',
  'audit',
];

export function getSectionsForRole(role: UserRole): OnboardingSectionItem[] {
  return ORDERED_SECTION_KEYS.map((k) => ADMIN_SECTIONS_DATA[k]).filter((item) =>
    item.roles.includes(role),
  );
}

export function getSectionByPath(pathname: string): OnboardingSectionItem | undefined {
  if (pathname === '/admin/schedule') {
    return ADMIN_SECTIONS_DATA.administration;
  }
  return Object.values(ADMIN_SECTIONS_DATA).find((item) =>
    pathname === item.path || pathname.startsWith(`${item.path}/`),
  );
}

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  id: string;
  sectionKey?: AdminSectionKey;
  route: string;
  target: string;
  placement: TourPlacement;
  roles: UserRole[];
  title: {
    uz: string;
    ru: string;
  };
  body: {
    uz: string;
    ru: string;
  };
}

export const WELCOME_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome-dashboard',
    route: '/admin',
    target: 'sidebar.dashboard',
    placement: 'right',
    roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
    title: {
      uz: 'Boshqaruv paneli',
      ru: 'Дашборд',
    },
    body: {
      uz: 'Portal faoliyati, yangiliklar va xavfsizlik boʻyicha asosiy koʻrsatkichlar shu yerda jamlangan.',
      ru: 'Главные показатели активности портала, статистика публикаций и сводка безопасности.',
    },
  },
  {
    id: 'welcome-news',
    route: '/admin',
    target: 'sidebar.news',
    placement: 'right',
    roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
    title: {
      uz: 'Yangiliklar va maqolalar',
      ru: 'Новости и статьи',
    },
    body: {
      uz: 'Texnikum yangiliklarini yaratish, fotosuratlar biriktirish va nashr etish boshqaruvi.',
      ru: 'Создание новостных статей, прикрепление фотоматериалов и управление публикацией.',
    },
  },
  {
    id: 'welcome-events',
    route: '/admin',
    target: 'sidebar.events',
    placement: 'right',
    roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
    title: {
      uz: 'Tadbirlar va taqvim',
      ru: 'События и календарь',
    },
    body: {
      uz: 'Ochiq eshiklar kuni, fan olimpiadalari va sport musobaqalari taqvimi.',
      ru: 'Календарь дней открытых дверей, академических олимпиад и спортивных турниров.',
    },
  },
  {
    id: 'welcome-teachers',
    route: '/admin',
    target: 'sidebar.teachers',
    placement: 'right',
    roles: [UserRole.ADMIN, UserRole.EDITOR],
    title: {
      uz: 'Oʻqituvchilar tarkibi',
      ru: 'Педагогический состав',
    },
    body: {
      uz: 'Pedagog xodimlar reestri, ilmiy darajalar, ish staji va oʻqitiladigan fanlar.',
      ru: 'Реестр преподавателей техникума, ученые степени, педагогический стаж и предметы.',
    },
  },
  {
    id: 'welcome-administration',
    route: '/admin',
    target: 'sidebar.administration',
    placement: 'right',
    roles: [UserRole.ADMIN, UserRole.EDITOR],
    title: {
      uz: 'Rahbariyat va maʼmuriyat',
      ru: 'Руководство и администрация',
    },
    body: {
      uz: 'Direksiya, boʻlim boshliqlari va fuqarolarni qabul qilish vaqtlari boshqaruvi.',
      ru: 'Состав дирекции, начальники отделов и график личного приема граждан.',
    },
  },
  {
    id: 'welcome-specialties',
    route: '/admin',
    target: 'sidebar.specialties',
    placement: 'right',
    roles: [UserRole.ADMIN, UserRole.EDITOR],
    title: {
      uz: 'Mutaxassisliklar va kasblar',
      ru: 'Специальности техникума',
    },
    body: {
      uz: 'Davlat klassifikatori boʻyicha yoʻnalishlar, grant va toʻlov-kontrakt kvotalari.',
      ru: 'Направления по Национальному классификатору, квоты грант/контракт и сроки.',
    },
  },
  {
    id: 'welcome-pages',
    route: '/admin',
    target: 'sidebar.pages',
    placement: 'right',
    roles: [UserRole.ADMIN, UserRole.EDITOR],
    title: {
      uz: 'Muassasa haqida (37-modda)',
      ru: 'Сведения об ОО (37-модда)',
    },
    body: {
      uz: '«Taʼlim toʻgʻrisida»gi Qonunning 37-moddasi boʻyicha 12 ta majburiy ustav sahifasi.',
      ru: '12 обязательных разделов открытости согласно статье 37 Закона РУз «Об образовании».',
    },
  },
  {
    id: 'welcome-contacts',
    route: '/admin',
    target: 'sidebar.contacts',
    placement: 'right',
    roles: [UserRole.ADMIN, UserRole.EDITOR],
    title: {
      uz: 'Bogʻlanish va aloqa (Aloqa)',
      ru: 'Контакты и реквизиты (Aloqa)',
    },
    body: {
      uz: 'Oʻquv binolari, telefon maʼlumotnomasi va OpenStreetMap xaritasi maʼlumotlari.',
      ru: 'Учебные корпуса, телефонный справочник служб и координаты карты OpenStreetMap.',
    },
  },
  {
    id: 'welcome-media',
    route: '/admin',
    target: 'sidebar.media',
    placement: 'right',
    roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
    title: {
      uz: 'Mediateka va fayllar ombori',
      ru: 'Медиатека / Файлы',
    },
    body: {
      uz: 'Supabase Storage: rasmiy meʼyoriy hujjatlar (PDF) va maqola fotolari arxivi.',
      ru: 'Хранилища Supabase Storage: официальные PDF-документы и медиафайлы для статей.',
    },
  },
  {
    id: 'welcome-users',
    route: '/admin',
    target: 'sidebar.users',
    placement: 'right',
    roles: [UserRole.ADMIN],
    title: {
      uz: 'Foydalanuvchilar va rollar',
      ru: 'Пользователи и роли',
    },
    body: {
      uz: 'Xodimlar hisoblari, rollar huquqlari (Admin, Muharrir, Moderator) va onbordingni tiklash.',
      ru: 'Управление учетными записями, назначение ролей и возможность сброса онбординга.',
    },
  },
  {
    id: 'welcome-audit',
    route: '/admin',
    target: 'sidebar.audit',
    placement: 'right',
    roles: [UserRole.ADMIN],
    title: {
      uz: 'Tizim audit jurnali',
      ru: 'Журнал аудита',
    },
    body: {
      uz: 'Barcha amallar (CREATE, UPDATE, DELETE, PUBLISH) xavfsizlik protokoli va Diff-tahlil.',
      ru: 'Хронология операций безопасности, IP-адреса сессий и окно сравнения снимков Diff.',
    },
  },
  {
    id: 'welcome-profile',
    route: '/admin',
    target: 'sidebar.user-profile',
    placement: 'top',
    roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
    title: {
      uz: 'Foydalanuvchi profili',
      ru: 'Профиль пользователя',
    },
    body: {
      uz: 'Joriy hisobingiz va tizimdagi biriktirilgan rolingiz shu yerda aks etadi.',
      ru: 'Здесь отображается ваша учетная запись и назначенный уровень доступа в системе.',
    },
  },
  {
    id: 'welcome-tour-restart',
    route: '/admin',
    target: 'sidebar.tour-restart',
    placement: 'top',
    roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
    title: {
      uz: 'Ekskursiyani qayta boshlash',
      ru: 'Пройти тур заново',
    },
    body: {
      uz: 'Istalgan paytda boshqaruv paneli boʻyicha ushbu ekskursiyani qayta ishga tushirishingiz mumkin.',
      ru: 'Вы в любой момент можете перезапустить данный ознакомительный тур по панели управления.',
    },
  },
];

export const SECTION_TOUR_STEPS: Record<AdminSectionKey, TourStep[]> = {
  news: [
    {
      id: 'news-create-btn',
      sectionKey: 'news',
      route: '/admin/news',
      target: 'news.create-btn',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Yangi maqola yaratish',
        ru: 'Создание публикации',
      },
      body: {
        uz: '«Yangilik yozish» tugmasi yangi maqolani shakllantirish formasini ochadi.',
        ru: 'Кнопка «Написать новость» открывает форму для создания новой публикации.',
      },
    },
    {
      id: 'news-search-input',
      sectionKey: 'news',
      route: '/admin/news',
      target: 'news.search-input',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Qidiruv paneli',
        ru: 'Поиск публикаций',
      },
      body: {
        uz: 'Sarlavha yoki matn kalit soʻzlari boʻyicha kerakli xabarlarni tezda toping.',
        ru: 'Быстрый поиск новостных материалов по ключевым словам заголовка или текста.',
      },
    },
    {
      id: 'news-status-filter',
      sectionKey: 'news',
      route: '/admin/news',
      target: 'news.status-filter',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Holat filtri',
        ru: 'Фильтрация по статусу',
      },
      body: {
        uz: 'Eʼlon qilingan maqolalar, qoralamalar yoki arxivdagi xabarlarni ajratib koʻring.',
        ru: 'Удобный просмотр опубликованных статей, скрытых черновиков или архива.',
      },
    },
    {
      id: 'news-category-filter',
      sectionKey: 'news',
      route: '/admin/news',
      target: 'news.category-filter',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Rukn filtri',
        ru: 'Рубрикатор',
      },
      body: {
        uz: 'Oʻquv jarayoni, sport, tadbirlar yoki eʼlonlar ruknlari boʻyicha saralash.',
        ru: 'Сортировка новостей по тематическим рубрикам техникума.',
      },
    },
    {
      id: 'news-form-title',
      sectionKey: 'news',
      route: '/admin/news/new',
      target: 'news-form.title',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Nashr sarlavhasi',
        ru: 'Заголовок статьи',
      },
      body: {
        uz: 'Maqolaning toʻliq sarlavhasini kiriting; tizim URL manzilini (slug) avtomatik shakllantiradi.',
        ru: 'Введите понятный заголовок статьи; система автоматически сформирует URL-идентификатор (slug).',
      },
    },
    {
      id: 'news-form-lead',
      sectionKey: 'news',
      route: '/admin/news/new',
      target: 'news-form.lead',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Qisqa mazmuni (lid)',
        ru: 'Краткий лид',
      },
      body: {
        uz: 'Lenta kartochkasida va qidiruv tizimlarida koʻrinadigan 1–2 jumlali asosiy anons.',
        ru: '1–2 предложения сути новости для анонса в новостной ленте и мета-тегах.',
      },
    },
    {
      id: 'news-form-editor',
      sectionKey: 'news',
      route: '/admin/news/new',
      target: 'news-form.editor',
      placement: 'top',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'WYSIWYG tahrirlovchi',
        ru: 'Текстовый редактор',
      },
      body: {
        uz: 'Matnni formatlang, jadvallar tuzing va matn ichiga fotosuratlarni joylang.',
        ru: 'Форматируйте текст, добавляйте списки, цитаты и загружайте фото прямо в статью.',
      },
    },
    {
      id: 'news-form-status',
      sectionKey: 'news',
      route: '/admin/news/new',
      target: 'news-form.status',
      placement: 'left',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Nashr holati',
        ru: 'Статус публикации',
      },
      body: {
        uz: '«Eʼlon qilingan» deb belgilang yoki material ustida ishlash uchun «Qoralama» qilib qoldiring.',
        ru: 'Выберите статус «Опубликовано» или сохраните как «Черновик» для доработки.',
      },
    },
    {
      id: 'news-form-cover',
      sectionKey: 'news',
      route: '/admin/news/new',
      target: 'news-form.cover',
      placement: 'left',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Asosiy muqova',
        ru: 'Обложка новости',
      },
      body: {
        uz: 'Sayt bosh sahifasi va lentada koʻrinadigan yuqori sifatli fotosuratni yuklang.',
        ru: 'Загрузите главное фото статьи для эффектного отображения на главной странице.',
      },
    },
    {
      id: 'news-form-submit',
      sectionKey: 'news',
      route: '/admin/news/new',
      target: 'news-form.submit',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Saqlash va nashr qilish',
        ru: 'Сохранить и опубликовать',
      },
      body: {
        uz: 'Barcha maydonlar toʻldirilgach, «Eʼlon qilish» tugmasi bilan maqolani portalga chiqaring.',
        ru: 'После заполнения формы нажмите кнопку для сохранения или публикации материала.',
      },
    },
  ],

  events: [
    {
      id: 'events-create-btn',
      sectionKey: 'events',
      route: '/admin/events',
      target: 'events.create-btn',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Tadbir qoʻshish',
        ru: 'Добавить событие',
      },
      body: {
        uz: 'Yangi taqvimiy tadbir, seminar yoki ochiq eshiklar kunini eʼlon qilish oynasini ochadi.',
        ru: 'Открывает окно создания мероприятия с выбором даты, времени и локации.',
      },
    },
    {
      id: 'events-search-input',
      sectionKey: 'events',
      route: '/admin/events',
      target: 'events.search-input',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Qidiruv',
        ru: 'Поиск событий',
      },
      body: {
        uz: 'Tadbir nomi yoki oʻtkaziladigan xona/bino boʻyicha qidirish.',
        ru: 'Поиск мероприятий по названию или месту проведения.',
      },
    },
    {
      id: 'events-category-filter',
      sectionKey: 'events',
      route: '/admin/events',
      target: 'events.category-filter',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Toifa filtri',
        ru: 'Категория',
      },
      body: {
        uz: 'Ochiq eshiklar kuni, fan, sport yoki madaniyat tadbirlarini saralash.',
        ru: 'Фильтрация по типу: день открытых дверей, наука, спорт или культура.',
      },
    },
    {
      id: 'events-table',
      sectionKey: 'events',
      route: '/admin/events',
      target: 'events.table',
      placement: 'top',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Tadbirlar roʻyxati',
        ru: 'Список событий',
      },
      body: {
        uz: 'Barcha rejalashtirilgan tadbirlar, ularning sanasi va tahrirlash amallari jadvali.',
        ru: 'Таблица мероприятий с датами, статусом и кнопками быстрого редактирования.',
      },
    },
  ],

  teachers: [
    {
      id: 'teachers-create-btn',
      sectionKey: 'teachers',
      route: '/admin/teachers',
      target: 'teachers.create-btn',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Oʻqituvchi qoʻshish',
        ru: 'Добавить преподавателя',
      },
      body: {
        uz: 'Yangi pedagog kadr anketasini yaratish va kafedraga biriktirish oynasi.',
        ru: 'Форма добавления нового преподавателя с указанием кафедры и предметов.',
      },
    },
    {
      id: 'teachers-search-input',
      sectionKey: 'teachers',
      route: '/admin/teachers',
      target: 'teachers.search-input',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Pedagoglar qidiruvi',
        ru: 'Поиск преподавателей',
      },
      body: {
        uz: 'F.I.O., lavozim yoki oʻqitadigan fani boʻyicha tezkor topish.',
        ru: 'Быстрый поиск педагогов по имени, должности или преподаваемым дисциплинам.',
      },
    },
    {
      id: 'teachers-table',
      sectionKey: 'teachers',
      route: '/admin/teachers',
      target: 'teachers.table',
      placement: 'top',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Pedagoglar reestri',
        ru: 'Реестр преподавателей',
      },
      body: {
        uz: 'Pedagogik staj, fotosurat va faoliyat holati koʻrsatilgan toʻliq roʻyxat.',
        ru: 'Таблица педагогического состава с фото, стажем и кнопками редактирования.',
      },
    },
  ],

  administration: [
    {
      id: 'administration-create-btn',
      sectionKey: 'administration',
      route: '/admin/administration',
      target: 'administration.create-btn',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Rahbar qoʻshish',
        ru: 'Добавить руководителя',
      },
      body: {
        uz: 'Direksiya aʼzosi yoki boʻlim boshligʻi profilini yaratish.',
        ru: 'Создание учетной карточки директора или начальника подразделения.',
      },
    },
    {
      id: 'administration-search-input',
      sectionKey: 'administration',
      route: '/admin/administration',
      target: 'administration.search-input',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Qidiruv',
        ru: 'Поиск руководства',
      },
      body: {
        uz: 'F.I.O., lavozim yoki xona raqami boʻyicha qidiruv maydoni.',
        ru: 'Поиск сотрудника по имени, должности или номеру кабинета.',
      },
    },
    {
      id: 'administration-category-tabs',
      sectionKey: 'administration',
      route: '/admin/administration',
      target: 'administration.category-tabs',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Toifa varaqlari',
        ru: 'Вкладки категорий',
      },
      body: {
        uz: 'Rahbariyat, boʻlim boshliqlari va maʼmuriy-xoʻjalik xodimlari oʻrtasida oʻtish.',
        ru: 'Быстрое переключение между дирекцией, отделами и хозяйственной частью.',
      },
    },
    {
      id: 'administration-table',
      sectionKey: 'administration',
      route: '/admin/administration',
      target: 'administration.table',
      placement: 'top',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Rahbariyat jadvali',
        ru: 'Таблица руководства',
      },
      body: {
        uz: 'Qabul kunlari, xona va xizmat telefonlari koʻrsatilgan maʼmuriy tarkib.',
        ru: 'Список руководителей с часами личного приема граждан и прямыми контактами.',
      },
    },
  ],

  specialties: [
    {
      id: 'specialties-create-btn',
      sectionKey: 'specialties',
      route: '/admin/specialties',
      target: 'specialties.create-btn',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Mutaxassislik qoʻshish',
        ru: 'Добавить специальность',
      },
      body: {
        uz: 'Yangi taʼlim yoʻnalishi, oʻqish muddati va qabul rejalarini kiritish.',
        ru: 'Ввод нового направления подготовки, контрольных цифр приема и сроков обучения.',
      },
    },
    {
      id: 'specialties-search-input',
      sectionKey: 'specialties',
      route: '/admin/specialties',
      target: 'specialties.search-input',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Klassifikator qidiruvi',
        ru: 'Поиск по классификатору',
      },
      body: {
        uz: 'Davlat klassifikatori kodi (masalan, 40610101) yoki nomi boʻyicha topish.',
        ru: 'Поиск направления по официальному коду или названию специальности.',
      },
    },
    {
      id: 'specialties-table',
      sectionKey: 'specialties',
      route: '/admin/specialties',
      target: 'specialties.table',
      placement: 'top',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Yoʻnalishlar jadvali',
        ru: 'Каталог специальностей',
      },
      body: {
        uz: 'Davlat granti va toʻlov-kontrakt oʻrinlari soni hamda oʻtish ballari.',
        ru: 'Сводная таблица специальностей техникума, мест на грант/контракт и баллов.',
      },
    },
  ],

  pages: [
    {
      id: 'pages-search-input',
      sectionKey: 'pages',
      route: '/admin/pages',
      target: 'pages.search-input',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Sahifalar qidiruvi',
        ru: 'Поиск разделов',
      },
      body: {
        uz: '12 ta majburiy ustav sahifasini nomi yoki slug boʻyicha qidirish.',
        ru: 'Поиск среди 12 обязательных страниц открытости техникума.',
      },
    },
    {
      id: 'pages-table',
      sectionKey: 'pages',
      route: '/admin/pages',
      target: 'pages.table',
      placement: 'top',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: '37-modda boʻlimlari',
        ru: 'Реестр разделов ст. 37',
      },
      body: {
        uz: '«Taʼlim toʻgʻrisida»gi Qonunning 37-moddasi boʻyicha rasmiy maʼlumotlarni tahrirlash.',
        ru: 'Обязательные страницы (МТО, финансы, лицензии) с кнопками редактирования.',
      },
    },
  ],

  contacts: [
    {
      id: 'contacts-save-btn',
      sectionKey: 'contacts',
      route: '/admin/contacts',
      target: 'contacts.save-btn',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Oʻzgarishlarni saqlash',
        ru: 'Сохранить изменения',
      },
      body: {
        uz: 'Barcha kiritilgan oʻzgarishlarni darhol saytning /contacts sahifasida yangilaydi.',
        ru: 'Применение отредактированных адресов, телефонов и координат на сайте.',
      },
    },
    {
      id: 'contacts-campuses',
      sectionKey: 'contacts',
      route: '/admin/contacts',
      target: 'contacts.campuses',
      placement: 'top',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Oʻquv binolari va korpuslar',
        ru: 'Корпуса техникума',
      },
      body: {
        uz: 'Oʻquv korpuslari manzillari, jamoat transporti va xarita koordinatalari.',
        ru: 'Управление адресами зданий, схемой проезда и GPS-координатами карты.',
      },
    },
    {
      id: 'contacts-phones',
      sectionKey: 'contacts',
      route: '/admin/contacts',
      target: 'contacts.phones',
      placement: 'top',
      roles: [UserRole.ADMIN, UserRole.EDITOR],
      title: {
        uz: 'Telefon maʼlumotnomasi',
        ru: 'Телефонный справочник',
      },
      body: {
        uz: 'Qabul komissiyasi, xizmatlar va boʻlimlarning toʻgʻridan-toʻgʻri telefonlari.',
        ru: 'Справочник прямых телефонов подразделений и приемной комиссии.',
      },
    },
  ],

  media: [
    {
      id: 'media-upload-btn',
      sectionKey: 'media',
      route: '/admin/media',
      target: 'media.upload-btn',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Fayllarni yuklash',
        ru: 'Загрузить файлы',
      },
      body: {
        uz: 'Kompyuterdan fotosuratlar va rasmiy PDF hujjatlarni xotiraga yuklash.',
        ru: 'Загрузка графических файлов и официальных PDF-документов в облачное хранилище.',
      },
    },
    {
      id: 'media-bucket-tabs',
      sectionKey: 'media',
      route: '/admin/media',
      target: 'media.bucket-tabs',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Xotira omborlari',
        ru: 'Хранилища (бакеты)',
      },
      body: {
        uz: 'Yangiliklar suratlari (news-media) va rasmiy hujjatlar omborlari oʻrtasida almashish.',
        ru: 'Переключение между бакетами медиаматериалов и официальных актов.',
      },
    },
    {
      id: 'media-search-input',
      sectionKey: 'media',
      route: '/admin/media',
      target: 'media.search-input',
      placement: 'bottom',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Fayllar qidiruvi',
        ru: 'Поиск файлов',
      },
      body: {
        uz: 'Faylning asl nomi boʻyicha tezkor saralash.',
        ru: 'Поиск файлов по оригинальному имени в текущем бакете.',
      },
    },
    {
      id: 'media-grid',
      sectionKey: 'media',
      route: '/admin/media',
      target: 'media.grid',
      placement: 'top',
      roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR],
      title: {
        uz: 'Mediateka toʻplami',
        ru: 'Галерея файлов',
      },
      body: {
        uz: 'Har bir fayl havolasini (URL) bir marta bosish bilan nusxalash mumkin.',
        ru: 'Сетка файлов с возможностью копирования постоянного URL в один клик.',
      },
    },
  ],

  users: [
    {
      id: 'users-search-input',
      sectionKey: 'users',
      route: '/admin/users',
      target: 'users.search-input',
      placement: 'bottom',
      roles: [UserRole.ADMIN],
      title: {
        uz: 'Foydalanuvchilar qidiruvi',
        ru: 'Поиск пользователей',
      },
      body: {
        uz: 'Xodimlar va masʼullarni F.I.O. yoki email boʻyicha qidirish.',
        ru: 'Поиск учетных записей сотрудников колледжа по имени или электронной почте.',
      },
    },
    {
      id: 'users-table',
      sectionKey: 'users',
      route: '/admin/users',
      target: 'users.table',
      placement: 'top',
      roles: [UserRole.ADMIN],
      title: {
        uz: 'Foydalanuvchilar jadvali',
        ru: 'Таблица пользователей',
      },
      body: {
        uz: 'Xodimlar roʻyxati va ularga berilgan rol huquqlari darajasi (Admin, Editor, Moderator).',
        ru: 'Реестр учетных записей с распределением ролей и прав доступа к CMS.',
      },
    },
    {
      id: 'users-reset-onboarding',
      sectionKey: 'users',
      route: '/admin/users',
      target: 'users.reset-onboarding',
      placement: 'left',
      roles: [UserRole.ADMIN],
      title: {
        uz: 'Onbordingni tiklash',
        ru: 'Сброс онбординга',
      },
      body: {
        uz: 'Ushbu tugma xodim uchun tanishtiruv turini qayta faollashtiradi (keyingi kirishda ochiladi).',
        ru: 'Кнопка сбрасывает статус прохождения тура для сотрудника (тур запустится при входе).',
      },
    },
  ],

  audit: [
    {
      id: 'audit-refresh-btn',
      sectionKey: 'audit',
      route: '/admin/audit',
      target: 'audit.refresh-btn',
      placement: 'bottom',
      roles: [UserRole.ADMIN],
      title: {
        uz: 'Auditni yangilash',
        ru: 'Обновить аудит',
      },
      body: {
        uz: 'Xavfsizlik jurnalini maʼlumotlar bazasidagi eng soʻnggi yozuvlar bilan yangilaydi.',
        ru: 'Немедленная синхронизация журнала аудита с базой данных в реальном времени.',
      },
    },
    {
      id: 'audit-export-btn',
      sectionKey: 'audit',
      route: '/admin/audit',
      target: 'audit.export-btn',
      placement: 'bottom',
      roles: [UserRole.ADMIN],
      title: {
        uz: 'Eksport (JSON)',
        ru: 'Экспорт в JSON',
      },
      body: {
        uz: 'Filtrlangan barcha xavfsizlik yozuvlarini tahlil uchun JSON faylga yuklab olish.',
        ru: 'Выгрузка отфильтрованных записей журнала аудита в файл формата JSON.',
      },
    },
    {
      id: 'audit-search-input',
      sectionKey: 'audit',
      route: '/admin/audit',
      target: 'audit.search-input',
      placement: 'bottom',
      roles: [UserRole.ADMIN],
      title: {
        uz: 'Qidiruv',
        ru: 'Поиск в аудите',
      },
      body: {
        uz: 'Amal nomi, xodim roli yoki IP-manzil boʻyicha qidirish.',
        ru: 'Поиск записей по имени сущности, типу операции или IP-адресу.',
      },
    },
    {
      id: 'audit-action-filter',
      sectionKey: 'audit',
      route: '/admin/audit',
      target: 'audit.action-filter',
      placement: 'bottom',
      roles: [UserRole.ADMIN],
      title: {
        uz: 'Amal filtri',
        ru: 'Фильтр операций',
      },
      body: {
        uz: 'Yaratish, tahrirlash, oʻchirish va eʼlon qilish amallari boʻyicha saralash.',
        ru: 'Фильтрация по типам действий: CREATE, UPDATE, DELETE, PUBLISH, ARCHIVE.',
      },
    },
    {
      id: 'audit-table',
      sectionKey: 'audit',
      route: '/admin/audit',
      target: 'audit.table',
      placement: 'top',
      roles: [UserRole.ADMIN],
      title: {
        uz: 'Xavfsizlik jurnali',
        ru: 'Таблица аудита',
      },
      body: {
        uz: 'Har bir amalning aniq vaqti, ijrochisi va «Tafsilotlar» (Diff) oynasi.',
        ru: 'Хронологическая таблица с просмотром старого и нового состояния данных (Diff).',
      },
    },
  ],
};

export function getWelcomeTourSteps(role: UserRole): TourStep[] {
  return WELCOME_TOUR_STEPS.filter((step) => step.roles.includes(role));
}

export function getSectionTourSteps(
  key: AdminSectionKey,
  role: UserRole,
): TourStep[] {
  const steps = SECTION_TOUR_STEPS[key] || [];
  return steps.filter((step) => step.roles.includes(role));
}
