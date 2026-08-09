# NeedThisDone Agent Operations

## Product goal

The private /dashboard is a useful browser-accessible operations tool for
running supervised work from any authenticated browser. It is not a public
client dashboard and it is not a replacement for OpenClaw's local control UI.

An operator can start a run, see each agent's dependencies and progress, review
the resulting research, outreach drafts, scripts, media, subtitles, and review
notes, then approve, reject, edit, regenerate, pause, resume, retry, cancel, or
emergency-stop the work.

The orchestration model is provider-agnostic. A run may combine OpenClaw
coordination, OpenRouter research or media generation, another approved LLM,
an on-host/local model, and a human reviewer. Each task records its role,
provider, model identifier, capabilities, inputs, outputs, and dependencies so
the operator can see how the final artifact was produced.

## Safety and operating boundary

- The Mac mini initiates outbound HTTPS requests to Vercel and loopback
  WebSocket/RPC requests to OpenClaw. OpenClaw is never publicly exposed.
- OPENROUTER_API_KEY and the OpenClaw gateway credential remain on the Mac
  mini/OpenClaw host. They are never stored in Supabase or sent to the
  browser.
- Agents may research public sources and prepare drafts or media. They cannot
  publish content, send email, spend money, or change connected accounts.
- Generated media is private Supabase Storage content and previews use
  short-lived authenticated signed URLs.
- The daily media ceiling is $0.99. An unknown, missing, or unreservable cost
  fails closed. Reservations happen before provider work and reconciliation
  records the actual cost afterward.
- Daily content defaults to one 7–15 second, 9:16 MP4 package per local day,
  with a 10-second default, thumbnail, script/storyboard, caption, and
  SRT/VTT subtitles. Voiceover is optional. Publishing is never automatic.

## Initial team

1. Coordinator — decomposes the request and records the plan.
2. Public-web researcher — gathers source-backed public evidence.
3. Outreach writer — turns accepted evidence into a draft; it cannot send.
4. Daily content producer — creates the script, media, composition, and
   subtitle package through the approved provider task.
5. Reviewer — checks artifacts and returns them to the operator approval queue.

The task records are deliberately extensible: adding a new provider or local
agent means registering its provider/model/capability metadata and bridge
adapter, not changing the browser's approval contract.

## Bridge contract

The TypeScript bridge polls signed Vercel endpoints, claims leased tasks,
connects to local OpenClaw through the pinned Gateway WebSocket protocol,
reports progress, and submits artifacts. Every request has a timestamp,
nonce, path-bound HMAC signature, lease check, and replay check.

The bridge does not receive a Supabase service-role key. Vercel's signed routes
perform the privileged database and Storage operations.

## Deployment prerequisites

Before enabling a real worker:

1. Apply and rehearse migration 086 locally.
2. Set OPENCLAW_BRIDGE_SECRET only on Vercel and the Mac mini.
3. Configure the Mac mini with the Vercel URL, operator owner UUID, worker ID,
   OpenClaw loopback URL/token, and OpenRouter credentials.
4. Pair or authorize the pinned OpenClaw Gateway protocol version and run the
   loopback smoke test.
5. Install the launchd supervisor only after signed heartbeat, lease, artifact,
   and emergency-stop checks pass.

The browser dashboard is the canonical interaction surface; OpenClaw's local
Control UI remains an operational diagnostic surface.
