// ---------------------------------------------------------------
// Generates one static page per published essay at
// essays/<id>.html (served as renezou.com/essays/<id>), using
// essay.html as the template. Zero npm dependencies.
//
// Why: essay.html fills in its <title> and social meta tags with
// JavaScript, but X, LinkedIn, Slack and iMessage don't run
// JavaScript when they build a link preview. These pages ship the
// essay's title, description, image and publish date in the HTML
// itself, so shared links show a proper preview card. The essay body
// still renders client-side from content/essays.json as before.
// ---------------------------------------------------------------
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from "fs";

const SITE = "https://renezou.com";
const OG_IMAGE = `${SITE}/assets/img/og-image.png`;
const X_HANDLE = "@itsrenezou";

function attr(str = "") {
  return String(str)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setContent(html, id, value) {
  const re = new RegExp(`(<meta id="${id}"[^>]*content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`template is missing meta #${id}`);
  return html.replace(re, `$1${value}$2`);
}

function main() {
  const template = readFileSync("essay.html", "utf8");
  const { essays } = JSON.parse(readFileSync("content/essays.json", "utf8"));
  const published = essays.filter((e) => e.hasDraft);

  mkdirSync("essays", { recursive: true });
  // Remove pages for essays that were unpublished or renamed.
  const keep = new Set(published.map((e) => `${e.id}.html`));
  for (const f of readdirSync("essays")) {
    if (f.endsWith(".html") && !keep.has(f)) unlinkSync(`essays/${f}`);
  }

  for (const e of published) {
    const url = `${SITE}/essays/${e.id}`;
    const title = attr(`${e.title} — Rene Zou`);
    const desc = attr(e.dek || e.teaser);

    let html = template;
    // Resolve the template's relative asset/script/fetch paths from the
    // site root, since this page lives one folder down.
    html = html.replace("<head>", '<head>\n  <base href="/" />');
    html = html.replace(/<title id="doc-title">[^<]*<\/title>/, `<title id="doc-title">${title}</title>`);
    html = setContent(html, "meta-desc", desc);
    html = html.replace(/(<link id="canonical-link" rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
    html = setContent(html, "og-title", title);
    html = setContent(html, "og-desc", desc);
    html = setContent(html, "og-url", url);
    html = setContent(html, "twitter-title", title);
    html = setContent(html, "twitter-desc", desc);
    html = html.replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${OG_IMAGE}" />`);
    if (e.publishedAt) html = setContent(html, "og-published", e.publishedAt);
    html = html.replace(
      '<meta name="twitter:card" content="summary_large_image" />',
      `<meta name="twitter:card" content="summary_large_image" />\n  <meta name="twitter:site" content="${X_HANDLE}" />\n  <meta name="twitter:creator" content="${X_HANDLE}" />\n  <meta name="twitter:image" content="${OG_IMAGE}" />`
    );
    html = html.replace('<body class="essay-full">', `<body class="essay-full" data-essay-id="${attr(e.id)}">`);
    // Visible fallback text for anything that reads the HTML without JS.
    html = html.replace(/(<h1 class="essay-title" id="essay-title">)[^<]*(<\/h1>)/, `$1${attr(e.title)}$2`);
    html = html.replace(/(<p class="essay-dek" id="essay-dek">)[^<]*(<\/p>)/, `$1${desc}$2`);

    writeFileSync(`essays/${e.id}.html`, html);
  }
  console.log(`Generated ${published.length} static essay page(s) in essays/`);
}

main();
