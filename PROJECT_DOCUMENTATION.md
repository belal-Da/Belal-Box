# Belal Box: Project Documentation (A to Z)

> বাংলা সারাংশ: Belal Box একটি Android অ্যাপ (APK) যা Claude অ্যাপের মতো এআই সহকারী ও কোডিং এজেন্ট। HTML/JS ওয়েব অ্যাপকে Capacitor দিয়ে APK বানানো হয়, GitHub Actions-এ বিল্ড হয়। নিজের API key দিয়ে যেকোনো মডেল (Claude, OpenRouter, OpenAI-compatible, GitHub Models ইত্যাদি) চালানো যায়। ভয়েস: Murf Falcon 2। ছবি দেখা, মাইক, ছবি তৈরি: Google Gemini। এই ফাইলটি অন্য কোনো AI-কে দিলে সে প্রজেক্ট বুঝে আপডেট করতে পারবে।

## 1. What it is
A mobile AI chat + coding-agent app styled like the Claude app. Pure client-side: no backend. All keys and chats live on the phone (localStorage for settings, IndexedDB for chats and gallery).

## 2. Stack and build pipeline
- Frontend: plain HTML + vanilla JS + CSS in `www/` (no bundler). External scripts: JSZip (cdnjs), jsPDF and pdf.js (lazy, cdnjs).
- Wrapper: Capacitor 7 (`@capacitor/core, android, cli, filesystem, share`; dev: `@capacitor/assets`). `capacitor.config.json`: appId `com.belal.box`, appName `Belal Box`, webDir `www`, androidScheme `https`.
- CI: `.github/workflows/build-apk.yml`, manual only (`workflow_dispatch`). Steps: Node 20, Java 21, `npm install`, `npx cap add android`, inject `RECORD_AUDIO` and `MODIFY_AUDIO_SETTINGS` into `AndroidManifest.xml` (sed), `npx @capacitor/assets generate --android` (icons from `assets/icon-only.png`, `icon-foreground.png`, `icon-background.png`), `npx cap sync android`, `./gradlew assembleDebug`, upload artifact `BelalBox-apk`.
- The `android/` folder is generated in CI and never committed.
- Native bridge use: `CapacitorHttp` (CORS-free requests, binary download), `Filesystem` + `Share` (saving files).

## 3. Repository layout
```
package.json, capacitor.config.json, README.md, PROJECT_DOCUMENTATION.md, .gitignore
.github/workflows/build-apk.yml
assets/icon-only.png, icon-foreground.png, icon-background.png
www/index.html   markup: header, chat, composer, sheets (overlays .ov)
www/style.css    all styling, CSS variables, light/dark
www/app.js       core: state, storage, markdown+file cards, LLM client, send/run/call, attachments, drawer
www/features.js  icons, i18n t(), settings schema, providers, web search, Murf voice, read-aloud highlight
www/lib.js       pure helpers (no DOM): axml, dexClasses, editApply, fenceOpen, dedupe
www/agent.js     project context (projCtx), edit apply, usage meter, document readers, zip/APK reader
www/studio.js    Studio: image and video generation, gallery
www/ui.js        sheets, artifact viewer, model picker, summary timeline, mic, boot()
www/logo.png     in-app logo
```
Script order in `index.html`: app, features, lib, agent, studio, ui. `ui.js` ends with `boot()`.

## 4. State and data model
- `cfg` (localStorage `bb_cfg`): `provs[]`, `active`, `lang` (en|bn|mix), `theme`, `font`, `stream`, `art`, `sum`, `cont`, `max`, `ctx`, `projCap`, `effort`, `search` (auto|always|off), `read`, `tavK`, `braveK`, `ltime`, `lw`, `mem`, `auto`, `noemo`, `wdim`, `wall`, `hap`, `hfK`, `hfM`, `polM`, `imgEng`, `vidEng`, `use{d,i,o}`, `tts{...}`. Migration flags `v4`, `v6` are handled in `boot()`.
- `cfg.tts`: Murf `mk` key, `mv` voice (Debarati), `ml` locale (bn-IN), `ms` style, `mm` model (falcon-2), `rg` region, `mr` speed, `mp` pitch, `pre` preload, `auto` read aloud, `mvl` loaded voice list; Gemini key `gemK`.
- Provider: `{name,type:'openai'|'anthropic',base,key,model,models[],meta{id:{v,r,t,c}},nokey,fav[],recent[],nv{},mtOk,rl,ok,err}`.
- `chats` (IndexedDB key `chats`): `{id,title,pin,msgs[],proj{},sum,cut,ctx,u{i,o},force[],hop}`.
- Message: `{r:'user'|'assistant', t, show, imgs[], names[], desc, hid, st, think, t0, src[], gimgs[], eds{}, lk, err}`.
- `F` (rebuilt on every render): files found in assistant text, key `msgIndex:n`; plain code blocks use `msgIndex:cN` with `p:1`.
- `c.proj`: map of latest file contents (uploads, pastes and AI output). It is the project memory.

## 5. Text protocols the model follows (system prompt `DEF` in app.js)
- `[[status: short English summary]]` lines become step rows and the Summary timeline.
- Files: fenced block with info string `lang path/name.ext`; four backticks for files that contain fences.
- Edits to existing files: fence `edit path` with `<<<<<<< SEARCH ... ======= ... >>>>>>> REPLACE`. Applied by `editApply` to `c.proj`; saves tokens versus rewriting.
- `[[remember: note]]` appends to long-term notes. `[[read: path]]` or `[[read: path#10-80]]` makes the app load that file and continue (up to 3 hops, hidden system user message).
- `/image prompt` generates an image through the Studio default engine.
- No emojis; reply language follows the Language setting.

## 6. LLM layer (`llm()` in app.js)
- OpenAI-compatible `/chat/completions` and Anthropic `/v1/messages` (header `anthropic-dangerous-direct-browser-access`). Base URL is normalised.
- Streaming SSE via `fetch`; any failure falls back to non-stream through `hx()` (CapacitorHttp in the APK, bypasses CORS).
- Auto-fixes on HTTP 400: `max_completion_tokens`, `stream_options`, Anthropic `cache_control`/array system, `thinking`/`reasoning`, lowering `max_tokens` (remembered as `p.mtOk`).
- Anthropic system prompt uses prompt caching. Effort setting maps to `reasoning_effort`/`reasoning` or Anthropic `thinking.budget_tokens`.
- Reasoning deltas (`reasoning_content`, `thinking_delta`) feed the live "Thinking" row.
- Usage: token counts from the API (or estimates) go to `addUse()`; headers `x-ratelimit-*` are stored in `p.rl` when exposed.

## 7. Big outputs and cost control
- `call()` loops: if the API reports truncation (`finish_reason=length`, `stop_reason=max_tokens`) or a code fence is still open (`fenceOpen`), it continues (max 12 passes). Continuation sends only the last user message, the partial answer and a tail snippet, and `dedupe()` removes repeated overlap.
- `projCtx()` sends a full project index plus only the most relevant files (name mention, keyword overlap, recency) up to `projCap` characters; the rest is fetched with `[[read:]]`.
- Chat compaction (`compact()`): when history exceeds `ctx` characters, the older half is summarised into `c.sum`; the project files stay available.
- Older images are dropped from history; non-vision models get a text description (`describeImgs`, Gemini) instead.
- Context meter bar `#ctxb` and the model picker show context, chat and daily usage.

## 8. Files and archives
- Attachments: images (resized), text/code files, pasted text over 1500 chars or 40 lines becomes a "PASTED" card, `.zip/.apk/.jar/.aar`, `.docx/.xlsx/.pptx/.pdf`.
- `unzip()` (agent.js): file tree with sizes, prioritised key files, text contents up to a budget. For APKs it decodes the binary `AndroidManifest.xml` and binary `res/*.xml` (`axml`), lists permissions, and extracts dex class names (`dexClasses`) grouped by package.
- All uploaded text lands in `c.proj`; the user message only gets a short stub, so files are not resent inside chat history.
- Output files appear as cards; two or more files become a folder tree card with zip download and HTML preview (`bundle()` inlines the project's CSS/JS). Android saving goes through Filesystem + Share.

## 9. Web search and live data (features.js)
- `needS()` decides in `auto` mode. `wsearch()`: Tavily (key) or Brave (key), else DuckDuckGo HTML (APK only), else Wikipedia; optional page reading through r.jina.ai; each step has a timeout. Results are injected as a system section and shown as source chips.
- `live()`: date/time and Open-Meteo weather (cached 30 min).

## 10. Voice: Murf Falcon 2
- Endpoint `POST https://{region}.api.murf.ai/v1/speech/stream`, header `api-key`, body `{text,voiceId,model:'falcon-2',locale:'bn-IN',format:'PCM',sampleRate:24000,style,rate,pitch}`. Raw 16-bit mono PCM is played through Web Audio as it streams.
- Text is split into chunks (first about 160 chars for fast start); the next chunk is prefetched (at most 2 requests in flight, matching Murf's concurrency limit of 2 outside US-East). Audio is cached per chunk; `preload()` caches the first chunk after each reply.
- Fallback: if browser `fetch` fails (CORS), the APK retries through CapacitorHttp.
- Read-aloud highlight: message words are wrapped in spans; a red highlight and a red progress bar follow `AudioContext.currentTime` (`rdPrep`).
- Settings include voice list loading (`mVoices`), speed, pitch, region, test button. Errors: 401/403 invalid key, 402 credits finished, 429 rate limit.

## 11. Gemini features (key in Settings > Google Gemini)
- Mic: records PCM with ScriptProcessor, builds WAV, transcribes with `gemini-2.5-flash` (`micGo`).
- Image understanding for non-vision models (`describeImgs`).
- Image generation `genImage` (`gemini-2.5-flash-image`, with model discovery) and Veo video (`veo`).

## 12. Studio (studio.js)
- Image engines: Pollinations FLUX (free, no key), Gemini image, Hugging Face FLUX (free token), and any custom provider model whose id looks like an image model (`/images/generations`).
- Video engines: Gemini Veo, custom provider video models (OpenAI Sora-style `/videos`, polling), and a free on-device "motion video" that turns images into a zoom WebM using canvas + MediaRecorder.
- Controls: style presets, aspect ratio, image count, video length, improve-prompt, gallery (IndexedDB `gallery`, 30 items), use in chat, animate, download.
- Free providers also preset: GitHub Models (needs a GitHub token with models access), Pollinations text (no key), NVIDIA NIM, Cerebras, OpenRouter (`:free` models).

## 13. Settings (schema `SEC` in features.js)
Profile, Models and providers (add preset, fetch models, test connection, ability probe, per-model badges), Web search, Date and weather, Capabilities (streaming, file cards, step summary, auto-continue, effort, max tokens, instructions), Studio, Memory (notes, auto notes, compaction size, project context size), Voice (Murf), Google Gemini, Appearance (color mode, font, no-emoji, wallpaper dimming, haptic, wallpaper), Language (en/bn/mix), Privacy and data (export/delete chats). `t('English|বাংলা')` does the translation; `mix` shows both.

## 14. UI components
Header (menu, title, artifacts, new chat, settings), chat list with Claude-style rows and cards, composer (plus sheet, model pill, mic, send), drawer (Studio button, chats with pin/share/rename/delete), sheets: Add to chat, Artifacts, Artifact viewer (copy, download, PDF, preview), Summary timeline, Model picker (favorites, effort, usage, search), Settings, Studio, HTML preview. Step rows colour by kind: search green, read blue, write orange, thinking purple.

## 15. Privacy and secrets
Keys are stored only in the app's localStorage on the phone. Never commit keys to the public repo. Requests go straight from the phone to each provider. Rotate any key that was ever pasted into a chat.

## 16. Known limits
- Browser (non-APK) use is limited by CORS for several services.
- Murf, Gemini and image/video quotas depend on the user's plan; Veo is usually paid.
- Provider-specific video APIs vary; only Sora-style and Veo are implemented.
- No code execution or inline charts yet. Connectors, Projects (multi-chat), notifications are not implemented.
- RAR/7z archives are not readable. Very large single files rely on `[[read: path#lines]]` and edit blocks.

## 17. How to update safely
1. Edit one module at a time; keep pure logic in `lib.js` and test it in node.
2. Run `node --check www/*.js`; the smoke test stubs the DOM and renders sample messages.
3. Upload changed files to GitHub, run **Build APK** manually, install the artifact.
4. If a feature needs a new Android permission, add it in the workflow's manifest step.

## 18. Roadmap ideas
Projects (shared files and instructions across chats), code execution sandbox and inline charts, Connectors (Drive, Gmail), notifications, offline model support (Ollama on LAN), richer diff viewer for edit blocks, multi-image video editing.
