<script setup lang="ts">
import { MoonStarIcon, SunIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/composables/useTheme";
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

const { mode, toggle } = useTheme();
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button variant="ghost" size="icon" :aria-label="t('theme.toggle')" @click="toggle">
        <SunIcon v-if="mode === 'dark'" class="size-4" />
        <MoonStarIcon v-else class="size-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>{{ mode === "dark" ? t("theme.light") : t("theme.dark") }}</TooltipContent>
  </Tooltip>
</template>
