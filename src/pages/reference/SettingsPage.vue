<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"
import { MoonStarIcon, SunIcon, Trash2Icon, UserRoundPlusIcon } from "@/lib/icons";
import { toast } from "vue-sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import PageHeader from "@/components/app/PageHeader.vue"
import { useLocale } from "@/composables/useLocale"
import { useTheme } from "@/composables/useTheme"

/* -------------------------------- Sub-nav -------------------------------- */
const sections = [
  { id: "general", label: "عام" },
  { id: "appearance", label: "المظهر" },
  { id: "notifications", label: "الإشعارات" },
  { id: "team", label: "الفريق" },
  { id: "danger", label: "منطقة الخطر" },
]

const activeSection = ref("general")

function goTo(id: string) {
  activeSection.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

// Scrollspy: highlight the section currently in view as the user scrolls
// (not just on click). Root is the scrolling <main> ancestor; the rootMargin
// biases the trigger band toward the upper-middle of the viewport.
let observer: IntersectionObserver | null = null

onMounted(() => {
  const els = sections
    .map((s) => document.getElementById(s.id))
    .filter((el): el is HTMLElement => el !== null)
  if (!els.length) return

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
      if (visible.length) activeSection.value = visible[0].target.id
    },
    { root: els[0].closest("main"), rootMargin: "-40% 0px -55% 0px", threshold: 0 },
  )
  els.forEach((el) => observer!.observe(el))
})

onBeforeUnmount(() => observer?.disconnect())

/* --------------------------------- General ------------------------------- */
const orgName = ref("شركة تجريبية للتقنية المالية")
const orgEmail = ref("ops@example.com")
const orgPhone = ref("0910000002")

/* ------------------------------- Appearance ------------------------------ */
const { mode } = useTheme()
const { locale, set: setLocale } = useLocale()

/* ------------------------------ Notifications ---------------------------- */
const notifications = ref([
  {
    id: "tx-alerts",
    label: "تنبيهات المعاملات",
    hint: "إشعار فوري عند كل عملية شراء أو سحب أرباح.",
    enabled: true,
  },
  {
    id: "weekly-digest",
    label: "الملخص الأسبوعي",
    hint: "تقرير مبيعات مجمّع يصل بريدك صباح كل سبت.",
    enabled: true,
  },
  {
    id: "low-stock",
    label: "انخفاض مخزون الكروت",
    hint: "تنبيه عندما يقل مخزون أي فئة عن 200 كرت.",
    enabled: true,
  },
  {
    id: "marketing",
    label: "رسائل تسويقية",
    hint: "عروض الشركاء والحملات الموسمية.",
    enabled: false,
  },
])

/* ---------------------------------- Team --------------------------------- */
interface Member {
  initials: string
  name: string
  phone: string
  role: string
}

const members = ref<Member[]>([
  { initials: "مأ", name: "موظف تجريبي أ", phone: "0910000003", role: "manager" },
  { initials: "مب", name: "موظف تجريبي ب", phone: "0910000004", role: "accountant" },
  { initials: "مج", name: "موظف تجريبي ج", phone: "0910000005", role: "supervisor" },
  { initials: "مد", name: "موظف تجريبي د", phone: "0910000006", role: "viewer" },
])

const roles = [
  { value: "manager", label: "مدير" },
  { value: "supervisor", label: "مشرف" },
  { value: "accountant", label: "محاسب" },
  { value: "viewer", label: "مشاهد" },
]

function removeMember(member: Member) {
  members.value = members.value.filter((m) => m !== member)
  toast.success(`تمت إزالة ${member.name} من الفريق`)
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="الإعدادات" description="إعدادات المنشأة والمظهر والفريق" />

    <div class="grid gap-6 lg:grid-cols-[200px_1fr] lg:items-start">
      <!-- Sticky section sub-nav -->
      <nav aria-label="أقسام الإعدادات" class="lg:sticky lg:top-2">
        <ul class="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          <li v-for="section in sections" :key="section.id">
            <button
              class="w-full whitespace-nowrap rounded-lg px-3 py-2 text-start text-[13px] font-medium transition-colors"
              :class="[
                activeSection === section.id
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                section.id === 'danger' && 'text-destructive/80 hover:text-destructive',
                section.id === 'danger' && activeSection === section.id && 'text-destructive',
              ]"
              @click="goTo(section.id)"
            >
              {{ section.label }}
            </button>
          </li>
        </ul>
      </nav>

      <!-- Sections -->
      <div class="min-w-0 space-y-6">
        <!-- General -->
        <Card id="general" class="scroll-mt-6">
          <CardHeader>
            <CardTitle>عام</CardTitle>
            <CardDescription>بيانات المنشأة الظاهرة في الفواتير والتقارير</CardDescription>
          </CardHeader>
          <CardContent class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2 sm:col-span-2">
              <Label for="org-name">اسم المنشأة</Label>
              <Input id="org-name" v-model="orgName" />
            </div>
            <div class="space-y-2">
              <Label for="org-email">البريد الرسمي</Label>
              <Input id="org-email" v-model="orgEmail" type="email" />
            </div>
            <div class="space-y-2">
              <Label for="org-phone">رقم الهاتف</Label>
              <Input id="org-phone" v-model="orgPhone" type="tel" class="num" />
            </div>
          </CardContent>
          <CardFooter class="justify-end gap-2">
            <Button class="glow-primary" @click="toast.success('تم حفظ إعدادات المنشأة')"
              >حفظ التغييرات</Button
            >
          </CardFooter>
        </Card>

        <!-- Appearance (functional) -->
        <Card id="appearance" class="scroll-mt-6">
          <CardHeader>
            <CardTitle>المظهر</CardTitle>
            <CardDescription>خيارات فعلية — تُطبّق مباشرة على الواجهة</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <fieldset>
              <legend class="mb-3 text-sm font-medium">السمة</legend>
              <div class="grid gap-3 sm:grid-cols-2">
                <!-- Dark theme card -->
                <button
                  type="button"
                  class="rounded-xl border p-3 text-start transition-all"
                  :class="
                    mode === 'dark'
                      ? 'border-primary/60 ring-2 ring-primary/30'
                      : 'hover:border-muted-foreground/30'
                  "
                  :aria-pressed="mode === 'dark'"
                  @click="mode = 'dark'"
                >
                  <span
                    class="block h-16 rounded-lg border border-white/10 p-2"
                    style="background: oklch(0.21 0.025 253)"
                    aria-hidden="true"
                  >
                    <span
                      class="block h-2 w-1/2 rounded-full"
                      style="background: oklch(0.76 0.12 245)"
                    />
                    <span class="mt-1.5 block h-2 w-3/4 rounded-full bg-white/15" />
                    <span class="mt-1.5 block h-2 w-2/3 rounded-full bg-white/10" />
                  </span>
                  <span class="mt-2.5 flex items-center gap-1.5 text-sm font-medium">
                    <MoonStarIcon class="size-3.5" aria-hidden="true" />
                    داكن
                  </span>
                  <span class="mt-0.5 block text-xs text-muted-foreground"
                    >الافتراضي — غرفة تحكم ليلية</span
                  >
                </button>

                <!-- Light theme card -->
                <button
                  type="button"
                  class="rounded-xl border p-3 text-start transition-all"
                  :class="
                    mode === 'light'
                      ? 'border-primary/60 ring-2 ring-primary/30'
                      : 'hover:border-muted-foreground/30'
                  "
                  :aria-pressed="mode === 'light'"
                  @click="mode = 'light'"
                >
                  <span
                    class="block h-16 rounded-lg border border-black/10 p-2"
                    style="background: oklch(0.977 0.003 250)"
                    aria-hidden="true"
                  >
                    <span
                      class="block h-2 w-1/2 rounded-full"
                      style="background: oklch(0.455 0.114 244.9)"
                    />
                    <span class="mt-1.5 block h-2 w-3/4 rounded-full bg-black/15" />
                    <span class="mt-1.5 block h-2 w-2/3 rounded-full bg-black/10" />
                  </span>
                  <span class="mt-2.5 flex items-center gap-1.5 text-sm font-medium">
                    <SunIcon class="size-3.5" aria-hidden="true" />
                    فاتح
                  </span>
                  <span class="mt-0.5 block text-xs text-muted-foreground"
                    >ورق ناعم لساعات النهار</span
                  >
                </button>
              </div>
            </fieldset>

            <Separator />

            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p class="text-sm font-medium">اتجاه الواجهة</p>
                <p class="mt-0.5 text-xs text-muted-foreground">
                  RTL هو الافتراضي — بدّل لمعاينة المكوّنات في LTR
                </p>
              </div>
              <div class="flex rounded-lg border p-0.5">
                <Button
                  :variant="locale === 'ar' ? 'secondary' : 'ghost'"
                  size="sm"
                  @click="setLocale('ar')"
                >
                  عربي RTL
                </Button>
                <Button
                  :variant="locale === 'en' ? 'secondary' : 'ghost'"
                  size="sm"
                  @click="setLocale('en')"
                >
                  English LTR
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Notifications -->
        <Card id="notifications" class="scroll-mt-6">
          <CardHeader>
            <CardTitle>الإشعارات</CardTitle>
            <CardDescription>تحكّم في ما يصلك وأين يصلك</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-for="(item, index) in notifications" :key="item.id">
              <div
                class="flex items-center justify-between gap-4 py-3.5"
                :class="index === 0 && 'pt-0'"
              >
                <div>
                  <Label :for="item.id" class="text-sm">{{ item.label }}</Label>
                  <p class="mt-0.5 text-xs text-muted-foreground">{{ item.hint }}</p>
                </div>
                <Switch :id="item.id" v-model="item.enabled" />
              </div>
              <Separator v-if="index !== notifications.length - 1" />
            </div>
          </CardContent>
        </Card>

        <!-- Team -->
        <Card id="team" class="scroll-mt-6">
          <CardHeader>
            <CardTitle>الفريق</CardTitle>
            <CardDescription>
              <span class="num">{{ members.length }}</span>
              أعضاء لديهم وصول للوحة التحكم
            </CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                @click="toast.info('تم إرسال رابط الدعوة (عرض توضيحي)')"
              >
                <UserRoundPlusIcon class="size-3.5" />
                دعوة عضو
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul>
              <li
                v-for="(member, index) in members"
                :key="member.name"
                class="flex flex-wrap items-center gap-3 py-3"
                :class="index !== members.length - 1 && 'border-b'"
              >
                <Avatar>
                  <AvatarFallback class="text-xs">{{ member.initials }}</AvatarFallback>
                </Avatar>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium">{{ member.name }}</p>
                  <p class="num mt-0.5 text-xs text-muted-foreground">{{ member.phone }}</p>
                </div>
                <Select v-model="member.role">
                  <SelectTrigger size="sm" class="w-28" :aria-label="`دور ${member.name}`">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="role in roles" :key="role.value" :value="role.value">
                      {{ role.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  :aria-label="`إزالة ${member.name} من الفريق`"
                  @click="removeMember(member)"
                >
                  <Trash2Icon class="size-4" />
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>

        <!-- Danger zone -->
        <Card id="danger" class="scroll-mt-6 ring-destructive/40">
          <CardHeader>
            <CardTitle class="text-destructive">منطقة الخطر</CardTitle>
            <CardDescription>إجراءات لا يمكن التراجع عنها — تعامل معها بحذر</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium">نقل ملكية الحساب</p>
                <p class="mt-0.5 text-xs text-muted-foreground">
                  تحويل صلاحية المالك الرئيسي إلى عضو آخر في الفريق.
                </p>
              </div>
              <Button
                variant="outline"
                @click="toast.info('نقل الملكية يتطلب تحققًا إضافيًا (عرض توضيحي)')"
              >
                نقل الملكية
              </Button>
            </div>

            <Separator />

            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium">حذف الحساب نهائيًا</p>
                <p class="mt-0.5 text-xs text-muted-foreground">
                  تُحذف بيانات المنشأة و<span class="num">96</span> نقطة بيع مرتبطة بعد 30 يومًا.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger as-child>
                  <Button variant="destructive">حذف الحساب</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>حذف حساب المنشأة؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم إيقاف جميع نقاط البيع فورًا، وحذف البيانات نهائيًا بعد
                      <span class="num">30</span>
                      يومًا. لا يمكن التراجع عن هذا الإجراء بعد انتهاء المهلة.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>تراجع</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      @click="toast.error('تم جدولة حذف الحساب — لديك 30 يومًا للتراجع')"
                    >
                      نعم، احذف الحساب
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
