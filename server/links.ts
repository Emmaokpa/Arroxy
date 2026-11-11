import { classifySource, needsRedirectResolution } from "../src/lib/sources";
import { ApiError } from "./errors";

const MAX_HOPS = 3;
const TIMEOUT_MS = 5_000;

/**
 * Follows a share link (e.g. `vm.tiktok.com/…`) to its canonical form.
 *
 * Only allowlisted hosts are ever contacted, every hop must stay inside a
 * supported source, and redirects are read rather than followed so a link
 * cannot steer the server at an arbitrary URL.
 */
export async function expandShortLink(raw: string): Promise<string> {
	if (!needsRedirectResolution(raw)) return raw;

	let current: URL;
	try {
		current = new URL(raw.trim());
	} catch {
		return raw;
	}

	for (let hop = 0; hop < MAX_HOPS; hop += 1) {
		const location = await readRedirect(current);
		if (!location) return current.toString();

		let next: URL;
		try {
			next = new URL(location, current);
		} catch {
			return current.toString();
		}
		if (next.protocol !== "http:" && next.protocol !== "https:") return current.toString();
		if (classifySource(next.toString()) === null) {
			throw new ApiError(400, "That short link points somewhere FlickGrab does not support.");
		}
		current = next;
		if (!needsRedirectResolution(next.toString())) return next.toString();
	}

	return current.toString();
}

async function readRedirect(url: URL): Promise<string | null> {
	for (const method of ["HEAD", "GET"] as const) {
		try {
			const response = await fetch(url, {
				method,
				redirect: "manual",
				signal: AbortSignal.timeout(TIMEOUT_MS),
			});
			const location = response.headers.get("location");
			if (location) return location;
			if (response.status < 400) return null;
		} catch {
			/* try the next method, then give up below */
		}
	}
	throw new ApiError(502, "That short link could not be resolved. Paste the full video link instead.");
}
