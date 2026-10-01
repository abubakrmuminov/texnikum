-- =============================================================================
-- ДЕМО-ДАННЫЕ: Ферганский техникум № 2 (для тестирования и локальной разработки)
-- Использование: psql -f supabase/seed_demo_institution.sql или через seed-скрипт
-- =============================================================================

UPDATE public.institution_settings
SET
  name_uz = 'Fargʻona viloyati Fargʻona shahri 2-son texnikumi',
  name_ru = 'Ферганский техникум № 2',
  short_name_uz = '2-son texnikum',
  short_name_ru = 'Техникум № 2',
  institution_type = 'texnikum',
  legal_address_uz = '150100, Oʻzbekiston Respublikasi, Fargʻona viloyati, Fargʻona shahri, Al-Fargʻoniy koʻchasi, 42-uy',
  legal_address_ru = '150100, Республика Узбекистан, Ферганская область, г. Фергана, ул. Аль-Фергани, д. 42',
  main_phone = '+998 (73) 244-00-00',
  admission_phone = '+998 (73) 244-00-00',
  trust_phone = '1006',
  contact_email = 'info@texnikum2.uz',
  admission_email = 'priem@texnikum2.uz',
  website_domain = 'texnikum2.uz',
  geo_latitude = 40.386400,
  geo_longitude = 71.786400,
  logo_url = '/images/gerb.webp',
  favicon_url = '/favicon.ico',
  coat_of_arms_url = '/images/gerb.webp',
  brand_primary_color = '#1e3a8a',
  social_telegram = 'https://t.me/fargona_texnikum2',
  social_instagram = 'https://instagram.com/fargona_texnikum2',
  social_facebook = 'https://facebook.com/fargona_texnikum2',
  social_youtube = 'https://youtube.com/@fargona_texnikum2',
  stir_inn = '302987654',
  work_hours_uz = 'Dushanba – Shanba: 08:30 – 17:30',
  work_hours_ru = 'Понедельник – Суббота: 08:30 – 17:30',
  is_configured = true,
  setup_completed_at = timezone('utc'::text, now()),
  updated_at = timezone('utc'::text, now())
WHERE id = 1;

UPDATE public.institution_private
SET
  bank_name = 'Oʻzmilliybank Fargʻona viloyati boshqarmasi',
  bank_account = '23402000300100001010',
  mfo_code = '00014',
  jshshir_pinfl = '31205851234567',
  treasury_account = '400110860262667950100075001',
  oked_code = '85320',
  director_name_uz = 'Karimov Jasur Alisherovich',
  director_name_ru = 'Каримов Жасур Алишерович',
  director_phone = '+998 (73) 244-00-01',
  updated_at = timezone('utc'::text, now())
WHERE id = 1;
