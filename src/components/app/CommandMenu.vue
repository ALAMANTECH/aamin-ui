<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMagicKeys, whenever } from "@vueuse/core";
import { MoonStarIcon, SearchIcon } from "@/lib/icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { navGroups } from "@/lib/nav";
import { useTheme } from "@/composables/useTheme";
import Kbd from "@/components/app/Kbd.vue";
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

const open = ref(false);
const router = useRouter();
const { toggle: toggleTheme } = useTheme();

// passive: false + preventDefault so ⌘K/Ctrl+K opens the palette instead of
// the browser's address/search bar (Firefox + Chromium-on-Windows bind Ctrl+K).
const keys = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey) && e.type === "keydown")
      e.preventDefault();
  },
});
whenever(keys["Meta+K"]!, () => (open.value = true));
whenever(keys["Ctrl+K"]!, () => (open.value = true));

function go(to: string) {
  open.value = false;
  router.push(to);
}
</script>

<template>
  <Button
    variant="outline"
    class="h-9 w-56 justify-between gap-2 text-muted-foreground font-normal max-md:hidden"
    @click="open = true"
  >
    <span class="flex items-center gap-2">
      <SearchIcon class="size-4" />
      {{ t("command.quickSearch") }}
    </span>
    <Kbd>⌘K</Kbd>
  </Button>
  <Button
    variant="ghost"
    size="icon"
    class="md:hidden"
    :aria-label="t('command.quickSearchAria')"
    @click="open = true"
  >
    <SearchIcon class="size-4" />
  </Button>

  <CommandDialog v-model:open="open">
    <CommandInput :placeholder="t('command.placeholder')" />
    <CommandList>
      <CommandEmpty>{{ t("command.empty") }}</CommandEmpty>
      <CommandGroup v-for="group in navGroups" :key="group.label" :heading="t(group.label)">
        <CommandItem
          v-for="item in group.items"
          :key="item.to"
          :value="t(item.title)"
          @select="go(item.to)"
        >
          <component :is="item.icon" class="size-4" />
          {{ t(item.title) }}
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup :heading="t('command.commands')">
        <CommandItem
          :value="t('command.toggleTheme')"
          @select="
            () => {
              toggleTheme();
              open = false;
            }
          "
        >
          <MoonStarIcon class="size-4" />
          {{ t("command.toggleTheme") }}
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>
