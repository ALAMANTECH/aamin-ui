import type { RouteRecordRaw } from "vue-router";

// Living reference: the kit's demo/recipe pages (src/pages/reference/*).
// src/router.ts picks this file up through an import.meta.glob and registers it
// ONLY in dev — `import.meta.env.DEV` is statically replaced at build time, so
// production builds tree-shake these routes and emit no chunks for them. The
// file ships with the optional `@aamin/reference` registry item; without it the
// glob is simply empty. Copy patterns from these pages into real screens; see
// docs/new-project.md.
export const referenceRoutes: RouteRecordRaw[] = [
  {
    path: "/reference/login",
    component: () => import("@/layouts/BlankLayout.vue"),
    children: [
      {
        path: "",
        name: "reference-login",
        component: () => import("@/pages/reference/LoginPage.vue"),
        meta: { titleKey: "nav.reference.login" },
      },
    ],
  },
  {
    path: "/reference",
    component: () => import("@/layouts/DashboardLayout.vue"),
    redirect: "/reference/components",
    children: [
      {
        path: "overview",
        name: "reference-overview",
        component: () => import("@/pages/reference/OverviewPage.vue"),
        meta: { titleKey: "nav.reference.overview" },
      },
      {
        path: "tables",
        name: "reference-tables",
        component: () => import("@/pages/reference/TablesPage.vue"),
        meta: { titleKey: "nav.reference.tables" },
      },
      {
        path: "forms",
        name: "reference-forms",
        component: () => import("@/pages/reference/FormsPage.vue"),
        meta: { titleKey: "nav.reference.forms" },
      },
      {
        path: "profile",
        name: "reference-profile",
        component: () => import("@/pages/reference/ProfilePage.vue"),
        meta: { titleKey: "nav.reference.profile" },
      },
      {
        path: "settings",
        name: "reference-settings",
        component: () => import("@/pages/reference/SettingsPage.vue"),
        meta: { titleKey: "nav.reference.settings" },
      },
      {
        path: "page-anatomy",
        name: "reference-page-anatomy",
        component: () => import("@/pages/reference/PageAnatomyPage.vue"),
        meta: { titleKey: "nav.reference.pageAnatomy" },
      },
      {
        path: "templates/list",
        name: "reference-template-list",
        component: () => import("@/pages/reference/templates/ListPageTemplate.vue"),
        meta: { titleKey: "nav.reference.templateList" },
      },
      {
        path: "templates/detail",
        name: "reference-template-detail",
        component: () => import("@/pages/reference/templates/DetailPageTemplate.vue"),
        meta: { titleKey: "nav.reference.templateDetail" },
      },
      {
        path: "components",
        name: "reference-components",
        component: () => import("@/pages/reference/ComponentsPage.vue"),
        meta: { titleKey: "nav.reference.components" },
      },
    ],
  },
];
