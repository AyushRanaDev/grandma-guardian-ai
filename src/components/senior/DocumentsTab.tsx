import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Loader2, Share2, Trash2, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { simplifyDocument } from "@/lib/senior.functions";
import { useLocalState } from "@/lib/use-local-state";
import { BigCard } from "./BigCard";
import { speak } from "./speak";

type Doc = {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string;
  sharedWith: string[];
  addedAt: string;
};

const FAMILY = ["Daughter Priya", "Son Arjun", "Dr. Mehta"];

export function DocumentsTab() {
  const [docs, setDocs] = useLocalState<Doc[]>("sc.documents", []);
  const [text, setText] = useState("");
  const [simple, setSimple] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const simplify = useServerFn(simplifyDocument);

  function onFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > 3_000_000) {
        toast.error(`${file.name} is too big. Please pick a file under 3 MB.`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setDocs((list) => [
          {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type,
            data: String(reader.result),
            sharedWith: [],
            addedAt: new Date().toLocaleDateString(),
          },
          ...list,
        ]);
        toast.success(`${file.name} is saved safely 📁`);
      };
      reader.readAsDataURL(file);
    }
  }

  async function runSimplify() {
    if (!text.trim()) {
      toast.error("Please type or paste the letter first.");
      return;
    }
    setBusy(true);
    setSimple("");
    try {
      const result = await simplify({ data: { text } });
      setSimple(result.simple);
    } catch {
      toast.error("Could not simplify this right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <BigCard
        emoji="📁"
        title="My documents"
        subtitle="Keep bills, reports and ID copies in one safe place, and share with family."
      >
        <input
          ref={fileInput}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <Button size="lg" className="h-16 w-full text-lg" onClick={() => fileInput.current?.click()}>
          <Upload className="size-6" /> Add a document or photo
        </Button>

        <div className="mt-5 space-y-4">
          {docs.length === 0 ? (
            <p className="text-muted-foreground">Nothing saved yet. 🙂</p>
          ) : null}
          {docs.map((doc) => (
            <div key={doc.id} className="rounded-2xl border-2 border-border p-4">
              <div className="flex flex-wrap items-center gap-3">
                <FileText className="size-8 text-primary" />
                <div className="flex-1">
                  <p className="text-xl font-bold">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(doc.size / 1024).toFixed(0)} KB · added {doc.addedAt}
                  </p>
                </div>
                <Button asChild size="lg" variant="secondary" className="rounded-full">
                  <a href={doc.data} download={doc.name}>
                    <Download className="size-5" /> Open
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-full text-destructive"
                  aria-label={`Delete ${doc.name}`}
                  onClick={() => setDocs((list) => list.filter((d) => d.id !== doc.id))}
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Share2 className="size-5 text-muted-foreground" />
                <span className="font-bold">Share with:</span>
                {FAMILY.map((person) => {
                  const shared = doc.sharedWith.includes(person);
                  return (
                    <Button
                      key={person}
                      size="sm"
                      variant={shared ? "default" : "secondary"}
                      className="rounded-full text-base"
                      onClick={() => {
                        setDocs((list) =>
                          list.map((d) =>
                            d.id === doc.id
                              ? {
                                  ...d,
                                  sharedWith: shared
                                    ? d.sharedWith.filter((p) => p !== person)
                                    : [...d.sharedWith, person],
                                }
                              : d,
                          ),
                        );
                        toast.success(
                          shared ? `Stopped sharing with ${person}` : `Shared with ${person} ✅`,
                        );
                      }}
                    >
                      {person}
                    </Button>
                  );
                })}
                {doc.sharedWith.length ? (
                  <Badge className="rounded-full">Shared with {doc.sharedWith.length}</Badge>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </BigCard>

      <BigCard
        emoji="🔍"
        title="Explain a letter or bill"
        subtitle="Type or paste confusing words and I will say them simply."
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Paste the text from your bill, bank letter or hospital report…"
          className="text-lg"
        />
        <Button size="lg" className="mt-4 h-14 w-full text-lg" onClick={runSimplify} disabled={busy}>
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Wand2 className="size-5" />}
          Explain in simple words
        </Button>
        {simple ? (
          <div className="mt-4 rounded-2xl bg-muted p-4 text-lg whitespace-pre-wrap">
            {simple}
            <Button
              variant="secondary"
              size="lg"
              className="mt-3 rounded-full"
              onClick={() => speak(simple)}
            >
              Listen 🔊
            </Button>
          </div>
        ) : null}
      </BigCard>
    </div>
  );
}
