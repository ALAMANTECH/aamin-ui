<script setup lang="ts">
import type { Component } from "vue";
import { InboxIcon, TriangleAlertIcon } from "@/lib/icons";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
// i18n.global (not useI18n) so the unit-tested composite mounts without the plugin.
import { i18n } from "@/lib/i18n";

withDefaults(
  defineProps<{
    title: string;
    hint?: string;
    icon?: Component;
    /** "empty" (default) keeps current behavior; "loading"/"error" swap the body. */
    state?: "empty" | "loading" | "error";
    /** Error-state detail line; falls back to `hint` when omitted. */
    errorMessage?: string;
    /** Drop the panel's own dashed frame — for use INSIDE an already-framed
     *  container (a DataTable sheet, a Card) where a border-in-border reads as
     *  a floating box. The content stretches to fill instead. */
    bare?: boolean;
  }>(),
  { hint: "", icon: undefined, state: "empty", errorMessage: undefined, bare: false },
);

const emit = defineEmits<{ retry: [] }>();

const t = i18n.global.t;
</script>

<template>
  <div
    class="flex w-full flex-col items-center justify-center px-6 text-center"
    :class="bare ? 'py-12' : 'rounded-xl border border-dashed bg-grid py-16'"
  >
    <!-- flex-col (not grid place-items-center): when a host stretches this to a
         tall floor — DataTable's phone empty shell — a grid would spread the
         icon and text across the full height; flex keeps them one centred group. -->
    <!-- Loading -->
    <template v-if="state === 'loading'">
      <Spinner size="lg" />
      <p class="mt-4 text-sm font-medium text-muted-foreground">{{ title }}</p>
    </template>

    <!-- Error -->
    <template v-else-if="state === 'error'">
      <span class="grid size-11 place-items-center rounded-xl bg-destructive/10 text-destructive">
        <TriangleAlertIcon class="size-5" aria-hidden="true" />
      </span>
      <p class="mt-4 text-sm font-semibold">{{ title }}</p>
      <p v-if="errorMessage ?? hint" class="mt-1 max-w-sm text-xs text-muted-foreground">
        {{ errorMessage ?? hint }}
      </p>
      <div class="mt-5">
        <slot name="retry">
          <Button variant="outline" size="sm" @click="emit('retry')">{{
            t("common.retry")
          }}</Button>
        </slot>
      </div>
    </template>

    <!-- Empty (default) -->
    <template v-else>
      <span class="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
        <component :is="icon ?? InboxIcon" class="size-5" aria-hidden="true" />
      </span>
      <p class="mt-4 text-sm font-semibold">{{ title }}</p>
      <p v-if="hint" class="mt-1 max-w-sm text-xs text-muted-foreground">{{ hint }}</p>
      <div v-if="$slots.default" class="mt-5">
        <slot />
      </div>
    </template>
  </div>
</template>
