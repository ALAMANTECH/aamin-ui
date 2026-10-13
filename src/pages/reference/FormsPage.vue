<script setup lang="ts">
import { computed, ref } from "vue"
import { CircleCheckIcon, LightbulbIcon, SaveIcon } from "@/lib/icons";
import { toast } from "vue-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PinInput, PinInputGroup, PinInputSlot } from "@/components/ui/pin-input"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import PageHeader from "@/components/app/PageHeader.vue"

/* --------------------------------- State --------------------------------- */
const name = ref("")
const phone = ref("")
const region = ref("")
const notes = ref("")

const accountType = ref("merchant")
const accountTypes = [
  { value: "merchant", label: "تاجر", hint: "نقطة بيع واحدة باسم المحل" },
  { value: "marketer", label: "مسوّق", hint: "يدير عدة نقاط بيع ويتقاضى عمولة" },
  { value: "distributor", label: "موزّع رئيسي", hint: "طلبات جملة وأسعار خاصة" },
]

const services = ref<string[]>(["libyana"])
const serviceOptions = [
  { value: "libyana", label: "كروت ليبيانا" },
  { value: "madar", label: "كروت المدار" },
  { value: "topup", label: "تعبئة رصيد مباشرة" },
  { value: "bills", label: "تحصيل فواتير" },
]

function toggleService(value: string, checked: boolean | "indeterminate") {
  if (checked === true) {
    if (!services.value.includes(value)) services.value.push(value)
  } else {
    services.value = services.value.filter((s) => s !== value)
  }
}

const activateNow = ref(true)
const pin = ref<string[]>([])

/* ------------------------------- Validation ------------------------------ */
const submitted = ref(false)

const errors = computed(() => ({
  name: !name.value.trim() ? "اسم نقطة البيع مطلوب" : "",
  phone: !phone.value.trim()
    ? "رقم الهاتف مطلوب"
    : !/^09\d{8}$/.test(phone.value.trim())
      ? "أدخل رقمًا ليبيًا صحيحًا يبدأ بـ 09"
      : "",
  region: !region.value ? "اختر المنطقة" : "",
}))

const hasErrors = computed(() => Object.values(errors.value).some(Boolean))

function save() {
  submitted.value = true
  if (hasErrors.value) {
    toast.error("أكمل الحقول المطلوبة قبل الحفظ")
    return
  }
  toast.success(`تم حفظ بيانات «${name.value}» بنجاح`)
}

function cancel() {
  name.value = ""
  phone.value = ""
  region.value = ""
  notes.value = ""
  accountType.value = "merchant"
  services.value = ["libyana"]
  activateNow.value = true
  pin.value = []
  submitted.value = false
  toast.info("تم تفريغ النموذج")
}

const tips = [
  "استخدم اسم المحل كما هو مسجّل في الرخصة التجارية.",
  "رقم الهاتف يجب أن يكون مفعّلًا لاستقبال رسائل التحقق.",
  "حدّد الخدمات المطلوبة فقط — يمكن إضافة المزيد لاحقًا.",
  "رمز التأكيد يصلك من مشرف المنطقة خلال دقائق.",
]
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="النماذج"
      description="نموذج تسجيل نقطة بيع بقسمين، مع تحقق مبسّط وشريط حفظ ثابت"
    />

    <form novalidate @submit.prevent="save">
      <div class="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        <!-- Main column -->
        <div class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>بيانات نقطة البيع</CardTitle>
              <CardDescription>الحقول المعلّمة بعلامة * مطلوبة</CardDescription>
            </CardHeader>

            <CardContent class="space-y-6">
              <!-- Section 1: identity -->
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label for="pos-name">اسم نقطة البيع *</Label>
                  <Input
                    id="pos-name"
                    v-model="name"
                    placeholder="مثال: سوق النموذج"
                    :aria-invalid="submitted && !!errors.name ? true : undefined"
                  />
                  <p v-if="submitted && errors.name" class="text-xs text-destructive">
                    {{ errors.name }}
                  </p>
                </div>

                <div class="space-y-2">
                  <Label for="pos-phone">رقم الهاتف *</Label>
                  <Input
                    id="pos-phone"
                    v-model="phone"
                    type="tel"
                    placeholder="09xxxxxxxx"
                    class="num"
                    :aria-invalid="submitted && !!errors.phone ? true : undefined"
                  />
                  <p v-if="submitted && errors.phone" class="text-xs text-destructive">
                    {{ errors.phone }}
                  </p>
                  <p v-else class="text-xs text-muted-foreground">
                    يُستخدم لتسجيل الدخول واستقبال رمز التحقق
                  </p>
                </div>

                <div class="space-y-2">
                  <Label for="pos-region">المنطقة *</Label>
                  <Select v-model="region">
                    <SelectTrigger
                      id="pos-region"
                      class="w-full"
                      :aria-invalid="submitted && !!errors.region ? true : undefined"
                    >
                      <SelectValue placeholder="اختر المنطقة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tripoli">طرابلس</SelectItem>
                      <SelectItem value="benghazi">بنغازي</SelectItem>
                      <SelectItem value="misrata">مصراتة</SelectItem>
                      <SelectItem value="zawiya">الزاوية</SelectItem>
                      <SelectItem value="zliten">زليتن</SelectItem>
                      <SelectItem value="sabha">سبها</SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="submitted && errors.region" class="text-xs text-destructive">
                    {{ errors.region }}
                  </p>
                </div>

                <div class="space-y-2 sm:col-span-2">
                  <Label for="pos-notes">ملاحظات</Label>
                  <Textarea
                    id="pos-notes"
                    v-model="notes"
                    placeholder="أقرب معلم، أوقات العمل، أو أي تفاصيل تهم فريق العمليات…"
                    class="min-h-24"
                  />
                  <p class="text-xs text-muted-foreground">تظهر هذه الملاحظات لفريق العمليات فقط</p>
                </div>
              </div>

              <Separator />

              <!-- Section 2: account & services -->
              <div class="space-y-6">
                <div>
                  <h3 class="text-sm font-semibold">نوع الحساب والخدمات</h3>
                  <p class="mt-0.5 text-xs text-muted-foreground">
                    يحدد نوع الحساب العمولات وحدود السحب
                  </p>
                </div>

                <fieldset class="space-y-3">
                  <legend class="mb-2 text-sm font-medium">نوع الحساب</legend>
                  <RadioGroup v-model="accountType" class="grid gap-2 sm:grid-cols-3">
                    <label
                      v-for="type in accountTypes"
                      :key="type.value"
                      :for="`type-${type.value}`"
                      class="flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors has-data-checked:border-primary/50 has-data-checked:bg-accent/50"
                    >
                      <RadioGroupItem
                        :id="`type-${type.value}`"
                        :value="type.value"
                        class="mt-0.5"
                      />
                      <span>
                        <span class="block text-sm font-medium">{{ type.label }}</span>
                        <span class="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{{
                          type.hint
                        }}</span>
                      </span>
                    </label>
                  </RadioGroup>
                </fieldset>

                <fieldset class="space-y-3">
                  <legend class="mb-2 text-sm font-medium">الخدمات المفعّلة</legend>
                  <div class="grid gap-3 sm:grid-cols-2">
                    <div
                      v-for="service in serviceOptions"
                      :key="service.value"
                      class="flex items-center gap-2"
                    >
                      <Checkbox
                        :id="`service-${service.value}`"
                        :model-value="services.includes(service.value)"
                        @update:model-value="(v) => toggleService(service.value, v)"
                      />
                      <Label :for="`service-${service.value}`" class="font-normal">{{
                        service.label
                      }}</Label>
                    </div>
                  </div>
                </fieldset>

                <div class="flex items-center justify-between gap-4 rounded-lg border p-3">
                  <div>
                    <Label for="activate-now" class="text-sm">تفعيل فوري</Label>
                    <p class="mt-0.5 text-xs text-muted-foreground">
                      تصبح نقطة البيع قادرة على البيع فور اعتماد الطلب، دون انتظار الزيارة
                      الميدانية.
                    </p>
                  </div>
                  <Switch id="activate-now" v-model="activateNow" />
                </div>

                <div class="space-y-2">
                  <Label for="confirm-pin">رمز التأكيد</Label>
                  <PinInput id="confirm-pin" v-model="pin" placeholder="○" otp dir="ltr">
                    <PinInputGroup class="gap-1.5 sm:gap-2">
                      <PinInputSlot
                        v-for="(slot, index) in 4"
                        :key="slot"
                        :index="index"
                        class="num size-8 rounded-lg border text-base sm:size-10 sm:text-lg"
                      />
                    </PinInputGroup>
                  </PinInput>
                  <p class="text-xs text-muted-foreground">
                    اطلب الرمز المكوّن من 4 أرقام من مشرف منطقتك
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Sticky actions bar -->
          <div
            class="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/85 px-4 py-3 backdrop-blur-md"
          >
            <p class="text-xs text-muted-foreground max-sm:hidden">
              لن يُرسل أي شيء لخادم — هذه واجهة عرض
            </p>
            <div class="ms-auto flex items-center gap-2">
              <Button type="button" variant="outline" @click="cancel">إلغاء</Button>
              <Button type="submit" class="glow-primary">
                <SaveIcon class="size-4" />
                حفظ نقطة البيع
              </Button>
            </div>
          </div>
        </div>

        <!-- Side column -->
        <aside class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-sm">
                <LightbulbIcon class="size-4 text-warning" aria-hidden="true" />
                إرشادات التعبئة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-3">
                <li
                  v-for="tip in tips"
                  :key="tip"
                  class="flex gap-2 text-[13px] leading-relaxed text-muted-foreground"
                >
                  <CircleCheckIcon
                    class="mt-0.5 size-3.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {{ tip }}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="text-sm">اكتمال الملف</CardTitle>
              <CardDescription>أكمل البيانات لرفع حد السحب اليومي</CardDescription>
            </CardHeader>
            <CardContent class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">التقدم</span>
                <span class="num font-medium">68%</span>
              </div>
              <Progress :model-value="68" aria-label="اكتمال الملف 68 بالمئة" />
              <p class="pt-1 text-xs text-muted-foreground">
                تبقّى: صورة الرخصة التجارية وتأكيد العنوان
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  </div>
</template>
