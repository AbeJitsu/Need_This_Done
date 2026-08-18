# Step 10A — OpenRouter model comparison

**Date:** 2026-08-17
**Target:** hosted Supabase project `oxhjtmozsdstbokwtnwa`
**Decision:** comparison recorded; no model selected

This evidence records the explicitly approved six-request comparison between
the two exact private model IDs:

- `deepseek/deepseek-v4-flash-0731`
- `nvidia/nemotron-3-ultra-550b-a55b:free`

The hosted project had no growth profile, so the approved run created one
operator-owned, sanitized comparison profile (`af5e3376-a03e-4860-a538-4badce0667a6`).
It has no sender, task, prospect, customer, or schedule data. Its route was
`evaluation-required` before and after the run.

## Catalog gate

Both exact IDs were present and available in the live OpenRouter catalog.

| Model | Context | Prompt / completion price | Relevant capability |
| --- | ---: | ---: | --- |
| DeepSeek V4 Flash 0731 | 1,048,576 | `0.00000014` / `0.00000028` USD per token | `response_format`, structured outputs, tools |
| Nemotron 3 Ultra | 1,000,000 | `0` / `0` | tools; no structured-output parameter advertised |

The catalog also contained provider-specific pricing extensions on unrelated
models. The parser was made tolerant of those extensions without weakening
the numeric pricing/capability extraction, and the focused catalog/benchmark
tests passed afterward.

## Free replacement discovery — 2026-08-18

The configured Nemotron endpoint was not replaced during the original run. A
read-only account-filtered catalog check was performed against the [OpenRouter
free text model view](https://openrouter.ai/models?order=da-elo-high-to-low&max_output_price=0.5&output_modalities=text&variant=free)
to identify a candidate that is visible under the current account policy.

| Candidate | Context | Pricing | Current capability / provider evidence |
| --- | ---: | ---: | --- |
| `google/gemma-4-31b-it:free` | 262,144 | `$0` / `$0` | `response_format`, tools; one listed Google AI Studio endpoint; Artificial Analysis intelligence index 29.7 |
| `google/gemma-4-26b-a4b-it:free` | 262,144 | `$0` / `$0` | `response_format`, structured outputs, tools; two listed free endpoints |
| `openai/gpt-oss-20b:free` | 131,072 | `$0` / `$0` | `response_format`, structured outputs, tools; one listed endpoint |

The recommended next comparison candidate is the exact pinned ID
`google/gemma-4-31b-it:free`. Gemma 4 26B is the backup when endpoint
redundancy is preferred. The moving `openrouter/free` router was excluded from
the recommendation because the private worker requires an exact model ID.
These candidates are catalog evidence only: this discovery made no completion
request, hosted write, Vercel variable change, or model-selection decision.
The repeat comparison requires separate approval and must preserve the current
`evaluation-required` route until its results are recorded and reviewed.

## Fixed sanitized run

Each model received the same three prompts: classify supplied public evidence,
draft a human-approval message, and summarize sanitized activity notes. The
runner did not enable web search or tools, and the prompts contained no
customer data, prospect data, or external recipient.

The automated quality/tool-use scores below represent valid JSON response
shape for this run; they are not a human quality or production-readiness
decision.

| Model | Task | Quality | Tool use | Latency | Provider cost | Failed | Repair |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| DeepSeek | classify-public-evidence | 0.95 | 0.95 | 11,015 ms | $0.000008244 | no | no |
| DeepSeek | draft-approved-message | 0.95 | 0.95 | 3,696 ms | $0.000058100 | no | no |
| DeepSeek | summarize-weekly-brief | 0.95 | 0.95 | 3,380 ms | $0.000056280 | no | no |
| Nemotron | classify-public-evidence | 0 | 0 | 110 ms | $0 | yes | yes |
| Nemotron | draft-approved-message | 0 | 0 | 92 ms | $0 | yes | yes |
| Nemotron | summarize-weekly-brief | 0 | 0 | 92 ms | $0 | yes | yes |

DeepSeek provider usage was reconciled for 63/36, 143/136, and 58/172
prompt/completion tokens, respectively. Its total provider-reported cost was
`$0.000122624`. Nemotron returned no provider usage because all three requests
were rejected before generation by the OpenRouter privacy/data-policy
guardrail: no permitted endpoint was available under the account’s current
privacy setting. The rejection was recorded in each task’s durable notes; it
was not retried or replaced.

## Hosted verification

- Six evaluation rows exist: all three tasks for each exact model ID.
- Six model-usage reservations are `reconciled`; total actual cost is
  `$0.000122624`.
- Both catalog candidate rows are active with live availability and capability
  metadata.
- The profile remains `model_route= evaluation-required`, with
  `selected_model_id` null and emergency stop off.
- The profile has zero agent tasks, prospects, and outreach messages.
- No worker schedule or claim ran; no email, publication, payment, calendar,
  browser, messaging, or external-recipient action occurred.
- No Vercel variable was added or changed, and the primary-pin command was not
  run. The loopback server used for the private signed route was stopped after
  verification.

## Decision and follow-up

This is not a complete pass because Nemotron could not produce a structured
response under the current provider privacy policy. DeepSeek completed all
three sanitized tasks, but comparison evidence alone does not authorize
pinning it as the worker primary. The hosted route remains fail-closed at
`evaluation-required`.

Any privacy-policy change and any repeat of the six-request comparison require
separate approval. Model pinning, worker activation, schedules, and live
research remain separate approvals. Preserve these records; no rollback or
hosted database reversal is required.
