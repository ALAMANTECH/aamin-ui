<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useBreakpoints, useStorage } from "@vueuse/core";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import AppSidebar from "@/components/app/AppSidebar.vue";
import AppTopbar from "@/components/app/AppTopbar.vue";
import { useDir } from "@/composables/useDir";

const { dir } = useDir();
const breakpoints = useBreakpoints({ lg: 1024 });
const isDesktop = breakpoints.greaterOrEqual("lg");

const collapsed = useStorage("aamin-ui-sidebar-collapsed", false);
const mobileOpen = ref(false);

// Real scroll reset: the document never scrolls (root is h-dvh/overflow-hidden),
// so <main> is the only scroll container and vue-router's scrollBehavior (which
// targets window) can't reset it. Reset the container after each navigation
// resolves. `nextTick` lets the route render settle first; the swap runs under
// <Transition mode="out-in"> so the new page enters at the top. In-page hash
// jumps are handled by scrollBehavior's `el` case in router.ts and skipped here
// (same route path => no reset).
const scroller = ref<HTMLElement | null>(null);
const router = useRouter();

const stopAfterEach = router.afterEach((to, from) => {
  if (to.path === from.path) return;
  nextTick(() => scroller.value?.scrollTo({ top: 0 }));
});
onBeforeUnmount(stopAfterEach);

function toggleSidebar() {
  if (isDesktop.value) {
    collapsed.value = !collapsed.value;
  } else {
    mobileOpen.value = !mobileOpen.value;
  }
}
</script>

<template>
  <div class="flex h-dvh overflow-hidden">
    <!-- Desktop sidebar -->
    <aside
      v-if="isDesktop"
      class="shrink-0 border-e border-sidebar-border transition-[width] duration-200"
      :class="collapsed ? 'w-[68px]' : 'w-64'"
    >
      <AppSidebar :collapsed="collapsed" />
    </aside>

    <!-- Mobile drawer -->
    <Sheet v-else v-model:open="mobileOpen">
      <!-- The drawer enters from the sidebar's side: start of the reading direction -->
      <SheetContent
        :side="dir === 'rtl' ? 'right' : 'left'"
        class="w-72 max-w-[85vw] p-0"
        aria-describedby=""
      >
        <AppSidebar @click="mobileOpen = false" />
      </SheetContent>
    </Sheet>

    <!-- Content column -->
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <!-- A product's notification bell goes in AppTopbar's #notifications slot:
           <AppTopbar …><template #notifications><YourBell /></template></AppTopbar> -->
      <AppTopbar :is-desktop="isDesktop" @toggle-sidebar="toggleSidebar" />
      <!-- relative: <main> must be the containing block of everything inside
           it. An absolutely-positioned descendant with no positioned ancestor
           (an sr-only input) is laid out against the document instead, escapes
           this scroller's clipping and makes the PAGE scroll too.
           stable both-edges: classic (non-overlay) scrollbars reserve equal
           space on BOTH sides, so the content column stays centered under the
           full-width topbar instead of shifting away from the scrollbar side.
           Phone gutter is px-3 — DataTable's phone full-bleed (-mx-3) relies on it. -->
      <main
        ref="scroller"
        class="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-halo [scrollbar-gutter:stable_both-edges]"
      >
        <div
          class="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-8 md:py-8 md:pb-[max(2rem,env(safe-area-inset-bottom))]"
        >
          <RouterView v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
}
</style>
