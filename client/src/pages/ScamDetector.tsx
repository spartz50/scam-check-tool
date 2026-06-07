import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Form schema ──────────────────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

type RiskLevel = "HIGH RISK" | "CAUTION" | "LOW RISK SIGNALS";

type ScamResult = {
  risk_level: RiskLevel;
  risk_score: number;
  summary: string;
  flags: Array<{ label: string; explanation: string }>;
};

// ─── Risk level styling ───────────────────────────────────────────────────────

const riskConfig: Record<
  RiskLevel,
  {
    border: string;
    bg: string;
    badge: string;
    badgeText: string;
    icon: React.ReactNode;
    scoreBar: string;
  }
> = {
  "HIGH RISK": {
    border: "border-red-500",
    bg: "bg-red-50",
    badge: "bg-red-600",
    badgeText: "text-white",
    icon: <ShieldAlert className="w-6 h-6 text-red-600" />,
    scoreBar: "bg-red-500",
  },
  CAUTION: {
    border: "border-amber-400",
    bg: "bg-amber-50",
    badge: "bg-amber-400",
    badgeText: "text-amber-900",
    icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    scoreBar: "bg-amber-400",
  },
  "LOW RISK SIGNALS": {
    border: "border-emerald-400",
    bg: "bg-emerald-50",
    badge: "bg-emerald-500",
    badgeText: "text-white",
    icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    scoreBar: "bg-emerald-500",
  },
};

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({ result }: { result: ScamResult }) {
  const cfg = riskConfig[result.risk_level];
  const [flagsOpen, setFlagsOpen] = useState(true);

  return (
    <div
      className={`rounded-xl border-2 ${cfg.border} ${cfg.bg} p-6 space-y-5 shadow-sm`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        {cfg.icon}
        <span
          className={`text-sm font-bold tracking-wide uppercase px-3 py-1 rounded-full ${cfg.badge} ${cfg.badgeText}`}
        >
          {result.risk_level}
        </span>
        <span className="ml-auto text-sm font-semibold text-gray-600">
          Risk score: {result.risk_score}/100
        </span>
      </div>

      {/* Score bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${cfg.scoreBar}`}
          style={{ width: `${Math.min(100, Math.max(0, result.risk_score))}%` }}
        />
      </div>

      {/* Summary */}
      <p className="text-gray-800 text-sm leading-relaxed">{result.summary}</p>

      {/* Flags */}
      {result.flags.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setFlagsOpen(o => !o)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700 transition-colors"
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
                  className="flex gap-2.5 bg-white/70 rounded-lg px-4 py-3 border border-gray-100"
                >
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
                  <div>
                    <span className="font-semibold text-gray-800 text-sm">
                      {flag.label}
                    </span>
                    <span className="text-gray-600 text-sm"> — {flag.explanation}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 border-t border-gray-200 pt-4">
        Pattern/AI matching is decision support only and cannot guarantee whether
        an opportunity is safe. Always verify the brand independently before
        sending content, personal information, or money.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

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
        err.message ||
          "Something went wrong. Please try again in a moment."
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
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <header className="bg-white border-b border-gray-200 px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            Creator Scam Detector
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Paste a brand outreach or deal message below to check it for scam
            signals. Optional fields add context but are never required.
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="font-semibold text-gray-800">
              Pasted message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              rows={7}
              placeholder="Paste the full brand outreach or deal message here…"
              className="resize-y text-sm"
              {...register("message")}
            />
            {errors.message && (
              <p className="text-xs text-red-500">{errors.message.message}</p>
            )}
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="brandName" className="text-sm text-gray-700">
                Brand / sender name
                <span className="ml-1 text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="brandName"
                placeholder="e.g. Acme Co."
                className="text-sm"
                {...register("brandName")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senderEmail" className="text-sm text-gray-700">
                Sender email / domain
                <span className="ml-1 text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="senderEmail"
                placeholder="e.g. hello@brand.com"
                className="text-sm"
                {...register("senderEmail")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactChannel" className="text-sm text-gray-700">
                Contact channel
                <span className="ml-1 text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="contactChannel"
                placeholder="e.g. Instagram DM"
                className="text-sm"
                {...register("contactChannel")}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={checkMutation.isPending}
            className="w-full sm:w-auto"
          >
            {checkMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing…
              </>
            ) : (
              "Check this message"
            )}
          </Button>
        </form>

        {/* API error fallback */}
        {apiError && (
          <div className="rounded-xl border-2 border-gray-300 bg-white p-5 flex gap-3 items-start shadow-sm">
            <AlertTriangle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                Unable to complete the check
              </p>
              <p className="text-sm text-gray-600 mt-0.5">{apiError}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && <ResultCard result={result} />}
      </main>
    </div>
  );
}
