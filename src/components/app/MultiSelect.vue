<script setup lang="ts">
import { computed, ref } from "vue";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from "@/components/ui/combobox";
import { i18n } from "@/lib/i18n";
import { cn, normalizeArabic } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
};

/**
 * Multi-value sibling of SearchableSelect: same Combobox kit, but the reka
 * root runs with `multiple` so the list stays open while several options are
 * ticked. The trigger shows the single selection's label, or a count.
 */
const props = withDefaults(
  defineProps<{
    options: MultiSelectOption[];
    modelValue?: string[];
    /** Trigger text when nothing is selected — usually the "all …" reading. */
    placeholder: string;
    ariaLabel: string;
    searchPlaceholder?: string;
    /** Trigger text for N selections, with `{count}` interpolated. */
    countLabel?: string;
    disabled?: boolean;
    size?: "default" | "sm";
    class?: string;
  }>(),
  {
    modelValue: () => [],
    searchPlaceholder: undefined,
    countLabel: undefined,
    disabled: false,
    size: "default",
    class: undefined,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

const search = ref("");

const searchPlaceholderText = computed(
  () => props.searchPlaceholder ?? i18n.global.t("common.search"),
);

const filteredOptions = computed(() => {
  const needle = normalizeArabic(search.value.trim());
  if (!needle) return props.options;
  return props.options.filter((o) => normalizeArabic(o.label).includes(needle));
});

const triggerLabel = computed(() => {
  const selected = props.modelValue;
  if (selected.length === 0) return props.placeholder;
  if (selected.length === 1) {
    return props.options.find((o) => o.value === selected[0])?.label ?? props.placeholder;
  }
  if (props.countLabel) return props.countLabel.replace("{count}", String(selected.length));
  return `${selected.length}`;
});

function onUpdate(raw: unknown) {
  emit("update:modelValue", Array.isArray(raw) ? raw.map(String) : []);
}

function clear() {
  emit("update:modelValue", []);
}

function onOpenChange(open: boolean) {
  if (open) search.value = "";
}
</script>

<template>
  <Combobox
    :model-value="modelValue"
    :multiple="true"
    :ignore-filter="true"
    :disabled="disabled"
    :class="cn('w-full', props.class)"
    @update:model-value="onUpdate"
    @update:open="onOpenChange"
  >
    <ComboboxAnchor as-child class="w-full">
      <ComboboxTrigger as-child>
        <Button
          type="button"
          variant="outline"
          :size="size"
          :disabled="disabled"
          :aria-label="ariaLabel"
          class="w-full justify-between font-normal"
        >
          <span class="truncate">{{ triggerLabel }}</span>
          <span class="flex shrink-0 items-center gap-1">
            <XIcon
              v-if="modelValue.length > 0"
              class="size-4 opacity-50 hover:opacity-100"
              :aria-label="i18n.global.t('common.clear')"
              @click.stop.prevent="clear"
            />
            <ChevronsUpDownIcon class="size-4 opacity-50" aria-hidden="true" />
          </span>
        </Button>
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxList>
      <ComboboxInput
        v-model="search"
        :display-value="() => ''"
        :placeholder="searchPlaceholderText"
      />
      <ComboboxEmpty>{{ i18n.global.t("common.noResults") }}</ComboboxEmpty>
      <ComboboxViewport>
        <ComboboxItem
          v-for="o in filteredOptions"
          :key="o.value"
          :value="o.value"
          :text-value="o.label"
        >
          {{ o.label }}
          <ComboboxItemIndicator>
            <CheckIcon class="pointer-events-none" />
          </ComboboxItemIndicator>
        </ComboboxItem>
      </ComboboxViewport>
    </ComboboxList>
  </Combobox>
</template>
