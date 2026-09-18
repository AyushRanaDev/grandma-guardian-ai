import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MedicineInput = z.object({
  name: z.string().min(1),
  dose: z.string().optional().default(""),
});

export const explainMedicine = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MedicineInput.parse(input))
  .handler(async ({ data }) => {
    const { generateText } = await import("@/lib/ai.server");
    const text = await generateText([
      {
        role: "system",
        content:
          "You explain medicines to senior citizens in very simple words. Answer in exactly this format, nothing else:\nWhy: <one short sentence, max 20 words>\nUsual dose: <one short sentence about the typical adult dose and when to take it>\nCare: <one short safety tip>\nAlways add nothing extra. Never give a prescription; keep it general.",
      },
      {
        role: "user",
        content: `Medicine: ${data.name}${data.dose ? `. The person wrote this dose: ${data.dose}` : ""}`,
      },
    ]);
    return { summary: text.trim() };
  });

const ScamInput = z.object({ message: z.string().min(1) });

export const checkScam = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ScamInput.parse(input))
  .handler(async ({ data }) => {
    const { generateText } = await import("@/lib/ai.server");
    const text = await generateText([
      {
        role: "system",
        content:
          "You protect senior citizens from scams. Read the message they received and reply in exactly this format:\nVerdict: SAFE or SUSPICIOUS or DANGEROUS\nWhy: <one or two very simple sentences>\nDo this: <one clear action, e.g. do not click, do not share OTP, call your family>",
      },
      { role: "user", content: data.message },
    ]);
    return { verdict: text.trim() };
  });

const SimplifyInput = z.object({ text: z.string().min(1) });

export const simplifyDocument = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SimplifyInput.parse(input))
  .handler(async ({ data }) => {
    const { generateText } = await import("@/lib/ai.server");
    const text = await generateText([
      {
        role: "system",
        content:
          "You turn confusing letters, bills and forms into plain words for a senior citizen. Reply with:\nIn simple words: <2-3 short sentences>\nWhat to do: <up to 3 numbered short steps>\nWatch out: <one short line, or 'Nothing worrying'>",
      },
      { role: "user", content: data.text.slice(0, 6000) },
    ]);
    return { simple: text.trim() };
  });
