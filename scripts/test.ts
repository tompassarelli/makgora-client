// The Rust suite from a clean checkout: builds ui/kit and ui/dist, which the
// Rust app embeds and its tests compile against, then runs cargo test in shell.nix.
//   bun scripts/test.ts [cargo test args]
import { $ } from "bun";
import { join } from "node:path";

const client = new URL("..", import.meta.url).pathname;
const ui = join(client, "ui");
await $`bun scripts/kit.ts`.cwd(client);
await $`bun install --frozen-lockfile`.cwd(ui);
await $`bun run build`.cwd(ui);
const args = process.argv.length > 2 ? process.argv.slice(2) : ["--jobs", "2"];
const quoted = ["cargo", "test", ...args].map((word) => `'${word.replaceAll("'", "'\\''")}'`).join(" ");
const inShell = process.env.IN_NIX_SHELL !== undefined || Bun.which("nix-shell") === null;
const command = inShell ? ["sh", "-c", quoted] : ["nix-shell", join(client, "shell.nix"), "--run", quoted];
const run = Bun.spawnSync(command, { cwd: join(client, "src-tauri"), stdout: "inherit", stderr: "inherit" });
process.exit(run.exitCode ?? 1);
