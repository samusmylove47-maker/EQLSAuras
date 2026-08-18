# Encode recipe — EQL Source Auras band asset

**Status: FINAL.** Adjudicated 2026-08-18.

Encoded once, by hand, and committed. A rebuild must work on a machine without ffmpeg, so
`_build/media.py` copies `_media/` into `public/` under a content hash and drops the previous
copy — nothing here runs at build time. This file exists so the encode is reproducible if the
source is ever recut, not so it can be automated.

## Deliverables

| File | Size | Precedent | Spec |
|---|---|---|---|
| `_media/auras.mp4` | **892 KB** | Sky Ledger 949 KB | 1600x900, H.264 High, CRF 32, 30 fps, 6.8 s, **no audio stream at all** |
| `_media/auras-poster.jpg` | **149 KB** | existing poster 177 KB | 1600x900 JPEG, q3 |

Both come in under precedent. Source was 42.8 MB.

Filenames carry no `eqls-` prefix. A filename is reachable in view-source and the network tab, so
it is somewhere a reader could meet an internal abbreviation the site otherwise never uses.

## Source and cut

Source: `EQ AURAS BURST.mp4` — 1920x1080, 30 fps, 35.83 s, 9558 kb/s, with an AAC track that is
discarded. Supplied 2026-08-18.

Cut: **5.30 s to 12.10 s** of the source.

That window was chosen for what it excludes as much as for what it shows. Before 5.3 s there is no
overlay and nothing happens; from roughly 12.2 s the application window slides in, and from 11 s
the Windows Start menu and taskbar are on screen. The cut ends before all three. Keeping the
application window out of frame is a correctness matter, not a tidiness one — see `HANDOFF.md`.

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
coordinates, the party window, and a persistent dark rectangle at the top right of the source that
appears in every frame of the original and is very likely an empty widget drawing an opaque
background.

## Redaction — three regions, all blurred

Per CLAUDE.md section seven, "The site is generic, never personal": no character names anywhere a
reader sees. A landing-page hero video is none of the three standing exemptions, and it is the
most screenshotted artefact this project will produce.

All coordinates are in **source** space (1920x1080), applied before the crop. Gaussian, sigma 9.

| Region | Box | What it covers |
|---|---|---|
| Group window member | `185x32 +1048+452` | a third party's character name |
| Floating nameplate | `150x60 +880+305` | the owner's character name and guild tag |
| Pet window | `90x28 +1205+388` | the pet name |

The pet box is 90 wide, not 110: at 110 it clipped the leading digit of the pet's health and left
a stray "00" on screen, which reads as a bug. At 90 the health value survives intact.

All three boxes are static and were verified to hold at 5.35 s, 8.5 s and 12.05 s — the camera and
character do not move within the cut, so nothing drifts out from behind a box.

## The commands

ffmpeg 7.1. On the authoring machine there is no ffmpeg on PATH; the binary used was the static
one bundled with the already-installed `imageio-ffmpeg` Python package, resolved with:

```bash
python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"
```

The filter chain is shared by both commands. It splits the frame before each overlay because a
filter output label cannot be consumed twice:

```
[0:v]split=2[a][a2];[a2]crop=185:32:1048:452,gblur=sigma=9[b1];[a][b1]overlay=1048:452,split=2[c][c2];[c2]crop=150:60:880:305,gblur=sigma=9[b2];[c][b2]overlay=880:305,split=2[d][d2];[d2]crop=90:28:1205:388,gblur=sigma=9[b3];[d][b3]overlay=1205:388,crop=976:549:482:0,scale=1600:900:flags=lanczos,setsar=1[v]
```

Video:

```bash
ffmpeg -y -ss 5.3 -t 6.8 -i "EQ AURAS BURST.mp4" -filter_complex "[0:v]split=2[a][a2];[a2]crop=185:32:1048:452,gblur=sigma=9[b1];[a][b1]overlay=1048:452,split=2[c][c2];[c2]crop=150:60:880:305,gblur=sigma=9[b2];[c][b2]overlay=880:305,split=2[d][d2];[d2]crop=90:28:1205:388,gblur=sigma=9[b3];[d][b3]overlay=1205:388,crop=976:549:482:0,scale=1600:900:flags=lanczos,setsar=1[v]" -map "[v]" -an -c:v libx264 -preset veryslow -crf 32 -pix_fmt yuv420p -profile:v high -level 4.0 -movflags +faststart _media/auras.mp4
```

Poster — same chain, single frame at 10.4 s absolute, which is 5.1 s into the cut:

```bash
ffmpeg -y -ss 10.4 -i "EQ AURAS BURST.mp4" -frames:v 1 -filter_complex "[0:v]split=2[a][a2];[a2]crop=185:32:1048:452,gblur=sigma=9[b1];[a][b1]overlay=1048:452,split=2[c][c2];[c2]crop=150:60:880:305,gblur=sigma=9[b2];[c][b2]overlay=880:305,split=2[d][d2];[d2]crop=90:28:1205:388,gblur=sigma=9[b3];[d][b3]overlay=1205:388,crop=976:549:482:0,scale=1600:900:flags=lanczos,setsar=1[v]" -map "[v]" -q:v 3 _media/auras-poster.jpg
```

`-an` is doing real work in the first command: it drops the stream rather than muting it, so the
file carries no audio track. The source's AAC track is near-silent game ambience (mean −45 dB)
with no narration, so nothing is lost.

## CRF 32, and why that is not a drift from the precedent

**Ruled: the precedent is a size precedent — 949 KB — not a CRF precedent.** CRF 28 was the means
to that size for slower footage. This is seven seconds of dense particle animation, which is the
most expensive thing you can hand an H.264 encoder.

Measured on the pre-redaction cut, same chain otherwise:

| CRF | Size |
|---|---|
| 28 | 1489 KB |
| 30 | 1143 KB |
| 31 | 1015 KB |
| **32** | **933 KB** |
| 33 | 806 KB |

Denoise was tried before touching CRF and returned almost nothing (1413 KB at CRF 28) because the
particles are signal, not noise. The fidelity cost of CRF 32 is close to nothing here: the image is
upscaled from a 976x549 crop, so the quality ceiling is set by the crop, not by the CRF.

Adding the two extra blur regions took the final file from 933 KB to **892 KB** — blurred areas
carry less high-frequency detail, so redaction bought back headroom rather than costing any.

Holding CRF 28 would have meant trimming to about 4.3 s and losing the before-state, trading the
thing that makes the clip legible without a caption for a constant that was never the point.

## Wiring notes

- `autoplay muted loop playsinline`, with `auras-poster.jpg` as `poster`.
- The file has **no audio track**, so do not render controls that imply sound.
- Below 700 px and under `prefers-reduced-motion`, show the poster alone — matching the existing
  behaviour rather than introducing new behaviour.
- Served from the site's own origin. No YouTube, no iframe, no third-party embed: the home page
  states that nothing is reported to anyone before a reader clicks, and an embed would make that
  sentence false on the one page that makes it.
- The clip does not loop seamlessly — it opens with no overlay and ends with fourteen timers up.
  That asymmetry is the content. A hard cut back to the head is correct; do not crossfade.
