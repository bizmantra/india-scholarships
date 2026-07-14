- `[x]` Install `@libsql/client` dependency
- `[x]` Configure local credentials in `.env.local`
- `[x]` Create and run the database push-to-turso script
- `[x]` Rewrite `lib/db.ts` to use `@libsql/client`
- `[x]` Update pages and API routes using `getDatabase()`
- `[x]` Verify local build and runtime stability

---

## 📋 Backlog Tasks

- [ ] **Google Sheets Integration Enhancements**
  - Add `Audit Issue Count` and `Audit Issues List` columns to the spreadsheet.
  - Update `sync-to-google-sheets.js` to automatically sync database validation issues back to Google Sheets.
- [ ] **Notion Integration Enhancements**
  - Connect Quality Audit results directly to your Notion Inventory database columns (e.g. show warning tags on affected pages).
  - Streamline task pipeline board in Notion for seamless status tracking (Draft -> Verified -> Live) without using AI credits.
- [ ] **Admin Dashboard UI Upgrades**
  - Show warning lists and "Fix" shortcuts inside the local Next.js `/admin/content-manager` dashboard.
- [ ] **Build Time Optimization (ISR Integration)**
  - Implement Incremental Static Regeneration (ISR) for scholarship detail pages and subpages to reduce Vercel build times from 15+ minutes to under 2 minutes.
  - Modify `generateStaticParams` across routes to return only top/popular opportunities, allowing the rest to build on-demand.

