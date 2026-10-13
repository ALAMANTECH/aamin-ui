<script setup lang="ts">
import { RouterView } from "vue-router";
import ThemeToggle from "@/components/app/ThemeToggle.vue";
import LocaleToggle from "@/components/app/LocaleToggle.vue";
</script>

<template>
  <!-- Layout for full-screen pages (login, 404) rendered without the dashboard
       shell. Standard placement, same in every project: the top-end corner
       holds LocaleToggle · ThemeToggle — don't move it, don't re-add the
       toggles inside the page itself. -->
  <div class="relative min-h-dvh">
    <div
      class="absolute end-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center gap-1"
    >
      <div data-shell-slot="locale"><LocaleToggle /></div>
      <div data-shell-slot="theme"><ThemeToggle /></div>
    </div>

    <RouterView />
  </div>
</template>
