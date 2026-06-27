# Scholarship Tracker POC

This repository contains the source code and documentation for the Scholarship Tracker POC.

## Project Structure

- **[scholarship-app/](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/scholarship-app)**: **Active Main Project**. This is the Next.js 15 application where all active development, programmatic SEO pages, SQLite database integration, and analytics integration reside.
- **[v2/](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/v2)**: **Inactive/Deprecated Prototype**. This folder only contains the initial repository code version and is not being updated.
- **[html-prototype/](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/html-prototype)**: **Static HTML prototypes** used for reference layout testing.
- **[docs/](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/docs)**: Core project architecture handovers, data schemas, SEO strategies, platform generalization play, and onboarding advice.

## 📚 Architecture & Handover Documentation

For a deep-dive technical overview of the platform, data schema, SEO strategy, and future scaling plans, refer to the following documents:

* **[Architectural Handoff Overview](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/docs/ChatGPT_Research_Architectural_Handoff_2026-06-27.md)**: Product vision, user personas, Next.js folder responsibility, data flow diagrams, sitemaps, and dynamic route listings.
* **[Data, SEO & Content Architecture](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/docs/ChatGPT_Research_Data_SEO_Content_2026-06-27.md)**: SQLite database schema, denormalization reasons, programmatic metadata rendering rules, internal linking algorithms, and Gemini Google Grounding research pipelines.
* **[Platform Generalization Proposal](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/docs/ChatGPT_Research_Platform_Generalization_2026-06-27.md)**: Redesign strategy for transforming the site into a multi-tenant generic directory platform (Colleges, Schemes, Jobs, Finance) using polymorphic schemas.
* **[ChatGPT Onboarding Advice](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/docs/ChatGPT_Research_ChatGPT_Onboarding_Advice_2026-06-27.md)**: Instructions, pitfalls (write-locks, build memory), reservation taxonomy specifics, and developer onboarding pointers.

## Running the Active Project

To run the active application locally:
```bash
cd scholarship-app
npm install
npm run dev
```
