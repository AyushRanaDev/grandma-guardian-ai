import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BigCard } from "@/components/senior/BigCard";
import { MedicinesTab, type Medicine } from "@/components/senior/MedicinesTab";
import { DocumentsTab } from "@/components/senior/DocumentsTab";
import { TasksTab, type Task } from "@/components/senior/TasksTab";
import { SafetyTab } from "@/components/senior/SafetyTab";
import { FamilyTab } from "@/components/senior/FamilyTab";
import { BuddyChat } from "@/components/senior/BuddyChat";
import { useLocalState } from "@/lib/use-local-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saathi — A caring daily companion for seniors" },
      {
        name: "description",
        content:
          "Saathi helps senior citizens with medicines, documents, appointments, scam checks, family calls and a friendly AI helper.",
      },
      { property: "og:title", content: "Saathi — A caring daily companion for seniors" },
      {
        property: "og:description",
        content:
          "Big buttons, simple words and a kind AI helper for medicines, bills, documents and staying safe online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const TABS = [
  { value: "today", emoji: "🏠", label: "Today" },
  { value: "medicines", emoji: "💊", label: "Medicines" },
  { value: "documents", emoji: "📁", label: "Documents" },
  { value: "tasks", emoji: "🗓️", label: "Reminders" },
  { value: "safety", emoji: "🛡️", label: "Stay safe" },
  { value: "family", emoji: "❤️", label: "Family" },
  { value: "buddy", emoji: "🤗", label: "Ask Buddy" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function TodayTab({ go }: { go: (tab: string) => void }) {
  const [medicines] = useLocalState<Medicine[]>("sc.medicines", []);
  const [tasks] = useLocalState<Task[]>("sc.tasks", []);
  const today = new Date().toDateString();
  const pending = medicines.filter((m) => m.takenOn !== today);
  const upcoming = [...tasks]
    .filter((t) => !t.done)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <BigCard
        emoji="🌞"
        title={`${greeting()}! Here is your day.`}
        subtitle="Take your time. Everything here is big, simple and safe."
        readAloud={`${greeting()}. You have ${pending.length} medicines left to take today and ${upcoming.length} reminders coming up.`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-secondary p-5">
            <p className="text-lg font-bold">💊 Medicines left today</p>
            <p className="mt-1 text-4xl font-extrabold">{pending.length}</p>
            <ul className="mt-2 space-y-1 text-lg">
              {pending.slice(0, 3).map((m) => (
                <li key={m.id}>
                  • {m.name} — {m.time}
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-4 rounded-full" onClick={() => go("medicines")}>
              Open medicines
            </Button>
          </div>
          <div className="rounded-2xl bg-secondary p-5">
            <p className="text-lg font-bold">🗓️ Coming up</p>
            <p className="mt-1 text-4xl font-extrabold">{upcoming.length}</p>
            <ul className="mt-2 space-y-1 text-lg">
              {upcoming.map((t) => (
                <li key={t.id}>
                  • {t.title} — {new Date(t.date).toDateString()}
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-4 rounded-full" onClick={() => go("tasks")}>
              Open reminders
            </Button>
          </div>
        </div>
      </BigCard>

      <BigCard emoji="✋" title="What would you like to do?">
        <div className="grid gap-4 sm:grid-cols-3">
          {TABS.filter((t) => t.value !== "today").map((t) => (
            <Button
              key={t.value}
              variant="secondary"
              className="h-28 flex-col gap-2 rounded-3xl text-lg font-bold"
              onClick={() => go(t.value)}
            >
              <span className="text-4xl" aria-hidden>
                {t.emoji}
              </span>
              {t.label}
            </Button>
          ))}
        </div>
      </BigCard>
    </div>
  );
}

function Home() {
  const [tab, setTab] = useState("today");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-5 py-4">
          <span className="text-4xl" aria-hidden>
            🧡
          </span>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Saathi</h1>
            <p className="text-muted-foreground">Your caring daily companion</p>
          </div>
          <Button size="lg" className="rounded-full text-lg" onClick={() => setTab("buddy")}>
            🤗 Ask Buddy
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 flex h-auto w-full flex-wrap gap-2 rounded-3xl bg-secondary/70 p-2">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex-1 rounded-2xl px-4 py-3 text-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="mr-2 text-2xl" aria-hidden>
                  {t.emoji}
                </span>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="today">
            <TodayTab go={setTab} />
          </TabsContent>
          <TabsContent value="medicines">
            <MedicinesTab />
          </TabsContent>
          <TabsContent value="documents">
            <DocumentsTab />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksTab />
          </TabsContent>
          <TabsContent value="safety">
            <SafetyTab />
          </TabsContent>
          <TabsContent value="family">
            <FamilyTab />
          </TabsContent>
          <TabsContent value="buddy">
            <BuddyChat />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mx-auto max-w-5xl px-5 pb-10 text-center text-muted-foreground">
        Saathi gives friendly guidance, not medical advice. Please check with your doctor. 🩺
      </footer>
    </div>
  );
}
