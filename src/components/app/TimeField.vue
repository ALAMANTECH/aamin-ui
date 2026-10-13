<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ClockIcon, XIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { i18n } from "@/lib/i18n";
import { cleanTyped } from "@/lib/digits";
import { cn } from "@/lib/utils";

/**
 * THE time-of-day control, always 24-hour — never a native `type="time"`,
 * whose AM/PM chrome follows the browser's locale. The model is the API's
 * `HH:MM` string ("" = none). The popover is a tap grid: the 24 hours in four
 * rows named by their part of the day (so "6 in the evening" is found as 18
 * without arithmetic), then the minutes in `minuteStep`s; a minute the grid
 * does not offer is typed in the box on top ("1837" or "18:37"). Picking an
 * hour keeps the popover open for the minute; picking a minute closes it.
 *
 * `class` and `data-testid` land on the root; `id` (for a Label), `invalid`
 * and `aria-label` go to the button. `clearable` adds the ✕ inside the field.
 */
const model = defineModel<string>({ default: "" });

const props = withDefaults(
  defineProps<{
    id?: string;
    placeholder?: string;
    ariaLabel?: string;
    size?: "sm" | "default";
    invalid?: boolean;
    disabled?: boolean;
    clearable?: boolean;
    tinted?: boolean;
    minuteStep?: number;
  }>(),
  { size: "default", minuteStep: 5 },
);

const t = i18n.global.t;
const open = ref(false);
const typed = ref("");
const typedInvalid = ref(false);

const pad = (n: number) => String(n).padStart(2, "0");
const PERIODS = ["night", "morning", "afternoon", "evening"] as const;
const hourRows = PERIODS.map((period, row) => ({
  period,
  hours: Array.from({ length: 6 }, (_, i) => row * 6 + i),
}));
const minutes = computed(() =>
  Array.from({ length: Math.ceil(60 / props.minuteStep) }, (_, i) => i * props.minuteStep),
);

const parts = computed(() => {
  const match = /^(\d{2}):(\d{2})$/.exec(model.value);
  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : null;
});

const label = computed(() => props.ariaLabel ?? props.placeholder ?? t("common.pickTime"));

/** "1837", "18:37", "18.37", "٦:٥" and "9" all read as a time; anything past 23:59 does not. */
function parseTyped(value: string): string | null {
  const text = cleanTyped(value).replace(/[.\s]/g, ":");
  const match = /^(\d{1,2})(?::?(\d{2}))?$/.exec(text) ?? /^(\d{1,2}):(\d{1,2})$/.exec(text);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  if (hour > 23 || minute > 59) return null;
  return `${pad(hour)}:${pad(minute)}`;
}

function pickHour(hour: number) {
  model.value = `${pad(hour)}:${pad(parts.value?.minute ?? 0)}`;
}

function pickMinute(minute: number) {
  model.value = `${pad(parts.value?.hour ?? 0)}:${pad(minute)}`;
  open.value = false;
}

function applyTyped() {
  if (!typed.value.trim()) return;
  const value = parseTyped(typed.value);
  typedInvalid.value = value === null;
  if (value === null) return;
  model.value = value;
  open.value = false;
}

watch(open, (isOpen) => {
  if (!isOpen) return;
  typed.value = "";
  typedInvalid.value = false;
});
watch(typed, () => {
  typedInvalid.value = false;
});

const cell =
  "num h-8 rounded-md text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const cellOn = "bg-primary/15 font-semibold text-primary hover:bg-primary/20";
</script>

<template>
  <div class="relative">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          :id="id"
          type="button"
          variant="outline"
          :size="size"
          :disabled="disabled"
          :aria-label="label"
          :aria-invalid="invalid || undefined"
          :class="[
            'w-full justify-start gap-2 font-normal',
            clearable && model && 'pe-8',
            tinted && model && 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15',
          ]"
        >
          <ClockIcon
            class="size-3.5 shrink-0"
            :class="!model && 'text-muted-foreground'"
            aria-hidden="true"
          />
          <span v-if="model" class="num truncate">{{ model }}</span>
          <span v-else class="truncate text-muted-foreground">{{
            placeholder ?? t("common.pickTime")
          }}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[min(20rem,calc(100vw-2rem))] p-3" align="start">
        <form class="space-y-1" @submit.prevent="applyTyped">
          <Input
            v-model="typed"
            inputmode="numeric"
            autocomplete="off"
            class="num text-center"
            :placeholder="model || '18:30'"
            :aria-label="t('timeField.type')"
            :aria-invalid="typedInvalid || undefined"
            data-time-typed
            @blur="applyTyped"
          />
          <p class="text-[11px] text-muted-foreground" :class="typedInvalid && 'text-destructive'">
            {{ typedInvalid ? t("timeField.typeInvalid") : t("timeField.typeHint") }}
          </p>
        </form>

        <p class="mt-3 mb-1.5 text-xs font-medium text-muted-foreground">
          {{ t("timeField.hour") }}
        </p>
        <div class="space-y-1" role="group" :aria-label="t('timeField.hour')">
          <div v-for="row in hourRows" :key="row.period" class="flex items-center gap-2">
            <span class="w-12 shrink-0 text-[11px] text-muted-foreground">{{
              t(`timeField.periods.${row.period}`)
            }}</span>
            <div class="grid flex-1 grid-cols-6 gap-1">
              <button
                v-for="hour in row.hours"
                :key="hour"
                type="button"
                :class="cn(cell, parts?.hour === hour && cellOn)"
                :aria-pressed="parts?.hour === hour"
                :data-hour="hour"
                @click="pickHour(hour)"
              >
                {{ pad(hour) }}
              </button>
            </div>
          </div>
        </div>

        <p class="mt-3 mb-1.5 text-xs font-medium text-muted-foreground">
          {{ t("timeField.minute") }}
        </p>
        <div class="grid grid-cols-6 gap-1" role="group" :aria-label="t('timeField.minute')">
          <button
            v-for="minute in minutes"
            :key="minute"
            type="button"
            :class="cn(cell, parts?.minute === minute && cellOn)"
            :aria-pressed="parts?.minute === minute"
            :data-minute="minute"
            @click="pickMinute(minute)"
          >
            {{ pad(minute) }}
          </button>
        </div>
      </PopoverContent>
    </Popover>
    <button
      v-if="clearable && model && !disabled"
      type="button"
      class="absolute end-1.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      :aria-label="t('common.clearTime')"
      @click="model = ''"
    >
      <XIcon class="size-3" aria-hidden="true" />
    </button>
  </div>
</template>
