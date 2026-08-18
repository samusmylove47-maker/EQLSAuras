# Encode recipe — EQLS Auras band asset

Encoded once, by hand, and committed. A rebuild must work on a machine without ffmpeg, so
`_build/media.py` copies `_media/` into `public/` under a content hash and drops the previous
copy — nothing here runs at build time. This file exists so the encode is reproducible if the
source is ever recut, not so it can be automated.

## Deliverables

| File | Size | Precedent | Spec |
|---|---|---|---|
| `_media/eqls-auras.mp4` | **933 KB** | Sky Ledger 949 KB | 1600x900, H.264 High, CRF 32, 30 fps, 6.8 s, **no audio stream at all** |
| `_media/eqls-auras-poster.jpg` | **152 KB** | existing poster 177 KB | 1600x900 JPEG, q3 |

Both come in under the precedent. Source was 42.8 MB.

## Source and cut

Source: `EQ AURAS BURST.mp4` — 1920x1080, 30 fps, 35.83 s, 9558 kb/s, with an AAC track that is
discarded. Supplied 2026-08-18.

Cut: **5.30 s to 12.10 s** of the source.

That window was chosen for what it excludes as much as for what it shows. Before 5.3 s there is no
overlay and nothing happens; from roughly 12.2 s the application window slides in, and from 11 s
the Windows Start menu and taskbar are on screen. The cut ends before all three. See
`HANDOFF.md` for why keeping the application window out of frame is a correctness matter and not
a tidiness one.

The arc inside the cut, which is the reason it works silently:

| Into the cut | What is on screen |
|---|---|
| 0.0-1.0 s | game only, no overlay — establishes the before-state |
| ~1.0-2.5 s | buffs land and the timer tiles populate one by one |
| ~2.5-4.5 s | all fourteen tiles up, spell art and countdowns legible, particle burst peaking |
| ~4.5-6.8 s | particles clear, fourteen countdowns sitting steady |

## Framing

Crop `976x549` at offset `+482+0` from the 1920x1080 source, then scale to 1600x900 (a 1.64x
punch-in) with lanczos.

The punch-in is deliberate. At full frame the overlay is about 46% of the width, and once the band
renders at 700-900 px on a real page the countdowns stop being readable — it would look like a
screenshot of a game rather than a demonstration of a timer overlay. The crop also removes, for
free: the taskbar, the chat pane, the loot log, the hotbars, the ability tooltip, the compass and
coordinates, and a persistent dark rectangle at the top right of the source that appears in every
frame of the original and is very likely an empty widget drawing an opaque background.

## Redaction

One region is blurred: `185x32` at `+1048+452` in source coordinates, covering the group window's
member name. That is a **third party's character name**, and it is the only content in frame
belonging to someone who has not agreed to appear on the site. Gaussian blur, sigma 9, applied
before the crop.

Still visible and **not** redacted, because they belong to the project owner rather than a third
party — this is the Director's call, not mine, and is raised in `HANDOFF.md`:

- the player character name and guild tag on the floating nameplate, centre frame
- the pet name, right of frame

If you want those gone too, add to the filter chain before the crop:

```bash
crop=210:46:1370:555,gblur=sigma=9[n];[0:v][n]overlay=1370:555
```

## The commands

ffmpeg 7.1. On the authoring machine there is no ffmpeg on PATH; the binary used was the static
one bundled with the already-installed `imageio-ffmpeg` Python package, resolved with:

```bash
python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"
```

Video:

```bash
ffmpeg -y -ss 5.3 -t 6.8 -i "EQ AURAS BURST.mp4" -filter_complex "[0:v]crop=185:32:1048:452,gblur=sigma=9[bl];[0:v][bl]overlay=1048:452,crop=976:549:482:0,scale=1600:900:flags=lanczos,setsar=1[v]" -map "[v]" -an -c:v libx264 -preset veryslow -crf 32 -pix_fmt yuv420p -profile:v high -level 4.0 -movflags +faststart _media/eqls-auras.mp4
```

Poster — same filter chain, single frame at 10.4 s absolute, which is 5.1 s into the cut:

```bash
ffmpeg -y -ss 10.4 -i "EQ AURAS BURST.mp4" -frames:v 1 -filter_complex "[0:v]crop=185:32:1048:452,gblur=sigma=9[bl];[0:v][bl]overlay=1048:452,crop=976:549:482:0,scale=1600:900:flags=lanczos,setsar=1[v]" -map "[v]" -q:v 3 _media/eqls-auras-poster.jpg
```

`-an` is doing real work in the first command: it drops the stream rather than muting it, so the
file carries no audio track. The source's AAC track is near-silent game ambience with no narration
and nothing is lost.

## One deviation from the precedent, stated plainly

**The precedent is CRF 28. This is encoded at CRF 32.** Do not read that as the recipe drifting.

At CRF 28 this exact cut encodes to **1489 KB** — 57% over the 949 KB precedent. The Sky Ledger
trailer is a slower piece; this is seven seconds of dense particle animation, which is the single
most expensive thing you can hand an H.264 encoder. Denoising was tried first and returned almost
nothing (1413 KB) because the particles are signal, not noise.

Measured, same cut, same chain:

| CRF | Size |
|---|---|
| 28 | 1489 KB |
| 30 | 1143 KB |
| 31 | 1015 KB |
| **32** | **933 KB** |
| 33 | 806 KB |

CRF 32 was chosen because the fidelity cost here is close to nothing: the image is upscaled from a
976x549 crop, so there is no real detail above roughly CRF 28-at-native for the encoder to throw
away. The quality ceiling is set by the crop, not by the CRF.

**If holding CRF 28 matters more than holding the arc**, the same chain at CRF 28 trimmed to about
4.3 s comes in under 949 KB. That buys the stated recipe at the cost of the before-state, which is
the thing that makes the clip legible without a caption. I recommend keeping the arc, but the
trade is yours and the numbers above are what it costs either way.

## Wiring notes

- `autoplay muted loop playsinline`, with `eqls-auras-poster.jpg` as `poster`.
- The file has **no audio track**, so do not render controls that imply sound.
- Below 700 px and under `prefers-reduced-motion`, show the poster alone — matching the existing
  behaviour rather than introducing new behaviour.
- Served from the site's own origin. No YouTube, no iframe, no third-party embed: the home page
  states that nothing is reported to anyone before a reader clicks, and an embed would make that
  sentence false on the one page that makes it.
- The clip does not loop seamlessly — it opens with no overlay and ends with fourteen timers up.
  That asymmetry is the content. A hard cut back to the head is correct; do not crossfade.
