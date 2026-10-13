<script setup lang="ts">
import {
  ArrowUpLeftIcon,
  CreditCardIcon,
  DownloadIcon,
  StoreIcon,
  UsersRoundIcon,
  WalletIcon,
} from "@/lib/icons";
import { toast } from "vue-sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import PageHeader from "@/components/app/PageHeader.vue"
import StatCard from "@/components/app/StatCard.vue"
import StatusBadge from "@/components/app/StatusBadge.vue"
import Timeline, { type TimelineItem } from "@/components/app/Timeline.vue"

const stats = [
  {
    label: "إجمالي المبيعات",
    value: "1,482,940",
    unit: "د.ل",
    delta: 12.4,
    deltaLabel: "عن الأسبوع الماضي",
    trend: [12, 16, 14, 22, 19, 27, 24, 31],
    icon: WalletIcon,
  },
  {
    label: "نقاط البيع النشطة",
    value: "2,208",
    delta: 3.1,
    deltaLabel: "هذا الشهر",
    trend: [40, 42, 41, 44, 47, 46, 49, 52],
    icon: StoreIcon,
  },
  {
    label: "الكروت المباعة",
    value: "38,712",
    delta: -2.8,
    deltaLabel: "عن أمس",
    trend: [30, 28, 31, 27, 25, 26, 22, 21],
    icon: CreditCardIcon,
  },
  {
    label: "مسوّقون جدد",
    value: "127",
    delta: 8.9,
    deltaLabel: "هذا الربع",
    trend: [4, 6, 5, 9, 8, 11, 12, 14],
    icon: UsersRoundIcon,
  },
]

// Fourteen days of demo revenue for the bar chart.
const days = [
  { day: "س", value: 62 },
  { day: "ح", value: 48 },
  { day: "ن", value: 71 },
  { day: "ث", value: 56 },
  { day: "ر", value: 83 },
  { day: "خ", value: 77 },
  { day: "ج", value: 41 },
  { day: "س", value: 68 },
  { day: "ح", value: 74 },
  { day: "ن", value: 59 },
  { day: "ث", value: 88 },
  { day: "ر", value: 95 },
  { day: "خ", value: 79 },
  { day: "ج", value: 52 },
]

const transactions = [
  { id: "TX-84921", name: "سوق النموذج", type: "تعبئة رصيد", amount: "12,400", status: "completed" },
  { id: "TX-84920", name: "اتصالات النموذج", type: "شراء كروت", amount: "7,150", status: "completed" },
  { id: "TX-84919", name: "مكتبة النموذج", type: "سحب أرباح", amount: "3,980", status: "pending" },
  {
    id: "TX-84918",
    name: "سوبرماركت النموذج",
    type: "شراء كروت",
    amount: "21,300",
    status: "completed",
  },
  { id: "TX-84917", name: "قهوة النموذج", type: "تعبئة رصيد", amount: "1,750", status: "rejected" },
]

const activity: TimelineItem[] = [
  { time: "قبل 4 دقائق", text: "أضاف مستخدم تجريبي نقطة بيع جديدة في بنغازي" },
  { time: "قبل 22 دقيقة", text: "اكتمل طلب كروت ليبيانا بقيمة 45,000 د.ل" },
  { time: "قبل ساعة", text: "فعّل مستخدم تجريبي خطة محفظة «الباقة التجريبية»" },
  { time: "قبل 3 ساعات", text: "تم تسوية فاتورة مسوّق تجريبي" },
]
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="نظرة عامة" description="ملخص أداء المنصة لهذا الأسبوع">
      <template #actions>
        <Button variant="outline" @click="toast.success('تم تصدير التقرير')">
          <DownloadIcon class="size-4" />
          تصدير
        </Button>
        <Button class="glow-primary">
          <ArrowUpLeftIcon class="size-4 rtl:-scale-x-100" />
          طلب جديد
        </Button>
      </template>
    </PageHeader>

    <!-- Stats -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard v-for="stat in stats" :key="stat.label" v-bind="stat" />
    </div>

    <div class="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <!-- Revenue bars -->
      <Card class="gap-4">
        <CardHeader class="flex-row items-center justify-between">
          <div>
            <CardTitle>الإيراد اليومي</CardTitle>
            <p class="mt-1 text-xs text-muted-foreground">آخر 14 يوم — بالألف د.ل</p>
          </div>
          <Badge variant="secondary" class="num">+18.2%</Badge>
        </CardHeader>
        <CardContent>
          <div class="flex h-44 items-end gap-1.5" role="img" aria-label="مخطط الإيراد اليومي">
            <Tooltip v-for="(bar, index) in days" :key="index">
              <TooltipTrigger as-child>
                <div class="group flex h-full flex-1 flex-col justify-end">
                  <div
                    class="rounded-t-[4px] bg-primary/25 transition-all duration-300 group-hover:bg-primary"
                    :style="{ height: `${bar.value}%` }"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent class="num">{{ bar.value }}k</TooltipContent>
            </Tooltip>
          </div>
          <div class="mt-2 flex gap-1.5 text-center text-[10px] text-muted-foreground">
            <span v-for="(bar, index) in days" :key="index" class="flex-1">{{ bar.day }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- Activity feed -->
      <Card class="gap-4">
        <CardHeader>
          <CardTitle>آخر النشاطات</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline :items="activity" />
        </CardContent>
      </Card>
    </div>

    <!-- Recent transactions -->
    <Card class="gap-0 overflow-hidden py-0">
      <CardHeader class="flex-row items-center justify-between border-b py-4!">
        <CardTitle>أحدث المعاملات</CardTitle>
        <!-- Recipe note: when copying into a real screen, point at YOUR
             tables route — this targets the dev-only reference copy. -->
        <Button variant="ghost" size="sm" as-child>
          <RouterLink to="/reference/tables">عرض الكل</RouterLink>
        </Button>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المرجع</TableHead>
            <TableHead>نقطة البيع</TableHead>
            <TableHead>النوع</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="tx in transactions" :key="tx.id">
            <TableCell class="num text-xs text-muted-foreground">{{ tx.id }}</TableCell>
            <TableCell class="font-medium">{{ tx.name }}</TableCell>
            <TableCell class="text-muted-foreground">{{ tx.type }}</TableCell>
            <TableCell
              ><span class="num">{{ tx.amount }}</span>
              <span class="text-xs text-muted-foreground">د.ل</span></TableCell
            >
            <TableCell>
              <StatusBadge :status="tx.status" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
