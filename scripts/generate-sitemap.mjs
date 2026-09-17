// ---------------------------------------------------------------
// Generates sitemap.xml from content/essays.json plus the site's
// static top-level pages. Zero npm dependencies. Wired into the
// "build" script in package.json so the sitemap always reflects
// the current essay list on every deploy.
// ---------------------------------------------------------------
import { readFileSync, writeFileSync } from "fs";

const SITE = "https://renezou.com";

// /writing is the canonical home (aliased to index.html via vercel.json's
// rewrites); the other top-level pages round out the site.
const STATIC_PAGES = ["/writing", "/work", "/stack", "/investing"];

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function main() {
  const { essays } = JSON.parse(readFileSync("content/essays.json", "utf8"));
  const essayUrls = essays
    .filter((e) => e.hasDraft)
    .map((e) => `${SITE}/essay?id=${e.id}`);

  const urls = [...STATIC_PAGES.map((p) => `${SITE}${p}`), ...essayUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${escapeXml(u)}</loc></url>`)
    .join("\n")}\n</urlset>\n`;

  writeFileSync("sitemap.xml", xml);
  console.log(`Generated sitemap.xml with ${urls.length} URLs`);
}

main();
