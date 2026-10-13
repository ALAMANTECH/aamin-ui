<script setup lang="ts">
import { computed, ref, type Component } from "vue";
import { BellIcon, BellOffIcon, CheckCheckIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyState from "@/components/app/EmptyState.vue";
import type { NotificationItem } from "@/components/app/NotificationBell.vue";
import { formatTimeAgo } from "@/lib/datetime";
import { i18n } from "@/lib/i18n";

/**
 * The notification list inside NotificationBell's popover (usable on its own,
 * e.g. a full-page inbox): header with the unread count and "mark all read",
 * an unread/all switch, then the rows — an icon by `event` (falling back to
 * `resource`, then a bell), a tint by `event`, the title + body, and the time
 * ago. The host owns the data and the side effects (`open` marks read and
 * navigates, `readAll` marks everything read).
 */
const props = withDefaults(
  defineProps<{
    items: NotificationItem[];
    unreadCount: number;
    loading?: boolean;
    error?: string;
    /** Icon per `event` — wins over `resourceIcons`. */
    eventIcons?: Record<string, Component>;
    /** Token tint classes per `event`, e.g. `"bg-primary/15 text-primary"`. */
    eventTones?: Record<string, string>;
    /** Icon per `resource` when the event has none. */
    resourceIcons?: Record<string, Component>;
    /** Events whose icon is directional (arrows) and mirrors under RTL. */
    flipEvents?: string[];
  }>(),
  {
    loading: false,
    error: "",
    eventIcons: () => ({}),
    eventTones: () => ({}),
    resourceIcons: () => ({}),
    flipEvents: () => [],
  },
);

const emit = defineEmits<{ open: [item: NotificationItem]; readAll: []; retry: [] }>();

const t = i18n.global.t;

const tab = ref<"unread" | "all">("unread");
const visible = computed(() =>
  tab.value === "unread" ? props.items.filter((n) => !n.readAt) : props.items,
);

function icon(n: NotificationItem): Component {
  return (
    (n.event && props.eventIcons[n.event]) ||
    (n.resource && props.resourceIcons[n.resource]) ||
    BellIcon
  );
}
function tone(n: NotificationItem) {
  return (n.event && props.eventTones[n.event]) || "bg-muted text-muted-foreground";
}
function flips(n: NotificationItem) {
  return Boolean(n.event && props.flipEvents.includes(n.event));
}
</script>

<template>
  <div class="flex min-h-0 flex-col">
    <div class="flex items-center gap-2 border-b border-border px-3 py-2.5">
      <p class="text-sm font-semibold">
        {{ t("notifications.title") }}
        <span
          v-if="unreadCount"
          class="ms-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary"
        >
          <span class="num">{{ unreadCount }}</span>
        </span>
      </p>
      <Button
        variant="ghost"
        size="xs"
        class="ms-auto text-muted-foreground"
        :disabled="!unreadCount"
        @click="emit('readAll')"
      >
        <CheckCheckIcon class="size-3.5" aria-hidden="true" />
        {{ t("notifications.markAll") }}
      </Button>
    </div>

    <div class="px-3 pt-2">
      <Tabs v-model="tab">
        <TabsList variant="line" class="h-8">
          <TabsTrigger value="unread" class="text-xs">
            {{ t("notifications.tabUnread") }}
            <span v-if="unreadCount" class="num ms-1 text-[10px] text-muted-foreground">{{
              unreadCount
            }}</span>
          </TabsTrigger>
          <TabsTrigger value="all" class="text-xs">{{ t("notifications.tabAll") }}</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>

    <ScrollArea class="max-h-80">
      <div v-if="loading && !items.length" class="space-y-3 p-3">
        <div v-for="n in 3" :key="n" class="flex gap-3">
          <Skeleton class="size-8 shrink-0 rounded-lg" />
          <div class="flex-1 space-y-1.5">
            <Skeleton class="h-3.5 w-3/4" />
            <Skeleton class="h-3 w-1/2" />
          </div>
        </div>
      </div>

      <EmptyState
        v-else-if="error && !items.length"
        bare
        state="error"
        :title="t('notifications.loadError')"
        :error-message="error"
        @retry="emit('retry')"
      />

      <div
        v-else-if="!visible.length"
        class="flex flex-col items-center gap-2 px-4 py-10 text-center"
      >
        <span class="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
          <BellOffIcon class="size-4" aria-hidden="true" />
        </span>
        <p class="text-sm font-medium">{{ t("notifications.empty") }}</p>
        <p class="text-xs text-muted-foreground">{{ t("notifications.emptyHint") }}</p>
      </div>

      <ul v-else class="divide-y divide-border/70">
        <li v-for="n in visible" :key="n.id">
          <button
            type="button"
            class="flex w-full items-start gap-3 px-3 py-2.5 text-start transition-colors hover:bg-muted/50"
            :class="n.readAt ? '' : 'bg-primary/5'"
            @click="emit('open', n)"
          >
            <span
              class="relative mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg"
              :class="tone(n)"
            >
              <component
                :is="icon(n)"
                class="size-4"
                :class="flips(n) ? 'cn-rtl-flip' : ''"
                aria-hidden="true"
              />
              <span
                v-if="!n.readAt"
                class="absolute -start-0.5 -top-0.5 size-2 rounded-full bg-primary ring-2 ring-popover"
                aria-hidden="true"
              />
            </span>
            <span class="min-w-0 flex-1">
              <span
                class="block text-sm leading-snug"
                :class="n.readAt ? 'font-normal' : 'font-semibold'"
              >
                {{ n.title }}
              </span>
              <span
                v-if="n.body"
                class="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground"
              >
                {{ n.body }}
              </span>
              <span class="mt-1 block text-[11px] text-muted-foreground">
                {{ formatTimeAgo(n.createdAt, `${i18n.global.locale.value}-u-nu-latn`) }}
              </span>
            </span>
          </button>
        </li>
      </ul>
    </ScrollArea>
  </div>
</template>
