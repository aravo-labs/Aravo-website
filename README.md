# Aravo website

The public site: landing page, careers, team and SDK documentation. Content -
pages, platforms, documentation, banners, the site's own name and logo - is
written in the admin panel and read at runtime, so publishing does not need a
deploy.

## Run it

```bash
npm install
npm run dev      # http://localhost:4200
```

`npm run build` produces a fully static export of `/`.

## Related repos

The admin panel is a **separate application** on its own origin, so it never
ships in the bundle anonymous visitors download.

| Repo | | Port |
| --- | --- | --- |
| the API | FastAPI + Supabase | 8010 |
| this repo | the public site | 4200 |
| the admin panel | Next.js | 4300 |

This site reads published content through `lib/api/public.ts`. It has no
admin code, no design-system dependency and no auth: nothing here can reach a
draft or a submission.

## Rebranding

Every string, label, link and list on the page lives in **`src/content/site.ts`**.
Change the values there and the whole page follows. No component edits needed for
copy, nav items, stats, accordion contents, FAQ, footer links or metadata.

Design tokens live in **`src/app/globals.css`** under `@theme`:

| Token | Value | Used for |
| --- | --- | --- |
| `--color-canvas` | `#fafafa` | page background |
| `--color-surface` | `#ffffff` | cards, panels |
| `--color-ink` | `#212529` | primary text |
| `--color-muted` | `#939290` | secondary text |
| `--color-accent` | `#1560ff` | links, CTAs, highlights |
| `--color-rule` | `#ececea` | the 1px grid lines |

Type is Inter (display) + Geist Mono (labels, buttons, footer), both self-hosted via
`next/font`. Headings are **weight 400** with negative tracking - that flat, un-bolded
display type is most of the look, so keep it if you change the font.

## Landing page concept

The reference site's organising image is a **horizontal street corridor**. The
product's actual truth is **vertical**: GPS dies at the kerb and the last 100
metres go upward, through floors. So the page is built on the ascent, and
nothing else in the sector is using that axis.

`AscentVisual.tsx` is the page's one idea made visible - a marker climbs a cut
through of a building while the GPS signal it started with falls away floor by
floor. That single picture carries both the problem and the answer, and the
"four events" section below it is the same sequence seen from the side.

Sections, in the order they argue: hero (the claim) → the gap (why it matters)
→ how it works (the mechanism) → what you get (the outcome) → developers (the
cost of adopting) → close.

Copy lives in `src/content/landing.ts`. The banner above the nav is whatever
the admin panel has published, so the CMS shows up on the public site; it
renders nothing at all if the API is unreachable, because a marketing page
should not show an error strip when a CMS call fails.

## Layout system

`Shell` centres a 1150px column and draws the vertical rules down both gutters.
Sections are separated by `border-t`, which is what produces the continuous grid.
Two background textures are available as utility classes:

- `.tex-hatch` - faint diagonal hatch, used behind stat and CTA blocks
- `.tex-columns` - vertical ruled columns, used above/below the CTA band

## Pages

| Route | What's there | Source |
| --- | --- | --- |
| `/` | landing page | static, except the announcement bar |
| `/careers` | open roles and the application form | **API** |
| `/team` | published team members | **API** |
| `/docs` | SDK documentation index | **API** |
| `/docs/[slug]` | one documentation page, markdown | **API** |
| `/admin/*` | the admin panel | API |

Everything marked **API** is edited in the admin panel and appears publicly the
moment it is published. Drafts are never served: verified by publishing a role,
a doc page and a team member, then confirming the draft equivalents 404.

Markdown for the docs is rendered by `components/docs/Markdown.tsx`. Raw HTML is
not enabled, so an author cannot inject markup into a public page. Wide code
blocks and tables scroll inside their own box rather than pushing the page.

The careers content lives in **`src/content/careers.ts`** - roles, copy, and form
labels. Add or remove entries in `jobs` and both views follow.

The application form validates required fields, email format, and the resume
(PDF/DOC/DOCX, 10MB cap) with drag-and-drop, then shows a success state.
**It has no backend**: `onSubmit` in `src/components/careers/ApplyForm.tsx` is a
stub with a marked TODO - point it at your ATS or a Next route handler.

## Landing page sections

| Component | What it does |
| --- | --- |
| `Nav` | sticky, gains a border + blur past 12px scroll; mobile drawer |
| `Hero` | one-point-perspective street scene, floating pins, announcement bar |
| `InAction` | stairwell cutaway with a climbing courier; event feed fills in on a loop |
| `Problem` | stat + accordion driving three distinct panels (GPS drift map, unusable POD photos, refund thread); grid/globe toggle. Accordion timing is measured off the reference: 300ms ease-out height, matching colour crossfade, no opacity fade on the body. |
| `Solution` | browser-chrome dashboard mockup (timeline, journey, snapshot, site map) + 4 feature cards |
| `Integrate` | tabs move a waypoint through the building cutaway; stack icons; FAQ accordion |
| `Closing` | CTA band framed by ruled columns, then the footer |

## Motion

The hero plays a staged entrance on load: grid and street scene, then the marker
blocks pop in staggered, then the copy rises. Timings are the `T_SCENE` /
`T_BLOCKS` / `T_TEXT` constants at the top of `Hero.tsx`.

No animation library. Scroll reveals are one `IntersectionObserver` in
`src/lib/useReveal.ts`, driving `[data-reveal] -> [data-visible]` against a CSS
transition. Everything else is CSS transitions on state changes.

`prefers-reduced-motion` is honoured throughout: reveals resolve instantly, the
courier loop holds on its finished frame (`src/lib/usePrefersReducedMotion.ts`),
and the floating hero pins stop moving.

## Illustrations

All in `src/components/art/`:

- `HeroScene.tsx` - buildings are generated from a depth list and projected onto a
  vanishing point. Window openings are bilinear-interpolated inside each facade quad,
  so they follow the perspective instead of sitting flat. Edit the `ROW` array to
  change the skyline.
- `BuildingCutaway.tsx` - isometric cutaway. `WAYPOINTS` maps each tab id to a
  marker position.
- `Icons.tsx` - line icons on a 24x24 grid.

## Reference

Working captures and measurements used while building live in `_reference/`,
which is deliberately not committed: it holds screenshots of a third-party
site used to work out spacing and type, and it is not something to ship in a
client repo.

