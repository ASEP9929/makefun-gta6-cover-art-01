# Vice Cover Studio — make.fun gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/ASEP9929/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/ASEP9929/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Entry for the [make.fun bounty **gta6-cover-art-01** — "Make GTA 6 Cover Art"](https://make.fun/bounty/gta6-cover-art-01) ($250, 50 places).

## What it is

**Vice Cover Studio** turns your photos and a caption into a multi-panel
poster in the style of GTA 6's covers — bold caption lettering, a Vice City
sunset or neon colour grade, a sun and skyline silhouette — and exports it as
a PNG to share. Everything runs offline in the browser; photos are read on
your machine and never uploaded.

## How it works

1. **Photos** — add up to 4 of your own photos (or try the two built-in
   samples). Pick a slot, then crop it with the zoom and pan sliders. One
   photo can fill several panels.
2. **Layout & grade** — three panel layouts (*Sunset Strip*, *Four Corners*,
   *Skyline*) and three colour grades (*Sunset Vice*, *Neon Nights*,
   *Palm Dusk*), with a live preview.
3. **Caption** — a big title and a subtitle, edited live.
4. **Export** — one click saves a PNG at 1080 × 1080, 1080 × 1350, or
   1920 × 1080.

## Originality

The design, lettering treatment and code are original. No Rockstar Games
logo, wordmark, artwork, character or font is used anywhere. The only font
shipped is [Anton](https://github.com/googlefonts/AntonFont) under the SIL
Open Font License (`app/fonts/Anton-Regular.ttf`, license in
`app/fonts/OFL.txt`). The two sample photos under `app/samples/` were made
with an image model for make.fun and are free to use.

## Try it

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

No build step, no network request while it runs: every script, font and
image is a file under `app/`.

## Handing it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to `/output` and writes `/output/dossier.json` with the vendored
`vendor/makefun-app.ts` library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real renders of this app: the cover first,
then the editor with photos loaded, then covers in the other post sizes.
