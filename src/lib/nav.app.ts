// The product's navigation — PROJECT-OWNED (src/lib/nav.ts is kit-owned and
// overwritten by registry updates). Grows with the product: one group per area,
// one item per destination. `title`/`label` are i18n keys (project keys go in
// src/locales/<lang>/app.json). nav.ts feeds these groups to the sidebar AND
// the ⌘K palette.
import { HouseIcon } from "@/lib/icons";
import type { NavGroup } from "./nav";

export const appGroups: NavGroup[] = [
  {
    label: "nav.groups.app",
    items: [{ title: "nav.home", to: "/", icon: HouseIcon }],
  },
];
