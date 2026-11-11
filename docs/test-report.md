# Nexora Website QA Audit Report: Quotes, Requests, and Tracking Flows

**Date:** 2026-11-11  
**Target Repository:** `K:\nexora\nexora-website` (branch `nexora-v2`)  
**Auditor Mode:** Read-Only QA Engineer  
**Overall Verdict:** **Pass with fixes** (Type checking, unit tests, and production build PASS; linting requires Prettier fix; missing team images on `/about`).

---

## 1. Automated Verification Results

| Check | Command | Exit Code | Result | Evidence / Details |
|---|---|---|---|---|
| **Linting** | `npm run lint` | 1 | **FAIL** | 551 problems (544 Prettier formatting errors, 7 Fast Refresh warnings). Fixable via automated formatting. |
| **Unit & Routing Tests** | `npm run test` | 0 | **PASS** | 2 test suites passed, 16/16 tests passed (`src/test/request.test.ts`, `src/test/app-routing.test.tsx`). |
| **Type Check** | `npx tsc --noEmit` | 0 | **PASS** | 0 TypeScript errors across the entire codebase. |
| **Production Build** | `npm run build` | 0 | **PASS** | Vite production client + Nitro server built in 2.82s without errors. |

---

## 2. Code vs Database Verification

All Supabase calls across `src/` were audited against the Live Database Facts.

### Live Database Schema Conformance
- **`quotes` table**: Columns audited: `id`, `request_id`, `quote_number`, `approval_token`, `status`, `currency`, `subtotal`, `tax_percent`, `total`, `valid_until`, `terms`, `scope`, `timeline_days`, `customer_note`, `sent_at`, `responded_at`, `created_by`, `created_at`, `updated_at`.
- **Forbidden fields**: Browser code **never** writes `total`, `subtotal`, `status`, or `approval_token` on `quotes`. Updates only modify `scope`, `timeline_days`, `valid_until`, `tax_percent`, and `terms`.
- **`quote_items` table**: Columns audited: `id`, `quote_id`, `description`, `qty`, `unit_price`, `position`.
- **`requirements` table**: Columns audited: `id`, `request_id`, `title`, `description`, `category`, `priority` (`must` | `should` | `could`), `created_at`.
- **RPCs**:
  - Public: `submit_request(p)`, `track_by_token(t)`, `track_by_code(c, e)`, `get_quote(t)`, `respond_quote(t, decision, note)`, `submit_contact(p)`, `subscribe_newsletter(e)`.
  - Admin: `save_quote_items(qid, items)`, `send_quote(q uuid)`.
  - Legacy functions (`token_hash`, `get_quote_by_token`, `respond_to_quote`) and legacy statuses (`approved`, `rejected`): **None found** in Supabase calls or database mutations.

### Inventory of Supabase Calls in `src/`

1. **`src/components/layout/SiteFooter.tsx` (Line 57)**
   - Call: `supabase.rpc("subscribe_newsletter", { email: email.trim() })`
   - Purpose: Newsletter subscription.

2. **`src/hooks/use-auth.ts` (Lines 8, 12, 26-30, 51, 85)**
   - Calls: `supabase.auth.signInWithPassword(...)`, `supabase.auth.signOut()`, `supabase.auth.getSession()`, `supabase.auth.onAuthStateChange(...)`, `supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle()`.
   - Purpose: Authentication session management and RBAC.

3. **`src/routes/login.tsx` (Lines 86, 96-100)**
   - Calls: `signIn(email, password)` and `supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle()`.
   - Purpose: Authentication and deterministic post-login redirect.

4. **`src/pages/admin/QuoteEditor.tsx`**
   - Line 183-189: `supabase.from("quotes").select("id, request_id, quote_number, approval_token, status, currency, subtotal, tax_percent, total, valid_until, terms, scope, timeline_days, customer_note, sent_at, responded_at, created_at, requests(name, email, phone, request_code)").eq("id", id).maybeSingle()`
   - Line 190-194: `supabase.from("quote_items").select("id, quote_id, description, qty, unit_price, position").eq("quote_id", id).order("position", { ascending: true })`
   - Line 338-347: `supabase.from("quotes").update({ scope, timeline_days, valid_until, tax_percent, terms }).eq("id", id)` *(Guarded: no status, subtotal, total, or approval_token writes)*
   - Line 360-363: `supabase.rpc("save_quote_items", { qid: id, items: formattedItems })`
   - Line 393-395: `supabase.rpc("send_quote", { q: id })`

5. **`src/pages/QuoteApproval.tsx`**
   - Line 131-133: `supabase.rpc("get_quote", { t: token })`
   - Line 170-174: `supabase.rpc("respond_quote", { t: token, decision, note })` *(decision strictly `'accepted'` | `'declined'`)*

6. **`src/routes/admin.index.tsx` (Lines 209-235)**
   - Calls: `supabase.from("requests").select("id", { count: "exact", head: true })` (filtered by status values), and `supabase.from("requests").select("id, request_code, name, email, phone, service, status, created_at").order("created_at", { ascending: false }).limit(10)`.

7. **`src/routes/admin.messages.tsx` (Lines 101-105, 129-132)**
   - Calls: `supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100)` and `supabase.from("contact_messages").update({ status: "read" }).eq("id", id)`.

8. **`src/routes/admin.requests.$id.tsx`**
   - Line 396-400: `supabase.from("requirements").select("*").eq("request_id", id).order("created_at", { ascending: true })`
   - Line 419-423: `supabase.from("quotes").select("id, quote_number, status, total, currency, created_at").eq("request_id", id).order("created_at", { ascending: false })`
   - Line 443-447: `supabase.from("requests").select("*").eq("id", id).maybeSingle()`
   - Line 483-489: `supabase.from("quotes").insert({ request_id: id, created_by: user.id }).select("id").single()`
   - Line 538-546: `supabase.from("requirements").update({ title, description, category, priority }).eq("id", editingReq.id)`
   - Line 553-559: `supabase.from("requirements").insert({ request_id: id, title, description, category, priority })`
   - Line 580-584: `supabase.from("requirements").delete().eq("id", reqId)`
   - Line 603-606: `supabase.from("requests").update({ status: newStatus }).eq("id", id)`
   - Line 631-634: `supabase.from("requests").update({ assigned_to: user.id }).eq("id", id)`
   - Line 654-657: `supabase.from("requests").update({ internal_notes }).eq("id", id)`

9. **`src/routes/admin.requests.index.tsx` (Lines 178-186)**
   - Calls: `supabase.from("requests").select("id, request_code, tracking_token, name, email, phone, service, status, created_at", { count: "exact" })`.

10. **`src/routes/contact.tsx` (Lines 92-99)**
    - Calls: `supabase.rpc("submit_contact", { p: { name, email, phone, message } })`.

11. **`src/routes/request.tsx` (Lines 234-236)**
    - Calls: `supabase.rpc("submit_request", { p: mapToRpcPayload(values) })`.

12. **`src/routes/track.tsx` (Lines 248, 288-291)**
    - Line 248: `supabase.rpc("track_by_token", { t: token })`
    - Line 288: `supabase.rpc("track_by_code", { c: values.code.trim(), e: values.email.trim() })`

### Security & Isolation Audit
- **Route Duplication**: Verified exactly one route for `/admin/quotes/$id` (`src/routes/admin.quotes.$id.tsx`) and `/quote/$token` (`src/routes/quote.$token.tsx`).
- **Admin Guarding**: All `/admin/*` routes inherit `src/routes/admin.tsx` which checks session and role (`role === 'admin'`). Unauthenticated users are redirected to `/login`, non-admins to `/`. Furthermore, `QuoteEditor` is wrapped with `<RequireRole role="admin">`.
- **Public Data Leak Check**:
  - `internal_notes` and `assigned_to` appear **only** in `src/routes/admin.requests.$id.tsx`.
  - In `src/routes/track.tsx`, `normalizeTrackResponse()` strictly extracts only `request_code`, `code`, `status`, `service`, `service_type`, `created_at`, `updated_at`, and `quotes`. Neither `internal_notes` nor `assigned_to` are present or rendered on public tracking or quote pages.

---

## 3. Flow Trace & Behavioral Analysis

### 3.1 Request Form to `submit_request` (`src/routes/request.tsx`)
- **Flow**: 4-step wizard (Contact Info -> Service Area & Timeline -> Description & Deliverables -> Review & Submit). Validates against Zod schema before dispatching `submit_request` RPC.
- **Loading State**: Submit button displays spinning loader and "Submitting your project...". All navigation buttons disabled.
- **Error State**: Displays toast notification with the real error message. Automatically rolls back the wizard view to the specific step containing the invalid input.
- **Success State**: Displays a confirmation card with generated `request_code`, `tracking_token`, and a direct clickable tracking link. Persists `nexora_last_code` to `localStorage`. Includes a 1-click WhatsApp shortcut to start a chat with the engineering team.

### 3.2 Track Page (`src/routes/track.tsx`)
- **Flow**: Supports lookup via URL token parameter (`?token=...`) via `track_by_token(t)` or by manual code + email submission via `track_by_code(c, e)`.
- **Loading State**: Renders card with centered spinner: `"Looking up your project status..."`.
- **Empty / Null Result**: When RPC returns null, sets `notFound: true`. Displays an amber alert banner: `"We couldn't find a request with that code and email. Check both and try again."` The search form remains visible for retry.
- **RPC Error State**: Shows toast notification with the exact database error message.
- **Success State**: Renders project summary, 5-phase visual timeline stepper (Received -> Under review -> Consultation -> Quote ready -> Quote accepted), and associated quotes table with status badges and links to public quote approval pages.

### 3.3 Admin Request Detail (`src/routes/admin.requests.$id.tsx`)
- **Status Change**: Select dropdown triggers `handleStatusChange()`. Updates `requests.status`, displays toast `"Status updated to <label>"`, and refetches data.
- **Internal Notes**: Textarea with "Save Notes" button updates `requests.internal_notes` and displays toast `"Internal notes saved"`.
- **Assignment**: "Assign to me" / "Reassign to me" button sets `assigned_to: user.id` and displays toast `"Request assigned to you"`.
- **Requirements Tab**:
  - Table shows MoSCoW priority badge (`Must have`, `Should have`, `Could have`), title, category badge, and description.
  - "Add requirement" opens Dialog modal with title, priority select, category, and description inputs.
  - "Edit" icon pre-fills Dialog modal for updates.
  - "Delete" button opens AlertDialog confirmation before deleting the row.
  - All operations refetch requirements and display real error messages in toast upon failure.

### 3.4 Quote Editor (`src/pages/admin/QuoteEditor.tsx`)
- **Save Flow**: Form validates line items (qty > 0, unit price >= 0, tax percent 0–100). Updates `quotes` table with `scope`, `timeline_days`, `valid_until`, `tax_percent`, and `terms`. Calls `save_quote_items` RPC with formatted item objects. Refetches data.
- **Send Flow**: Requires at least one line item and all changes saved. Displays confirmation AlertDialog. When confirmed, calls `send_quote` RPC returning `approval_token`. Status transitions to `'sent'`.
- **Locked After Send**: When status is not `'draft'` (`sent`, `accepted`, `declined`), all inputs, item additions, deletions, save, and send controls are hidden or disabled.
- **Share Link Card**: Whenever status is not `'draft'`, displays the customer approval link (`${origin}/quote/${approval_token}`) with a "Copy Link" button and a green "Send on WhatsApp" button using `whatsappUrl()`.

### 3.5 Customer Quote Approval Page (`src/pages/QuoteApproval.tsx`)
- **RPC Calls**: Calls `get_quote(t)`. On approval/rejection calls `respond_quote(t, decision, note)` with `'accepted'` or `'declined'`.
- **Loading State**: Full-page skeleton with loading spinner and text `"Loading quotation details..."`.
- **Null Result**: Renders `"Quote Not Found"` screen with friendly error description and `"Return to Homepage"` button.
- **Network / RPC Error**: Renders `"Error Loading Quote"` alert card with the real database error message and a `"Try again"` button.
- **Active Quote (`sent`)**: Displays scope, timeline in days, line items table, subtotal, tax breakdown, total, terms, and valid until date. Includes decision note textarea (with 1000-character counter) and "Approve Quote" and "Decline Quote" action buttons.
- **Expired (`expired: true`)**: Amber banner `"This quote has expired on [Date]"`. Decision buttons disabled.
- **Accepted / Declined**: Green check banner for accepted quotes; red banner for declined quotes with decision timestamp and customer note if recorded.
- **Print**: "Print" button triggers native `window.print()` with `@media print` optimized CSS.

### 3.6 WhatsApp Helper Unit Check (`src/lib/whatsapp.ts`)

| Input | `normalizeWhatsApp(input)` | `whatsappUrl(input)` | Result |
|---|---|---|---|
| `"+91 63695 70661"` | `"916369570661"` | `"https://wa.me/916369570661"` | **PASS** |
| `"6369570661"` | `"916369570661"` | `"https://wa.me/916369570661"` | **PASS** |
| `"06369570661"` | `"916369570661"` | `"https://wa.me/916369570661"` | **PASS** |
| `"12345"` | `null` | `null` | **PASS** |
| `""` | `null` | `null` | **PASS** |
| `"abc"` | `null` | `null` | **PASS** |

---

## 4. Browser & DevTools Audit (Localhost:8080)

Tested at viewport widths **375px** (Mobile) and **1280px** (Desktop) in both **Light** and **Dark** color schemes.

| Route | Title / Redirect | Console Errors | Network 4xx/5xx | Horizontal Overflow | Floating Button Conflict | Missing Images | Status |
|---|---|---|---|---|---|---|---|
| `/` | From Your Idea to a Working Embedded Prototype... | None | None | None (`scrollWidth == clientWidth`) | None (single WA button) | None | **PASS** |
| `/services` | Our Services \| Nexora | None | None | None | None | None | **PASS** |
| `/projects` | Our Projects \| Nexora | None | None | None | None | None | **PASS** |
| `/about` | About Nexora \| Nexora | 3 404s (team images) | 3 failed (`/images/team/*.webp`) | None | None | 3 images (`arjun-kumar.webp`, `priya-sharma.webp`, `rahul-verma.webp`) | **FAIL** |
| `/contact` | Contact Us \| Nexora | None | None | None | None | None | **PASS** |
| `/faq` | Frequently Asked Questions \| Nexora | None | None | None | None | None | **PASS** |
| `/request` | Request a Service \| Nexora | None | None | None | None | None | **PASS** |
| `/track` | Track Your Project \| Nexora Technologies | None | None | None | None | None | **PASS** |
| `/track?token=fake_token_123` | Track Your Project \| Nexora Technologies | None | None | None | None | None (shows `"We couldn't find a request..."` alert) | **PASS** |
| `/login` | Log In \| Nexora | None | None | None | None | None | **PASS** |
| `/quote/abc123` | Project Quote \| Nexora Technologies | None | None | None | None | None (shows `"Quote Not Found"`) | **PASS** |
| `/admin` | Redirects to `/login` | None | None | None | None | None | **PASS** |

---

## 5. Owner Manual Testing Runbook

Follow these 5 steps in order to verify end-to-end integration with live database credentials:

### Step 1: Admin Authentication
1. Navigate to `http://localhost:8080/login`.
2. Sign in with your admin credentials.
3. **Expected Result**: Successfully redirected to `/admin` dashboard showing the Request Pipeline, pipeline status metric cards, and sidebar navigation.

### Step 2: Add Requirements to a Request
1. Click **Requests** in the admin sidebar (`/admin/requests`).
2. Open any active request by clicking on its row or **View**.
3. Select the **Requirements** tab.
4. Click **Add requirement**. Enter:
   - **Title**: `Low-power telemetry at 1Hz`
   - **Priority**: `Must have (Critical)`
   - **Category**: `Hardware`
   - **Description**: `Current consumption under 15mA in sleep mode.`
5. Click **Add requirement**.
6. **Expected Result**: Toast appears: `"Requirement added successfully"`. The new requirement appears in the table with a red `"Must have"` badge.

### Step 3: Create, Price, and Send a Quote
1. On the same request detail page, switch to the **Overview** tab.
2. In the **Quotes** card, click **Create quote**.
3. You will be redirected to `/admin/quotes/:id`.
4. Fill in:
   - **Scope of Work**: `Design, PCB fabrication, and firmware flashing for prototype.`
   - **Estimated Timeline**: `21` days.
   - **Valid Until**: Select a date 14 days from today.
   - **Tax Percent**: `18`.
   - **Line Items**: Add item: Description: `PCB Fabrication & Component Assembly`, Qty: `2`, Unit Price: `4500`.
   - **Terms**: `50% advance before component procurement, 50% upon demo.`
5. Click **Save Quote**. Verify live subtotal (₹9,000.00), tax (₹1,620.00), and total (₹10,620.00).
6. Click **Send quote to customer** and confirm the dialog.
7. **Expected Result**: Toast appears: `"Quote sent successfully!"`. The editor locks into read-only mode, and the **Share with Customer** card appears displaying the customer link and a **Send on WhatsApp** button.

### Step 4: Customer Approval (Private Window)
1. Copy the customer link (`http://localhost:8080/quote/<token>`) from the share card.
2. Open a new **Incognito / Private Window** and paste the URL.
3. Review the line items, subtotal, 18% tax, total, scope, and terms.
4. In the decision box, enter Note: `Approved. Please initiate procurement.`
5. Click **Approve Quote**.
6. **Expected Result**: Toast appears: `"Quote approved successfully!"`. The quote status transitions to a green banner: `"This quotation was approved on [Date]"` with your note recorded.

### Step 5: Verify on Track Page
1. In the private window, navigate to `http://localhost:8080/track`.
2. Enter the request code and email corresponding to the request.
3. Click **Track project**.
4. **Expected Result**:
   - The progress stepper advances to Step 5: **Quote accepted**.
   - The Quotes table lists the quote with an **Accepted** green badge and a link to view the signed quotation.
