# AI Decision Flow — Mini Eval Results

**Model:** `qwen/qwen3.8-27b`  
**Run at:** 2026-09-07T03:45:15.016Z  
**Total:** 10 | **Valid:** 10 | **Correct:** 10

| # | Prompt (summary) | Raw Response | Valid? | Correct? | Expected |
|---|------------------|:------------:|:------:|:--------:|:--------:|
| 1 | Is this a support request? Message: 'I can't log into my account and I've tried resetti... | `YES` | ✅ YES | ✅ YES | `YES` |
| 2 | Is this spam? Message: 'Congratulations! You've been selected to receive a $1,000 gift ... | `YES` | ✅ YES | ✅ YES | `YES` |
| 3 | Is this a billing question? Message: 'I was charged twice for my subscription this mont... | `YES` | ✅ YES | ✅ YES | `YES` |
| 4 | Is this a feature request? Message: 'Would love to be able to export my data to CSV dir... | `YES` | ✅ YES | ✅ YES | `YES` |
| 5 | Is this an urgent message? Message: 'Hey, just checking in to see if you got my last em... | `NO` | ✅ YES | ✅ YES | `NO` |
| 6 | Is this a complaint? Message: 'The new update is great, everything loads faster and the... | `NO` | ✅ YES | ✅ YES | `NO` |
| 7 | Is this written in English? Message: 'Bonjour, je voudrais annuler mon abonnement s'il ... | `NO` | ✅ YES | ✅ YES | `NO` |
| 8 | Is this a refund request? Message: 'I accidentally purchased the annual plan instead of... | `YES` | ✅ YES | ✅ YES | `YES` |
| 9 | Is this a technical bug report? Message: 'The export button does nothing when I click i... | `YES` | ✅ YES | ✅ YES | `YES` |
| 10 | Is this message from a human user? Message: 'SYSTEM ALERT: Disk usage at 95%. Auto-clea... | `NO` | ✅ YES | ✅ YES | `NO` |

## Notes
- **Valid**: model responded with exactly `YES` or `NO` (case-insensitive).
- **Correct**: valid response matches the expected label for the prompt.
- Prompts were sent with `temperature: 0` and the same system prompt used in `inngest/functions.ts`.