# 🤖 Supapulse AI Agent Instructions & Prompts

> **For Users Developing with AI:** Copy and paste the prompts below directly into your AI coding agent (**Cursor, Windsurf, Claude Code, GitHub Copilot, Antigravity, v0, Bolt**) to automate both project integration and self-hosted deployment without touching code.

---

## ⚡ Prompt 1: Connect Your Existing Project to Supapulse

Use this prompt in your existing project repository to have your AI agent automatically install the zero-privilege heartbeat RPC and retrieve your connection keys.

### 📋 Copy & Paste Prompt for Cursor / Claude / Windsurf:

```text
You are an expert full-stack engineer and Supabase specialist.
Your task is to configure this repository so it can be monitored and kept alive 24/7 by Supapulse (an open-source Supabase keep-alive engine) without ever pausing.

Follow these strict steps:

1. Create a Supabase Database Migration (or execute via Supabase CLI / SQL editor) with the following dedicated, zero-privilege heartbeat RPC function:

CREATE OR REPLACE FUNCTION public.supapulse_heartbeat()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 'pulse_ok';
$$;

GRANT EXECUTE ON FUNCTION public.supapulse_heartbeat() TO anon, authenticated;

2. Inspect the local environment files (`.env`, `.env.local`, `.env.development`, or Supabase config):
   - Find the Project URL (`NEXT_PUBLIC_SUPABASE_URL` or equivalent).
   - Find the Anon Public Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY` or `sb_publishable_...`).
   - DO NOT expose or touch the `SUPABASE_SERVICE_ROLE_KEY` (service_role secret key must NEVER be shared).

3. Output a clear summary in this exact format:
   - Supapulse Status: Ready for connection
   - Project Name: [Project Name]
   - Supabase URL: [URL found]
   - Anon Public Key: [Anon Key found]
   - Next Action: Copy these values and paste them into Supapulse (https://supapulse.huryasar.com) to start automated daily heartbeat pulses!
```

---

## 🚀 Prompt 2: Zero-Code Self-Host & Deploy Supapulse

Use this prompt with an autonomous terminal or coding agent (**Claude Code, Antigravity, Cursor Agent, Terminal Agents**) to deploy a private instance of Supapulse from scratch on Vercel and Supabase.

### 📋 Copy & Paste Prompt for Autonomous Agents:

```text
You are an autonomous DevOps and cloud deployment engineer.
Your task is to fully deploy an instance of Supapulse (open-source Supabase keep-alive monitor) for me on Vercel and Supabase with zero manual coding.

Follow this exact execution plan:

1. Repository Setup:
   - If not already in the repository, clone it: `git clone https://github.com/atalayhuryasar/Supapulse.git` and enter the directory: `cd Supapulse`.
   - Install dependencies: `npm install`.

2. Supabase Database Migration:
   - Access my Supabase project (via Supabase CLI, Management API, or SQL editor).
   - Run the complete database schema from `supabase_schema.sql`.
   - Ensure `projects` and `ping_logs` tables, RLS policies, triggers, and `GRANT ... TO service_role, authenticated` permissions are applied.

3. Environment Variables & Security:
   - Generate a secure random secret for `CRON_SECRET` (e.g. `openssl rand -hex 24`).
   - Configure `.env.local` and Vercel Project Environment Variables:
     - `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Public Key
     - `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Secret Key (Required for the background cron worker)
     - `CRON_SECRET`: The generated random secret
     - `NEXT_PUBLIC_SITE_URL`: Production domain URL

4. Validation & Deployment:
   - Run type checks and build test: `npm run build`.
   - Deploy to Vercel via Vercel CLI: `vercel --prod` (ensuring environment variables are attached to Production environment).
   - Verify that Vercel Cron is active (`/api/cron/ping` on daily schedule `0 4 * * *`).

5. Report back with:
   - Deployed Live URL
   - Status of Database & Cron Worker
   - Instructions to open the dashboard and add the first monitored project!
```
