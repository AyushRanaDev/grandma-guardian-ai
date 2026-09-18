import { createFileRoute } from "@tanstack/react-router";
import { streamPlainText, type GatewayMessage } from "@/lib/ai.server";

const SYSTEM = `You are "Buddy", a warm, patient companion for senior citizens.
Rules:
- Use very simple words, short sentences, and a kind tone. Never talk down to the person.
- Keep answers under 120 words unless asked for more.
- Use numbered steps for anything the person must do.
- Add a friendly emoji now and then (not in every sentence).
- For medicine or health questions, give general info and gently suggest confirming with their doctor.
- If something sounds like a scam, say so clearly and tell them not to share money, OTP, or bank details.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: GatewayMessage[] };
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        try {
          return await streamPlainText([
            { role: "system", content: SYSTEM },
            ...body.messages.slice(-20),
          ]);
        } catch (error) {
          return new Response(error instanceof Error ? error.message : "Error", { status: 500 });
        }
      },
    },
  },
});
