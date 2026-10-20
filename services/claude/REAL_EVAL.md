# Real Claude release checks

Model: Claude Haiku 5.5. Input: the owner's private saved-story snapshot, never committed here.

After diagnostic batches exposed failures, three new independent real API calls ran through the final shared request and response pipeline. These were fresh paid responses, with no automatic paid retries or replacement calls counted as successes. All three finished with end_turn and passed parsing, provenance and four-personal-group checks. Each returned 16 unique tiles, four meaningful personal connections, direct player wording and one supported name-reversal group. The final three boards were manually reviewed.

| Run | First response accepted | Personal groups | Verified wordplay groups | Duration | Output tokens |
| --- | --- | --- | --- | --- | --- |
| 1 | Yes | 4/4 | 1 | 15.8 seconds | 3562 |
| 2 | Yes | 4/4 | 1 | 12.8 seconds | 2924 |
| 3 | Yes | 4/4 | 1 | 14.2 seconds | 3369 |

Earlier diagnostic batches exposed an incorrect model-produced reversal, ordinary sentence words incorrectly labeled personal, and a meaningful family-name group returned without the expected twist. The final pipeline constrains story drafts to literal personal facts, calculates approved reversals locally, and keeps strict source validation. Completed diagnostic responses used as many as 8,912 total output tokens, exceeding the former 6,500-token response setting; the final shared limit is 12,000 including thinking, with a 90-second timeout.

The screenshot's original failed response was not retained, so its exact stop reason cannot be confirmed retrospectively. No unfinished response occurred in the measured release calls. Truncation and refusal are now distinguished, and a max_tokens response is usable only if it already contains a complete board that passes every check. No incomplete JSON is stitched together.

This is a small-sample release check for one saved story, not a guarantee for every story or every future response. Raw model output, quotations, personal names and credentials remain only in ignored/private storage.

## Played-history check

Two additional independent real Haiku calls used the same private story with history from three prior accepted boards. The second also included the first new board's groups. Both completed on the first response, passed provenance and four-personal-group validation, and addressed the players directly. Run 1 had one familiar group and three groups with mostly different companions (26.6 seconds, 5,976 output tokens); run 2 had two familiar and two different combinations (27.5 seconds, 6,198 output tokens). This measures tile overlap, not wholly new semantic themes; the same story still produces familiar family, restaurant, place and television themes.

Manual review caught a deterministic wordplay bug: a mixed son/parents category was renamed as parents only. The fix preserves the original relationship label and explanation during reversal; both retained real responses were reparsed after the fix, and a mixed-family regression was added. The first board has one verified reversal, the second remains literal. No extra paid retry was used. Exhaustion and skip behavior are exercised with controlled all-familiar boards in UI tests, not by pretending the live outputs were exhausted.

## Focused story questions

One real Haiku call with deliberately limited, previously supplied vacation/television facts returned puzzle:null and one concise question about favorite places from that specific vacation. It passed the typed follow-up parser on the first response (4.0 seconds; 452 output tokens). A second real call through the local game UI used the temporary preview story about walks; the resulting question asked about a favorite shared walk and its details. Browser inspection confirmed the modal, initial answer focus, inert background and Escape dismissal. Neither check used an automatic paid retry. Structured-question transport, broad-question fallback, answer persistence and regeneration, spoiler-free sharing and keyboard dismissal are covered in automated tests.
