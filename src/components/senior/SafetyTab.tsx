import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { checkScam } from "@/lib/senior.functions";
import { BigCard } from "./BigCard";
import { speak } from "./speak";

const TIPS = [
  { emoji: "🔢", text: "Never share an OTP. No bank or officer will ever ask for it." },
  { emoji: "📞", text: "If a caller hurries or scares you, hang up and call your family." },
  { emoji: "🔗", text: "Do not click links that promise prizes, refunds or free gifts." },
  { emoji: "💳", text: "Never send money to someone you have only met online." },
];

export function SafetyTab() {
  const [message, setMessage] = useState("");
  const [verdict, setVerdict] = useState("");
  const [busy, setBusy] = useState(false);
  const check = useServerFn(checkScam);

  async function run() {
    if (!message.trim()) {
      toast.error("Please paste the message you received.");
      return;
    }
    setBusy(true);
    setVerdict("");
    try {
      const result = await check({ data: { message } });
      setVerdict(result.verdict);
    } catch {
      toast.error("Could not check this message right now.");
    } finally {
      setBusy(false);
    }
  }

  const tone = verdict.toUpperCase().includes("DANGEROUS")
    ? "bg-destructive/15 border-destructive"
    : verdict.toUpperCase().includes("SUSPICIOUS")
      ? "bg-warning/25 border-warning"
      : "bg-success/15 border-success";

  return (
    <div className="space-y-6">
      <BigCard
        emoji="🛡️"
        title="Is this a scam?"
        subtitle="Paste any SMS, WhatsApp message or email. I will check it for you."
      >
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Paste the message here…"
          className="text-lg"
        />
        <Button size="lg" className="mt-4 h-14 w-full text-lg" onClick={run} disabled={busy}>
          {busy ? <Loader2 className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
          Check this message
        </Button>
        {verdict ? (
          <div className={`mt-4 rounded-2xl border-2 p-4 text-lg whitespace-pre-wrap ${tone}`}>
            {verdict}
            <Button
              variant="secondary"
              size="lg"
              className="mt-3 rounded-full"
              onClick={() => speak(verdict)}
            >
              Listen 🔊
            </Button>
          </div>
        ) : null}
      </BigCard>

      <BigCard emoji="💡" title="Simple safety rules">
        <ul className="space-y-3">
          {TIPS.map((tip) => (
            <li key={tip.text} className="flex items-start gap-3 rounded-2xl bg-muted p-4 text-lg">
              <span className="text-2xl" aria-hidden>
                {tip.emoji}
              </span>
              {tip.text}
            </li>
          ))}
        </ul>
      </BigCard>
    </div>
  );
}
