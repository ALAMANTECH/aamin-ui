<script setup lang="ts">
import { computed, ref } from "vue";
import { parseDate, type DateValue } from "@internationalized/date";
import { CalendarIcon, XIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDateYmd } from "@/lib/datetime";
import { i18n } from "@/lib/i18n";

/**
 * THE single-date control: the kit Calendar (Libya config) in a popover behind
 * a button that reads like an input — never a native `type="date"`, whose
 * browser chrome ("mm/dd/yyyy") is not our UI. The model stays the
 * `YYYY-MM-DD` string the API takes ("" = no date); `min` / `max` are the same
 * strings, so a from/to pair bounds each other and "not in the future" is
 * `:max="todayYmd()"`. A pick closes the popover.
 *
 * `class` and `data-testid` land on the root; `id` (for a Label), `invalid`
 * and `aria-label` go to the button. `clearable` is for filters — a form's
 * required date has nothing to clear to. `tinted` marks a set value with the
 * filter bars' primary tint.
 */
const model = defineModel<string>({ default: "" });

const props = withDefaults(
  defineProps<{
    id?: string;
    min?: string;
    max?: string;
    placeholder?: string;
    ariaLabel?: string;
    size?: "sm" | "default";
    invalid?: boolean;
    disabled?: boolean;
    clearable?: boolean;
    tinted?: boolean;
  }>(),
  { size: "default" },
);

const open = ref(false);

function toDateValue(value: string | undefined): DateValue | undefined {
  if (!value) return undefined;
  try {
    return parseDate(value);
  } catch {
    return undefined;
  }
}

const value = computed(() => toDateValue(model.value));
const label = computed(
  () => props.ariaLabel ?? props.placeholder ?? i18n.global.t("common.pickDate"),
);

function pick(next: DateValue | undefined) {
  model.value = next ? next.toString() : "";
  open.value = false;
}
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
          <CalendarIcon
            class="size-3.5 shrink-0"
            :class="!model && 'text-muted-foreground'"
            aria-hidden="true"
          />
          <span v-if="model" class="num truncate">{{ formatDateYmd(model) }}</span>
          <span v-else class="truncate text-muted-foreground">{{
            placeholder ?? i18n.global.t("common.pickDate")
          }}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <Calendar
          :model-value="value"
          locale="ar-LY-u-nu-latn"
          :week-starts-on="6"
          layout="month-and-year"
          :min-value="toDateValue(min)"
          :max-value="toDateValue(max)"
          :calendar-label="label"
          @update:model-value="(v) => pick(v as DateValue | undefined)"
        />
      </PopoverContent>
    </Popover>
    <button
      v-if="clearable && model && !disabled"
      type="button"
      class="absolute end-1.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      :aria-label="i18n.global.t('common.clearDate')"
      @click="model = ''"
    >
      <XIcon class="size-3" aria-hidden="true" />
    </button>
  </div>
</template>
