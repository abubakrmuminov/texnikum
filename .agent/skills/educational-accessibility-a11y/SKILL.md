---
name: educational-accessibility-a11y
description: Comprehensive accessibility (a11y), WCAG 2.1/2.2 AA, and ГОСТ Р 52872-2019 compliance skill for educational, college, and governmental web portals. Includes visually impaired toolbar modes, accessible schedule tables, keyboard focus traps, and screen reader markup.
triggers:
  - a11y
  - accessibility
  - версия для слабовидящих
  - доступная среда
  - гост р 52872
  - расписание занятий таблица
  - wcag
---

# Educational Accessibility & a11y Specialist Skill

## 1. Scope & Regulatory Framework
This skill enforces compliance with:
- **ГОСТ Р 52872-2019** (Интернет-ресурсы для лиц с ограничениями жизнедеятельности).
- **WCAG 2.1 & 2.2 Level AA** standards.
- **ФЗ № 181-ФЗ** (ст. 15), **ФЗ № 273-ФЗ** (ст. 29), **Приказ Рособрнадзора № 1493** (раздел «Доступная среда»).

---

## 2. Core Non-Negotiable Rules

1. **Semantic HTML First:** Use `<main>`, `<header>`, `<nav>`, `<footer>`, `<article>`, `<button>`, `<table>`, not clickable `<div>`s.
2. **Keyboard Operability:** Every interactive element must be reachable via `Tab`/`Shift+Tab` and triggerable via `Enter`/`Space`.
3. **No Focus Killing:** Never write `outline: none` without providing an explicit, high-contrast `:focus-visible` replacement (`outline: 3px solid #0056b3; outline-offset: 2px;`).
4. **Skip-to-Content Link:** First element in the `<body>` must always be a skip link pointing to `#main-content`.
5. **No Color-Only Information:** Statuses (e.g. error, vacant seats, budget quota) must be conveyed with text or icons, never color alone.
6. **Accessible Data Tables:** Schedules must include `<caption>`, `<th scope="col">`, `<th scope="row">` and accessible scrolling (`tabindex="0" role="region"`).

---

## 3. Visually Impaired Panel (ГОСТ Toolbar Specs)

Educational sites must include a toolbar for visually impaired users with the following capabilities:
1. **Font Sizing:** 100% (16px), 150% (24px), 200% (32px) using `:root` CSS variables and `rem`.
2. **Color Schemes:**
   - Default (design theme)
   - Black on White (classic contrast)
   - White on Black (inverted dark mode)
   - Dark Blue on Cyan / Sky
   - Brown on Beige (soft sepia)
3. **Letter Spacing (Kerning):** Normal, Wide (`0.12em`).
4. **Image Filtering:** Full color, Grayscale (`filter: grayscale(100%)`), or Hidden (`display: none` showing `alt` text).
5. **Speech Synthesis:** Built-in read aloud using Web Speech API (`window.speechSynthesis`).
6. **State Persistence:** Saved in `localStorage` and applied before DOM rendering to prevent flashing.

---

## 4. Component Patterns

### 4.1. Skip-Link
```html
<a href="#main-content" class="skip-link">
  Перейти к основному содержанию
</a>
```
```css
.skip-link {
  position: absolute;
  top: -999px;
  left: 1rem;
  background: #000;
  color: #fff;
  padding: 0.75rem 1.25rem;
  z-index: 10000;
  text-decoration: none;
  font-weight: bold;
}
.skip-link:focus {
  top: 1rem;
}
```

### 4.2. Accessible Schedule Table (Расписание занятий)
```html
<div 
  class="table-scroll-container" 
  tabindex="0" 
  role="region" 
  aria-label="Расписание занятий группы 204 на понедельник, используйте клавиши со стрелками для горизонтальной прокрутки"
>
  <table class="schedule-table">
    <caption>Расписание учебных занятий: Группа 204 (1 семестр)</caption>
    <thead>
      <tr>
        <th scope="col">Пара / Время</th>
        <th scope="col">Дисциплина</th>
        <th scope="col">Преподаватель</th>
        <th scope="col">Аудитория</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">1 (08:30 – 10:00)</th>
        <td>Основы алгоритмизации (лек.)</td>
        <td>Иванов П. С.</td>
        <td>Ауд. 302</td>
      </tr>
      <tr>
        <th scope="row">2 (10:15 – 11:45)</th>
        <td colspan="3"><span class="sr-only">Вторая пара: </span>Самостоятельная работа / Окно</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 4.3. Accessible Mobile Burger Focus Trap
- Toggle button has `aria-expanded="false"` and `aria-controls="mobile-nav"`.
- When opened: `aria-expanded="true"`, body scroll is locked (`overflow: hidden`), keyboard focus is trapped inside the menu.
- Pressing `Escape` closes the menu and returns focus to the trigger button.

---

## 5. Verification Checklist

- [ ] Page passes automated axe-core / Lighthouse Accessibility audit with 100 score.
- [ ] Contrast ratio is >= 4.5:1 for body text and >= 3:1 for headers and UI borders.
- [ ] All inputs have associated `<label>` elements via `for`/`id`.
- [ ] Zooming to 200% and 400% does not break content or cause horizontal clipping.
- [ ] Screen readers (NVDA, VoiceOver) read all buttons and links with descriptive names.
