<script setup lang="ts">
import { MoreHorizontalIcon } from "@/lib/icons";

import type { PaginationEllipsisProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { PaginationEllipsis } from "reka-ui"
import { cn } from "@/lib/utils"
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

const props = defineProps<PaginationEllipsisProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <PaginationEllipsis
    data-slot="pagination-ellipsis"
    v-bind="delegatedProps"
    :class="cn('size-8 [&_svg:not([class*=size-])]:size-4 flex items-center justify-center', props.class)"
  >
    <slot>
      <MoreHorizontalIcon />
      <span class="sr-only">{{ t("pagination.more") }}</span>
    </slot>
  </PaginationEllipsis>
</template>
