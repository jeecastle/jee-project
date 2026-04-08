import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

// Debug: 서버 시작 시 키 로드 여부 확인 (키 값은 노출하지 않음)
const apiKey = process.env.ANTHROPIC_API_KEY;
console.log("[Grounded] ANTHROPIC_API_KEY:", apiKey ? `설정됨 (${apiKey.slice(0, 8)}...)` : "❌ 없음 — .env.local 확인 필요");

if (!apiKey || apiKey === "your_api_key_here") {
  console.error("[Grounded] 유효한 ANTHROPIC_API_KEY가 없습니다. .env.local을 확인하세요.");
}

const anthropic = new Anthropic({ apiKey });

const SYSTEM_PROMPT = `You are a rigorous research document analyzer. Analyze the provided document and extract structured insights.

Output EXACTLY in this XML format, completing each section fully before moving to the next:

<section name="topic">
{"summary": "...", "evidence": ["...", "..."]}
</section>
<section name="methodology">
{"summary": "...", "evidence": ["...", "..."]}
</section>
<section name="conclusion">
{"summary": "...", "evidence": ["...", "..."]}
</section>
<section name="implications">
{"summary": "...", "evidence": ["...", "..."]}
</section>
<section name="counterarguments">
{"summary": "...", "evidence": ["...", "..."]}
</section>

Section definitions:
- topic: The core question or thesis the document addresses
- methodology: How the argument or findings are supported (experiments, data, literature review, case studies, etc.)
- conclusion: The final results or conclusions reached
- implications: What these conclusions mean for practice or future research
- counterarguments: Potential objections or limitations to the document's claims

Rules:
- summary: 2–4 sentences written in Korean (한국어로 작성)
- evidence: 2–4 direct verbatim quotes from the original document (in the document's original language)
- Keep quotes concise and relevant; do not paraphrase quotes
- Do NOT output any text outside the XML section tags
- Ensure valid JSON inside each section tag (properly escaped quotes, no trailing commas)`;

export async function POST(req: NextRequest) {
  // API 키 없으면 즉시 명확한 에러 반환
  if (!apiKey || apiKey === "your_api_key_here") {
    return new Response(
      JSON.stringify({
        error: "ANTHROPIC_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인하세요.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let text = "";

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const rawText = formData.get("text");
    const file = formData.get("file");

    if (file && file instanceof Blob) {
      const buffer = Buffer.from(await file.arrayBuffer());
      // Dynamically import pdf-parse to avoid client-side bundling issues
      const pdfParse = (await import("pdf-parse")).default;
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else if (rawText) {
      text = rawText.toString();
    }
  } else {
    const body = await req.json();
    text = body.text ?? "";
  }

  text = text.trim();

  if (!text) {
    return new Response(
      JSON.stringify({ error: "분석할 텍스트가 없습니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Truncate to avoid token limits (~100k chars ≈ ~25k tokens)
  const truncatedText = text.slice(0, 100_000);

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Please analyze this document:\n\n${truncatedText}`,
      },
    ],
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
        controller.enqueue(encoder.encode(`\n__ERROR__:${message}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
