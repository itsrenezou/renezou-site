// ---------------------------------------------------------------
// Generates feed.xml (RSS 2.0) from content/essays.json. Zero npm
// dependencies. Runs on every deploy (see vercel.json), so a newly
// published essay shows up in the feed automatically — that's what
// X schedulers (Buffer, Typefully, Zapier, IFTTT) watch.
//
// An essay is included when it is status "live" AND has a draft.
// Each item's date comes from "publishedAt" (YYYY-MM-DD) — the date
// the essay first went live. Set it once and don't change it on
// later edits, or feed readers will treat the essay as new again.
// ---------------------------------------------------------------
import { readFileSync, writeFileSync } from "fs";

const SITE = "https://renezou.com";
const FEED_URL = `${SITE}/feed.xml`;
const AUTHOR = "Rene Zou";
const AUTHOR_EMAIL = "rene.zou@eklipses.io";

function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Strip any inline HTML (links, <strong>) from teaser text.
function plain(str = "") {
  return String(str).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// publishedAt is a calendar date in New York. Pin it to noon Eastern
// so the RFC-822 timestamp never slips to the previous/next day.
function publishedDate(e) {
  if (e.publishedAt) return new Date(`${e.publishedAt}T12:00:00-04:00`);
  if (e.date) {
    console.warn(`feed: "${e.id}" has no publishedAt — falling back to the 1st of ${e.date}`);
    return new Date(`${e.date}-01T12:00:00-04:00`);
  }
  console.warn(`feed: "${e.id}" has no publishedAt or date — skipping`);
  return null;
}

function main() {
  const { essays } = JSON.parse(readFileSync("content/essays.json", "utf8"));

  const items = essays
    .filter((e) => e.status === "live" && e.hasDraft)
    .map((e) => ({ e, when: publishedDate(e) }))
    .filter((x) => x.when)
    .sort((a, b) => b.when - a.when);

  const itemXml = items
    .map(({ e, when }) => {
      const url = `${SITE}/essay?id=${e.id}`;
      return `    <item>
      <title>${escapeXml(e.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${when.toUTCString()}</pubDate>
      <dc:creator>${escapeXml(AUTHOR)}</dc:creator>
      <category>${escapeXml(e.category || "")}</category>
      <description>${escapeXml(plain(e.teaser || e.dek))}</description>
    </item>`;
    })
    .join("\n");

  const lastBuild = items.length ? items[0].when : new Date();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Rene Zou — Writing</title>
    <link>${SITE}/writing</link>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
    <description>Essays by Rene Zou on strategy, founders, and the gap between vision and execution.</description>
    <language>en-us</language>
    <managingEditor>${AUTHOR_EMAIL} (${AUTHOR})</managingEditor>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
${itemXml}
  </channel>
</rss>
`;

  writeFileSync("feed.xml", xml);
  console.log(`Generated feed.xml with ${items.length} item(s)`);
}

main();
