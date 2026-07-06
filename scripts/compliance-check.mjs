#!/usr/bin/env node
// Non-blocking compliance re-check for the freshly generated page. Prints a
// markdown PASS/FAIL summary (injected into the PR body by generate.yml) and
// always exits 0 — scripts/generate.mjs remains the enforcing validator.
//
// Usage: node scripts/compliance-check.mjs [page.html]
// Without an argument, checks the .html file (other than index.html) that is
// new or modified in the working tree.

import { execSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const AFFILIATE_TAG = "vicereport-21";

function changedHtmlFile() {
  const out = execSync("git status --porcelain", { encoding: "utf8" });
  const files = out
    .split("\n")
    .filter(Boolean)
    .map((l) => l.slice(3).trim())
    .filter((f) => f.endsWith(".html") && f !== "index.html");
  return files[0] ?? null;
}

const file = process.argv[2] ?? changedHtmlFile();
if (!file) {
  console.log("**Compliance check:** no generated page found in this run — nothing to check.");
  process.exit(0);
}

const html = await readFile(file, "utf8");

// Page type: look the slug up in keywords.done.txt (generate.mjs moves the
// processed queue line there); fall back to inferring from the JSON-LD type.
const slug = file.replace(/\.html$/, "");
let type = null;
try {
  for (const line of (await readFile("keywords.done.txt", "utf8")).split("\n")) {
    const [s, , t] = line.split("|").map((p) => p.trim());
    if (s === slug && (t === "money" || t === "info")) type = t;
  }
} catch {}
if (!type) type = html.includes('"ItemList"') ? "money" : "info";

const visibleText = html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ");

const checks = [];
const add = (name, pass, detail = "") => checks.push({ name, pass, detail });

// --- 1. banned brand tokens in brand/logo/title contexts only -------------
// Factual references in body copy are allowed; the brand identity is not.
// The footer context is the © line only — the verbatim trademark disclaimer
// legitimately names Grand Theft Auto.
const brandContexts = {
  "og:site_name": html.match(/property="og:site_name" content="([^"]*)"/i)?.[1] ?? "",
  "header brand link": html.match(/class="brand"[^>]*>([^<]*)</i)?.[1] ?? "",
  "footer © line": html.match(/©[^<]*/)?.[0] ?? "",
  "<title>": html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "",
};
const bannedTokens = ["grand theft auto", "vice city", "leonida"];
const brandHits = [];
for (const [ctx, text] of Object.entries(brandContexts))
  for (const tok of bannedTokens)
    if (text.toLowerCase().includes(tok)) brandHits.push(`"${tok}" in ${ctx}`);
add(
  "No banned brand tokens in brand/logo/title context",
  brandHits.length === 0,
  brandHits.join("; ")
);

// --- 2. money-page affiliate rules -----------------------------------------
if (type === "money") {
  const anchors = [...html.matchAll(/<a\s[^>]*>/gi)].map((m) => m[0]);
  const amazonAnchors = anchors.filter((a) => /href="https?:\/\/[^"]*amazon\./i.test(a));
  const hrefs = [...html.matchAll(/href="(https?:\/\/[^"]*amazon\.[^"]*)"/gi)].map((m) => m[1]);

  const searchLinks = hrefs.filter((h) => /amazon\.com\.be\/s\?/.test(h));
  add("At least one amazon.com.be search-URL link", searchLinks.length > 0, `${searchLinks.length} found`);

  const missingTag = hrefs.filter((h) => !h.includes(`tag=${AFFILIATE_TAG}`));
  add(
    `All Amazon links carry tag=${AFFILIATE_TAG}`,
    missingTag.length === 0,
    missingTag.length ? `missing on: ${missingTag.join(", ")}` : `${hrefs.length} links checked`
  );

  const missingRel = amazonAnchors.filter((a) => !a.includes('rel="sponsored nofollow noopener"'));
  add(
    'All Amazon anchors carry rel="sponsored nofollow noopener"',
    amazonAnchors.length > 0 && missingRel.length === 0,
    `${amazonAnchors.length - missingRel.length}/${amazonAnchors.length} anchors`
  );

  add(
    'Comparison table with "Best all-round" present',
    html.includes('class="compare"') && html.includes("Best all-round")
  );

  add(
    "Inline affiliate disclosure line present",
    html.includes("Disclosure: this page contains affiliate links")
  );
}

// --- 3. JSON-LD hygiene ----------------------------------------------------
const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
let ldValid = ldBlocks.length > 0;
const ldBannedHits = [];
for (const [, raw] of ldBlocks) {
  try {
    JSON.parse(raw);
  } catch {
    ldValid = false;
  }
  for (const key of ['"offers"', '"price"', '"aggregateRating"', '"review"'])
    if (raw.includes(key)) ldBannedHits.push(key);
}
add("JSON-LD present and parses as valid JSON", ldValid, `${ldBlocks.length} block(s)`);
add(
  "JSON-LD free of offers/price/aggregateRating/review",
  ldBannedHits.length === 0,
  ldBannedHits.join(", ")
);

// --- 4. no currency symbol adjacent to a digit ------------------------------
const priceHits = visibleText.match(/[€$£]\s?\d|\d\s?[€$£]/g) ?? [];
add(
  "No €/$/£ adjacent to a digit (no real prices)",
  priceHits.length === 0,
  priceHits.join(", ")
);

// --- 5. footer disclosure --------------------------------------------------
add(
  "Footer disclosure present (Amazon Associate + non-affiliation)",
  html.includes("As an Amazon Associate, Vice Report earns") &&
    html.includes("not affiliated with, endorsed")
);

// --- 6. unconfirmed labelling on unconfirmed-spec coverage ------------------
const coversGta6 = /gta\s*6|grand theft auto/i.test(visibleText);
const hasUnconfirmedMarker =
  /unconfirmed|rumou?r|not (?:yet )?confirmed|has not (?:confirmed|announced|published|stated|released|detailed)/i.test(
    visibleText
  );
add(
  "Unconfirmed labelling present where GTA 6 specs are covered",
  !coversGta6 || hasUnconfirmedMarker,
  coversGta6 ? (hasUnconfirmedMarker ? "marker found" : "no unconfirmed/rumor marker found") : "page does not cover GTA 6"
);

// --- report -----------------------------------------------------------------
const passed = checks.filter((c) => c.pass).length;
const overall = passed === checks.length ? "✅ PASS" : "❌ FAIL";
console.log(`### Compliance check: \`${file}\` (${type} page) — ${overall} (${passed}/${checks.length})`);
console.log("");
console.log("| Check | Result | Notes |");
console.log("|---|---|---|");
for (const c of checks)
  console.log(`| ${c.name} | ${c.pass ? "✅" : "❌"} | ${c.detail.replace(/\|/g, "\\|")} |`);
console.log("");
console.log(
  "_Non-blocking informational check; `scripts/generate.mjs` remains the enforcing validator._"
);
process.exit(0);
