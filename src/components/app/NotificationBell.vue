<script lang="ts">
export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  createdAt: string;
  readAt: string | null;
  /** Router path followed on click (after marking read). */
  link?: string;
  /** Drives the row icon + tint via the `eventIcons` / `eventTones` maps. */
  event?: string;
  /** Fallback icon key (`resourceIcons`) when the event has no icon. */
  resource?: string;
}

/**
 * The bell's only link to a backend — the host maps its own endpoints here.
 * Every method may reject; the bell turns rejections into an inline error
 * (list) or a toast (mark read).
 */
export interface NotificationAdapter {
  fetchCount(): Promise<number>;
  fetchList(): Promise<NotificationItem[]>;
  markRead(id: string): Promise<void>;
  markAll(): Promise<void>;
}
</script>

<script setup lang="ts">
import { computed, inject, ref, watch, type Component } from "vue";
import { routerKey } from "vue-router";
import { toast } from "vue-sonner";
import { BellIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NotificationFeed from "@/components/app/NotificationFeed.vue";
import { usePoll } from "@/composables/usePoll";
import { i18n } from "@/lib/i18n";

/**
 * The topbar bell. The unread count is fetched at mount and polled every
 * `pollMs` (stops after 3 consecutive failures, via usePoll); the list is
 * fetched when the popover opens. A row click marks it read and follows
 * `link` (through the router when one is installed); "mark all" clears the
 * badge. All data goes through the `adapter` prop — the bell knows no URLs.
 * Drop it into AppTopbar's `#notifications` slot.
 *
 * No Tooltip around the trigger: with TooltipTrigger and PopoverTrigger
 * nested (either order) reka never registers the popper anchor and the
 * content stays at its hidden offset. The aria-label carries the name.
 */
const props = withDefaults(
  defineProps<{
    adapter: NotificationAdapter;
    /** Unread-count poll interval in ms (read once, at mount). */
    pollMs?: number;
    eventIcons?: Record<string, Component>;
    eventTones?: Record<string, string>;
    resourceIcons?: Record<string, Component>;
    /** Events whose icon is directional and mirrors under RTL. */
    flipEvents?: string[];
  }>(),
  {
    pollMs: 60_000,
    eventIcons: () => ({}),
    eventTones: () => ({}),
    resourceIcons: () => ({}),
    flipEvents: () => [],
  },
);

const emit = defineEmits<{ open: [item: NotificationItem] }>();

const t = i18n.global.t;
const router = inject(routerKey, null);

function errorText(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

const unread = ref(0);

async function refreshCount() {
  const n = await props.adapter.fetchCount();
  if (typeof n === "number" && Number.isFinite(n)) unread.value = Math.max(0, n);
}

void refreshCount().catch(() => {});
usePoll(refreshCount, { interval: props.pollMs, maxFailures: 3 });

const open = ref(false);
const items = ref<NotificationItem[]>([]);
const loading = ref(false);
const error = ref("");

async function loadList() {
  loading.value = true;
  try {
    items.value = await props.adapter.fetchList();
    error.value = "";
  } catch (err) {
    error.value = errorText(err, t("notifications.loadError"));
  } finally {
    loading.value = false;
  }
}

watch(open, (isOpen) => {
  if (!isOpen) return;
  void loadList();
  void refreshCount().catch(() => {});
});

async function openRow(item: NotificationItem) {
  emit("open", item);
  if (!item.readAt) {
    // Optimistic: the row and badge update before the request settles.
    item.readAt = new Date().toISOString();
    unread.value = Math.max(0, unread.value - 1);
    try {
      await props.adapter.markRead(item.id);
    } catch (err) {
      toast.error(errorText(err, t("notifications.readFailed")));
    }
  }
  if (item.link) {
    open.value = false;
    if (router) void router.push(item.link);
  }
}

async function readAll() {
  try {
    await props.adapter.markAll();
    const now = new Date().toISOString();
    for (const n of items.value) if (!n.readAt) n.readAt = now;
    unread.value = 0;
  } catch (err) {
    toast.error(errorText(err, t("notifications.readFailed")));
  }
}

const badge = computed(() => (unread.value > 99 ? "99+" : String(unread.value)));
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="relative"
        :aria-label="t('notifications.bellLabel')"
      >
        <BellIcon class="size-4" aria-hidden="true" />
        <span
          v-if="unread"
          class="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-primary-foreground ring-2 ring-background"
        >
          <span class="num">{{ badge }}</span>
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-[min(24rem,calc(100vw-2rem))] p-0">
      <NotificationFeed
        :items="items"
        :unread-count="unread"
        :loading="loading"
        :error="error"
        :event-icons="eventIcons"
        :event-tones="eventTones"
        :resource-icons="resourceIcons"
        :flip-events="flipEvents"
        @open="openRow"
        @read-all="readAll"
        @retry="loadList"
      />
    </PopoverContent>
  </Popover>
</template>
