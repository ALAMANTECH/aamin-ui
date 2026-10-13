// Generates the @aamin shadcn-vue registry (registry.json at the repo root) and the
// consumer bootstrap config (registry/components.json) from the source tree.
//
//   node scripts/registry/generate.mjs     → writes registry.json + registry/components.json,
//                                            clears registry/r (rebuilt by `shadcn-vue build`)
//
// Output lives in registry/, NOT public/: Vite copies publicDir into every kit build.
//
// `buildRegistry({ root })` is pure (reads files, writes nothing) — the registry spec
// imports it for the drift guard. Item layout + overrides: ./items.config.mjs.
//
// Dependency detection (per file, unioned per item):
//   - static/dynamic imports and re-exports: `@/…` and relative paths resolve to a
//     source file → the item that owns it (`@aamin/<item>`); bare specifiers →
//     npm package (`@scope/name` or first segment; `node:`/builtins ignored) with the
//     kit package.json range (dependencies vs devDependencies kept apart).
//   - i18n namespaces: t("ns.…"), te(…), $t(…), tm(…) (incl. i18n.global.t), and
//     <i18n-t keypath="ns.…">, plus any other string literal "ns.key" whose `ns` is a
//     kit locale namespace (nav.ts titles, router titleKey, ternaries inside t()) →
//     `@aamin/locale-<ns>`. Template literals (`status.${code}`) give the namespace
//     but no key — they are reported as dynamic keys. The `app` namespace is
//     starter-only and adds no dependency.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { builtinModules } from "node:module";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as cfg from "./items.config.mjs";

export const REGISTRY_NAMESPACE = "@aamin";
export const REGISTRY_URL =
  "https://raw.githubusercontent.com/ALAMANTECH/aamin-ui/main/registry/r/{name}.json";
export const SHADCN_VUE_VERSION = "2.7.4";
/** Repo-relative output dir: components.json + r/<item>.json (served raw from GitHub). */
export const OUT_DIR = "registry";

const LOCALES_DIR = "src/locales";

// ───────────────────────── helpers ─────────────────────────

/** "DataTable" → "data-table", "useAsyncJob" → "use-async-job", "notFound" → "not-found". */
export const kebab = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();

const read = (root, rel) => readFileSync(join(root, rel), "utf-8");
const isFile = (root, rel) => existsSync(join(root, rel)) && statSync(join(root, rel)).isFile();
const isDir = (root, rel) => existsSync(join(root, rel)) && statSync(join(root, rel)).isDirectory();

/** Repo-relative posix paths of every file under `dir`, sorted. */
function walk(root, dir) {
  if (!isDir(root, dir)) return [];
  return readdirSync(join(root, dir))
    .sort()
    .flatMap((entry) => {
      const rel = `${dir}/${entry}`;
      return isDir(root, rel) ? walk(root, rel) : [rel];
    });
}

const byPath = (a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
const dep = (name) => `${REGISTRY_NAMESPACE}/${name}`;

// ───────────────────────── scanners ─────────────────────────

const IMPORT_RE =
  /(?<![\w$.])(?:import|export)\s+(?:type\s+)?(?:[\w$*{},\s]+?\s+from\s+)?["']([^"'\n]+)["']/g;
const DYNAMIC_IMPORT_RE = /(?<![\w$.])import\(\s*["']([^"'\n]+)["']\s*\)/g;

/** Module specifiers a source file imports or re-exports (static + dynamic). */
export function scanImports(source) {
  const out = new Set();
  for (const re of [IMPORT_RE, DYNAMIC_IMPORT_RE])
    for (const m of source.matchAll(re)) out.add(m[1]);
  return [...out];
}

const CALL_RE = /(?<![\w$])(?:\$t|t|te|tm)\(\s*(?:"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`)/g;
const KEYPATH_RE = /\bkeypath=(?:"'?([^"'\s]+)'?"|'([^'\s]+)')/g;
const KEY_LITERAL_RE = /(["'])([A-Za-z_]\w*(?:\.[\w-]+)+)\1/g;
const TEMPLATE_LITERAL_RE = /`([^`]*)`/g;
const STATIC_KEY = /^[A-Za-z_]\w*(?:\.[\w-]+)+$/;

/**
 * i18n keys a source file uses. `namespaces` = known kit namespaces referenced (static
 * or as the static prefix of a template literal); `keys` = complete static keys;
 * `dynamic` = template-literal keys (skipped by the used-keys guard).
 */
export function scanI18n(source, knownNamespaces) {
  const keys = new Set();
  const namespaces = new Set();
  const dynamic = new Set();
  const nsOf = (key) => key.split(".")[0];

  const addStatic = (key, fromCall) => {
    if (!STATIC_KEY.test(key)) return;
    if (!fromCall && !knownNamespaces.has(nsOf(key))) return;
    keys.add(key);
    if (knownNamespaces.has(nsOf(key))) namespaces.add(nsOf(key));
  };
  const addTemplate = (body, fromCall) => {
    if (!body.includes("${")) return addStatic(body, fromCall);
    const m = /^([A-Za-z_]\w*)\./.exec(body);
    if (m && knownNamespaces.has(m[1])) namespaces.add(m[1]);
    else if (!fromCall) return;
    dynamic.add(body);
  };

  for (const m of source.matchAll(CALL_RE)) {
    if (m[3] !== undefined) addTemplate(m[3], true);
    else addStatic(m[1] ?? m[2], true);
  }
  for (const m of source.matchAll(KEYPATH_RE)) addStatic(m[1] ?? m[2], true);
  for (const m of source.matchAll(KEY_LITERAL_RE)) addStatic(m[2], false);
  for (const m of source.matchAll(TEMPLATE_LITERAL_RE)) addTemplate(m[1], false);

  return { keys: [...keys], namespaces: [...namespaces], dynamic: [...dynamic] };
}

const packageName = (spec) =>
  spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
const isBuiltin = (spec) => spec.startsWith("node:") || builtinModules.includes(packageName(spec));
const isLocal = (spec) => spec.startsWith("@/") || spec.startsWith(".");

/** Resolves `@/…` or a relative specifier to a repo-relative file. Throws if missing. */
function resolveLocal(root, fromFile, spec) {
  const base = spec.startsWith("@/")
    ? `src/${spec.slice(2)}`
    : posix.normalize(posix.join(posix.dirname(fromFile), spec));
  const candidates = [base, `${base}.ts`, `${base}.vue`, `${base}.js`, `${base}/index.ts`];
  const hit = candidates.find((c) => isFile(root, c));
  if (!hit) throw new Error(`registry: ${fromFile} imports "${spec}", which does not resolve`);
  return hit;
}

// ───────────────────────── locales ─────────────────────────

function localeLayout(root) {
  const langs = readdirSync(join(root, LOCALES_DIR))
    .filter((e) => isDir(root, `${LOCALES_DIR}/${e}`))
    .sort();
  const all = new Set();
  for (const lang of langs)
    for (const f of readdirSync(join(root, LOCALES_DIR, lang)))
      if (f.endsWith(".json")) all.add(f.slice(0, -".json".length));
  const namespaces = [...all].filter((ns) => !cfg.starterOnlyNamespaces.includes(ns)).sort();
  return { langs, namespaces };
}

const localeFiles = (root, langs, ns) =>
  langs.map((lang) => `${LOCALES_DIR}/${lang}/${ns}.json`).filter((p) => isFile(root, p));

/** Every non-test source file under src (for the used-keys guard). */
function sourceFiles(root) {
  return walk(root, "src").filter((f) => /\.(vue|ts)$/.test(f) && !cfg.isExcluded(f));
}

/**
 * Static i18n keys used across src (key → files) plus the dynamic template-literal
 * keys the scanner skips. Backs the "every used key resolves" test.
 */
export function collectI18nUsage({ root }) {
  // Bare literals count only for kit namespaces; t("app.…") calls are still collected.
  const known = new Set(localeLayout(root).namespaces);
  const keys = new Map();
  const dynamic = [];
  for (const file of sourceFiles(root)) {
    const scan = scanI18n(read(root, file), known);
    for (const k of scan.keys) keys.set(k, [...(keys.get(k) ?? []), file]);
    for (const expr of scan.dynamic) dynamic.push({ file, expr });
  }
  return { keys, dynamic };
}

// ───────────────────────── items ─────────────────────────

const underAny = (path, prefixes) =>
  prefixes.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p));

function fileEntry(path, type) {
  return type === "registry:ui" ? { path, type } : { path, type, target: `~/${path}` };
}

/** Item skeletons (name, type, files) before dependency detection. */
function skeletons(root) {
  const { langs, namespaces } = localeLayout(root);
  const groupPaths = Object.values(cfg.compositeGroups).flat();
  const shellFiles = cfg.shell.files;
  const claimed = (p) =>
    underAny(p, groupPaths) || shellFiles.includes(p) || underAny(p, cfg.reference.paths);
  const items = [];

  // ui families
  for (const family of readdirSync(join(root, "src/components/ui")).sort()) {
    const dir = `src/components/ui/${family}`;
    if (!isDir(root, dir)) continue;
    items.push({
      name: family,
      type: "registry:ui",
      files: walk(root, dir)
        .filter((p) => !cfg.isExcluded(p))
        .map((p) => fileEntry(p, "registry:ui")),
    });
  }

  // app composites: configured groups, then one item per remaining file/folder
  const composites = new Map();
  for (const [name, paths] of Object.entries(cfg.compositeGroups))
    composites.set(
      name,
      paths.flatMap((p) => (p.endsWith("/") ? walk(root, p.slice(0, -1)) : [p])),
    );
  for (const entry of readdirSync(join(root, "src/components/app")).sort()) {
    const rel = `src/components/app/${entry}`;
    const files = isDir(root, rel) ? walk(root, rel) : [rel];
    const unclaimed = files.filter((p) => !claimed(p) && !cfg.isExcluded(p));
    if (!unclaimed.length) continue;
    const name = kebab(entry.replace(/\.(vue|ts)$/, ""));
    composites.set(name, [...(composites.get(name) ?? []), ...unclaimed]);
  }
  for (const [name, files] of composites)
    items.push({
      name,
      type: "registry:component",
      files: files.filter((p) => !cfg.isExcluded(p)).map((p) => fileEntry(p, "registry:component")),
    });

  // shell
  items.push({
    name: cfg.shell.name,
    type: "registry:component",
    title: cfg.shell.title,
    description: cfg.shell.description,
    files: shellFiles.map((p) =>
      fileEntry(p, p.startsWith("src/pages/") ? "registry:file" : "registry:component"),
    ),
  });

  // lib + composables
  for (const f of walk(root, "src/lib").filter(
    (p) => p.endsWith(".ts") && !cfg.isExcluded(p) && !cfg.projectModules.includes(p),
  ))
    items.push({
      name: `lib-${kebab(posix.basename(f, ".ts"))}`,
      type: "registry:lib",
      files: [fileEntry(f, "registry:lib")],
    });
  for (const f of walk(root, "src/composables").filter(
    (p) => p.endsWith(".ts") && !cfg.isExcluded(p),
  ))
    items.push({
      name: kebab(posix.basename(f, ".ts")),
      type: "registry:composable",
      files: [fileEntry(f, "registry:composable")],
    });

  // locale namespaces (reference-only ones are moved later)
  for (const ns of namespaces)
    items.push({
      name: `locale-${kebab(ns)}`,
      type: "registry:file",
      namespace: ns,
      files: localeFiles(root, langs, ns).map((p) => fileEntry(p, "registry:file")),
    });

  // agents docs
  items.push({
    name: cfg.agentsDocs.name,
    type: "registry:file",
    title: cfg.agentsDocs.title,
    description: cfg.agentsDocs.description,
    files: [
      ...cfg.agentsDocs.files,
      ...readdirSync(join(root, cfg.agentsDocs.docsDir))
        .filter((f) => f.endsWith(".md"))
        .sort()
        .map((f) => `${cfg.agentsDocs.docsDir}/${f}`),
    ].map((p) => fileEntry(p, "registry:file")),
  });

  // reference
  items.push({
    name: cfg.reference.name,
    type: "registry:file",
    title: cfg.reference.title,
    description: cfg.reference.description,
    files: cfg.reference.paths
      .flatMap((p) => walk(root, p.slice(0, -1)))
      .filter((p) => !cfg.isExcluded(p))
      .map((p) => fileEntry(p, "registry:file")),
  });

  // starter
  items.push({
    name: cfg.starter.name,
    type: "registry:base",
    title: cfg.starter.title,
    description: cfg.starter.description,
    files: [
      ...cfg.starter.files,
      ...cfg.projectModules,
      ...cfg.starterOnlyNamespaces.flatMap((ns) => localeFiles(root, langs, ns)),
    ].map((p) => fileEntry(p, "registry:file")),
  });

  // extra files on derived items
  for (const [name, paths] of Object.entries(cfg.extraFiles)) {
    const it = items.find((i) => i.name === name);
    if (!it) throw new Error(`registry: extraFiles targets unknown item ${name}`);
    const type = it.files[0]?.type ?? "registry:file";
    it.files.push(...paths.map((p) => fileEntry(p, type)));
  }

  for (const it of items) {
    if (!it.files.length) throw new Error(`registry: item ${it.name} has no files`);
    for (const f of it.files)
      if (!isFile(root, f.path)) throw new Error(`registry: ${it.name} lists missing ${f.path}`);
  }
  const names = items.map((i) => i.name);
  const dupe = names.find((n, i) => names.indexOf(n) !== i);
  if (dupe) throw new Error(`registry: duplicate item name ${dupe}`);
  return items;
}

/** Kit components.json → the consumer config (rtl off, font "", @aamin registry). */
export function buildConsumerConfig({ root }) {
  const kit = JSON.parse(read(root, "components.json"));
  return {
    $schema: kit.$schema,
    ...starterConfig(kit),
  };
}

function starterConfig(kit) {
  const rest = { ...kit };
  delete rest.$schema;
  delete rest.registries;
  return {
    ...rest,
    font: "",
    iconLibrary: "lucide",
    // The CLI's rtl codemod rewrites string literals broadly; the kit is already
    // logical-utility-only, so consumers keep it off (the kit itself keeps rtl:true).
    rtl: false,
    // Public repo: plain raw URLs, no auth header.
    registries: { [REGISTRY_NAMESPACE]: { url: REGISTRY_URL } },
  };
}

/** The registry object written to registry.json. Pure: reads the tree, writes nothing. */
export function buildRegistry({ root }) {
  const pkg = JSON.parse(read(root, "package.json"));
  const kit = JSON.parse(read(root, "components.json"));
  const { namespaces } = localeLayout(root);
  const known = new Set(namespaces);
  const items = skeletons(root);

  const owner = new Map();
  for (const it of items) for (const f of it.files) owner.set(f.path, it.name);

  // pass 1: scan every item's files
  const scans = new Map();
  for (const it of items) {
    const local = new Set();
    const packages = new Set();
    const usedNs = new Set();
    for (const f of it.files) {
      if (!/\.(vue|ts)$/.test(f.path)) continue;
      const source = read(root, f.path);
      for (const spec of scanImports(source)) {
        if (isLocal(spec)) {
          const target = resolveLocal(root, f.path, spec);
          const o = owner.get(target);
          if (!o) throw new Error(`registry: ${f.path} imports unshipped ${target}`);
          // project-owned modules ship with the starter only: no dependency
          if (cfg.projectModules.includes(target)) continue;
          if (o !== it.name) local.add(o);
        } else if (!isBuiltin(spec)) packages.add(packageName(spec));
      }
      for (const ns of scanI18n(source, known).namespaces) usedNs.add(ns);
    }
    scans.set(it.name, { local, packages, usedNs });
  }

  // namespaces used only by the reference pages ship with the reference item
  const nsUsers = new Map(namespaces.map((ns) => [ns, new Set()]));
  for (const [name, scan] of scans) for (const ns of scan.usedNs) nsUsers.get(ns).add(name);
  const referenceOnly = new Set(
    namespaces.filter((ns) => {
      const users = [...nsUsers.get(ns)];
      return users.length > 0 && users.every((u) => u === cfg.reference.name);
    }),
  );
  const reference = items.find((i) => i.name === cfg.reference.name);
  const nsItem = new Map();
  for (const it of items.filter((i) => i.namespace)) {
    if (referenceOnly.has(it.namespace)) {
      reference.files.push(...it.files);
      it.drop = true;
    } else nsItem.set(it.namespace, it.name);
  }
  const kept = items.filter((i) => !i.drop);

  const range = (name) => pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];
  const out = kept.map((it) => {
    const scan = scans.get(it.name);
    const registryDeps = new Set(scan.local);
    for (const ns of scan.usedNs) if (nsItem.has(ns)) registryDeps.add(nsItem.get(ns));
    registryDeps.delete(it.name);
    for (const d of registryDeps) {
      if (d === cfg.starter.name && it.name !== cfg.starter.name)
        throw new Error(`registry: ${it.name} depends on a starter-owned file`);
      if (d === cfg.reference.name)
        throw new Error(`registry: ${it.name} depends on the reference pages`);
    }
    const deps = [];
    const devDeps = [];
    for (const p of [...scan.packages].sort()) {
      if (!range(p)) throw new Error(`registry: ${it.name} imports ${p}, not in package.json`);
      (pkg.dependencies?.[p] ? deps : devDeps).push(`${p}@${range(p)}`);
    }

    const item = { name: it.name, type: it.type };
    if (it.title) item.title = it.title;
    if (it.description) item.description = it.description;

    if (it.name === cfg.starter.name) {
      item.extends = "none";
      item.config = starterConfig(kit);
      item.dependencies = Object.entries(pkg.dependencies).map(([n, r]) => `${n}@${r}`);
      item.devDependencies = Object.entries(pkg.devDependencies).map(([n, r]) => `${n}@${r}`);
      item.registryDependencies = kept
        .map((i) => i.name)
        .filter((n) => n !== cfg.starter.name && n !== cfg.reference.name)
        .map(dep);
    } else {
      if (deps.length) item.dependencies = deps;
      if (devDeps.length) item.devDependencies = devDeps;
      if (registryDeps.size) item.registryDependencies = [...registryDeps].sort().map(dep);
    }
    item.files = [...it.files].sort(byPath);
    return item;
  });

  return {
    $schema: "https://shadcn-vue.com/schema/registry.json",
    name: "aamin",
    homepage: "https://github.com/ALAMANTECH/aamin-ui",
    items: out,
  };
}

// ───────────────────────── CLI ─────────────────────────

const json = (data) => `${JSON.stringify(data, null, 2)}\n`;

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const registry = buildRegistry({ root });
  writeFileSync(join(root, "registry.json"), json(registry));
  mkdirSync(join(root, OUT_DIR), { recursive: true });
  writeFileSync(join(root, OUT_DIR, "components.json"), json(buildConsumerConfig({ root })));
  // Stale item files from an earlier build would mask a skipped item.
  rmSync(join(root, OUT_DIR, "r"), { recursive: true, force: true });
  console.log(`registry: ${registry.items.length} items → registry.json`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
