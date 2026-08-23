# Google API and Calendar readiness

> Live Calendar setup is checklist item 19 in the [canonical launch checklist](LAUNCH_CHECKLIST.md). Cloud promotion is the active critical path, but Calendar credentials, hosted migration `073`, OAuth, event canaries, and cleanup remain separately approved. Scheduling may remain manual during the pilot.

## What we have

There are two separate Google integrations:

```text
Google application sign-in      Google Calendar
NextAuth -> Supabase ID bridge   OAuth + Calendar REST adapter
        |                              |
        v                              v
   app session                 consultation scheduling
```

The Calendar integration currently includes:

- Admin-only connect, callback, status, and disconnect routes.
- OAuth token exchange, refresh, email lookup, encrypted Supabase token storage, and disconnect.
- Low-level free/busy, create-event, update-event, and delete-event calls in `app/lib/google-calendar.ts`.
- An operator-only durable operation route that creates keys server-side,
  returns operation IDs, derives deterministic event IDs, and retries only from
  stored operation and project references.
- Local proof that Calendar tokens are encrypted, plaintext columns are cleared, and the narrow database RPCs work.
- A signed, 15-minute OAuth state bound to the authenticated Supabase admin and a 256-bit browser nonce. The callback re-verifies admin access, rejects forged/cross-user/missing-cookie state before token exchange, and consumes the path-scoped HttpOnly cookie on every callback result.

## What is missing

- No controlled live Google Calendar API check has been completed.
- No reviewed operator UI currently invokes the retained operation route.
- The local durable operation/reference implementation has not been promoted or
  exercised against Google; hosted evidence still ends at migration `095` and
  the current application candidate remains local through `106`.
- The server-only `CALENDAR_TOKEN_ENCRYPTION_KEY` is not provisioned for this candidate.
- A controlled hosted OAuth callback has not yet proved production cookie, redirect, and provider configuration behavior.

## Controlled test plan

1. Create a Google Cloud OAuth app in testing mode, restrict test users, and register only the local callback and later the approved hosted callback.
2. Generate a server-only random `CALENDAR_TOKEN_ENCRYPTION_KEY` of at least 32 characters; do not put it in browser code or Git.
3. Complete the OAuth flow with an operator test account and verify the encrypted token row contains no plaintext token.
4. Call free/busy for a dedicated test calendar and confirm the result is scoped to the authorized account.
5. Confirm one consultation as an operator and create exactly one event with attendee, time zone, reminders, and a durable external event ID.
6. Retry with the returned operation ID and prove that the stored key addresses
   the same event without creating a second event.
7. Update and cancel only the stored test event and verify attendee updates.
   Delete it without notifications only under the explicit
   `test_or_accidental` cleanup reason, then disconnect the account.

```text
Customer requests time
        |
        v
Supabase consultation record
        |
        v
Abe/Andrea confirms
        |
        v
Google Calendar event + reminders
        |
        v
Retry-safe event reference in Supabase
```

Google Calendar must remain a human-confirmed scheduling tool. It must not become an autonomous outreach or appointment engine.

## Evidence boundary

Local token-encryption tests prove database storage behavior. Mocked adapter tests can prove request mapping and error handling. Only the controlled test-account flow above proves the Google API, OAuth redirect, token refresh, event behavior, reminders, and cleanup together.

## Rollback

Cancel the event with attendee updates. Delete it without notifications only if
it is a test or accidental fixture, disconnect the test account, remove the
server secret, and leave consultation confirmation in the manual-calendar path.
Do not delete encrypted tokens, operation history, or event references, and do
not apply a reverse migration ad hoc; hosted migration and deployment changes
require the existing approval process.
