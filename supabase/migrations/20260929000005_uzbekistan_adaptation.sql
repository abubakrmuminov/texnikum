-- =============================================================================
-- Migration 000005: Адаптация под законодательство Республики Узбекистан (РУз)
-- Спецификация: docs/UZ_COMPLIANCE.md
-- Закон РУз «Об образовании» № ЗРУ-637 (ст. 10, ст. 37)
-- Указ Президента РУз № УП-158 от 16.10.2024 (Сеть Техникумов)
-- Закон РУз «О персональных данных» № ЗРУ-547
-- =============================================================================

-- 1. Обновление ограничений таблицы pages для поддержки раздела 'info' (ст. 37 ЗРУ-637)
ALTER TABLE public.pages DROP CONSTRAINT IF EXISTS pages_section_check;
ALTER TABLE public.pages ADD CONSTRAINT pages_section_check 
  CHECK (section IN ('info', 'sveden', 'about', 'applicants', 'students', 'general'));

-- 2. Перевод существующих страниц из 'sveden' в 'info'
UPDATE public.pages 
SET section = 'info' 
WHERE section = 'sveden';

-- 3. Актуализация комментариев к таблицам
COMMENT ON TABLE public.pages IS 'Oʻzbekiston Respublikasi «Taʼlim toʻgʻrisida»gi Qonunining 37-moddasi boʻyicha majburiy maʼlumotlar va muassasa sahifalari';
COMMENT ON TABLE public.specialties IS 'Texnikum kasb va mutaxassisliklari (MSKO / ISCED, davlat granti va toʻlov-kontrakt)';
COMMENT ON TABLE public.news IS 'Texnikum yangiliklari, eʼlonlar va rasmiy buyruqlar';

-- 4. Обновление или добавление 12 обязательных разделов согласно статье 37 Закона РУз «Об образовании»
INSERT INTO public.pages (id, title, slug, section, content_html, meta_title, meta_description, is_published, order_index)
VALUES 
(
  '40000000-0000-0000-0000-000000000001',
  'Asosiy maʼlumotlar (Основные сведения)',
  'info-common',
  'info',
  '<h2>Fargʻona 2-son axborot texnologiyalari texnikumi haqida asosiy maʼlumotlar</h2><p><strong>Toʻliq rasmiy nomi:</strong> Fargʻona viloyati Fargʻona shahri 2-son texnikumi (Fargʻona 2-son axborot texnologiyalari texnikumi).</p><p><strong>Tashkil etilgan yili:</strong> 1978-yil.</p><p><strong>Muassis:</strong> Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligi.</p><p><strong>Yuridik manzili:</strong> 150100, Oʻzbekiston Respublikasi, Fargʻona viloyati, Fargʻona shahri, Al-Fargʻoniy koʻchasi, 42-uy.</p><p><strong>Ish tartibi:</strong> Dushanba – Shanba: 08:30 – 17:30.</p><p><strong>Aloqa telefoni:</strong> +998 (73) 244-00-00, Ishonch telefoni: 1006.</p><p><strong>Elektron pochta:</strong> info@fargona-texnikum2.uz</p>',
  'Asosiy maʼlumotlar — Fargʻona 2-son texnikumi',
  'Fargʻona 2-son texnikumi haqida rasmiy maʼlumotlar, tashkil topgan yili, muassisi va manzili',
  true,
  1
),
(
  '40000000-0000-0000-0000-000000000002',
  'Tuzilma va boshqaruv organlari (Структура и органы управления)',
  'info-struct',
  'info',
  '<h2>Texnikum tuzilmasi va boshqaruv organlari</h2><p>Texnikum boshqaruvi Oʻzbekiston Respublikasining «Taʼlim toʻgʻrisida»gi Qonuni, Oʻzbekiston Respublikasi Prezidentining 2024-yil 16-oktabrdagi PF-158-son Farmoni hamda Texnikum Ustavi asosida amalga oshiriladi.</p><h3>Boshqaruv organlari:</h3><ul><li>Direktor va direktor oʻrinbosarlari;</li><li>Pedagogik kengash;</li><li>Oʻquv-metodik kengash;</li><li>Kasaba uyushmasi qoʻmitasi va Yoshlar ittifoqi boshlangʻich tashkiloti.</li></ul>',
  'Tuzilma va boshqaruv organlari',
  'Fargʻona 2-son texnikumi tuzilmasi, boʻlimlar va maʼmuriyat',
  true,
  2
),
(
  '40000000-0000-0000-0000-000000000003',
  'Ustav va meʼyoriy hujjatlar (Устав и нормативные документы)',
  'info-document',
  'info',
  '<h2>Texnikumning taʼsis va huquqiy hujjatlari</h2><ul><li>Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligi tomonidan tasdiqlangan Texnikum Ustavi;</li><li>Davlat roʻyxatidan oʻtkazilganligi toʻgʻrisidagi guvohnoma (STIR: 302987654);</li><li>Taʼlim faoliyatini amalga oshirish uchun Davlat akkreditatsiyasi sertifikati;</li><li>Ichki mehnat va oʻqish tartibi qoidalari;</li><li>Jamoa shartnomasi va uning ijrosi.</li></ul>',
  'Ustav va meʼyoriy hujjatlar',
  'Texnikum ustavi, guvohnomasi va huquqiy hujjatlari',
  true,
  3
),
(
  '40000000-0000-0000-0000-000000000004',
  'Taʼlim tillari (Языки обучения)',
  'info-languages',
  'info',
  '<h2>Taʼlim berish tillari haqida maʼlumot</h2><p>Oʻzbekiston Respublikasining «Davlat tili haqida»gi Qonuni (356-I-son) hamda «Taʼlim toʻgʻrisida»gi Qonunining 33-moddasiga muvofiq Fargʻona 2-son texnikumida oʻquv mashgʻulotlari quyidagi tillarda olib boriladi:</p><ul><li><strong>Oʻzbek tili (davlat tili)</strong> — barcha mutaxassisliklar va kasblar boʻyicha;</li><li><strong>Rus tili</strong> — tanlangan ixtisoslashtirilgan guruhlarda.</li></ul>',
  'Taʼlim tillari — Fargʻona 2-son texnikumi',
  'Taʼlim jarayonida qoʻllaniladigan davlat va boshqa tillar',
  true,
  4
),
(
  '40000000-0000-0000-0000-000000000005',
  'Taʼlim dasturlari va standartlari (Образовательные программы и стандарты)',
  'info-education',
  'info',
  '<h2>Davlat taʼlim standartlari va oʻquv rejalari</h2><p>Oʻquv jarayoni Xalqaro standart taʼlim tasniflagichi (MSKO / ISCED) va Oʻzbekiston Respublikasi Milliy malaka ramkasi asosida ishlab chiqilgan kasbiy taʼlim dasturlari boʻyicha tashkil etilgan.</p><p>Kredit-modul tizimi (ECTS) joriy etilgan boʻlib, oʻquvchilar tomonidan toʻplangan kreditlar va GPA koʻrsatkichlari asosida oliy taʼlim muassasalarining mos bakalavriat bosqichlarida oʻqishni davom ettirish imkoniyati yaratilgan.</p>',
  'Taʼlim dasturlari va standartlari',
  'Davlat taʼlim standartlari, malaka talablari va oʻquv rejalari',
  true,
  5
),
(
  '40000000-0000-0000-0000-000000000006',
  'Pedagogik tarkib (Педагогический состав)',
  'info-teachers',
  'info',
  '<h2>Oʻqituvchilar va pedagogik tarkib haqida maʼlumot</h2><p>Texnikumda 65 nafar yuqori malakali pedagog faoliyat yuritadi. Ulardan 18 nafari oliy toifali oʻqituvchi, 4 nafari fan nomzodi va falsafa doktori (PhD), 8 nafari «Oʻrta maxsus va kasb-hunar taʼlimi aʼlochisi» koʻkrak nishoni sohiblaridir.</p>',
  'Pedagogik tarkib va oʻqituvchilar salohiyati',
  'Fargʻona 2-son texnikumi oʻqituvchilari maʼlumoti, toifasi va ilmiy salohiyati',
  true,
  6
),
(
  '40000000-0000-0000-0000-000000000007',
  'Moddiy-texnik taʼminot (Материально-техническое обеспечение)',
  'info-mto',
  'info',
  '<h2>Moddiy-texnik baza va oʻquv jihozlari</h2><ul><li>32 ta zamonaviy multimedia oʻquv auditoriyalari;</li><li>8 ta zamonaviy kompyuter laboratoriyasi (har birida 20 tadan soʻnggi rusumdagi kompyuter);</li><li>Optik tolali yuqori tezlikdagi Internet tarmogʻi (100 Mbit/s);</li><li>Axborot-resurs markazi (ARM) va 25 000 dan ortiq nusxadagi elektron kutubxona fondi;</li><li>Sport zali, mini-futbol maydoni va 150 oʻrinli oshxona.</li></ul>',
  'Moddiy-texnik taʼminot',
  'Texnikum oʻquv binolari, laboratoriyalari va kutubxona fondi',
  true,
  7
),
(
  '40000000-0000-0000-0000-000000000008',
  'Talabalar turar joyi (Общежитие и условия проживания)',
  'info-dormitory',
  'info',
  '<h2>Talabalar turar joyi (yotoqxona)</h2><p>Texnikum tasarrufida uzoq tumanlardan kelgan oʻquvchilar uchun 200 oʻrinli zamonaviy talabalar turar joyi mavjud.</p><ul><li>Xonalar 2 va 3 kishiga moʻljallangan;</li><li>Yotoqxonada Wi-Fi zonasi, dars tayyorlash xonalari, maʼnaviyat xonasi, kir yuvish va oshxona mavjud;</li><li>Yashash toʻlovi: oyiga 120 000 soʻm (kam taʼminlangan va boquvchisini yoʻqotgan oʻquvchilar bepul yashaydi).</li></ul>',
  'Talabalar turar joyi — Yotoqxona',
  'Oʻquvchilar yotoqxonasi oʻrinlari, sharoitlari va toʻlov miqdori',
  true,
  8
),
(
  '40000000-0000-0000-0000-000000000009',
  'Stipendiyalar va ijtimoiy yordam (Стипендии и социальная помощь)',
  'info-scholarships',
  'info',
  '<h2>Stipendiyalar tayinlash va ijtimoiy himoya choralari</h2><p>Davlat granti asosida taʼlim olayotgan oʻquvchilarga Oʻzbekiston Respublikasi Vazirlar Mahkamasi tomonidan belgilangan tartib va miqdorlarda oylik stipendiyalar toʻlanadi.</p><p>Yetim bolalar, ota-ona qaramogʻidan mahrum boʻlganlar hamda «Ijtimoiy himoya yagona reyestri»ga kiritilgan oilalar farzandlariga bepul darsliklar, kiyim-kechak va bir martalik moddiy yordamlar ajratiladi.</p>',
  'Stipendiyalar va ijtimoiy qoʻllab-quvvatlash',
  'Oʻquvchilar stipendiyasi, ijtimoiy yordam va imtiyozlar',
  true,
  9
),
(
  '40000000-0000-0000-0000-000000000010',
  'Reyting va sifat monitoringi (Рейтинг и мониторинг качества)',
  'info-rating',
  'info',
  '<h2>Texnikum reytingi va taʼlim sifati</h2><p>Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligi tomonidan oʻtkazilgan kasb-hunar taʼlimi muassasalari milliy reytingida Fargʻona 2-son texnikumi viloyat boʻyicha yetakchi TOP-3 oʻrindan joy olgan.</p><p>Bitiruvchilarning bandlik darajasi 94% ni tashkil etadi.</p>',
  'Texnikum reytingi va monitoring natijalari',
  'Taʼlim sifati monitoringi, reyting koʻrsatkichlari va bandlik',
  true,
  10
),
(
  '40000000-0000-0000-0000-000000000011',
  'Ilmiy va innovatsion faoliyat (Научная и инновационная деятельность)',
  'info-research',
  'info',
  '<h2>Ilmiy tadqiqotlar va innovatsion loyihalar</h2><p>Texnikumda «Yosh dasturchilar» inkubatsiya markazi va robototexnika toʻgaragi faoliyat koʻrsatmoqda. Hududdagi sanoat korxonalari va IT-park Fargʻona filiali bilan hamkorlikda dual taʼlim va amaliy loyihalar yoʻlga qoʻyilgan.</p>',
  'Ilmiy va innovatsion faoliyat',
  'Amaliy ishlanmalar, innovatsion loyihalar va korxona hamkorliklari',
  true,
  11
),
(
  '40000000-0000-0000-0000-000000000012',
  'Qabul komissiyasi va boʻsh oʻrinlar (Приемная комиссия и вакантные места)',
  'info-admission',
  'info',
  '<h2>Qabul komissiyasi va oʻqishga qabul qilish tartibi</h2><p>Hujjatlar Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligining yagona elektron portali — <strong>my.edu.uz</strong> orqali qabul qilinadi.</p><p>Oʻqishga qabul umumiy oʻrta taʼlim (9 va 11-sinf) shahodatnomasi baholari hamda Bilim va malakalarni baholash agentligi (uzbmb.uz) test sinovlari asosida amalga oshiriladi.</p><p>Davlat granti va toʻlov-kontrakt asosida qabul kvotalari har yili tasdiqlanadi.</p>',
  'Qabul komissiyasi — my.edu.uz orqali qabul',
  'Qabul qoidalari, kvotalar, kerakli hujjatlar va boʻsh oʻrinlar',
  true,
  12
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  section = EXCLUDED.section,
  content_html = EXCLUDED.content_html,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  order_index = EXCLUDED.order_index,
  updated_at = now();

-- 5. Обновление направлений подготовки (специальностей) под классификатор РУз и валюту UZS
UPDATE public.specialties 
SET 
  cost_per_year = 9500000,
  duration_text = CASE 
    WHEN base_education = '9_classes' THEN '3 yil (9-sinf negizida)'
    ELSE '2 yil (11-sinf negizida)'
  END
WHERE cost_per_year IS NOT NULL;
