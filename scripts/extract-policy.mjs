import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopPolicy = path.join(
  path.dirname(__dirname),
  "..",
  "политика.txt",
);
const html = fs.readFileSync(desktopPolicy, "utf8");

const needle = 'field="text" class="t-text t-text_md "';
let i = html.indexOf(needle);
if (i === -1) {
  i = html.indexOf('class="t-text t-text_md ');
}
if (i === -1) {
  console.error("block not found");
  process.exit(1);
}
const start = html.indexOf(">", i) + 1;
const endMarker = "</div></div></div></div></div></div>";
let end = html.indexOf(endMarker, start);
if (end === -1) end = html.indexOf("</div>", start + 1000);

let frag = html.slice(start, end);

// Strip scripts/styles
frag = frag.replace(/<script[\s\S]*?<\/script>/gi, "");
frag = frag.replace(/<style[\s\S]*?<\/style>/gi, "");

// Normalize breaks
frag = frag.replace(/<br\s*\/?>/gi, "\n");

// Block tags to newlines
frag = frag.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n");
frag = frag.replace(/<\/(ul|ol|table)>/gi, "\n\n");

// Remove remaining tags, keep text
frag = frag.replace(/<[^>]+>/g, " ");

// Decode minimal entities
frag = frag
  .replace(/&nbsp;/g, " ")
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

// Fix Tilda typo
frag = frag.replace(/в nотношении/gi, "в отношшении").replace(/отношшении/g, "отношении");

const lines = frag
  .split(/\n+/)
  .map((l) => l.replace(/\s+/g, " ").trim())
  .filter(Boolean);

// Find policy start
let startIdx = 0;
for (let j = 0; j < lines.length; j++) {
  if (lines[j].includes("Политика в отношении обработки персональных данных")) {
    startIdx = j;
    break;
  }
}

let policyLines = lines.slice(startIdx);
const cutMarkers = ["+7 (961)", "Заказать звонок", "Torrent search"];
for (const marker of cutMarkers) {
  const idx = policyLines.findIndex((line) => line.includes(marker));
  if (idx !== -1) {
    policyLines = policyLines.slice(0, idx);
    break;
  }
}

let out = policyLines.join("\n\n");
out = out.replace(/27\.07\.2006\.\s*№/g, "27.07.2006 №");
out = out.replace(/ООО "СК-ТЕХНОЛОГИЯ"/g, "ООО «СК-ТЕХНОЛОГИЯ»");
const outPath = path.join(__dirname, "policy-extracted.txt");
fs.writeFileSync(outPath, out, "utf8");
console.log("Wrote", outPath, "chars", out.length, "lines", policyLines.length);

const tsPath = path.join(path.dirname(__dirname), "data", "privacyPolicyBody.ts");
const escaped = out.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
fs.writeFileSync(
  tsPath,
  `/** Автоизвлечено из политика.txt (Tilda), служебный хвост обрезан. */\nexport const PRIVACY_POLICY_BODY = \`${escaped}\`;\n`,
  "utf8",
);
console.log("Wrote", tsPath);
