// Generates favicon + OG image assets from inline SVG using sharp.
// Run: node scripts/generate-brand-assets.mjs
// (sharp must be resolvable — see NODE_PATH note in README if running outside this sandbox)

import sharp from "sharp";
import { mkdirSync } from "fs";

const INK = "#17171a";
const BG = "#fbfbf9";
const LIVE = "#d6fd78";

mkdirSync("assets/img", { recursive: true });

const monogramSvg = (size, bg = BG, ink = INK) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="${bg}"/>
  <text x="50" y="66" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-weight="700" font-size="46" fill="${ink}">RZ</text>
</svg>`;

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <rect x="0" y="0" width="1200" height="630" fill="none" stroke="#dcdad2" stroke-width="2"/>
  <rect x="80" y="80" width="96" height="96" rx="18" fill="${INK}"/>
  <text x="128" y="146" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-weight="700" font-size="44" fill="${BG}">RZ</text>
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
