import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { speak } from "./speak";

export function BigCard({
  emoji,
  title,
  subtitle,
  children,
  readAloud,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  readAloud?: string;
}) {
  return (
    <section className="card-soft p-6">
      <div className="flex items-start gap-4">
        <span className="text-4xl leading-none" aria-hidden>
          {emoji}
        </span>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
          {subtitle ? <p className="mt-1 text-muted-foreground">{subtitle}</p> : null}
        </div>
        {readAloud ? (
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full"
            onClick={() => speak(readAloud)}
            aria-label={`Read aloud: ${title}`}
          >
            <Volume2 className="size-5" /> Listen
          </Button>
        ) : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
