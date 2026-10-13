<script lang="ts" setup>
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
  XIcon,
} from "@/lib/icons";


import type { ToasterProps } from "vue-sonner"
import { Toaster as Sonner } from "vue-sonner"
// vue-sonner v2 ships its styles separately — without this import every
// toast renders as an invisible unstyled <li>.
import "vue-sonner/style.css"
import { cn } from "@/lib/utils"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
      '--gray2': 'color-mix(in oklab, var(--popover) 90%, transparent)',
      '--gray3': 'var(--border)',
      '--gray4': 'var(--border)',
      '--gray5': 'var(--border)',
      '--gray10': 'var(--muted-foreground)',
      '--gray11': 'var(--muted-foreground)',
      '--gray12': 'var(--popover-foreground)',
      // Typed toasts (rich-colors): soft tinted surfaces in the kit's status
      // hues — same pattern as the badge success/warning variants — instead
      // of sonner's loud solid fills. Icon hue is re-saturated below.
      '--success-bg': 'color-mix(in oklab, var(--success) 14%, var(--popover))',
      '--success-border': 'color-mix(in oklab, var(--success) 40%, var(--border))',
      '--success-text': 'var(--popover-foreground)',
      '--info-bg': 'color-mix(in oklab, var(--chart-2) 14%, var(--popover))',
      '--info-border': 'color-mix(in oklab, var(--chart-2) 40%, var(--border))',
      '--info-text': 'var(--popover-foreground)',
      '--warning-bg': 'color-mix(in oklab, var(--warning) 16%, var(--popover))',
      '--warning-border': 'color-mix(in oklab, var(--warning) 45%, var(--border))',
      '--warning-text': 'var(--popover-foreground)',
      '--error-bg': 'color-mix(in oklab, var(--destructive) 14%, var(--popover))',
      '--error-border': 'color-mix(in oklab, var(--destructive) 40%, var(--border))',
      '--error-text': 'var(--popover-foreground)',
    }"
    v-bind="props"
    :toast-options="{
      classes: {
        toast: 'rounded-2xl',
      },
      ...props.toastOptions,
    }"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>

<style>
/* Toasts teleport to <body>, so these must stay global (no `scoped`).
   The *-text vars above keep the message in the readable foreground; the
   ICON carries the saturated status hue so the toast type reads at a glance.
   info has no dedicated token — it borrows the theme's blue (chart-2) so it
   stays distinct from success's mint. */
[data-sonner-toast][data-type="success"] [data-icon] {
  color: var(--success);
}
[data-sonner-toast][data-type="info"] [data-icon] {
  color: var(--chart-2);
}
[data-sonner-toast][data-type="warning"] [data-icon] {
  color: var(--warning);
}
[data-sonner-toast][data-type="error"] [data-icon] {
  color: var(--destructive);
}
</style>
