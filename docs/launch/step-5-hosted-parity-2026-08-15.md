# Step 5 hosted parity migrations — `074`–`089` — 2026-08-15

This record covers the hosted writes after the separate `073` calendar-token
stage. It does not approve or apply the destructive retirement set `090`–`092`.

## Outcome

- **Result:** `PASSED` for the non-destructive stages `074`, `075`–`080`,
  `081`, and `082`–`089`.
- **Hosted target:** Supabase project `oxhjtmozsdstbokwtnwa`.
- **Hosted history:** `69/073` before this sequence; `85/089` after it.
- **Release-control SHAs:** `7bdf2dcb44eca8c11ac6a95a57d9d0e72b2def8f` for
  `074`; `64b46f1d20ea67b37952bd11b8c4b775fa80a185` for `075`–`089`.
- **Hosted writes:** four stage apply invocations; each selected only its
  allowlisted stage.
- **Remaining:** `090`–`092` are neither approved nor applied.

No deployment, provider activation, secret provisioning, OpenRouter request,
OpenClaw activation, Calendar API call, publication, spend, or external message
occurred during these stages.

## Stage results

| Stage | Fresh pre-write history | Exact dry-run selection | Resulting history |
| --- | --- | --- | --- |
| `storage-bucket-normalization` | `69/073` | `074_create_private_project_attachments_bucket.sql` | `70/074` |
| `additive-product-workflow` | `70/074` | `075`–`080` only | `76/080` |
| `growth-profile-evaluation` | `76/080` | `081_bound_model_evaluation_budget.sql` | `77/081` |
| `research-agent-planner` | `77/081` | `082`–`089` only | `85/089` |

Every apply result reported `hosted_writes: 1`, verified its exact stage
acknowledgement, rechecked hosted history, and cleaned its temporary workdir.
The preserved migration numbering gaps remain unchanged.

## Protected backups

Each stage used a new mode-`700` backup directory with mode-`600` artifacts and
a passing eight-artifact SHA-256 manifest:

- `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-073-to-074-003522` — `69/073`.
- `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-074-to-075-004119` — `70/074`.
- `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-080-to-081-004539` — `76/080`.
- `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-081-to-082-004938` — `77/081`.
- `/Users/abiezerreyes/Documents/NeedThisDone Backups/2026-08-15-pre-migration-089-to-090-005450` — `85/089` recovery point for the pending retirement decision.

The latest Storage capture has one private `project-attachments` bucket with
217 objects and one private `agent-media-private` bucket with zero objects.
Only object metadata was listed; no object contents were downloaded.

## Read-only hosted verification

- `074` set `project-attachments` to private, 5 MiB, with the eight expected
  MIME types; its 217-object metadata inventory remained unchanged.
- After `075`–`080`, all product/workflow/cockpit tables returned HTTP `200`
  through the service-role PostgREST interface; Calendar-token row count stayed
  `0`; Storage stayed unchanged.
- After `081`, `model_evaluation_records` and the reviewed growth-profile
  surface returned HTTP `200`, while `082+` remained absent as expected.
- After `082`–`089`, every research, agent-operations, planner, OpenClaw-linkage,
  and provenance table returned HTTP `200`; both buckets were private and the
  agent-media object count was `0`.
- Hosted migration history is exactly the repository sequence through `089`,
  with no `090+` row.

## Destructive boundary requiring explicit approval

The next mapped stage is `destructive-retirement` (`090`–`092`). It removes
retired legacy, content/search/media, marketplace, commerce, and hosted Medusa
objects. A read-only count inventory found, among other retained rows, `2,321`
`page_embeddings`, `27` `blog_posts`, `9` `exchange_rates`, `8`
`template_categories`, `17` `cart` rows, `31` `cart_line_item` rows, `22`
`product` rows, `20` `image` rows, one `api_key`, one `auth_identity`, and one
`user` row. The protected `85/089` backup is available, but the backup does not
turn deletion approval into an inferred approval.

Until the owner explicitly approves the exact `090`–`092` deletion scope, Step
5 remains `IN_PROGRESS` and hosted parity item 6 does not claim completion.

The read-only destructive-stage dry run selected exactly
`090_remove_local_only_legacy_schema.sql`,
`091_remove_content_and_search_schema.sql`, and
`092_remove_marketplace_and_commerce_schema.sql`; hosted history remained
`85/089` before and after, and `hosted_writes` was `0`.
