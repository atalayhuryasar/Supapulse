# Project Brief: Supapulse (Supabase Keep-Alive Tool)

## 1. Project Overview
A lightweight, open-source heartbeat tool designed to solve the issue of Supabase free-tier projects being paused after 7 days of inactivity, by automatically keeping user projects alive.

## 2. Target Audience
* Developers hosting hobby projects, side-projects, or prototypes on Supabase.
* Anyone looking to avoid setting up separate GitHub Actions or complex cron scripts for every single project.

## 3. Core Value Proposition
* **Simplicity:** One-click project onboarding and automated background pinging.
* **Trust:** Full transparency regarding API keys and security through an open-source codebase.
* **Cost-Efficiency:** Built entirely on zero-cost infrastructure (Vercel + Supabase Free Tier).

## 4. Scope of Features
* **MVP (Minimum Viable Product) Features:**
  * Quick authentication via Supabase Auth (Google / GitHub).
  * User Dashboard: List of added projects and their last ping status.
  * Project Form: Input fields for Project Name, Supabase Project URL, and Anon/Service Key.
  * Cron Worker: An automated system executing a lightweight `GET` request to projects every 3 days (well within the 7-day limit).
* **Out of Scope (Excluded from V1):**
  * Discord / Telegram / Email notifications.
  * Paid subscriptions and billing integrations.
  * Advanced analytics and log charting.

## 5. Technical Stack
* **Framework / Frontend / Backend:** Next.js (App Router)
* **Database & Auth:** Supabase
* **Scheduler:** Vercel Cron Jobs
* **Hosting:** Vercel
* **Repository & License:** GitHub (Public / Open Source)

## 6. Success Criteria
* The system reliably pings registered projects at regular intervals, successfully preventing Supabase from pausing them.
* The codebase remains clean, readable, and easy for the developer community to inspect, fork, or self-host.