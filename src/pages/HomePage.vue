<script setup lang="ts">
// The template's only app page — a blank starting point. Real projects
// replace this with their first screen; the demo/recipe pages live under
// src/pages/reference/ and are routed only in dev (see router.ts), and only when
// installed (`@aamin/reference` is optional) — hence the `hasReference` gate.
import { useI18n } from "vue-i18n";
import { BookOpenIcon, RocketIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/app/EmptyState.vue";
import PageHeader from "@/components/app/PageHeader.vue";
import { hasReference } from "@/lib/nav";

const { t } = useI18n();
const showReference = import.meta.env.DEV && hasReference;
</script>

<template>
  <div class="space-y-6">
    <PageHeader :title="t('home.title')" :description="t('home.description')" />

    <EmptyState :icon="RocketIcon" :title="t('home.emptyTitle')" :hint="t('home.emptyHint')">
      <Button v-if="showReference" variant="outline" size="sm" as-child>
        <RouterLink to="/reference/components">
          <BookOpenIcon class="size-3.5" aria-hidden="true" />
          {{ t("home.reference") }}
        </RouterLink>
      </Button>
    </EmptyState>
  </div>
</template>
