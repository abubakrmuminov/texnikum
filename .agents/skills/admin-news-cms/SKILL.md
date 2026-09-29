---
name: admin-news-cms
description: Comprehensive skill for building and maintaining the college admin panel (CMS) for creating, editing, categorizing, and publishing news, events, and official directives with role-based access control (Admin / Editor).
triggers:
  - admin panel
  - админка
  - админ панель
  - админка для новостей
  - создать новость
  - cms новостей
  - панель управления колледжа
  - публикация статей
---

# College News Admin Panel & CMS Skill

## 1. Scope & Capabilities
Этот скилл описывает архитектуру и интерфейс панели администратора (CMS) для сайта училища/колледжа:
- **Дашборд администратора**: Общая статистика (количество новостей, черновиков, просмотров, запланированных мероприятий).
- **CRUD новостей**: Создание, предпросмотр, редактирование, удаление, сброс кэша.
- **Статусная модель**:
  - `draft` — черновик, виден только автору и редакторам.
  - `published` — опубликовано на основном сайте.
  - `archived` — архивный материал.
- **Загрузка медиа в Supabase Storage**: Автоматическая оптимизация обложек, валидация формата (WebP, JPG, PNG, PDF), генерация публичных URL.
- **RBAC Защита маршрутов**: Страницы `/admin/*` доступны только пользователям с `role in ('admin', 'super_admin', 'editor')`.

---

## 2. Архитектура экранов админки

### 2.1. Список новостей (Таблица управления)
- **Колонки:**
  - Обложка (миниатюра 64x64px)
  - Заголовок новости + Slug
  - Рубрика (цветной бейдж)
  - Статус: `Опубликовано` (зеленый), `Черновик` (серый), `Архив` (желтый)
  - Автор публикации
  - Дата публикации / создания
  - Действия: «Редактировать», «Опубликовать/Снять», «Удалить»
- **Панель фильтров:**
  - Поиск по названию
  - Фильтр по рубрикам
  - Фильтр по статусу (`draft`, `published`)
  - Кнопка: **«+ Написать новость»** (акцентная)

### 2.2. Форма создания / редактирования новости (Article Editor)
1. **Заголовок новости (H1 input)**: валидация 10–180 символов, автоматическая транслитерация в `slug` (например, «День знаний» -> `den-znanij-2026`).
2. **Рубрика**: выпадающий список из `news_categories`.
3. **Лид / Краткое содержание (Lead Text)**: 1–2 предложения для карточки и поисковиков (до 250 символов).
4. **Обложка (Cover Image)**: Drag-and-drop зона загрузки в бакет `news-media` с предпросмотром.
5. **Тело статьи**:
   - Форматированный WYSIWYG / Markdown редактор.
   - Поддержка заголовков (H2, H3), списков, цитат директора, таблиц.
   - Загрузка дополнительных изображений внутрь текста.
   - Прикрепление документов (PDF приказы, скан лицензий) со статусом ЭЦП.
6. **Настройки публикации**:
   - Чекбокс: `Закрепить на главной (Featured Hero)`
   - Дата и время публикации (с поддержкой отложенной публикации).
   - Расчетное время чтения (минуты).
   - Кнопки: «Сохранить черновик», «Предпросмотр», «Опубликовать».

---

## 3. Защита маршрутов (Route Guard Pattern)

Каждый запрос к админке обязан проходить проверку сессии и роли:

```javascript
import { supabase } from './supabaseClient.js';

export async function protectAdminRoute() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    window.location.href = '/login?redirect=/admin';
    return false;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const allowedRoles = ['admin', 'super_admin', 'editor'];
  if (!profile || !allowedRoles.includes(profile.role)) {
    alert('У вас нет прав для доступа в панель управления.');
    window.location.href = '/';
    return false;
  }

  return true;
}
```

---

## 4. Паттерн отправки новости (Publish Pipeline)

```javascript
import { supabase } from './supabaseClient.js';

export async function saveNewsArticle({ id, title, slug, categoryId, leadText, contentHtml, coverFile, status = 'published', isFeatured = false }) {
  let coverImageUrl = null;

  // 1. Если загружен новый файл обложки
  if (coverFile) {
    const fileExt = coverFile.name.split('.').pop();
    const filePath = `covers/${slug}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('news-media')
      .upload(filePath, coverFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('news-media').getPublicUrl(filePath);
    coverImageUrl = data.publicUrl;
  }

  // 2. Расчет времени чтения (примерно 180 слов в минуту)
  const wordCount = contentHtml.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 180));

  // 3. Сохранение в PostgreSQL
  const payload = {
    title,
    slug,
    category_id: categoryId,
    lead_text: leadText,
    content_html: contentHtml,
    reading_time_min: readingTimeMin,
    status,
    is_featured: isFeatured,
    published_at: status === 'published' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  };

  if (coverImageUrl) payload.cover_image_url = coverImageUrl;

  let query;
  if (id) {
    query = supabase.from('news').update(payload).eq('id', id);
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    payload.author_id = user.id;
    query = supabase.from('news').insert([payload]);
  }

  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}
```

---

## 5. Чек-лист безопасности и модерации
- [ ] Обычный студент или гость при переходе в `/admin` перенаправляется на главную или страницу логина.
- [ ] RLS в базе данных блокирует `INSERT` и `UPDATE` в таблицу `news`, даже если злоумышленник отправит прямой запрос через REST API без токена администратора.
- [ ] XSS-санитизация HTML-кода статьи перед выводом (`DOMPurify` или серверный рендеринг).
