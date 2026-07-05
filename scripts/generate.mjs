#!/usr/bin/env node
// Content pipeline: takes the first pending line from keywords.txt, generates
// one HTML page via the Anthropic Messages API following CLAUDE.md, validates
// it, writes it to the repo root, updates sitemap.xml and index.html, and
// moves the processed line to keywords.done.txt.
//
// Usage:
//   npm run generate                     # real run (needs ANTHROPIC_API_KEY)
//   node scripts/generate.mjs --offline sample.html
//                                        # dry run: skip the API call and use a
//                                        # pre-written page, but exercise every
//                                        # other step (validate/write/sitemap/
//                                        # index/queue)

import { readFile, writeFile, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = (process.env.SITE_URL ?? "https://vice-report.vercel.app").replace(/\/+$/, "");
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
const AFFILIATE_TAG = "vicereport-21";

const fail = (msg) => {
  console.error(`generate: ERROR: ${msg}`);
  process.exit(1);
};
const read = (rel) => readFile(path.join(ROOT, rel), "utf8");

// ---------- args ----------
const argv = process.argv.slice(2);
let offlineFile = null;
const offlineIdx = argv.indexOf("--offline");
if (offlineIdx !== -1) {
  offlineFile = argv[offlineIdx + 1];
  if (!offlineFile) fail("--offline requires a path to an HTML file");
}

if (!offlineFile && !process.env.ANTHROPIC_API_KEY) {
  fail("ANTHROPIC_API_KEY is not set");
}

// ---------- queue ----------
const claudeMd = await read("CLAUDE.md").catch(() => fail("CLAUDE.md not found"));
const queueRaw = await read("keywords.txt").catch(() => fail("keywords.txt not found"));
const queueLines = queueRaw.split("\n");
const pendingIdx = queueLines.findIndex(
  (l) => l.trim() && !l.trim().startsWith("#")
);
if (pendingIdx === -1) {
  console.log("generate: keywords.txt has no pending entries — nothing to do.");
  process.exit(0);
}
const pendingLine = queueLines[pendingIdx].trim();
const parts = pendingLine.split("|").map((s) => s.trim());
if (parts.length !== 3) fail(`malformed queue line: "${pendingLine}"`);
const [slug, title, type] = parts;
if (!/^[a-z0-9-]+$/.test(slug)) fail(`invalid slug "${slug}"`);
if (type !== "info" && type !== "money") fail(`invalid type "${type}" (info|money)`);

const pagePath = path.join(ROOT, `${slug}.html`);
if (existsSync(pagePath)) fail(`${slug}.html already exists — refusing to overwrite`);

const today = new Date().toISOString().slice(0, 10);
const canonical = `${SITE_URL}/${slug}.html`;
console.log(`generate: processing "${title}" (${slug}, ${type})`);

// ---------- get the page HTML ----------
let html;
if (offlineFile) {
  console.log(`generate: offline mode — using ${offlineFile} instead of the API`);
  html = await readFile(path.resolve(offlineFile), "utf8");
} else {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  console.log(`generate: calling model ${MODEL} …`);
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 20000,
    system:
      "You generate complete static HTML pages for the Vice Report website. " +
      "You output exactly one complete HTML document and nothing else — no " +
      "markdown code fences, no commentary before or after the document.",
    messages: [
      {
        role: "user",
        content: `Below is the site's CLAUDE.md. Follow every rule in it exactly.

<claude-md>
${claudeMd}
</claude-md>

Generate this page:
- slug: ${slug}
- page title/topic: ${title}
- type: ${type}
- canonical URL (use exactly this): ${canonical}
- today's date: ${today}

Hard requirements, restated:
- Output ONLY the HTML document, starting with <!doctype html>.
- Unique <title> (≤60 chars), unique meta description (140–160 chars), the
  canonical URL above, and full Open Graph tags.
- JSON-LD: ${type === "money" ? "ItemList (Products with name+url only — no offers, prices, or ratings)" : "Article (plus FAQPage only if the page has a real FAQ section)"}.
- ${type === "money" ? `Affiliate links must be Amazon SEARCH URLs only (https://www.amazon.com/s?k=...&tag=${AFFILIATE_TAG}) with rel="sponsored nofollow noopener" and target="_blank". Never invent ASINs, /dp/ links, prices, star ratings, or review counts.` : "No affiliate links on this info page."}
- Include the exact footer disclaimers block from CLAUDE.md.
- Never state unconfirmed GTA 6 details as fact — label rumors/unconfirmed
  information clearly.`,
      },
    ],
  });
  html = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

// Strip accidental markdown fences.
html = html.trim().replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/, "");
if (!html.endsWith("\n")) html += "\n";

// ---------- validate against CLAUDE.md rules ----------
const errors = [];
const warnings = [];

if (!/^<!doctype html>/i.test(html)) errors.push("does not start with <!doctype html>");
if (!/<html lang="en">/i.test(html)) errors.push('missing <html lang="en">');
if (!html.includes(`<link rel="canonical" href="${canonical}">`))
  errors.push(`missing canonical link for ${canonical}`);
const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
if (!titleMatch) errors.push("missing <title>");
else if (titleMatch[1].length > 70) warnings.push(`title is ${titleMatch[1].length} chars (target ≤60)`);
const descMatch = html.match(/<meta name="description" content="([^"]*)"/i);
if (!descMatch) errors.push("missing meta description");
else if (descMatch[1].length < 120 || descMatch[1].length > 180)
  warnings.push(`meta description is ${descMatch[1].length} chars (target 140–160)`);
for (const og of ["og:title", "og:description", "og:type", "og:url", "og:site_name"])
  if (!html.includes(`property="${og}"`)) errors.push(`missing ${og}`);

const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
if (!ldMatch) {
  errors.push("missing JSON-LD block");
} else {
  let ld;
  try {
    ld = JSON.parse(ldMatch[1]);
  } catch {
    errors.push("JSON-LD is not valid JSON");
  }
  if (ld) {
    const types = JSON.stringify(ld);
    const expected = type === "money" ? "ItemList" : "Article";
    if (!types.includes(`"${expected}"`)) errors.push(`JSON-LD missing ${expected} for ${type} page`);
    for (const banned of ["aggregateRating", "ratingValue", '"offers"', '"price"', '"review"'])
      if (types.includes(banned)) errors.push(`JSON-LD contains banned field ${banned}`);
  }
}

if (!html.includes("not affiliated with, endorsed"))
  errors.push("missing Rockstar non-affiliation footer disclaimer");
if (!html.includes("As an Amazon Associate"))
  errors.push("missing Amazon Associate footer disclaimer");
if (!html.includes("Last updated:")) errors.push('missing visible "Last updated:" line');

const amazonHrefs = [...html.matchAll(/href="(https?:\/\/[^"]*amazon\.[^"]*)"/gi)].map((m) => m[1]);
if (type === "money") {
  if (amazonHrefs.length === 0) errors.push("money page has no Amazon affiliate links");
  for (const href of amazonHrefs) {
    if (!href.includes(`tag=${AFFILIATE_TAG}`)) errors.push(`Amazon link missing tag=${AFFILIATE_TAG}: ${href}`);
    if (!/amazon\.com\/s\?/.test(href)) errors.push(`Amazon link is not a search URL: ${href}`);
  }
  const sponsoredCount = (html.match(/rel="sponsored nofollow noopener"/g) ?? []).length;
  if (sponsoredCount < amazonHrefs.length)
    errors.push(`only ${sponsoredCount}/${amazonHrefs.length} Amazon links carry rel="sponsored nofollow noopener"`);
  if (!html.includes("Disclosure:"))
    errors.push("money page missing the inline affiliate disclosure line");
} else if (amazonHrefs.length > 0) {
  errors.push("info page must not contain Amazon links");
}
if (/\$\s?\d/.test(html)) warnings.push("page contains a dollar amount — check it isn't a fabricated price");
if (/(\d(\.\d)?\s*(out of 5|stars\b))|★/i.test(html))
  errors.push("page appears to contain star ratings");

if (errors.length) {
  console.error(`generate: page for "${slug}" failed validation:`);
  for (const e of errors) console.error(`  - ${e}`);
  fail("aborting — nothing was written, keywords.txt is unchanged");
}
for (const w of warnings) console.warn(`generate: WARNING: ${w}`);

// ---------- write page ----------
await writeFile(pagePath, html);
console.log(`generate: wrote ${slug}.html`);

// ---------- sitemap ----------
const sitemap = await read("sitemap.xml").catch(() => fail("sitemap.xml not found"));
if (sitemap.includes(`<loc>${canonical}</loc>`)) {
  console.log("generate: sitemap already contains this URL — skipping");
} else {
  if (!sitemap.includes("</urlset>")) fail("sitemap.xml has no </urlset>");
  const entry = `  <url>\n    <loc>${canonical}</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n</urlset>`;
  await writeFile(path.join(ROOT, "sitemap.xml"), sitemap.replace("</urlset>", entry));
  console.log("generate: updated sitemap.xml");
}

// ---------- homepage card ----------
const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const index = await read("index.html").catch(() => fail("index.html not found"));
const END = "<!-- PAGES:END -->";
if (!index.includes(END)) fail("index.html is missing the <!-- PAGES:END --> marker");
if (index.includes(`href="/${slug}.html"`)) {
  console.log("generate: index.html already links this page — skipping");
} else {
  const card = `<a class="card" href="/${slug}.html">
        <span class="tag">${type === "money" ? "Gear guide" : "Guide"}</span>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(descMatch?.[1] ?? "")}</p>
      </a>
      ${END}`;
  await writeFile(path.join(ROOT, "index.html"), index.replace(END, card));
  console.log("generate: inserted homepage card");
}

// ---------- move queue line ----------
queueLines.splice(pendingIdx, 1);
await writeFile(path.join(ROOT, "keywords.txt"), queueLines.join("\n"));
await appendFile(path.join(ROOT, "keywords.done.txt"), `${pendingLine} | ${today}\n`);
console.log(`generate: moved "${slug}" to keywords.done.txt`);
console.log("generate: done ✔");
