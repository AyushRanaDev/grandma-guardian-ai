import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Volume2, Check } from "lucide-react";
import { toast } from "sonner";
import { explainMedicine } from "@/lib/senior.functions";
import { useLocalState } from "@/lib/use-local-state";
import { speak } from "./speak";
import { BigCard } from "./BigCard";

export type Medicine = {
  id: string;
  name: string;
  dose: string;
  time: string;
  summary: string;
  takenOn: string | null;
};

const TIMES = [
  { label: "Morning ☀️", value: "Morning" },
  { label: "Afternoon 🥣", value: "Afternoon" },
  { label: "Night 🌙", value: "Night" },
];

const today = () => new Date().toDateString();

export function MedicinesTab() {
  const [medicines, setMedicines] = useLocalState<Medicine[]>("sc.medicines", []);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("Morning");
  const [busy, setBusy] = useState(false);
  const explain = useServerFn(explainMedicine);

  async function addMedicine() {
    if (!name.trim()) {
      toast.error("Please write the medicine name first.");
      return;
    }
    setBusy(true);
    const id = crypto.randomUUID();
    const entry: Medicine = {
      id,
      name: name.trim(),
      dose: dose.trim(),
      time,
      summary: "",
      takenOn: null,
    };
    setMedicines((list) => [...list, entry]);
    setName("");
    setDose("");
    try {
      const result = await explain({ data: { name: entry.name, dose: entry.dose } });
      setMedicines((list) =>
        list.map((m) => (m.id === id ? { ...m, summary: result.summary } : m)),
      );
    } catch {
      setMedicines((list) =>
        list.map((m) =>
          m.id === id
            ? { ...m, summary: "Sorry, I could not look this up just now. Please try again." }
            : m,
        ),
      );
      toast.error("Could not fetch the medicine explanation.");
    } finally {
      setBusy(false);
    }
  }

  const takenCount = medicines.filter((m) => m.takenOn === today()).length;

  return (
    <div className="space-y-6">
      <BigCard
        emoji="💊"
        title="My medicines"
        subtitle={
          medicines.length
            ? `You have taken ${takenCount} of ${medicines.length} today. Well done!`
            : "Add a medicine and I will explain it in simple words."
        }
      >
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div>
            <Label htmlFor="med-name" className="text-lg font-bold">
              Medicine name
            </Label>
            <Input
              id="med-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="For example: Metformin"
              className="mt-2 h-14 text-lg"
            />
          </div>
          <div>
            <Label htmlFor="med-dose" className="text-lg font-bold">
              Dose (if you know)
            </Label>
            <Input
              id="med-dose"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="500 mg"
              className="mt-2 h-14 text-lg"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-lg font-bold">When?</span>
          {TIMES.map((t) => (
            <Button
              key={t.value}
              type="button"
              size="lg"
              variant={time === t.value ? "default" : "secondary"}
              className="rounded-full text-base"
              onClick={() => setTime(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <Button size="lg" className="mt-5 h-14 w-full text-lg" onClick={addMedicine} disabled={busy}>
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
          Add medicine and explain it
        </Button>
      </BigCard>

      <div className="space-y-4">
        {medicines.map((m) => {
          const taken = m.takenOn === today();
          return (
            <div key={m.id} className="card-soft p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl" aria-hidden>
                  💊
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-extrabold">
                    {m.name} {m.dose ? <span className="text-muted-foreground">· {m.dose}</span> : null}
                  </h3>
                  <Badge className="mt-1 rounded-full text-sm">{m.time}</Badge>
                </div>
                <Button
                  size="lg"
                  variant={taken ? "secondary" : "default"}
                  className="rounded-full"
                  onClick={() =>
                    setMedicines((list) =>
                      list.map((x) =>
                        x.id === m.id ? { ...x, takenOn: taken ? null : today() } : x,
                      ),
                    )
                  }
                >
                  <Check className="size-5" /> {taken ? "Taken today" : "Mark as taken"}
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-full"
                  aria-label={`Listen to ${m.name} details`}
                  onClick={() => speak(`${m.name}. ${m.summary}`)}
                >
                  <Volume2 className="size-5" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-full text-destructive"
                  aria-label={`Remove ${m.name}`}
                  onClick={() => setMedicines((list) => list.filter((x) => x.id !== m.id))}
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
              <div className="mt-3 rounded-2xl bg-muted p-4 text-lg whitespace-pre-wrap">
                {m.summary || (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" /> Looking this up for you…
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
