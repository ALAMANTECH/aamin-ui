// HomePage's dev-only «reference» link must follow the same `hasReference` gate as
// the sidebar/⌘K group (src/lib/nav.ts): a project installed from the registry
// without `@aamin/reference` has no /reference/* routes, so the link would 404.
import { describe, it, expect, afterEach, vi } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { i18n } from "@/lib/i18n";

const nav = vi.hoisted(() => ({ hasReference: true }));
vi.mock("@/lib/nav", () => ({
  get hasReference() {
    return nav.hasReference;
  },
}));

import HomePage from "@/pages/HomePage.vue";

enableAutoUnmount(afterEach);

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/:any(.*)*", component: { template: "<div />" } }],
});
const referenceLink = () =>
  mount(HomePage, { global: { plugins: [router, i18n] } }).find('a[href="/reference/components"]');

describe("HomePage reference link", () => {
  it("shows in dev when the reference pages are installed", () => {
    nav.hasReference = true;
    expect(referenceLink().exists()).toBe(true);
  });

  it("is hidden when the reference pages are not installed", () => {
    nav.hasReference = false;
    expect(referenceLink().exists()).toBe(false);
  });
});
