// Generates favicon + OG image assets from inline SVG using sharp.
// Run: node scripts/generate-brand-assets.mjs
// (sharp must be resolvable — see NODE_PATH note in README if running outside this sandbox)

import sharp from "sharp";
import { mkdirSync } from "fs";

const INK = "#17171a";
const BG = "#fbfbf9";
const LIVE = "#d6fd78";
const SAGE = "#9caf88";

mkdirSync("assets/img", { recursive: true });

// Monogram: pure wordmark — no container, ink serif "RZ" with a small
// "live"-green accent dot. Transparent background. (Chosen from a set of
// iterations — see monogram-iterations.png — as option "D — wordmark".)
const monogramSvg = (size, ink = INK, accent = LIVE) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <text x="42" y="66" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-weight="700" font-size="48" fill="${ink}">RZ</text>
  <circle cx="80" cy="34" r="4.2" fill="${accent}"/>
</svg>`;

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <rect x="0" y="0" width="1200" height="630" fill="none" stroke="#dcdad2" stroke-width="2"/>
  <text x="72" y="168" font-family="DejaVu Serif, Georgia, serif" font-weight="700" font-size="70" fill="${INK}">RZ</text>
  <circle cx="182" cy="108" r="6" fill="${LIVE}"/>
  <text x="80" y="330" font-family="DejaVu Serif, Georgia, serif" font-weight="500" font-size="64" fill="${INK}">Rene Zou</text>
  <text x="80" y="380" font-family="DejaVu Sans, Arial, sans-serif" font-size="26" fill="#5b5b58">Founder, Eklipse — systems for founders</text>
  <circle cx="84" cy="470" r="5" fill="${LIVE}"/>
  <text x="102" y="478" font-family="DejaVu Sans, Arial, sans-serif" font-size="20" letter-spacing="1" fill="#5b5b58">STRATEGIC INFRASTRUCTURE · PRE-SEED, DEEP TECH INVESTOR</text>
</svg>`;

const jobs = [
  { svg: monogramSvg(32), out: "assets/img/favicon-32.png", w: 32, h: 32 },
  { svg: monogramSvg(16), out: "assets/img/favicon-16.png", w: 16, h: 16 },
  { svg: monogramSvg(180), out: "assets/img/apple-touch-icon.png", w: 180, h: 180 },
  { svg: monogramSvg(512), out: "assets/img/icon-512.png", w: 512, h: 512 },
];

for (const job of jobs) {
  await sharp(Buffer.from(job.svg)).resize(job.w, job.h).png().toFile(job.out);
  console.log("wrote", job.out);
}

await sharp(Buffer.from(ogSvg)).resize(1200, 630).png().toFile("assets/img/og-image.png");
console.log("wrote assets/img/og-image.png");

// Also keep the scalable SVG favicon around for browsers that support it.
import { writeFileSync } from "fs";
writeFileSync("assets/img/favicon.svg", monogramSvg(100));
console.log("wrote assets/img/favicon.svg");
