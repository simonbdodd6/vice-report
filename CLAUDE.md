# CLAUDE.md — Vice Report

Vice Report is a static HTML fan site with guides ("info" pages) and gear
recommendations ("money" pages) about Grand Theft Auto VI. Every rule in this
file is mandatory for every generated page.

## Site facts

- Site name / brand: **Vice Report**. The header brand link, the footer text,
  and `og:site_name` must all read exactly "Vice Report" on every page.
- The brand identity is independent of Rockstar/Take-Two trademarks: the brand
  name must **never** contain "GTA", "Grand Theft Auto", "Vice City", or
  "Leonida" ("Vice" alone is fine; "Vice City" is not). Referencing GTA 6 as a
  factual keyword in titles, headings, and body copy is fine and expected —
  only the brand identity must stay independent.
- Canonical base URL: **https://vice-report.vercel.app** (the generate script
  also honors a `SITE_URL` env var). Never emit a URL with a different host.
- All pages are flat `.html` files in the repo root. Slugs are lowercase
  letters, digits, and hyphens only.
- Homepage is `index.html`; the sitemap is `sitemap.xml`.
- Amazon affiliate tag: **vicereport-21**.

## Rules for every page

1. Start with `<!doctype html>` and use `<html lang="en">`.
2. Unique `<title>` (≤ 60 characters) — never duplicate another page's title.
3. Unique `<meta name="description">`, 140–160 characters.
4. `<meta name="viewport" content="width=device-width, initial-scale=1">`.
5. `<link rel="canonical" href="{BASE_URL}/{slug}.html">`.
6. Open Graph tags: `og:title`, `og:description`, `og:type` (`article`),
   `og:url` (same as canonical), `og:site_name` (`Vice Report`).
7. Exactly one `<h1>`.
8. One `<script type="application/ld+json">` block with the JSON-LD for the
   page type (see below). The JSON must be valid.
9. A hero header, a "short answer" callout, and accent-bar section headings,
   per "Article layout" below (the hero's meta row carries the visible
   "Updated {Month YYYY}" date).
10. Inline CSS only (copy the shared `<style>` block from the templates below).
    No external stylesheets, fonts, images, or scripts.
11. Site header linking back to `/` and the shared site footer (see
    "Footer disclaimers"). 
12. No fabricated facts. GTA 6 details that Rockstar Games has not confirmed
    must be labeled as unconfirmed/rumored, never stated as fact.

## Article layout

Every article opens with a hero header followed by a "short answer" callout:

```html
<header class="hero">
  <span class="pill">{"Hardware guide" for money · "Guide" or "News" for info}</span>
  <h1>{h1}</h1>
  <p class="meta"><span>{N} min read</span><span>Updated {Month YYYY}</span><span>{money pages only: "{N} picks compared"}</span></p>
</header>
<div class="shortanswer">
  <span class="sa-label">Short answer</span>
  <p>{1–2 sentence summary of the page's key takeaway}</p>
</div>
```

Rules:
- Read time = total article word count ÷ 200, rounded (minimum 1), e.g.
  "6 min read". "Updated" is month + year, e.g. "Updated July 2026". On money
  pages, N in "{N} picks compared" matches the number of pick panels.
- Money pages place the affiliate disclosure line directly after the short
  answer box, before any affiliate link.
- Section headings — the h2s that open page sections, **not** the h2s inside
  `.panel` pick blocks — carry a left accent bar: `<h2 class="sec">` (magenta
  bar), alternating with `<h2 class="sec alt">` (cyan bar) down the page.
- All colours reuse the existing synthwave palette only, lifted from
  index.html: accents magenta `#ff4fa3` and cyan `#3ce6ff`, gradient purple
  `#c86bff`, background purples `#120820` / `#2a0d45` / `#571046`, panel
  `rgba(23,10,40,.72)`, line `#4c2a6e`, text `#f4eefc`, muted `#c3afdb`.
  Never introduce new colours.

## Page types

### `info` pages
- JSON-LD: `Article` with `headline`, `description`, `datePublished`,
  `dateModified`, `mainEntityOfPage`, `author` (`Organization`, name
  "Vice Report"). If — and only if — the page has a real FAQ section, you may
  additionally include `FAQPage` JSON-LD that mirrors that section verbatim.
- No affiliate links on info pages.

### `money` pages
- JSON-LD: `ItemList` where each `ListItem` names one recommended product
  (`item` is a `Product` with `name` and `url` pointing at that pick's Amazon
  search link). **Never** include `offers`, `price`, `aggregateRating`,
  `review`, or `ratingValue` — we do not publish prices or star ratings.
- Affiliate links must be **Amazon search URLs only**, in the form
  `https://www.amazon.com.be/s?k={url-encoded query}&tag=vicereport-21`.
  Never invent ASINs, product URLs, or direct `/dp/` links.
- Every affiliate link must have `rel="sponsored nofollow noopener"` and
  `target="_blank"`.
- A disclosure line must appear before the first affiliate link:
  *"Disclosure: this page contains affiliate links — see the footer for details."*
- Never state prices, discounts, star ratings, or review counts. Budget-tier
  wording ("flagship", "mid-range", "budget") is fine; dollar figures are not.
- Recommend real, well-known product lines only. If unsure a product exists,
  pick a category description instead ("a current LG C-series OLED").
- Every money page must include one comparison table (see "Money-page
  comparison table" below), placed after the intro and disclosure line and
  before the first pick panel.
- Money pages about screen-based products (TVs, monitors) open each pick
  panel with a pure-CSS "screen" graphic (see "Per-pick screen graphic"
  below). Other product categories skip it.

## Footer disclaimers (verbatim, on every page)

```html
<footer class="site">
  <div class="wrap">
    <p>As an Amazon Associate, Vice Report earns from qualifying purchases.
    Links marked as sponsored may earn us a commission at no extra cost to you.</p>
    <p>Vice Report is an unofficial fan site and is not affiliated with, endorsed
    by, or connected to Rockstar Games or Take-Two Interactive. Grand Theft
    Auto is a trademark of Take-Two Interactive Software, Inc.</p>
    <p>© 2026 Vice Report · <a href="/">Home</a></p>
  </div>
</footer>
```

## Shared `<style>` block

Every page uses exactly this CSS (pages may append page-specific rules after
it, inside the same `<style>` tag):

```css
:root{--bg0:#120820;--bg1:#2a0d45;--bg2:#571046;--panel:rgba(23,10,40,.72);--line:#4c2a6e;--text:#f4eefc;--muted:#c3afdb;--pink:#ff4fa3;--cyan:#3ce6ff}
*{box-sizing:border-box}
body{margin:0;color:var(--text);font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;min-height:100vh;
  background:radial-gradient(120% 55% at 50% 100%,rgba(255,79,163,.16) 0%,rgba(255,79,163,0) 60%),
    linear-gradient(180deg,var(--bg0) 0%,var(--bg1) 55%,var(--bg2) 100%);
  background-attachment:fixed}
.wrap{max-width:860px;margin:0 auto;padding:0 20px}
header.site{border-bottom:1px solid var(--line);padding:14px 0}
header.site .brand{color:var(--cyan);font-weight:800;font-size:15px;letter-spacing:.12em;text-transform:uppercase;text-decoration:none}
main{padding:32px 0 48px}
h1{font-size:34px;line-height:1.2;margin:0 0 10px}
h2{font-size:24px;margin:36px 0 12px}
h3{font-size:19px;margin:24px 0 8px}
p,li{color:var(--text)}
a{color:var(--cyan)}
.updated,.disclosure{color:var(--muted);font-size:14px}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:20px 22px;margin:18px 0}
.cta{display:inline-block;background:linear-gradient(92deg,var(--pink),#c86bff);color:#120820;font-weight:700;text-decoration:none;padding:10px 18px;border-radius:8px;margin-top:8px}
table{border-collapse:collapse;width:100%;margin:16px 0}
th,td{border:1px solid var(--line);padding:8px 10px;text-align:left}
th{background:rgba(60,230,255,.07)}
footer.site{border-top:1px solid var(--line);padding:24px 0;margin-top:24px;text-align:center}
footer.site p{color:var(--muted);font-size:13px;margin:6px 0}
footer.site a{color:var(--cyan)}
.hero{padding:18px 0 24px;border-bottom:3px solid var(--pink);margin-bottom:24px}
.pill{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#3ce6ff;border:1px solid #3ce6ff;border-radius:999px;padding:3px 12px;margin-bottom:14px}
.hero h1{margin:0 0 12px;font-size:clamp(34px,5.5vw,46px);font-weight:800;line-height:1.15;
  background:linear-gradient(92deg,var(--pink) 10%,#c86bff 50%,var(--cyan) 90%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 14px rgba(255,79,163,.3))}
.meta{display:flex;flex-wrap:wrap;gap:6px 18px;color:var(--muted);font-size:14px;margin:0}
.shortanswer{background:var(--panel);border:1px solid var(--line);border-left:4px solid #3ce6ff;border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 24px}
.shortanswer p{margin:0}
.sa-label{display:block;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#3ce6ff;margin-bottom:4px}
h2.sec{display:flex;align-items:center;gap:10px}
h2.sec::before{content:"";width:4px;height:22px;border-radius:2px;background:#ff4fa3;flex:none}
h2.sec.alt::before{background:#3ce6ff}
```

## Page template (both types)

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{unique title ≤ 60 chars}</title>
  <meta name="description" content="{unique 140–160 char description}">
  <link rel="canonical" href="{BASE_URL}/{slug}.html">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{BASE_URL}/{slug}.html">
  <meta property="og:site_name" content="Vice Report">
  <style>{shared style block}</style>
  <script type="application/ld+json">{JSON-LD for the page type}</script>
</head>
<body>
  <header class="site"><div class="wrap"><a class="brand" href="/">Vice Report</a></div></header>
  <main><div class="wrap">
    {hero header — see "Article layout"}
    {"short answer" callout — see "Article layout"}
    <!-- money pages: disclosure line here, before any affiliate link -->
    <!-- body: intro, sections opened by accent-bar h2s (class="sec" /
         "sec alt", alternating); money pages use .panel blocks per pick
         with a .cta affiliate link; info pages use prose, tables, and
         optionally a FAQ section -->
  </main></div>
  {footer disclaimers block, verbatim}
</body>
</html>
```

Money-page pick block:

```html
<section class="panel">
  <!-- screen-product pages (TVs, monitors) only: .tvshot graphic here,
       before the h2 — see "Per-pick screen graphic" -->
  <h2>{pick label — e.g. "Best overall: LG C-series OLED"}</h2>
  <p>{why it fits GTA 6 — panel tech, HDMI 2.1, VRR, input lag; no prices/ratings}</p>
  <ul>{3–5 spec bullets}</ul>
  <a class="cta" href="https://www.amazon.com.be/s?k={query}&amp;tag=vicereport-21"
     rel="sponsored nofollow noopener" target="_blank">See on Amazon</a>
</section>
```

## Money-page comparison table

Every money page includes exactly one comparison table near the top: **3
options** (the page's premium / best-value / budget picks, or the category's
natural tiers) compared across **5–7 category-appropriate spec rows**. Pick
rows that matter for the product: TVs → contrast, peak brightness, input lag,
refresh/VRR, burn-in risk, price tier; SSDs → sequential read, capacity
options, interface, endurance, price tier; GPUs → VRAM, resolution class,
power draw, upscaling support, price tier; controllers → latency, battery,
extras, price tier — and so on.

Rules:
- The **middle column is the best-value recommendation**: its header cell and
  every body cell in that column carry the `c-rec` class, and the header
  includes the `Best all-round` label (see skeleton).
- Use rating badges where a cell earns one: `badge--best` (green) for the best
  option in a row, `badge--warn` (amber) for a genuine caution (burn-in risk,
  low VRAM, slower interface). Plain text cells otherwise.
- The price row must use **tier words only** ("Premium" / "Mid-range" /
  "Budget") — never currency amounts, per the no-prices rule.
- Directly under the table, include this line verbatim:
  `<p class="table-note">General hardware guidance, not GTA 6-specific spec claims — Rockstar has not confirmed PC specs.</p>`
- Append this CSS to the shared `<style>` block (same `<style>` tag):

```css
.tablewrap{overflow-x:auto;margin:20px 0}
.compare{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;min-width:600px;background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:14px}
.compare>div{padding:10px 12px;border-top:1px solid var(--line)}
.compare .c-head{border-top:none;font-weight:700;background:rgba(60,230,255,.07)}
.compare .c-spec{color:var(--muted);font-weight:600}
.compare .c-rec{border-left:3px solid #3ce6ff;background:rgba(60,230,255,.05)}
.compare .c-label{display:block;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#3ce6ff}
.badge{display:inline-block;padding:1px 8px;border-radius:999px;font-size:12px;font-weight:700}
.badge--best{background:rgba(74,222,128,.15);color:#4ade80}
.badge--warn{background:rgba(251,191,36,.15);color:#fbbf24}
.table-note{color:var(--muted);font-size:13px;margin:8px 0 24px}
```

- Table markup skeleton (a CSS grid, 4 columns: spec label + 3 options; one
  set of 4 `<div>`s per spec row):

```html
<div class="tablewrap">
  <div class="compare" role="table" aria-label="{category} comparison">
    <div class="c-head"></div>
    <div class="c-head">{Premium pick}</div>
    <div class="c-head c-rec"><span class="c-label">Best all-round</span>{Best-value pick}</div>
    <div class="c-head">{Budget pick}</div>
    <div class="c-spec">{Spec name}</div>
    <div>{value}</div>
    <div class="c-rec">{value} <span class="badge badge--best">Best</span></div>
    <div>{value} <span class="badge badge--warn">Caution</span></div>
  </div>
</div>
<p class="table-note">General hardware guidance, not GTA 6-specific spec claims — Rockstar has not confirmed PC specs.</p>
```

## Per-pick screen graphic (screen-product money pages)

On money pages whose picks are screen-based products (TVs, monitors), every
pick panel opens with an original pure-CSS "screen" graphic — no images, no
external assets — placed before the panel's `<h2>`:

- A 16:10 screen rectangle with a dark 3px bezel (`#120820`), rounded
  corners, and a small centered stand nub below it.
- The screen interior carries a synthwave glow: a radial gradient in the
  pick's role colour over the dark purple base, plus a faint cyan
  perspective grid rising from the bottom edge
  (`perspective(150px) rotateX(58deg)`).
- Colour-code the glow and role label per pick role, existing palette hexes
  only: magenta `#ff4fa3` (`rgba(255,79,163,…)`) for the premium /
  picture-quality pick, cyan `#3ce6ff` (`rgba(60,230,255,…)`) for the
  recommended / best all-round pick, purple `#c86bff`
  (`rgba(200,107,255,…)`) for the value / budget pick. The colour roles
  should match the comparison-table columns (cyan = the `c-rec` pick).
- Under the graphic, a caption: a small uppercase role label in the role
  colour, then the product name and panel type
  (e.g. "Samsung QN90 Neo QLED · Mini-LED panel"). No prices or ratings in
  the caption.
- The graphic is decorative — mark the drawing `aria-hidden="true"`; the
  caption carries the accessible text.
- Append this CSS to the shared `<style>` block (same `<style>` tag):

```css
.tvshot{max-width:320px;margin:2px 0 18px}
.tv{position:relative;aspect-ratio:16/10;border:3px solid #120820;border-radius:10px;overflow:hidden;background:linear-gradient(180deg,#2a0d45 0%,#120820 100%);box-shadow:0 0 0 1px var(--line)}
.tv-screen{position:absolute;inset:0}
.tvshot--pink .tv-screen{background:radial-gradient(90% 85% at 50% 30%,rgba(255,79,163,.5) 0%,rgba(255,79,163,.14) 45%,rgba(255,79,163,0) 72%)}
.tvshot--cyan .tv-screen{background:radial-gradient(90% 85% at 50% 30%,rgba(60,230,255,.5) 0%,rgba(60,230,255,.14) 45%,rgba(60,230,255,0) 72%)}
.tvshot--purple .tv-screen{background:radial-gradient(90% 85% at 50% 30%,rgba(200,107,255,.5) 0%,rgba(200,107,255,.14) 45%,rgba(200,107,255,0) 72%)}
.tv-grid{position:absolute;left:-35%;right:-35%;bottom:-14%;height:70%;background:repeating-linear-gradient(90deg,rgba(60,230,255,.25) 0 1px,transparent 1px 26px),repeating-linear-gradient(0deg,rgba(60,230,255,.25) 0 1px,transparent 1px 20px);transform:perspective(150px) rotateX(58deg);transform-origin:50% 100%}
.tv-stand{width:64px;height:9px;margin:0 auto;background:#120820;border-radius:0 0 7px 7px;box-shadow:0 1px 0 var(--line)}
.tv-caption{margin:10px 0 0;font-size:13px;color:var(--muted)}
.tv-role{display:block;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:2px}
.tvshot--pink .tv-role{color:#ff4fa3}
.tvshot--cyan .tv-role{color:#3ce6ff}
.tvshot--purple .tv-role{color:#c86bff}
```

- Markup skeleton (first child of the pick's `section.panel`, one per pick;
  variant class `tvshot--pink` / `tvshot--cyan` / `tvshot--purple` per the
  colour roles above):

```html
<div class="tvshot tvshot--cyan">
  <div class="tv" aria-hidden="true"><div class="tv-screen"><div class="tv-grid"></div></div></div>
  <div class="tv-stand" aria-hidden="true"></div>
  <p class="tv-caption"><span class="tv-role">{role label — e.g. "Best all-round"}</span>{product name} · {panel type}</p>
</div>
```

## Homepage cards

`index.html` lists every article as a card between the markers
`<!-- PAGES:START -->` and `<!-- PAGES:END -->`. The generate script inserts
new cards immediately before the END marker. Card markup:

```html
<a class="card" href="/{slug}.html">
  <span class="tag">{“Gear guide” for money, “Guide” for info}</span>
  <h2>{page title}</h2>
  <p>{meta description}</p>
</a>
```

## Sitemap

Every page gets one entry in `sitemap.xml` before `</urlset>`:

```xml
<url>
  <loc>{BASE_URL}/{slug}.html</loc>
  <lastmod>{YYYY-MM-DD}</lastmod>
</url>
```

## Content pipeline

- `keywords.txt` is the work queue: one page per line,
  `slug | page title | type` where type is `info` or `money`. Lines starting
  with `#` are comments.
- `scripts/generate.mjs` processes the first pending line: it generates the
  page via the Anthropic Messages API, validates it against these rules,
  writes `{slug}.html` to the repo root, appends the sitemap entry, inserts
  the homepage card, and moves the line to `keywords.done.txt`.
- Generated pages are drafts: they ship via pull request
  (`.github/workflows/generate.yml`), never by direct push to main, and must
  be human-reviewed before merge.
