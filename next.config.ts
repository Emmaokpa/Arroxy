import type { NextConfig } from "next";

/**
 * The browser only ever talks to its own origin. The UI's `/api/*` calls are
 * proxied to the Express API so the app needs no CORS setup, while the API can
 * still be called directly by future native clients.
 */
const API_ORIGIN = process.env.FLICKGRAB_API_ORIGIN ?? "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
	async rewrites() {
		return [{ source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` }];
	},
};

export default nextConfig;
