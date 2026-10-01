import { withSupabase } from "npm:@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = "gpt-5.6-luna";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildPrompt(mode: string, input: Record<string, unknown>) {
  const workspace = input.workspace ?? {};
  const content = Array.isArray(input.content) ? input.content : [];
  const base = `You are GrowthScope AI, a social media growth strategist.
Your job is to produce specific, original, data-aware output for the user's workspace.
Do not use generic filler. Do not repeat fixed templates. Every generation must be derived from the supplied topic, audience goal, tone, platform, and workspace patterns when available.

Workspace context:
${JSON.stringify(workspace)}

Recent content dataset:
${JSON.stringify(content.slice(0, 40))}

`;

  if (mode === "ideas") {
    return base + `
Generate 5 genuinely different content concepts.
Parameters:
platform: ${input.platform}
goal: ${input.goal}
tone: ${input.tone}
preferred pillar: ${input.pillar}

Return ONLY valid JSON:
{"ideas":[{"title":"","angle":"","hook":"","format":"","cta":"","why_it_fits":""}]}

Make each idea distinct in angle and hook. Use the workspace data to avoid suggesting the same patterns repeatedly.`;
  }

  if (mode === "caption") {
    return base + `
Write one original social media caption.
Topic: ${input.topic}
Platform: ${input.platform}
Goal: ${input.goal}
Tone: ${input.tone}

Return ONLY valid JSON:
{"hook":"","body":"","cta":"","hashtags":[]}

The caption must be specific to the topic and platform. Avoid empty phrases such as "di era digital" unless genuinely relevant. Match the requested tone naturally.`;
  }

  if (mode === "analysis") {
    return base + `
Analyze the workspace performance as a real analyst.
Identify 3-5 meaningful patterns, explain why they matter, and give 3 concrete next actions.
Do not invent metrics. If the dataset is too small, explicitly say what cannot yet be concluded.

Return ONLY valid JSON:
{"summary":"","patterns":[{"finding":"","evidence":"","implication":""}],"actions":[{"priority":"","action":"","reason":""}]}`;
  }

  return base + `
Give one concise, specific recommendation based on the supplied workspace data.
Return ONLY valid JSON:
{"recommendation":"","evidence":"","next_step":""}`;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
      const openaiKey = Deno.env.get("OPENAI_API_KEY");
      if (!openaiKey) return json({ error: "OPENAI_API_KEY belum dikonfigurasi di Supabase Edge Function Secrets." }, 500);

      const body = await req.json();
      const mode = String(body.mode || "");
      if (!["ideas", "caption", "analysis", "recommendation"].includes(mode)) {
        return json({ error: "Mode AI tidak valid." }, 400);
      }

      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          input: buildPrompt(mode, body),
          max_output_tokens: mode === "ideas" ? 1800 : 1400,
        }),
      });

      const raw = await response.json();
      if (!response.ok) {
        console.error("OpenAI error", raw);
        return json({ error: raw?.error?.message || "OpenAI API request gagal." }, response.status);
      }

      const text = raw?.output_text ||
        raw?.output?.flatMap((item: any) => item?.content || [])
          ?.map((part: any) => part?.text || "")
          ?.join("") || "";

      if (!text) return json({ error: "AI tidak mengembalikan teks." }, 502);

      return json({ text, model: MODEL });
    } catch (error) {
      console.error("GrowthScope AI error", error);
      return json({ error: error instanceof Error ? error.message : "Terjadi kesalahan pada AI." }, 500);
    }
  }),
};
