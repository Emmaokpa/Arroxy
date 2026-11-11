import { apiError } from "@/lib/http";
import { getJob } from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	const job = getJob(id);
	if (!job) return apiError("Unknown or expired download.", 404);
	return Response.json(job);
}
