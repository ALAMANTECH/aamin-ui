<script setup lang="ts">
// File intake is UI-only: this component accepts, validates, and emits
// native `File` objects — nothing more. Parsing (e.g. reading .xlsx rows via
// SheetJS, or a server-side parse) is deliberately out of scope for the kit;
// that choice belongs to the integration repo. See plan 009.
import { computed, onBeforeUnmount, shallowRef, useTemplateRef, watch } from "vue";
import { useDropZone } from "@vueuse/core";
import {
  FileIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  TriangleAlertIcon,
  UploadCloudIcon,
  XIcon,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { i18n } from "@/lib/i18n";

const props = withDefaults(
  defineProps<{
    /** Allowed extensions, e.g. `[".xlsx", ".csv"]`. Unset allows any type. */
    accept?: string[];
    /** Max size per file, in bytes. Unset means no limit. */
    maxSize?: number;
    /** Allow more than one file. @default true */
    multiple?: boolean;
    disabled?: boolean;
    /** `compact` renders a single-line chip (drop target + browse + filename)
     *  instead of the full panel — for dense per-row intake. @default "default" */
    variant?: "default" | "compact";
    /** The host refuses the file that is in (a card sheet short of its line): destructive frame + `aria-invalid`. */
    invalid?: boolean;
  }>(),
  {
    accept: undefined,
    maxSize: undefined,
    multiple: true,
    disabled: false,
    variant: "default",
    invalid: false,
  },
);

const emit = defineEmits<{
  /** Fired once per distinct rejection reason in a batch — `files` all share `reason`. */
  rejected: [files: File[], reason: string];
}>();

const files = defineModel<File[]>({ default: () => [] });

interface RejectedEntry {
  file: File;
  reason: string;
}
const rejectedEntries = shallowRef<RejectedEntry[]>([]);

// i18n.global.t (not useI18n) — unit-mounted without the i18n plugin.
const t = i18n.global.t;

const lastRejected = computed(() => rejectedEntries.value.at(-1));

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

function validate(file: File): string | null {
  if (props.accept && props.accept.length > 0) {
    const ext = extensionOf(file.name);
    if (!props.accept.some((allowed) => allowed.toLowerCase() === ext))
      return t("dropzone.typeNotAllowed");
  }
  if (props.maxSize !== undefined && file.size > props.maxSize) return t("dropzone.sizeTooLarge");
  return null;
}

function processFiles(incoming: File[]) {
  if (props.disabled || incoming.length === 0) return;

  const accepted: File[] = [];
  const rejectedByReason = new Map<string, File[]>();

  for (const file of incoming) {
    const reason = validate(file);
    if (reason === null) {
      accepted.push(file);
    } else {
      rejectedByReason.set(reason, [...(rejectedByReason.get(reason) ?? []), file]);
    }
  }

  if (accepted.length > 0) {
    files.value = props.multiple ? [...files.value, ...accepted] : [accepted[0]];
    if (props.variant === "compact") rejectedEntries.value = [];
  }

  if (rejectedByReason.size > 0) {
    const newEntries: RejectedEntry[] = [];
    for (const [reason, rejectedFiles] of rejectedByReason) {
      emit("rejected", rejectedFiles, reason);
      for (const file of rejectedFiles) newEntries.push({ file, reason });
    }
    rejectedEntries.value = [...rejectedEntries.value, ...newEntries];
  }
}

function removeFile(index: number) {
  files.value = files.value.filter((_, i) => i !== index);
  // Compact mode shows at most one rejection chip in place of the file chip;
  // without this a stale rejection from before the accepted file could
  // resurface once the file is removed.
  if (props.variant === "compact") rejectedEntries.value = [];
}

function removeRejected(index: number) {
  rejectedEntries.value = rejectedEntries.value.filter((_, i) => i !== index);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

const SPREADSHEET_EXT = new Set([".xlsx", ".xls", ".csv"]);
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);
const TEXT_EXT = new Set([".pdf", ".doc", ".docx", ".txt"]);

function iconFor(file: File) {
  const ext = extensionOf(file.name);
  if (SPREADSHEET_EXT.has(ext)) return FileSpreadsheetIcon;
  if (IMAGE_EXT.has(ext)) return FileImageIcon;
  if (TEXT_EXT.has(ext)) return FileTextIcon;
  return FileIcon;
}

function isImage(file: File): boolean {
  return file.type.startsWith("image/") || IMAGE_EXT.has(extensionOf(file.name));
}

// Object URLs for image previews, cached per File and revoked once the file
// leaves the model (or on unmount) so thumbnails don't leak memory.
const previewUrls = new Map<File, string>();

function previewFor(file: File): string | null {
  if (!isImage(file) || typeof URL.createObjectURL !== "function") return null;
  let url = previewUrls.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    previewUrls.set(file, url);
  }
  return url;
}

watch(files, (next) => {
  for (const [file, url] of previewUrls) {
    if (!next.includes(file)) {
      URL.revokeObjectURL(url);
      previewUrls.delete(file);
    }
  }
});

onBeforeUnmount(() => {
  for (const url of previewUrls.values()) URL.revokeObjectURL(url);
  previewUrls.clear();
});

/** Single-file image intake previews inside the drop field itself… */
const inlinePreview = computed(() =>
  !props.multiple && files.value[0] ? previewFor(files.value[0]) : null,
);
/** …so the list below only carries what the field doesn't already show. */
const listedFiles = computed(() => (inlinePreview.value ? [] : files.value));

const dropZoneRef = useTemplateRef<HTMLDivElement>("dropZoneRef");
const inputRef = useTemplateRef<HTMLInputElement>("inputRef");

// `multiple` is read once here — useDropZone's own option isn't reactive.
// The native <input multiple> attribute below IS reactive, and processFiles()
// re-caps to a single file on every call regardless, so a later prop change
// still behaves correctly for both entry paths.
const { isOverDropZone } = useDropZone(dropZoneRef, {
  multiple: props.multiple,
  onDrop: (dropped) => processFiles(dropped ?? []),
});

function openPicker() {
  if (props.disabled) return;
  inputRef.value?.click();
}

function onInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  processFiles(Array.from(target.files ?? []));
  // Reset so picking the exact same file again still fires `change`.
  target.value = "";
}
</script>

<template>
  <div :class="variant === 'compact' ? 'relative min-w-0' : 'space-y-3'">
    <!-- Single root so `class`/`id`/attrs fall through. The remove buttons are SIBLINGS of the
         role="button" drop target (never children): Enter/Space on them must activate them, not
         open the picker, and children of role="button" are presentational to assistive tech. -->
    <template v-if="variant !== 'compact'">
      <div class="relative">
        <div
          ref="dropZoneRef"
          role="button"
          :tabindex="disabled ? -1 : 0"
          :aria-disabled="disabled || undefined"
          :aria-invalid="invalid || undefined"
          :aria-label="t('dropzone.ariaLabel')"
          class="grid place-items-center gap-2 rounded-xl border border-dashed bg-grid px-6 py-8 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          :class="
            disabled
              ? 'pointer-events-none opacity-50'
              : isOverDropZone
                ? 'cursor-pointer border-primary ring-2 ring-primary'
                : invalid
                  ? 'cursor-pointer border-destructive/50 bg-destructive/5'
                  : 'cursor-pointer hover:border-muted-foreground/50'
          "
          @click="openPicker"
          @keydown.enter.prevent="openPicker"
          @keydown.space.prevent="openPicker"
        >
          <!-- Single-image intake: the picked image previews right in the field. -->
          <template v-if="inlinePreview && files[0]">
            <img
              :src="inlinePreview"
              alt=""
              class="size-24 rounded-xl border border-border/60 object-cover shadow-sm"
            />
            <bdi class="w-full max-w-full truncate px-6 text-xs font-medium">{{
              files[0].name
            }}</bdi>
            <p class="text-xs text-muted-foreground">{{ t("dropzone.replace") }}</p>
          </template>
          <template v-else>
            <span class="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
              <UploadCloudIcon class="size-5" aria-hidden="true" />
            </span>
            <p class="text-sm font-medium">{{ t("dropzone.dropHere") }}</p>
            <p class="text-xs text-muted-foreground">{{ t("dropzone.browseHint") }}</p>
          </template>
        </div>
        <Button
          v-if="inlinePreview && files[0]"
          type="button"
          variant="ghost"
          size="icon-xs"
          class="absolute end-2 top-2"
          :disabled="disabled"
          :aria-label="t('dropzone.remove')"
          @click="removeFile(0)"
        >
          <XIcon class="size-3.5" aria-hidden="true" />
        </Button>
      </div>

      <ul v-if="listedFiles.length || rejectedEntries.length" class="space-y-1.5">
        <li
          v-for="(file, index) in listedFiles"
          :key="`accepted-${index}-${file.name}`"
          class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
        >
          <!-- Images carry their own thumbnail; other types keep the type icon. -->
          <img
            v-if="previewFor(file)"
            :src="previewFor(file)!"
            alt=""
            class="size-9 shrink-0 rounded-md border border-border/60 object-cover"
          />
          <component
            v-else
            :is="iconFor(file)"
            class="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <bdi class="min-w-0 flex-1 truncate">{{ file.name }}</bdi>
          <span class="num shrink-0 text-xs text-muted-foreground">{{
            formatSize(file.size)
          }}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            :aria-label="t('dropzone.remove')"
            @click="removeFile(index)"
          >
            <XIcon class="size-3.5" aria-hidden="true" />
          </Button>
        </li>
        <li
          v-for="(entry, index) in rejectedEntries"
          :key="`rejected-${index}-${entry.file.name}`"
          class="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <TriangleAlertIcon class="size-4 shrink-0" aria-hidden="true" />
          <div class="min-w-0 flex-1">
            <bdi class="block truncate">{{ entry.file.name }}</bdi>
            <p class="text-xs">{{ entry.reason }}</p>
          </div>
          <span class="num shrink-0 text-xs">{{ formatSize(entry.file.size) }}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            :aria-label="t('dropzone.remove')"
            @click="removeRejected(index)"
          >
            <XIcon class="size-3.5" aria-hidden="true" />
          </Button>
        </li>
      </ul>
    </template>

    <template v-else>
      <div
        ref="dropZoneRef"
        role="button"
        :tabindex="disabled ? -1 : 0"
        :aria-disabled="disabled || undefined"
        :aria-invalid="invalid || undefined"
        :aria-label="t('dropzone.dropOrBrowse')"
        class="flex h-9 min-w-0 items-center gap-2 rounded-md border border-dashed ps-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        :class="[
          files[0] ? 'pe-10' : 'pe-3',
          disabled
            ? 'pointer-events-none opacity-50'
            : isOverDropZone
              ? 'cursor-pointer border-primary ring-2 ring-primary'
              : invalid || (lastRejected && !files.length)
                ? 'cursor-pointer border-destructive/50 bg-destructive/5 text-destructive'
                : 'cursor-pointer hover:border-muted-foreground/50',
        ]"
        @click="openPicker"
        @keydown.enter.prevent="openPicker"
        @keydown.space.prevent="openPicker"
      >
        <template v-if="files[0]">
          <!-- Images preview as a small thumb; other types show their kind's icon. -->
          <img
            v-if="previewFor(files[0])"
            :src="previewFor(files[0])!"
            alt=""
            class="size-6 shrink-0 rounded border border-border/60 object-cover"
          />
          <component
            v-else
            :is="iconFor(files[0])"
            class="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <bdi class="min-w-0 flex-1 truncate">{{ files[0].name }}</bdi>
          <span class="num shrink-0 text-xs text-muted-foreground">{{
            formatSize(files[0].size)
          }}</span>
        </template>
        <template v-else-if="lastRejected">
          <TriangleAlertIcon class="size-4 shrink-0" aria-hidden="true" />
          <bdi class="min-w-0 truncate">{{ lastRejected.file.name }}</bdi>
          <span class="shrink-0 text-xs">{{ lastRejected.reason }}</span>
        </template>
        <template v-else>
          <UploadCloudIcon class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span class="truncate text-muted-foreground">{{ t("dropzone.dropOrBrowse") }}</span>
        </template>
      </div>
      <Button
        v-if="files[0]"
        type="button"
        variant="ghost"
        size="icon-xs"
        class="absolute end-1.5 top-1/2 -translate-y-1/2"
        :disabled="disabled"
        :aria-label="t('dropzone.remove')"
        @click="removeFile(0)"
      >
        <XIcon class="size-3.5" aria-hidden="true" />
      </Button>
    </template>

    <input
      ref="inputRef"
      type="file"
      class="sr-only"
      tabindex="-1"
      :accept="accept?.join(',')"
      :multiple="multiple"
      :disabled="disabled"
      @click.stop
      @change="onInputChange"
    />
  </div>
</template>
