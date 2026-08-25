# Handover

Everything needed to run Aravo from the client's own accounts. Written to be
followed in order: each step assumes the one before it is done.

No secret values appear in this file. Where a value is needed, it says which
dashboard to read it from.

## What there is

| Part | Repository | Runs on | What it is |
| --- | --- | --- | --- |
| Website | `aravo-labs/Aravo-website` | Vercel | The public site |
| Admin | `aravo-labs/aravo-website-admin` | Vercel | Where all content is written |
| Backend | `aravo-labs/Aravo-website-backend` | Render | FastAPI, one service |
| Data | — | Supabase | Postgres, auth accounts, file storage |

The three applications meet only at the backend's HTTP contract. The website
and the admin panel share no code and no origin: the admin is a separate
application behind a login, so nothing about it ships in the bundle anonymous
visitors download.

**Content is not in the repositories.** Pages, platforms, documentation,
banners, roles, the company name, the logo, the social links and the policies
all live in the database and are written in the admin panel. Publishing does
not need a deploy.

## Who has to do what

Two people are needed, because some steps can only be taken by an owner of the
`aravo-labs` GitHub organisation and of the receiving accounts.

- **Client** — creates the hosting accounts, approves GitHub access, receives
  the Supabase project, owns billing and the domain.
- **Studio** — supplies the environment values, runs the cutover, verifies, and
  decommissions the old deployments afterwards.

---

## 1. Accounts to create

The client creates, and is the owner of:

- **Vercel** — a team (two projects will live in it: website and admin)
- **Render** — an account (one web service)
- **Supabase** — an organisation, to receive the existing project

The GitHub organisation already exists and already holds all three
repositories.

## 2. Give the hosts access to the repositories

This is the step that blocks everything else, and only a GitHub organisation
owner can do it.

- Install the **Vercel GitHub App** on `aravo-labs`, granting access to
  `Aravo-website` and `aravo-website-admin`.
- Install the **Render GitHub App** on `aravo-labs`, granting access to
  `Aravo-website-backend`.

Until this is done, neither host can see the repositories at all — they will
not appear in the "import repository" list.

## 3. Deploy the backend

Render → New → Blueprint → select `aravo-labs/Aravo-website-backend`.

The repository contains `render.yaml`, so the service, its region, its health
check and its start command are all read from the file rather than typed into
a form. Render will prompt for the values marked `sync: false`; take them from
the current service's Environment tab.

| Variable | What it is |
| --- | --- |
| `SUPABASE_URL` | The project URL |
| `SUPABASE_SERVICE_KEY` | Service-role key. Server-side only |
| `SUPABASE_ANON_KEY` | Publishable key |
| `DATABASE_URL` | Postgres connection string. **The password must be URL-encoded** |
| `SETTINGS_ENCRYPTION_KEY` | Encrypts the stored SMTP password |
| `CORS_ORIGINS` | The site and admin origins, comma separated, no wildcard |
| `ADMIN_APP_URL` | The admin origin. Invitation and reset links are built from it |

Everything else in the blueprint has a value already and needs no input.

Two things to know:

- `preDeployCommand` runs the database migrations before the new version takes
  traffic. **It is a paid-plan feature.** On the free plan, delete that line
  and change the start command to
  `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`,
  or the schema will fall behind the code that expects it.
- `DATABASE_URL` is the single most common thing to get wrong. A password
  containing `@` or `#` must be percent-encoded, or the driver reads the host
  name from the middle of the password and the service starts but cannot reach
  the database.

Verify: `GET /api/v1/health` returns 200, then `GET /api/v1/ready` returns 200.
The second one touches the database; the first does not.

## 4. Transfer the Supabase project

Supabase Dashboard → the project → Project Settings → General → Transfer
project. The receiving organisation must exist and the person doing it must be
an owner of both.

The transfer carries the database, every auth account and the storage buckets.
The project reference does not change, so the URL and the keys stay valid and
nothing needs redeploying because of the move.

## 5. Deploy the website and the admin panel

Two Vercel projects, both framework-detected as Next.js, root directory `.`.

**Website** — import `aravo-labs/Aravo-website`:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | The backend's URL from step 3 |

**Admin** — import `aravo-labs/aravo-website-admin`:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | The backend's URL from step 3 |
| `NEXT_PUBLIC_SUPABASE_URL` | The project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **The publishable key only** |

The service-role key must never appear in a `NEXT_PUBLIC_` variable. Anything
with that prefix is compiled into the browser bundle, and that key bypasses
row-level security.

## 6. Domains

Attach the real domains in Vercel — the site on the apex, the admin on its own
subdomain — and follow Vercel's DNS instructions at the registrar.

Keep the admin on a separate hostname. It is what keeps an internal tool off
the origin the public site is served from.

## 7. Point everything at the final addresses

Four places hold a copy of where something else lives. After the domains
resolve, all four have to agree, or sign-in and form submissions break in ways
that look unrelated to DNS.

1. **Render** → `CORS_ORIGINS`: the site origin and the admin origin.
2. **Render** → `ADMIN_APP_URL`: the admin origin. Invitation and
   password-reset links are built from this; if it still says `localhost`,
   every invitation sends people to their own machine.
3. **Supabase** → Authentication → URL Configuration → Redirect URLs: add the
   admin origin **plus `/reset`**. If it is missing, Supabase silently falls
   back to the project's Site URL and invitations land in the wrong place.
4. **Vercel** (both projects) → `NEXT_PUBLIC_API_URL`, if the backend's
   hostname changed.

Changing an environment variable on Vercel needs a redeploy to take effect;
Render restarts the service itself.

## 8. Rotate the credentials

Every value below has been handled by the studio during the build and should be
replaced once the client owns the accounts.

| Credential | Where | Note |
| --- | --- | --- |
| Database password | Supabase → Database → Settings | Update `DATABASE_URL` on Render, URL-encoded |
| Service-role key | Supabase → API keys | Update `SUPABASE_SERVICE_KEY` on Render |
| Publishable key | Supabase → API keys | Update on Render **and** the admin project, then redeploy the admin |
| Render API key | Render → Account Settings | Only used for tooling |

**One exception.** `SETTINGS_ENCRYPTION_KEY` should be left alone unless the
stored mail password is re-entered afterwards. It encrypts that password, and
changing the key makes the stored value unreadable rather than invalid — the
panel will report that it cannot decrypt, and the password has to be typed in
again.

## 9. Verify before cutting over

Do all of this on the `*.vercel.app` and `*.onrender.com` addresses first,
while the old deployments are still serving the real domains.

- `GET /api/v1/health` and `/api/v1/ready` on the new backend
- The site loads, the SDK documentation loads, `/privacy` and `/terms` load
- Sign in to the admin panel and save a change; confirm it appears on the site
- Submit the SDK access form; confirm the row arrives in the panel
- Invite a second admin and confirm the email arrives with the right hostname

## 10. Decommission

Only after the domains resolve to the new deployments and step 9 passes:

- Vercel: delete the two projects in the studio account
- Render: suspend, then delete, the old service
- GitHub: the studio repositories can stay as an archive. **They hold the full
  commit history**, which the single-commit copies in this organisation do
  not. Do not delete them until you are sure that record is not wanted.

---

## The state of the content as handed over

Facts, not defects — the content is the client's to change in the panel.

- **One admin account.** `kashif@aravo.in`, owner. It is the only login.
- **Mail is not configured.** There is no SMTP row, so no notification is sent
  anywhere. Applications and SDK requests arrive in the panel only. Settings →
  Mail server takes the credentials.
- **Documentation: 12 of 17 pages published.** The five unpublished ones are
  the pages that apply to every platform — *How Aravo works*, *Keys and
  environments*, *Recording a delivery*, *Events*, *Battery and permissions*.
  While they are drafts, `/docs/events` returns 404 and links to them from
  other pages are dead.
- **Platforms:** Android and iOS are published. A third called *Home* is a
  draft and looks like a test row; deleting it in the panel is safe.
- **Pages:** privacy, terms and `/seed`. The seed page is a placeholder — one
  line — waiting for the real announcement.
- **The announcement bar** still reads "test title" with the tag "test
  subtitle". Banners → edit, or unpublish it to remove the strip.
- **Social links are empty**, so the footer draws no social icons. Site →
  LinkedIn / X.
