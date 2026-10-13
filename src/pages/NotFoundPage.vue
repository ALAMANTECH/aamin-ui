<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { HomeIcon, MapPinnedIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";

// Rendered inside BlankLayout, which owns the LocaleToggle · ThemeToggle corner.
const { t } = useI18n();
</script>

<template>
  <div class="relative grid min-h-dvh place-items-center bg-grid px-4">
    <div class="absolute inset-0 bg-halo" aria-hidden="true" />

    <div class="relative w-full max-w-md text-center">
      <span
        class="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary glow-primary"
      >
        <MapPinnedIcon class="size-6" aria-hidden="true" />
      </span>

      <p class="num mt-6 text-6xl font-bold tracking-tight text-foreground">404</p>
      <h1 class="mt-3 text-xl font-semibold">{{ t("notFound.title") }}</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        {{ t("notFound.description") }}
      </p>

      <Button as-child class="mt-6">
        <RouterLink to="/">
          <HomeIcon class="size-4" aria-hidden="true" />
          {{ t("notFound.backHome") }}
        </RouterLink>
      </Button>
    </div>
  </div>
</template>
