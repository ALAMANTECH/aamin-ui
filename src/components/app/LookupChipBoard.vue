<script setup lang="ts">
import { nextTick, ref } from "vue";
import { PencilIcon, PlusIcon, XIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { i18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * A vocabulary as a wrap of chips — for lookups that are one field (types,
 * categories, tags). A one-column table
 * with a pager was a list wearing a table costume; here the whole set is
 * visible at once, the name edits inline (click ✎ or the name → input, Enter
 * saves, Esc cancels), ✕ asks to delete, and the dashed chip at the end is the
 * add input.
 *
 * The board owns the chip UX only. The host owns persistence: it receives
 * `create` / `rename` / `remove` and resolves the returned promise when the
 * server has answered — the chip shows a spinner until then and reverts on a
 * rejection. Delete confirmation is the host's (AlertDialog), so `remove`
 * fires on ✕ and the host decides.
 */
export interface LookupChip {
  id: number | string;
  name: string;
}

const props = withDefaults(
  defineProps<{
    items: LookupChip[];
    /** Placeholder for the add chip ("Add a type…"). */
    addLabel: string;
    /** Dims the board while the host refetches. */
    busy?: boolean;
    /** Host rejects the edit/add for this id (e.g. already saving). */
    disabled?: boolean;
    class?: string;
  }>(),
  { busy: false, disabled: false, class: undefined },
);

const emit = defineEmits<{
  create: [name: string, done: (ok: boolean) => void];
  rename: [item: LookupChip, name: string, done: (ok: boolean) => void];
  remove: [item: LookupChip];
}>();

const t = i18n.global.t;

/* ---------------------------- Inline rename ----------------------------- */
const editingId = ref<LookupChip["id"] | null>(null);
const editValue = ref("");
const savingId = ref<LookupChip["id"] | null>(null);
const editInput = ref<HTMLInputElement[]>([]);

async function startEdit(item: LookupChip) {
  if (props.disabled || savingId.value != null) return;
  editingId.value = item.id;
  editValue.value = item.name;
  await nextTick();
  const el = editInput.value.find((i) => i.dataset.id === String(item.id));
  el?.focus();
  el?.select();
}

function cancelEdit() {
  editingId.value = null;
  editValue.value = "";
}

function commitEdit(item: LookupChip) {
  const name = editValue.value.trim();
  if (!name || name === item.name) return cancelEdit();
  savingId.value = item.id;
  emit("rename", item, name, (ok) => {
    savingId.value = null;
    if (ok) cancelEdit();
  });
}

/* ------------------------------- Add chip -------------------------------- */
const addValue = ref("");
const adding = ref(false);
const addInput = ref<HTMLInputElement | null>(null);

function commitAdd() {
  const name = addValue.value.trim();
  if (!name || adding.value) return;
  adding.value = true;
  emit("create", name, (ok) => {
    adding.value = false;
    if (ok) {
      addValue.value = "";
      // Keep the caret in the add chip so a batch of entries flows.
      nextTick(() => addInput.value?.focus());
    }
  });
}
</script>

<template>
  <div :class="cn('space-y-3', props.class)">
    <ul
      class="flex flex-wrap gap-2 transition-opacity"
      :class="busy && 'opacity-60'"
      :aria-busy="busy"
    >
      <li
        v-for="item in items"
        :key="item.id"
        class="group inline-flex h-9 items-center gap-1 rounded-lg border bg-muted/40 ps-3 pe-1.5 text-sm"
        :class="editingId === item.id && 'border-ring ring-2 ring-ring/30'"
      >
        <!-- Editing: bare input in the chip's place -->
        <template v-if="editingId === item.id">
          <input
            ref="editInput"
            v-model="editValue"
            :data-id="String(item.id)"
            class="min-w-24 bg-transparent outline-none"
            :style="{ width: `${Math.max(6, editValue.length + 1)}ch` }"
            :disabled="savingId === item.id"
            :aria-label="t('lookups.board.editAria', { name: item.name })"
            @keydown.enter.prevent="commitEdit(item)"
            @keydown.esc.prevent="cancelEdit()"
            @blur="commitEdit(item)"
          />
          <Spinner v-if="savingId === item.id" class="size-3.5 text-muted-foreground" />
        </template>

        <template v-else>
          <button
            type="button"
            class="truncate rounded-sm text-start outline-none focus-visible:ring-2 focus-visible:ring-ring"
            :title="t('lookups.board.clickToEdit')"
            @click="startEdit(item)"
          >
            {{ item.name }}
          </button>
          <span
            class="flex items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100"
          >
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  :aria-label="t('lookups.board.editAria', { name: item.name })"
                  @click="startEdit(item)"
                >
                  <PencilIcon class="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{{ t("common.edit") }}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  class="text-muted-foreground hover:text-destructive"
                  :aria-label="t('lookups.board.deleteAria', { name: item.name })"
                  @click="emit('remove', item)"
                >
                  <XIcon class="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{{ t("common.delete") }}</TooltipContent>
            </Tooltip>
          </span>
        </template>
      </li>

      <!-- Add chip: dashed, always last -->
      <li
        class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed ps-2.5 pe-2 text-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30"
      >
        <PlusIcon class="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref="addInput"
          v-model="addValue"
          class="min-w-36 bg-transparent outline-none placeholder:text-muted-foreground"
          :style="{ width: `${Math.max(addLabel.length + 2, addValue.length + 2)}ch` }"
          :placeholder="`${addLabel}…`"
          :aria-label="addLabel"
          :disabled="disabled || adding"
          @keydown.enter.prevent="commitAdd()"
          @keydown.esc.prevent="addValue = ''"
        />
        <Spinner v-if="adding" class="size-3.5 text-muted-foreground" />
      </li>
    </ul>

    <p class="flex items-center gap-2 text-[11px] text-muted-foreground">
      <Badge variant="secondary" class="num px-1.5 py-0 text-[10px]">{{ items.length }}</Badge>
      {{ t("lookups.board.keys") }}
    </p>
  </div>
</template>
