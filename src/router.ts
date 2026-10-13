import { watch } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import type { RouteLocationNormalized, RouteRecordRaw } from "vue-router";
import { i18n } from "@/lib/i18n";

declare module "vue-router" {
  interface RouteMeta {
    /** vue-i18n key for the page title (`nav.*`) — resolve with `t()`. */
    titleKey?: string;
  }
}

// The app surface is deliberately minimal — one blank page plus the 404.
// Real screens are added here as the product grows.
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/DashboardLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/pages/HomePage.vue"),
        meta: { titleKey: "nav.home" },
      },
    ],
  },
  {
    // Full-screen pages (404, login) render in BlankLayout, which owns the
    // standard top-end LocaleToggle · ThemeToggle corner cluster.
    path: "/:pathMatch(.*)*",
    component: () => import("@/layouts/BlankLayout.vue"),
    children: [
      {
        path: "",
        name: "not-found",
        component: () => import("@/pages/NotFoundPage.vue"),
        meta: { titleKey: "nav.notFound" },
      },
    ],
  },
];

// Living reference: the kit's demo/recipe pages (src/pages/reference/*), wired
// in src/pages/reference/routes.ts. The glob is empty when that folder is absent
// (projects installed from the registry without `@aamin/reference`). Registered
// ONLY in dev — `import.meta.env.DEV` is statically replaced at build time, so
// production builds tree-shake these routes and emit no chunks for them.
const referenceRoutes = import.meta.glob<RouteRecordRaw[]>("./pages/reference/routes.ts", {
  eager: true,
  import: "referenceRoutes",
});
if (import.meta.env.DEV) routes.unshift(...Object.values(referenceRoutes).flat());

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    // <main> inside DashboardLayout is the only scroll container — the
    // document itself never scrolls — so this only ever has a real target
    // for in-page hash anchors. Route-change reset happens in
    // DashboardLayout.vue instead (it can target the actual scroller).
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 80 };
  },
});

// Keep the browser tab/bookmark label in sync with the active route — and
// with the UI language, which can change without a navigation.
const t = i18n.global.t;

function syncTitle(to: RouteLocationNormalized) {
  document.title = to.meta.titleKey
    ? `${t(to.meta.titleKey)} — ${t("app.name")}`
    : `${t("app.name")} — ${t("app.title")}`;
}

router.afterEach(syncTitle);
watch(i18n.global.locale, () => syncTitle(router.currentRoute.value));
