export type GatewayMessage = { role: "user" | "assistant" | "system"; content: string };

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";

function toInput(messages: GatewayMessage[]) {
  return messages.map((m) => ({
    role: m.role,
    content: [
      {
        type: m.role === "assistant" ? "output_text" : "input_text",
        text: m.content,
      },
    ],
  }));
}

export async function callGateway(messages: GatewayMessage[]): Promise<Response> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  return fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      input: toInput(messages),
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
    }),
  });
}

/** Streams the gateway SSE response and re-emits only the plain answer text. */
export async function streamPlainText(messages: GatewayMessage[]): Promise<Response> {
  const upstream = await callGateway(messages);
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return new Response(detail || "The assistant is unavailable right now.", {
      status: upstream.status || 500,
    });
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const event = JSON.parse(payload) as {
                type?: string;
                delta?: string;
              };
              if (event.type === "response.output_text.delta" && event.delta) {
                controller.enqueue(encoder.encode(event.delta));
              }
            } catch {
              // ignore partial/non-JSON frames
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function generateText(messages: GatewayMessage[]): Promise<string> {
  const res = await streamPlainText(messages);
  if (!res.ok) throw new Error(await res.text());
  return await res.text();
}
