<script setup lang="ts">
import { ref } from "vue"
import {
  BadgeCheckIcon,
  CalendarIcon,
  MapPinIcon,
  MonitorIcon,
  PencilIcon,
  SmartphoneIcon,
  StoreIcon,
} from "@/lib/icons";
import { toast } from "vue-sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PageHeader from "@/components/app/PageHeader.vue"
import StatCard from "@/components/app/StatCard.vue"
import Timeline, { type TimelineItem } from "@/components/app/Timeline.vue"

/* ------------------------------ Demo profile ----------------------------- */
const details = [
  { label: "الاسم الكامل", value: "أحمد سالم التجريبي" },
  { label: "رقم الهاتف", value: "0910 000 001", num: true },
  { label: "البريد الإلكتروني", value: "ahmad@example.com", num: true },
  { label: "المدينة", value: "طرابلس" },
  { label: "نوع الحساب", value: "مدير حساب" },
  { label: "تاريخ الانضمام", value: "2025-01-01", num: true },
]

const stats = [
  { label: "نقاط بيع مُدارة", value: "96", trend: [72, 78, 80, 84, 83, 89, 92, 96] },
  {
    label: "مبيعات هذا الشهر",
    value: "214,380",
    unit: "د.ل",
    trend: [140, 155, 149, 172, 168, 190, 202, 214],
  },
  { label: "كروت مباعة", value: "8,120", trend: [5.2, 5.9, 6.1, 6.8, 6.5, 7.2, 7.8, 8.1] },
]

const activity: TimelineItem[] = [
  { time: "قبل 25 دقيقة", text: "أضاف نقطة بيع «صيدلية النموذج» في بنغازي" },
  { time: "قبل ساعتين", text: "اعتمد طلب كروت ليبيانا بقيمة 12,500 د.ل لسوق النموذج" },
  { time: "أمس 21:40", text: "حوّل أرباح الأسبوع — 4,860 د.ل إلى المحفظة الرئيسية" },
  { time: "أمس 14:12", text: "حدّث بيانات التواصل لنقطة البيع «مقهى النموذج»" },
  { time: "2026-07-08", text: "أكمل التحقق بخطوتين من جهاز جديد" },
  { time: "2026-07-06", text: "رقّى «بقالة النموذج» إلى خطة «الباقة التجريبية»" },
]

const sessions = [
  {
    device: "Chrome — Windows 11",
    location: "طرابلس · 203.0.113.10",
    last: "نشطة الآن",
    current: true,
    mobile: false,
  },
  {
    device: "تطبيق أمِن — Android 15",
    location: "طرابلس · 203.0.113.24",
    last: "قبل 3 ساعات",
    current: false,
    mobile: true,
  },
  {
    device: "Safari — macOS",
    location: "بنغازي · 198.51.100.7",
    last: "2026-07-04",
    current: false,
    mobile: false,
  },
]

/* -------------------------------- Security ------------------------------- */
const currentPassword = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const twoFactor = ref(true)

function updatePassword() {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    toast.error("أكمل حقول كلمة المرور الثلاثة")
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.error("كلمة المرور الجديدة غير متطابقة")
    return
  }
  currentPassword.value = ""
  newPassword.value = ""
  confirmPassword.value = ""
  toast.success("تم تحديث كلمة المرور")
}

// A script function, not an inline template arrow: vue-tsc >= 3.3.12 mis-types an
// imported `toast` called inside an inline arrow handler (reads it as a ref).
function onTwoFactor(on: boolean) {
  toast.success(on ? "تم تفعيل المصادقة الثنائية" : "تم إيقاف المصادقة الثنائية")
}

function endSession(device: string) {
  toast.success(`تم تسجيل الخروج من «${device}»`)
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="الملف الشخصي" description="مثال لتخطيط صفحة حساب مع تبويبات" />

    <!-- Cover + identity -->
    <Card class="gap-0 overflow-hidden py-0">
      <div class="relative h-28 bg-grid" aria-hidden="true">
        <div class="absolute inset-0 bg-halo" />
      </div>

      <CardContent class="px-6 pb-6">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="flex flex-wrap items-end gap-4">
            <Avatar class="-mt-10 size-20 border-4 border-card bg-card text-xl">
              <AvatarFallback class="bg-primary/15 font-semibold text-primary">أت</AvatarFallback>
            </Avatar>
            <div class="pb-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-xl font-semibold tracking-tight">أحمد التجريبي</h2>
                <Badge variant="secondary" class="gap-1">
                  <BadgeCheckIcon class="size-3 text-primary" aria-hidden="true" />
                  موثّق
                </Badge>
              </div>
              <p class="mt-0.5 text-sm text-muted-foreground">مدير حساب — الفرع الرئيسي</p>
            </div>
          </div>

          <Button
            class="glow-primary"
            @click="toast.info('نموذج تعديل الملف غير متضمّن في نسخة العرض')"
          >
            <PencilIcon class="size-4" />
            تعديل الملف
          </Button>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span class="flex items-center gap-1.5">
            <MapPinIcon class="size-3.5" aria-hidden="true" />
            بنغازي، ليبيا
          </span>
          <span class="flex items-center gap-1.5">
            <CalendarIcon class="size-3.5" aria-hidden="true" />
            انضم في مارس 2024
          </span>
          <span class="flex items-center gap-1.5">
            <StoreIcon class="size-3.5" aria-hidden="true" />
            <span class="num">96</span>
            نقطة بيع
          </span>
        </div>
      </CardContent>
    </Card>

    <Tabs default-value="overview" class="gap-5">
      <TabsList>
        <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        <TabsTrigger value="activity">النشاط</TabsTrigger>
        <TabsTrigger value="security">الأمان</TabsTrigger>
      </TabsList>

      <!-- Overview -->
      <TabsContent value="overview" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-3">
          <StatCard v-for="stat in stats" :key="stat.label" v-bind="stat" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>بيانات الحساب</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <div
                v-for="(row, index) in details"
                :key="row.label"
                class="flex flex-wrap items-center justify-between gap-2 py-3"
                :class="index !== details.length - 1 && 'border-b'"
              >
                <dt class="text-sm text-muted-foreground">{{ row.label }}</dt>
                <dd class="text-sm font-medium" :class="row.num && 'num'">{{ row.value }}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Activity -->
      <TabsContent value="activity">
        <Card>
          <CardHeader>
            <CardTitle>سجل النشاط</CardTitle>
            <CardDescription>آخر الإجراءات على هذا الحساب</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline :items="activity" />
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Security -->
      <TabsContent value="security" class="space-y-4">
        <div class="grid gap-4 lg:grid-cols-2 lg:items-start">
          <Card>
            <CardHeader>
              <CardTitle>تغيير كلمة المرور</CardTitle>
              <CardDescription>استخدم 12 حرفًا على الأقل مع أرقام ورموز</CardDescription>
            </CardHeader>
            <CardContent>
              <form class="space-y-4" @submit.prevent="updatePassword">
                <div class="space-y-2">
                  <Label for="current-password">كلمة المرور الحالية</Label>
                  <Input
                    id="current-password"
                    v-model="currentPassword"
                    type="password"
                    autocomplete="current-password"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="new-password">كلمة المرور الجديدة</Label>
                  <Input
                    id="new-password"
                    v-model="newPassword"
                    type="password"
                    autocomplete="new-password"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="confirm-password">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirm-password"
                    v-model="confirmPassword"
                    type="password"
                    autocomplete="new-password"
                  />
                </div>
                <Button type="submit" variant="outline" class="w-full">تحديث كلمة المرور</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المصادقة الثنائية</CardTitle>
              <CardDescription>طبقة حماية إضافية عند تسجيل الدخول</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div>
                  <Label for="two-factor" class="text-sm">تطبيق المصادقة</Label>
                  <p class="mt-0.5 text-xs text-muted-foreground">
                    رمز متغيّر كل 30 ثانية من تطبيق المصادقة على هاتفك.
                  </p>
                </div>
                <Switch
                  id="two-factor"
                  v-model="twoFactor"
                  @update:model-value="onTwoFactor"
                />
              </div>
              <p class="text-xs text-muted-foreground">
                آخر تحقق ناجح:
                <span class="num">2026-07-08 09:24</span>
                من بنغازي.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card class="gap-0 py-0">
          <CardHeader class="border-b py-4!">
            <CardTitle>الجلسات النشطة</CardTitle>
          </CardHeader>
          <CardContent class="p-0">
            <ul>
              <li
                v-for="(session, index) in sessions"
                :key="session.device"
                class="flex flex-wrap items-center gap-3 px-4 py-3.5"
                :class="index !== sessions.length - 1 && 'border-b'"
              >
                <span
                  class="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
                >
                  <SmartphoneIcon v-if="session.mobile" class="size-4" aria-hidden="true" />
                  <MonitorIcon v-else class="size-4" aria-hidden="true" />
                </span>
                <div class="min-w-0 flex-1">
                  <p class="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {{ session.device }}
                    <Badge v-if="session.current" variant="secondary">الجلسة الحالية</Badge>
                  </p>
                  <p class="num mt-0.5 text-xs text-muted-foreground">
                    {{ session.location }} · {{ session.last }}
                  </p>
                </div>
                <Button
                  v-if="!session.current"
                  variant="ghost"
                  size="sm"
                  @click="endSession(session.device)"
                >
                  تسجيل الخروج
                </Button>
              </li>
            </ul>
            <Separator />
            <div class="flex justify-end px-4 py-3">
              <Button
                variant="destructive"
                size="sm"
                @click="toast.success('تم إنهاء جميع الجلسات الأخرى')"
              >
                إنهاء جميع الجلسات الأخرى
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
