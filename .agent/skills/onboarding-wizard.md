---
name: onboarding-wizard
description: >-
  Design and implement two-surface onboarding wizards with persisted DB state:
  a welcome tour modal on first login and per-section non-blocking prompt cards,
  with server actions, optimistic UI, and admin reset capability.
---

# Onboarding Wizard

## Core Concept
Two surfaces, one persisted state:
1. **Welcome tour** — a modal on first login that steps through every flow (one step per module). Buttons: `Skip` / `Back` / `Next` / `Get started`.
2. **Per-section prompts** — the first time a user lands in a module (or after they skip the tour), a small non-blocking card appears: *"See how the {Module} flow works?"* with `Show me` / `Skip` / `Later`.

**Goal**: a first-time user understands the app in ~30s, and someone who skips the big tour still gets a nudge per section. A demo operator can re-arm the whole thing from an admin panel.

---

## Non-negotiables

- **Persist state per user, in the DB** — not `localStorage`. `localStorage` can't be reset from an admin panel, doesn't follow the user across devices, and makes "reset onboarding for the demo" impossible. One `jsonb` column on the user/profile row is enough.
- **The tour is skippable at every step.** Never trap the user. `Skip` is always visible.
- **Per-section prompts are non-blocking.** A fixed card in the corner, not a modal over the content. The user can ignore it and keep working.
- **`Later` ≠ `Skip`.** `Skip` marks the section seen (never ask again). `Later` dismisses for this session only (ask again next visit). Persist `Skip`; keep `Later` in client state.
- **Mark all sections seen when the tour completes**, so a user who took the full tour doesn't then get re-prompted per section.

---

## State Shape

One column, merged-not-overwritten:

```typescript
export type SectionKey = "bids" | "inbox" | "agenda" | "grow"; // project modules

export type OnboardingState = {
  main?: "done" | "skipped"; // undefined = never offered → tour fires
  sections?: Partial<Record<SectionKey, boolean>>;
};
```

### Database Migration
```sql
alter table profiles add column if not exists onboarding jsonb not null default '{}'::jsonb;
```

### Driving Predicates
```typescript
export const tourPending = (s: OnboardingState) =>
  s.main !== "done" && s.main !== "skipped";

export const sectionUnseen = (s: OnboardingState, k: SectionKey) =>
  !s.sections?.[k];
```

---

## Content Lives in Data, Not JSX

Keep the copy in a `SECTIONS` map (title, accent colour matching the module's nav colour, a one-line blurb, and 2–4 numbered flow steps). The tour modal and the per-section card both render from the same map, so the tour and the prompt never drift.

---

## Server Actions (Next.js App Router)

Read the current state, merge, write back. Use the privileged client to update the user's own row by ID (don't rely on a self-update RLS policy existing), then `revalidatePath("/", "layout")` so the layout that reads the state re-renders.

```typescript
"use server";

import { revalidatePath } from "next/cache";

async function patch(next: (cur: OnboardingState) => OnboardingState) {
  const userId = /* auth */;
  const cur = /* select onboarding where id = userId */ ?? {};
  /* update onboarding = next(cur) where id = userId */;
  revalidatePath("/", "layout");
}

export const completeTour = () =>
  patch((c) => ({
    ...c,
    main: "done",
    sections: { bids: true, inbox: true, agenda: true, grow: true },
  }));

export const skipTour = () => patch((c) => ({ ...c, main: "skipped" }));

export const markSectionSeen = (k: SectionKey) =>
  patch((c) => ({ ...c, sections: { ...(c.sections ?? {}), [k]: true } }));
```

---

## Component Placement

Render in the **persistent layout**, not per page — it stays mounted across navigations, so its `Later`/expanded client state survives module switches. It reads `usePathname()` to know which section you're in.

1. Show the tour when `tourPending(state)` and not locally closed.
2. Show the section prompt when the tour isn't showing, the path maps to a section, that section is unseen in DB, and it's not in the local seen/deferred sets.
3. Close optimistically: flip local state immediately, fire the server action in a `startTransition`. The revalidation catches up.

---

## Admin Re-arm

Give a demo operator a one-click **"Reset onboarding"** that clears the flag for every demo user (`update profiles set onboarding = '{}'`). Pair it with data-reseed presets if the app has a demo console. After reset, the tour fires again on next login.

---

## Golden-stack / TanStack Note

On TanStack Start/Router, swap the mechanics but keep the rules: load onboarding in the root route loader, persist via a server function + `router.invalidate()`, and gate the surfaces on the same two predicates. The state shape, the `Skip`-vs-`Later` distinction, and DB-not-localStorage are identical.

---

## Checklist

- [ ] `onboarding` `jsonb` column on the user/profile row, default `{}`.
- [ ] `SECTIONS` content map (shared by tour + prompts).
- [ ] Server actions: `completeTour`, `skipTour`, `markSectionSeen`, each merge-not-overwrite + revalidate.
- [ ] Rendered in the persistent layout, pathname-aware.
- [ ] Tour skippable at every step; completing it marks all sections seen.
- [ ] Per-section prompt non-blocking; `Skip` persists, `Later` is session-only.
- [ ] Admin "Reset onboarding" clears the flag for all demo users.

---

## Reference Implementation
Makely real-estate demo (`housapp-bieden`) — `lib/onboarding.ts`, `components/onboarding.tsx`, `app/(app)/onboarding-actions.ts`, and the admin `app/(app)/demo` console.
