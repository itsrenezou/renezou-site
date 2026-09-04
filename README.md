# renezou.com

A static site (plain HTML/CSS/JS — no build framework) modeled structurally, interaction-wise, and visually on
[dianaseo.xyz](https://dianaseo.xyz), reskinned with the color palette from your reference deck and your Eklipse
content.

## Why static HTML instead of Next.js

We'd talked about Next.js/Tailwind/MDX earlier, but this session's sandbox couldn't reach the npm package registry
to install them (an environment restriction, not a design choice) — and it turns out dianaseo.xyz is itself a plain
static site (its essay pages are `essay.html?id=...`, not framework routes), so a static build is actually a more
faithful clone of "the same layout," not a downgrade. It's also the simplest thing to deploy: drop the folder on
Vercel, Netlify, or GitHub Pages and it works with zero build step. If you'd still rather have it on Next.js later,
the content layer (`content/essays.json`) is already the shape a Next.js data-fetching layer would want, so porting
is mostly moving HTML into components.

## Structure

```
index.html          Writing index (homepage) — essay list, real category filtering, featured box
essay.html           Single essay template — reads ?id= and renders from content/essays.json
work.html            Work & Track Record
stack.html           Stack — how I build (Eklipse Global Partners / Capital Partners / EklipseLab)
investing.html       Investing — views (placeholder; see "Assumptions" below)

assets/css/style.css  All styling — design tokens (colors/fonts) live at the top as CSS variables
assets/js/config.js   Site-wide config: email, socials, Substack publication, GA id — fill in the TODOs
assets/js/shell.js    Renders the sidebar on every page + the ⌘K command palette + live clock
assets/js/writing.js  Writing-index rendering + filtering
assets/js/essay.js    Essay-detail rendering + scrollspy table of contents
assets/img/           Photo, favicon, and OG image assets

content/essays.json   The content layer — see "Content" below
scripts/sync-notion.mjs        Pulls essays from Notion into content/essays.json (zero dependencies)
scripts/generate-brand-assets.mjs   Regenerates the favicon/OG image if you want to change the monogram
```

## Running it locally

No install needed:

```
python3 -m http.server 8080
```

then open `http://localhost:8080`. (Opening the HTML files directly via `file://` won't work — the essay data is
loaded with `fetch()`, which browsers block on `file://`.)

## Deploying

Any static host works. For Vercel: `vercel.json` is already set up so the Notion sync script runs on every deploy
(see below). For Netlify/GitHub Pages, just serve the folder as-is — you'll run `npm run sync-notion` (or the plain
`node` command) yourself before pushing if you're not using Vercel's build step.

Point `renezou.com`'s DNS at whichever host you pick (Vercel's dashboard walks you through this once you connect
the domain).

## Content: writing essays in Notion

Today, `content/essays.json` is the source of truth and is hand-written. To move to Notion so you're not touching
code for each essay:

1. Create a Notion database with these exact properties:

   | Property | Type | Notes |
   |---|---|---|
   | Title | Title | |
   | Slug | Rich text | URL slug, e.g. `velocity-speed` — leave blank to auto-generate from the title |
   | Status | Select | Options: `Live`, `In progress` |
   | Category | Select | `Strategy`, `Entrepreneurship`, `Building`, `Knowledge`, `Capital`, `Networks`, `Archives` |
   | Order | Number | Controls display order on the Writing index |
   | Teaser | Rich text | Card blurb on the Writing index |
   | Dek | Rich text | Italic subhead on the essay page (falls back to Teaser if blank) |
   | Word Count | Number | Used only to compute the "X min read" label |
   | Has Draft | Checkbox | Off = the card shows on the index but isn't clickable yet (matches how the site works today for essays without a full draft) |

2. The essay body itself is just the Notion page's content — write it with Notion's normal headings
   (Heading 2/3), paragraphs, and quote blocks. `sync-notion.mjs` maps those to the site's paragraph / section-header
   / pull-quote styles automatically.

3. Create a Notion integration (Settings → Connections → Develop or manage integrations), share the database with
   it, and grab the integration token and the database ID from its URL.

4. Set `NOTION_TOKEN` and `NOTION_DATABASE_ID` as environment variables on your host (or in a local `.env`, see
   `.env.example`), then run `node scripts/sync-notion.mjs`. It overwrites `content/essays.json`.

### Auto-refresh when you publish in Notion

The site is static, so "auto-refresh" means "rebuild when Notion changes":

1. Deploy to Vercel and set `NOTION_TOKEN` / `NOTION_DATABASE_ID` as project environment variables.
   `vercel.json` already runs `node scripts/sync-notion.mjs` as the build command, so every deploy pulls fresh
   Notion content.
2. In Vercel, create a **Deploy Hook** (Project Settings → Git → Deploy Hooks) — this gives you a URL that
   triggers a rebuild.
3. In Notion, add an automation on the database (or a small Zapier/Make zap watching it) that calls that Deploy
   Hook URL whenever a page's Status changes or a page is edited.

That gets you: edit in Notion → live site updates within a couple of minutes, with nothing to run yourself.

## Before you launch — fill these in

- **`assets/js/config.js`**: real Instagram/LinkedIn/X URLs (currently `#` placeholders), your Substack
  publication name (the "IN TRANSIT" signup form is wired to post to
  `https://<publication>.substack.com/api/v1/free` but is disabled until you set this), and your GA4 Measurement
  ID.
- **Favicon/OG image**: currently a generated "RZ" monogram (`node scripts/generate-brand-assets.mjs` to
  regenerate if you tweak the SVG in that script).
- **Hero photo**: using the Paris photo you sent, cropped for the sidebar avatar
  (`assets/img/avatar.jpg`) — swap the source file and re-run the crop if you'd rather use a different shot.

## Assumptions I made — flag anything you want changed

- **Investing page**: your deck names "Investing" as one of the 3 core nav sections (alongside Writing and Stack)
  but didn't include page content for it, unlike "Reading," "Honest Takes," and "Tools I back," which were
  explicitly marked "TO ADD" and so aren't in the nav at all. I built Investing as a light real page (reusing your
  existing investor blurb) rather than hiding it, since it wasn't marked TO ADD — happy to pull it from the nav
  instead if you'd rather it not exist yet.
- **Essay categories**: I tagged the 5 essays against your filter list myself (Founder/Read This →
  Entrepreneurship, Velocity > Speed → Strategy, Building in the Age of AI → Building, What is an Eklipse? →
  Strategy, Capitals & Ambitions → Capital) — first pass, easy to change in `content/essays.json` or in Notion
  once that's wired up.
- **Statuses not explicitly given**: "Capitals & Ambitions" (no status in your deck) and EklipseLab (no status on
  its Stack card) are both set to "in progress" as a reasonable default — flag if either should be "live."
- **"Work & Track Record"**: reachable by clicking "Eklipse" in the sidebar's Founder line (there's no separate
  top-level nav slot for it in your 3-section diagram, and this mirrors how Diana's site links her "Founder"
  line out to her product) — let me know if you'd rather it be a 4th nav item instead.
Line 6: <title>Rene Zou — Writing, a working ledger</title> → a working column
Line 13: <meta property="og:title" content="Rene Zou — Writing, a working ledger" /> → a working column
Line 32: <h1 class="page-title">A working ledger</h1> → A working column
<div class="nl-blurb">The ideas that move with capital, people, and technology — sent only when it's worth tracking.</div>
