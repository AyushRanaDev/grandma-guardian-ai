import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLocalState } from "@/lib/use-local-state";
import { BigCard } from "./BigCard";

export type Task = {
  id: string;
  title: string;
  date: string;
  kind: "Appointment" | "Bill" | "Other";
  done: boolean;
};

const KINDS: Task["kind"][] = ["Appointment", "Bill", "Other"];
const EMOJI: Record<Task["kind"], string> = {
  Appointment: "🩺",
  Bill: "🧾",
  Other: "📌",
};

export function TasksTab() {
  const [tasks, setTasks] = useLocalState<Task[]>("sc.tasks", []);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [kind, setKind] = useState<Task["kind"]>("Appointment");

  function add() {
    if (!title.trim() || !date) {
      toast.error("Please write what it is and pick a date.");
      return;
    }
    setTasks((list) => [
      ...list,
      { id: crypto.randomUUID(), title: title.trim(), date, kind, done: false },
    ]);
    setTitle("");
    setDate("");
    toast.success("Added to your reminders 🔔");
  }

  const sorted = [...tasks].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <BigCard emoji="🗓️" title="Appointments and bills" subtitle="I will keep track for you.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="task-title" className="text-lg font-bold">
              What is it?
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Eye check-up with Dr. Mehta"
              className="mt-2 h-14 text-lg"
            />
          </div>
          <div>
            <Label htmlFor="task-date" className="text-lg font-bold">
              Which day?
            </Label>
            <Input
              id="task-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 h-14 text-lg"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {KINDS.map((k) => (
            <Button
              key={k}
              size="lg"
              variant={kind === k ? "default" : "secondary"}
              className="rounded-full text-base"
              onClick={() => setKind(k)}
            >
              {EMOJI[k]} {k}
            </Button>
          ))}
        </div>
        <Button size="lg" className="mt-5 h-14 w-full text-lg" onClick={add}>
          <CalendarPlus className="size-5" /> Add reminder
        </Button>
      </BigCard>

      <div className="space-y-4">
        {sorted.map((task) => (
          <div key={task.id} className="card-soft flex flex-wrap items-center gap-3 p-5">
            <span className="text-3xl" aria-hidden>
              {EMOJI[task.kind]}
            </span>
            <div className="flex-1">
              <p className={`text-xl font-bold ${task.done ? "line-through opacity-60" : ""}`}>
                {task.title}
              </p>
              <Badge className="mt-1 rounded-full text-sm">
                {new Date(task.date).toDateString()}
              </Badge>
            </div>
            <Button
              size="lg"
              variant={task.done ? "secondary" : "default"}
              className="rounded-full"
              onClick={() =>
                setTasks((list) =>
                  list.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)),
                )
              }
            >
              <Check className="size-5" /> {task.done ? "Done" : "Mark done"}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full text-destructive"
              aria-label={`Delete ${task.title}`}
              onClick={() => setTasks((list) => list.filter((t) => t.id !== task.id))}
            >
              <Trash2 className="size-5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
