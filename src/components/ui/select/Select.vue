<script setup lang="ts">
import type { SelectRootEmits, SelectRootProps } from "reka-ui"
import { SelectRoot, useForwardPropsEmits } from "reka-ui"
import { i18n } from "@/lib/i18n"

const props = defineProps<SelectRootProps>()
const emits = defineEmits<SelectRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <!-- Kit: keyed on the locale. reka's SelectItemText copies the selected
       item's text into the trigger once on mount, so a language switch would
       leave the old label behind; remounting re-reads it. Labels that change
       for any other reason still need a caller-side :key. -->
  <SelectRoot
    :key="i18n.global.locale.value"
    v-slot="slotProps"
    data-slot="select"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </SelectRoot>
</template>
