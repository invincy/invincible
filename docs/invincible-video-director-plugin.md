# Invincible Video Director plugin

## First working increment

The Invincible Video Director is a private, read-only MCP plugin foundation for
normal ChatGPT and Codex. ChatGPT makes editorial scene decisions; the existing
Invincible compiler validates those decisions and produces the same Creator
Studio, Map Editor and Motion Studio draft shapes used by the website. It is not
a second editor or renderer.

The local MCP endpoint is `http://127.0.0.1:8791/mcp`. The existing Image Studio
launcher starts it alongside the restricted local worker. It binds only to
loopback. Its current tools are:

- `get_creator_contract`: returns `creator-semantic-plan-v1`, the style profile,
  approved examples, renderer capabilities and the safe planning rules.
- `compile_creator_plan`: validates exactly one semantic scene per locked audio
  segment and compiles an editable draft without writing a project.

The compiler rejects invented IDs, timestamps and renderer values. User-supplied
custom geography is accepted only when it is explicitly marked reviewed and has
a source URL, date and precision note. Built-in generalized geography remains
compiler-owned. A successful compile is still a draft: maps, visual rhythm and
the encoded MP4 require review.

The portable plugin package is in `plugins/invincible-video-director`. The repo
marketplace entry is `.agents/plugins/marketplace.json`. For a private ChatGPT
test, start Invincible Image Studio, add a custom MCP server using ChatGPT's
Secure MCP Tunnel and the loopback `/mcp` endpoint, then install the resulting
personal plugin. Packaging the registered ChatGPT connection requires the
`plugin_asdk_app...` technical ID created by that connection; it cannot be
precomputed in source control.

## Cloud fallback

Script & scenes still tries the paired laptop's local Whisper service first.
When OpenAI planning is selected and that local timing request is unavailable,
the same authenticated `creatorOpenAiVideo` Function sends the final MP3 to the
OpenAI transcription API and restores the normal locked transcript checkpoint.
This fallback is billable OpenAI API usage. Local Whisper remains local and free.
The browser never receives the API key.

The hosted path currently uses `whisper-1` because the Creator contract needs
segment and word timestamps. `OPENAI_TRANSCRIPTION_MODEL` is server-configurable,
but a replacement must support the same timestamp response before activation.
Cloud timing accepts MP3 files up to 8 MB. Local timing retains its existing
15 MB limit.

## What this improves—and what it does not

The plugin fixes the model/compiler boundary: ChatGPT receives the actual allowed
vocabulary, the compiler returns executable scenes and explicit diagnostics, and
the model can correct a rejected semantic choice instead of writing unsupported
JSON. This should improve planning consistency and makes missing assets visible.

It does not magically add missing renderer primitives or guarantee attractive
camera framing. If the compiler's deterministic zoom, label, band, route or
overlay rule is poor, the compiled result can still be poor. That rule must be
improved once in the shared compiler. The next plugin increment should add a
preview/inspection tool and, only behind the existing reviewed Apply action,
project reads, generated-asset attachment and draft application.

## Verification

Run `npm run test:creator-plugin` for the live streamable-HTTP tool discovery and
native map compilation checks. Run `npm --prefix functions test` for cloud timing
normalization, MP3 validation and existing planning regressions. A ChatGPT Tunnel
test and a real paid transcription call remain deployment acceptance checks.
