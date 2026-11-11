import { hasFfmpeg, ytDlpVersion } from "@/lib/ytdlp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	const [ytdlp, ffmpeg] = await Promise.all([ytDlpVersion(), hasFfmpeg()]);
	return Response.json({ ok: ytdlp !== null, ytdlp, ffmpeg });
}
