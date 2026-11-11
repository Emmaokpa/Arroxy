import path from "node:path";
import { writeFile, chmod, mkdir } from "node:fs/promises";

const BIN_NAME = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
const DOWNLOAD_URL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${BIN_NAME}`;

async function main() {
	const dir = path.join(process.cwd(), ".bin");
	const dest = path.join(dir, BIN_NAME);

	console.log(`Downloading yt-dlp from ${DOWNLOAD_URL}`);
	const response = await fetch(DOWNLOAD_URL, { redirect: "follow" });
	if (!response.ok) {
		throw new Error(`Download failed with HTTP ${response.status}`);
	}

	await mkdir(dir, { recursive: true });
	const bytes = new Uint8Array(await response.arrayBuffer());
	await writeFile(dest, bytes);
	if (process.platform !== "win32") await chmod(dest, 0o755);

	console.log(`Saved ${BIN_NAME} (${(bytes.byteLength / 1024 / 1024).toFixed(1)} MB) to ${dest}`);
	console.log("ffmpeg is provided by the ffmpeg-static npm package (or FFMPEG_PATH).");
}

await main();
