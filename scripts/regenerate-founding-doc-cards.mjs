import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "founding-docs");

const CARD_CROPS = [
  { id: "declaration", position: "north" },
  { id: "constitution", position: "north" },
  { id: "bill-of-rights", position: "north" },
];

async function main() {
  for (const crop of CARD_CROPS) {
    const sourcePath = path.join(OUT_DIR, `${crop.id}-source.jpg`);
    const cardPath = path.join(OUT_DIR, `${crop.id}-card.jpg`);

    await sharp(sourcePath)
      .resize({
        width: 900,
        height: 520,
        fit: "cover",
        position: crop.position,
      })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(cardPath);

    const stats = await fs.stat(cardPath);
    console.log(`${crop.id}-card.jpg regenerated (${(stats.size / 1024).toFixed(0)} KB)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});