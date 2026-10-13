import type { Component } from "vue";
import {
  ClipboardListIcon,
  FileTextIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LayoutListIcon,
  RulerIcon,
  SettingsIcon,
  ShapesIcon,
  Table2Icon,
  UserRoundIcon,
} from "@/lib/icons";
import { appGroups } from "./nav.app";

// KIT-OWNED: registry updates overwrite this file. The product's own sidebar
// groups live in ./nav.app.ts (project-owned).

/** `title`/`label` are i18n keys — render them with `t(item.title)`. */
export interface NavItem {
  /** i18n key, e.g. "nav.home". One key per destination (shared with route titles). */
  title: string;
  to: string;
  icon: Component;
  badge?: string;
}

export interface NavGroup {
  /** i18n key, e.g. "nav.groups.app". */
  label: string;
  items: NavItem[];
}

/**
 * The living reference (dev-only): the kit's demo/recipe pages under
 * src/pages/reference/. `import.meta.env.DEV` is statically replaced, so
 * production builds drop this group entirely — it never ships.
 * NOTE: the badge below is test-enforced to equal the number of
 * src/components/ui/* families (see rtl-conventions.spec.ts).
 */
const referenceGroup: NavGroup = {
  label: "nav.groups.reference",
  items: [
    {
      title: "nav.reference.components",
      to: "/reference/components",
      icon: ShapesIcon,
      badge: "43",
    },
    { title: "nav.reference.pageAnatomy", to: "/reference/page-anatomy", icon: RulerIcon },
    {
      title: "nav.reference.templateList",
      to: "/reference/templates/list",
      icon: LayoutListIcon,
    },
    {
      title: "nav.reference.templateDetail",
      to: "/reference/templates/detail",
      icon: FileTextIcon,
    },
    { title: "nav.reference.overview", to: "/reference/overview", icon: LayoutDashboardIcon },
    { title: "nav.reference.tables", to: "/reference/tables", icon: Table2Icon },
    { title: "nav.reference.forms", to: "/reference/forms", icon: ClipboardListIcon },
    { title: "nav.reference.profile", to: "/reference/profile", icon: UserRoundIcon },
    { title: "nav.reference.settings", to: "/reference/settings", icon: SettingsIcon },
    { title: "nav.reference.login", to: "/reference/login", icon: KeyRoundIcon },
  ],
};

// The reference pages ship with the optional `@aamin/reference` registry item;
// their links only show when its routes file is present (same glob as router.ts).
export const hasReference =
  Object.keys(import.meta.glob("../pages/reference/routes.ts")).length > 0;

/** Single source of truth for the sidebar and the command palette. */
export const navGroups: NavGroup[] = [
  ...appGroups,
  ...(import.meta.env.DEV && hasReference ? [referenceGroup] : []),
];
