// Runs after `shadcn-vue build ./registry.json -o registry/r`.
//
// 1. The CLI's install transform parses every file that is not .vue/.css/.md/.mdx/.txt
//    as TypeScript, so .json (and .html/.svg/dotfiles) sources crash `add`. Files whose
//    `path` ends in .md/.mdx/.txt are written verbatim — so each such file's `path` gets
//    a `.txt` suffix (its `target`, i.e. where it lands, is unchanged). Env files
//    (`.env*`) bypass the transform already and keep their path.
// 2. Asserts one built file per registry.json item (the CLI silently skips an item
//    that fails schema validation) and exits 1 otherwise.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const outDir = join(root, "registry/r");

/** Extensions the install transform handles (code) or writes raw (docs/text). */
const SAFE = /\.(vue|ts|tsx|js|jsx|mjs|cjs|css|md|mdx|txt)$/;
const isEnv = (p) => /^\.env(?:\.|$)/.test(basename(p));
const needsTxt = (p) => !SAFE.test(p) && !isEnv(p);

const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf-8"));
const expected = registry.items.map((i) => i.name).sort();
const built = readdirSync(outDir)
  .filter((f) => f.endsWith(".json") && f !== "registry.json")
  .map((f) => f.slice(0, -".json".length))
  .sort();

let renamed = 0;
for (const name of built) {
  const file = join(outDir, `${name}.json`);
  const item = JSON.parse(readFileSync(file, "utf-8"));
  for (const f of item.files ?? []) {
    if (typeof f.content !== "string") {
      console.error(`postbuild: ${name}: ${f.path} has no content`);
      process.exit(1);
    }
    if (needsTxt(f.path)) {
      f.path = `${f.path}.txt`;
      renamed++;
    }
  }
  writeFileSync(file, `${JSON.stringify(item, null, 2)}\n`);
}

const missing = expected.filter((n) => !built.includes(n));
const extra = built.filter((n) => !expected.includes(n));
if (missing.length || extra.length || built.length !== expected.length) {
  console.error(
    `postbuild: built ${built.length} item files, registry.json has ${expected.length} items` +
      (missing.length ? `\n  missing (invalid item?): ${missing.join(", ")}` : "") +
      (extra.length ? `\n  unexpected: ${extra.join(", ")}` : ""),
  );
  process.exit(1);
}
console.log(`postbuild: ${built.length} items OK, ${renamed} non-code paths → .txt`);
