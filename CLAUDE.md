# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # start dev server (localhost:3000)
npm run build             # prisma generate && next build — always run before shipping a change
npx tsc --noEmit           # typecheck only, much faster than a full build
npm run seed               # tsx prisma/seed.ts — idempotent, only inserts records that don't already exist
npm run lint                # next lint (not wired into build; run manually if touching JS/TS broadly)
```

There is no test suite (no `test` script, no test framework installed). Correctness is verified via `tsc --noEmit`, `npm run build`, and manual/Playwright QA against a disposable local MongoDB — see "Local development" below. Never run destructive checks against production data.

### Local development

MongoDB via Prisma requires a replica set even for a single local instance (Prisma uses transactions). A disposable throwaway setup:

```bash
docker run -d --rm --name fofora-mongo -p 27017:27017 mongo:7 --replSet rs0 --bind_ip_all
docker exec fofora-mongo mongosh --quiet --eval 'rs.initiate()'
# rs.initiate() advertises the container hostname, which isn't resolvable from outside Docker — repoint it:
docker exec fofora-mongo mongosh --quiet --eval 'cfg = rs.conf(); cfg.members[0].host = "127.0.0.1:27017"; rs.reconfig(cfg, {force:true})'
```

Then a `.env.local` with `DATABASE_URL="mongodb://localhost:27017/fofora?replicaSet=rs0"`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL="http://localhost:3000"`, and `ADMIN_DEFAULT_PASSWORD` (used by the seed script for the admin login) is enough to run `prisma db push`, `npm run seed`, and `npm run dev`. R2 env vars (see `.env.example`) are only needed to exercise file upload/delete; other features work without them. Tear the container down and delete `.env.local` when done — never point local runs at the production `DATABASE_URL`.

## Architecture

**Every public page is a client component** (`'use client'`) that fetches its own data from internal `/api/*` routes on mount — there are no server components fetching data and no `getServerSideProps`-equivalent. This means every public page briefly renders its hardcoded fallback constants (e.g. `samplePosts`, `fallbackServices` in `app/page.tsx`) before the fetch resolves and swaps in real data. Fallbacks exist so a freshly-cloned/empty database never shows a broken page; keep this pattern in mind when a "content flashes then changes" report comes in — it's inherent to how these pages fetch, not a one-off bug.

**Content model, end to end**: nearly every content type follows the same triangle — a Prisma model in `prisma/schema.prisma`, a REST-ish route in `app/api/<name>/route.ts` (GET public, POST/PUT/DELETE gated by `getServerSession(authOptions)`), and a management page in `app/admin/<name>/page.tsx`. Before wiring a public page to a new field, always check whether the admin page can already set it — several `SiteSettings` fields (`sectionVisibility`, `sectionOrder`, `navigation`, `heroVideoRandomPlay`, `heroVideoClickToNext`) have admin UI to configure them without the public homepage ever reading them back. Don't assume a field being editable in admin means it's live; verify by grepping `app/page.tsx` and the relevant public page for the field name.

**Homepage composition** (`app/page.tsx`) batches nearly every fetch it needs into one `Promise.allSettled([...])` in a single effect, then derives per-section data with `useMemo`/inline fallback ternaries (`realData.length ? realData : demoData`). `SiteSettings.homepageContent` (a free-form JSON blob) supplies the admin-editable section titles/labels that also drive the navbar (`components/SiteHeader.tsx` fetches `/api/settings` separately for this) and back-links on detail pages — renaming a section there is expected to cascade to the nav label, the homepage heading, and any "back to X" link simultaneously.

**The homepage's desktop CSS (`app/globals.css`) is a "one-screen" layout**: at `(min-width:901px) and (min-aspect-ratio:4/3)` the entire homepage is forced into a single non-scrolling `100svh` CSS Grid (`body:has(>.site-shell){overflow:hidden}`), with every section's row height a fixed percentage of viewport height. This has been re-tuned iteratively and the file has **four separate, overlapping copies** of this same media query (plus a `(min-width:1200px)` variant) accumulated from past redesign passes — for a given selector+property, whichever occurrence sits *last* in the file wins the cascade, not whichever seems most relevant. When adjusting sizing/spacing in this breakpoint, don't assume editing the first match you find changes what actually renders — grep for every occurrence of the selector and check source order, or just measure the live result (`getComputedStyle`) rather than reasoning from the CSS alone. A narrower/portrait viewport (`(min-width:901px) and (max-width:1199px)`, or any aspect ratio ≤4/3) instead gets a normal scrolling flow layout — changes tuned for the one-screen grid don't apply there and vice versa.

**Media storage**: uploads go to Cloudflare R2 via `lib/r2.ts` (`uploadToR2`/`uploadImageToR2`), and deletes should go through `safeDeleteR2Url(url)` (swallows errors, checks the URL actually belongs to the configured R2 bucket/CDN before attempting delete). Not every model's DELETE route calls this — check each one rather than assuming deletion is symmetric with upload.

**Auth**: NextAuth with a single `CredentialsProvider` (email/password against `User`, bcrypt-hashed) and JWT sessions; `app/admin/layout.tsx` is the shared authenticated shell (sidebar nav + mobile drawer) and individual admin pages don't re-check auth themselves — the API routes are the actual enforcement boundary (`getServerSession(authOptions)` per handler).

**`/yeni/*` routes**: nearly every public route has a `/yeni/<same-path>` mirror that just re-exports the same page component (`export { default } from '../../<path>/page'`). Pages detect this via `usePathname().startsWith('/yeni')` and prefix internal links accordingly (a `base` variable threaded through). When adding a new public page, add its `/yeni` mirror stub too.

**Turkish throughout**: all user-facing copy, admin labels, and commit-visible content strings are Turkish — match this in any new UI text.
