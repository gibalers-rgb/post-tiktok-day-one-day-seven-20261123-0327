// Pixel Hop — "Day one, day seven" entry for make.fun (Node 22, standard library only).
//
// The video is the entry: a 24s vertical clip of the same tiny game, Pixel Hop,
// on the day it was made and after a week of daily updates, posted publicly on
// TikTok. This program is the hand-in half of that entry: it reads VIDEO.json
// from the repository root and copies it to /output/VIDEO.json, where the
// house reads the video's address and fetches its views, likes, comments,
// shares and saves from TikTok. Nothing this program writes is scored.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// It prints nothing on success. Outside the grader's container the two env
// vars stand in for /bot and /output.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// A real TikTok video address: https://www.tiktok.com/@<handle>/video/<digits>.
// The starter placeholder (@<handle>/video/<id>) is not a video, so refuse it
// loudly instead of handing the house an address it can never read.
const VIDEO_URL = /^https:\/\/www\.tiktok\.com\/@[A-Za-z0-9._-]+\/video\/[0-9]+\/?$/;

const source = join(BOT_DIR, 'VIDEO.json');
let parsed: unknown;
try {
  // Tolerate a UTF-8 BOM, which some editors add and JSON.parse rejects.
  const text = readFileSync(source, 'utf8').replace(/^\uFEFF/, '');
  parsed = JSON.parse(text);
} catch (err) {
  console.error(`VIDEO.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

// The file must hold exactly one thing: the video's address. Anything else
// (a short link, a photo post, a playlist) is refused by the house, so refuse
// it here first, with the address that was actually found.
const url = (parsed as { url?: unknown } | null)?.url;
if (typeof url !== 'string' || !VIDEO_URL.test(url)) {
  console.error(
    `VIDEO.json does not name a TikTok video yet (got ${JSON.stringify(url)}). ` +
      `Post the video as a public video (not a photo post, not a short link), ` +
      `then put its full address, https://www.tiktok.com/@<handle>/video/<id>, in VIDEO.json.`,
  );
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const target = join(OUTPUT_DIR, 'VIDEO.json');
try {
  copyFileSync(source, target);
} catch (err) {
  console.error(`VIDEO.json could not be copied to ${OUTPUT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

// The gate reads the copy, so prove the copy is byte for byte the file that
// was just validated — a half-written output must fail here, not at the house.
if (!readFileSync(target, 'utf8').includes(url)) {
  console.error(`VIDEO.json copied to ${OUTPUT_DIR} does not contain the validated address.`);
  process.exit(1);
}
