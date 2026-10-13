import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Tabs } from "./Tabs.vue";
export { default as TabsContent } from "./TabsContent.vue";
export { default as TabsIndicator } from "./TabsIndicator.vue";
export { default as TabsList } from "./TabsList.vue";
export { default as TabsTrigger } from "./TabsTrigger.vue";

// Horizontal lists are a full-width snap strip below `sm`: no wrap, hidden
// scrollbar (a bar under a tab list reads as a second underline) and a fade on
// the end edge (dir-aware, `to inline-end` is not accepted in mask-image yet).
// TabsList scrolls the active trigger into view. From `sm` up the list is the
// compact inline pill/line list. Everything strip-related is gated on
// `group-data-horizontal/tabs` so vertical lists render as before.
const strip = [
  "group-data-horizontal/tabs:flex group-data-horizontal/tabs:w-full group-data-horizontal/tabs:max-w-full",
  "group-data-horizontal/tabs:snap-x group-data-horizontal/tabs:snap-mandatory",
  "group-data-horizontal/tabs:overflow-x-auto group-data-horizontal/tabs:overflow-y-hidden",
  "group-data-horizontal/tabs:[scrollbar-width:none] group-data-horizontal/tabs:[&::-webkit-scrollbar]:hidden",
  "group-data-horizontal/tabs:max-sm:[mask-image:linear-gradient(to_right,black_calc(100%-16px),transparent)]",
  "group-data-horizontal/tabs:max-sm:rtl:[mask-image:linear-gradient(to_left,black_calc(100%-16px),transparent)]",
  "group-data-horizontal/tabs:sm:inline-flex group-data-horizontal/tabs:sm:w-auto group-data-horizontal/tabs:sm:snap-none",
].join(" ");

export const tabsListVariants = cva(
  `group/tabs-list relative inline-flex items-center text-muted-foreground group-data-horizontal/tabs:h-10 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col ${strip}`,
  {
    variants: {
      variant: {
        default: "gap-1 rounded-xl border border-border/60 bg-muted/50 p-1",
        line: "gap-1 border-b border-border group-data-horizontal/tabs:sm:w-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
export type TabsListVariants = VariantProps<typeof tabsListVariants>;
