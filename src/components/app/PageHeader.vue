<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeftIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { i18n } from "@/lib/i18n";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    breadcrumbs?: { label: string; to?: string }[];
    /** `true` → router/browser back; a string → navigate to that path. */
    back?: string | boolean;
  }>(),
  { description: "", breadcrumbs: undefined, back: undefined },
);

const emit = defineEmits<{ back: [] }>();

const t = i18n.global.t;
const router = useRouter();

// `back` is `string | boolean`, and String precedes Boolean in that union,
// so Vue's bare-attribute boolean casting doesn't kick in — a plain
// `<PageHeader back />` compiles to `back=""`, not `back={true}` (documented
// Vue behavior: https://vuejs.org/guide/components/props.html#boolean-casting).
// Treat the empty string the same as `true` so the natural shorthand works.
const showBack = computed(
  () =>
    props.back === true ||
    props.back === "" ||
    (typeof props.back === "string" && props.back.length > 0),
);

function goBack() {
  emit("back");
  if (typeof props.back === "string" && props.back !== "") router.push(props.back);
  else router.back();
}
</script>

<template>
  <header class="space-y-2">
    <div v-if="breadcrumbs?.length" class="scroll-x max-w-full">
      <Breadcrumb>
        <BreadcrumbList class="flex-nowrap">
          <template v-for="(crumb, index) in breadcrumbs" :key="crumb.label">
            <BreadcrumbItem class="shrink-0">
              <BreadcrumbPage v-if="index === breadcrumbs.length - 1">{{
                crumb.label
              }}</BreadcrumbPage>
              <BreadcrumbLink v-else-if="crumb.to" as-child>
                <RouterLink :to="crumb.to">{{ crumb.label }}</RouterLink>
              </BreadcrumbLink>
              <span v-else>{{ crumb.label }}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" />
          </template>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <!-- Phones: actions sit at the header's end edge beside the title (an
         icon-only CTA there is the sheet's "+" — pages hide the label with
         max-sm:hidden). sm+: the title block and actions share one row. -->
    <div class="flex items-start justify-between gap-3 sm:flex-wrap sm:items-end sm:gap-4">
      <div class="flex min-w-0 flex-1 items-start gap-2.5">
        <Button
          v-if="showBack"
          variant="ghost"
          size="icon-sm"
          class="mt-0.5 shrink-0"
          :aria-label="t('common.back')"
          @click="goBack"
        >
          <ArrowLeftIcon class="size-4 cn-rtl-flip" />
        </Button>
        <div class="min-w-0">
          <!-- #title: a title that is more than text (a document number in .num);
               the `title` prop stays the fallback. -->
          <h1 class="text-xl font-semibold tracking-tight wrap-break-word sm:text-2xl">
            <slot name="title">{{ title }}</slot>
          </h1>
          <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
          <!-- #meta: a detail page's identity lines — status badges, whose it is, when. -->
          <div v-if="$slots.meta" class="mt-2 space-y-1.5" data-testid="page-header-meta">
            <slot name="meta" />
          </div>
        </div>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
