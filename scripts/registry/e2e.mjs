// End-to-end install test: the @aamin registry installed into a fresh shadcn-vue
// Vite app with the exact consumer flow documented in docs/registry.md, served by a
// local server that behaves like public GitHub raw. Slow + needs network (npm, the
// vite template) — it is NOT part of `npm run check`. Run: `npm run registry:e2e`.
//
//   1. npm run registry:build
//   2. registry server on 127.0.0.1:<port> (default 4478): serves registry/ under
//      /ALAMANTECH/aamin-ui/main/registry/ with no auth (the repo is public). The
//      documented URLs point at raw.githubusercontent.com, so the server rewrites
//      that host to itself inside served `registries` config (the starter's
//      config.registries and registry/components.json) — nothing else is touched.
//   3. .registry-e2e/: CONSUMER_INIT (the documented `init --preset …starter.json`)
//      with npx --yes, the app named e2e-app and the raw host swapped for <base>
//   4. npm install · CONSUMER_SCRIPTS (`npm pkg set …`) · npm run build · npm run check
//   5. dev server boots on 4479 · starter assertions (no reference pages yet)
//   6. update workflow (commit → add --overwrite → clean diff)
//   7. add @aamin/reference -y · npm run build · npm run check · dev server serves
//      /reference/components · production build has no reference chunks
//   8. final assertions · summary
//
// AAMIN_REGISTRY_BASE (e2e only, never in consumer config) replaces the local server
// with another raw host, e.g. AAMIN_REGISTRY_BASE=https://raw.githubusercontent.com
// to run the same flow against the published registry.
//
// Flags: --skip-build (reuse registry/r), --keep (keep .registry-e2e on success;
// it is always kept on failure), --port=<n>. The server runs in this process
// (commands are spawned async), so it can never outlive the run.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { basename, dirname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistry, OUT_DIR, SHADCN_VUE_VERSION } from "./generate.mjs";
import { CONSUMER_INIT, CONSUMER_SCRIPTS, RAW_HOST } from "./consumer-scripts.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;

const RAW_PREFIX = `/ALAMANTECH/aamin-ui/main/${OUT_DIR}/`;
const FORBIDDEN_PORTS = new Set([3100, 3101]);
const DEV_PORT = 4479;
const CLI = `npx --yes shadcn-vue@${SHADCN_VUE_VERSION}`;
const workDir = join(root, ".registry-e2e");
const appDir = join(workDir, "e2e-app");

// ───────────────────────── helpers ─────────────────────────

const timings = [];
const results = [];
let failed = false;

async function step(name, fn) {
  const t0 = Date.now();
  console.log(`\n▶ ${name}`);
  try {
    const out = await fn();
    timings.push([name, Date.now() - t0]);
    return out;
  } catch (err) {
    timings.push([`${name} (FAILED)`, Date.now() - t0]);
    throw err;
  }
}

/** Kills a shell-spawned child and its whole process tree (npx → node → …). */
function killTree(child) {
  if (child.exitCode !== null) return;
  if (process.platform === "win32")
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  else child.kill("SIGKILL");
}

/**
 * Runs a shell command (cross-platform), echoing its output unless `echo: false`.
 * Resolves with the combined output; rejects on a non-zero exit or after
 * `timeoutMs` (a CLI waiting on a prompt it can never get an answer to).
 */
function run(command, { cwd = root, env = {}, echo = true, timeoutMs = 0 } = {}) {
  return new Promise((resolvePromise, reject) => {
    console.log(`  $ ${command}${cwd !== root ? `   (in ${cwd.slice(root.length + 1)})` : ""}`);
    const child = spawn(command, {
      cwd,
      shell: true,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    const sink = (stream) => (d) => {
      output += d;
      if (echo) stream.write(d);
    };
    child.stdout.on("data", sink(process.stdout));
    child.stderr.on("data", sink(process.stderr));
    let timedOut = false;
    const timer = timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          killTree(child);
        }, timeoutMs)
      : null;
    child.on("error", reject);
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      if (code === 0 && !timedOut) return resolvePromise(output);
      const why = timedOut ? `timed out after ${timeoutMs / 1000}s` : `exited ${code}`;
      reject(new Error(`"${command}" ${why}${echo ? "" : `\n${output}`}`));
    });
  });
}

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  if (!ok) failed = true;
  console.log(`  ${ok ? "✔" : "✘"} ${name}${!ok && detail ? `\n      ${detail}` : ""}`);
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((e) => {
    const abs = join(dir, e);
    return statSync(abs).isDirectory() ? walk(abs) : [abs];
  });
}

const lf = (s) => s.replace(/\r\n/g, "\n");

// ───────────────────────── server ─────────────────────────

let requests = 0;

/** Points served `registries` URLs (item config or components.json) at this server. */
function rewriteRegistries(body, host) {
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    return body;
  }
  const regs = json?.config?.registries ?? json?.registries;
  if (!regs) return body;
  for (const r of Object.values(regs)) r.url = r.url.split(RAW_HOST).join(host);
  return JSON.stringify(json, null, 2);
}

function startServer(preferred) {
  const servedDir = join(root, OUT_DIR);
  const server = createServer((req, res) => {
    requests++;
    const url = new URL(req.url, "http://localhost");
    const rel = decodeURIComponent(url.pathname);
    const file = normalize(join(servedDir, rel.slice(RAW_PREFIX.length)));
    if (!rel.startsWith(RAW_PREFIX) || !file.startsWith(servedDir + sep) || !existsSync(file)) {
      res.writeHead(404, { "content-type": "text/plain" });
      return res.end("404: Not Found");
    }
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end(
      rewriteRegistries(readFileSync(file, "utf-8"), `http://localhost:${server.address().port}`),
    );
  });
  return new Promise((resolvePromise, reject) => {
    const listen = (port) => {
      server.once("error", (err) => {
        if (err.code === "EADDRINUSE" && port !== 0) {
          console.log(`  port ${port} busy → picking a free one`);
          return listen(0);
        }
        reject(err);
      });
      server.listen(port, "127.0.0.1", () => {
        const actual = server.address().port;
        if (FORBIDDEN_PORTS.has(actual)) {
          server.close();
          return listen(0);
        }
        resolvePromise({ server, port: actual });
      });
    };
    listen(preferred);
  });
}

// ───────────────────────── dev server probe ─────────────────────────

/** Boots the consumer's vite dev server, checks it serves the app, then runs `extra(base)`. */
async function probeDevServer(extra) {
  const vite = join(appDir, "node_modules", "vite", "bin", "vite.js");
  const child = spawn(process.execPath, [vite, "--port", String(DEV_PORT), "--strictPort"], {
    cwd: appDir,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  const base = `http://localhost:${DEV_PORT}`;
  try {
    let index = "";
    for (let i = 0; i < 60 && !index; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (child.exitCode !== null) break;
      index = await fetch(`${base}/`)
        .then((r) => (r.ok ? r.text() : ""))
        .catch(() => "");
    }
    check("dev server boots and serves index.html", index.includes('id="app"'), log.slice(-800));
    if (!index) return;
    const main = await fetch(`${base}/src/main.ts`).then((r) => r.status);
    const app = await fetch(`${base}/src/App.vue`).then((r) => r.status);
    check(
      "dev server transforms src/main.ts and src/App.vue",
      main === 200 && app === 200,
      `${main} ${app}`,
    );
    if (extra) await extra(base);
  } finally {
    child.kill();
  }
}

// ───────────────────────── main ─────────────────────────

async function main() {
  const t0 = Date.now();
  if (!flag("skip-build")) await step("registry:build", () => run("npm run registry:build"));

  // AAMIN_REGISTRY_BASE: run against another raw host instead of the local server.
  const remote = process.env.AAMIN_REGISTRY_BASE?.replace(/\/+$/, "");
  const { server, port } = remote
    ? { server: null, port: 0 }
    : await step("registry server", () => startServer(Number(opt("port", 4478))));
  base = remote ?? `http://localhost:${port}`;
  console.log(`  serving ${base}${RAW_PREFIX} (public, no auth)`);
  const stop = () => {
    server?.closeAllConnections?.();
    server?.close();
  };
  process.on("exit", stop);

  try {
    await step("public path", async () => {
      const res = await fetch(`${base}${RAW_PREFIX}r/starter.json`);
      const body = await res.json().catch(() => null);
      check("starter.json without any auth → 200", res.status === 200, `${res.status}`);
      check(
        "served starter config points @aamin at this host, no headers",
        body?.config?.registries?.["@aamin"]?.url === `${base}${RAW_PREFIX}r/{name}.json` &&
          !body?.config?.registries?.["@aamin"]?.headers,
        JSON.stringify(body?.config?.registries),
      );
    });

    // The documented consumer command, with the raw host swapped for `base`.
    const init = CONSUMER_INIT.replace(/^npx /, "npx --yes ")
      .replace(" -n my-app ", " -n e2e-app ")
      .split(RAW_HOST)
      .join(base);
    if (init === CONSUMER_INIT || !init.includes(" -n e2e-app "))
      throw new Error(`unexpected CONSUMER_INIT shape: ${CONSUMER_INIT}`);
    const initLog = await step("init --preset starter (the documented flow)", async () => {
      rmSync(workDir, { recursive: true, force: true });
      mkdirSync(workDir, { recursive: true });
      return run(init, { cwd: workDir });
    });

    // CLI 2.7.4 runs an import resolver over every written file and parses it as
    // TypeScript; JSON/Markdown/HTML/dotfiles fail it with a logged warning but are
    // written unchanged (asserted below). Only non-code files may appear there.
    const warned = [...initLog.matchAll(/Failed to transform imports in (\S+?):/g)].map(
      (m) => m[1],
    );
    const codeWarned = warned.filter((f) => /\.(vue|[cm]?[jt]s|css)$/.test(f));
    check(
      `import-resolver warnings only for non-code files (${warned.length})`,
      codeWarned.length === 0,
      codeWarned.join(", "),
    );

    await step("npm install", () => run("npm install", { cwd: appDir }));
    await step("npm pkg set (consumer scripts)", () => run(CONSUMER_SCRIPTS, { cwd: appDir }));
    await step("consumer: npm run build", () => run("npm run build", { cwd: appDir }));
    await step("consumer: npm run check", () => run("npm run check", { cwd: appDir }));
    await step("consumer: dev server", () => probeDevServer());
    await step("starter assertions", starterAssertions);

    await step("update workflow (commit → add --overwrite → clean diff)", async () => {
      const git = (a) => run(`git ${a}`, { cwd: appDir, echo: false });
      const ignored = await git("check-ignore .env.local dist node_modules").catch(
        (e) => e.message,
      );
      check(
        "consumer .gitignore covers .env.local, dist, node_modules",
        ignored.split(/\r?\n/).filter(Boolean).length === 3,
        ignored,
      );
      // Safety: never commit anywhere but the throwaway consumer (a missing .git here
      // would make git walk up into the kit repo).
      const top = (await git("rev-parse --show-toplevel")).trim();
      if (resolve(top).toLowerCase() !== resolve(appDir).toLowerCase())
        throw new Error(`refusing to commit: git toplevel is ${top}, expected ${appDir}`);
      await git("add -A");
      await git('-c user.name=e2e -c user.email=e2e@example.invalid commit -q -m "e2e install"');
      await run(`${CLI} add @aamin/data-table --overwrite -y`, {
        cwd: appDir,
        echo: false,
      });
      const status = (await git("status --porcelain")).trim();
      check("re-adding an installed item leaves git clean", status === "", status);
    });

    await step("add @aamin/reference -y (no --overwrite)", async () => {
      const git = (a) => run(`git ${a}`, { cwd: appDir, echo: false });
      // Right after the starter every shared file is identical, so -y must not prompt;
      // a prompt would wait forever on the closed stdin → timeout = failure.
      await run(`${CLI} add @aamin/reference -y`, {
        cwd: appDir,
        echo: false,
        timeoutMs: 10 * 60_000,
      });
      check("reference pages installed", existsSync(join(appDir, "src/pages/reference/routes.ts")));
      const status = (await git("status --porcelain")).split(/\r?\n/).filter(Boolean);
      const rewritten = status.filter((l) => !l.startsWith("??"));
      check(
        "reference install only adds files (no installed file rewritten)",
        status.length > 0 && rewritten.length === 0,
        rewritten.join(", "),
      );
    });
    await step("consumer + reference: npm run build", () => run("npm run build", { cwd: appDir }));
    await step("consumer + reference: npm run check", () => run("npm run check", { cwd: appDir }));
    await step("consumer + reference: dev server serves /reference/components", () =>
      probeDevServer(async (base) => {
        const page = await fetch(`${base}/reference/components`).then((r) => r.text());
        check("dev server answers /reference/components with the app", page.includes('id="app"'));
        const router = await fetch(`${base}/src/router.ts`).then((r) => r.text());
        check(
          "dev router picks up src/pages/reference/routes.ts",
          router.includes("/src/pages/reference/routes.ts"),
        );
        const statuses = await Promise.all(
          ["/src/pages/reference/routes.ts", "/src/pages/reference/ComponentsPage.vue"].map((p) =>
            fetch(`${base}${p}`).then((r) => `${p} ${r.status}`),
          ),
        );
        check(
          "dev server transforms the reference routes + ComponentsPage",
          statuses.every((x) => x.endsWith(" 200")),
          statuses.join(", "),
        );
      }),
    );
    await step("production build has no reference chunks", referenceBuildAssertions);
    await step("final assertions", finalAssertions);
  } finally {
    stop();
    if (server) console.log(`\nregistry server stopped (${requests} requests)`);
  }

  console.log("\n── timings ──");
  for (const [name, ms] of timings)
    console.log(`  ${(ms / 1000).toFixed(1).padStart(7)}s  ${name}`);
  console.log(`  ${((Date.now() - t0) / 1000).toFixed(1).padStart(7)}s  total`);
}

let base = "";
const at = (p) => join(appDir, p);

function starterAssertions() {
  for (const p of [
    "src/components/ui/button/index.ts",
    "src/components/app/datatable/DataTable.vue",
    "src/lib/money.ts",
    "src/locales/ar/common.json",
    "src/locales/ar/app.json",
    "AGENTS.md",
    "docs/rtl.md",
    "tsconfig.app.json",
    "index.html",
    "public/favicon.svg",
  ])
    check(`${p} exists`, existsSync(at(p)));
  check("no reference pages installed", !existsSync(at("src/pages/reference")));

  const srcFiles = walk(at("src"));
  const artifacts = srcFiles.filter((f) => /rtl:rotate-180|ps-PL/.test(readFileSync(f, "utf-8")));
  check(
    "no rtl codemod artifacts under src (rtl:rotate-180, ps-PL)",
    artifacts.length === 0,
    artifacts.map((f) => f.slice(appDir.length + 1)).join(", "),
  );

  const cfg = JSON.parse(readFileSync(at("components.json"), "utf-8"));
  check("components.json keeps rtl:false", cfg.rtl === false, `rtl=${cfg.rtl}`);
  check(
    "components.json has the @aamin registry from the preset (URL only, no headers)",
    cfg.registries?.["@aamin"]?.url === `${base}${RAW_PREFIX}r/{name}.json` &&
      !cfg.registries?.["@aamin"]?.headers,
    JSON.stringify(cfg.registries),
  );

  // Every shipped starter file lands byte-for-byte (CRLF-normalized) as in the kit:
  // proves no transform rewrote imports/strings on the way in.
  const registry = buildRegistry({ root });
  const shipped = registry.items
    .filter((i) => i.name !== "reference")
    .flatMap((i) => i.files.map((f) => f.path));
  const changed = shipped.filter((p) => {
    if (!existsSync(at(p))) return true;
    return lf(readFileSync(at(p), "utf-8")) !== lf(readFileSync(join(root, p), "utf-8"));
  });
  check(
    `every shipped file (${shipped.length}) lands unchanged`,
    changed.length === 0,
    changed.slice(0, 20).join(", ") + (changed.length > 20 ? ` … +${changed.length - 20}` : ""),
  );

  const html = existsSync(at("dist/index.html"))
    ? readFileSync(at("dist/index.html"), "utf-8")
    : "";
  check(
    'built index.html is Arabic RTL (lang="ar" dir="rtl")',
    /<html[^>]*lang="ar"[^>]*dir="rtl"/.test(html),
  );
  const pkg = JSON.parse(readFileSync(at("package.json"), "utf-8"));
  check("consumer package.json has the check script", pkg.scripts?.check?.includes("typecheck"));
}

/** The production build (made with the reference installed) carries none of it. */
function referenceBuildAssertions() {
  const refModules = [
    ...walk(at("src/pages/reference")),
    ...walk(at("src/components/app/showcase")),
  ]
    .map((f) => basename(f).replace(/\.(vue|ts)$/, ""))
    .filter(Boolean);
  const assets = existsSync(at("dist/assets")) ? readdirSync(at("dist/assets")) : [];
  const refChunks = assets.filter((a) => refModules.some((n) => a.startsWith(`${n}-`)));
  check(
    `production build emits no reference chunks (${refModules.length} reference modules)`,
    refModules.length > 5 && assets.length > 0 && refChunks.length === 0,
    refChunks.join(", "),
  );
  const leaking = assets
    .filter((a) => a.endsWith(".js"))
    .filter((a) =>
      readFileSync(at(`dist/assets/${a}`), "utf-8").includes("reference/page-anatomy"),
    );
  check(
    "production JS carries no reference routes or nav",
    leaking.length === 0,
    leaking.join(", "),
  );
}

function finalAssertions() {
  // Reference files land byte-identical too, and the codemod guard still holds.
  const registry = buildRegistry({ root });
  const ref = registry.items.find((i) => i.name === "reference").files.map((f) => f.path);
  const changed = ref.filter(
    (p) =>
      !existsSync(at(p)) ||
      lf(readFileSync(at(p), "utf-8")) !== lf(readFileSync(join(root, p), "utf-8")),
  );
  check(
    `every reference file (${ref.length}) lands unchanged`,
    changed.length === 0,
    changed.join(", "),
  );
  // The reference pages use `rtl:rotate-180` on purpose (AGENTS rule 3 allows an
  // rtl: variant), so only occurrences the kit's own copy lacks count as codemod output.
  const count = (s) => (s.match(/rtl:rotate-180|ps-PL/g) ?? []).length;
  const artifacts = walk(at("src")).filter((f) => {
    const kit = join(root, f.slice(appDir.length + 1));
    const kitCount = existsSync(kit) ? count(readFileSync(kit, "utf-8")) : 0;
    return count(readFileSync(f, "utf-8")) > kitCount;
  });
  check(
    "still no rtl codemod artifacts under src (beyond the kit's own rtl: variants)",
    artifacts.length === 0,
    artifacts.map((f) => f.slice(appDir.length + 1)).join(", "),
  );
}

main()
  .catch((err) => {
    failed = true;
    console.error(`\n✘ ${err.message}`);
  })
  .finally(() => {
    const passed = results.filter((r) => r.ok).length;
    console.log(
      `\n── e2e: ${failed ? "FAILED" : "PASSED"} (${passed}/${results.length} checks) ──`,
    );
    if (!failed && !flag("keep")) rmSync(workDir, { recursive: true, force: true });
    else console.log(`consumer kept at ${appDir}`);
    process.exitCode = failed ? 1 : 0;
  });
