<script lang="ts" setup>
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <nav
    :aria-label="t('breadcrumb.label')"
    data-slot="breadcrumb"
    :class="cn('', props.class)"
  >
    <slot />
  </nav>
</template>
