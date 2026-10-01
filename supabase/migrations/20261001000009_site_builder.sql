-- =============================================================================
-- МИГРАЦИЯ 20261001000009: СИСТЕМА КОНСТРУКТОРА САЙТА И ДИНАМИЧЕСКОЙ НАВИГАЦИИ
-- Phase S1: Navigation items, Page blocks, Page revisions, Redirects & Themes
-- =============================================================================

-- 1. ТАБЛИЦА ПУНКТОВ НАВИГАЦИИ (navigation_items)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NULL REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  location VARCHAR(50) NOT NULL DEFAULT 'header', -- 'header', 'footer_regulatory', 'footer_students', 'footer_custom'
  label_uz VARCHAR(255) NOT NULL,
  label_ru VARCHAR(255) NOT NULL,
  target_type VARCHAR(50) NOT NULL DEFAULT 'internal_page', -- 'internal_page', 'module', 'custom_url'
  path VARCHAR(255) NOT NULL,
  page_id UUID NULL REFERENCES public.pages(id) ON DELETE SET NULL,
  icon_name VARCHAR(50) NULL,
  badge_text_uz VARCHAR(50) NULL,
  badge_text_ru VARCHAR(50) NULL,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_required BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_nav_location_sort ON public.navigation_items(location, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_nav_parent_id ON public.navigation_items(parent_id);

-- 2. РАСШИРЕНИЕ СУЩЕСТВУЮЩЕЙ ТАБЛИЦЫ СТРАНИЦ (pages)
-- -----------------------------------------------------------------------------
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS title_uz VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS title_ru VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS page_type VARCHAR(50) NOT NULL DEFAULT 'custom', -- 'statutory', 'custom', 'module_landing'
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Заполняем двуязычные заголовки из существующего поля title, если они не были заданы
UPDATE public.pages SET title_uz = title WHERE title_uz IS NULL;
UPDATE public.pages SET title_ru = title WHERE title_ru IS NULL;

-- Для уставных разделов (ст. 37 ЗРУ-637) устанавливаем флаги защиты
UPDATE public.pages
SET
  is_system = true,
  is_required = true,
  page_type = 'statutory'
WHERE slug LIKE 'info-%' OR slug LIKE 'sveden-%';

-- 3. ТАБЛИЦА ИСТОРИИ РЕВИЗИЙ СТРАНИЦ (page_revisions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  author_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(255) NULL,
  change_summary VARCHAR(255) NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_page_revisions_page_date ON public.page_revisions(page_id, created_at DESC);

-- 4. ТАБЛИЦА АВТОМАТИЧЕСКИХ 301-РЕДИРЕКТОВ (page_slug_redirects)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.page_slug_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_slug VARCHAR(150) NOT NULL UNIQUE,
  new_slug VARCHAR(150) NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_slug_redirects_old ON public.page_slug_redirects(old_slug);

-- 5. ТАБЛИЦА ТЕМ И ДИЗАЙН-ПРЕСЕТОВ САЙТА (theme_settings)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  preset VARCHAR(50) NOT NULL DEFAULT 'classic_academic',
  font_family VARCHAR(50) NOT NULL DEFAULT 'inter',
  border_radius_mode VARCHAR(20) NOT NULL DEFAULT 'rounded',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.theme_settings (id, preset, font_family, border_radius_mode)
VALUES (1, 'classic_academic', 'inter', 'rounded')
ON CONFLICT (id) DO NOTHING;

-- 6. НАСТРОЙКА ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_slug_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- 6.1. navigation_items
DROP POLICY IF EXISTS "Public can view active navigation items" ON public.navigation_items;
CREATE POLICY "Public can view active navigation items"
  ON public.navigation_items FOR SELECT
  USING (is_visible = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admins can manage navigation items" ON public.navigation_items;
CREATE POLICY "Admins can manage navigation items"
  ON public.navigation_items FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6.2. page_revisions
DROP POLICY IF EXISTS "Editors and Admins can view page revisions" ON public.page_revisions;
CREATE POLICY "Editors and Admins can view page revisions"
  ON public.page_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id IN (
        SELECT id FROM public.roles WHERE name IN ('admin', 'editor')
      )
    )
  );

DROP POLICY IF EXISTS "Admins and Editors can insert page revisions" ON public.page_revisions;
CREATE POLICY "Admins and Editors can insert page revisions"
  ON public.page_revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id IN (
        SELECT id FROM public.roles WHERE name IN ('admin', 'editor')
      )
    )
  );

-- 6.3. page_slug_redirects
DROP POLICY IF EXISTS "Public can view redirects" ON public.page_slug_redirects;
CREATE POLICY "Public can view redirects"
  ON public.page_slug_redirects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage redirects" ON public.page_slug_redirects;
CREATE POLICY "Admins can manage redirects"
  ON public.page_slug_redirects FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6.4. theme_settings
DROP POLICY IF EXISTS "Public can view theme settings" ON public.theme_settings;
CREATE POLICY "Public can view theme settings"
  ON public.theme_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update theme settings" ON public.theme_settings;
CREATE POLICY "Admins can update theme settings"
  ON public.theme_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 7. ЗАПОЛНЕНИЕ БАЗОВОЙ СИСТЕМНОЙ НАВИГАЦИИ (Factory Default System Structure)
-- Без демо-данных конкретного техникума, со строгой привязкой к ст. 37 ЗРУ-637
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_info_id UUID;
  v_specialties_id UUID;
  v_news_id UUID;
BEGIN
  -- Очищаем системные пункты, если таблица пуста
  IF NOT EXISTS (SELECT 1 FROM public.navigation_items LIMIT 1) THEN

    -- Пункт 1: Главная
    INSERT INTO public.navigation_items (
      id, location, label_uz, label_ru, target_type, path, icon_name, is_visible, sort_order, is_system, is_required
    ) VALUES (
      '00000000-0000-0000-0001-000000000001',
      'header',
      'Bosh sahifa',
      'Главная',
      'module',
      '/',
      'BookOpen',
      true,
      10,
      true,
      false
    );

    -- Пункт 2: О техникуме (Родительский пункт выпадающего меню обязательных сведений)
    v_info_id := '00000000-0000-0000-0001-000000000002';
    INSERT INTO public.navigation_items (
      id, location, label_uz, label_ru, target_type, path, icon_name, is_visible, sort_order, is_system, is_required
    ) VALUES (
      v_info_id,
      'header',
      'Texnikum haqida',
      'О техникуме',
      'module',
      '/info',
      'Info',
      true,
      20,
      true,
      true
    );

    -- Дочерние пункты раздела «Texnikum haqida» (ст. 37 ЗРУ-637)
    INSERT INTO public.navigation_items (
      parent_id, location, label_uz, label_ru, target_type, path, is_visible, sort_order, is_system, is_required
    ) VALUES
      (v_info_id, 'header', 'Asosiy maʼlumotlar', 'Основные сведения', 'internal_page', '/info/info-common', true, 10, true, true),
      (v_info_id, 'header', 'Tuzilma va boshqaruv', 'Структура и органы управления', 'internal_page', '/info/info-struct', true, 20, true, true),
      (v_info_id, 'header', 'Meʼyoriy hujjatlar', 'Документы и лицензии', 'internal_page', '/info/info-documents', true, 30, true, true),
      (v_info_id, 'header', 'Moddiy-texnik taʼminot', 'Материально-техническая база', 'internal_page', '/info/info-material', true, 40, true, true),
      (v_info_id, 'header', 'Moliyaviy faoliyat', 'Финансовая деятельность', 'internal_page', '/info/info-financial', true, 50, true, true),
      (v_info_id, 'header', 'Xalqaro hamkorlik', 'Международное сотрудничество', 'internal_page', '/info/info-international', true, 60, true, true),
      (v_info_id, 'header', 'Barcha 12 boʻlim (37-modda)', 'Все 12 обязательных разделов', 'module', '/info', true, 70, true, true);

    -- Пункт 3: Специальности
    v_specialties_id := '00000000-0000-0000-0001-000000000003';
    INSERT INTO public.navigation_items (
      id, location, label_uz, label_ru, target_type, path, icon_name, is_visible, sort_order, is_system, is_required
    ) VALUES (
      v_specialties_id,
      'header',
      'Taʼlim yoʻnalishlari',
      'Специальности',
      'module',
      '/specialties',
      'GraduationCap',
      true,
      30,
      true,
      false
    );

    INSERT INTO public.navigation_items (
      parent_id, location, label_uz, label_ru, target_type, path, open_in_new_tab, is_visible, sort_order, is_system, is_required
    ) VALUES
      (v_specialties_id, 'header', 'Barcha mutaxassisliklar', 'Все специальности', 'module', '/specialties', false, true, 10, true, false),
      (v_specialties_id, 'header', '9-sinf negizida', 'На базе 9 классов', 'module', '/specialties?type=9', false, true, 20, true, false),
      (v_specialties_id, 'header', '11-sinf negizida', 'На базе 11 классов', 'module', '/specialties?type=11', false, true, 30, true, false),
      (v_specialties_id, 'header', 'my.edu.uz orqali qabul', 'Прием через my.edu.uz', 'custom_url', 'https://my.edu.uz', true, true, 40, true, false);

    -- Пункт 4: Руководство и администрация
    INSERT INTO public.navigation_items (
      id, location, label_uz, label_ru, target_type, path, icon_name, is_visible, sort_order, is_system, is_required
    ) VALUES (
      '00000000-0000-0000-0001-000000000004',
      'header',
      'Rahbariyat va maʼmuriyat',
      'Руководство и администрация',
      'module',
      '/administration',
      'Users',
      true,
      40,
      true,
      true
    );

    -- Пункт 5: Преподаватели
    INSERT INTO public.navigation_items (
      id, location, label_uz, label_ru, target_type, path, icon_name, is_visible, sort_order, is_system, is_required
    ) VALUES (
      '00000000-0000-0000-0001-000000000005',
      'header',
      'Oʻqituvchilar',
      'Преподаватели',
      'module',
      '/teachers',
      'Users',
      true,
      50,
      true,
      false
    );

    -- Пункт 6: Новости и события
    v_news_id := '00000000-0000-0000-0001-000000000006';
    INSERT INTO public.navigation_items (
      id, location, label_uz, label_ru, target_type, path, icon_name, is_visible, sort_order, is_system, is_required
    ) VALUES (
      v_news_id,
      'header',
      'Yangiliklar',
      'Новости',
      'module',
      '/news',
      'Newspaper',
      true,
      60,
      true,
      false
    );

    INSERT INTO public.navigation_items (
      parent_id, location, label_uz, label_ru, target_type, path, is_visible, sort_order, is_system, is_required
    ) VALUES
      (v_news_id, 'header', 'Barcha yangiliklar', 'Все новости', 'module', '/news', true, 10, true, false),
      (v_news_id, 'header', 'Muhim xabarlar', 'Важные объявления', 'module', '/news?featured=true', true, 20, true, false),
      (v_news_id, 'header', 'Tadbirlar taqvimi', 'Календарь мероприятий', 'module', '/events', true, 30, true, false);

    -- Пункт 7: Контакты
    INSERT INTO public.navigation_items (
      id, location, label_uz, label_ru, target_type, path, icon_name, is_visible, sort_order, is_system, is_required
    ) VALUES (
      '00000000-0000-0000-0001-000000000007',
      'header',
      'Bogʻlanish va aloqa',
      'Контакты',
      'module',
      '/contacts',
      'Phone',
      true,
      70,
      true,
      true
    );

    -- Пункты подвала: Обязательные уставные ссылки (footer_regulatory)
    INSERT INTO public.navigation_items (
      location, label_uz, label_ru, target_type, path, is_visible, sort_order, is_system, is_required
    ) VALUES
      ('footer_regulatory', 'Umumiy maʼlumotlar (37-modda)', 'Общие сведения (ст. 37)', 'internal_page', '/info/info-common', true, 10, true, true),
      ('footer_regulatory', 'Tuzilma va boshqaruv organlari', 'Структура и органы управления', 'internal_page', '/info/info-struct', true, 20, true, true),
      ('footer_regulatory', 'Rasmiy hujjatlar va litsenziyalar', 'Документы и лицензии', 'internal_page', '/info/info-documents', true, 30, true, true),
      ('footer_regulatory', 'Inklyuziv taʼlim va qulay muhit (OʻRQ-641)', 'Доступная среда (ЗРУ-641)', 'internal_page', '/info/info-environment', true, 40, true, true),
      ('footer_regulatory', 'Texnikum maʼmuriyati va rahbariyat', 'Руководство техникума', 'module', '/administration', true, 50, true, true);

    -- Пункты подвала: Студентам и абитуриентам (footer_students)
    INSERT INTO public.navigation_items (
      location, label_uz, label_ru, target_type, path, is_visible, sort_order, is_system, is_required
    ) VALUES
      ('footer_students', 'Mutaxassisliklar va davlat grantlari', 'Специальности и гранты', 'module', '/specialties', true, 10, true, false),
      ('footer_students', 'Ochiq eshiklar kuni va tadbirlar', 'Мероприятия и дни открытых дверей', 'module', '/events', true, 20, true, false),
      ('footer_students', 'Pedagogik tarkib', 'Педагогический состав', 'module', '/teachers', true, 30, true, false),
      ('footer_students', 'Yangiliklar va eʼlonlar', 'Новости и объявления', 'module', '/news', true, 40, true, false),
      ('footer_students', 'Maxsus imkoniyatlar (WCAG 2.1 AA)', 'Версия для слабовидящих', 'module', '/settings', true, 50, true, false);

  END IF;
END $$;
