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
9. A visible "Last updated: {date}" line near the top of the article.
10. Inline CSS only (copy the shared `<style>` block from the templates below).
    No external stylesheets, fonts, images, or scripts.
11. Site header linking back to `/` and the shared site footer (see
    "Footer disclaimers"). 
12. No fabricated facts. GTA 6 details that Rockstar Games has not confirmed
    must be labeled as unconfirmed/rumored, never stated as fact.

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
  `https://www.amazon.com/s?k={url-encoded query}&tag=vicereport-21`.
  Never invent ASINs, product URLs, or direct `/dp/` links.
- Every affiliate link must have `rel="sponsored nofollow noopener"` and
  `target="_blank"`.
- A disclosure line must appear before the first affiliate link:
  *"Disclosure: this page contains affiliate links — see the footer for details."*
- Never state prices, discounts, star ratings, or review counts. Budget-tier
  wording ("flagship", "mid-range", "budget") is fine; dollar figures are not.
- Recommend real, well-known product lines only. If unsure a product exists,
  pick a category description instead ("a current LG C-series OLED").

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
:root{--bg:#0d1117;--panel:#161b22;--text:#e6edf3;--muted:#9da7b3;--accent:#f0b132;--line:#30363d}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.wrap{max-width:860px;margin:0 auto;padding:0 20px}
header.site{border-bottom:1px solid var(--line);padding:14px 0}
header.site .brand{color:var(--accent);font-weight:700;text-decoration:none;font-size:18px}
main{padding:32px 0 48px}
h1{font-size:34px;line-height:1.2;margin:0 0 10px}
h2{font-size:24px;margin:36px 0 12px}
h3{font-size:19px;margin:24px 0 8px}
p,li{color:var(--text)}
a{color:var(--accent)}
.updated,.disclosure{color:var(--muted);font-size:14px}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:20px 22px;margin:18px 0}
.cta{display:inline-block;background:var(--accent);color:#111;font-weight:700;text-decoration:none;padding:10px 18px;border-radius:8px;margin-top:8px}
table{border-collapse:collapse;width:100%;margin:16px 0}
th,td{border:1px solid var(--line);padding:8px 10px;text-align:left}
footer.site{border-top:1px solid var(--line);padding:24px 0;margin-top:24px;text-align:center}
footer.site p{color:var(--muted);font-size:13px;margin:6px 0}
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
    <h1>{h1}</h1>
    <p class="updated">Last updated: {Month D, YYYY}</p>
    <!-- money pages: disclosure line here, before any affiliate link -->
    <!-- body: intro, sections with h2/h3; money pages use .panel blocks
         per pick with a .cta affiliate link; info pages use prose,
         tables, and optionally a FAQ section -->
  </main></div>
  {footer disclaimers block, verbatim}
</body>
</html>
```

Money-page pick block:

```html
<section class="panel">
  <h2>{pick label — e.g. "Best overall: LG C-series OLED"}</h2>
  <p>{why it fits GTA 6 — panel tech, HDMI 2.1, VRR, input lag; no prices/ratings}</p>
  <ul>{3–5 spec bullets}</ul>
  <a class="cta" href="https://www.amazon.com/s?k={query}&amp;tag=vicereport-21"
     rel="sponsored nofollow noopener" target="_blank">See on Amazon</a>
</section>
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
