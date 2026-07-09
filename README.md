# Pipeline CRM — React Migration

A React (Vite) + TypeScript port of the original vanilla HTML/CSS/JS CRM
dashboard. **The visual design was not changed.** Every color, spacing
value, animation, and responsive breakpoint from the original build is
preserved exactly — this phase is a structural migration, not a redesign.

## Tech Stack

- **React 19 + Vite** — build tooling and dev server
- **TypeScript** — strict mode, path-aliased imports (`@/...`)
- **Tailwind CSS v4** — configured and wired in (see "Why the original CSS
  wasn't rewritten" below)
- **React Router v7** — client-side routing, role-guarded routes
- **React Hook Form** — form state/validation (New Lead, New Campaign,
  Settings profile forms)
- **TanStack Query** — installed and provisioned at the app root, ready for
  Phase 2 when Supabase queries replace the local repository functions
- **Recharts** — installed, ready for new charts (see note below on why the
  two existing charts were *not* migrated to it)
- **Supabase JS client** — scaffolded, currently inactive (see "Data layer"
  below)

## Getting Started

```bash
npm install
cp .env.example .env.local   # already done for you with mock-data defaults
npm run dev
```

Open http://localhost:5173. The app runs entirely on mock/local data out of
the box — no Supabase project is required to develop against it.

```bash
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
```

## Folder Structure

```
src/
├── components/
│   ├── ui/            # Button, Card, Table, Modal, Drawer, ScoreRing,
│   │                   StatusBadge, SourceChip, KpiCard — generic,
│   │                   reusable, no business logic
│   ├── layout/         # Sidebar, Topbar, GlobalSearch, AppLayout
│   ├── leads/          # LeadTableRow, LeadsDirectoryTable, LeadDrawer,
│   │                   NewLeadModal, ActivityTimeline
│   ├── campaigns/      # CampaignsTable, CampaignsKpis, NewCampaignModal
│   ├── dashboard/      # KpiGrid, FunnelChart, SourceDonut, Leaderboard,
│   │                   RecentLeadsCard — composed dashboard widgets
│   ├── analytics/      # MonthlyVelocityChart, SlaGauge
│   └── integrations/   # IntegrationCard
├── context/            # One React Context per concern: Theme, Toast,
│                       Role (RBAC), Leads, Campaigns, Notifications,
│                       Overlays (drawer/modal visibility)
├── lib/
│   ├── repositories/   # leadsRepository, campaignsRepository,
│   │                   notificationsRepository — see "Data layer" below
│   ├── supabaseClient.ts
│   ├── constants.ts    # ROLES, NAV_ROLE_MAP, SOURCE_LABELS/COLORS, etc.
│   ├── mockData.ts     # mock generators, ported verbatim from app.js
│   ├── format.ts        # timeAgo, scoreRingColor, statusLabel
│   └── campaignMath.ts
├── pages/              # One component per route: DashboardPage,
│                       LeadsPage, CampaignsPage, AnalyticsPage,
│                       IntegrationsPage, NotificationsPage, SettingsPage
├── routes/
│   └── RoleGuardedRoute.tsx
├── types/              # Lead, Campaign, AppNotification, RoleDefinition
├── legacy-dashboard.css  # the original stylesheet, unmodified (see below)
├── index.css           # Tailwind entry point, imports legacy-dashboard.css
├── App.tsx             # provider tree + router
└── main.tsx
```

## Architectural Decisions

### Why the original CSS wasn't rewritten into Tailwind utilities

The brief was explicit: preserve colors, spacing, animations,
responsiveness, and layout exactly. The original `styles.css` (671 lines)
is a mature, hand-tuned stylesheet — a custom "Score Ring" component,
status-color semantics, dark mode via `[data-theme]`, specific
cubic-bezier-free transition timings, etc. Rewriting all of that into
Tailwind's utility classes on day one of a migration is where visual
regressions creep in silently (a shadow half a pixel off, a transition
duration rounded to the nearest Tailwind step) — for zero functional
benefit, since Tailwind and a plain stylesheet coexist perfectly fine.

So: the file was renamed to `legacy-dashboard.css`, imported unmodified
after Tailwind's own import, and **is the source of truth for every
existing visual**. Tailwind is fully configured and available (see
`vite.config.ts` — `@tailwindcss/vite` — and `index.css`) for any *new* UI
built from here forward. This is the standard "strangler fig" approach to
migrating a stylesheet: bring the old one over intact, grow the new system
around it, and only port pieces into the new system when they're touched
for a real reason (a redesign, not a migration).

The one exception: `.form-error` was added (see the comment in
`legacy-dashboard.css`) because React Hook Form introduces validation
state the original inline-only vanilla form didn't have. It reuses the
existing `--status-danger` token rather than inventing a new color.

### Why the two hand-rolled charts weren't ported to Recharts

Recharts is installed and wired in — genuinely the right tool for any new
chart in this app going forward. But the existing "Monthly Lead Velocity"
bar chart and "SLA Performance" gauge are original, pixel-tuned CSS/SVG
(see `components/analytics/`). Re-implementing an *existing*, already-
correct visual in a charting library changes its rendering and transition
behavior for no functional gain, which is exactly what the "do not
redesign" instruction rules out. They're ported as direct, typed
translations of the original render functions instead.

### Data layer: the Repository pattern (this is the Supabase on-ramp)

Every entity (Leads, Campaigns, Notifications) has a **repository module**
in `src/lib/repositories/`. Contexts (`LeadsContext`, etc.) never touch
`localStorage` or the Supabase client directly — they only call repository
functions like `fetchLeads()`, `insertLead()`, `updateLeadRecord()`.

Each repository function has exactly one branch point:

```ts
if (isSupabaseConfigured && supabase) {
  // real Supabase query
} else {
  // localStorage, matching the original app.js behavior exactly
}
```

`isSupabaseConfigured` is true only when `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` are set **and** `VITE_USE_MOCK_DATA` isn't
`"true"`. The `.env.local` shipped in this ZIP sets mock mode on, so the
app runs immediately without any backend.

**This is deliberate scope control, not an oversight**: Supabase's actual
`leads` / `campaigns` / `notifications` tables and RLS policies don't exist
yet — that's Phase 2. Wiring live queries against a schema that doesn't
exist would mean shipping code that's guaranteed to fail. The Supabase
branches are already written and typed against the same `Lead` /
`Campaign` / `AppNotification` interfaces the mock branch uses, so
Phase 2 is "create the schema + turn mock mode off," not "rewrite the
data layer."

### RBAC (Role-Based Access Control)

Ported from the original app.js's role-switcher demo exactly:

- **Admin** — full access everywhere
- **Manager** (Priya Menon) — sees only her team's leads (`Rahul K.`,
  `Sneha M.`), read-only Campaigns, no Settings
- **Sales Executive** (Rahul K.) — sees only his own leads, can't reassign
  or delete, no Campaigns/Integrations/Settings access

The enforcement happens in two places, matching the original's stated
principle that a role check on a menu item is UX only, never the real
boundary:

1. `LeadsContext.scopedLeads` — every page reads leads through this
   computed value, filtered by role, not the raw list.
2. `RoleContext.canManageLead()` — an independent second check inside
   `LeadDrawer`, so even a lead ID reached some other way (e.g. a stale
   link) is still blocked.

`RoleGuardedRoute` is the router-level version of the same idea — reaching
`/settings` directly as a non-Admin redirects to `/dashboard` rather than
rendering the page.

**Important**: this is a client-side simulation for demo purposes (role is
just a `localStorage`-persisted value anyone can flip in the UI). Once
Supabase Auth is wired in (Phase 2), real authorization has to move to
Postgres Row-Level Security policies keyed off the authenticated user —
client-side role state can inform the UI, but must never be the actual
security boundary once there's a real backend.

## Environment Variables

See `.env.example`. Copy it to `.env.local` and fill in real values when
Phase 2 (Supabase schema + auth) is ready:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_USE_MOCK_DATA=false   # flip this off once the schema exists
```

## What's Next (Phase 2 candidates)

1. Design the Supabase schema (`leads`, `campaigns`, `notifications`,
   `profiles`) + RLS policies matching the RBAC rules above.
2. Supabase Auth (replacing the demo role-switcher with real sign-in).
3. Turn `VITE_USE_MOCK_DATA` off and validate each repository's Supabase
   branch against the real schema.
4. Meta/Google Ads/WhatsApp webhook ingestion — likely a small serverless
   function in front of Supabase, since those need server-side signature
   verification Supabase's client SDK alone doesn't provide.

Waiting for your go-ahead before starting any of the above.
