/// <reference types="node" />
// Docs drift guard: AGENTS.md is the always-loaded contract agents trust over
// reading source, so it must never silently fall behind the component set.
// Same philosophy as the nav count-badge test — adding a component without
// documenting it fails `npm run check`.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const testDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(testDir, "..", "..");
const agentsMd = readFileSync(join(rootDir, "AGENTS.md"), "utf-8");

const uiDir = join(rootDir, "src", "components", "ui");
const appDir = join(rootDir, "src", "components", "app");
const composablesDir = join(rootDir, "src", "composables");
const docsDir = join(rootDir, "docs");

describe("AGENTS.md inventory completeness", () => {
  it("mentions every ui/ component family", () => {
    const families = readdirSync(uiDir).filter((entry) =>
      statSync(join(uiDir, entry)).isDirectory(),
    );
    expect(families.length).toBeGreaterThan(0);
    const missing = families.filter((family) => !agentsMd.includes(family));
    expect(missing, `undocumented ui/ families: ${missing.join(", ")}`).toEqual([]);
  });

  it("mentions every app/ composite (components and the datatable module)", () => {
    const entries = readdirSync(appDir).filter((entry) => entry !== "showcase");
    const names = entries.map((entry) =>
      entry.endsWith(".vue") ? entry.replace(/\.vue$/, "") : entry,
    );
    expect(names.length).toBeGreaterThan(0);
    const missing = names.filter((name) => !agentsMd.includes(name));
    expect(missing, `undocumented app/ composites: ${missing.join(", ")}`).toEqual([]);
  });

  it("mentions every composable", () => {
    const composables = readdirSync(composablesDir).filter((entry) => entry.endsWith(".ts"));
    expect(composables.length).toBeGreaterThan(0);
    const missing = composables.filter((file) => !agentsMd.includes(file));
    expect(missing, `undocumented composables: ${missing.join(", ")}`).toEqual([]);
  });
});

describe("AGENTS.md ↔ docs/ link integrity", () => {
  const referenced = [...agentsMd.matchAll(/docs\/([\w-]+\.md)/g)].map((match) => match[1]);
  const uniqueReferenced = [...new Set(referenced)];
  const existing = readdirSync(docsDir).filter((entry) => entry.endsWith(".md"));

  it("references at least the core deep-dives", () => {
    expect(uniqueReferenced.length).toBeGreaterThanOrEqual(5);
  });

  it("every docs/ link in AGENTS.md points at a real file", () => {
    const dead = uniqueReferenced.filter((file) => !existsSync(join(docsDir, file)));
    expect(dead, `dead links in AGENTS.md: ${dead.join(", ")}`).toEqual([]);
  });

  it("every file in docs/ is reachable from AGENTS.md", () => {
    const orphaned = existing.filter((file) => !uniqueReferenced.includes(file));
    expect(orphaned, `docs files not linked from AGENTS.md: ${orphaned.join(", ")}`).toEqual([]);
  });
});
