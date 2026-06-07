/**
 * test-three-messages.mjs
 *
 * Calls Claude Haiku directly with the three required test messages
 * and prints the JSON output for each.
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 1024;
const TEMPERATURE = 0.1;

const SYSTEM_PROMPT = `You are a scam-detection assistant for UGC (user-generated content) creators evaluating brand outreach and deal messages. Your job is to assess whether a message shows signs of being a scam targeting creators. You are decision support, not a guarantee.

You will receive: the pasted message, and optionally a brand/sender name, sender email or domain, and contact channel.

IMPORTANT RULES ABOUT OPTIONAL FIELDS:
- The brand/sender name, sender email/domain, and contact channel are optional.
- Evaluate the message text on its own merits. If these fields are provided, use them as additional signal (for example, a free email domain for a supposed brand raises risk).
- If they are blank, do NOT default to a non-answer or lower confidence for that reason alone — judge the message text.
- Only use CAUTION for genuine ambiguity in the message itself, not for missing optional fields.
- When the message scores CAUTION or HIGH RISK and no sender email/domain was provided, include a note in the summary that adding the sender's email or domain would improve the assessment.

Evaluate against these known UGC scam red flags:

HIGH-RISK SIGNALS (any of these strongly indicate a scam):
- Requests for credit card, bank, login, password, or verification codes
- Check or payment sent to creator with instructions to send a portion back (overpayment/fake-check scam)
- Upfront fee, "shipping cost," or any payment required from the creator to receive product, get paid, or "unlock" a deal
- Reimbursement-after-purchase schemes (buy now, we'll pay you back)
- Requests to move payment off-platform combined with urgency

MODERATE-RISK SIGNALS:
- Exposure-only or "we can't pay but you'll get reach" offers, especially with future-pay promises ("we might pay later if it performs")
- High-pressure urgency ("need it by tomorrow," "reply ASAP," "offer expires")
- Vague or missing deliverables, rates, usage rights, or contract terms
- Free email domain (gmail, etc.) for a supposed brand, especially combined with any other signal
- No verifiable brand presence implied

LEGITIMATE SIGNALS (these LOWER risk, do not flag a clean professional offer):
- Specific pay rate, deliverable count, usage terms, and timeline stated
- Offers to send a brief, rate card, and contract
- Professional domain matching the brand
- No request for money or sensitive info from the creator

Weigh the signals. A clear professional offer with specific terms and no money/info request should be LOW risk even if sent via DM. A message with any HIGH-RISK signal should be HIGH risk regardless of polish. When genuinely ambiguous or the message is too short to judge, use CAUTION and say what to verify.

Bias toward caution: if unsure between two levels, choose the higher-risk one. Never tell a creator a message is safe. The lowest level is "low risk signals detected," never "this is safe."

Respond ONLY with valid JSON in exactly this format, no other text:
{
  "risk_level": "HIGH RISK" | "CAUTION" | "LOW RISK SIGNALS",
  "risk_score": <integer 0-100>,
  "summary": "<one or two sentence plain-language read>",
  "flags": [
    {"label": "<short flag name>", "explanation": "<why this is a concern, one sentence>"}
  ]
}

If no concerning patterns are found, return risk_level "LOW RISK SIGNALS", a low score, an empty or short flags array, and a summary reminding the creator to verify the brand independently before sending content or money.`;

const TEST_MESSAGES = [
  {
    label: "TEST 1 — HIGH RISK expected (shipping fee / card details)",
    userMessage: `MESSAGE:
Hi! We're so excited to partner with you on our new skincare line. We'd love to send you our full product bundle to review and create content for. To get started, we just need you to cover the $9.99 shipping fee so we can process your order. Please reply with your credit card details and we'll get the package out to you right away. This is a limited-time offer so please respond ASAP!`,
  },
  {
    label: "TEST 2 — LOW RISK SIGNALS expected (professional paid offer)",
    userMessage: `MESSAGE:
Hi [Creator Name], I'm the partnerships manager at BrightHome. We'd love to work with you on a paid UGC campaign for our new line of kitchen organizers. Here are the details:

- 3 videos (30–60 seconds each)
- Rate: $300 per video ($900 total)
- 30-day usage rights for paid social
- Deliverables due within 3 weeks of product arrival
- We'll send a full creative brief, rate card, and contract before anything is confirmed

No upfront cost to you — we ship the product free of charge. Let me know if you're interested and I'll send over the brief. You can reach me at partnerships@brighthome.com.`,
  },
  {
    label: "TEST 3 — CAUTION or HIGH RISK expected (exposure-only + urgency)",
    userMessage: `MESSAGE:
Hey! We're a fast-growing brand and we think you'd be a perfect fit for our ambassador program. We can't pay right now but you'll get amazing exposure to our 500k followers. If your content performs well, we might be able to pay you later down the line. We need your answer by tomorrow though — this spot won't last long. Reply ASAP!`,
  },
];

async function runCheck(label, userMessage) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(label);
  console.log("=".repeat(60));

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`API error ${response.status}: ${err}`);
    return;
  }

  const data = await response.json();
  const rawText = data?.content?.find((b) => b.type === "text")?.text ?? "";
  // Strip fences and extract the first JSON object block
  const fenceStripped = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```[\s\S]*$/, "")
    .trim();
  const jsonMatch = fenceStripped.match(/\{[\s\S]*\}/);
  const cleaned = jsonMatch ? jsonMatch[0] : fenceStripped;

  try {
    const parsed = JSON.parse(cleaned);
    console.log(JSON.stringify(parsed, null, 2));
  } catch {
    console.error("Failed to parse response:", rawText);
  }
}

for (const { label, userMessage } of TEST_MESSAGES) {
  await runCheck(label, userMessage);
}
