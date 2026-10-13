<script lang="ts" setup>
import { MoreHorizontalIcon } from "@/lib/icons";

import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <span
    data-slot="breadcrumb-ellipsis"
    role="presentation"
    aria-hidden="true"
    :class="cn('size-5 [&>svg]:size-4 flex items-center justify-center', props.class)"
  >
    <slot>
      <MoreHorizontalIcon />
    </slot>
    <span class="sr-only">{{ t("common.more") }}</span>
  </span>
</template>
