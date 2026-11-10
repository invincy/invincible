# Invincible video production

Follow [AGENTS.md](AGENTS.md), [CREATIVE_BIBLE.md](CREATIVE_BIBLE.md), [MAP_EDITOR.md](MAP_EDITOR.md) and the [permanent map production standard](docs/map-editor-production-standard.md). Produce documentary-style historical/geographic/science videos through the existing Creator workflow. A film is project data and media, not a new product page or title-specific renderer.

## Voiceover is the master clock

Use the approved script and actual supplied recording. Decode/probe the audio, record its duration and identity/hash, and deduplicate pasted script copies. Preserve original bytes and speed; do not apply a TTS speed setting again, regenerate narration or rewrite the script unless requested. Inspect the recording rather than assuming it matches the written text.

Create a cue sheet in the film's existing production location with these fields:

| Spoken anchor | Source start/end | Visual action | Animation start / arrival / hold / exit | Review status |
| --- | --- | --- | --- | --- |
| Exact phrase from the recording | Measured seconds | Camera, route, label or asset | Absolute timeline seconds | Confirmed, estimated or pending |

Derive cues from listening/alignment with the audio. Do not distribute words evenly, estimate timing from character counts or treat matching total duration as synchronization. Label weak alignments. Arrive at the relevant feature by the key spoken cue; hold long enough to understand it. Narration is not an instruction to add captions.

Evaluate motion from absolute time so seeking, replay and continuous playback agree. Preserve narration positions when editing scene order, trims or duration; review the existing timing-change proposal before applying it. Any intro shifts both scenes and audio together; keep speech onset, pauses and the ending intact.

## Production sequence

1. Inspect the current project, assets, original audio, schema and existing handoff. Establish deliverables and acceptance criteria from the user brief. New shorts default to 9:16, 1080×1920, 30 fps; preserve explicit formats and existing saved choices.
2. Source-check geography/history/science and build the audio-derived cue sheet. Inventory reusable library artwork and source credits before making new assets. Keep schematic demonstrations distinct from factual geography.
3. Build/import the canonical map JSON or complete Studio manifest using the existing review/apply flow. Follow Add assets & voiceover → Import your complete video → Review scenes & audio → Save / Export MP4. Open focused Map Editor for map work; return through its existing save/discard flow. Do not create an alternate film page.
4. Preview the busiest shot, longest label, key transitions and cue arrivals at output size and phone size. Use the saved presentation's safe areas, clear typography, restrained navy/gold cards and essential text. Fix missing assets, provider fallbacks, collisions and source errors before a long export.
5. Export a short representative segment with real motion and audio where applicable. Verify dimensions, readability, timing, streams and decode. Then run the complete native export once; re-export only when a demonstrated issue requires it. Do not substitute a successful sample for full-film review.
6. Save the editable project, canonical JSON, asset/source manifest, cue sheet and finished output references. Run acceptance checks below and report exactly what was reviewed.

## Use the existing render and audio paths

The standalone Map Editor MP4 path is silent. It renders the real map, camera and overlays at every frame timestamp; this deterministic native rendering is required. It is different from capturing a browser screenshot for every frame. Browser automation may operate the exporter and verify UI, but cannot become a substitute production renderer without explicit approval under AGENTS.md.

For a complete video with narration, prefer the existing Studio exporter when it meets the brief. `creator/video-studio/` owns the shared manifest, composition, audio and export; native maps reuse the history player. Reuse its audio clip timing, trimming, gain/fades, original media and account-owned shared library. Read [one video flow](docs/creator-single-flow.md) for current uploads/draft synchronization and [composition](docs/unified-studio-composition.md) for timing/encoding. Earlier local-only notes are historical. Missing originals or unavailable encoders must surface as errors.

If the task uses a silent native map output, finish it with the original narration through the existing finishing/mux workflow, with explicit time alignment. Muxing audio onto native frames is a finishing step, not permission to build another renderer. Check onset and tail, avoid unintended speech truncation or speed changes, and inspect the actual audio stream. Attaching a path or metadata does not make silent video audible. Report codec/player limits rather than silently substituting another output format.

## Completion evidence

- Reopen/reload the saved project or validated import; confirm scene order, IDs, narration, assets, save/recovery and affected editor features remain intact. Do not claim remote persistence from a local fixture.
- Inspect full-resolution and phone-size encoded frames, including opening, busy geography, long labels, scene boundaries and closing. Verify no debugging text, editing guides, accidental captions or unrelated film overlays appear; preserve required attribution.
- Play the finished video with the actual voiceover. Check spoken-cue arrivals, label entrances, route direction/reveal, camera holds, continuity, missing artwork, audio clipping and the final words. If listening or some passages were unavailable, name that limitation.
- Inspect encoded dimensions/aspect, frame rate, frame count/duration, audio/video start/end and codecs; decode all streams. Sample motion across relevant intervals so held screenshots cannot pass as animation. Encoding measurements do not alone certify editorial sync or historical accuracy.
- Run checks appropriate to the changed implementation under AGENTS.md and MAP_EDITOR.md. Keep results, baseline failures and unverified live/device behavior explicit. Do not repeatedly run unrelated suites or repair unrelated modules to finish a film.

Do not call a film complete, fully synced or production ready while required review remains unfinished. Do not publish or commit unless requested.

## Durable handoff between agents

Keep each film's brief at its existing location, otherwise `creator/history-data/<project>/`. Include the approved script, original audio identity/durable reference, reviewed and pending cues, canonical importable JSON, camera/layer schedule, asset IDs and rights, geographic sources/dates/precision, output references, exact branch/commit, checks/results and the next unfinished action. Keep private media in the existing authenticated library; this public repository must not receive private originals or secrets. No automatic upload, commit or migration is implied.

These instructions cover the reusable workflow; a film's names, troop totals, dates, title, timing and territorial interpretations stay in its own brief. ChatGPT may supply direction/scripts, Antigravity may execute routine work, and Codex may handle difficult bugs; all must read the same repository files and record verified progress rather than relying on chat memory.
