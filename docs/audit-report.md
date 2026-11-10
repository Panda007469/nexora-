# Nexora Website — Full-Stack Audit Report

**Date:** 2026-11-06  
**Auditor:** Antigravity (Claude Sonnet 4.6)  
**Branch:** `nexora-v2`  
**Mode:** Read-only. No project files were changed.

---

## 1. Executive Summary

**Verdict: Not ready to launch.**

The public visitor flows (homepage, services, projects, FAQ, request form) are largely functional and visually polished. However, the application has a **Critical schema mismatch** between the code and the single migration file — tables such as `quotes`, `quote_items`, `requests` (with its extended columns), `internal_notes`, and `assigned_to` are referenced in code but are entirely absent from `supabase/migrations/20261015000000_initial_schema.sql`. The status check-constraints in that migration (`new`, `assigned`, `done`) conflict with the status values the UI sends (`under_review`, `consultation`, `qualified`, `rejected`, `closed`). The build passes, but `npx tsc --noEmit` exits with code 2 and 30+ strict-mode type errors — the project cannot be called TypeScript-safe.

| Area | Score /10 |
|---|---|
| Security | 6 |
| Functionality | 5 |
| UI / Responsive | 7 |
| Accessibility | 6 |
| Performance | 5 |
| SEO | 6 |
| Content | 5 |
| Code Quality | 5 |
| Deploy Readiness | 4 |

---

## 2. What Works Well

- **Request form** — 4-step wizard with per-step Zod validation, past-date rejection (`getTodayIsoDate` ≥ today), WhatsApp normalisation, and correct `submit_request` RPC call. 15 unit tests pass.
- **Admin auth guard** — `src/routes/admin.tsx` checks `loading`, `user`, and `role === "admin"` on every render; non-admins and signed-out visitors get redirected and the outlet renders nothing. `internal_notes` only appears inside `/admin/*` routes.
- **WhatsApp utility** (`src/lib/whatsapp.ts`) — `normalizeWhatsApp` strips non-digits and leading zeros, handles 10-digit Indian numbers by prepending `91`, and validates 11–15 digit international numbers. All usages wrap the return value with a null-guard before rendering.
- **Login route** — real Supabase `signInWithPassword` via `signIn()` from `use-auth.ts`; `useAuth` hook uses `auth.getSession()` and the realtime `onAuthStateChange` listener, with `user_roles` role lookup.
- **Hydration safety** — `shell.tsx` gates all auth-dependent UI behind `mounted && !loading`, so the SSR HTML always shows "Team Login"; no hydration mismatch.
- **Secret management** — `.env` is in `.gitignore` (`.env` / `.env.*` / `!.env.example`). `git ls-files` confirms `.env` is **not tracked**. No `service_role` key appears anywhere in tracked files.
- **Build passes** — `npm run build` exits 0; Vite + Nitro produces a full client + server SSR bundle targeting Cloudflare Workers.
- **`/faq` route exists** — `src/routes/faq.tsx` registers the route and renders all FAQ groups from `src/data/site.ts`.

---

## 3. Issues Table

| ID | Severity | Area | File : Line | What is wrong | Why it matters | Fix | Effort |
|---|---|---|---|---|---|---|---|
| **I01** | **Critical** | Security / DB | `supabase/migrations/20261015000000_initial_schema.sql` | The migration defines only 5 tables (`user_roles`, `members`, `requests`, `tasks`, `projects`). Code references `quotes`, `quote_items`, RPC functions `save_quote_items`, `get_quote`, `respond_quote`, `submit_request`, and columns `request_code`, `name`, `phone`, `org`, `customer_type`, `idea`, `internal_notes`, `assigned_to`, `approval_token` on `requests`. None of these exist in the migration. | At runtime all Supabase calls to these tables / RPCs will fail with 404/PGRST errors; the entire request pipeline and quote flow cannot work. | Write and apply a second migration that adds the missing tables, columns, RLS policies, and functions. Use the Supabase SQL editor or `supabase db push`. | L |
| **I02** | **Critical** | Security / DB | `supabase/migrations/…_initial_schema.sql:43` | `requests.status` check constraint allows only `'new','assigned','done'`. The UI sends `'under_review'`, `'consultation'`, `'qualified'`, `'rejected'`, `'closed'`. | Every status update from the admin UI will be rejected by Postgres. | Alter the constraint (or replace it in a new migration) to match the actual status enum values. | S |
| **I03** | **Critical** | Security | `.env.example` (tracked) | The file contains the **real** project URL (`hrppefjghjfvjnkhokkt.supabase.co`) and an anon key beginning `sb_publishable_…`. Although this key is the anon/publishable key (not service_role), publishing it in a tracked file exposes the project reference ID and makes it trivially easy to enumerate RLS-exposed tables. | Anyone who reads the repo can target the specific Supabase project. | Replace the values in `.env.example` with obviously fake placeholders (e.g. `your-project-ref.supabase.co` and `your-anon-key`). | S |
| **I04** | **Critical** | Functionality | `src/routes/admin.index.tsx:232–240` | `select("id, request_code, name, email, phone, service, status, created_at")` — columns `request_code`, `name`, `phone`, `service` do not exist on the `requests` table as defined in the migration (the migration uses `student_name`, `service_type`, no `phone`). | Returns empty/error data; the admin dashboard "10 newest requests" table shows nothing. | Align either the migration (add the new columns) or the query (use existing column names). Covered by I01 fix. | S |
| **I05** | **High** | Functionality | `src/routes/contact.tsx:67–73` | `onSubmit` calls `setTimeout(() => setSubmitted(true), 600)` — no network request is ever made. The user sees "Message sent successfully!" but nothing is stored or emailed. | Misleads users into thinking their enquiry was received. | Connect to an email provider (Supabase Edge Function + Resend, Formspree, or similar) or clearly label it as a WhatsApp-only contact page. | M |
| **I06** | **High** | Functionality | `src/components/layout/SiteFooter.tsx:154–170` | Newsletter subscribe `handleSubscribe` runs `setSubscribed(true)` with no network call — purely fake. | Same deception as I05; erodes trust. | Add a Supabase table or Edge Function to collect emails, or remove the form entirely. | M |
| **I07** | **High** | Security | None in code | No rate-limiting or CAPTCHA on the public request form (`/request`), contact form (`/contact`), or newsletter input. | A bot can flood the `requests` table (since the RLS policy allows anonymous insert with no limit), incurring DB row costs and polluting the pipeline. | Add Supabase's built-in `auth.rate_limit` or a Cloudflare Turnstile widget on the request form. At minimum add a server-side Supabase Edge Function that checks for duplicate email submissions within a time window. | M |
| **I08** | **High** | Code Quality | `npx tsc --noEmit` exit code 2 | 30+ type errors under `exactOptionalPropertyTypes`: `TS4111` on `import.meta.env` property access, `TS2375` on optional props, `TS18048` possibly-undefined on `admin.quotes.$id.tsx:281–283`, and `TS2375` on conditional `params` for TanStack Link in `admin.quotes.$id.tsx:508`. | Type errors mask real bugs; CI only runs `eslint` and `vitest`, so these errors slip through. | Fix each error site (use bracket notation for `import.meta.env['VITE_…']`, add `undefined` to prop types, guard array accesses). Add `npx tsc --noEmit` to CI. | M |
| **I09** | **High** | SEO / Security | All `/admin/*` routes, `src/routes/admin.tsx:21–23` | The `meta()` helper returns a standard `description`/`og` set but **no** `noindex` meta tag. Search engines can index the admin portal title and description. | Leaks the existence and description of the admin portal; wastes crawl budget. | Add `{ name: "robots", content: "noindex, nofollow" }` to the `head()` of `src/routes/admin.tsx`. | S |
| **I10** | **High** | Performance | `public/images/*` | Every image is 1.6 MB – 2.5 MB (e.g. `service-vlsi.webp` = 2.46 MB, `hero-1.webp` = 1.88 MB). The 300 KB target is exceeded by 5–8×. Even compressed hero images should be ≤ 150 KB for sub-2.5 s LCP on mobile. | LCP will be 4–8 s on a 4G connection. CLS may occur as images load. | Re-export all images at the display resolution (hero ≤ 1280 px wide, service cards ≤ 800 px), use `quality: 75`. Use `<img loading="lazy" />` for all below-the-fold images (already done) and `fetchpriority="high"` for the first hero slide. | M |
| **I11** | **Medium** | Deploy | `vercel.json` | `"framework": "vite"` and `"outputDirectory": "dist"` are wrong. The build uses `@lovable.dev/vite-tanstack-config` with Nitro targeting Cloudflare Workers; output is in `.output/`, not `dist/`. | Deploying to Vercel with this config will fail to find the output. | Either remove `vercel.json` (deploy via Nitro's `npx nitro deploy`) or rewrite it to match the Nitro Cloudflare adapter output. | S |
| **I12** | **Medium** | Deploy | `.github/workflows/ci.yml` | CI only runs `npm run lint`, `npm run test`, `npm run build`. It does **not** run `npx tsc --noEmit`. Type errors (I08) will never be caught in CI. | Type regressions enter `main` undetected. | Add a `Typecheck` step: `npx tsc --noEmit`. | S |
| **I13** | **Medium** | Functionality | `src/data/projects.ts:170` | `demoUrl: "https://example.com"` for all 12 projects; `githubUrl: "https://github.com"` for all 12. Clicking "Live Prototype Demo" or GitHub on any project goes to the placeholder URL. | Looks unprofessional and broken. | Replace with real URLs or omit the buttons when the URL is a placeholder (e.g. guard with `!project.demoUrl.includes('example.com')`). | S |
| **I14** | **Medium** | Content | `src/data/projects.ts:113,123,133,143,153` | Five projects (`Bluetooth-Controlled Rover`, `Campus Events Platform`, `Air Quality Monitor`, `Solar Power Tracker`, `Learning Resource Hub`) reference image paths that do **not exist on disk** (`project-rover.webp`, `project-campus-events.webp`, `project-air-quality.webp`, `project-solar-tracker.webp`, `project-learning-hub.webp`). All five have `published: false`. | Broken image URLs will produce 404s if any unpublished project is accidentally shown or if `published` filtering is removed. | Add the missing images, or set `gallery: []` for unpublished projects as a guard. | S |
| **I15** | **Medium** | Content | `src/data/site.ts:18` | `email: "contact@nexoratech.com"` and `city: "Bengaluru, India"`. According to the owner the real city is Thanjavur, Tamil Nadu. | Incorrect contact details mislead customers and reduce trust. | Update `email` to the real address and `city` to `"Thanjavur, Tamil Nadu"`. | S |
| **I16** | **Medium** | Content | `src/data/site.ts:239–258` | Team section uses three invented people (`Arjun Kumar`, `Priya Sharma`, `Rahul Verma`) with placeholder skill lists and no real photos (images reference `images/team/*.webp` paths not in repo). | Fake team bios are a trust and legal risk (misrepresentation). | Replace with real team member data, or remove the team section until real data is available. | S |
| **I17** | **Medium** | SEO | `public/robots.txt` | Only allows bots — `Allow: /` for all. There is no `Disallow: /admin` or `Disallow: /quote`. The `/quote/$token` route has `noindex` in the head, but bots can still follow links to it. | Admin and secret quote URLs can be crawled and appear in search indexes. | Add `Disallow: /admin` and `Disallow: /quote` to `robots.txt`. | S |
| **I18** | **Medium** | SEO | No `sitemap.xml` | `public/sitemap.xml` does not exist. | Search engines have no authoritative URL list; crawling depends on link discovery. | Generate a static `sitemap.xml` listing public routes, or add a sitemap Edge Function. | S |
| **I19** | **Medium** | Code Quality | `src/lib/lovable-error-reporting.ts` and `vite.config.ts` | `lovable-error-reporting.ts` is a Lovable-editor-specific telemetry hook. `vite.config.ts` imports `@lovable.dev/vite-tanstack-config`. `bunfig.toml` and `AGENTS.md` are Lovable build infrastructure files. These are safe to keep but add noise. | The Lovable SDK calls `window.__lovableReportRuntimeError` which is a no-op in production but pings the Lovable editor in preview — not a security issue. | None required for production; optionally replace `lovable-error-reporting.ts` with a standard Sentry/PostHog integration when ready. Document this decision. | L |
| **I20** | **Medium** | Accessibility | `src/components/nexora/shell.tsx`, `src/routes/index.tsx` | No `prefers-reduced-motion` guard found in any animation code. Framer Motion `motion/*` components and `animate-in` Tailwind classes animate on every page. | Users who have enabled reduced motion will still see full animations, violating WCAG 2.1 SC 2.3.3. | Wrap motion components with `useReducedMotion()` from Framer Motion, and conditionally disable transitions. | M |
| **I21** | **Medium** | Accessibility | `src/components/nexora/shell.tsx:197` | Hero slider dots lack a visible focus ring and no `aria-label` describes which slide each dot selects. The slider auto-advances by default (UNVERIFIED — depends on `HeroSlider.tsx` auto-play logic). | Keyboard users cannot operate the carousel; screen readers announce unlabelled buttons. | Add `aria-label={`Go to slide ${n}`}` to each dot button; ensure auto-play pauses on keyboard focus or is disabled. | S |
| **I22** | **Low** | Code Quality | `package.json` | `recharts`, `react-day-picker`, `react-resizable-panels`, `cmdk`, `vaul`, `input-otp`, `@radix-ui/react-context-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-menubar` are listed in `dependencies` but no `import` of these packages appears in `src/`. | Increases bundle size unnecessarily. | Audit and remove unused dependencies. Run `npm run build` after removal to confirm. | S |
| **I23** | **Low** | Security | `src/components/nexora/shell.tsx:95` and `src/components/layout/SiteFooter.tsx:85,200` | `target="_blank"` with `rel="noreferrer"` only (not `rel="noopener noreferrer"`). `noreferrer` implies `noopener` in modern browsers, but the explicit pairing is the documented safe pattern. | Minimal real-world risk in modern browsers, but lint rules and security scanners flag it. | Add `noopener` to these social link `rel` attributes. | S |
| **I24** | **Low** | Content | `public/images/` | Duplicate file names appear: e.g. `project-irrigation.webp` appears listed twice, `project-attendance-system.webp` twice — likely Windows duplicated-name artefacts from the directory listing. `project-1.webp` through `project-6.webp` exist alongside the named project images and are unreferenced in code. | Old numbered images waste storage and Git history size. | Delete the unreferenced `project-1.webp` through `project-6.webp` files. | S |
| **I25** | **Low** | Deploy | `bun.lock` present (via `bunfig.toml`) but `package-lock.json` is also tracked | Two lockfiles co-exist. CI uses `npm ci` with `package-lock.json`. `bun.lock` will cause confusion if a developer runs `bun install` and drifts from npm-pinned versions. | | Decide on one package manager and delete the other lockfile from the repo (add it to `.gitignore`). | S |
| **I26** | **Low** | Security / Content | `src/data/site.ts:30–33` | Social links point to `https://github.com/Panda007469/nexora-` (unfinished URL), `https://linkedin.com` (generic LinkedIn homepage), `https://twitter.com` (generic Twitter homepage). | Generic URLs break brand credibility. | Update to actual Nexora profile URLs. | S |

---

## 4. Flash-Ready Fix Prompts

### I01 + I02 — Missing migrations (Critical — use Claude for SQL)
> Context: K:\nexora\nexora-website, branch nexora-v2. Read .agents/rules/nexora-design.md first.
> Task: Create supabase/migrations/20261106000001_requests_v2_quotes.sql. This migration must: 1) ALTER TABLE public.requests DROP CONSTRAINT (the old status check), ADD COLUMNS request_code text unique, name text, phone text, org text, city text, customer_type text, service text, idea text, budget text, tech_details jsonb, deliverables jsonb, internal_notes text, assigned_to uuid references auth.users(id), tracking_token uuid default gen_random_uuid() unique, and ALTER status CHECK to allow 'new','under_review','consultation','qualified','rejected','closed'. 2) CREATE TABLE public.quotes with id uuid pk, request_id uuid FK requests, quote_number text unique, status text CHECK ('draft','sent','accepted','declined'), currency text default 'INR', subtotal numeric, tax_percent numeric default 0, tax_amount numeric, total numeric, valid_until date, terms text, approval_token uuid default gen_random_uuid() unique, sent_at timestamptz, responded_at timestamptz, customer_note text, created_by uuid references auth.users(id), created_at timestamptz default now(). 3) CREATE TABLE public.quote_items with id uuid pk, quote_id uuid FK quotes on delete cascade, description text not null, qty numeric not null, unit_price numeric not null, position int default 0. 4) Enable RLS on both new tables: quotes admin-full, quote_items admin-full. 5) CREATE FUNCTION submit_request(p jsonb) SECURITY DEFINER returns table(code text, token uuid). 6) CREATE FUNCTION save_quote_items(qid uuid, items jsonb) SECURITY DEFINER admin-only. 7) CREATE FUNCTION get_quote(t uuid) SECURITY DEFINER returns jsonb — returns quote+items for the matching approval_token, callable by anon. 8) CREATE FUNCTION respond_quote(t uuid, decision text, note text) SECURITY DEFINER — sets status/responded_at/customer_note where approval_token=t and status='sent'. Do not run git commit. Report briefly.

### I03 — Exposed project ref in .env.example (Critical)
> Context: K:\nexora\nexora-website, branch nexora-v2. Read .agents/rules/nexora-design.md first.
> Task: Replace the real Supabase URL and anon key values in .env.example with obvious placeholder strings: VITE_SUPABASE_URL="https://your-project-ref.supabase.co" and VITE_SUPABASE_ANON_KEY="your-anon-key-here". Do not change any other file. Run npm run build and fix errors. Do not run git commit. Report briefly.

### I05 + I06 — Fake contact form and newsletter (High)
> Context: K:\nexora\nexora-website, branch nexora-v2. Read .agents/rules/nexora-design.md first.
> Task: 1) In src/routes/contact.tsx, the onSubmit function simulates success with setTimeout — it stores nothing. Add a prominent disclaimer below the submit button: "This form sends a WhatsApp message, not an email submission." Then wire the form so clicking Submit opens a WhatsApp link: whatsappUrl(whatsappNumber, `Hi Nexora, I am ${data.name}. ${data.message}`) — open it with window.open. Keep the existing validation. 2) In src/components/layout/SiteFooter.tsx, the newsletter form is similarly fake (handleSubscribe only sets subscribed state). Add a small "(coming soon)" label next to "Stay Connected" or remove the form; do not leave it as a fake submit. Run npm run build and fix errors. Do not run git commit. Report briefly.

### I07 — No spam/rate-limit protection on request form (High)
> Context: K:\nexora\nexora-website, branch nexora-v2. Read .agents/rules/nexora-design.md first.
> Task: Add a simple honeypot field to the request form in src/routes/request.tsx. Add an invisible text input named "website" (aria-hidden="true", tabIndex={-1}, styled with absolute positioning off-screen). In the submit() function, before calling supabase.rpc, check if values.website is non-empty; if so, silently set status to 'success' without submitting (fake honeypot success). Also add a debounce: if the user clicks submit again within 5 seconds of a failed submission, block it. These are lightweight deterrents; note in a comment that a Cloudflare Turnstile or Supabase Edge Function rate-limit is recommended for production. Run npm run build and fix errors. Do not run git commit. Report briefly.

### I08 — TypeScript strict-mode errors (High)
> Context: K:\nexora\nexora-website, branch nexora-v2. Read .agents/rules/nexora-design.md first.
> Task: Run npx tsc --noEmit and fix all reported errors. Key patterns: 1) Use bracket notation for import.meta.env accesses in src/lib/supabase.ts (import.meta.env['VITE_SUPABASE_URL']). 2) Fix TS2375 exactOptionalPropertyTypes errors by adding undefined to optional prop types or using satisfies. 3) Guard possibly-undefined array accesses in src/routes/admin.quotes.$id.tsx lines 281–283. 4) Fix the conditional params prop on Link in admin.quotes.$id.tsx:508 (use a ternary to pass a fully-typed object). After all errors are fixed, also add "tsc --noEmit" as a step in .github/workflows/ci.yml. Run npm run build and fix errors. Do not run git commit. Report briefly.

### I09 — Admin pages missing noindex (High)
> Context: K:\nexora\nexora-website, branch nexora-v2. Read .agents/rules/nexora-design.md first.
> Task: In src/routes/admin.tsx, change the head() return value to add { name: "robots", content: "noindex, nofollow" } to the meta array. Also update public/robots.txt to add two Disallow lines: Disallow: /admin and Disallow: /quote after the existing Allow: / for User-agent: *. Run npm run build and fix errors. Do not run git commit. Report briefly.

### I10 — Oversized images (High)
> Context: K:\nexora\nexora-website, branch nexora-v2. Read .agents/rules/nexora-design.md first.
> Task: Every image in public/images is 1.6–2.5 MB; the target is under 300 KB for service/project images and under 150 KB for hero images. Using Node.js (sharp, available via npx), write a one-shot script scripts/compress-images.mjs that reads all .webp files in public/images and public/images/projects, resizes hero-*.webp to max width 1440px at quality 72, page-banner.webp and cta-round.webp to 1200px quality 75, service-*.webp and og-image.webp to 900px quality 75, and project-*.webp to 800px quality 75, writing them back in-place. Run the script and report the before/after sizes. Do not touch .env, supabase/, or any .tsx/.ts file. Do not run git commit. Report briefly.

### I11 — Wrong vercel.json (Medium)
> Context: K:\nexora\nexora-website, branch nexora-v2. Read .agents/rules/nexora-design.md first.
> Task: The current vercel.json says framework: "vite" and outputDirectory: "dist", but the build uses Nitro with a Cloudflare Workers adapter and outputs to .output/. This project should deploy to Cloudflare Pages/Workers via nitro deploy, not Vercel. Remove vercel.json entirely and add a brief DEPLOYMENT.md in docs/ explaining: 1) Run npm run build, 2) Run npx nitro deploy --prebuilt to push to Cloudflare Workers, 3) Set env vars VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Cloudflare dashboard. Run npm run build and fix errors. Do not run git commit. Report briefly.

### I13 — Placeholder demoUrl/githubUrl in projects (Medium)
> Context: K:\nexora\nexora-website, branch nexora-v2. Read .agents/rules/nexora-design.md first.
> Task: In src/data/projects.ts all projects have demoUrl: "https://example.com" and githubUrl: "https://github.com". In src/routes/projects.$slug.tsx, wrap the "Live Prototype Demo" and "GitHub" buttons in a conditional: only render each button when its URL does not contain "example.com" or equal "https://github.com". This prevents broken placeholder links from appearing publicly. Run npm run build and fix errors. Do not run git commit. Report briefly.

### I15 — Wrong city in contact data (Medium)
> Context: K:\nexora\nexora-website, branch nexora-v2. Read .agents/rules/nexora-design.md first.
> Task: In src/data/site.ts update city: "Bengaluru, India" to city: "Thanjavur, Tamil Nadu" and email: "contact@nexoratech.com" to the real Nexora email address (ask the owner if unsure — do not guess). Run npm run build and fix errors. Do not run git commit. Report briefly.

### I17 + I18 — robots.txt and sitemap (Medium)
> Context: K:\nexora\nexora-website, branch nexora-v2. Read .agents/rules/nexora-design.md first.
> Task: 1) In public/robots.txt, add after the last Allow: / line: Disallow: /admin and Disallow: /quote for the User-agent: * block. 2) Create public/sitemap.xml listing the public routes: /, /services, /projects, /about, /contact, /faq, /request, and each published project slug from src/data/projects.ts. Use today's date for lastmod. Add a Sitemap: directive to robots.txt pointing to the sitemap URL. Run npm run build and fix errors. Do not run git commit. Report briefly.

### I20 — Missing prefers-reduced-motion (Medium)
> Context: K:\nexora\nexora-website, branch nexora-v2. Read .agents/rules/nexora-design.md first.
> Task: In src/components/layout/FadeUp.tsx (the main animation wrapper used site-wide), import useReducedMotion from "motion/react" (or "framer-motion"). When useReducedMotion() returns true, set the motion component's initial, animate, and transition props to show content immediately with no transform or opacity animation (initial={{ opacity: 1, y: 0 }}, animate={{ opacity: 1, y: 0 }}, transition={{ duration: 0 }}). Apply the same guard in src/components/nexora/HeroSlider.tsx for the slide-in transitions. Run npm run build and fix errors. Do not run git commit. Report briefly.

---

## 5. Known-Issues Status

| ID | Description | Status | Evidence |
|---|---|---|---|
| K1 | Footer logo shows as blank white square | **FIXED** | `src/components/layout/Logo.tsx` renders `<img src={…} alt="Nexora Technologies">` with correct path `/images/nexora-logo-full.png` which exists on disk at 92 KB. |
| K2 | Footer lists Contact twice | **FIXED** | `SiteFooter.tsx` Column 2 iterates `navigation` (Home, Services, Projects, About, Contact) + FAQ + Request Service. No duplicate Contact entry observed. |
| K3 | /faq returns 404 | **FIXED** | `src/routes/faq.tsx` registers `createFileRoute("/faq")`. Route appears in `routeTree.gen.ts`. Build passes. |
| K4 | Empty chat dialog button | **FIXED** | Floating button is now `WhatsAppButton.tsx` — a fixed bottom-right WhatsApp link with `noopener noreferrer`. |
| K5 | Projects reuse same image or have mismatched images | **STILL OPEN** | Old `project-1.webp` through `project-6.webp` files still exist in `public/images/` unreferenced. Five `published: false` projects reference images that do not exist on disk (I14). Published projects have distinct named images. |
| K6 | Request form allowed past completion dates | **FIXED** | `requestFields.shape.deadline` in `src/data/request.ts:50` uses `.refine((v) => v >= getTodayIsoDate(), …)`. Unit test `"rejects past deadline with correct message"` passes. |
| K7 | Team section uses invented people | **STILL OPEN** | `src/data/site.ts:239–258` has `Arjun Kumar`, `Priya Sharma`, `Rahul Verma` with placeholder photo paths that don't exist in repo. (I16) |
| K8 | Contact details are placeholders | **STILL OPEN** | `src/data/site.ts:18` email is `contact@nexoratech.com`; city is `Bengaluru, India`. Owner confirms real city is Thanjavur. (I15) |
| K9 | Page banners were plain navy | **FIXED** | `src/components/layout/PageHeader.tsx:22` uses `url('/images/page-banner.webp'), linear-gradient(135deg, #00122B, …)` as background. `page-banner.webp` exists (1.6 MB). |
| K10 | Home page lacked About, Stats, How It Works and Why Nexora | **FIXED** | `src/routes/index.tsx` imports `AboutSection`, `ServicesSection`, `ProjectsSection`, `StatsSection`, `HowItWorks`, `WhyNexora`, `CtaBanner`, `FaqPreview`. All components present in `src/components/nexora/`. |
| K11 | Hero heading "Working" hard to read over image | **FIXED** | `HeroSlider.tsx:103–107` applies two gradient overlays (`from-[#001B3D]/75` left-to-right and `from-[#001B3D]/70` bottom-to-top) over the hero image; heading renders in white. |
| K12 | Login link not visible anywhere | **FIXED** | "Team Login" link with `LogIn` icon added to the top info bar (desktop, `shell.tsx:79–86`) and to the mobile menu bottom (`shell.tsx:218–226`). Footer bottom bar also has "Team Login" (`SiteFooter.tsx:225–230`). |
| K13 | vercel.json says Vite/dist but build uses Nitro/Cloudflare | **STILL OPEN** | `vercel.json` still says `"framework": "vite"` and `"outputDirectory": "dist"`. Build outputs to `.output/`. (I11) |
| K14 | bun.lock and package-lock.json both exist | **STILL OPEN** | `bunfig.toml` exists (tracked). `package-lock.json` exists (tracked). `bun.lock` not found in `git ls-files` output — may be gitignored — but `bunfig.toml` indicates bun is used. (I25) |
| K15 | tsconfig.tsbuildinfo committed | **CANNOT VERIFY** | `git ls-files` output did not include `tsconfig.tsbuildinfo`; it may be in `.gitignore` or simply absent. UNVERIFIED — could not confirm without reading full `git ls-files` output. |

---

## 6. Owner Manual Tests

These require your login credentials or a real browser and cannot be automated by a read-only audit.

1. **Request form — happy path** (browser, no login): Go to `/request`. Complete all 4 steps with valid data (Student type, real WhatsApp number, deadline ≥ today). Submit. **Expected:** Success card shows a `request_code` and a tracking link. Check the Supabase `requests` table to confirm the row was inserted with correct columns.

2. **Request form — bot / rate-limit test**: Submit the form 5 times in quick succession from the same browser. **Expected:** Only the first submission should succeed; later ones should be blocked (once I07 is fixed).

3. **Admin login — wrong password**: Go to `/login`, enter a wrong password. **Expected:** Toast error "Invalid login credentials" (or similar Supabase message). **No redirect to /admin.**

4. **Admin login — correct credentials**: Log in with the admin email. **Expected:** Redirect to `/admin`. Verify dashboard counts update from live Supabase data.

5. **Non-admin user attempting /admin**: Create a second Supabase user (no `user_roles` row). Log in as that user, then navigate to `/admin` manually. **Expected:** Redirect to `/` (homepage), not the admin dashboard.

6. **Admin status change**: Open any request in `/admin/requests/{id}`. Change status to "Under review". **Expected:** Supabase row updates; toast confirms save; badge refreshes.

7. **Quote creation and send**: From a request detail page, click "Create quote". Add at least one item. Set tax, valid-until, terms. Click Save. Click "Mark as sent". **Expected:** Status changes to `sent`; "Copy link" and WhatsApp button appear.

8. **Customer quote page — valid token**: Open the share link from step 7 in an Incognito window. **Expected:** Quote items, total (INR format), and Accept/Decline buttons visible. `noindex` meta tag present in page source.

9. **Customer quote page — accept**: Click "Accept quote". Confirm in dialog. **Expected:** Thank-you banner appears; `quotes.status` in Supabase becomes `accepted`.

10. **WhatsApp links on mobile**: On a real Android or iPhone, tap the floating WhatsApp button, the footer "Chat on WhatsApp", and the admin WhatsApp button on a request row. **Expected:** WhatsApp opens with the correct phone number and pre-filled message in each case.

11. **Mobile menu "Team Login"**: On a 375 px viewport, open the hamburger menu. **Expected:** "Team Login" (or "Admin" if signed in as admin) link appears at the bottom of the mobile menu.

12. **Dark mode**: Toggle dark mode on the homepage and `/request`. **Expected:** No white or black elements that break — footer is navy (`bg-navy`) not pure white; no hardcoded `bg-white` text becomes invisible.

13. **Rotate admin password**: The admin account password was discussed in chat context. Rotate it immediately in Supabase Auth dashboard → Users. Update the local `.env` after rotation.

14. **Print quote**: On `/quote/{token}`, click the Print button. **Expected:** Browser print dialog opens; header/footer action buttons hidden; brand block visible at top.

---

## 7. Recommended Fix Order (Phases)

### Phase 1 — Blockers (before any real users)
_Use Claude for SQL logic; Flash for all other tasks._

| Step | Task | Model | Issues |
|---|---|---|---|
| 1a | Write and apply the missing Supabase migrations | **Claude** | I01, I02 |
| 1b | Replace real credentials in `.env.example` | Flash | I03 |
| 1c | Fix all TypeScript strict-mode errors; add `tsc` to CI | Flash | I08, I12 |
| 1d | Add `noindex` to admin routes; update `robots.txt` | Flash | I09, I17 |

### Phase 2 — High-priority UX and trust
_All Flash_

| Step | Task | Issues |
|---|---|---|
| 2a | Wire contact form to real channel (WhatsApp redirect or Edge Function) | I05 |
| 2b | Fix fake newsletter form (label as coming-soon or remove) | I06 |
| 2c | Add honeypot + submit debounce to request form | I07 |
| 2d | Remove vercel.json; add DEPLOYMENT.md | I11 |

### Phase 3 — Content and SEO
_All Flash_

| Step | Task | Issues |
|---|---|---|
| 3a | Compress all images to ≤ 300 KB (script) | I10 |
| 3b | Generate `sitemap.xml` | I18 |
| 3c | Fix city and email in `src/data/site.ts` | I15 |
| 3d | Replace fake team bios or remove team section | I16 |
| 3e | Guard placeholder `demoUrl` / `githubUrl` in projects | I13 |
| 3f | Add missing project images or remove unpublished entries | I14 |

### Phase 4 — Polish
_All Flash_

| Step | Task | Issues |
|---|---|---|
| 4a | Add `prefers-reduced-motion` to `FadeUp` and `HeroSlider` | I20 |
| 4b | Add `aria-label` to hero slider dots | I21 |
| 4c | Fix social link URLs | I26 |
| 4d | Remove unused Radix/recharts dependencies | I22 |
| 4e | Decide bun vs npm; delete extra lockfile | I25 |
| 4f | Add `noopener` to social `rel` attributes | I23 |
| 4g | Delete unreferenced `project-1.webp` – `project-6.webp` | I24 |

---

## 8. Not Tested and Why

| Item | Reason |
|---|---|
| **Lighthouse scores (actual LCP/INP/CLS)** | Dev server not running during audit; `npm run audit:lighthouse` requires the server on port 5173. Scores are inferred from image sizes and code review. |
| **Supabase RPC functions at runtime** | No Supabase audit results were pasted (`none` given). The functions `submit_request`, `get_quote`, `respond_quote`, `save_quote_items` are called in code but cannot be verified to exist in the live database without connecting. |
| **Admin dashboard data accuracy** | Cannot log in; counts, status changes, and quote creation flows are confirmed by code review only. |
| **Quote token expiry enforcement** | The expiry logic lives inside the `get_quote` DB function, which is not in the migration file. Cannot verify the expiry check logic. |
| **Email delivery on contact form** | No email provider is wired (I05); nothing to test. |
| **Actual rendering at 375 / 768 / 1280 px** | Chrome DevTools MCP tools not invoked for this audit to stay read-only and fast. UI review is code-based. |
| **Second non-admin user test** | Requires creating a test Supabase user and credentials — delegated to Owner Manual Tests (step 5). |
| **bun.lock presence in git** | `git ls-files` truncated output did not include the full listing; could not confirm definitively whether `bun.lock` is tracked. |

