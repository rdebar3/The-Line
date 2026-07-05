import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const input = path.join(root, "public/hero/hero-chamber-scroll.mp4");
const outputDir = path.join(root, "public/hero/frames");
const manifestPath = path.join(root, "public/hero/frames/manifest.json");

const FPS = 30;

mkdirSync(outputDir, { recursive: true });

execFileSync(
  ffmpegPath,
  [
    "-y",
    "-i",
    input,
    "-vf",
    `fps=${FPS},scale=1280:-2`,
    "-q:v",
    "3",
    path.join(outputDir, "frame_%04d.jpg"),
  ],
  { stdio: "inherit" }
);

const { readdirSync } = await import("node:fs");
const frameFiles = readdirSync(outputDir)
  .filter((name) => name.startsWith("frame_") && name.endsWith(".jpg"))
  .sort();

writeFileSync(
  manifestPath,
  JSON.stringify(
    {
      count: frameFiles.length,
      fps: FPS,
      pattern: "/hero/frames/frame_%04d.jpg",
    },
    null,
    2
  )
);

console.log(`Extracted ${frameFiles.length} frames to public/hero/frames/`);