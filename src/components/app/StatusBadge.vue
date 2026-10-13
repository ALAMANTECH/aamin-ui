<script setup lang="ts">
import { computed } from "vue";
import { Badge, type BadgeVariants } from "@/components/ui/badge";
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

type Variant = NonNullable<BadgeVariants["variant"]>;

export interface StatusMeta {
  variant: Variant;
  /** Optional display override; defaults to `status.<code>` or the raw string. */
  label?: string;
}

const props = withDefaults(
  defineProps<{
    status: string;
    /** Extends (not replaces) the default domain map. */
    map?: Record<string, StatusMeta>;
  }>(),
  { map: undefined },
);

// Default mapping, keyed by canonical English status codes. Labels come from
// `status.<code>` in the locale files, so they follow the UI language. Callers
// pass `map` to add or override entries for their own screens (retailers, POS,
// marketers, …); a status with no `status.<code>` key renders as the raw string.
const defaultMap: Record<string, StatusMeta> = {
  completed: { variant: "success" },
  pending: { variant: "warning" },
  rejected: { variant: "destructive" },
  active: { variant: "success" },
  enabled: { variant: "success" },
  suspended: { variant: "destructive" },
};

const resolved = computed<StatusMeta>(
  () => ({ ...defaultMap, ...props.map })[props.status] ?? { variant: "secondary" },
);

const label = computed(() => {
  const key = `status.${props.status}`;
  return resolved.value.label ?? (i18n.global.te(key) ? t(key) : props.status);
});
</script>

<template>
  <Badge :variant="resolved.variant" class="gap-1.5">
    <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    {{ label }}
  </Badge>
</template>
