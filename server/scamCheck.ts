/**
 * scamCheck.ts
 *
 * Server-side tRPC router for the UGC Scam Check tool.
 * Uses Claude Haiku (claude-haiku-4-5) via the Anthropic API directly.
 *
 * Abuse protection layers:
 *   1. Per-IP sliding window: max 5 checks per hour
 *   2. Global daily cap: max 2000 checks per calendar day (UTC) — cost guard
 *   3. Bot filter: requests with no User-Agent are rejected
 *   4. Input validation: min 10 / max 5000 chars on message
 *   5. Blocked-IP list: IPs that hit the limit 3+ times in a day are soft-blocked for 24h
 *
 * Logging: after each successful check, ONE row is written to scam_check_logs:
 *   - riskLevel  (the outcome enum value)
 *   - createdAt  (auto-set by the DB to NOW())
 * NO message text, brand name, sender info, or any user-entered content is
 * stored anywhere in the database or in server logs.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { scamCheckLogs } from "../drizzle/schema";

// ─── Configuration ────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 1024;
const TEMPERATURE = 0.1;

// Per-IP rate limit: 5 checks per hour (sliding window)
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Soft-block: if an IP hits the rate limit 3+ times in a day, block for 24h
const ABUSE_THRESHOLD = 3;
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Global daily cap: max 2000 checks per UTC calendar day
const GLOBAL_DAILY_CAP = 2000;

// ─── In-memory state ──────────────────────────────────────────────────────────

type RateLimitEntry = { count: number; windowStart: number; violations: number; blockedUntil?: number };
const rateLimitMap = new Map<string, RateLimitEntry>();

// Global daily counter — resets at UTC midnight
let globalDailyCount = 0;
let globalDayKey = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

function getGlobalDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function checkGlobalCap(): void {
  const today = getGlobalDayKey();
  if (today !== globalDayKey) {
    // New UTC day — reset counter
    globalDayKey = today;
    globalDailyCount = 0;
  }
  if (globalDailyCount >= GLOBAL_DAILY_CAP) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "The scam checker has reached its daily usage limit. Please check back tomorrow — it resets at midnight UTC.",
    });
  }
  globalDailyCount += 1;
}

function checkRateLimit(ip: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Check if IP is currently soft-blocked
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    const minutesLeft = Math.ceil((entry.blockedUntil - now) / 60_000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Your IP has been temporarily blocked due to excessive requests. Please try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
    });
  }

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window
    rateLimitMap.set(ip, {
      count: 1,
      windowStart: now,
      violations: entry?.violations ?? 0,
    });
    return;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    // Increment violation count
    entry.violations = (entry.violations ?? 0) + 1;

    // Soft-block if abuse threshold reached
    if (entry.violations >= ABUSE_THRESHOLD) {
      entry.blockedUntil = now + BLOCK_DURATION_MS;
      console.warn(`[scamCheck] IP ${ip} soft-blocked for 24h after ${entry.violations} violations`);
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Your IP has been temporarily blocked due to excessive requests. Please try again in 24 hours.",
      });
    }

    const windowResetMins = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.windowStart)) / 60_000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `You've reached the limit of ${RATE_LIMIT_MAX} checks per hour. Please try again in ${windowResetMins} minute${windowResetMins === 1 ? "" : "s"}.`,
    });
  }

  entry.count += 1;
}

function checkBotFilter(userAgent: string | undefined): void {
  if (!userAgent || userAgent.trim().length < 5) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Request rejected.",
    });
  }
}

// ─── Anonymized usage logger ──────────────────────────────────────────────────

async function logCheckOutcome(
  riskLevel: "HIGH RISK" | "CAUTION" | "LOW RISK SIGNALS"
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(scamCheckLogs).values({ riskLevel });
  } catch (err) {
    console.error("[scamCheck] Failed to write usage log:", err);
  }
}

// ─── System prompt ────────────────────────────────────────────────────────────

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

// ─── Anthropic API call ───────────────────────────────────────────────────────

type ScamCheckResult = {
  risk_level: "HIGH RISK" | "CAUTION" | "LOW RISK SIGNALS";
  risk_score: number;
  summary: string;
  flags: Array<{ label: string; explanation: string }>;
};

async function callHaiku(userMessage: string): Promise<ScamCheckResult> {
  if (!ANTHROPIC_API_KEY) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "The scam check service is not configured. Please contact support.",
    });
  }

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
    const errorText = await response.text().catch(() => "(unreadable)");
    console.error(`Anthropic API error ${response.status}: ${errorText}`);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "The scam check service is temporarily unavailable. Please try again in a moment.",
    });
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const rawText = data?.content?.find(b => b.type === "text")?.text ?? "";

  const fenceStripped = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```[\s\S]*$/, "")
    .trim();

  const jsonMatch = fenceStripped.match(/\{[\s\S]*\}/);
  const cleaned = jsonMatch ? jsonMatch[0] : fenceStripped;

  let parsed: ScamCheckResult;
  try {
    parsed = JSON.parse(cleaned) as ScamCheckResult;
  } catch {
    console.error("Failed to parse Haiku response:", rawText);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "The scam check service returned an unexpected response. Please try again.",
    });
  }

  if (
    !["HIGH RISK", "CAUTION", "LOW RISK SIGNALS"].includes(parsed.risk_level) ||
    typeof parsed.risk_score !== "number" ||
    typeof parsed.summary !== "string" ||
    !Array.isArray(parsed.flags)
  ) {
    console.error("Haiku response failed shape validation:", parsed);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "The scam check service returned an unexpected response. Please try again.",
    });
  }

  return parsed;
}

// ─── Input schema ─────────────────────────────────────────────────────────────

const scamCheckInput = z.object({
  message: z
    .string()
    .min(10, "Please paste a message of at least 10 characters.")
    .max(5000, "Message is too long (max 5000 characters)."),
  brandName: z.string().max(200).optional(),
  senderEmail: z.string().max(200).optional(),
  contactChannel: z.string().max(100).optional(),
});

// ─── Router ───────────────────────────────────────────────────────────────────

export const scamCheckRouter = router({
  check: publicProcedure
    .input(scamCheckInput)
    .mutation(async ({ input, ctx }) => {
      // Bot filter — reject requests with no/empty User-Agent
      const userAgent = ctx.req.headers["user-agent"];
      checkBotFilter(userAgent);

      // Derive IP from forwarded headers or socket
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string | undefined)
          ?.split(",")[0]
          ?.trim() ??
        ctx.req.socket?.remoteAddress ??
        "unknown";

      // Check global daily cap first (cheapest check)
      checkGlobalCap();

      // Then per-IP rate limit
      checkRateLimit(ip);

      // Build the user message for the model.
      // NOTE: this string is sent to the Anthropic API only — never persisted.
      const parts: string[] = [`MESSAGE:\n${input.message}`];
      if (input.brandName?.trim()) parts.push(`BRAND/SENDER NAME: ${input.brandName.trim()}`);
      if (input.senderEmail?.trim()) parts.push(`SENDER EMAIL/DOMAIN: ${input.senderEmail.trim()}`);
      if (input.contactChannel?.trim()) parts.push(`CONTACT CHANNEL: ${input.contactChannel.trim()}`);

      const userMessage = parts.join("\n\n");

      const result = await callHaiku(userMessage);

      // Log ONLY the outcome — no user content is persisted.
      void logCheckOutcome(result.risk_level);

      return result;
    }),
});
