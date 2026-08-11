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
- Local proof that Calendar tokens are encrypted, plaintext columns are cleared, and the narrow database RPCs work.
- A signed, 15-minute OAuth state bound to the authenticated Supabase admin and a 256-bit browser nonce. The callback re-verifies admin access, rejects forged/cross-user/missing-cookie state before token exchange, and consumes the path-scoped HttpOnly cookie on every callback result.

## What is missing

- No controlled live Google Calendar API check has been completed.
- No retained consultation caller creates, updates, or cancels a Calendar event.
- Event idempotency and a durable `calendar_event_id`/retry record are not implemented.
- The consultation caller and durable event-idempotency reference must be implemented before checklist item 19 can pass.
- The hosted `073` encryption migration remains pending, and the server-only `CALENDAR_TOKEN_ENCRYPTION_KEY` is not provisioned.
- A controlled hosted OAuth callback has not yet proved production cookie, redirect, and provider configuration behavior.

## Controlled test plan

1. Create a Google Cloud OAuth app in testing mode, restrict test users, and register only the local callback and later the approved hosted callback.
2. Generate a server-only random `CALENDAR_TOKEN_ENCRYPTION_KEY` of at least 32 characters; do not put it in browser code or Git.
3. Complete the OAuth flow with an operator test account and verify the encrypted token row contains no plaintext token.
4. Call free/busy for a dedicated test calendar and confirm the result is scoped to the authorized account.
5. Confirm one consultation as an operator and create exactly one event with attendee, time zone, reminders, and a durable external event ID.
6. Retry the same confirmation/idempotency key and prove that no second event is created.
7. Update and cancel the test consultation, verify the corresponding Google event changes, then delete all test fixtures and disconnect the account.

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

Disconnect the test account, delete the test events, remove the server secret, and leave consultation confirmation in the manual-calendar path. Do not delete the encrypted token schema or apply a reverse migration ad hoc; hosted migration and deployment changes require the existing approval process.
