import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../server/app";
import type { ServerConfig } from "../../server/config";

const config: ServerConfig = { port: 4000, corsOrigins: ["http://localhost:3000"] };

const YOUTUBE_METADATA = {
	title: "A real title",
	author_name: "A real channel",
	thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
};

/**
 * Stands in for the outbound network. Metadata endpoints answer like oEmbed;
 * anything else fails so an accidental outbound call is visible in tests.
 */
function mockNetwork(overrides: Record<string, () => Response> = {}) {
	const calls: string[] = [];
	const mock = vi.fn(async (input: string | URL | Request) => {
		const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
		calls.push(url);
		for (const [fragment, build] of Object.entries(overrides)) {
			if (url.includes(fragment)) return build();
		}
		if (url.includes("youtube.com/oembed")) {
			return new Response(JSON.stringify(YOUTUBE_METADATA), {
				status: 200,
				headers: { "content-type": "application/json" },
			});
		}
		return new Response("not found", { status: 404 });
	});
	vi.stubGlobal("fetch", mock);
	return calls;
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("GET /api/health", () => {
	it("reports readiness without touching the network", async () => {
		const calls = mockNetwork();
		const response = await request(createApp(config)).get("/api/health");
		expect(response.status).toBe(200);
		expect(response.body.ok).toBe(true);
		expect(calls).toHaveLength(0);
	});
});

describe("GET /api/capabilities", () => {
	it("lists every source with a reason", async () => {
		mockNetwork();
		const response = await request(createApp(config)).get("/api/capabilities");
		expect(response.status).toBe(200);
		expect(response.body.measuredOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(response.body.capabilities.map((row: { source: string }) => row.source)).toEqual([
			"youtube",
			"instagram",
			"tiktok",
			"file",
		]);
		for (const row of response.body.capabilities) {
			expect(row.reason.length).toBeGreaterThan(10);
		}
	});
});

describe("POST /api/inspect", () => {
	it("rejects a missing link", async () => {
		mockNetwork();
		const response = await request(createApp(config)).post("/api/inspect").send({});
		expect(response.status).toBe(400);
		expect(response.body.error).toBeTruthy();
	});

	it("rejects a non-http scheme", async () => {
		mockNetwork();
		const response = await request(createApp(config)).post("/api/inspect").send({ url: "file:///etc/passwd" });
		expect(response.status).toBe(400);
	});

	it("rejects hosts outside the allowlist", async () => {
		mockNetwork();
		const response = await request(createApp(config)).post("/api/inspect").send({ url: "https://example.com/watch" });
		expect(response.status).toBe(400);
		expect(response.body.error).toMatch(/supports/i);
	});

	it("canonicalises a YouTube short link and reports it as not browser-downloadable", async () => {
		const calls = mockNetwork();
		const response = await request(createApp(config))
			.post("/api/inspect")
			.send({ url: "https://youtu.be/dQw4w9WgXcQ?si=tracking" });

		expect(response.status).toBe(200);
		expect(response.body.url).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
		expect(response.body.source).toBe("youtube");
		expect(response.body.title).toBe(YOUTUBE_METADATA.title);
		expect(response.body.verdict.downloadInBrowser).toBe(false);
		expect(response.body.deviceDownload).toBeNull();
		expect(calls.some((call) => call.includes("youtube.com/oembed"))).toBe(true);
	});

	it("keeps the link usable when metadata cannot be read", async () => {
		mockNetwork({ "youtube.com/oembed": () => new Response("nope", { status: 500 }) });
		const response = await request(createApp(config))
			.post("/api/inspect")
			.send({ url: "https://www.youtube.com/shorts/dQw4w9WgXcQ" });

		expect(response.status).toBe(200);
		expect(response.body.title).toBeNull();
		expect(response.body.metadataNote).toMatch(/could not be read/i);
	});

	it("follows a TikTok share link to its canonical form", async () => {
		mockNetwork({
			"vm.tiktok.com": () =>
				new Response(null, {
					status: 301,
					headers: { location: "https://www.tiktok.com/@creator/video/7312345678901234567" },
				}),
		});
		const response = await request(createApp(config))
			.post("/api/inspect")
			.send({ url: "https://vm.tiktok.com/ZMabc123/" });

		expect(response.status).toBe(200);
		expect(response.body.source).toBe("tiktok");
		expect(response.body.url).toBe("https://www.tiktok.com/@creator/video/7312345678901234567");
	});

	it("refuses a short link that redirects off-platform", async () => {
		mockNetwork({
			"vm.tiktok.com": () =>
				new Response(null, { status: 302, headers: { location: "https://evil.example.com/video" } }),
		});
		const response = await request(createApp(config))
			.post("/api/inspect")
			.send({ url: "https://vm.tiktok.com/ZMabc123/" });

		expect(response.status).toBe(400);
	});

	it("offers a direct media link for on-device saving, without fetching it", async () => {
		const calls = mockNetwork();
		const url = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?token=abc";
		const response = await request(createApp(config)).post("/api/inspect").send({ url });

		expect(response.status).toBe(200);
		expect(response.body.source).toBe("file");
		expect(response.body.verdict.downloadInBrowser).toBe(true);
		expect(response.body.deviceDownload).toEqual({ url, filename: "flower.mp4" });
		expect(calls).toHaveLength(0);
	});

	it("rate limits repeated lookups", async () => {
		mockNetwork();
		const app = createApp(config);
		let lastStatus = 0;
		for (let attempt = 0; attempt < 45; attempt += 1) {
			const response = await request(app)
				.post("/api/inspect")
				.send({ url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" });
			lastStatus = response.status;
			if (lastStatus === 429) break;
		}
		expect(lastStatus).toBe(429);
	});
});

describe("unknown routes", () => {
	it("answer with JSON, not HTML", async () => {
		mockNetwork();
		const response = await request(createApp(config)).get("/api/nope");
		expect(response.status).toBe(404);
		expect(response.body.error).toBeTruthy();
	});
});
