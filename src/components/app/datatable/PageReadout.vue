<script setup lang="ts">
import { nextTick, ref } from "vue";
import { Input } from "@/components/ui/input";
import { i18n } from "@/lib/i18n";
import { resolvePage } from "./page-jump";

/**
 * The "n / m" page readout that is also the jump control. The current page
 * number is a dotted-underline button; pressing it swaps in a field pre-filled
 * with the page and selected. Enter jumps (out-of-range numbers clamp to the
 * nearest edge), Escape or leaving the field cancels. Nothing is added to the
 * footer, so the row stays exactly as wide as a plain readout — the pick from
 * the design-samples round over an always-visible "go to" field.
 *
 * Shared by DataTablePagination (both breakpoints) and any non-table pager.
 */
const props = withDefaults(
  defineProps<{
    /** Zero-based, matching TanStack's pagination state. */
    pageIndex: number;
    pageCount: number;
    /** Disables the control while a request is in flight. */
    busy?: boolean;
    /** `sm` fits the desktop footer row; `lg` is the phone footer's touch size. */
    size?: "sm" | "lg";
  }>(),
  { busy: false, size: "sm" },
);

const emit = defineEmits<{ "update:pageIndex": [value: number] }>();

const t = i18n.global.t;
const editing = ref(false);
const draft = ref("");
const inputRef = ref<{ $el?: HTMLInputElement } | null>(null);

async function open() {
  if (props.busy) return;
  draft.value = String(props.pageIndex + 1);
  editing.value = true;
  await nextTick();
  const el = inputRef.value?.$el;
  el?.focus();
  el?.select();
}

function commit() {
  const next = resolvePage(draft.value, props.pageCount);
  editing.value = false;
  if (next === null || next === props.pageIndex) return;
  emit("update:pageIndex", next);
}

function cancel() {
  editing.value = false;
}
</script>

<template>
  <span
    data-slot="page-readout"
    :class="[
      'num inline-flex items-center gap-1 text-muted-foreground',
      size === 'lg' ? 'text-sm' : 'text-xs',
    ]"
  >
    <Input
      v-if="editing"
      ref="inputRef"
      v-model="draft"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      enterkeyhint="go"
      :aria-label="t('datatable.pageReadoutAria', { page: pageIndex + 1, count: pageCount })"
      :class="['num px-1 text-center', size === 'lg' ? 'h-8 w-16 text-sm' : 'h-6 w-12 text-xs']"
      @keydown.enter.prevent="commit"
      @keydown.esc.prevent="cancel"
      @blur="cancel"
    />
    <button
      v-else
      type="button"
      :disabled="busy"
      :title="t('datatable.pageReadoutHint')"
      :aria-label="t('datatable.pageReadoutAria', { page: pageIndex + 1, count: pageCount })"
      :class="[
        'num rounded text-foreground underline decoration-muted-foreground/60 decoration-dotted underline-offset-4 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
        // Phone footer: match the arrows' 40px thumb size, not just the glyph.
        size === 'lg' ? 'min-h-10 min-w-10 px-2' : 'px-1',
      ]"
      @click="open"
    >
      {{ pageIndex + 1 }}
    </button>
    <!-- Real spaces around the slash so the text reads "n / m" to assistive tech and tests alike. -->
    <span aria-hidden="true"> / </span>
    <span>{{ pageCount }}</span>
  </span>
</template>
