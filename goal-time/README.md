# GOAL TIME ⚽

A soccer-themed learning app that **pays out** screen time.

The child earns watching by completing learning quests; the parent runs everything from a
PIN-protected dashboard. Personal family use — one household, one device (iPad-first), no
accounts, no server, no analytics.

**The core inversion:** this is a learning app that pays out screen time, not a screen-time
app with learning attached. The app boots into learning. Watching is the locked door that
learning opens.

---

## Run it

```bash
cd goal-time
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run preview    # serve the built app
```

`dist/` is committed so the app can be served straight from GitHub Pages with no build step
on the host. **Rebuild and commit `dist/` after any source change** — editing `src/` alone
does not change what is deployed.

Deployed path on this repo's Pages site: `/goal-time/dist/`. The Vite `base` is `./`, so the
built app also runs from any other directory, a plain static server, or a local copy.

### Install on the iPad

Open the URL in Safari → Share → **Add to Home Screen**. It runs full-screen as a PWA and
works offline (everything except Coach Chat, which falls back to its scripted tree).

---

## How it works

### Kid Mode — the pitch

The halfway line splits the screen into the only two things the child can do.

- **Top half — TRAIN**: today's match (3–4 stations + the penalty shootout finisher).
- **Centre circle**: star count, with Golden Balls counted separately and pending honor
  claims shown greyed out.
- **Bottom half — WATCH**: minutes left as a draining sun, padlocked until today's match is
  won (a parent toggle, default on).
- **Prize cabinet**: the current wishlist prize with photo and fill meter.
- **"I STOPPED ON TIME!"**: files a pending star for the parent to confirm.

Coach greets by name, aloud, in English, on every screen entry.

### The seven skill fields

| Field | What it does |
| --- | --- |
| Flags Match | National teams, flags and kits — "find the flag" |
| Count the Goals | Counting, then simple addition, soccer-flavoured |
| Letters Field | Letter recognition, then first words |
| Story Bench | Coach reads a short story aloud, then picture-answer questions |
| Art Corner | Daily drawing prompt; finishing earns the star, nobody judges the drawing |
| Fair Play | Manners scenarios — exists specifically to counter-model kidfluencer behaviour |
| English Academy | Listen & choose → Repeat with me → Coach Chat. In every daily quest. |

### The mastery rule

Content that is answered correctly twice in a row **retires and stops paying stars**. Sampling
draws fresh content at the child's edge, so difficulty visibly rises and no single easy task
can be farmed for minutes. When a field runs dry the child can still play — it just pays
nothing, and Coach says so kindly. Enforced in `src/lib/mastery.ts`, not per-station.

### Star economy

- **Stars** from quest stations, penalty goals, parent-logged chores, and confirmed honor claims.
- **Golden Ball** — parent-only, no fixed trigger, default 5⭐, biggest animation in the app.
- **Exchange** — default 3⭐ = 15 min, editable.
- **Weekly bonus cap** — 30–60 min/week (default 45) with a parent override switch. Enforced
  in the reducer (`tradeStars`), so no UI path can exceed it. Stars beyond the cap can only go
  to the wishlist; a trade that would breach the cap is simply not offered, so stars are never
  destroyed.
- **Saved stars are locked** — no action in the reducer moves them back out of a prize.

### Parent Mode — "Manager's Office" (PIN)

Today · Plan · Catalog · Tasks & Rewards · Progress. Navy, calm, deliberately nothing like
Kid Mode so the mode switch is unmistakable.

---

## Voice

- **Every screen speaks.** `speechSynthesis`, en-US, rate 0.85. Text on screen is a caption.
- **The child speaks back everywhere** — the mic is the primary input on every answerable
  question, with tap choices always visible beside it. Speaking earns a bonus quarter-star.
- **Scoring is deliberately lenient** (`src/lib/fuzzy.ts`): phonetic normalisation tuned for a
  Spanish-speaking child, containment matching, and a low pass bar. "mai neim is…" passes "my
  name is…".
- **No dead ends.** Two misses → Coach models the phrase slowly → the third attempt passes with
  encouragement.
- **Graceful degradation.** Capabilities are detected at startup. With no mic or a denied
  permission, the mic button never appears and every station is completable by tap. This is
  covered by an automated test.

Audio is armed from the first user gesture, which is what iPad Safari requires.

---

## Coach Chat

Two engines behind one interface (`src/lib/coach.ts`):

1. **Anthropic Messages API** when the parent has entered a key. Model is selectable; default
   `claude-sonnet-4-6`.
2. **A scripted dialogue tree** covering the same vocabulary — offline, no key, no network.

The API path falls back to the tree on a missing key, no network, a timeout, a refusal, or a
reply that fails a shape/safety check. **The child never sees an error, only Coach.**

The system prompt is hard-locked to the ESL script: one short sentence, a fixed beginner
vocabulary, never "wrong", never off-topic, never a request for personal information, and a
redirect for anything off-script. Only the child's **first name and age** are ever sent.
**Every transcript is stored and shown to the parent** in Progress.

### The API-key tradeoff, stated plainly

This app has no server, so a key entered in Parent Mode is stored in the browser and sent
straight from the device to Anthropic (using the `anthropic-dangerous-direct-browser-access`
header). Anyone with the unlocked device and devtools could read it. Use a key with a low
spending cap that you can rotate — or leave it blank and use the offline Coach, which is a
complete experience on its own.

---

## Safety and privacy

- All child data stays on-device (localStorage). JSON export/import in Plan → Backup.
- No ads, no third-party trackers, no external links reachable from Kid Mode.
- The PIN keeps a curious five-year-old out of settings. It is not protection against an adult
  with the device, and the UI says so.
- **The app never claims to control YouTube Kids.** The Catalog tab's checklist is the parent's
  own record; enforcement lives in the native app. Channels built around a child performer are
  excluded by policy — that genre is what Fair Play exists to counter-model.

---

## Architecture

```
src/
  lib/        types · store (one reducer) · db · economy · mastery · speech · fuzzy · coach · sfx
  content/    flags · counting · letters · stories · manners · english · art
  components/ Coach · AnswerPad (mic-first, tap-always) · Celebration · Bits
  kid/        KidHome · MatchDay · WatchTime · StarPayout · PenaltyShootout · CoachChat
              stations/  one file per skill field
  parent/     ParentMode · Today · Plan · Catalog · TasksRewards · Progress · PinGate
  onboarding/ Onboarding
  styles/     fonts · tokens · motion · kid · parent
```

Every write goes through the single reducer in `src/lib/store.tsx`, which is where the
economy invariants (weekly cap, locked savings) are enforced.

**Theming is a skin.** Soccer is the launch theme. Quests, stars, the wishlist and the parent
tabs are theme-agnostic; `Profile.theme` is set from the child's interests at onboarding, and a
future space or dinosaur theme is a content and asset swap, not a restructure.

**Motion** follows a frequency budget: presses get 140ms and nothing else, panels 180–240ms,
and keyframes are reserved for the rare celebrations that cannot be re-triggered mid-flight.
Only `transform`, `opacity` and `clip-path` animate. `prefers-reduced-motion` gets a gentler
variant, not zero.

Fonts are self-hosted (Lilita One + Nunito, Latin and Latin-Extended) so typography survives
with no network.

---

## Testing

The build is typechecked (`npm run typecheck`) and was driven end-to-end in headless Chromium
at iPad viewport. 25 checks pass, covering the acceptance criteria:

- fresh install → onboarding → win a match → unlock watch time
- Watch is padlocked before the match and unlocked after
- saved wishlist stars are never converted to minutes by any path
- weekly redeemed bonus minutes never exceed the cap
- with speech recognition removed, the whole match is completable by tap and no mic button appears
- the app renders and serves from cache with the network off
- the mastery engine records answers and retires content
- all five parent tabs render; the PIN gate works
- no uncaught page errors in either run

Not covered automatically: the Anthropic API path (needs a real key) and real-device iPad
Safari speech quirks. Test those on the actual iPad before daily use.
