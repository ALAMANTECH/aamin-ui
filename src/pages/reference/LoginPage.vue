<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { toast } from "vue-sonner"
import { ArrowLeftIcon, ShieldCheckIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import PinConfirm from "@/components/app/PinConfirm.vue"
import Sparkline from "@/components/app/Sparkline.vue"

const router = useRouter()

const step = ref<"credentials" | "otp">("credentials")
const phone = ref("")
const password = ref("")
const isLoading = ref(false)

function submitCredentials() {
  if (!phone.value || !password.value) {
    toast.error("أدخل رقم الهاتف وكلمة المرور")
    return
  }
  isLoading.value = true
  // Demo only — the kit ships no auth logic.
  setTimeout(() => {
    isLoading.value = false
    step.value = "otp"
  }, 600)
}

// Demo only — PinConfirm owns the pin state machine; any complete code
// succeeds after a short simulated round trip.
async function handleOtpConfirm() {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

function onOtpSuccess() {
  toast.success("تم تسجيل الدخول بنجاح")
  router.push("/")
}
</script>

<template>
  <div class="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
    <!-- Brand panel -->
    <section class="relative hidden overflow-hidden bg-sidebar lg:block" aria-hidden="true">
      <div class="absolute inset-0 bg-grid opacity-60" />
      <div class="absolute inset-0 bg-halo" />

      <div class="relative flex h-full flex-col justify-between p-10">
        <div class="flex items-center gap-2.5">
          <span
            class="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary glow-primary"
          >
            <ShieldCheckIcon class="size-5" />
          </span>
          <span class="text-sm font-semibold text-sidebar-accent-foreground">أمِن UI</span>
        </div>

        <div class="max-w-md">
          <h1
            class="text-3xl font-semibold leading-snug tracking-tight text-sidebar-accent-foreground"
          >
            غرفة تحكّم واحدة،
            <span class="text-primary">لكل عملياتك.</span>
          </h1>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
            نظام تصميم عربي RTL جاهز للوحات التحكم — مظهر داكن وفاتح، مكوّنات موثّقة، وأرقام أحادية
            المسافة تليق بالبيانات المالية.
          </p>

          <!-- Floating live-metric chip -->
          <div
            class="mt-8 inline-flex items-center gap-4 rounded-xl border border-sidebar-border bg-card/60 p-4 backdrop-blur"
          >
            <div>
              <p class="text-[11px] text-muted-foreground">مبيعات هذا الأسبوع</p>
              <p class="num mt-1 text-lg font-semibold text-card-foreground">482,940</p>
            </div>
            <Sparkline :data="[14, 18, 16, 23, 21, 28, 26, 34]" :width="96" :height="32" />
          </div>
        </div>

        <p class="text-[11px] text-muted-foreground">
          © 2026 أمِن — نظام إدارة البطاقات وخدمات الدفع
        </p>
      </div>
    </section>

    <!-- Form panel -->
    <section class="relative flex items-center justify-center px-4 py-12">
      <!-- The LocaleToggle · ThemeToggle corner cluster is BlankLayout's (router.ts). -->
      <div class="w-full max-w-sm">
        <!-- Credentials step -->
        <template v-if="step === 'credentials'">
          <h2 class="text-xl font-semibold tracking-tight">تسجيل الدخول</h2>
          <p class="mt-1 text-sm text-muted-foreground">أدخل بياناتك للوصول إلى لوحة التحكم</p>

          <form class="mt-8 space-y-5" @submit.prevent="submitCredentials">
            <div class="space-y-2">
              <Label for="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                v-model="phone"
                type="tel"
                placeholder="09xxxxxxxx"
                class="num h-10"
              />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="password">كلمة المرور</Label>
                <a href="#" class="text-xs text-primary hover:underline">نسيت كلمة المرور؟</a>
              </div>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="h-10"
              />
            </div>

            <div class="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label for="remember" class="font-normal text-muted-foreground"
                >تذكّرني على هذا الجهاز</Label
              >
            </div>

            <Button type="submit" class="h-10 w-full glow-primary" :disabled="isLoading">
              {{ isLoading ? "جارٍ التحقق…" : "متابعة" }}
            </Button>
          </form>

          <Separator class="my-6" label="أو" />

          <p class="text-center text-xs text-muted-foreground">
            هذه صفحة عرض — لا يوجد اتصال بخادم. أي بيانات تنقلك للخطوة التالية.
          </p>
        </template>

        <!-- OTP step -->
        <template v-else>
          <button
            class="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            @click="step = 'credentials'"
          >
            <ArrowLeftIcon class="size-3.5 rtl:rotate-180" />
            رجوع
          </button>

          <div class="mt-4">
            <PinConfirm
              variant="inline"
              title="التحقق بخطوتين"
              description="أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة."
              confirm-label="تأكيد ودخول"
              :on-confirm="handleOtpConfirm"
              @success="onOtpSuccess"
              @resend="toast.info('تم إرسال رمز جديد')"
            />
          </div>
        </template>
      </div>
    </section>
  </div>
</template>
