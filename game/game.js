// Pixel Hop — the tiny game in the "Day one, day seven" video.
// One-button platformer: run right, jump the gap, collect the coins, reach
// the flag. Day 1 is the bare first build (one coin, nothing else); day 7 is
// the same map after a week of daily updates (clouds, hills, flowers, five
// coins, a bouncing slime, score and lives). Same map, same start, same
// camera — the change is the whole story.
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const hud = document.getElementById('hud');

const W = 540, H = 960, GROUND = 750;
const GAP0 = 270, GAP1 = 350; // the same gap in both builds
const DAY7_COINS = [150, 230, 310, 390, 450];

let day = 7;
let hero = { x: 50, y: GROUND - 55, vy: 0, onGround: true };
let coins = [];
let score = 0, lives = 3, won = false, t = 0;

function reset(d) {
  day = d;
  hero = { x: 50, y: GROUND - 55, vy: 0, onGround: true };
  coins = (d === 1 ? [310] : DAY7_COINS).map((x) => ({ x, y: GROUND - 95, taken: false }));
  score = 0; won = false;
  hud.textContent = d === 1 ? 'DAY ONE — bare map, one coin.' : 'DAY SEVEN — a week of daily updates.';
}

function jump() {
  if (hero.onGround && !won) { hero.vy = -11; hero.onGround = false; }
}

function step() {
  t += 1;
  if (!won) {
    hero.x = Math.min(hero.x + 1.6, 470);
    hero.vy += 0.5;
    hero.y += hero.vy;
    const overGap = hero.x + 55 > GAP0 && hero.x < GAP1;
    if (hero.y >= GROUND - 55 && !overGap) { hero.y = GROUND - 55; hero.vy = 0; hero.onGround = true; }
    else if (hero.y >= GROUND - 55 && overGap) { hero.onGround = false; }
    if (hero.y > H) { lives -= 1; if (lives <= 0) { reset(day); lives = 3; return; } hero.x = 50; hero.y = GROUND - 55; hero.vy = 0; }
    for (const c of coins) {
      if (!c.taken && Math.abs(hero.x + 27 - c.x) < 34 && Math.abs(hero.y + 27 - c.y) < 40) {
        c.taken = true; score += 1;
      }
    }
    // Day 7 only: the bouncing slime is dangerous — touching it costs a life.
    if (day === 7 && hero.x + 55 > 385 && hero.x < 440 && hero.y + 55 > GROUND - 45) {
      lives -= 1;
      if (lives <= 0) { reset(day); lives = 3; return; }
      hero.x = 50; hero.y = GROUND - 55; hero.vy = 0;
    }
    if (hero.x >= 465) won = true;
  }
}

function draw() {
  ctx.fillStyle = day === 1 ? '#79c7e8' : '#8ed4f2';
  ctx.fillRect(0, 0, W, GROUND);
  if (day === 7) {
    ctx.fillStyle = '#fff';
    for (const [bx, by] of [[90, 150], [310, 260], [470, 90]]) {
      const cx = ((bx + t * 0.7) % 700) - 80;
      ctx.beginPath(); ctx.arc(cx, by, 28, 0, 7); ctx.arc(cx + 26, by + 8, 20, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#60b06e';
    ctx.beginPath(); ctx.arc(100, GROUND + 130, 170, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(480, GROUND + 150, 150, 0, 7); ctx.fill();
  }
  // ground with the pit
  ctx.fillStyle = '#8a5a3b';
  ctx.fillRect(0, GROUND + 30, GAP0, H - GROUND);
  ctx.fillRect(GAP1, GROUND + 30, W, H - GROUND);
  ctx.fillStyle = '#58b368';
  ctx.fillRect(0, GROUND, GAP0, 30);
  ctx.fillRect(GAP1, GROUND, W - GAP1, 30);
  if (day === 7) {
    ctx.fillStyle = '#4caf50';
    const bounce = Math.abs(Math.sin(t * 0.09)) * 45;
    ctx.fillRect(385, GROUND - 42 - bounce, 55, 42);
    ctx.fillStyle = '#fff';
    ctx.fillRect(398, GROUND - 32 - bounce, 10, 10);
    ctx.fillRect(418, GROUND - 32 - bounce, 10, 10);
    for (const c of coins) if (!c.taken) {
      ctx.fillStyle = '#e8a100'; ctx.beginPath(); ctx.arc(c.x, c.y, 17, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffc93c'; ctx.beginPath(); ctx.arc(c.x, c.y, 14, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#123'; ctx.font = 'bold 24px system-ui';
    ctx.fillText(`SCORE: ${score}   LIVES: ${lives}`, 20, 40);
  } else {
    for (const c of coins) if (!c.taken) {
      ctx.fillStyle = '#e8a100'; ctx.beginPath(); ctx.arc(c.x, c.y, 17, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffc93c'; ctx.beginPath(); ctx.arc(c.x, c.y, 14, 0, 7); ctx.fill();
    }
  }
  // hero
  ctx.fillStyle = '#ff7a1a';
  ctx.fillRect(hero.x, hero.y, 55, 55);
  ctx.fillStyle = '#fff';
  ctx.fillRect(hero.x + 11, hero.y + 19, 12, 12);
  ctx.fillRect(hero.x + 32, hero.y + 19, 12, 12);
  ctx.fillStyle = '#191419';
  ctx.fillRect(hero.x + 15, hero.y + 23, 5, 5);
  ctx.fillRect(hero.x + 36, hero.y + 23, 5, 5);
  ctx.fillRect(hero.x + 19, hero.y + 38, 17, 4);
  // flag
  ctx.fillStyle = '#3c3c3c'; ctx.fillRect(492, GROUND - 105, 4, 105);
  ctx.fillStyle = '#2ea05a';
  ctx.beginPath(); ctx.moveTo(496, GROUND - 105); ctx.lineTo(528, GROUND - 89); ctx.lineTo(496, GROUND - 73); ctx.fill();
  if (won) {
    ctx.fillStyle = '#123'; ctx.font = 'bold 34px system-ui';
    ctx.fillText('You made it!', 180, 400);
  }
}

function loop() { step(); draw(); requestAnimationFrame(loop); }

document.getElementById('day1').onclick = () => reset(1);
document.getElementById('day7').onclick = () => reset(7);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); jump(); }
  if (e.key === '1') reset(1);
  if (e.key === '7') reset(7);
});
cv.addEventListener('pointerdown', jump);

reset(7);
loop();
