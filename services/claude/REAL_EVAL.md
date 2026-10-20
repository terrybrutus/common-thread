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
