<script setup lang="ts">
import { Card } from "@/components/ui/card";

withDefaults(
  defineProps<{
    /** Anchor id used by the sticky TOC. */
    sectionId: string;
    title: string;
    /** One-line usage guidance shown under the title. */
    hint?: string;
  }>(),
  { hint: "" },
);
</script>

<template>
  <section :id="sectionId" class="scroll-mt-16 space-y-3">
    <div>
      <h2 class="text-lg font-semibold tracking-tight">{{ title }}</h2>
      <p v-if="hint" class="mt-0.5 text-sm text-muted-foreground">{{ hint }}</p>
    </div>
    <Card class="p-6">
      <!-- Plain-flow wrapper so lone buttons keep their natural width inside the flex card. -->
      <div>
        <slot />
      </div>
    </Card>
  </section>
</template>
