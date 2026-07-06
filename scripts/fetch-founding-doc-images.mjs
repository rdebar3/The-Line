import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "founding-docs");

const SOURCES = [
  {
    id: "declaration",
    url: "https://www.archives.gov/files/founding-docs/downloads/Declaration_Pg1of1_AC.jpg",
    objectPosition: "center 35%",
  },
  {
    id: "constitution",
    url: "https://www.archives.gov/files/founding-docs/downloads/Constitution_Pg1of4_AC.jpg",
    objectPosition: "center 28%",
  },
  {
    id: "bill-of-rights",
    url: "https://www.archives.gov/files/founding-docs/downloads/Bill_of_Rights_Pg1of1_AC.jpg",
    objectPosition: "center 30%",
  },
];

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const source of SOURCES) {
    process.stdout.write(`Downloading ${source.id}… `);
    const raw = await download(source.url);
    process.stdout.write(`${(raw.length / 1_000_000).toFixed(1)} MB\n`);

    const cardPath = path.join(OUT_DIR, `${source.id}-card.jpg`);
    const fullPath = path.join(OUT_DIR, `${source.id}-source.jpg`);

    await sharp(raw)
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(fullPath);

    await sharp(raw)
      .resize({ width: 900, height: 520, fit: "cover", position: "centre" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(cardPath);

    const cardStats = await fs.stat(cardPath);
    const fullStats = await fs.stat(fullPath);
    console.log(
      `  card: ${(cardStats.size / 1024).toFixed(0)} KB · source: ${(fullStats.size / 1024).toFixed(0)} KB`
    );
  }

  const attribution = {
    credit: "Image: National Archives",
    sourcePage: "https://www.archives.gov/founding-docs/downloads",
    license: "Public domain — credit the National Archives as the original source.",
    files: SOURCES.map((source) => ({
      id: source.id,
      card: `/founding-docs/${source.id}-card.jpg`,
      source: `/founding-docs/${source.id}-source.jpg`,
      archivesUrl: source.url,
    })),
  };

  await fs.writeFile(
    path.join(OUT_DIR, "attribution.json"),
    `${JSON.stringify(attribution, null, 2)}\n`
  );

  console.log("Founding document images saved to public/founding-docs/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});