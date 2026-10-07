# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-10-07

### 🚀 Added
- **In-Place Project Editing:** Edit project names, Supabase project URLs, Anon Public Keys, target tables, and webhook configurations anytime without deleting.
- **Detailed Pulse Logs & Health History:** Modal displaying complete pulse telemetry, overall success rate (%), average latency (ms), HTTP status codes, and error traces.
- **Shields.io-Compatible Dynamic Status Badges:** Public live SVG badge endpoint (`/api/projects/[id]/badge`) ready for GitHub `README.md` embedding with one-click markdown copy.
- **Automated Failure Alert Webhooks:** Instant Discord rich embeds, Slack alerts, and generic JSON webhooks dispatched automatically whenever a heartbeat pulse fails, with an in-modal test button.
- **Batch "Pulse All Projects" Tool:** One-click pulse trigger on the dashboard to test all active projects in sequence with live progress indication.
- **Real-Time Search & Status Filters:** Instant search bar filtering by project name, table, or URL, plus quick filter tabs (*All*, *Active*, *Paused*, *Failing*) with badge counts.
- **GitHub Actions CI/CD:** Automated `.github/workflows/ci.yml` pipeline validating build and TypeScript type-checking on PRs and merges.
- **Next.js 16 Proxy Migration:** Migrated deprecated `src/middleware.ts` to the recommended Next.js 16 `src/proxy.ts` convention.

### 🎨 Changed
- **Dashboard & Card Redesign:** Widened grid to a spacious 2-column layout (`grid-cols-1 lg:grid-cols-2`), eliminating button clutter and preventing project title / URL truncation.
- **Dedicated Card Action Footer:** Reorganized action buttons into a clean footer grouping secondary tools on the left and primary `Ping Now` CTA on the right.
- **Multi-Language Support (i18n):** Added Turkish and English localization strings for all new modal, filter, search, and batch actions.

---

## [0.1.1] - 2026-10-06

### 🚀 Added
- **Dedicated Heartbeat RPC Strategy:** Gold-standard, zero-privilege `public.supapulse_heartbeat()` SQL function for 100% pause prevention without table exposure.
- **AI Agent Integration Guides:** Comprehensive `AGENT_GUIDE.md` and `AGENT_GUIDE.tr.md` featuring 1-click prompts for Cursor, Windsurf, and Claude Code.
- **Custom Target Table Configuration:** Support for custom schema tables (`todos`, `profiles`, `products`) with automatic fallback to common table probing.

---

## [0.1.0] - 2026-09-30

### 🚀 Added
- Initial release of Supapulse.
- Daily automated cron worker via Vercel Cron.
- Multi-layered ping strategies (PostgREST table read, Kong API Gateway OPTIONS, GraphQL probe, GoTrue Auth probe).
- OAuth and Magic Link authentication with Supabase SSR and Row Level Security (RLS).
- Interactive dashboard with manual test pulses, latency tracking, and uptime history bars.
