<script setup lang="ts">
import { computed } from "vue";
import type { HTMLAttributes } from "vue";
import { Switch } from "@/components/ui/switch";
import StatusBadge from "@/components/app/StatusBadge.vue";
import { i18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * A record's enabled/disabled toggle WITH its state spelled out — the switch
 * and a StatusBadge as one unit, every breakpoint. A bare switch says "you
 * can flip this" but not what it currently is (the thumb side is direction-
 * dependent in RTL); the badge says "enabled" / "disabled" in words.
 *
 * Use it wherever a table row or page header lets someone enable/disable a
 * record. Form switches inside dialogs (a field among fields) do not need it —
 * the field's label already names it. Controlled: it emits the requested
 * value and shows `modelValue` until the host has stored the change.
 */
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    /** In-flight guard — disables the switch while the request runs. */
    pending?: boolean;
    /** Switch size; `sm` for dense table rows. */
    size?: "default" | "sm";
    /** Accessible name for the switch — say what it toggles ("Enable Demo Bank A"). */
    label: string;
    /** Override the badge words (defaults to common enabled/disabled). */
    enabledLabel?: string;
    disabledLabel?: string;
    /** Badge tone of the off state — `destructive` where off is a block (a locked account). */
    disabledVariant?: "secondary" | "warning" | "destructive";
    /** Badge before the switch (default) or after. */
    badgeSide?: "start" | "end";
    class?: HTMLAttributes["class"];
  }>(),
  {
    pending: false,
    size: "default",
    enabledLabel: undefined,
    disabledLabel: undefined,
    disabledVariant: "secondary",
    badgeSide: "start",
    class: undefined,
  },
);

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const t = i18n.global.t;

const map = computed(() => ({
  true: { variant: "success" as const, label: props.enabledLabel ?? t("common.enabled") },
  false: { variant: props.disabledVariant, label: props.disabledLabel ?? t("common.disabled") },
}));
</script>

<template>
  <div :class="cn('inline-flex items-center gap-2', props.class)">
    <!-- Both state labels render invisibly in the same grid cell so the pill
         always spans the wider word — the switch stays put when the status
         flips or differs across sibling rows. -->
    <div class="grid" :class="badgeSide === 'end' ? 'order-last' : undefined">
      <StatusBadge class="invisible col-start-1 row-start-1" status="true" :map="map" />
      <StatusBadge class="invisible col-start-1 row-start-1" status="false" :map="map" />
      <StatusBadge
        class="col-start-1 row-start-1 w-full justify-center"
        data-testid="status-switch-state"
        :status="modelValue ? 'true' : 'false'"
        :map="map"
      />
    </div>
    <Switch
      :size="size"
      :model-value="modelValue"
      :disabled="pending"
      :aria-label="label"
      @update:model-value="(v) => emit('update:modelValue', !!v)"
    />
  </div>
</template>
