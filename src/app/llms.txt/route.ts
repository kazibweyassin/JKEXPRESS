import { buildLlmsTxt } from "@/lib/seo";

export function GET() {
  return new Response(buildLlmsTxt(false), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
