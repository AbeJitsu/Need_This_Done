import { NextRequest, NextResponse } from "next/server";
import { badRequest } from "@/lib/api-errors";
import {
  validatePayloadStructure,
  validateRequestSize,
} from "@/lib/api-input-guard";
import { inspectContactImport } from "@/lib/portfolio-import";

export const runtime = "nodejs";
const MAX_BYTES = 12 * 1024;

export async function POST(request: NextRequest) {
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  ) {
    return NextResponse.json(
      { error: "Send application/json." },
      { status: 415 },
    );
  }
  const sizeError = validateRequestSize(request, MAX_BYTES, "Import preview");
  if (sizeError) return sizeError;
  if (!request.body)
    return badRequest("Provide a JSON array of 1–25 contacts.");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) {
        await reader.cancel();
        return badRequest("Use a payload of 12 KB or less.");
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    const input: unknown = JSON.parse(text);
    const structureError = validatePayloadStructure(input, "Import preview");
    if (structureError) return badRequest(structureError);
    const result = inspectContactImport(input);
    if (!result) return badRequest("Provide a JSON array of 1–25 contacts.");
    return NextResponse.json(result, {
      status: result.ok ? 200 : 422,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return badRequest("Provide valid JSON.");
  } finally {
    reader.releaseLock();
  }
}
