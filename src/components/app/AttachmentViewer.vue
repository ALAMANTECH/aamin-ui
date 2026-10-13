<script lang="ts">
const SAFE_PROTOCOLS = new Set(["https:", "http:", "blob:"]);

/**
 * Whether `url` may go into an `<img src>` / `<iframe src>` / `<a href>`.
 * Only http(s) and blob: (relative URLs resolve to the page's own origin);
 * `data:` passes for image attachments only, and only as `data:image/*`.
 * Everything else — `javascript:`, `vbscript:`, `data:text/html`… — is refused.
 */
export function isSafeAttachmentUrl(url: string, mime: string): boolean {
  let protocol: string;
  try {
    protocol = new URL(url, window.location.href).protocol;
  } catch {
    return false;
  }
  if (SAFE_PROTOCOLS.has(protocol)) return true;
  return protocol === "data:" && mime.startsWith("image/") && /^\s*data:image\//i.test(url);
}

export interface Attachment {
  id: string | number;
  /** Display name (shown isolated in a <bdi>). */
  name: string;
  url: string;
  mime: string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, FileTextIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDir } from "@/composables/useDir";
import { i18n } from "@/lib/i18n";

/**
 * In-app attachment viewer: a press on a thumbnail or file chip opens it here
 * instead of a new tab. Images and PDFs render in the stage; anything else
 * (Word, Excel, text) has no in-browser rendering, so the stage says so and
 * the "open in a new tab" link — always in the footer — is the way through.
 * URLs are vetted first (isSafeAttachmentUrl): an unsafe one renders nothing
 * from the URL — no preview, and the footer says "open in a new tab" with no link.
 * PDF is decided by `mime === "application/pdf"` only, never by the filename.
 * `attachments` is the set the press came from and `v-model` the id on show
 * (null = closed); the arrow buttons and ←/→ walk that set, wrapping.
 */
const props = defineProps<{ attachments: Attachment[] }>();
const activeId = defineModel<string | number | null>({ default: null });

const t = i18n.global.t;
const { dir } = useDir();

const index = computed(() => props.attachments.findIndex((a) => a.id === activeId.value));
const current = computed<Attachment | null>(() => props.attachments[index.value] ?? null);
const many = computed(() => props.attachments.length > 1);

const safe = computed(
  () => current.value !== null && isSafeAttachmentUrl(current.value.url, current.value.mime),
);
const isImage = computed(() => safe.value && current.value?.mime.startsWith("image/") === true);
const isPdf = computed(() => safe.value && current.value?.mime === "application/pdf");

function step(by: 1 | -1) {
  const count = props.attachments.length;
  if (index.value === -1 || count < 2) return;
  activeId.value = props.attachments[(index.value + by + count) % count]!.id;
}

/** The arrow pointing the way the text runs is "next" — so the pair swaps with the direction. */
function onKeydown(e: KeyboardEvent) {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  e.preventDefault();
  const forward = dir.value === "rtl" ? "ArrowLeft" : "ArrowRight";
  step(e.key === forward ? 1 : -1);
}
</script>

<template>
  <Dialog :open="current !== null" @update:open="(open: boolean) => !open && (activeId = null)">
    <DialogContent class="gap-0 overflow-hidden p-0 sm:max-w-3xl sm:p-0" @keydown="onKeydown">
      <template v-if="current">
        <div class="border-b border-border py-3 ps-4 pe-12">
          <DialogTitle class="truncate text-sm font-medium">
            <bdi>{{ current.name }}</bdi>
          </DialogTitle>
          <DialogDescription class="truncate text-xs text-muted-foreground">
            <bdi>{{ current.mime }}</bdi>
            <template v-if="many">
              · <span class="num">{{ index + 1 }} / {{ attachments.length }}</span>
            </template>
          </DialogDescription>
        </div>

        <div class="relative grid h-[60dvh] place-items-center bg-muted/30">
          <img
            v-if="isImage"
            :key="current.id"
            :src="current.url"
            :alt="current.name"
            class="max-h-[60dvh] max-w-full object-contain"
          />
          <iframe
            v-else-if="isPdf"
            :key="`pdf-${current.id}`"
            :src="current.url"
            :title="current.name"
            class="size-full"
          />
          <div
            v-else
            class="flex flex-col items-center gap-3 px-6 text-center text-muted-foreground"
          >
            <span class="grid size-14 place-items-center rounded-xl bg-muted">
              <FileTextIcon class="size-6" aria-hidden="true" />
            </span>
            <p class="text-sm">{{ t("attachments.noPreview") }}</p>
          </div>

          <template v-if="many">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  class="absolute start-2 top-1/2 -translate-y-1/2 rounded-full shadow-md"
                  :aria-label="t('attachments.prev')"
                  @click="step(-1)"
                >
                  <ChevronLeftIcon class="size-4 cn-rtl-flip" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{{ t("attachments.prev") }}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  class="absolute end-2 top-1/2 -translate-y-1/2 rounded-full shadow-md"
                  :aria-label="t('attachments.next')"
                  @click="step(1)"
                >
                  <ChevronRightIcon class="size-4 cn-rtl-flip" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{{ t("attachments.next") }}</TooltipContent>
            </Tooltip>
          </template>
        </div>

        <div class="flex justify-end border-t border-border px-4 py-3">
          <Button v-if="safe" as-child variant="outline" size="sm">
            <a :href="current.url" target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon class="size-3.5 cn-rtl-flip" aria-hidden="true" />
              {{ t("attachments.openInTab") }}
            </a>
          </Button>
          <!-- Unsafe URL: say how it would open, but never link it. -->
          <Button v-else variant="outline" size="sm" disabled>
            <ExternalLinkIcon class="size-3.5 cn-rtl-flip" aria-hidden="true" />
            {{ t("attachments.openInTab") }}
          </Button>
        </div>
      </template>
    </DialogContent>
  </Dialog>
</template>
