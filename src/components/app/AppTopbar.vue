<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LogOutIcon, MenuIcon, PanelRightIcon, UserRoundIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CommandMenu from "./CommandMenu.vue";
import ThemeToggle from "./ThemeToggle.vue";
import LocaleToggle from "./LocaleToggle.vue";
import { i18n } from "@/lib/i18n";

const t = i18n.global.t;

defineProps<{
  /** `lg` and up: the sidebar is a persistent rail, so the button collapses it. Below: it opens the drawer. */
  isDesktop?: boolean;
}>();

defineEmits<{ (e: "toggle-sidebar"): void }>();

const route = useRoute();
const router = useRouter();

const pageTitle = computed(() => (route.meta.titleKey ? t(route.meta.titleKey) : undefined));
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-[calc(4rem+env(safe-area-inset-top))] shrink-0 items-center gap-2 border-b bg-background/80 ps-1 pe-3 pt-[env(safe-area-inset-top)] backdrop-blur-md sm:gap-3 sm:ps-2 sm:pe-4 md:ps-6 md:pe-8"
  >
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="shrink-0"
          :aria-label="isDesktop ? t('topbar.toggleSidebar') : t('topbar.openMenu')"
          @click="$emit('toggle-sidebar')"
        >
          <PanelRightIcon v-if="isDesktop" class="size-4 ltr:-scale-x-100" />
          <MenuIcon v-else class="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ isDesktop ? t("topbar.sidebar") : t("topbar.menu") }}</TooltipContent>
    </Tooltip>

    <!-- Phone / tablet: the page title; breadcrumbs take over from lg. -->
    <p v-if="pageTitle" class="min-w-0 flex-1 truncate text-sm font-medium lg:hidden">
      {{ pageTitle }}
    </p>

    <Breadcrumb class="hidden min-w-0 lg:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink as-child>
            <RouterLink to="/">{{ t("nav.home") }}</RouterLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <template v-if="route.path !== '/' && pageTitle">
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{{ pageTitle }}</BreadcrumbPage>
          </BreadcrumbItem>
        </template>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- End cluster — fixed order in every project (don't fork, don't move):
         [notifications slot] · LocaleToggle · ThemeToggle · user menu -->
    <div class="ms-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5">
      <CommandMenu />

      <div v-if="$slots.notifications" data-shell-slot="notifications" class="flex items-center">
        <slot name="notifications" />
      </div>
      <div data-shell-slot="locale" class="flex items-center"><LocaleToggle /></div>
      <div data-shell-slot="theme" class="flex items-center"><ThemeToggle /></div>

      <div data-shell-slot="user" class="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              class="ms-1 grid size-8 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-ring"
              :aria-label="t('topbar.userMenu')"
            >
              {{ t("shell.user.initials") }}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-52">
            <DropdownMenuLabel>
              <p class="text-sm font-medium">{{ t("shell.user.name") }}</p>
              <p class="text-xs font-normal text-muted-foreground">{{ t("shell.user.email") }}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @select="router.push('/profile')">
              <UserRoundIcon class="size-4" />
              {{ t("nav.profile") }}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" @select="router.push('/login')">
              <LogOutIcon class="size-4" />
              {{ t("auth.logout") }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
