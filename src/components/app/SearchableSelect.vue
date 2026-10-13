<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { CheckIcon, ChevronsUpDownIcon } from "@/lib/icons";
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
  ComboboxVirtualizer,
} from "@/components/ui/combobox";
import { Spinner } from "@/components/ui/spinner";
import { i18n } from "@/lib/i18n";
import { cn, normalizeArabic } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

const NONE_VALUE = "__none__";
/** Below this, mount every row — virtualizer needs real layout metrics. */
const VIRTUALIZE_AT = 40;

const props = withDefaults(
  defineProps<{
    options: SearchableSelectOption[];
    modelValue?: string;
    /** Trigger text when nothing is selected (and `noneLabel` is unset). */
    placeholder: string;
    ariaLabel: string;
    searchPlaceholder?: string;
    /** If set, shows a clear/none row that emits `""`. */
    noneLabel?: string;
    /** Show a spinner in the list while options are fetching. */
    loading?: boolean;
    disabled?: boolean;
    size?: "default" | "sm";
    class?: string;
    /**
     * The parent searches the server itself: every typed term is emitted as
     * `search`, `options` are shown as given (no local filtering), and the
     * search box stays usable while the parent fetches.
     */
    remote?: boolean;
    /** A line shown at the top of the open list — e.g. a remote search that failed, which an empty list would hide. */
    notice?: string;
  }>(),
  {
    modelValue: "",
    searchPlaceholder: undefined,
    noneLabel: undefined,
    loading: false,
    disabled: false,
    size: "default",
    class: undefined,
    remote: false,
    notice: undefined,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  open: [];
  search: [term: string];
}>();

const search = ref("");
/** Spins on open until parent `:loading` takes over or options arrive (avoids empty flash). */
const pendingOpenLoad = ref(false);
let pendingClearTimer: ReturnType<typeof setTimeout> | undefined;

const searchPlaceholderText = computed(
  () => props.searchPlaceholder ?? i18n.global.t("common.search"),
);

const loadingLabel = computed(() => i18n.global.t("common.loading"));

/**
 * Only block the list when there is nothing to show yet. If options are already
 * cached (or a label-extra is present), keep them visible during a background refresh.
 */
const showLoading = computed(
  () => (props.loading || pendingOpenLoad.value) && props.options.length === 0,
);

/** Each option's label normalized once per `options` change, not once per
 *  option per keystroke — normalizeArabic runs six string passes, and lists
 *  here can be a full catalogue (thousands of rows). Rendering is
 *  virtualized above VIRTUALIZE_AT; this filter is the remaining hot path. */
const normalizedLabels = computed(() => props.options.map((o) => normalizeArabic(o.label)));

const filteredOptions = computed(() => {
  if (props.remote) return props.options;
  const needle = normalizeArabic(search.value.trim());
  if (!needle) return props.options;
  const haystacks = normalizedLabels.value;
  return props.options.filter((_, i) => haystacks[i].includes(needle));
});

const useVirtualizer = computed(() => filteredOptions.value.length >= VIRTUALIZE_AT);

const triggerLabel = computed(() => {
  if (!props.modelValue) {
    return props.noneLabel ?? props.placeholder;
  }
  return props.options.find((o) => o.value === props.modelValue)?.label ?? props.placeholder;
});

const comboboxValue = computed(() => {
  if (!props.modelValue) return props.noneLabel ? NONE_VALUE : "";
  return props.modelValue;
});

function optionText(o: SearchableSelectOption) {
  return o.label;
}

function clearPendingOpenLoad() {
  pendingOpenLoad.value = false;
  if (pendingClearTimer != null) {
    clearTimeout(pendingClearTimer);
    pendingClearTimer = undefined;
  }
}

function onSelect(raw: unknown) {
  if (showLoading.value) return;
  const v = raw == null ? "" : String(raw);
  search.value = "";
  if (!v || v === NONE_VALUE) {
    emit("update:modelValue", "");
    return;
  }
  emit("update:modelValue", v);
}

function onOpenChange(open: boolean) {
  if (pendingClearTimer != null) {
    clearTimeout(pendingClearTimer);
    pendingClearTimer = undefined;
  }

  if (open) {
    search.value = "";
    // Immediate feedback when the list has nothing yet — parent `:loading`
    // often lands a tick later via `@open`. A remote list waits for typing.
    if (!props.remote && props.options.length === 0 && !props.loading) {
      pendingOpenLoad.value = true;
      pendingClearTimer = setTimeout(() => {
        // Parent never started a load (already settled empty).
        if (!props.loading && props.options.length === 0) {
          pendingOpenLoad.value = false;
        }
        pendingClearTimer = undefined;
      }, 100);
    }
    emit("open");
  } else {
    clearPendingOpenLoad();
  }
}

watch(
  () => props.options.length,
  (n) => {
    if (n > 0) clearPendingOpenLoad();
  },
);

watch(search, (term) => {
  if (props.remote) emit("search", term);
});

watch(
  () => props.loading,
  (loading) => {
    if (loading) {
      // Parent owns the spinner; drop the optimistic flag.
      if (pendingClearTimer != null) {
        clearTimeout(pendingClearTimer);
        pendingClearTimer = undefined;
      }
      pendingOpenLoad.value = false;
    } else {
      clearPendingOpenLoad();
    }
  },
);

onBeforeUnmount(() => {
  if (pendingClearTimer != null) clearTimeout(pendingClearTimer);
});
</script>

<template>
  <Combobox
    :model-value="comboboxValue"
    :ignore-filter="true"
    :disabled="disabled"
    :class="cn('w-full', props.class)"
    @update:model-value="onSelect"
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
          :aria-busy="showLoading || undefined"
          class="w-full justify-between font-normal"
        >
          <span class="truncate">{{ triggerLabel }}</span>
          <ChevronsUpDownIcon class="size-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxList>
      <ComboboxInput
        v-model="search"
        :display-value="() => ''"
        :placeholder="searchPlaceholderText"
        :disabled="showLoading && !remote"
      />
      <p
        v-if="notice"
        role="alert"
        class="px-3 py-2 text-xs text-destructive"
        data-testid="searchable-select-notice"
      >
        {{ notice }}
      </p>
      <div
        v-if="showLoading"
        class="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground"
        data-testid="searchable-select-loading"
      >
        <Spinner size="sm" :label="loadingLabel" />
        <span>{{ loadingLabel }}</span>
      </div>
      <template v-else>
        <ComboboxEmpty>{{ i18n.global.t("common.noResults") }}</ComboboxEmpty>
        <ComboboxViewport>
          <ComboboxItem v-if="noneLabel" :value="NONE_VALUE" :text-value="noneLabel">
            {{ noneLabel }}
            <ComboboxItemIndicator>
              <CheckIcon class="pointer-events-none" />
            </ComboboxItemIndicator>
          </ComboboxItem>
          <ComboboxVirtualizer
            v-if="useVirtualizer"
            v-slot="{ option }"
            :options="filteredOptions"
            :estimate-size="32"
            :text-content="optionText"
          >
            <ComboboxItem :value="option.value" :text-value="option.label">
              {{ option.label }}
              <ComboboxItemIndicator>
                <CheckIcon class="pointer-events-none" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          </ComboboxVirtualizer>
          <template v-else>
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
          </template>
        </ComboboxViewport>
      </template>
    </ComboboxList>
  </Combobox>
</template>
