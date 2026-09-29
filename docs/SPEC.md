# Requirements: vocational education institution (Texnikum) website (Republic of Uzbekistan)

## Public site
1. Home: latest news in a bento grid above the fold, upcoming events, quick links for applicants, specialties block.
2. News: list with categories, filters, pagination, search; single news page.
3. Teachers: cards (photo, name, position, subjects, qualification), teacher page, filter by department/subject.
4. Specialties and admissions: programs (National Classifier), duration, state grant / paid-contract places, passing scores, admissions funnel via my.edu.uz.
5. Schedule: accessible format, filter by group and teacher.
6. Events calendar with date badges.
7. About / Educational organization information: 12 mandatory sections according to Article 37 of Law of RUz No. ZRU-637 "On Education" and Decree UP-158 (/info routes, with backwards-compatible redirect from /sveden).
8. Contacts and map (OpenStreetMap).
9. Settings (for all visitors): theme switch (light / dark / high-contrast), font size, spacing, disable images, accessible low-vision mode (Law of RUz No. ZRU-641 & WCAG 2.1 AA), text-to-speech (TTS). Saved in localStorage, applied without reload.
10. Language switcher: Uzbek (Latin) as primary default locale (`uz`), Russian as secondary locale (`ru`).

## Admin panel (/admin)
- Email/password login via Supabase Auth. Route Guards on the frontend, Guards in NestJS.
- Roles: admin, editor, moderator. Permissions enforced in the API and via RLS.
- News: create, edit, drafts, scheduled publishing, moderation, categories, cover image, file/image upload to Storage, WYSIWYG editor.
- Manage teachers, specialties, events, schedule, "About / Info" pages (Article 37).
- Users and roles (admin only). Audit log (who changed what).

## Database (PostgreSQL)
Tables: profiles, roles, news, news_categories, teachers, departments, specialties, events, schedule, pages, media, audit_log.
RLS on every table; public can read only published content. Indexes for frequent queries. Migrations in the repo (`20260929000005_uzbekistan_adaptation.sql`). Demo seed data for Fergana Technicum No 2.

## Non-functional
- WCAG 2.1 AA, Law of RUz No. ZRU-641 on Rights of Persons with Disabilities, semantic HTML, keyboard navigation, aria, contrast.
- Mobile-first, SEO (metadata, sitemap, Open Graph), image optimization.
- Security & Privacy: Law of RUz No. ZRU-547 on Personal Data, input validation, rate limiting, CORS, upload checks (type and size).
- Currency: Uzbek Soum (UZS). Institution Type: Texnikum.
