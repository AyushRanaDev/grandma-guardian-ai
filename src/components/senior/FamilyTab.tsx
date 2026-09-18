import { Button } from "@/components/ui/button";
import { PhoneCall, Video, Siren } from "lucide-react";
import { toast } from "sonner";
import { BigCard } from "./BigCard";

const PEOPLE = [
  { name: "Priya (Daughter)", emoji: "👩", phone: "+911234567890" },
  { name: "Arjun (Son)", emoji: "👨", phone: "+911234567891" },
  { name: "Dr. Mehta", emoji: "🩺", phone: "+911234567892" },
  { name: "Neighbour Kamal", emoji: "🏠", phone: "+911234567893" },
];

export function FamilyTab() {
  return (
    <div className="space-y-6">
      <BigCard emoji="❤️" title="My people" subtitle="One tap to call the people who care for you.">
        <div className="grid gap-4 sm:grid-cols-2">
          {PEOPLE.map((person) => (
            <div key={person.name} className="rounded-2xl border-2 border-border p-5 text-center">
              <div className="text-5xl" aria-hidden>
                {person.emoji}
              </div>
              <p className="mt-2 text-xl font-bold">{person.name}</p>
              <div className="mt-4 flex justify-center gap-3">
                <Button asChild size="lg" className="rounded-full">
                  <a href={`tel:${person.phone}`}>
                    <PhoneCall className="size-5" /> Call
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => toast.success(`Video call request sent to ${person.name} 📹`)}
                >
                  <Video className="size-5" /> Video
                </Button>
              </div>
            </div>
          ))}
        </div>
      </BigCard>

      <BigCard emoji="🚨" title="Need help right now?">
        <Button
          size="lg"
          variant="destructive"
          className="h-20 w-full text-xl"
          onClick={() => toast.success("Alert sent to Priya, Arjun and Dr. Mehta 🚑")}
        >
          <Siren className="size-7" /> Send emergency alert to my family
        </Button>
      </BigCard>
    </div>
  );
}
