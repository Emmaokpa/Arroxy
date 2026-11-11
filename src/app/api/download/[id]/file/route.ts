import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { apiError } from "@/lib/http";
import { getJobFile } from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function contentDisposition(filename: string): string {
	const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
	return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	const file = getJobFile(id);
	if (!file) return apiError("That download is not ready or has expired.", 404);

	try {
		const info = await stat(file.path);
		const stream = Readable.toWeb(createReadStream(file.path)) as unknown as ReadableStream<Uint8Array>;
		return new Response(stream, {
			headers: {
				"Content-Type": "application/octet-stream",
				"Content-Length": String(info.size),
				"Content-Disposition": contentDisposition(file.filename),
				"Cache-Control": "no-store",
			},
		});
	} catch {
		return apiError("That download is no longer available.", 404);
	}
}
