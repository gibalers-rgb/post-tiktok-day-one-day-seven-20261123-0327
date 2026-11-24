// render-frames.mjs — renders the Pixel Hop gameplay frames (raw RGB24, 1080x1920, 30fps)
// for the "Day one, day seven" TikTok video. Stdlib only. Frames go to stdout, piped to ffmpeg.
// Timeline: 0-8s day-1 build, 8-10s dimmed transition hold, 10-18s day-7 build, 18-21.5s day-7 close.
import { writeSync } from 'node:fs';

const W = 1080, H = 1920, FPS = 30;
const GROUND_Y = 1500;
const GAP_X0 = 540, GAP_X1 = 700; // same gap in both builds
const HERO = 110;
const SPEED = 110; // px per second, same in both builds

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- tiny raster helpers over one RGB24 frame buffer ----
function rgb(r, g, b) { return (r << 16) | (g << 8) | b; }
function fillRect(buf, x0, y0, x1, y1, c) {
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0));
  x1 = Math.min(W, Math.ceil(x1)); y1 = Math.min(H, Math.ceil(y1));
  const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
  for (let y = y0; y < y1; y++) {
    let o = (y * W + x0) * 3;
    for (let x = x0; x < x1; x++) { buf[o] = r; buf[o + 1] = g; buf[o + 2] = b; o += 3; }
  }
}
function fillCircle(buf, cx, cy, rad, c) {
  const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
  const y0 = Math.max(0, Math.floor(cy - rad)), y1 = Math.min(H, Math.ceil(cy + rad));
  for (let y = y0; y < y1; y++) {
    const dy = y - cy, dx = Math.sqrt(Math.max(0, rad * rad - dy * dy));
    const x0 = Math.max(0, Math.floor(cx - dx)), x1 = Math.min(W, Math.ceil(cx + dx));
    let o = (y * W + x0) * 3;
    for (let x = x0; x < x1; x++) { buf[o] = r; buf[o + 1] = g; buf[o + 2] = b; o += 3; }
  }
}
function dim(buf, f) {
  for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(buf[i] * f);
}

// ---- scene pieces ----
function drawSky(buf, day7, t) {
  if (!day7) { fillRect(buf, 0, 0, W, GROUND_Y, rgb(121, 199, 232)); return; }
  // soft vertical gradient bands
  const bands = [[126, 205, 236], [140, 212, 240], [158, 219, 243], [178, 227, 246], [198, 234, 249]];
  const bh = Math.ceil(GROUND_Y / bands.length);
  bands.forEach((c, i) => fillRect(buf, 0, i * bh, W, (i + 1) * bh, rgb(...c)));
  fillCircle(buf, 880, 260, 90, rgb(255, 236, 140)); // sun
  fillCircle(buf, 880, 260, 62, rgb(255, 244, 190));
  // drifting clouds
  const clouds = [[180, 300, 150], [620, 520, 190], [950, 180, 130]];
  for (const [bx, by, s] of clouds) {
    const cx = ((bx + t * 14) % 1400) - 160;
    fillCircle(buf, cx, by, s * 0.55, rgb(255, 255, 255));
    fillCircle(buf, cx + s * 0.45, by + 18, s * 0.45, rgb(255, 255, 255));
    fillCircle(buf, cx - s * 0.45, by + 22, s * 0.4, rgb(255, 255, 255));
  }
  // hills behind the ground line
  fillCircle(buf, 200, GROUND_Y + 260, 340, rgb(96, 176, 110));
  fillCircle(buf, 1020, GROUND_Y + 300, 300, rgb(84, 164, 100));
}
function drawGround(buf, day7) {
  // dirt with a pit gap in the middle (same gap both days)
  fillRect(buf, 0, GROUND_Y + 60, GAP_X0, H, rgb(138, 90, 59));
  fillRect(buf, GAP_X1, GROUND_Y + 60, W, H, rgb(138, 90, 59));
  // grass strip
  fillRect(buf, 0, GROUND_Y, GAP_X0, GROUND_Y + 60, rgb(88, 179, 104));
  fillRect(buf, GAP_X1, GROUND_Y, W, GROUND_Y + 60, rgb(88, 179, 104));
  // pit walls
  fillRect(buf, GAP_X0 - 8, GROUND_Y, GAP_X0, GROUND_Y + 260, rgb(110, 70, 46));
  fillRect(buf, GAP_X1, GROUND_Y, GAP_X1 + 8, GROUND_Y + 260, rgb(110, 70, 46));
  if (day7) {
    // grass tufts + flowers along the ground
    const rnd = mulberry32(7);
    for (let x = 40; x < W - 40; x += 90) {
      if (x > GAP_X0 - 60 && x < GAP_X1 + 60) continue;
      fillRect(buf, x, GROUND_Y - 26, x + 8, GROUND_Y, rgb(64, 150, 84));
      fillRect(buf, x + 14, GROUND_Y - 18, x + 22, GROUND_Y, rgb(64, 150, 84));
      if (rnd() > 0.5) {
        const fx = x + 44, fy = GROUND_Y - 34;
        fillRect(buf, fx, fy, fx + 5, GROUND_Y, rgb(64, 150, 84));
        fillCircle(buf, fx + 2, fy - 8, 11, rgb(255, 120, 170));
        fillCircle(buf, fx + 2, fy - 8, 5, rgb(255, 220, 90));
      }
    }
    // bushes
    fillCircle(buf, 120, GROUND_Y - 10, 46, rgb(70, 160, 90));
    fillCircle(buf, 1010, GROUND_Y - 8, 40, rgb(70, 160, 90));
  }
}
function drawCoin(buf, x, y, s = 1) {
  fillCircle(buf, x, y, 34 * s, rgb(232, 161, 0));
  fillCircle(buf, x, y, 28 * s, rgb(255, 201, 60));
  fillCircle(buf, x - 7 * s, y - 8 * s, 8 * s, rgb(255, 232, 150));
}
function drawHero(buf, x, y) {
  // orange square hero with eyes, mid-stride tilt omitted for a locked camera look
  fillRect(buf, x, y, x + HERO, y + HERO, rgb(255, 122, 26));
  fillRect(buf, x + 8, y + 8, x + HERO - 8, y + 26, rgb(255, 150, 60)); // top highlight
  fillRect(buf, x + 22, y + 38, x + 46, y + 62, rgb(255, 255, 255)); // eyes
  fillRect(buf, x + 64, y + 38, x + 88, y + 62, rgb(255, 255, 255));
  fillRect(buf, x + 30, y + 46, x + 40, y + 56, rgb(25, 20, 25));
  fillRect(buf, x + 72, y + 46, x + 82, y + 56, rgb(25, 20, 25));
  fillRect(buf, x + 38, y + 76, x + 72, y + 84, rgb(25, 20, 25)); // smile
  // little feet
  fillRect(buf, x + 14, y + HERO - 4, x + 42, y + HERO + 8, rgb(200, 80, 10));
  fillRect(buf, x + 68, y + HERO - 4, x + 96, y + HERO + 8, rgb(200, 80, 10));
}
function drawSlime(buf, x, t) {
  // bouncing green slime enemy (day 7 only)
  const bounce = Math.abs(Math.sin(t * 3.2)) * 90;
  const squash = 1 - Math.abs(Math.sin(t * 3.2)) * 0.25;
  const w = 110, h = 84 * squash;
  const y = GROUND_Y - h - bounce;
  fillRect(buf, x, y + 14, x + w, y + h, rgb(76, 175, 80));
  fillCircle(buf, x + w / 2, y + 16, w / 2 - 4, rgb(76, 175, 80));
  fillRect(buf, x + 26, y + 26, x + 44, y + 44, rgb(255, 255, 255));
  fillRect(buf, x + 66, y + 26, x + 84, y + 44, rgb(255, 255, 255));
  fillRect(buf, x + 31, y + 31, x + 39, y + 39, rgb(25, 20, 25));
  fillRect(buf, x + 71, y + 31, x + 79, y + 39, rgb(25, 20, 25));
}
function drawFlag(buf) {
  fillRect(buf, 985, GROUND_Y - 210, 993, GROUND_Y, rgb(60, 60, 60));
  // green triangle flag
  for (let i = 0; i < 64; i++) {
    fillRect(buf, 993, GROUND_Y - 210 + i, 993 + (64 - i) * 1.1, GROUND_Y - 209 + i, rgb(46, 160, 90));
  }
}
function drawSparkles(buf, cx, cy, age, rnd) {
  // 6 particles radiating for 0.5s after a coin is collected
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rnd() * 0.6;
    const d = age * 260;
    const px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d - age * 60;
    fillRect(buf, px - 6, py - 6, px + 6, py + 6, rgb(255, 220, 90));
  }
}

// ---- main render ----
const TOTAL_S = 21.5;
const totalFrames = Math.round(TOTAL_S * FPS);
const buf = Buffer.alloc(W * H * 3);
const coinsDay7 = [300, 460, 620, 780, 900].map((x) => ({ x, y: GROUND_Y - 190, collectedAt: -1 }));

for (let f = 0; f < totalFrames; f++) {
  const t = f / FPS;
  const day7 = t >= 10;
  const tSeg = day7 ? t - 10 : t;
  let heroX = 100 + SPEED * tSeg;
  // stop at the finish flag and idle-bob there for the closing shot
  let idleBob = 0;
  if (heroX > 880) { heroX = 880; idleBob = -10 * Math.abs(Math.sin(t * 4)); }
  const heroCx = heroX + HERO / 2;
  // jump over the gap, same parabola both days
  let yOff = 0;
  if (heroCx > GAP_X0 - 20 && heroCx < GAP_X1 + 20) {
    const p = (heroCx - (GAP_X0 - 20)) / ((GAP_X1 + 20) - (GAP_X0 - 20));
    yOff = -300 * Math.sin(Math.PI * Math.min(1, Math.max(0, p)));
  }
  const heroY = GROUND_Y - HERO + yOff + idleBob;

  drawSky(buf, day7, tSeg);
  drawGround(buf, day7);
  drawFlag(buf);

  if (!day7) {
    if (heroCx < 620 + 30) drawCoin(buf, 620, GROUND_Y - 190); // the one coin
  } else {
    for (const c of coinsDay7) {
      if (c.collectedAt < 0 && heroCx > c.x + 30) c.collectedAt = t;
      if (c.collectedAt < 0) drawCoin(buf, c.x, c.y);
      else if (t - c.collectedAt < 0.5) drawSparkles(buf, c.x, c.y, t - c.collectedAt, mulberry32(c.x));
    }
    drawSlime(buf, 770, tSeg);
    // floating dust motes / twinkles
    const rnd = mulberry32(99);
    for (let i = 0; i < 26; i++) {
      const px = rnd() * W, py = 200 + rnd() * 1000;
      const tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
      if (tw > 0.6) fillRect(buf, px, py, px + 7, py + 7, rgb(255, 240, 170));
    }
  }

  drawHero(buf, heroX, heroY);

  // 8-10s: dimmed hold of the day-1 end frame (transition)
  if (t >= 8 && t < 10) dim(buf, 0.32);

  writeSync(1, buf);
}
process.stderr.write(`rendered ${totalFrames} frames\n`);
