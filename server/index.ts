import { createApp } from "./app";
import { readConfig } from "./config";

const config = readConfig();
const server = createApp(config).listen(config.port, () => {
	console.log(`[flickgrab-api] listening on http://127.0.0.1:${config.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
	process.on(signal, () => {
		server.close(() => process.exit(0));
	});
}
