<script setup lang="ts">
import { ChevronsLeftIcon } from "@/lib/icons";

import type { PaginationFirstProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from '@/components/ui/button'
import { reactiveOmit } from "@vueuse/core"
import { PaginationFirst, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants } from '@/components/ui/button'
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

const props = withDefaults(defineProps<PaginationFirstProps & {
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
}>(), {
  size: "default",
})

const delegatedProps = reactiveOmit(props, "class", "size")
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <PaginationFirst
    data-slot="pagination-first"
    :aria-label="t('datatable.firstPage')"
    :class="cn(buttonVariants({ variant: 'ghost', size }), '', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <ChevronsLeftIcon data-icon="inline-start" class="cn-rtl-flip" />
      <span class="hidden sm:block">{{ t("pagination.first") }}</span>
    </slot>
  </PaginationFirst>
</template>
