# Реестр целевых элементов онбординга (ONBOARDING_TARGETS.md)

Документ содержит полный перечень интерактивных элементов интерфейса панели управления техникума, размеченных стабильным атрибутом `data-tour="<section>.<element>"`, для привязки интерактивного гида с фокусным вырезом (spotlight cutout) и выносными подсказками (popover with arrow).

Все элементы и текстовые метки верифицированы непосредственным чтением исходного кода страниц и компонентов.

---

## 1. Универсальные элементы заголовка (Universal Header)

На всех страницах панели управления (на десктопе и мобильных устройствах) в шапке доступна постоянная кнопка вызова справки, позволяющая в любой момент перезапустить гид по текущей странице:

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение popover |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `header` | Все страницы панели управления | `header.page-help-btn` | Кнопка справки со знаком `?` в шапке | `Yordam` / `Справка` | Admin, Editor, Moderator | bottom |

---

## 2. Приветственный тур (Welcome Tour — Сайдбар и общие элементы)

Приветственный тур последовательно знакомит нового сотрудника с навигацией бокового меню в соответствии с его ролью (`Admin`, `Editor`, `Moderator`), профилем пользователя и завершается шагом, указывающим на кнопку справки `?` в шапке для изучения внутренних элементов каждой страницы.

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение popover |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `welcome` | `/admin` | `sidebar.dashboard` | Ссылка меню сайдбара | `Boshqaruv paneli` / `Дашборд` | Admin, Editor, Moderator | right |
| `welcome` | `/admin` | `sidebar.news` | Ссылка меню сайдбара | `Yangiliklar va maqolalar` / `Новости и статьи` | Admin, Editor, Moderator | right |
| `welcome` | `/admin` | `sidebar.events` | Ссылка меню сайдбара | `Tadbirlar va taqvim` / `События и календарь` | Admin, Editor, Moderator | right |
| `welcome` | `/admin` | `sidebar.teachers` | Ссылка меню сайдбара | `Oʻqituvchilar tarkibi` / `Педагогический состав` | Admin, Editor | right |
| `welcome` | `/admin` | `sidebar.administration` | Ссылка меню сайдбара | `Rahbariyat va maʼmuriyat` / `Руководство и администрация` | Admin, Editor | right |
| `welcome` | `/admin` | `sidebar.specialties` | Ссылка меню сайдбара | `Mutaxassisliklar` / `Специальности техникума` | Admin, Editor | right |
| `welcome` | `/admin` | `sidebar.pages` | Ссылка меню сайдбара | `Muassasa haqida (37-modda)` / `Сведения об ОО (37-модда)` | Admin, Editor | right |
| `welcome` | `/admin` | `sidebar.contacts` | Ссылка меню сайдбара | `Bogʻlanish va aloqa (Aloqa)` / `Контакты и реквизиты (Aloqa)` | Admin, Editor | right |
| `welcome` | `/admin` | `sidebar.media` | Ссылка меню сайдбара | `Mediateka / Fayllar` / `Медиатека / Файлы` | Admin, Editor, Moderator | right |
| `welcome` | `/admin` | `sidebar.users` | Ссылка меню сайдбара | `Foydalanuvchilar va rollar` / `Пользователи и роли` | Admin | right |
| `welcome` | `/admin` | `sidebar.audit` | Ссылка меню сайдбара | `Audit jurnali` / `Журнал аудита` | Admin | right |
| `welcome` | `/admin` | `sidebar.user-profile` | Блок профиля внизу сайдбара | ФИО сотрудника + бейдж роли | Admin, Editor, Moderator | right / top |
| `welcome` | `/admin` | `sidebar.tour-restart` | Кнопка внизу сайдбара | `Ekskursiyani boshlash` / `Пройти тур заново` | Admin, Editor, Moderator | right / top |
| `welcome` | `/admin` | `header.page-help-btn` | Кнопка справки в верхней шапке | `Yordam` / `Справка` | Admin, Editor, Moderator | bottom |

---

## 3. Внутристраничные туры (In-Page Tours)

Каждая страница панели управления имеет собственный тур, обучающий работе с элементами управления непосредственно внутри контента страницы (кнопки создания, фильтры, поля форм, действия со строками таблиц, сохранение и публикация).

### 3.1. Дашборд (`dashboard`)
- **Маршрут:** `/admin`
- **Запуск:** Первое посещение (карточка `SectionPromptCard`) или кнопка `?` в шапке на `/admin`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `dashboard-create-btn` | `/admin` | `dashboard.create-btn` | Кнопка создания новой публикации | `Yangi maqola yaratish` / `Создать новость` | Admin, Editor, Moderator | bottom |
| `dashboard-quick-actions` | `/admin` | `dashboard.quick-actions` | Блок быстрых действий (кнопки событий, файлов, контактов) | `Tezkor amallar` / `Быстрые действия` | Admin, Editor, Moderator | bottom |
| `dashboard-kpi-news` | `/admin` | `dashboard.kpi-news` | Карточка метрик статей и черновиков | `Nashrlar koʻrsatkichi` / `Метрика публикаций` | Admin, Editor, Moderator | bottom |
| `dashboard-kpi-teachers` | `/admin` | `dashboard.kpi-teachers` | Карточка метрик преподавательского состава | `Pedagoglar monitoringi` / `Мониторинг преподавателей` | Admin, Editor | bottom |
| `dashboard-kpi-specialties` | `/admin` | `dashboard.kpi-specialties` | Карточка направлений подготовки и квот | `Taʼlim yoʻnalishlari va kvotalar` / `Направления и квоты` | Admin, Editor | bottom |
| `dashboard-recent-table` | `/admin` | `dashboard.recent-table` | Таблица последних добавленных материалов с быстрыми переключателями | `Soʻnggi nashrlar jadvali` / `Таблица последних публикаций` | Admin, Editor, Moderator | top |
| `dashboard-audit-widget` | `/admin` | `dashboard.audit-widget` | Виджет последних операций журнала безопасности | `Xavfsizlik auditi xulosasi` / `Сводка журнала безопасности` | Admin | top |

---

### 3.2. Реестр новостей (`news`)
- **Маршрут:** `/admin/news`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/news`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `news-create-btn` | `/admin/news` | `news.create-btn` | Кнопка перехода к форме создания | `Yangilik yozish` / `Написать новость` | Admin, Editor, Moderator | bottom |
| `news-search-input` | `/admin/news` | `news.search-input` | Поле поисковой строки | `Sarlavha yoki matn boʻyicha qidiruv...` / `Поиск по названию или тексту...` | Admin, Editor, Moderator | bottom |
| `news-status-filter` | `/admin/news` | `news.status-filter` | Селектор статуса (Опубликовано / Черновики / Архив) | `Barcha holatlar` / `Все статусы` | Admin, Editor, Moderator | bottom |
| `news-category-filter` | `/admin/news` | `news.category-filter` | Селектор тематической рубрики | `Barcha ruknlar` / `Все рубрики` | Admin, Editor, Moderator | bottom |
| `news-table` | `/admin/news` | `news.table` | Таблица публикаций техникума | Реестр новостей с бейджами и датами | Admin, Editor, Moderator | top |
| `news-row-actions` | `/admin/news` | `news.row-actions` | Блок кнопок действий первой строки (просмотр, быстрый статус, редактор, удаление) | `Amallar` / `Действия над публикацией` | Admin, Editor, Moderator | left |

---

### 3.3. Редактор публикаций (`news-editor`)
- **Маршруты:** `/admin/news/new` и `/admin/news/[id]`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке в редакторе новостей.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `news-editor-title` | `/admin/news/new` | `news-form.title` | Поле ввода заголовка публикации | `Nashr sarlavhasi` / `Заголовок публикации` | Admin, Editor, Moderator | bottom |
| `news-editor-lead` | `/admin/news/new` | `news-form.lead` | Поле краткого содержания (лида) для анонса | `Qisqa mazmuni (lid)` / `Краткое содержание (лид)` | Admin, Editor, Moderator | bottom |
| `news-editor-editor` | `/admin/news/new` | `news-form.editor` | Визуальный редактор текста статьи (WYSIWYG) | Текстовое поле с панелью инструментов | Admin, Editor, Moderator | top |
| `news-editor-cover` | `/admin/news/new` | `news-form.cover` | Компонент загрузки обложки (файл или URL) | `Asosiy muqova` / `Обложка новости` | Admin, Editor, Moderator | left |
| `news-editor-category` | `/admin/news/new` | `news-form.category` | Селектор рубрики статьи | `Tematik rukn` / `Тематическая рубрика` | Admin, Editor, Moderator | left |
| `news-editor-status` | `/admin/news/new` | `news-form.status` | Переключатель статуса публикации | `Nashr holati` / `Статус публикации` | Admin, Editor, Moderator | left |
| `news-editor-submit` | `/admin/news/new` | `news-form.submit` | Кнопка отправки формы / сохранения | `Eʼlon qilish` / `Сохранить и опубликовать` | Admin, Editor, Moderator | top |

---

### 3.4. События и календарь (`events`)
- **Маршрут:** `/admin/events`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/events`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `events-create-btn` | `/admin/events` | `events.create-btn` | Кнопка открытия модального окна добавления | `Tadbir qoʻshish` / `Добавить событие` | Admin, Editor, Moderator | bottom |
| `events-search-input` | `/admin/events` | `events.search-input` | Поле поиска событий по названию и месту | `Nomi yoki joyi boʻyicha qidiruv...` / `Поиск по названию или месту...` | Admin, Editor, Moderator | bottom |
| `events-category-filter` | `/admin/events` | `events.category-filter` | Селектор типа мероприятий | `Barcha toifalar` / `Все категории` | Admin, Editor, Moderator | bottom |
| `events-table` | `/admin/events` | `events.table` | Таблица запланированных мероприятий | Список событий техникума | Admin, Editor, Moderator | top |
| `events-row-actions` | `/admin/events` | `events.row-actions` | Кнопки правки и удаления первой строки таблицы | `Tadbir amallari` / `Действия над событием` | Admin, Editor, Moderator | left |

---

### 3.5. Преподавательский состав (`teachers`)
- **Маршрут:** `/admin/teachers`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/teachers`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `teachers-create-btn` | `/admin/teachers` | `teachers.create-btn` | Кнопка открытия модального окна добавления | `Oʻqituvchi qoʻshish` / `Добавить преподавателя` | Admin, Editor | bottom |
| `teachers-search-input` | `/admin/teachers` | `teachers.search-input` | Поле поиска преподавателей по ФИО и предметам | `F.I.O., lavozim yoki fan boʻyicha...` / `Поиск по ФИО...` | Admin, Editor | bottom |
| `teachers-table` | `/admin/teachers` | `teachers.table` | Таблица реестра преподавателей | Реестр преподавателей со стажем и предметами | Admin, Editor | top |
| `teachers-row-actions` | `/admin/teachers` | `teachers.row-actions` | Кнопки редактирования анкеты и удаления первой строки | `Pedagog amallari` / `Действия над профилем` | Admin, Editor | left |

---

### 3.6. Руководство и администрация (`administration`)
- **Маршрут:** `/admin/administration`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/administration`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `administration-create-btn` | `/admin/administration` | `administration.create-btn` | Кнопка добавления руководителя | `Rahbar qoʻshish` / `Добавить руководителя` | Admin, Editor | bottom |
| `administration-search-input` | `/admin/administration` | `administration.search-input` | Поле поиска сотрудников руководства | `F.I.O. yoki lavozim...` / `Поиск по ФИО...` | Admin, Editor | bottom |
| `administration-category-tabs` | `/admin/administration` | `administration.category-tabs` | Вкладки подразделений (Дирекция, Отделы, АХЧ) | `Barchasi`, `Rahbariyat`, `Boʻlim boshliqlari` | Admin, Editor | bottom |
| `administration-table` | `/admin/administration` | `administration.table` | Таблица руководства с контактами и часами приема | Таблица административного состава | Admin, Editor | top |
| `administration-row-actions` | `/admin/administration` | `administration.row-actions` | Кнопки редактирования и удаления первой строки | `Rahbar amallari` / `Действия над карточкой` | Admin, Editor | left |

---

### 3.7. Специальности техникума (`specialties`)
- **Маршрут:** `/admin/specialties`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/specialties`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `specialties-create-btn` | `/admin/specialties` | `specialties.create-btn` | Кнопка добавления направления подготовки | `Mutaxassislik qoʻshish` / `Добавить специальность` | Admin, Editor | bottom |
| `specialties-search-input` | `/admin/specialties` | `specialties.search-input` | Поле поиска по коду классификатора и названию | `Klassifikator qidiruvi` / `Поиск по классификатору` | Admin, Editor | bottom |
| `specialties-table` | `/admin/specialties` | `specialties.table` | Таблица специальностей, квот приема и баллов | Сводная таблица специальностей | Admin, Editor | top |
| `specialties-row-actions` | `/admin/specialties` | `specialties.row-actions` | Кнопки редактирования параметров и удаления первой строки | `Mutaxassislik amallari` / `Действия над специальностью` | Admin, Editor | left |

---

### 3.8. Сведения об ОО (37-модда) (`pages`)
- **Маршрут:** `/admin/pages`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/pages`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `pages-search-input` | `/admin/pages` | `pages.search-input` | Поле поиска среди 12 уставных разделов | `Sahifalar qidiruvi` / `Поиск разделов` | Admin, Editor | bottom |
| `pages-table` | `/admin/pages` | `pages.table` | Таблица 12 обязательных разделов статьи 37 ЗРУ-637 | Реестр обязательных разделов открытости | Admin, Editor | top |
| `pages-row-actions` | `/admin/pages` | `pages.row-actions` | Кнопки просмотра, переключения видимости и редактирования текста первой строки | `Sahifa amallari` / `Действия над разделом` | Admin, Editor | left |

---

### 3.9. Контакты и реквизиты (`contacts`)
- **Маршрут:** `/admin/contacts`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/contacts`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `contacts-save-btn` | `/admin/contacts` | `contacts.save-btn` | Кнопка отправки формы и сохранения контактов | `Oʻzgarishlarni saqlash` / `Сохранить изменения` | Admin, Editor | bottom |
| `contacts-campuses` | `/admin/contacts` | `contacts.campuses` | Блок карточек учебных корпусов и адресов | `Texnikum binolari va boʻlinmalari` / `Здания и корпуса техникума` | Admin, Editor | top |
| `contacts-phones` | `/admin/contacts` | `contacts.phones` | Таблица телефонного справочника служб | `Boʻlimlar telefon maʼlumotnomasi` / `Телефонный справочник отделов` | Admin, Editor | top |

---

### 3.10. Медиатека и файлы (`media`)
- **Маршрут:** `/admin/media`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/media`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `media-upload-btn` | `/admin/media` | `media.upload-btn` | Кнопка вызова диалога загрузки файлов с диска | `Fayllarni yuklash` / `Загрузить файлы` | Admin, Editor, Moderator | bottom |
| `media-bucket-tabs` | `/admin/media` | `media.bucket-tabs` | Вкладки переключения бакетов (`news-media`, `official-docs`) | `Xotira omborlari` / `Хранилища (бакеты)` | Admin, Editor, Moderator | bottom |
| `media-search-input` | `/admin/media` | `media.search-input` | Поле поиска файлов по оригинальному имени | `Fayllar qidiruvi` / `Поиск файлов` | Admin, Editor, Moderator | bottom |
| `media-grid` | `/admin/media` | `media.grid` | Сетка загруженных файлов с кнопками копирования URL | `Mediateka toʻplami` / `Галерея файлов` | Admin, Editor, Moderator | top |

---

### 3.11. Пользователи и роли (`users` — Доступ только для `Admin`)
- **Маршрут:** `/admin/users`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/users`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `users-search-input` | `/admin/users` | `users.search-input` | Поле поиска учетных записей по имени и email | `Foydalanuvchilar qidiruvi` / `Поиск пользователей` | Admin | bottom |
| `users-table` | `/admin/users` | `users.table` | Таблица зарегистрированных сотрудников CMS | Реестр учетных записей и уровней доступа | Admin | top |
| `users-role-select` | `/admin/users` | `users.role-select` | Выпадающий список изменения роли (Admin, Editor, Moderator) | `Kirish huquqini belgilash` / `Назначение роли` | Admin | left |
| `users-reset-onboarding` | `/admin/users` | `users.reset-onboarding` | Кнопка сброса статуса онбординга сотрудника | `Onbordingni tiklash` / `Сброс онбординга` | Admin | left |

---

### 3.12. Журнал аудита (`audit` — Доступ только для `Admin`)
- **Маршрут:** `/admin/audit`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/audit`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `audit-refresh-btn` | `/admin/audit` | `audit.refresh-btn` | Кнопка немедленного обновления журнала | `Auditni yangilash` / `Обновить аудит` | Admin | bottom |
| `audit-export-btn` | `/admin/audit` | `audit.export-btn` | Кнопка выгрузки отфильтрованных логов в JSON | `Eksport (JSON)` / `Экспорт в JSON` | Admin | bottom |
| `audit-search-input` | `/admin/audit` | `audit.search-input` | Поле поиска по названию, роли, IP-адресу | `Qidiruv` / `Поиск в аудите` | Admin | bottom |
| `audit-action-filter` | `/admin/audit` | `audit.action-filter` | Селектор фильтрации типов действий (CREATE, UPDATE, DELETE, etc.) | `Amal filtri` / `Фильтр операций` | Admin | bottom |
| `audit-table` | `/admin/audit` | `audit.table` | Хронологическая таблица операций безопасности | Таблица аудита действий пользователей | Admin | top |
| `audit-diff-btn` | `/admin/audit` | `audit.diff-btn` | Кнопка вызова модального окна снимка различий (Diff) | `Diff / Oʻzgarishlar surati` / `Просмотр снимка Diff` | Admin | left |

---

### 3.13. Настройки заведения (`institution` — Доступ только для `Admin`)
- **Маршрут:** `/admin/settings/institution`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/settings/institution`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `institution-general-section` | `/admin/settings/institution` | `institution.general-section` | Блок общих сведений (наименования, тип) | `Asosiy maʼlumotlar` / `Общие сведения` | Admin | bottom |
| `institution-branding-section` | `/admin/settings/institution` | `institution.branding-section` | Блок фирменного стиля и ассетов | `Brending va ramzlar` / `Фирменный стиль и символика` | Admin | bottom |
| `institution-contacts-section` | `/admin/settings/institution` | `institution.contacts-section` | Блок контактов и геолокации | `Aloqa va koordinatalar` / `Контакты и геолокация` | Admin | top |
| `institution-legal-section` | `/admin/settings/institution` | `institution.legal-section` | Блок юридических и банковских реквизитов | `Yuridik va bank rekvizitlari` / `Юридические и банковские реквизиты` | Admin | top |
| `institution-save-btn` | `/admin/settings/institution` | `institution.save-btn` | Кнопка сохранения настроек заведения | `Sozlamalarni saqlash` / `Сохранение настроек` | Admin | left |

---

### 3.14. Структура сайта и меню (`navigation` — Доступ только для `Admin`)
- **Маршрут:** `/admin/navigation`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/navigation`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `navigation-tree` | `/admin/navigation` | `navigation.tree` | Дерево навигации с поддержкой Drag-and-Drop и стрелок | `Menyu daraxti va tartiblash` / `Дерево меню и сортировка` | Admin | bottom |
| `navigation-add-btn` | `/admin/navigation` | `navigation.add-btn` | Кнопка добавления нового пункта меню | `Yangi band qoʻshish` / `Добавить пункт меню` | Admin | left |
| `navigation-modules-card` | `/admin/navigation` | `navigation.modules-card` | Блок переключателей встроенных модулей | `Tizimli modullar holati` / `Управление встроенными модулями` | Admin | top |
| `navigation-restore-defaults` | `/admin/navigation` | `navigation.restore-defaults` | Кнопка сброса структуры меню к заводским настройкам | `Standart menyuni tiklash` / `Восстановить меню по умолчанию` | Admin | left |

---

### 3.15. Тема оформления (`theme` — Доступ только для `Admin`)
- **Маршрут:** `/admin/settings/theme`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке на `/admin/settings/theme`.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `theme-presets-grid` | `/admin/settings/theme` | `theme.presets-grid` | Каталог из 5 дизайн-пресетов оформления | `Dizayn-presetlar katalogi` / `Каталог дизайн-пресетов` | Admin | bottom |
| `theme-preview-card` | `/admin/settings/theme` | `theme.preview-card` | Интерактивный предпросмотр темы с проверкой WCAG AA | `Jonli koʻrinish va WCAG AA` / `Предпросмотр и проверка WCAG AA` | Admin | bottom |
| `theme-save-btn` | `/admin/settings/theme` | `theme.save-btn` | Кнопка применения и сохранения темы оформления | `Mavzuni saqlash` / `Применение темы` | Admin | left |

---

### 3.16. Конструктор страниц (`page-builder` — Доступ для `Admin`, `Editor`)
- **Маршрут:** `/admin/pages/[id]`
- **Запуск:** Карточка `SectionPromptCard` или кнопка `?` в шапке в редакторе страниц.

| Шаг | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `page-builder-palette` | `/admin/pages/[id]` | `page-builder.palette` | Боковая палитра доступных блоков (14 типов) | `Bloklar kutubxonasi` / `Палитра блоков` | Admin, Editor | right |
| `page-builder-canvas` | `/admin/pages/[id]` | `page-builder.canvas` | Холст страницы с перетаскиванием блоков | `Sahifa bloklari tarkibi` / `Холст блоков` | Admin, Editor | top |
| `page-builder-preview-btn` | `/admin/pages/[id]` | `page-builder.preview-btn` | Кнопка открытия черновика в новой вкладке | `Koʻrish` / `Превью` | Admin, Editor | bottom |
| `page-builder-publish-btn` | `/admin/pages/[id]` | `page-builder.publish-btn` | Кнопка проверки доступности и публикации | `Eʼlon qilish` / `Опубликовать` | Admin, Editor | left |

---

## 4. Маршруты панели управления с 0 шагами (Zero-Step Routes)

Следующие маршруты панели управления намеренно не имеют собственных шагов тура:

| Маршрут | Число шагов | Обоснование отсутствия шагов онбординга |
| :--- | :--- | :--- |
| `/admin/schedule` | **0** | **Технический роут автоматического перенаправления (Redirect)**. Страница `/admin/schedule` выполняет немедленный клиентский редирект (`router.replace('/admin/administration')`) в раздел «Rahbariyat va maʼmuriyat» для сохранения обратной совместимости старых закладок. Никакого собственного контента или кнопок она не содержит. |
| `/admin/login` | **0** | **Публичная страница входа без аутентификации (Unauthenticated Login)**. Страница авторизации не отображает административный сайдбар, верхнюю шапку и профиль. Онбординг активируется исключительно для авторизованных сотрудников в соответствии с их реальной ролью в системе (`Admin`, `Editor`, `Moderator`). |
