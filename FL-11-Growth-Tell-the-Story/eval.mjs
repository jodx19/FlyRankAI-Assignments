/**
 * mini-eval.mjs  —  Standalone eval for AI Decision Flow (FL-08)
 *
 * Runs 10 yes/no classification prompts through the same Groq model
 * configured in the main app (qwen/qwen3.8-27b via openai-compatible API).
 *
 * Usage:
 *   GROQ_API_KEY=<your_key> node eval.mjs
 *
 * No app code is imported. This is 100% standalone.
 */

import OpenAI from "openai";

// ─── Config ────────────────────────────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL        = "qwen/qwen3.8-27b";          // same model as functions.ts
const BASE_URL     = "https://api.groq.com/openai/v1";

if (!GROQ_API_KEY) {
  console.error("❌  GROQ_API_KEY environment variable is not set.");
  process.exit(1);
}

const client = new OpenAI({ apiKey: GROQ_API_KEY, baseURL: BASE_URL });

// ─── Eval cases ────────────────────────────────────────────────────────────────
// Each entry has:
//   prompt        – the question sent to the model
//   expectedLabel – the answer a reasonable person would give ("YES" | "NO")
const EVAL_CASES = [
  {
    prompt: "Is this a support request? Message: 'I can't log into my account and I've tried resetting my password three times.'",
    expectedLabel: "YES",
  },
  {
    prompt: "Is this spam? Message: 'Congratulations! You've been selected to receive a $1,000 gift card. Click here NOW to claim it before it expires!'",
    expectedLabel: "YES",
  },
  {
    prompt: "Is this a billing question? Message: 'I was charged twice for my subscription this month. Can someone look into this?'",
    expectedLabel: "YES",
  },
  {
    prompt: "Is this a feature request? Message: 'Would love to be able to export my data to CSV directly from the dashboard.'",
    expectedLabel: "YES",
  },
  {
    prompt: "Is this an urgent message? Message: 'Hey, just checking in to see if you got my last email. No rush at all!'",
    expectedLabel: "NO",
  },
  {
    prompt: "Is this a complaint? Message: 'The new update is great, everything loads faster and the UI feels much cleaner. Keep up the good work!'",
    expectedLabel: "NO",
  },
  {
    prompt: "Is this written in English? Message: 'Bonjour, je voudrais annuler mon abonnement s'il vous plaît.'",
    expectedLabel: "NO",
  },
  {
    prompt: "Is this a refund request? Message: 'I accidentally purchased the annual plan instead of the monthly one. I'd like my money back for the difference.'",
    expectedLabel: "YES",
  },
  {
    prompt: "Is this a technical bug report? Message: 'The export button does nothing when I click it in Firefox. It works fine in Chrome though.'",
    expectedLabel: "YES",
  },
  {
    prompt: "Is this message from a human user? Message: 'SYSTEM ALERT: Disk usage at 95%. Auto-cleanup initiated. No action required.'",
    expectedLabel: "NO",
  },
];

// ─── Runner ────────────────────────────────────────────────────────────────────
async function runEval(evalCase, index) {
  let rawResponse = null;
  let isValid     = false;
  let isCorrect   = false;
  let error       = null;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You must respond with EXACTLY ONE WORD: either 'YES' or 'NO'. Do not include any other text, explanation, or punctuation.",
        },
        { role: "user", content: evalCase.prompt },
      ],
    });

    rawResponse = completion.choices[0]?.message?.content?.trim() ?? "(empty)";
    const normalized = rawResponse.toUpperCase();
    isValid   = normalized === "YES" || normalized === "NO";
    isCorrect = isValid && normalized === evalCase.expectedLabel;
  } catch (err) {
    error = err.message;
    rawResponse = `ERROR: ${err.message}`;
  }

  return { index: index + 1, ...evalCase, rawResponse, isValid, isCorrect, error };
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀  Running mini-eval — model: ${MODEL}\n`);
  console.log(`    ${EVAL_CASES.length} prompts queued...\n`);

  const results = [];
  for (let i = 0; i < EVAL_CASES.length; i++) {
    process.stdout.write(`  [${i + 1}/${EVAL_CASES.length}] Sending prompt...`);
    const result = await runEval(EVAL_CASES[i], i);
    results.push(result);
    const icon = result.isCorrect ? "✅" : result.isValid ? "⚠️ " : "❌";
    console.log(` ${icon}  raw="${result.rawResponse}"  expected="${result.expectedLabel}"`);
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total      = results.length;
  const validCount = results.filter((r) => r.isValid).length;
  const correctCount = results.filter((r) => r.isCorrect).length;

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`  Valid responses : ${validCount}/${total}`);
  console.log(`  Correct answers : ${correctCount}/${total}`);
  console.log("─────────────────────────────────────────────────────────────\n");

  // ── Markdown table ─────────────────────────────────────────────────────────
  const md = buildMarkdownTable(results, MODEL);
  console.log(md);

  // Also write to file for easy sharing
  const { writeFileSync } = await import("fs");
  const outFile = "eval_results.md";
  writeFileSync(outFile, md, "utf8");
  console.log(`\n📄  Results written to ${outFile}\n`);
}

function buildMarkdownTable(results, model) {
  const now = new Date().toISOString();

  const header = [
    `# AI Decision Flow — Mini Eval Results`,
    ``,
    `**Model:** \`${model}\`  `,
    `**Run at:** ${now}  `,
    `**Total:** ${results.length} | **Valid:** ${results.filter((r) => r.isValid).length} | **Correct:** ${results.filter((r) => r.isCorrect).length}`,
    ``,
    `| # | Prompt (summary) | Raw Response | Valid? | Correct? | Expected |`,
    `|---|------------------|:------------:|:------:|:--------:|:--------:|`,
  ].join("\n");

  const rows = results.map((r) => {
    // Shorten the prompt for table readability
    const shortPrompt = r.prompt.length > 90
      ? r.prompt.slice(0, 87) + "..."
      : r.prompt;

    const validCell   = r.isValid   ? "✅ YES" : "❌ NO";
    const correctCell = r.isCorrect ? "✅ YES" : "❌ NO";

    return `| ${r.index} | ${shortPrompt} | \`${r.rawResponse}\` | ${validCell} | ${correctCell} | \`${r.expectedLabel}\` |`;
  });

  const footer = [
    ``,
    `## Notes`,
    `- **Valid**: model responded with exactly \`YES\` or \`NO\` (case-insensitive).`,
    `- **Correct**: valid response matches the expected label for the prompt.`,
    `- Prompts were sent with \`temperature: 0\` and the same system prompt used in \`inngest/functions.ts\`.`,
  ].join("\n");

  return [header, ...rows, footer].join("\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
