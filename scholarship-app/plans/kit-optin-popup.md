# Email opt-in popup (Kit free plan)

## Goal
Show a Kit signup popup on the public site so visitors can join our email list. Keep it mobile-safe so Google doesn't penalize us. Use free tools only.

## Before the agent starts (owner does this, not the agent)
1. Create a free Kit account at kit.com.
2. In Kit, go to **Grow → Landing Pages & Forms → Create → Form**, pick **Modal** (or **Slide-in**), and set it up like this:
   - **Show on:** "Exit intent" on desktop, or "After scrolling 50%". **Never** "On page load".
   - **Mobile:** turn the modal off on mobile, or use **Slide-in**/**Sticky bar** for mobile.
   - **Don't show again:** 7+ days after someone closes it, and never to people who already subscribed.
   - **Wording idea:** "Get new scholarships and closing dates in your inbox. Free, weekly."
3. In Kit, click **Publish → JavaScript**. You'll get a script like
   `<script async data-uid="abc123" src="https://yourname.kit.com/abc123/index.js"></script>`.
   Put these two values in `.env.local` **and** in the Vercel project settings (the agent must not do this):
   - `NEXT_PUBLIC_KIT_FORM_UID="abc123"`
   - `NEXT_PUBLIC_KIT_FORM_SRC="https://yourname.kit.com/abc123/index.js"`

## Files to change
- `app/components/KitPopup.tsx` — **new**. Loads the Kit script. Nothing else.
- `app/layout.tsx` — render `<KitPopup />` inside `<body>`, after `{children}`.
- `env.template` — add the two empty variables with a comment. (This file already has uncommitted edits for the assistant. Leave those as they are and only add below them.)
- `app/privacy/page.tsx` — add a short "Email newsletter" paragraph: we use Kit to store subscriber emails, and every email has an unsubscribe link.

## Steps
1. Create `app/components/KitPopup.tsx` as a client component (`'use client'`):
   - Read `process.env.NEXT_PUBLIC_KIT_FORM_UID` and `NEXT_PUBLIC_KIT_FORM_SRC`. If either is empty, return `null`. The site must work fine with no Kit keys.
   - Use `usePathname()` from `next/navigation`. Return `null` when the path starts with `/admin`, `/api` or `/assistant`.
   - Otherwise render `next/script` with `strategy="lazyOnload"`, `src={SRC}` and `data-uid={UID}`. Give it an `id` like `kit-popup`.
2. In `app/layout.tsx`, import it and add `<KitPopup />` right after `{children}`. Change nothing else in the layout.
3. Add to `env.template`:
   ```
   # Kit email popup (free plan). From Kit → form → Publish → JavaScript
   NEXT_PUBLIC_KIT_FORM_UID=""
   NEXT_PUBLIC_KIT_FORM_SRC=""
   ```
4. Add the privacy paragraph. Match the style of the page's existing sections.

## Do NOT
- Don't build a custom popup UI. The popup design and trigger rules live in Kit.
- Don't touch `app/api/subscribe/route.ts` or `app/components/SubscribeForm.tsx` (old Google Sheets flow, handled separately).
- Don't add any npm packages.

## How to check it works
- `npx tsc --noEmit` and `npm run lint` pass.
- With the Kit variables empty: `npm run dev` shows the site as before, and no request goes to `kit.com` in the browser Network tab.
- With the variables set: on an article page, the popup appears after scrolling or on exit intent (depending on the Kit settings), and not immediately. It never appears on `/admin`.
- Mobile (browser dev tools, iPhone size): no full-screen popup covers the article.

## Later (not this plan)
- Import existing alert subscribers from the Google Sheet "Subscribers" tab into Kit (CSV export → Kit import, done by the owner).
- Newsletter agent in the Agent Center that drafts the weekly email for approval.

## Questions

## Done
Antigravity stopped (headless mode could not get command permission), so Claude built it directly.
- Added `app/components/KitPopup.tsx`, rendered in `app/layout.tsx`; hidden on /admin, /api, /assistant; does nothing without the Kit variables.
- Added the Kit variables to `env.template` and an "Email Newsletter" section to the privacy page.
- `npx tsc --noEmit`: only stale `.next/types` cache errors, none in source. ESLint: new code clean; the privacy page's existing apostrophe errors predate this change.
- Local check without keys: the site renders, no kit.com script, no console errors. The popup itself gets tested on the Vercel PR preview.
