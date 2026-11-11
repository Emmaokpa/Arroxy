import { DownloadRequestSchema } from "@/lib/contracts";
import { apiError } from "@/lib/http";
import { createJob, TooManyDownloadsError } from "@/lib/jobs";
import { normalizeUrl } from "@/lib/sources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return apiError("Invalid request body.", 400);
	}

	const parsed = DownloadRequestSchema.safeParse(body);
	if (!parsed.success) {
		return apiError("Invalid download request.", 400);
	}

	const url = normalizeUrl(parsed.data.url);
	if (!url) {
		return apiError("Unsupported link. Use a YouTube, Instagram or TikTok URL.", 400);
	}

	try {
		const job = await createJob(url, parsed.data.optionId);
		return Response.json(job, { status: 202 });
	} catch (error) {
		if (error instanceof TooManyDownloadsError) return apiError(error.message, 429);
		return apiError(error instanceof Error ? error.message : "Download could not be started.", 502);
	}
}
