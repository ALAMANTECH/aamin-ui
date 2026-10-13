<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { ShieldCheckIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navGroups } from "@/lib/nav";
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

defineProps<{
  /** Icon-rail mode (desktop collapse). */
  collapsed?: boolean;
}>();

const route = useRoute();

// A link is active only when its `to` is the LONGEST nav path matching the
// current route — otherwise "/reference" and "/reference/components" would
// both light up. Detail routes ("/tables/123") still fall back to their parent
// list link, and matching is segment-aware so "/tables" never matches "/tablesx".
const activeTo = computed(() => {
  const path = route.path;
  let best = "";
  for (const group of navGroups) {
    for (const item of group.items) {
      const matches =
        item.to === "/" ? path === "/" : path === item.to || path.startsWith(item.to + "/");
      if (matches && item.to.length > best.length) best = item.to;
    }
  }
  return best;
});

const isActive = (to: string) => to === activeTo.value;
</script>

<template>
  <div class="flex h-full flex-col bg-sidebar text-sidebar-foreground">
    <!-- Wordmark -->
    <div
      class="flex h-16 shrink-0 items-center gap-2.5 px-5"
      :class="{ 'justify-center px-0': collapsed }"
    >
      <span
        class="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary glow-primary"
      >
        <ShieldCheckIcon class="size-4.5" />
      </span>
      <div v-if="!collapsed" class="leading-tight">
        <p class="text-sm font-semibold text-sidebar-accent-foreground">{{ t("app.name") }}</p>
        <p class="text-[11px] text-muted-foreground">{{ t("app.title") }}</p>
      </div>
    </div>

    <!-- Nav -->
    <ScrollArea class="min-h-0 flex-1 px-3">
      <nav :aria-label="t('sidebar.mainNavAria')" class="flex flex-col gap-5 pb-6 pt-2">
        <div v-for="group in navGroups" :key="group.label">
          <p
            v-if="!collapsed"
            class="mb-1.5 px-3 text-[11px] font-semibold text-muted-foreground/70"
          >
            {{ t(group.label) }}
          </p>
          <ul class="flex flex-col gap-0.5">
            <li v-for="item in group.items" :key="item.to">
              <RouterLink
                :to="item.to"
                class="group relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium transition-colors"
                :class="[
                  isActive(item.to)
                    ? 'bg-primary/10 text-primary dark:bg-primary/15'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                  collapsed && 'justify-center px-0',
                ]"
                :aria-current="isActive(item.to) ? 'page' : undefined"
                :title="collapsed ? t(item.title) : undefined"
              >
                <!-- Glowing active indicator on the start edge -->
                <span
                  v-if="isActive(item.to)"
                  class="absolute inset-y-2 start-0 w-0.5 rounded-full bg-primary glow-primary"
                  aria-hidden="true"
                />
                <component
                  :is="item.icon"
                  class="size-4 shrink-0 transition-colors"
                  :class="
                    isActive(item.to)
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                  "
                />
                <template v-if="!collapsed">
                  <span class="truncate">{{ t(item.title) }}</span>
                  <Badge
                    v-if="item.badge"
                    variant="secondary"
                    class="num ms-auto h-5 px-1.5 text-[10px]"
                  >
                    {{ item.badge }}
                  </Badge>
                </template>
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>
    </ScrollArea>

    <!-- Footer / user. Point `to` at your profile page once you build one
         (recipe: src/pages/reference/ProfilePage.vue). -->
    <div class="shrink-0 border-t border-sidebar-border p-3">
      <RouterLink
        to="/"
        class="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-sidebar-accent/60"
        :class="{ 'justify-center': collapsed }"
      >
        <span
          class="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
        >
          {{ t("shell.user.initials") }}
        </span>
        <div v-if="!collapsed" class="min-w-0 leading-tight">
          <p class="truncate text-[13px] font-medium text-sidebar-accent-foreground">
            {{ t("shell.user.name") }}
          </p>
          <p class="truncate text-[11px] text-muted-foreground">{{ t("shell.user.role") }}</p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
