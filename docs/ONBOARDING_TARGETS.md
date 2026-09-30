# Реестр целевых элементов онбординга (ONBOARDING_TARGETS.md)

Документ содержит полный перечень интерактивных элементов интерфейса панели управления техникума, размеченных атрибутом `data-tour="<section>.<element>"`, для привязки интерактивного гида с подсветкой (spotlight) и выносными подсказками (popover with arrow).

Все элементы и текстовые метки верифицированы непосредственным чтением исходного кода страниц и компонентов.

---

## 1. Приветственный тур (Welcome Tour — Сайдбар и общие элементы)

Приветственный тур последовательно знакомит нового сотрудника с разделами бокового меню в соответствии с его ролью (`Admin`, `Editor`, `Moderator`), а также с профилем и возможностью повторного прохождения тура.

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Допустимые роли | Размещение popover |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `welcome` | `/admin` | `sidebar.dashboard` | Ссылка в меню сайдбара | `Boshqaruv paneli` / `Дашборд` | Admin, Editor, Moderator | right |
| `welcome` | `/admin` | `sidebar.news` | Ссылка в меню сайдбара | `Yangiliklar va maqolalar` / `Новости и статьи` | Admin, Editor, Moderator | right |
| `welcome` | `/admin` | `sidebar.events` | Ссылка в меню сайдбара | `Tadbirlar va taqvim` / `События и календарь` | Admin, Editor, Moderator | right |
| `welcome` | `/admin` | `sidebar.teachers` | Ссылка в меню сайдбара | `Oʻqituvchilar tarkibi` / `Педагогический состав` | Admin, Editor | right |
| `welcome` | `/admin` | `sidebar.administration` | Ссылка в меню сайдбара | `Rahbariyat va maʼmuriyat` / `Руководство и администрация` | Admin, Editor | right |
| `welcome` | `/admin` | `sidebar.specialties` | Ссылка в меню сайдбара | `Mutaxassisliklar` / `Специальности техникума` | Admin, Editor | right |
| `welcome` | `/admin` | `sidebar.pages` | Ссылка в меню сайдбара | `Muassasa haqida (37-modda)` / `Сведения об ОО (37-модда)` | Admin, Editor | right |
| `welcome` | `/admin` | `sidebar.contacts` | Ссылка в меню сайдбара | `Bogʻlanish va aloqa (Aloqa)` / `Контакты и реквизиты (Aloqa)` | Admin, Editor | right |
| `welcome` | `/admin` | `sidebar.media` | Ссылка в меню сайдбара | `Mediateka / Fayllar` / `Медиатека / Файлы` | Admin, Editor, Moderator | right |
| `welcome` | `/admin` | `sidebar.users` | Ссылка в меню сайдбара | `Foydalanuvchilar va rollar` / `Пользователи и роли` | Admin | right |
| `welcome` | `/admin` | `sidebar.audit` | Ссылка в меню сайдбара | `Audit jurnali` / `Журнал аудита` | Admin | right |
| `welcome` | `/admin` | `sidebar.user-profile` | Блок профиля внизу сайдбара | ФИО сотрудника + бейдж роли | Admin, Editor, Moderator | right / top |
| `welcome` | `/admin` | `sidebar.tour-restart` | Кнопка внизу сайдбара | `Ekskursiyani boshlash` / `Пройти тур заново` | Admin, Editor, Moderator | right / top |

---

## 2. Посекционные целевые элементы (Per-Section Tours — «Показать мне»)

Тур по разделу запускается из неблокирующей карточки `SectionPromptCard` и детально подсвечивает рабочие инструменты конкретной страницы.

### 2.1. Новости (`news`)
- **Маршруты:** `/admin/news` и `/admin/news/new`

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `news` | `/admin/news` | `news.create-btn` | Кнопка-ссылка создания новости | `Yangilik yozish` / `Написать новость` | bottom / left |
| `news` | `/admin/news` | `news.search-input` | Поле поисковой строки | `Sarlavha yoki matn boʻyicha qidirish...` / `Поиск по названию или тексту...` | bottom |
| `news` | `/admin/news` | `news.status-filter` | Выпадающий список фильтра статуса | `Barcha holatlar` / `Все статусы` | bottom |
| `news` | `/admin/news` | `news.category-filter` | Выпадающий список фильтра рубрик | `Barcha ruknlar` / `Все рубрики` | bottom |
| `news` | `/admin/news/new` | `news-form.title` | Поле ввода заголовка | `Nashr sarlavhasi` / `Заголовок публикации` | bottom |
| `news` | `/admin/news/new` | `news-form.lead` | Поле краткого содержания (лида) | `Qisqa mazmuni (lid)` / `Краткое содержание (лид)` | bottom |
| `news` | `/admin/news/new` | `news-form.editor` | Контейнер WYSIWYG редактора | Поле форматированного текста статьи | top / bottom |
| `news` | `/admin/news/new` | `news-form.status` | Селектор статуса публикации | `Material holati` / `Статус материала` | left / top |
| `news` | `/admin/news/new` | `news-form.cover` | Компонент загрузки обложки | `Maqola muqovasi` / `Обложка материала` | left / top |
| `news` | `/admin/news/new` | `news-form.submit` | Кнопка отправки формы | `Eʼlon qilish` / `Опубликовать` | bottom / left |

### 2.2. События и календарь (`events`)
- **Маршрут:** `/admin/events`

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `events` | `/admin/events` | `events.create-btn` | Кнопка открытия модального окна | `Tadbir qoʻshish` / `Добавить событие` | bottom / left |
| `events` | `/admin/events` | `events.search-input` | Поле поиска | `Nomi yoki joyi boʻyicha qidiruv...` / `Поиск по названию или месту...` | bottom |
| `events` | `/admin/events` | `events.category-filter` | Селектор категорий мероприятий | `Barcha toifalar` / `Все категории` | bottom |
| `events` | `/admin/events` | `events.table` | Таблица событий техникума | Таблица со списком мероприятий | top |

### 2.3. Преподавательский состав (`teachers`)
- **Маршрут:** `/admin/teachers`

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `teachers` | `/admin/teachers` | `teachers.create-btn` | Кнопка добавления педагога | `Oʻqituvchi qoʻshish` / `Добавить преподавателя` | bottom / left |
| `teachers` | `/admin/teachers` | `teachers.search-input` | Строка поиска преподавателей | `F.I.O., lavozim yoki fan boʻyicha qidiruv...` / `Поиск по ФИО...` | bottom |
| `teachers` | `/admin/teachers` | `teachers.table` | Таблица преподавателей | Реестр педагогов со стажем и предметами | top |

### 2.4. Руководство и администрация (`administration`)
- **Маршрут:** `/admin/administration`

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `administration` | `/admin/administration` | `administration.create-btn` | Кнопка добавления руководителя | `Yangi rahbar qoʻshish` / `Добавить руководителя` | bottom / left |
| `administration` | `/admin/administration` | `administration.search-input` | Поле поиска руководителей | `F.I.O. yoki lavozim...` / `Поиск по ФИО...` | bottom |
| `administration` | `/admin/administration` | `administration.category-tabs` | Вкладки фильтрации категорий | `Barchasi`, `Rahbariyat`, `Boʻlim boshliqlari` | bottom |
| `administration` | `/admin/administration` | `administration.table` | Таблица руководителей | Таблица дирекции и начальников отделов | top |

### 2.5. Специальности (`specialties`)
- **Маршрут:** `/admin/specialties`

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `specialties` | `/admin/specialties` | `specialties.create-btn` | Кнопка добавления специальности | `Mutaxassislik qoʻshish` / `Добавить специальность` | bottom / left |
| `specialties` | `/admin/specialties` | `specialties.search-input` | Поиск по классификатору | `Kodi (40610101), nomi boʻyicha qidiruv...` | bottom |
| `specialties` | `/admin/specialties` | `specialties.table` | Таблица специальностей | Каталог направлений, квоты грант/контракт | top |

### 2.6. Сведения об ОО (37-модда) (`pages`)
- **Маршрут:** `/admin/pages`

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `pages` | `/admin/pages` | `pages.search-input` | Поле поиска уставных страниц | `Sahifa nomi yoki mazmuni...` / `Поиск раздела...` | bottom |
| `pages` | `/admin/pages` | `pages.table` | Реестр 12 обязательных страниц | Таблица разделов ст. 37 ЗРУ-637 | top |

### 2.7. Контакты и реквизиты (`contacts`)
- **Маршрут:** `/admin/contacts`

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `contacts` | `/admin/contacts` | `contacts.save-btn` | Кнопка сохранения контактных данных | `Oʻzgarishlarni saqlash` / `Сохранить изменения` | bottom / left |
| `contacts` | `/admin/contacts` | `contacts.campuses` | Блок зданий и корпусов техникума | `Texnikum binolari va boʻlinmalari` | top |
| `contacts` | `/admin/contacts` | `contacts.phones` | Телефонный справочник отделов | `Telefon maʼlumotnomasi va xizmatlar` | top |

### 2.8. Медиатека (`media`)
- **Маршрут:** `/admin/media`

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `media` | `/admin/media` | `media.upload-btn` | Кнопка загрузки файлов | `Fayllarni yuklash` / `Загрузить файлы` | bottom / left |
| `media` | `/admin/media` | `media.bucket-tabs` | Переключатель хранилищ Supabase | `Yangiliklar suratlari` / `Rasmiy hujjatlar` | bottom |
| `media` | `/admin/media` | `media.search-input` | Поле поиска медиафайлов | `Fayl nomi boʻyicha qidiruv...` | bottom |
| `media` | `/admin/media` | `media.grid` | Сетка загруженных файлов | Галерея и список с кнопкой копирования URL | top |

### 2.9. Пользователи и роли (`users` — Admin only)
- **Маршрут:** `/admin/users`

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `users` | `/admin/users` | `users.search-input` | Поиск по пользователям | `FIO yoki email boʻyicha qidiruv...` | bottom |
| `users` | `/admin/users` | `users.table` | Таблица учетных записей | Список пользователей и их уровней доступа | top |
| `users` | `/admin/users` | `users.reset-onboarding` | Кнопка сброса онбординга | `Onbordingni tiklash` / `Сбросить тур` | left / top |

### 2.10. Журнал аудита (`audit` — Admin only)
- **Маршрут:** `/admin/audit`

| Секция | Маршрут | data-tour значение | Реальный элемент в коде | Текстовая метка (UZ / RU) | Размещение |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `audit` | `/admin/audit` | `audit.refresh-btn` | Кнопка обновления логов | `Yangilash` / `Обновить` | bottom |
| `audit` | `/admin/audit` | `audit.export-btn` | Кнопка экспорта в JSON | `Eksport (JSON)` / `Экспорт (JSON)` | bottom / left |
| `audit` | `/admin/audit` | `audit.search-input` | Строка поиска в журнале аудита | `Nomi, mohiyat, ijrochi yoki IP boʻyicha qidirish...` | bottom |
| `audit` | `/admin/audit` | `audit.action-filter` | Фильтр типов действий | `Barcha amallar` / `Все действия` | bottom |
| `audit` | `/admin/audit` | `audit.table` | Таблица операций аудита | Список событий безопасности с кнопкой снимка Diff | top |
