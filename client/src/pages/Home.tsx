import { Link } from "wouter";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

// ─── Sample results to show on the homepage ───────────────────────────────────

const SAMPLES = [
  {
    risk: "HIGH RISK" as const,
    score: 87,
    badge: "bg-red-600 text-white",
    bar: "bg-red-500",
    border: "border-red-500/40",
    icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
    preview:
      "Hey! We love your content and want to send you a FREE product. Just click this link to confirm your shipping address: bit.ly/free-collab-gift. Hurry — only 3 spots left!",
    summary:
      "Multiple high-risk signals: shortened URL requesting personal address, artificial scarcity, no brand verification.",
    flags: [
      "Suspicious shortened URL",
      "Request for personal info via unverified link",
      "Artificial scarcity / urgency",
    ],
  },
  {
    risk: "CAUTION" as const,
    score: 52,
    badge: "bg-amber-400 text-amber-900",
    bar: "bg-amber-400",
    border: "border-amber-400/40",
    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    preview:
      "Hi! I'm a marketing manager at GlowSkin. We'd love to collaborate on a paid post — $150 for one Reel. DM me your email and I'll send the brief.",
    summary:
      "Legitimate-sounding offer but no contract details, payment terms, or verifiable brand domain provided.",
    flags: ["Vague payment terms", "No brand domain or website", "Asking for personal contact off-platform"],
  },
  {
    risk: "LOW RISK SIGNALS" as const,
    score: 18,
    badge: "bg-emerald-500 text-white",
    bar: "bg-emerald-500",
    border: "border-emerald-400/40",
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    preview:
      "Hi [Creator], I'm Sarah from Ritual's creator partnerships team (partnerships@ritual.com). We'd love to discuss a paid collaboration. Here's our media kit and standard contract terms…",
    summary:
      "Verified brand domain, professional tone, contract terms offered upfront — consistent with a legitimate outreach.",
    flags: [],
  },
];

function SampleCard({
  sample,
  index,
}: {
  sample: (typeof SAMPLES)[0];
  index: number;
}) {
  return (
    <div
      className={`rounded-2xl border ${sample.border} bg-white/[0.04] backdrop-blur-sm overflow-hidden`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Card header */}
      <div className="px-5 pt-5 pb-3 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5 mb-3">
          {sample.icon}
          <span
            className={`text-xs font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full ${sample.badge}`}
          >
            {sample.risk}
          </span>
          <span className="ml-auto text-xs font-semibold text-[#94A3B8]">
            {sample.score}/100
          </span>
        </div>
        {/* Score bar */}
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full ${sample.bar}`}
            style={{ width: `${sample.score}%` }}
          />
        </div>
      </div>

      {/* Message preview */}
      <div className="px-5 py-3">
        <p className="text-xs text-[#94A3B8] italic leading-relaxed line-clamp-3">
          "{sample.preview}"
        </p>
      </div>

      {/* Summary */}
      <div className="px-5 pb-3">
        <p className="text-xs text-[#CBD5E1] leading-relaxed">{sample.summary}</p>
      </div>

      {/* Flags */}
      {sample.flags.length > 0 && (
        <div className="px-5 pb-5 flex flex-wrap gap-1.5">
          {sample.flags.map((f) => (
            <span
              key={f}
              className="text-[0.68rem] font-semibold bg-white/[0.07] text-[#94A3B8] border border-white/10 px-2 py-0.5 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
      )}
      {sample.flags.length === 0 && (
        <div className="px-5 pb-5">
          <span className="text-[0.68rem] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            No major signals detected
          </span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "linear-gradient(160deg, #0D1B2A 0%, #0f2744 55%, #1a3a6b 100%)",
        color: "#fff",
      }}
    >
      {/* Background texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(41,182,246,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(41,182,246,0.04) 0%, transparent 40%)",
        }}
      />

      {/* ── Navbar ── */}
      <nav
        className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto"
      >
        <a
          href="https://www.creatorgrove.com"
          className="flex items-center gap-2.5 group"
          aria-label="CreatorGrove home"
        >
          {/* Inline SVG logo mark */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="7" fill="url(#cg-grad)" />
            <path d="M14 6L20 10V18L14 22L8 18V10L14 6Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <circle cx="14" cy="14" r="2.5" fill="white"/>
            <defs>
              <linearGradient id="cg-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#29B6F6"/>
                <stop offset="1" stopColor="#1565C0"/>
              </linearGradient>
            </defs>
          </svg>
          <span
            style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1.0625rem" }}
            className="text-white"
          >
            CreatorGrove
          </span>
        </a>

        <a
          href="https://www.creatorgrove.com/brandratings"
          className="text-sm font-medium text-[#94A3B8] hover:text-[#29B6F6] transition-colors hidden sm:block"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Brand Ratings →
        </a>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: copy */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-widest"
              style={{
                background: "rgba(41,182,246,0.16)",
                border: "1px solid rgba(41,182,246,0.38)",
                color: "#7DD3FC",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
              Free Creator Tool
            </div>

            <h1
              className="mb-4 text-white"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                lineHeight: 1.1,
              }}
            >
              Is that brand deal{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #29B6F6 0%, #7DD3FC 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                legit or a scam?
              </span>
            </h1>

            <div
              className="mb-5 text-white"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                padding: "0.625rem 1rem",
                borderLeft: "3px solid #29B6F6",
                background: "rgba(41,182,246,0.08)",
                borderRadius: "0 0.5rem 0.5rem 0",
                display: "inline-block",
              }}
            >
              Paste the message. Get an instant AI verdict.
            </div>

            <p
              className="mb-8"
              style={{
                color: "#94A3B8",
                fontSize: "1rem",
                lineHeight: 1.75,
                maxWidth: 480,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Our AI scans brand outreach messages for scam signals — fake urgency,
              suspicious links, vague terms, and more. Free, ungated, no account needed.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Link href="/scamdetector">
                <button
                  className="inline-flex items-center justify-center gap-2 font-bold text-white rounded-xl transition-all"
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    padding: "0.9rem 1.875rem",
                    background: "linear-gradient(135deg, #29B6F6 0%, #1565C0 100%)",
                    boxShadow: "0 4px 20px rgba(41,182,246,0.38)",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "0.625rem",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(41,182,246,0.55)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(41,182,246,0.38)";
                  }}
                >
                  Check a deal now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <a
                href="https://www.creatorgrove.com/brandratings"
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  padding: "0.9rem 1.875rem",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: "0.625rem",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.16)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "";
                }}
              >
                Brand Ratings
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p style={{ fontSize: "0.75rem", color: "#94A3B8", fontFamily: "'Inter', sans-serif" }}>
              Free and ungated — no account required. Powered by Claude AI.
            </p>

            {/* Trust stats */}
            <div className="mt-8 flex flex-wrap gap-6">
              {[
                { value: "3 risk levels", label: "HIGH / CAUTION / LOW" },
                { value: "AI-powered", label: "Claude by Anthropic" },
                { value: "~3 seconds", label: "Average analysis time" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#29B6F6",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8", fontFamily: "'Inter', sans-serif" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: sample result cards */}
          <div className="space-y-4">
            <p
              className="text-center mb-5"
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#29B6F6",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Sample results
            </p>
            {SAMPLES.map((sample, i) => (
              <SampleCard key={sample.risk} sample={sample} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        className="relative z-10 py-16 lg:py-24"
        style={{ background: "#F8FBFF" }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span
              className="block mb-2"
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#29B6F6",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              How it works
            </span>
            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                color: "#0D1B2A",
                lineHeight: 1.15,
              }}
            >
              Three steps to know if a deal is real
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "1",
                title: "Paste the message",
                body: "Copy the full brand outreach DM, email, or text and paste it into the tool. Optional: add the brand name, sender email, and contact channel for deeper analysis.",
              },
              {
                num: "2",
                title: "AI scans for signals",
                body: "Claude AI checks for scam patterns: fake urgency, suspicious links, requests for personal info, vague payment terms, impersonation, and more.",
              },
              {
                num: "3",
                title: "Get a verdict in seconds",
                body: "See a color-coded risk level (HIGH / CAUTION / LOW), a risk score out of 100, a plain-English summary, and every signal explained.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-2xl p-6"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(41,182,246,0.12)",
                  boxShadow: "0 10px 32px rgba(13,27,42,0.06)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-lg"
                  style={{
                    background: "linear-gradient(135deg, #29B6F6 0%, #1565C0 100%)",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {step.num}
                </div>
                <h3
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "#0D1B2A",
                    marginBottom: "0.5rem",
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ color: "#64748B", fontSize: "0.95rem", lineHeight: 1.65 }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section
        className="relative z-10 py-16"
        style={{
          background: "linear-gradient(160deg, #0D1B2A 0%, #1a2f4a 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2
            className="mb-4 text-white"
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
            }}
          >
            Don't reply until you've checked it.
          </h2>
          <p
            className="mb-8"
            style={{ color: "#94A3B8", fontSize: "1rem", lineHeight: 1.75 }}
          >
            Scammers target creators every day. A 3-second check could save you from
            sending personal info, creating unpaid content, or worse.
          </p>
          <Link href="/scamdetector">
            <button
              className="inline-flex items-center gap-2 font-bold text-white rounded-xl"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: "0.9375rem",
                padding: "0.9rem 2.25rem",
                background: "linear-gradient(135deg, #29B6F6 0%, #1565C0 100%)",
                boxShadow: "0 4px 20px rgba(41,182,246,0.38)",
                border: "none",
                cursor: "pointer",
                borderRadius: "0.625rem",
              }}
            >
              Check a deal — it's free
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="relative z-10 py-8"
        style={{
          background: "#F8FBFF",
          borderTop: "1px solid rgba(41,182,246,0.1)",
        }}
      >
        <div
          className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="7" fill="url(#cg-grad-footer)" />
              <path d="M14 6L20 10V18L14 22L8 18V10L14 6Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
              <circle cx="14" cy="14" r="2.5" fill="white"/>
              <defs>
                <linearGradient id="cg-grad-footer" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#29B6F6"/>
                  <stop offset="1" stopColor="#1565C0"/>
                </linearGradient>
              </defs>
            </svg>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.875rem", color: "#0D1B2A" }}>
              CreatorGrove
            </span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#94A3B8", textAlign: "center" }}>
            AI matching is decision support only — always verify brands independently.
            &nbsp;·&nbsp; Patent Pending
          </p>
          <div className="flex gap-4">
            <a href="https://www.creatorgrove.com/brandratings" style={{ fontSize: "0.75rem", color: "#94A3B8" }}
              className="hover:text-[#29B6F6] transition-colors">
              Brand Ratings
            </a>
            <a href="https://www.creatorgrove.com/privacy" style={{ fontSize: "0.75rem", color: "#94A3B8" }}
              className="hover:text-[#29B6F6] transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
