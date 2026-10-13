<script setup lang="ts">
import { RouterView } from "vue-router";
import { ConfigProvider } from "reka-ui";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/composables/useTheme";
import { useDir } from "@/composables/useDir";
import { useLocale } from "@/composables/useLocale";

// Applied globally once; toggles live in the topbar.
useTheme();
// Locale owns direction: importing useLocale registers the single effect that
// syncs i18n, useDir and <html lang dir> before the first render.
useLocale();
// ConfigProvider feeds the direction to every reka-ui primitive — without it
// they render with an explicit dir="ltr" and silently flip their subtrees.
const { dir } = useDir();
</script>

<template>
  <ConfigProvider :dir="dir">
    <TooltipProvider :delay-duration="200">
      <RouterView />
    </TooltipProvider>
    <!-- Toasts rise from the inline-end corner in either direction -->
    <Toaster :position="dir === 'rtl' ? 'bottom-left' : 'bottom-right'" rich-colors />
  </ConfigProvider>
</template>
