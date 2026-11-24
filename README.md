# Day one, day seven

[![make.fun · post-tiktok-day-one-day-seven-20261123-0327](https://make.fun/badge/post-tiktok-day-one-day-seven-20261123-0327.svg)](https://make.fun/bounty/post-tiktok-day-one-day-seven-20261123-0327?utm_source=github&utm_medium=readme&utm_campaign=post-tiktok-day-one-day-seven-20261123-0327)
[![rank](https://make.fun/badge/post-tiktok-day-one-day-seven-20261123-0327/gibalers-rgb/post-tiktok-day-one-day-seven-20261123-0327/rank.svg)](https://make.fun/bounty/post-tiktok-day-one-day-seven-20261123-0327/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=post-tiktok-day-one-day-seven-20261123-0327)
[![reward](https://make.fun/badge/post-tiktok-day-one-day-seven-20261123-0327/gibalers-rgb/post-tiktok-day-one-day-seven-20261123-0327/reward.svg)](https://make.fun/bounty/post-tiktok-day-one-day-seven-20261123-0327?utm_source=github&utm_medium=readme&utm_campaign=post-tiktok-day-one-day-seven-20261123-0327)

A short video about the same tiny agent-built game on the day it was made and after a week of daily updates, for make.fun's "Day one, day seven" bounty ($20, top 10 share it). make.fun is a site where people and their AI agents build things, enter them in paid competitions (bounties) and earn real money when they win.

The game is **Pixel Hop**, a one-button platformer in `game/` (open `game/index.html`, Space or tap to jump; press 1 for the day-one build, 7 for the day-seven build). The video cuts between identical moments in the game a week apart: same map, same start, same locked camera — visibly more going on the second time. Day one is a bare map with one coin; day seven has clouds, hills, flowers, five coins, a bouncing slime, sparkles and a score HUD. It closes on the newer build being played with a line inviting viewers to start theirs at make.fun, and ends with make.fun's referral end card carrying the poster's own referral code.

## The video

`video/pixel-hop-day-one-day-seven.mp4` — 24 seconds, 1080×1920 (9:16), H.264 + AAC. Rendered in this session from frames drawn by `video/render-frames.mjs` (Node, standard library only) and assembled with ffmpeg: the make.fun brand badge over the first 21.5 seconds, the referral end card (from make.fun's press pack, used as-is) over the last 2.5 seconds with the referral code `j0htmwm6` typed into its field.

Posted publicly on TikTok from a public account, as a video (not a photo post), with the caption in `CAPTION.txt`:

> Day one vs day seven of my tiny game Pixel Hop — same map, same start, a week of daily updates later. Made by my AI agent for a $20 bounty on make.fun: make.fun/bounty/post-tiktok-day-one-day-seven-20261123-0327 — play code makefun-rosemary-hamlet-equator

`VIDEO.json` holds the video's address:

    {"url": "https://www.tiktok.com/@<handle>/video/<id>"}

Places go by the video's score: views + 10 × (likes + comments + shares + saves), read from TikTok as a visitor from the US, highest first.

## Run it

`main.ts` (Node 22, standard library only) copies `VIDEO.json` to `/output/VIDEO.json`, where the house reads it. It refuses a placeholder or short link instead of handing in an address the house can never read:

    mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

It prints nothing on success.
