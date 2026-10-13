/// <reference types="node" />
// Page anatomy standard: the copyable list/detail templates obey the
// page rules (one PageHeader, breadcrumbs, at most one glow-primary, no
// hardcoded Arabic), the anatomy page's measured table stays complete and in
// sync with docs/pages.md, and the reference routes/nav exist.
import { describe, it, expect, afterEach } from "vitest";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { router } from "@/router";
import { i18n } from "@/lib/i18n";
import { navGroups } from "@/lib/nav";
import PageHeader from "@/components/app/PageHeader.vue";
import ListPageTemplate from "@/pages/reference/templates/ListPageTemplate.vue";
import DetailPageTemplate from "@/pages/reference/templates/DetailPageTemplate.vue";
import PageAnatomyPage, { ANATOMY } from "@/pages/reference/PageAnatomyPage.vue";

// jsdom has no ResizeObserver; reka's tabs indicator and the overlay measure with it.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path: string) => readFileSync(join(rootDir, path), "utf8");

enableAutoUnmount(afterEach);

describe("page templates", () => {
  it("templates render one PageHeader, breadcrumbs and at most one glow-primary", () => {
    for (const Tpl of [ListPageTemplate, DetailPageTemplate]) {
      const w = mount(Tpl, { global: { plugins: [router, i18n] } });
      expect(w.findAllComponents(PageHeader)).toHaveLength(1);
      expect(w.find("nav[aria-label]").exists()).toBe(true);
      expect(w.findAll(".glow-primary").length).toBeLessThanOrEqual(1);
    }
  });

  it("templates contain no hardcoded Arabic", () => {
    for (const f of ["ListPageTemplate", "DetailPageTemplate"])
      expect(read(`src/pages/reference/templates/${f}.vue`)).not.toMatch(/[؀-ۿ]/);
  });

  it("every preview state keeps the one PageHeader and renders its state", async () => {
    const list = mount(ListPageTemplate, {
      props: { previewState: "error" },
      global: { plugins: [router, i18n] },
    });
    await flushPromises();
    expect(list.findAllComponents(PageHeader)).toHaveLength(1);
    expect(list.find('[data-testid="list-error"]').exists()).toBe(true);

    const loading = mount(ListPageTemplate, {
      props: { previewState: "loading" },
      global: { plugins: [router, i18n] },
    });
    expect(loading.find('[data-testid="list-loading"]').exists()).toBe(true);

    const empty = mount(ListPageTemplate, {
      props: { previewState: "empty" },
      global: { plugins: [router, i18n] },
    });
    await flushPromises();
    expect(empty.find('[data-testid="list-empty"]').exists()).toBe(true);

    const detail = mount(DetailPageTemplate, {
      props: { previewState: "loading" },
      global: { plugins: [router, i18n] },
    });
    expect(detail.find('[data-testid="detail-loading"]').exists()).toBe(true);
  });
});

describe("page anatomy", () => {
  it("every ANATOMY row carries classes and a value per reference width", () => {
    const rows = [...ANATOMY.type, ...ANATOMY.spacing];
    expect(rows.length).toBeGreaterThanOrEqual(15);
    for (const row of rows) {
      expect(row.classes, row.key).not.toBe("");
      expect(row.px).toHaveLength(3);
    }
  });

  it("docs/pages.md records every measured class value", () => {
    const doc = read("docs/pages.md");
    for (const row of [...ANATOMY.type, ...ANATOMY.spacing]) {
      expect(doc, `${row.key}: ${row.classes}`).toContain(row.classes);
    }
  });

  it("the measurements overlay labels digits in .num", async () => {
    const w = mount(PageAnatomyPage, { global: { plugins: [router, i18n] } });
    await flushPromises();
    expect(w.find('[data-testid="anatomy-overlay"]').exists()).toBe(false);
    await w.find('[data-testid="anatomy-toggle"]').trigger("click");
    await flushPromises();
    const overlay = w.find('[data-testid="anatomy-overlay"]');
    expect(overlay.exists()).toBe(true);
    const labels = overlay.findAll("[data-anatomy-label]");
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) expect(label.find(".num").exists()).toBe(true);
  });
});

describe("reference routes and nav", () => {
  it("registers the anatomy + template routes with title keys", () => {
    for (const path of [
      "/reference/page-anatomy",
      "/reference/templates/list",
      "/reference/templates/detail",
    ]) {
      const resolved = router.resolve(path);
      expect(resolved.name, path).not.toBe("not-found");
      expect(resolved.meta.titleKey, path).toMatch(/^nav\.reference\./);
    }
  });

  it("links them from the reference nav group with resolvable keys", () => {
    const items = navGroups.flatMap((g) => g.items);
    for (const to of [
      "/reference/page-anatomy",
      "/reference/templates/list",
      "/reference/templates/detail",
    ]) {
      const item = items.find((i) => i.to === to);
      expect(item, to).toBeDefined();
      expect(item!.badge).toBeUndefined();
      for (const locale of ["ar", "en"]) expect(i18n.global.te(item!.title, locale)).toBe(true);
    }
  });

  it("AGENTS.md links docs/pages.md from the task index", () => {
    expect(read("AGENTS.md")).toMatch(/A new page.*docs\/pages\.md/);
  });
});
