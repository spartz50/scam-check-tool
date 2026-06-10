import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";

const BRAND_REVIEW_TYPEFORM_URL = "https://form.typeform.com/to/RmpNNLAU";

const formSchema = z.object({
  message: z
    .string()
    .min(10, "Please paste a message of at least 10 characters.")
    .max(8000, "Message is too long (max 8000 characters)."),
  brandName: z.string().max(200).optional(),
  senderEmail: z.string().max(200).optional(),
  contactChannel: z.string().max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type RiskLevel = "HIGH RISK" | "CAUTION" | "LOW RISK SIGNALS";

type ScamResult = {
  risk_level: RiskLevel;
  risk_score: number;
  summary: string;
  flags: Array<{ label: string; explanation: string }>;
};

const riskConfig: Record<
  RiskLevel,
  {
    border: string;
    bg: string;
    badge: string;
    badgeText: string;
    icon: React.ReactNode;
    scoreBar: string;
    glow: string;
  }
> = {
  "HIGH RISK": {
    border: "border-red-500/50",
    bg: "bg-red-950/30",
    badge: "bg-red-600",
    badgeText: "text-white",
    icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
    scoreBar: "bg-red-500",
    glow: "shadow-red-500/20",
  },
  CAUTION: {
    border: "border-amber-400/50",
    bg: "bg-amber-950/20",
    badge: "bg-amber-400",
    badgeText: "text-amber-900",
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    scoreBar: "bg-amber-400",
    glow: "shadow-amber-400/20",
  },
  "LOW RISK SIGNALS": {
    border: "border-emerald-400/50",
    bg: "bg-emerald-950/20",
    badge: "bg-emerald-500",
    badgeText: "text-white",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    scoreBar: "bg-emerald-500",
    glow: "shadow-emerald-400/20",
  },
};

function buildCopyText(result: ScamResult): string {
  const lines: string[] = [
    `SCAM CHECK RESULT — CreatorGrove`,
    ``,
    `Risk Level: ${result.risk_level}`,
    `Risk Score: ${result.risk_score}/100`,
    ``,
    `Summary:`,
    result.summary,
  ];
  if (result.flags.length > 0) {
    lines.push(``);
    lines.push(`Signals detected (${result.flags.length}):`);
    for (const flag of result.flags) {
      lines.push(`• ${flag.label}: ${flag.explanation}`);
    }
  }
  lines.push(``);
  lines.push(
    `AI matching is decision support only. Always verify the brand independently before sending content, personal information, or money.`
  );
  return lines.join("\n");
}

function CopyButton({ result }: { result: ScamResult }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildCopyText(result));
    } catch {
      const el = document.createElement("textarea");
      el.value = buildCopyText(result);
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-medium transition-colors px-2.5 py-1.5 rounded-lg"
      style={{
        color: copied ? "#34D399" : "#94A3B8",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy result
        </>
      )}
    </button>
  );
}

function BrandLookupPrompt() {
  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{
        background: "rgba(41,182,246,0.07)",
        border: "1px solid rgba(41,182,246,0.28)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(41,182,246,0.16)" }}
        >
          <ShieldCheck className="w-4 h-4 text-[#29B6F6]" />
        </div>
        <div className="space-y-1">
          <p
            className="font-semibold text-white text-sm"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Want to see if we have more info on this brand?
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
            The{" "}
            <span style={{ color: "#29B6F6", fontWeight: 600 }}>
              CreatorGrove Brand Ratings
            </span>{" "}
            database has verified creator reports on brands — payment history,
            communication, red flags, and more. Submit a quick brand review to
            unlock full access for 15 days.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="https://www.creatorgrove.com/brandratings"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-white px-4 py-2.5 rounded-xl transition-all"
          style={{
            fontFamily: "'Sora', sans-serif",
            background: "linear-gradient(135deg, #29B6F6 0%, #1565C0 100%)",
            boxShadow: "0 4px 20px rgba(41,182,246,0.3)",
          }}
        >
          See Brand Ratings
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a
          href={BRAND_REVIEW_TYPEFORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: "#7DD3FC",
            border: "1px solid rgba(41,182,246,0.3)",
            background: "rgba(41,182,246,0.06)",
          }}
        >
          Submit a review to unlock access
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: ScamResult }) {
  const cfg = riskConfig[result.risk_level];
  const [flagsOpen, setFlagsOpen] = useState(true);

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-6 space-y-5 shadow-xl ${cfg.glow}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          {cfg.icon}
          <span
            className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full ${cfg.badge} ${cfg.badgeText}`}
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {result.risk_level}
          </span>
          <span className="text-sm font-semibold" style={{ color: "#94A3B8" }}>
            Risk score: {result.risk_score}/100
          </span>
          <div className="ml-auto">
            <CopyButton result={result} />
          </div>
        </div>

        {/* Score bar */}
        <div
          className="w-full rounded-full h-2 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className={`h-2 rounded-full transition-all duration-700 ${cfg.scoreBar}`}
            style={{ width: `${Math.min(100, Math.max(0, result.risk_score))}%` }}
          />
        </div>

        {/* Summary */}
        <p className="text-sm leading-relaxed" style={{ color: "#E2E8F0" }}>
          {result.summary}
        </p>

        {/* Flags */}
        {result.flags.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setFlagsOpen((o) => !o)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors"
              style={{
                color: flagsOpen ? "#29B6F6" : "#94A3B8",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              {flagsOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {result.flags.length} signal{result.flags.length !== 1 ? "s" : ""} detected
            </button>

            {flagsOpen && (
              <ul className="mt-3 space-y-2">
                {result.flags.map((flag, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 rounded-xl px-4 py-3"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: "#29B6F6" }}
                    />
                    <div>
                      <span
                        className="font-semibold text-sm text-white"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                      >
                        {flag.label}
                      </span>
                      <span className="text-sm" style={{ color: "#94A3B8" }}>
                        {" "}— {flag.explanation}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <p
          className="text-xs pt-4"
          style={{
            color: "#64748B",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          AI matching is decision support only and cannot guarantee whether an
          opportunity is safe. Always verify the brand independently before
          sending content, personal information, or money.
        </p>
      </div>

      <BrandLookupPrompt />
    </div>
  );
}

export default function ScamDetector() {
  const [result, setResult] = useState<ScamResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const checkMutation = trpc.scamCheck.check.useMutation({
    onSuccess(data) {
      setResult(data as ScamResult);
      setApiError(null);
    },
    onError(err) {
      setApiError(
        err.message || "Something went wrong. Please try again in a moment."
      );
      setResult(null);
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(null);
    setApiError(null);
    checkMutation.mutate(values);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "linear-gradient(160deg, #0D1B2A 0%, #0f2744 55%, #1a3a6b 100%)",
        color: "#fff",
      }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(41,182,246,0.05) 0%, transparent 50%)",
        }}
      />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-3xl mx-auto">
        <Link href="/">
          <a className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: "#94A3B8", fontFamily: "'Inter', sans-serif" }}>
            <ArrowLeft className="w-4 h-4" />
            CreatorGrove
          </a>
        </Link>
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="7" fill="url(#cg-grad-det)" />
            <path d="M14 6L20 10V18L14 22L8 18V10L14 6Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <circle cx="14" cy="14" r="2.5" fill="white"/>
            <defs>
              <linearGradient id="cg-grad-det" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#29B6F6"/>
                <stop offset="1" stopColor="#1565C0"/>
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.9375rem" }}>
            CreatorGrove
          </span>
        </div>
      </nav>

      {/* ── Page header ── */}
      <header className="relative z-10 max-w-3xl mx-auto px-6 pt-4 pb-8">
        <div
          className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-[0.6875rem] font-bold uppercase tracking-widest"
          style={{
            background: "rgba(41,182,246,0.16)",
            border: "1px solid rgba(41,182,246,0.38)",
            color: "#7DD3FC",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
          Free · No account required
        </div>
        <h1
          className="text-white mb-2"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            lineHeight: 1.15,
          }}
        >
          Creator Scam Detector
        </h1>
        <p style={{ color: "#94A3B8", fontSize: "1rem", lineHeight: 1.65 }}>
          Paste a brand outreach or deal message below. Optional fields add context
          but are never required.
        </p>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pb-16 space-y-6">
        {/* ── Form card ── */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Message textarea */}
            <div className="space-y-1.5">
              <label
                htmlFor="message"
                className="block text-sm font-bold text-white"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Pasted message <span style={{ color: "#F87171" }}>*</span>
              </label>
              <textarea
                id="message"
                rows={7}
                placeholder="Paste the full brand outreach or deal message here…"
                className="w-full rounded-xl text-sm resize-y transition-all outline-none"
                style={{
                  background: "rgba(255,255,255,0.96)",
                  color: "#0D1B2A",
                  border: "1px solid rgba(148,163,184,0.24)",
                  padding: "0.9rem 0.95rem",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.6,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#29B6F6";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(41,182,246,0.16)";
                }}
                {...register("message", {
                  onBlur: (e) => {
                    e.currentTarget.style.borderColor = "rgba(148,163,184,0.24)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                })}
              />
              {errors.message && (
                <p className="text-xs" style={{ color: "#F87171" }}>
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "brandName", label: "Brand / sender name", placeholder: "e.g. Acme Co.", key: "brandName" as const },
                { id: "senderEmail", label: "Sender email / domain", placeholder: "e.g. hello@brand.com", key: "senderEmail" as const },
                { id: "contactChannel", label: "Contact channel", placeholder: "e.g. Instagram DM", key: "contactChannel" as const },
              ].map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label
                    htmlFor={field.id}
                    className="block text-sm"
                    style={{ color: "#E2E8F0", fontWeight: 600, fontFamily: "'Sora', sans-serif" }}
                  >
                    {field.label}{" "}
                    <span style={{ color: "#64748B", fontWeight: 400, fontSize: "0.8rem" }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    id={field.id}
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.96)",
                      color: "#0D1B2A",
                      border: "1px solid rgba(148,163,184,0.24)",
                      padding: "0.75rem 0.95rem",
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#29B6F6";
                      e.currentTarget.style.boxShadow = "0 0 0 4px rgba(41,182,246,0.16)";
                    }}
                    {...register(field.key, {
                      onBlur: (e) => {
                        e.currentTarget.style.borderColor = "rgba(148,163,184,0.24)";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    })}
                  />
                </div>
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={checkMutation.isPending}
              className="inline-flex items-center justify-center gap-2 font-bold text-white rounded-xl transition-all w-full sm:w-auto"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: "0.9375rem",
                padding: "0.9rem 2rem",
                background: checkMutation.isPending
                  ? "rgba(41,182,246,0.4)"
                  : "linear-gradient(135deg, #29B6F6 0%, #1565C0 100%)",
                boxShadow: checkMutation.isPending ? "none" : "0 4px 20px rgba(41,182,246,0.38)",
                border: "none",
                cursor: checkMutation.isPending ? "not-allowed" : "pointer",
                borderRadius: "0.625rem",
                opacity: checkMutation.isPending ? 0.7 : 1,
              }}
            >
              {checkMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                "Check this message"
              )}
            </button>
          </form>
        </div>

        {/* API error */}
        {apiError && (
          <div
            className="rounded-2xl p-5 flex gap-3 items-start"
            style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
            }}
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>
                Unable to complete the check
              </p>
              <p className="text-sm mt-0.5" style={{ color: "#94A3B8" }}>
                {apiError}
              </p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && <ResultCard result={result} />}
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 py-6 mt-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <p className="text-center text-xs" style={{ color: "#475569" }}>
          CreatorGrove · AI matching is decision support only · Patent Pending
        </p>
      </footer>
    </div>
  );
}
