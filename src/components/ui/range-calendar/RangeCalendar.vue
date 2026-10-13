<script lang="ts" setup>
import type { DateValue, RangeCalendarRootEmits, RangeCalendarRootProps } from "reka-ui"
import type { HTMLAttributes, Ref } from "vue"
import type { LayoutTypes } from "@/components/ui/calendar"
import { getLocalTimeZone, today } from "@internationalized/date"
import { createReusableTemplate, reactiveOmit, useVModel } from "@vueuse/core"
import { RangeCalendarRoot, useDateFormatter, useForwardPropsEmits } from "reka-ui"
import { createYear, createYearRange, toDate } from "reka-ui/date"
import { computed, toRaw } from "vue"
import { cn } from "@/lib/utils"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
  RangeCalendarHeader,
  RangeCalendarHeading,
  RangeCalendarNextButton,
  RangeCalendarPrevButton,
} from "."
import { i18n } from "@/lib/i18n";


const props = withDefaults(
  defineProps<RangeCalendarRootProps & { class?: HTMLAttributes["class"]; layout?: LayoutTypes; yearRange?: DateValue[] }>(),
  {
    layout: undefined,
    // reka-ui's RangeCalendarRoot falls back to the English "Event Date" when
    // this is unset; give it an Arabic default so consumers who forget to
    // pass calendar-label don't leak English into the accessible name.
    calendarLabel: () => i18n.global.t("calendar.rangeLabel"),
  },
)

const emits = defineEmits<RangeCalendarRootEmits>()

const delegatedProps = reactiveOmit(props, "class", "layout", "placeholder")

const placeholder = useVModel(props, "placeholder", emits, {
  passive: true,
  defaultValue: props.defaultPlaceholder ?? today(getLocalTimeZone()),
}) as Ref<DateValue>

const formatter = useDateFormatter(props.locale ?? "en")

const yearRange = computed(() => {
  return (
    props.yearRange ??
    createYearRange({
      start: props?.minValue ??
        (toRaw(props.placeholder) ?? props.defaultPlaceholder ?? today(getLocalTimeZone())).cycle(
          "year",
          -100,
        ),
      end: props?.maxValue ??
        (toRaw(props.placeholder) ?? props.defaultPlaceholder ?? today(getLocalTimeZone())).cycle(
          "year",
          10,
        ),
    })
  )
})

const [DefineMonthTemplate, ReuseMonthTemplate] = createReusableTemplate<{ date: DateValue }>()
const [DefineYearTemplate, ReuseYearTemplate] = createReusableTemplate<{ date: DateValue }>()

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DefineMonthTemplate v-slot="{ date }">
    <div class="**:data-[slot=native-select-icon]:end-1">
      <div class="relative">
        <div class="pointer-events-none absolute inset-0 flex h-full items-center ps-2 text-sm">
          {{ formatter.custom(toDate(date), { month: "short" }) }}
        </div>
        <NativeSelect
          class="relative h-8 pe-6 ps-2 text-xs text-transparent"
          @change="
            (e: Event) => {
              placeholder = placeholder.set({
                month: Number((e?.target as HTMLSelectElement)?.value),
              })
            }
          "
        >
          <NativeSelectOption
            v-for="month in createYear({ dateObj: date })"
            :key="month.toString()"
            :value="month.month"
            :selected="date.month === month.month"
          >
            {{ formatter.custom(toDate(month), { month: "short" }) }}
          </NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  </DefineMonthTemplate>

  <DefineYearTemplate v-slot="{ date }">
    <div class="**:data-[slot=native-select-icon]:end-1">
      <div class="relative">
        <div class="pointer-events-none absolute inset-0 flex h-full items-center ps-2 text-sm">
          {{ formatter.custom(toDate(date), { year: "numeric" }) }}
        </div>
        <NativeSelect
          class="relative h-8 pe-6 ps-2 text-xs text-transparent"
          @change="
            (e: Event) => {
              placeholder = placeholder.set({
                year: Number((e?.target as HTMLSelectElement)?.value),
              })
            }
          "
        >
          <NativeSelectOption
            v-for="year in yearRange"
            :key="year.toString()"
            :value="year.year"
            :selected="date.year === year.year"
          >
            {{ formatter.custom(toDate(year), { year: "numeric" }) }}
          </NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  </DefineYearTemplate>

  <RangeCalendarRoot
    v-slot="{ grid, weekDays, date }"
    v-bind="forwarded"
    v-model:placeholder="placeholder"
    data-slot="range-calendar"
    :class="
      cn(
        'bg-background p-3 [--cell-radius:var(--radius-md)] group/calendar in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent',
        props.class,
      )
    "
  >
    <RangeCalendarHeader class="pt-0">
      <nav class="absolute inset-x-0 top-0 flex items-center justify-between">
        <RangeCalendarPrevButton />
        <RangeCalendarNextButton />
      </nav>

      <slot name="calendar-heading" :date="date" :month="ReuseMonthTemplate" :year="ReuseYearTemplate">
        <template v-if="layout === 'month-and-year'">
          <div class="flex items-center justify-center gap-1">
            <ReuseMonthTemplate :date="date" />
            <ReuseYearTemplate :date="date" />
          </div>
        </template>
        <template v-else-if="layout === 'month-only'">
          <div class="flex items-center justify-center gap-1">
            <ReuseMonthTemplate :date="date" />
            {{ formatter.custom(toDate(date), { year: "numeric" }) }}
          </div>
        </template>
        <template v-else-if="layout === 'year-only'">
          <div class="flex items-center justify-center gap-1">
            {{ formatter.custom(toDate(date), { month: "short" }) }}
            <ReuseYearTemplate :date="date" />
          </div>
        </template>
        <template v-else>
          <RangeCalendarHeading />
        </template>
      </slot>
    </RangeCalendarHeader>

    <div class="mt-4 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
      <RangeCalendarGrid v-for="month in grid" :key="month.value.toString()">
        <RangeCalendarGridHead>
          <RangeCalendarGridRow>
            <RangeCalendarHeadCell v-for="day in weekDays" :key="day">
              {{ day }}
            </RangeCalendarHeadCell>
          </RangeCalendarGridRow>
        </RangeCalendarGridHead>
        <RangeCalendarGridBody>
          <RangeCalendarGridRow
            v-for="(weekDates, index) in month.rows"
            :key="`weekDate-${index}`"
            class="mt-2 w-full"
          >
            <RangeCalendarCell
              v-for="weekDate in weekDates"
              :key="weekDate.toString()"
              :date="weekDate"
            >
              <RangeCalendarCellTrigger :day="weekDate" :month="month.value" />
            </RangeCalendarCell>
          </RangeCalendarGridRow>
        </RangeCalendarGridBody>
      </RangeCalendarGrid>
    </div>
  </RangeCalendarRoot>
</template>
