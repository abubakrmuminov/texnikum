# Requirements: vocational education institution (Texnikum) website (Republic of Uzbekistan)

## Public site
1. Home: latest news in a bento grid above the fold, upcoming events, quick links for applicants, specialties block.
2. News: list with categories, filters, pagination, search; single news page with inline media and editorial absence notice.
3. Teachers: cards (photo, name, position, subjects, qualification), teacher page, filter by department/subject.
4. Specialties and admissions: programs (National Classifier), duration, state grant / paid-contract places, passing scores, admissions funnel via my.edu.uz.
5. Administration & Leadership: leadership staff, department heads, office reception hours, duties, and contacts according to Law on Appeals.
6. Events calendar with date badges.
7. About / Educational organization information: 12 mandatory sections according to Article 37 of Law of RUz No. ZRU-637 "On Education" and Decree UP-158 (/info routes, with backwards-compatible redirect from /sveden).
8. Contacts and map (OpenStreetMap).
9. Settings (for all visitors): theme switch (light / dark / high-contrast), font size, spacing, disable images, accessible low-vision mode (Law of RUz No. ZRU-641 & WCAG 2.1 AA), text-to-speech (TTS). Saved in localStorage, applied without reload.
10. Language switcher: Uzbek (Latin) as primary default locale (`uz`), Russian as secondary locale (`ru`).
11. Public accessibility hint: non-blocking dismissible reminder about low-vision tools and TTS, persisted in localStorage.

## Admin panel (/admin)
- Email/password login via Supabase Auth. Route Guards on the frontend, Guards in NestJS.
- Roles: admin, editor, moderator. Permissions enforced in the API and via RLS.
- News: create, edit, drafts, scheduled publishing, moderation, categories, cover image, drag-and-drop file/image upload to Storage, WYSIWYG editor with inline photos.
- Manage teachers, administration, specialties, events, contacts, "About / Info" pages (Article 37).
- Users and roles (admin only). Audit log (who changed what, diff snapshots, JSON export).
- **Onboarding wizard**:
  - Two surfaces, one persisted DB state (`profiles.onboarding` JSONB):
    1. Welcome tour modal on first login with role-aware sections, progress bar, step instructions matching real UI labels, keyboard navigation (Esc, Left/Right), focus trap, and visible "Skip" (persisted) vs "Later" (session-only).
    2. Non-blocking per-section prompt card (`aria-live="polite"`) appearing on unseen modules with "Show me" / "Skip" / "Later".
  - Admin re-arm capability: `POST /api/v1/users/:id/onboarding/reset` to reset onboarding state for any user, with full audit trail logging.
  - "Take the tour again" link in sidebar and mobile header.

## Database (PostgreSQL)
Tables: profiles, roles, news, news_categories, teachers, departments, specialties, events, schedule, pages, media, audit_log.
RLS on every table; public can read only published content. Indexes for frequent queries. Migrations in repo (`20260929000001` through `20260930000007_admin_onboarding.sql`). Demo seed data for Fergana Technicum No 2.

## Non-functional
- WCAG 2.1 AA, Law of RUz No. ZRU-641 on Rights of Persons with Disabilities, semantic HTML, keyboard navigation, aria, contrast.
- Mobile-first, SEO (metadata, sitemap, Open Graph), image optimization.
- Security & Privacy: Law of RUz No. ZRU-547 on Personal Data, input validation, rate limiting, CORS, upload checks (type and size).
- Currency: Uzbek Soum (UZS). Institution Type: Texnikum.
