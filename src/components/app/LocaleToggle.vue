<script setup lang="ts">
import { computed } from "vue";
import { LanguagesIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocale } from "@/composables/useLocale";
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;
const { locale, locales, set, toggle } = useLocale();

// With two locales the button just flips; its tooltip names the language
// you'd switch TO. Labels are each language's own name — never translated.
const other = computed(() => locales.find((l) => l.code !== locale.value) ?? locales[0]!);

function onSelect(code: unknown) {
  if (typeof code === "string") set(code);
}
</script>

<template>
  <Tooltip v-if="locales.length === 2">
    <TooltipTrigger as-child>
      <Button variant="ghost" size="icon" :aria-label="t('language.toggle')" @click="toggle">
        <LanguagesIcon class="size-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent :lang="other.code">{{ other.label }}</TooltipContent>
  </Tooltip>

  <!-- 3+ locales: a menu. No Tooltip around the trigger (nested reka triggers misbehave).
       A single-language app renders nothing — there is nowhere to switch to. -->
  <DropdownMenu v-else-if="locales.length > 2">
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" :aria-label="t('language.toggle')">
        <LanguagesIcon class="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuRadioGroup :model-value="locale" @update:model-value="onSelect">
        <DropdownMenuRadioItem v-for="l in locales" :key="l.code" :value="l.code" :lang="l.code">
          {{ l.label }}
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
