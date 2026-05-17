/**
 * Генерирует тестовую WebP-последовательность для HouseSequenceCanvas.
 * Запуск: npm run generate:sequence
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DESKTOP_FRAMES = 88;
const MOBILE_FRAMES = 73;
const DESKTOP = {
  w: 1600,
  h: 900,
  dir: "public/sequence/house/desktop",
  frames: DESKTOP_FRAMES,
};
const MOBILE = {
  w: 900,
  h: 1200,
  dir: "public/sequence/house/mobile",
  frames: MOBILE_FRAMES,
};

/** 0..1 по индексу кадра */
function progress01(frameIndex, totalFrames) {
  if (totalFrames <= 1) return 0;
  return frameIndex / (totalFrames - 1);
}

function layerOpacity(p, start, end) {
  if (p <= start) return 0;
  if (p >= end) return 1;
  return (p - start) / (end - start);
}

function pad4(n) {
  return String(n).padStart(4, "0");
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * SVG-сцена: beige, сетка, дом по слоям + номер кадра.
 */
function buildSceneSvg(width, height, frameIndex, totalFrames) {
  const p = progress01(frameIndex, totalFrames);
  const frameLabel = escapeXml(`${pad4(frameIndex + 1)} / ${totalFrames}`);

  const oFoundation = layerOpacity(p, 0.0, 0.16);
  const oWalls = layerOpacity(p, 0.12, 0.3);
  const oRoof = layerOpacity(p, 0.28, 0.46);
  const oWindows = layerOpacity(p, 0.44, 0.62);
  const oDetails = layerOpacity(p, 0.6, 0.85);

  const cx = width / 2;
  const baseY = height * 0.62;
  const bodyW = width * 0.22;
  const bodyH = height * 0.24;
  const foundationH = height * 0.04;
  const roofH = height * 0.11;

  const left = cx - bodyW / 2;
  const right = cx + bodyW / 2;
  const wallTop = baseY - bodyH;
  const roofTipY = wallTop - roofH;

  const gridStep = Math.round(Math.min(width, height) / 18);
  let gridPaths = "";
  for (let x = 0; x <= width; x += gridStep) {
    gridPaths += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#b8a896" stroke-opacity="0.14" stroke-width="1"/>`;
  }
  for (let y = 0; y <= height; y += gridStep) {
    gridPaths += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#b8a896" stroke-opacity="0.14" stroke-width="1"/>`;
  }

  const foundation = `
    <rect x="${left - bodyW * 0.06}" y="${baseY - foundationH}" width="${bodyW * 1.12}" height="${foundationH}"
      fill="#d4c9b8" stroke="#9a8b7a" stroke-width="2" opacity="${oFoundation}"/>`;

  const walls = `
    <rect x="${left}" y="${wallTop}" width="${bodyW}" height="${bodyH}"
      fill="#f2ebe0" stroke="#7a7268" stroke-width="2.5" opacity="${oWalls}"/>`;

  const roof = `
    <polygon points="${cx},${roofTipY} ${right + bodyW * 0.05},${wallTop} ${left - bodyW * 0.05},${wallTop}"
      fill="#c9bfb0" stroke="#6e655c" stroke-width="2" opacity="${oRoof}"/>`;

  const winW = bodyW * 0.18;
  const winH = bodyH * 0.22;
  const winY = wallTop + bodyH * 0.38;
  const windows = `
    <rect x="${cx - bodyW * 0.32}" y="${winY}" width="${winW}" height="${winH}" rx="4"
      fill="#e8e2da" stroke="#6e655c" stroke-width="1.5" opacity="${oWindows}"/>
    <rect x="${cx + bodyW * 0.14}" y="${winY}" width="${winW}" height="${winH}" rx="4"
      fill="#e8e2da" stroke="#6e655c" stroke-width="1.5" opacity="${oWindows}"/>`;

  const corniceY = wallTop + bodyH * 0.12;
  const details = `
    <line x1="${left}" y1="${corniceY}" x2="${right}" y2="${corniceY}" stroke="#8a7f72" stroke-width="2" opacity="${oDetails}"/>
    <line x1="${left + bodyW * 0.15}" y1="${wallTop}" x2="${left + bodyW * 0.15}" y2="${baseY}" stroke="#a3998c" stroke-width="1.2" opacity="${oDetails * 0.85}"/>
    <line x1="${right - bodyW * 0.15}" y1="${wallTop}" x2="${right - bodyW * 0.15}" y2="${baseY}" stroke="#a3998c" stroke-width="1.2" opacity="${oDetails * 0.85}"/>
    <rect x="${cx - winW * 0.55}" y="${baseY - bodyH * 0.52}" width="${winW * 1.1}" height="${bodyH * 0.38}" rx="3"
      fill="none" stroke="#8a7f72" stroke-width="1" opacity="${oDetails * 0.7}"/>`;

  const doorW = bodyW * 0.22;
  const door = `
    <rect x="${cx - doorW / 2}" y="${baseY - bodyH * 0.42}" width="${doorW}" height="${bodyH * 0.42}" rx="2"
      fill="#d8d0c4" stroke="#5c554c" stroke-width="1.5" opacity="${Math.min(1, oWindows * 0.95 + oWalls * 0.3)}"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f7f2ea"/>
      <stop offset="45%" stop-color="#ebe3d6"/>
      <stop offset="100%" stop-color="#dfd4c6"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  ${gridPaths}
  ${foundation}
  ${walls}
  ${roof}
  ${windows}
  ${door}
  ${details}
  <text x="${width / 2}" y="${height - 20}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
    font-size="${Math.max(14, width * 0.018)}" fill="#5c554c" fill-opacity="0.55">${frameLabel}</text>
</svg>`;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeFrame(svg, outPath) {
  await sharp(Buffer.from(svg, "utf8"))
    .webp({ quality: 82, effort: 4 })
    .toFile(outPath);
}

async function generateVariant({ w, h, dir, frames }) {
  const absDir = path.join(ROOT, dir);
  await ensureDir(absDir);
  for (let i = 0; i < frames; i++) {
    const svg = buildSceneSvg(w, h, i, frames);
    const name = `frame_${pad4(i + 1)}.webp`;
    await writeFrame(svg, path.join(absDir, name));
  }
  console.log(`✓ ${frames} кадров → ${dir}`);
}

async function main() {
  console.log("Генерация тестовой последовательности (sharp → WebP)…");
  await generateVariant(DESKTOP);
  await generateVariant(MOBILE);
  console.log(
    `Готово: всего ${DESKTOP_FRAMES + MOBILE_FRAMES} файлов WebP (${DESKTOP_FRAMES} + ${MOBILE_FRAMES}).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
