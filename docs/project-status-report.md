# Nexora Website — Project Status & Pending Work Report

**Generated:** 2026-11-10  
**Workspace:** `K:\nexora\nexora-website`  
**Branch:** `nexora-v2`  
**Latest local commit:** `4582b9c` (`Admin workspace layout and phone formatting` — local only, not yet pushed; `origin/nexora-v2` is at `9dbeba3`)

---

## 1. Executive Summary

The core public marketing site, Supabase authentication, admin pipeline (dashboard, requests, quotes, messages), customer quote approval flow, and customer project tracking flow (`/track`) are built and compile cleanly (`npx tsc --noEmit` = 0 errors, `npm run build` exits 0).

Remaining work falls into four buckets:
1. **Commit & push** the local `4582b9c` commit plus the uncommitted `/track` + reachability changes.
2. **Phase 4A (Project Management & Public Showcase)** — migrating `/projects`, `/projects/:id`, home featured projects, and `/admin/projects` from static `src/data/projects.ts` to Supabase + Storage (`project-images`), including SQL bucket security fixes.
3. **Remaining Audit / Production Polish** — compressing 1.6–2.5 MB images, fixing placeholder contact/team/social data, generating `sitemap.xml`, resolving the deployment target (`vercel.json` vs Nitro/Cloudflare), and accessibility/cleanup items.
4. **Future Phases (if scoped)** — member/task assignment workflows backed by the existing `members` and `tasks` tables.

---

## 2. What Is Done So Far

### 2.1 Core Website & Design System
- Brand design system configured in `src/styles.css` (navy `#001B3D`, royal `#2F52BA`, violet `#8460CC`, magenta `#C94BD0`, brand gradient, Orbitron / Outfit / Inter typography, light & dark themes).
- Shared layout shell in `src/routes/__root.tsx`, `src/components/nexora/shell.tsx`, `src/components/layout/SiteFooter.tsx`, `PageHeader.tsx`, `CtaBanner.tsx`, `WhatsAppButton.tsx`, `ScrollToTop.tsx`, and `ThemeToggle.tsx`.
- Public pages implemented:
  - `/` (`src/routes/index.tsx` + `src/components/home/*`) — Hero slider, About, Services, Stats, Projects carousel, How It Works, Why Nexora, CTA band, FAQ preview, plus tracking banner (uncommitted).
  - `/services` (`src/routes/services.tsx`)
  - `/about` (`src/routes/about.tsx`)
  - `/faq` (`src/routes/faq.tsx`)
  - `/contact` (`src/routes/contact.tsx`) — Zod validation, optional WhatsApp phone, hidden `website` honeypot, wired to `supabase.rpc('submit_contact', ...)`.
  - Footer newsletter (`src/components/layout/SiteFooter.tsx`) — Zod email validation, hidden `website` honeypot, wired to `supabase.rpc('subscribe_newsletter', ...)`.
  - `/projects` and `/projects/$slug` — currently reading from static `src/data/projects.ts` (to be replaced in Phase 4A).

### 2.2 Authentication & Admin Workspace
- `/login` (`src/routes/login.tsx`) — real Supabase email/password sign-in via `src/hooks/use-auth.ts`, role verification against `user_roles`, hydration-safe header/footer `"Team Login"` / `"Admin"` links.
- `/admin` layout (`src/routes/admin.tsx`):
  - Protected admin-only guard (`role === 'admin'`).
  - Public shell (top bar, navbar, footer, CTA banner, floating WhatsApp, scroll-to-top) hidden on all `/admin*` routes via `src/routes/__root.tsx`.
  - Full-viewport workspace (`h-dvh`) with independently scrolling `<main>`, sticky desktop sidebar, mobile `Sheet` drawer, `ThemeToggle`, `"View site"` external link, signed-in email, and sign-out.
- `/admin` dashboard (`src/routes/admin.index.tsx`) — status count cards + 10 newest requests table with formatted phone numbers (`formatPhone` in `src/lib/whatsapp.ts`) and WhatsApp links.
- `/admin/requests` (`src/routes/admin.requests.index.tsx`) — status filter chips, debounced search, pagination, formatted phone display, and WhatsApp links.
- `/admin/requests/$id` (`src/routes/admin.requests.$id.tsx`) — full request details, status updates, claim/assign to me, internal notes, Quotes card (`Create quote`), formatted phone display, WhatsApp tracking link, and Copy tracking link (uncommitted).
- `/admin/quotes/$id` (`src/routes/admin.quotes.$id.tsx`) — draft quote line-item editor (`save_quote_items` RPC), Zod validation, `en-IN` currency totals, `Mark as sent`, shareable `/quote/$token` link, WhatsApp share button, and customer response view.
- `/admin/messages` (`src/routes/admin.messages.tsx`) — contact form inbox from `contact_messages`, `mailto:` links, `formatPhone` + WhatsApp button, and `Mark as read`.

### 2.3 Customer-Facing Self-Service Flows
- `/request` (`src/routes/request.tsx`) — 4-step project request wizard calling `supabase.rpc('submit_request', ...)`, tracking code + token display, localStorage `"nexora_last_code"` persistence, and WhatsApp share button (additions uncommitted).
- `/quote/$token` (`src/routes/quote.$token.tsx`) — public no-login quote viewer (`get_quote` + `respond_quote` RPCs), accept/decline confirmation dialogs, expiry state, and print support.
- `/track` (`src/routes/track.tsx`, uncommitted) — public no-login project tracker supporting `?token=` (`track_by_token` RPC) and request code + email lookup (`track_by_code` RPC), 5-step `bg-brand-gradient` progress stepper, rejected banner, quotes list linking to `/quote/$token`, `"Use my last request code"` chip, and WhatsApp CTA.

### 2.4 Security, SEO, Type Safety & CI
- `.env` is ignored by git and untracked; `.env.example` holds placeholder credentials only.
- `<meta name="robots" content="noindex, nofollow">` set on `/login`, `/admin*`, `/quote/$token`, and `/track`; `public/robots.txt` disallows `/admin`, `/login`, `/quote`, `/track`.
- All TypeScript strict-mode errors resolved (`npx tsc --noEmit` exits 0).
- `.github/workflows/ci.yml` updated to run `npm ci`, `npm run lint`, `npm run test`, `npx tsc --noEmit`, and `npm run build`.

---

## 3. Uncommitted Changes Currently in Working Tree

These files implement **Tracking (`/track`)**, **Tracking reachability**, and **Admin tracking link sharing**, and are ready to commit & push once GitHub connectivity is working:
- **New:** `src/routes/track.tsx`
- **Modified:** `src/data/site.ts`, `src/components/nexora/shell.tsx`, `src/routes/index.tsx`, `src/routes/request.tsx`, `src/routes/admin.requests.$id.tsx`, `src/routes/admin.requests.index.tsx`, `src/routeTree.gen.ts`
- **Local unpushed commit:** `4582b9c` (`Admin workspace layout and phone formatting`)

---

## 4. Hereafter Pendings (Prioritized)

### Priority 1 — Immediate / Repo Sync & Verification
- [ ] **Push local commits + commit `/track` changes** to `origin/nexora-v2` (previous `git push` failed due to `Could not resolve host: github.com`).
- [ ] **Verify live Supabase database vs repo migrations**: `supabase/migrations/` in Git only contains `20261015000000_initial_schema.sql`, while the frontend calls tables/columns/RPCs created directly in Supabase (`submit_request`, `submit_contact`, `subscribe_newsletter`, `track_by_token`, `track_by_code`, `save_quote_items`, `get_quote`, `respond_quote`, `contact_messages`, `newsletter_subscribers`, `quotes`, `quote_items`). Keep migrations in sync or back up the live schema SQL.
- [ ] **Run manual end-to-end QA tests** (see `docs/audit-report.md` section 5): admin login, request submission -> `/track` -> `/admin/requests` -> quote creation -> `/quote/$token` accept/decline -> `/contact` -> `/admin/messages` -> newsletter subscribe.

### Priority 2 — Phase 4A: Project Management & Public Showcase (Planned)
1. **Database & Storage Security Hardening (SQL — needed before/with Phase 4A):**
   - Confirm and align the **exact 10 allowed `projects.category` slugs** in the live `projects_category_check` constraint (repo schema currently lists only `'hardware'`, `'embedded'`, `'frontend'`, `'other'`, whereas Phase 4A requires 10 slugs including FPGA and PCB).
   - Set server-side limits on `storage.buckets` for `project-images`:
     - `file_size_limit = 2097152` (2 MB)
     - `allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']` (blocks `.svg` / `.html` XSS uploads).
   - Add explicit `WITH CHECK` on the Storage `UPDATE` policy and optional `https?://` constraints on `projects.demo_url` / `github_url`.
2. **Admin `/admin/projects` (`src/routes/admin.projects.tsx` + link in `src/routes/admin.tsx`):**
   - List all projects (published + drafts), Add/Edit form with title, 10-category selector, description, tech chips, multi-image browser compression & upload to `project-images` (`.jpg`/`.png`/`.webp`, `<= 2 MB`), demo URL, GitHub URL, featured toggle, publish/draft toggle, and delete with confirmation dialog.
3. **Public Showcase Migration:**
   - `/projects` (`src/routes/projects.index.tsx`): query published projects from Supabase (`12` per page with `.range()` `"Load more"`, 10 category tabs + `"All projects"`, title search, `"Projects coming soon"` empty state for FPGA & PCB).
   - `/projects/$id` (replacing `src/routes/projects.$slug.tsx`): query one published project + image gallery, safe `http:`/`https:` validation on `demo_url`/`github_url` links, `rel="noopener noreferrer"`.
   - Home `ProjectsSection.tsx`: query first **3 featured published** projects from Supabase.
   - Remove sample projects from `src/data/projects.ts` (so unpublished projects no longer ship in the client bundle) and update `AboutSection.tsx`, `StatsBand.tsx`, `src/components/nexora/shared.tsx`, and `src/test/request.test.ts`.

### Priority 3 — Remaining Audit Fixes & Production Polish (from `docs/audit-report.md`)
- [ ] **I10 — Compress oversized images in `public/images/`**: Nearly all `.webp` files are currently **1.6 MB – 2.5 MB** (e.g., `service-vlsi.webp` is 2462.9 KB; `hero-1.webp` is 1875.4 KB). Compress heroes to `<= 300 KB` (ideally `<= 150 KB`) and other images to `<= 150 KB`.
- [ ] **I24 — Remove unused numbered placeholder images**: `public/images/project-1.webp` through `project-6.webp` (plus leftover duplicate copies) are unreferenced in code.
- [ ] **I15 & I26 — Real contact & social links in `src/data/site.ts`**: Update `email` (`"contact@nexoratech.com"`), `city` (`"Bengaluru, India"` -> `"Thanjavur, Tamil Nadu"`), and generic social URLs (`https://linkedin.com`, `https://twitter.com`, incomplete GitHub URL).
- [ ] **I16 — Team section (`src/data/site.ts` & `src/routes/about.tsx`)**: Replace the 3 placeholder team bios (`Arjun Kumar`, `Priya Sharma`, `Rahul Verma`) with real team details or remove/hide the section.
- [ ] **I18 — SEO Sitemap**: Generate `public/sitemap.xml` covering public routes (`/`, `/services`, `/projects`, `/about`, `/contact`, `/faq`, `/request`) and add a `Sitemap:` directive to `public/robots.txt`.
- [ ] **I07 — Production bot protection on `/request`, `/contact`, newsletter**: Client honeypots and/or validation exist on `/contact` and footer newsletter; add `/request` submit debounce + consider Cloudflare Turnstile or server-side rate limiting.
- [ ] **I20, I21, I23 — Accessibility & link polish**: Add `useReducedMotion()` guards in `FadeUp.tsx` and `HeroSlider.tsx`, add `aria-label`/focus polish on slider dots, and change `rel="noreferrer"` to `rel="noopener noreferrer"` on external social links.
- [ ] **I11/K13, I22, I25 — Deployment & dependency hygiene**:
  - Decide deployment config: `vercel.json` currently expects Vite/`dist`, while `npm run build` outputs Nitro/Cloudflare Workers to `.output/`.
  - Audit and prune unused packages in `package.json` (`recharts`, `react-day-picker`, `vaul`, `cmdk`, etc.).
  - Align package manager config (`bunfig.toml` is tracked alongside `package-lock.json`, while CI uses `npm ci`).
- [ ] **Owner Security Hygiene**:
  - Rotate default admin password in Supabase if still using a dev password.
  - Run `git log --all -S"service_role" --oneline` locally to verify no secret keys exist in git history.

### Priority 4 — Later Phases (Not Yet Scoped)
- **Orders, Tasks & Team Execution Portal**: `public.members` and `public.tasks` tables (and `member` RLS policies) exist in `20261015000000_initial_schema.sql`, with no frontend routes yet for team/member task management or customer order milestone updates.

