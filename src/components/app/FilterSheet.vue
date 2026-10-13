<script setup lang="ts">
import { ref } from "vue";
import { SlidersHorizontalIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { i18n } from "@/lib/i18n";

/**
 * A list's filters on a small screen: the "Filters" button (with the count of
 * active ones) and the bottom sheet it opens — the default slot is the host's
 * filter fields in their stacked layout. Nothing is deferred: edits apply as
 * they are made, "show results" only closes. The host hides the button where
 * its fields fit inline (`class="lg:hidden"`).
 */
defineOptions({ inheritAttrs: false });
defineProps<{ count: number }>();
const emit = defineEmits<{ clear: [] }>();

const open = ref(false);
</script>

<template>
  <Button
    v-bind="$attrs"
    variant="outline"
    class="shrink-0"
    data-testid="filters-open"
    @click="open = true"
  >
    <SlidersHorizontalIcon class="size-4" aria-hidden="true" />
    {{ i18n.global.t("common.filters") }}
    <Badge v-if="count" variant="default" class="num">{{ count }}</Badge>
  </Button>
  <Sheet v-model:open="open">
    <SheetContent
      side="bottom"
      :aria-describedby="undefined"
      class="flex max-h-[88svh] flex-col gap-0 rounded-t-2xl p-0"
    >
      <SheetHeader class="border-b px-4 py-4 pe-12">
        <SheetTitle>{{ i18n.global.t("common.filters") }}</SheetTitle>
      </SheetHeader>
      <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <slot />
      </div>
      <SheetFooter class="flex-row gap-2 border-t">
        <Button v-if="count" variant="outline" class="flex-1" @click="emit('clear')">
          {{ i18n.global.t("common.clearFilters") }}
        </Button>
        <Button class="flex-1" @click="open = false">{{
          i18n.global.t("common.showResults")
        }}</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
