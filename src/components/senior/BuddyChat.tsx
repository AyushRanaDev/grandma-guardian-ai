import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Volume2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { speak } from "./speak";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I book a doctor appointment online?",
  "Explain my electricity bill in simple words",
  "Someone asked for my OTP, what should I do?",
  "Give me gentle exercises for my knees",
];

export function BuddyChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Namaste! 👋 I am Buddy, your helper. Ask me anything — about medicines, bills, phone problems, or just for a chat.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) {
        throw new Error(await res.text());
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
      if (!acc.trim()) {
        setMessages([
          ...next,
          { role: "assistant", content: "Sorry, I could not answer that. Please ask me again." },
        ]);
      }
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Sorry, I could not reach my helper right now. Please try again in a minute.",
        },
      ]);
      toast.error("The assistant is not reachable right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-soft flex h-[70vh] flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b-2 border-border bg-secondary/60 p-4">
        <span className="text-4xl" aria-hidden>
          🧑‍🦳
        </span>
        <div>
          <h2 className="text-2xl font-extrabold">Buddy, your helper</h2>
          <p className="text-muted-foreground">Ask anything, in your own words.</p>
        </div>
      </div>

      <div ref={boxRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            {m.role === "user" ? (
              <p className="max-w-[80%] rounded-3xl bg-primary px-5 py-3 text-lg text-primary-foreground">
                {m.content}
              </p>
            ) : (
              <div className="flex max-w-[92%] gap-3">
                <span className="text-3xl" aria-hidden>
                  🤗
                </span>
                <div className="text-lg whitespace-pre-wrap">
                  {m.content || (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="size-5 animate-spin" /> Thinking…
                    </span>
                  )}
                  {m.content ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 rounded-full"
                      onClick={() => speak(m.content)}
                    >
                      <Volume2 className="size-4" /> Listen
                    </Button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t-2 border-border p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <Button
              key={s}
              size="sm"
              variant="secondary"
              className="rounded-full text-base"
              onClick={() => send(s)}
              disabled={busy}
            >
              {s}
            </Button>
          ))}
        </div>
        <div className="flex gap-3">
          <Textarea
            ref={inputRef}
            value={input}
            rows={2}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="Type your question here…"
            className="text-lg"
          />
          <Button
            size="lg"
            className="h-auto px-6"
            onClick={() => void send(input)}
            disabled={busy}
            aria-label="Send message"
          >
            {busy ? <Loader2 className="size-6 animate-spin" /> : <Send className="size-6" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
