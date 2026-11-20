# Local Backlog & Kanban Board Guide

We have migrated project tracking away from Notion to a local, offline system embedded directly in the repository. This page serves as technical documentation for referencing and configuring this system.

---

## 📂 Architecture & Files

The backlog system consists of local file databases, an API controller layer, a visual dashboard frontend, and a Model Context Protocol (MCP) server bridge.

1. **Backlog JSON Databases**:
   - `data/backlog-dev.json`: Master database for developer tasks (ID pattern: `IS-[Number]`).
   - `data/backlog-content.json`: Master database for content/grounding tasks (ID pattern: `CNT-[Number]`).
   - `data/backlog-articles.json`: Master database for editorial article publishing (ID pattern: `ART-[Number]`).
2. **Backlog Markdown Mirrors**:
   - `data/backlog-dev.md`: Markdown task list format compiled automatically from the dev JSON.
   - `data/backlog-content.md`: Markdown task list format compiled automatically from the content JSON.
   - `data/backlog-articles.md`: Markdown task list format compiled automatically from the articles JSON.
3. **Local Dashboard**:
   - `data/dashboard.md`: Compiled session-start dashboard summarizing active key metrics, in-progress tasks, and upcoming backlogs.
4. **Interactive Command Center Page**:
   - URL: `/admin/backlog` (corresponds to Next.js route: `app/admin/backlog/page.tsx`).
5. **Backlog Backend Controller**:
   - API Route: `/api/admin/backlog` (corresponds to Next.js route: `app/api/admin/backlog/route.ts`). Handles task CRUD operations and saves updates.

---

## 🛠 Next.js Kanban Interface (`/admin/backlog`)

The admin board lets you visually manage your task boards using standard columns:
- **Backlog**: Tasks that are not yet started.
- **In Progress**: Active tasks currently in development or research.
- **Done**: Completed tasks.
- **Parked**: Deferred or cancelled tasks (e.g. paused features).

You can add new tasks (assigning Title, Description, Impact (Critical, High, Medium, Low), and tags/types), edit task values, delete tasks, and shift tasks between columns using quick arrow buttons.

---

## 🔌 Connecting AI Assistants (Claude Desktop MCP)

To allow desktop AI assistants (like Claude Desktop) to view and write to this local backlog during chat sessions, we use a Model Context Protocol (MCP) server configuration.

### Configuration Steps:
1. Open the Claude Desktop configuration file on your Mac:
   `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Add the `mcpServers` setting with the filesystem server configured to allow access to the project directory:
   ```json
   {
     "mcpServers": {
       "filesystem": {
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-filesystem",
           "/Users/roshankumar/Desktop/Schlarship Tracker /Scholarship-Tracker-POC-antigravity"
         ]
       }
     }
   }
   ```
3. Completely **Quit** and **Reopen** Claude Desktop to reload the tools.
4. In chats, you can now instruct the AI: *"Add a task to my local dev backlog for building the search bar"* or *"List active tickets in the backlog"*.

---

## 🕐 Session Dashboard Refreshes

The session-start dashboard script has been refactored to bypass Notion. At the start or end of a session, run:
```bash
node scripts/update-notion-dashboard.js
```
This reads your local backlog databases and compiles a fresh project summary to **`data/dashboard.md`**. If Notion environment credentials are set up, it will silently attempt to mirror the dashboard blocks to Notion, but defaults gracefully to the local version if the cloud API fails or is inactive.
