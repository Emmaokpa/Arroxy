import { spawn } from "node:child_process";

/**
 * Runs the web app and the API together, because `npm run dev` should not
 * require two terminals. Each child owns its own stdout so output stays legible.
 */
const mode = process.argv[2] === "start" ? "start" : "dev";

const tasks = mode === "start"
	? [
			{ name: "web", command: "npm", args: ["run", "start:web"] },
			{ name: "api", command: "npm", args: ["run", "start:api"] },
		]
	: [
			{ name: "web", command: "npm", args: ["run", "dev:web"] },
			{ name: "api", command: "npm", args: ["run", "dev:api"] },
		];

const useShell = process.platform === "win32";
const children = [];
let shuttingDown = false;

for (const task of tasks) {
	const child = spawn(task.command, task.args, {
		stdio: ["ignore", "pipe", "pipe"],
		shell: useShell,
		env: process.env,
	});
	children.push(child);

	const prefix = `[${task.name}] `;
	const forward = (chunk, stream) => {
		for (const line of chunk.toString().split(/\r?\n/)) {
			if (line.trim()) stream.write(`${prefix}${line}\n`);
		}
	};
	child.stdout.on("data", (chunk) => forward(chunk, process.stdout));
	child.stderr.on("data", (chunk) => forward(chunk, process.stderr));
	child.on("exit", (code) => {
		if (shuttingDown) return;
		console.error(`${prefix}exited with code ${code ?? "unknown"}; stopping the other process.`);
		shutdown(code ?? 1);
	});
}

function shutdown(code) {
	if (shuttingDown) return;
	shuttingDown = true;
	for (const child of children) {
		if (!child.pid) continue;
		if (process.platform === "win32") {
			spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
		} else {
			child.kill("SIGTERM");
		}
	}
	setTimeout(() => process.exit(code), 300);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
	process.on(signal, () => shutdown(0));
}
