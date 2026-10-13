<script setup lang="ts">
import { ChevronRightIcon } from "@/lib/icons";

import type { PaginationNextProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from '@/components/ui/button'
import { reactiveOmit } from "@vueuse/core"
import { PaginationNext, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants } from '@/components/ui/button'
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

const props = withDefaults(defineProps<PaginationNextProps & {
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
}>(), {
  size: "default",
})

const delegatedProps = reactiveOmit(props, "class", "size")
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <PaginationNext
    data-slot="pagination-next"
    :aria-label="t('datatable.nextPage')"
    :class="cn(buttonVariants({ variant: 'ghost', size }), 'pe-1.5!', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <span class="hidden sm:block">{{ t("pagination.next") }}</span>
      <ChevronRightIcon data-icon="inline-end" class="cn-rtl-flip" />
    </slot>
  </PaginationNext>
</template>
