<script setup lang="ts">
import type { ComboboxTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ComboboxTrigger, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

const props = defineProps<ComboboxTriggerProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <ComboboxTrigger
    data-slot="combobox-trigger"
    :aria-label="t('combobox.open')"
    v-bind="forwarded"
    :class="cn('[&_svg:not([class*=size-])]:size-4', props.class)"
    tabindex="0"
  >
    <slot />
  </ComboboxTrigger>
</template>
