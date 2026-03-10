import { Hono } from "hono";

export function voiceRoutes(): Hono {
  const app = new Hono();

  // POST /voice/transcribe — proxy to Groq STT
  app.post("/transcribe", async (c) => {
    const apiKey = c.req.header("x-api-key");
    if (!apiKey) {
      return c.json({ error: "Missing API key" }, 401);
    }

    const bodyBuffer = await c.req.arrayBuffer();
    const contentType = c.req.header("content-type") ?? "application/octet-stream";

    const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": contentType,
      },
      body: bodyBuffer,
    });

    const data = await groqRes.text();
    return new Response(data, {
      status: groqRes.status,
      headers: { "Content-Type": "application/json" },
    });
  });

  // POST /voice/synthesize — proxy to Groq TTS
  app.post("/synthesize", async (c) => {
    const apiKey = c.req.header("x-api-key");
    if (!apiKey) {
      return c.json({ error: "Missing API key" }, 401);
    }

    const body = await c.req.json();
    const groqRes = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return new Response(JSON.stringify({ error: errText }), {
        status: groqRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await groqRes.arrayBuffer();
    return new Response(audioBuffer, {
      headers: { "Content-Type": "audio/wav" },
    });
  });

  // POST /voice/inworld-synthesize — streaming proxy to Inworld AI TTS
  app.post("/inworld-synthesize", async (c) => {
    const apiKey = c.req.header("x-api-key");
    if (!apiKey) {
      return c.json({ error: "Missing API key" }, 401);
    }

    const body = await c.req.json();
    const inworldRes = await fetch("https://api.inworld.ai/tts/v1/voice:stream", {
      method: "POST",
      headers: {
        Authorization: `Basic ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!inworldRes.ok) {
      const errText = await inworldRes.text();
      return new Response(JSON.stringify({ error: errText }), {
        status: inworldRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse NDJSON stream and decode base64 audio chunks
    const reader = inworldRes.body!.getReader();
    const decoder = new TextDecoder();
    let ndjsonBuf = "";

    const stream = new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          ndjsonBuf += decoder.decode(value, { stream: true });

          while (ndjsonBuf.includes("\n")) {
            const idx = ndjsonBuf.indexOf("\n");
            const line = ndjsonBuf.slice(0, idx).trim();
            ndjsonBuf = ndjsonBuf.slice(idx + 1);

            if (!line) continue;
            try {
              const chunk = JSON.parse(line);
              if (chunk.error) {
                controller.error(new Error(chunk.error.message ?? "Inworld stream error"));
                return;
              }
              const audioB64 = chunk.result?.audioContent;
              if (audioB64) {
                controller.enqueue(Buffer.from(audioB64, "base64"));
              }
            } catch {
              // Skip malformed NDJSON lines
            }
          }
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  });

  // GET /voice/inworld-voices — proxy to Inworld AI voice list
  app.get("/inworld-voices", async (c) => {
    const apiKey = c.req.header("x-api-key");
    if (!apiKey) {
      return c.json({ error: "Missing API key" }, 401);
    }

    const inworldRes = await fetch("https://api.inworld.ai/tts/v1/voices", {
      headers: {
        Authorization: `Basic ${apiKey}`,
      },
    });

    if (!inworldRes.ok) {
      const errText = await inworldRes.text();
      return new Response(JSON.stringify({ error: errText }), {
        status: inworldRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await inworldRes.json();
    return c.json(data);
  });

  return app;
}
