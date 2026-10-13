<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  ArrowLeftRightIcon,
  CreditCardIcon,
  EllipsisIcon,
  FileDownIcon,
  FileTextIcon,
  HandCoinsIcon,
  InboxIcon,
  PencilIcon,
  Trash2Icon,
  WalletIcon,
} from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Amount from "@/components/app/Amount.vue";
import DocNo from "@/components/app/DocNo.vue";
import EmptyState from "@/components/app/EmptyState.vue";
import MoneyFigure from "@/components/app/MoneyFigure.vue";
import PageHeader from "@/components/app/PageHeader.vue";
import StatCard from "@/components/app/StatCard.vue";
import StatusBadge from "@/components/app/StatusBadge.vue";
import { formatDateYmd } from "@/lib/datetime";

/**
 * DETAIL PAGE TEMPLATE — copy this file to start an entity's page.
 * Anatomy (measured from the production Aamin dashboard; see docs/pages.md):
 *   page stack `space-y-6` · PageHeader with `back` + breadcrumbs from the nav
 *   root + `#meta` (badges row, then a `text-xs` muted who/when line) +
 *   `#actions` recipe (ONE glow-primary · two everyday outline actions from md
 *   up · the rest behind "More", where phones also find the everyday two) ·
 *   body `space-y-4`: StatCard grid `gap-3 sm:grid-cols-2 xl:grid-cols-4` →
 *   Tabs riding `?tab=` → `pt-4` panels of section cards.
 * `data-anatomy` attributes only feed the /reference/page-anatomy overlay —
 * delete them in your copy, along with `previewState`.
 */
type PreviewState = "ready" | "loading" | "refreshing" | "error" | "empty";
const props = withDefaults(defineProps<{ previewState?: PreviewState }>(), {
  previewState: undefined,
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const LIST_PATH = "/reference/templates/list";

/* ---- Data — replace this block with your fetch (useApi / composable). ---- */
const SAMPLE = {
  code: "ACC-01043",
  name: "templates.sample.names.harbor",
  currency: "LYD" as const,
  status: "active",
  createdAt: "2026-03-14T09:30:00Z",
  balance: 18432.75,
  outstanding: 6210.5,
  advance: 1250,
  payments: 37,
};
const account = ref<typeof SAMPLE | null>(null);
const isInitialLoading = ref(false);
const failed = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

function show(state: PreviewState) {
  account.value = state === "loading" || state === "error" ? null : SAMPLE;
  isInitialLoading.value = state === "loading";
  failed.value = state === "error";
}

function refresh() {
  clearTimeout(timer);
  show("loading");
  timer = setTimeout(() => show(props.previewState ?? "ready"), 600);
}

watch(
  () => props.previewState,
  (state) => {
    clearTimeout(timer);
    if (state) show(state);
    else refresh();
  },
  { immediate: true },
);
onBeforeUnmount(() => clearTimeout(timer));
/* -------------------------------------------------------------------------- */

const name = computed(() => (account.value ? t(account.value.name) : t("templates.detail.title")));
const unit = computed(() => t(`templates.unit.${SAMPLE.currency}`));

/* ---- Tabs, in the URL: `?tab=` (the default tab leaves it out) ---- */
const TABS = ["overview", "activity", "documents"] as const;
type Tab = (typeof TABS)[number];
const DEFAULT_TAB: Tab = "overview";
const parseTab = (value: unknown): Tab =>
  TABS.includes(value as Tab) ? (value as Tab) : DEFAULT_TAB;

const tab = ref<Tab>(parseTab(route.query.tab));
function setTab(value: unknown) {
  tab.value = parseTab(value);
}
watch(tab, (value) => {
  if (parseTab(route.query.tab) === value) return;
  const query = { ...route.query };
  if (value === DEFAULT_TAB) delete query.tab;
  else query.tab = value;
  void router.replace({ query });
});
// A link to ?tab=… (or back / forward) moves the tabs too.
watch(
  () => route.query.tab,
  (value) => {
    const next = parseTab(value);
    if (next !== tab.value) tab.value = next;
  },
);

/* ---- Section cards: label/value fact rows ---- */
interface FactRow {
  label: string;
  /** One value per row: a document code, a digit run, money, or plain text. */
  code?: string;
  num?: string;
  money?: number;
  text?: string;
}
const facts = computed<{ title: string; rows: FactRow[] }[]>(() => [
  {
    title: t("templates.detail.sections.identity"),
    rows: [
      { label: t("templates.list.columns.code"), code: SAMPLE.code },
      { label: t("templates.list.columns.currency"), text: unit.value },
      { label: t("templates.detail.fields.opened"), num: formatDateYmd(SAMPLE.createdAt) },
    ],
  },
  {
    title: t("templates.detail.sections.balances"),
    rows: [
      { label: t("templates.list.columns.balance"), money: SAMPLE.balance },
      { label: t("templates.list.columns.outstanding"), money: SAMPLE.outstanding },
      { label: t("templates.detail.stats.advance"), money: SAMPLE.advance },
    ],
  },
]);

const activity = computed(() => [
  {
    id: 1,
    label: t("templates.detail.activity.payment"),
    date: "2026-09-27T08:10:00Z",
    amount: 1500,
  },
  {
    id: 2,
    label: t("templates.detail.activity.invoice"),
    date: "2026-09-21T12:40:00Z",
    amount: 4210.5,
  },
  {
    id: 3,
    label: t("templates.detail.activity.payment"),
    date: "2026-09-12T10:05:00Z",
    amount: 2000,
  },
]);
</script>

<template>
  <div class="space-y-6" data-anatomy="page">
    <PageHeader
      :title="name"
      :back="LIST_PATH"
      :breadcrumbs="[
        { label: t('nav.home'), to: '/' },
        { label: t('templates.list.title'), to: LIST_PATH },
        { label: name },
      ]"
      data-anatomy="header"
    >
      <!-- #meta: who it is (badges), then whose / when in a muted text-xs line. -->
      <template v-if="account" #meta>
        <div class="flex flex-wrap items-center gap-2">
          <StatusBadge :status="account.status" />
          <Badge variant="outline" class="font-normal">{{ unit }}</Badge>
        </div>
        <p class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
          <DocNo :value="account.code" />
          <span aria-hidden="true">·</span>
          <span>{{ t("templates.detail.fields.opened") }}</span>
          <span class="num">{{ formatDateYmd(account.createdAt) }}</span>
        </p>
      </template>

      <!-- #actions recipe: the ONE glow-primary, two everyday actions from md
           up, the rest (plus those two on a phone) behind "More". -->
      <template v-if="account" #actions>
        <div class="flex items-center gap-2">
          <Button class="glow-primary" :aria-label="t('templates.detail.actions.primary')">
            <HandCoinsIcon class="size-4" aria-hidden="true" />
            <span class="max-sm:hidden">{{ t("templates.detail.actions.primary") }}</span>
          </Button>
          <Button variant="outline" class="max-md:hidden">
            <FileDownIcon class="size-4" aria-hidden="true" />
            {{ t("templates.detail.actions.statement") }}
          </Button>
          <Button variant="outline" class="max-md:hidden">
            <ArrowLeftRightIcon class="size-4" aria-hidden="true" />
            {{ t("templates.detail.actions.transfer") }}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="icon" :aria-label="t('common.more')">
                <EllipsisIcon aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <!-- On a phone the two everyday actions live here too. -->
              <DropdownMenuItem class="md:hidden">
                <FileDownIcon class="size-4" />
                {{ t("templates.detail.actions.statement") }}
              </DropdownMenuItem>
              <DropdownMenuItem class="md:hidden">
                <ArrowLeftRightIcon class="size-4" />
                {{ t("templates.detail.actions.transfer") }}
              </DropdownMenuItem>
              <DropdownMenuSeparator class="md:hidden" />
              <DropdownMenuItem>
                <PencilIcon class="size-4" />
                {{ t("common.edit") }}
              </DropdownMenuItem>
              <!-- Destructive goes last, after a separator. -->
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2Icon class="size-4" />
                {{ t("common.delete") }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </template>
    </PageHeader>

    <!-- First load: the page's final shape — four figures, the tabs, a panel. -->
    <div v-if="isInitialLoading" class="space-y-4" data-testid="detail-loading">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton v-for="n in 4" :key="n" class="h-28 w-full" />
      </div>
      <Skeleton class="h-9 w-72 max-w-full" />
      <Skeleton class="h-64 w-full" />
    </div>

    <EmptyState
      v-else-if="failed && !account"
      state="error"
      :title="t('templates.states.loadFailed')"
      :error-message="t('templates.states.loadFailedHint')"
      data-testid="detail-error"
      @retry="refresh()"
    />

    <div v-else-if="account" class="space-y-4" data-anatomy="body">
      <!-- Where it stands -->
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-anatomy="stat-grid">
        <StatCard
          :label="t('templates.list.columns.balance')"
          :value="String(account.balance)"
          :unit="unit"
          :icon="WalletIcon"
        >
          <template #footer>
            <Badge variant="success" class="font-normal">{{
              t("templates.detail.stats.inCredit")
            }}</Badge>
          </template>
        </StatCard>
        <StatCard
          :label="t('templates.list.columns.outstanding')"
          :value="String(account.outstanding)"
          :unit="unit"
          :icon="FileTextIcon"
        />
        <StatCard
          :label="t('templates.detail.stats.advance')"
          :value="String(account.advance)"
          :unit="unit"
          :icon="HandCoinsIcon"
          :hint="t('templates.detail.stats.advanceHint')"
        />
        <StatCard
          :label="t('templates.detail.stats.payments')"
          :value="String(account.payments)"
          :icon="CreditCardIcon"
        />
      </section>

      <Tabs :model-value="tab" @update:model-value="setTab">
        <TabsList>
          <TabsTrigger value="overview">{{ t("templates.detail.tabs.overview") }}</TabsTrigger>
          <TabsTrigger value="activity">{{ t("templates.detail.tabs.activity") }}</TabsTrigger>
          <TabsTrigger value="documents">{{ t("templates.detail.tabs.documents") }}</TabsTrigger>
        </TabsList>

        <!-- Inactive tabs unmount: each loads when opened. -->
        <TabsContent value="overview" class="pt-4" data-anatomy="tab-panel">
          <!-- Section cards: one column on phones, side by side from lg. -->
          <div class="grid gap-3 lg:grid-cols-3" data-anatomy="section-grid">
            <Card v-for="section in facts" :key="section.title" data-anatomy="section-card">
              <CardHeader class="pb-2">
                <CardTitle class="text-sm">{{ section.title }}</CardTitle>
              </CardHeader>
              <CardContent class="divide-y">
                <div
                  v-for="row in section.rows"
                  :key="row.label"
                  class="flex items-baseline justify-between gap-4 py-2 text-sm"
                >
                  <span class="text-muted-foreground">{{ row.label }}</span>
                  <DocNo v-if="row.code" :value="row.code" class="font-medium" />
                  <span v-else-if="row.num" class="num font-medium">{{ row.num }}</span>
                  <Amount
                    v-else-if="row.money !== undefined"
                    :value="row.money"
                    :unit="unit"
                    class="font-semibold"
                  />
                  <span v-else class="font-medium">{{ row.text }}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2">
                <CardTitle class="text-sm">{{
                  t("templates.detail.sections.available")
                }}</CardTitle>
              </CardHeader>
              <CardContent class="space-y-1">
                <MoneyFigure :value="account.balance - account.outstanding" :currency="unit" />
                <p class="text-xs text-muted-foreground">
                  {{ t("templates.detail.sections.availableHint") }}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" class="pt-4">
          <Card class="gap-0 py-0">
            <CardHeader class="border-b px-4 py-3!">
              <CardTitle class="text-sm">{{ t("templates.detail.tabs.activity") }}</CardTitle>
            </CardHeader>
            <ul class="divide-y divide-border/70">
              <li
                v-for="entry in activity"
                :key="entry.id"
                class="flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <span class="min-w-0 flex-1 truncate">{{ entry.label }}</span>
                <span class="num text-xs text-muted-foreground">{{
                  formatDateYmd(entry.date)
                }}</span>
                <Amount :value="entry.amount" :unit="unit" class="font-medium" />
              </li>
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="documents" class="pt-4">
          <Card class="py-0">
            <EmptyState
              bare
              :icon="InboxIcon"
              :title="t('templates.detail.documentsEmpty')"
              :hint="t('templates.detail.documentsEmptyHint')"
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
