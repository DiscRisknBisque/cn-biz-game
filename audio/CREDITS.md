# Audio credits

The game synthesises everything it can — the whole soundtrack and every other
sound effect are generated at runtime from oscillators, with no files involved.
This directory is the one exception.

| File | Used for | Source | Licence |
|---|---|---|---|
| `sad-trombone.mp3` | the fail sting: a creature escaping, and a losing ending | supplied by the project owner | **to be confirmed before publishing** |

## Before you publish this

`sad-trombone.mp3` was supplied as an upload and its provenance has not been
verified here. The "sad trombone / wah-wah" sting is widely circulated and the
individual recordings carry a range of licences — some public domain, some
CC-BY needing attribution, some not free to redistribute at all. Confirm which
one this is and fill in the table above before shipping the game anywhere
public.

If it turns out not to be redistributable, deleting the file is enough: the
game detects a missing or unfetchable sample and falls back to the synthesised
sting in `js/audio.js` without any other change.

## What was done to the file

The trailing 1.25 s of silence was cut at the MPEG frame boundary — whole
frames dropped, nothing re-encoded, so the audio is bit-identical to the
original up to the cut. 142 KB to 96 KB, 3.50 s to 2.35 s.
