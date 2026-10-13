<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue"
import {
  ArrowLeftRightIcon,
  AtSignIcon,
  BellIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  CopyIcon,
  CreditCardIcon,
  DownloadIcon,
  EllipsisIcon,
  FileChartColumnIcon,
  FileDownIcon,
  HandCoinsIcon,
  InboxIcon,
  InfoIcon,
  LayoutDashboardIcon,
  MoonStarIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  StoreIcon,
  Table2Icon,
  TicketIcon,
  Trash2Icon,
  TriangleAlertIcon,
  WalletIcon,
} from "@/lib/icons";
import { toTypedSchema } from "@vee-validate/zod"
import { CalendarDate } from "@internationalized/date"
import { useForm } from "vee-validate"
import { toast } from "vue-sonner"
import { z } from "zod"
import { normalizeArabic } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge, type BadgeVariants } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  ChartContainer,
  ChartCrosshair,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
  type ChartConfig,
} from "@/components/ui/chart"
import { CurveType } from "@unovis/ts"
import { VisAxis, VisLine, VisXYContainer } from "@unovis/vue"
import { formatCompact } from "@/lib/money"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from "@/components/ui/combobox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { PinInput, PinInputGroup, PinInputSlot } from "@/components/ui/pin-input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RangeCalendar } from "@/components/ui/range-calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from "@/components/ui/tags-input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Spinner } from "@/components/ui/spinner"
import type { ColumnDef } from "@tanstack/vue-table"
import DataTable from "@/components/app/datatable/DataTable.vue"
import DataTableViewOptions from "@/components/app/datatable/DataTableViewOptions.vue"
import { selectionColumn } from "@/components/app/datatable/columns"
import CopyButton from "@/components/app/CopyButton.vue"
import EmptyState from "@/components/app/EmptyState.vue"
import FileDropzone from "@/components/app/FileDropzone.vue"
import Kbd from "@/components/app/Kbd.vue"
import PageHeader from "@/components/app/PageHeader.vue"
import PinConfirm from "@/components/app/PinConfirm.vue"
import ShowcaseSection from "@/components/app/showcase/ShowcaseSection.vue"
import Sparkline from "@/components/app/Sparkline.vue"
import { Card } from "@/components/ui/card"
import StatCard from "@/components/app/StatCard.vue"
import MoneyFigure from "@/components/app/MoneyFigure.vue"
import Amount from "@/components/app/Amount.vue"
import DocNo from "@/components/app/DocNo.vue"
import TotalsStrip from "@/components/app/TotalsStrip.vue"
import StatusSwitch from "@/components/app/StatusSwitch.vue"
import SettingRow from "@/components/app/SettingRow.vue"
import AsyncConfirmDialog from "@/components/app/AsyncConfirmDialog.vue"
import ReasonPinDialog from "@/components/app/ReasonPinDialog.vue"
import FilterChips, { type FilterChip } from "@/components/app/FilterChips.vue"
import FilterSheet from "@/components/app/FilterSheet.vue"
import SearchableSelect from "@/components/app/SearchableSelect.vue"
import MultiSelect from "@/components/app/MultiSelect.vue"
import DateField from "@/components/app/DateField.vue"
import TimeField from "@/components/app/TimeField.vue"
import CompactPager from "@/components/app/CompactPager.vue"
import LookupChipBoard, { type LookupChip } from "@/components/app/LookupChipBoard.vue"
import StatusBadge from "@/components/app/StatusBadge.vue"
import Timeline, { type TimelineItem } from "@/components/app/Timeline.vue"
import BrandMark from "@/components/app/BrandMark.vue"
import ChartState from "@/components/app/ChartState.vue"
import { CHART_CONTAINER_STYLE, useChartDuration } from "@/components/app/chart-theme"
import DaybookList, { type DaybookEntry, type DaybookKind } from "@/components/app/DaybookList.vue"
import AttachmentViewer, { type Attachment } from "@/components/app/AttachmentViewer.vue"
import NotificationBell, {
  type NotificationAdapter,
  type NotificationItem,
} from "@/components/app/NotificationBell.vue"
import StickySubmitBar from "@/components/app/StickySubmitBar.vue"
import { useLeaveGuard } from "@/composables/useLeaveGuard"
import {
  type AsyncJobCheckResult,
  type AsyncJobStatus,
  useAsyncJob,
} from "@/composables/useAsyncJob"

/* ----------------------------------- TOC --------------------------------- */
interface ChartPoint {
  day: number
  local: number
  service: number
}
const chartData: ChartPoint[] = [
  { day: 1, local: 4200, service: 1800 },
  { day: 2, local: 5100, service: 2100 },
  { day: 3, local: 4700, service: 2600 },
  { day: 4, local: 6300, service: 2400 },
  { day: 5, local: 5800, service: 3100 },
  { day: 6, local: 7200, service: 3500 },
  { day: 7, local: 6900, service: 3300 },
]
const chartConfig = {
  local: { label: "محلي", color: "var(--chart-1)" },
  service: { label: "حوالات", color: "var(--chart-2)" },
} satisfies ChartConfig
const chartX = (d: ChartPoint) => d.day
const chartY = [(d: ChartPoint) => d.local, (d: ChartPoint) => d.service]
const chartColor = (_d: ChartPoint, i: number) => (i === 0 ? "var(--chart-1)" : "var(--chart-2)")

const sections = [
  { id: "buttons", label: "الأزرار" },
  { id: "badges", label: "الشارات" },
  { id: "avatars", label: "الصور الرمزية" },
  { id: "alerts", label: "التنبيهات" },
  { id: "inputs", label: "حقول الإدخال" },
  { id: "textarea", label: "مساحة النص" },
  { id: "select", label: "القوائم" },
  { id: "selection", label: "عناصر الاختيار" },
  { id: "pin-input", label: "رمز التحقق" },
  { id: "pin-confirm", label: "تأكيد بالرمز" },
  { id: "tabs", label: "التبويبات" },
  { id: "dialog", label: "الحوار" },
  { id: "alert-dialog", label: "حوار التأكيد" },
  { id: "sheet", label: "اللوحة الجانبية" },
  { id: "dropdown", label: "القائمة المنسدلة" },
  { id: "command", label: "لوحة الأوامر" },
  { id: "tooltip", label: "التلميح" },
  { id: "popover", label: "البطاقة المنبثقة" },
  { id: "progress", label: "شريط التقدم" },
  { id: "chart", label: "الرسوم البيانية" },
  { id: "skeleton", label: "هياكل التحميل" },
  { id: "spinner", label: "مؤشر التحميل" },
  { id: "table", label: "الجدول" },
  { id: "datatable", label: "جدول البيانات" },
  { id: "pagination", label: "ترقيم الصفحات" },
  { id: "breadcrumb", label: "مسار التنقل" },
  { id: "toasts", label: "الإشعارات المنبثقة" },
  { id: "collapsible", label: "القابل للطي" },
  { id: "scroll-area", label: "منطقة التمرير" },
  { id: "separator", label: "الفواصل" },
  { id: "accordion", label: "الأكورديون" },
  { id: "toggle-group", label: "أزرار التبديل" },
  { id: "number-field", label: "الحقل الرقمي" },
  { id: "calendar", label: "التقويم" },
  { id: "range-calendar", label: "نطاق التواريخ" },
  { id: "combobox", label: "البحث والاختيار" },
  { id: "tags-input", label: "الوسوم" },
  { id: "schema-form", label: "النماذج المخططّية" },
  { id: "timeline", label: "الخط الزمني" },
  { id: "copy-kbd", label: "نسخ واختصارات" },
  { id: "upload", label: "رفع الملفات" },
  { id: "async-jobs", label: "المهام غير المتزامنة" },
  { id: "composite", label: "مكوّنات مركّبة" },
  { id: "composites-a", label: "الأرقام والمفاتيح والتأكيد" },
  { id: "composites-b", label: "الفلاتر والمنتقيات" },
  { id: "composites-c", label: "الشعارات والدفاتر والإشعارات" },
]

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

/* ------------------------------- Demo state ------------------------------ */
const checkDemo = ref<boolean | "indeterminate">(true)
const checkDemo2 = ref<boolean | "indeterminate">(false)
const radioDemo = ref("daily")
const switchDemo = ref(true)
const switchDemo2 = ref(false)
const pinDemo = ref<string[]>([])
const selectDemo = ref("")
const archiveVisible = ref(true)
const collapsibleOpen = ref(false)
const paginationDemo = ref(3)

const priceRows = [
  { name: "بطاقة 10", price: "9.50", stock: "1,240" },
  { name: "بطاقة 25", price: "24.00", stock: "830" },
  { name: "بطاقة 50", price: "48.00", stock: "215" },
]

const scrollCities = [
  "طرابلس — 842 نقطة بيع",
  "بنغازي — 611 نقطة بيع",
  "مصراتة — 348 نقطة بيع",
  "الزاوية — 197 نقطة بيع",
  "زليتن — 142 نقطة بيع",
  "سبها — 121 نقطة بيع",
  "البيضاء — 96 نقطة بيع",
  "درنة — 74 نقطة بيع",
  "طبرق — 58 نقطة بيع",
  "غريان — 45 نقطة بيع",
  "الخمس — 39 نقطة بيع",
  "أوباري — 17 نقطة بيع",
]

/* --------------------------- New families: state -------------------------- */
// Toggle group
const statusFilter = ref("all")
const servicesFilterDemo = ref<string[]>(["libyana"])

// Number field
const quantityDemo = ref(120)
const commissionDemo = ref(1.5)

// Calendar — Libya config: Saturday-start week, Latin digits (ar-LY already
// defaults to Latin numerals; the -u-nu-latn suffix makes that explicit and
// keeps it stable across environments/ICU versions).
const calendarDemo = ref(new CalendarDate(2026, 7, 12))

// Range calendar — report-filter style "from → to" selection.
const rangeDemo = ref({
  start: new CalendarDate(2026, 7, 1),
  end: new CalendarDate(2026, 7, 12),
})

// Combobox — Arabic-normalized search: typing a bare-alef spelling (e.g.
// "اسواق") must also match the hamza-alef spelling used below ("أسواق").
// ignore-filter is set on <Combobox> in the template so this computed list
// is the sole source of truth for which items render — reka-ui's own
// built-in filter does plain substring matching and doesn't know
// أ/إ/آ/ا are the same letter for search purposes.
const marketOptions = [
  { value: "demo-a", label: "أسواق النموذج" },
  { value: "demo-b", label: "أسواق التجربة" },
  { value: "demo-c", label: "أسواق العيّنة" },
  { value: "demo-d", label: "سوق التجربة" },
  { value: "demo-e", label: "سوبرماركت التجربة" },
  { value: "demo-f", label: "سوبرماركت العيّنة" },
]
const marketValue = ref("")
const marketSearch = ref("")
const filteredMarkets = computed(() => {
  const needle = normalizeArabic(marketSearch.value)
  if (!needle) return marketOptions
  return marketOptions.filter((market) => normalizeArabic(market.label).includes(needle))
})
const selectedMarketLabel = computed(
  () => marketOptions.find((market) => market.value === marketValue.value)?.label,
)

// Tags input
const serviceRegions = ref<string[]>(["طرابلس", "بنغازي"])

// Schema-driven form — vee-validate + zod, typed via @vee-validate/zod.
const posFormSchema = toTypedSchema(
  z.object({
    posName: z.string().min(1, "اسم نقطة البيع مطلوب"),
    phone: z.string().regex(/^09\d{8}$/, "رقم ليبي يبدأ بـ 09"),
    amount: z.number().min(1, "الحد الأدنى دينار واحد"),
  }),
)
const { handleSubmit: handlePosFormSubmit, resetForm: resetPosForm } = useForm({
  validationSchema: posFormSchema,
  initialValues: { posName: "", phone: "", amount: 1 },
})
const onPosFormSubmit = handlePosFormSubmit((values) => {
  toast.success(`تم حفظ نقطة البيع «${values.posName}» بنجاح`)
  resetPosForm()
})

/* ---------------------- DataTable showcase (8 rows) ---------------------- */
interface DemoPos {
  id: string
  name: string
  city: string
  sales: string
  status: string
}

const demoPosRows: DemoPos[] = [
  { id: "POS-2041", name: "سوق النموذج", city: "طرابلس", sales: "12,400", status: "active" },
  { id: "POS-2038", name: "اتصالات النموذج", city: "غريان", sales: "7,150", status: "active" },
  { id: "POS-2035", name: "مكتبة النموذج", city: "بنغازي", sales: "3,980", status: "pending" },
  { id: "POS-2031", name: "سوبرماركت النموذج", city: "مصراتة", sales: "21,300", status: "active" },
  { id: "POS-2028", name: "قهوة النموذج", city: "طرابلس", sales: "1,750", status: "suspended" },
  { id: "POS-2024", name: "صيدلية الشفاء التجريبية", city: "الزاوية", sales: "5,425", status: "active" },
  { id: "POS-2019", name: "بقالة النموذج", city: "زليتن", sales: "940", status: "pending" },
  { id: "POS-2011", name: "مطعم النموذج", city: "بنغازي", sales: "18,260", status: "active" },
]

const parseSales = (value: string) => Number(value.replace(/,/g, ""))

const demoPosColumns: ColumnDef<DemoPos, unknown>[] = [
  selectionColumn<DemoPos>(),
  { accessorKey: "id", header: "المرجع", meta: { label: "المرجع" } },
  { accessorKey: "name", header: "نقطة البيع", meta: { label: "نقطة البيع" } },
  { accessorKey: "city", header: "المدينة", meta: { label: "المدينة", class: "max-sm:hidden" } },
  {
    accessorKey: "sales",
    header: "المبيعات",
    meta: { label: "المبيعات" },
    sortingFn: (a, b) => parseSales(a.original.sales) - parseSales(b.original.sales),
  },
  { accessorKey: "status", header: "الحالة", enableSorting: false, meta: { label: "الحالة" } },
]

/* ------------------------------ Plan 008 demos ---------------------------- */
// Spinner
const spinnerDemoLoading = ref(false)
function triggerSpinnerDemo() {
  spinnerDemoLoading.value = true
  setTimeout(() => {
    spinnerDemoLoading.value = false
    toast.success("تم — هذا زر توضيحي فقط")
  }, 1200)
}

// PinConfirm — demo "backend": only 111111 succeeds, everything else rejects.
const pinConfirmOpen = ref(false)
async function handlePinConfirmDemo(code: string) {
  await new Promise((resolve) => setTimeout(resolve, 700))
  if (code !== "111111") throw new Error("رمز غير صحيح — جرّب 111111 في هذا العرض التوضيحي")
}

// Composites A — Amount / DocNo / TotalsStrip / StatusSwitch / SettingRow /
// AsyncConfirmDialog / ReasonPinDialog demos (local state only).
const totalsDemo = [
  {
    currency: "د.ل",
    items: [
      { label: "المتبقي", value: 311843.61092 },
      { label: "المدفوع", value: 1660000 },
      { label: "الإجمالي", value: 1971843.61092 },
    ],
  },
  { currency: "$", items: [{ label: "المتبقي", value: 4820.5 }] },
]
const statusSwitchOn = ref(true)
const statusSwitchOff = ref(false)
const sellingOn = ref(true)
const settingConfirmOpen = ref(false)
const settingConfirmFails = ref(true)
async function confirmSettingDemo() {
  await new Promise((resolve) => setTimeout(resolve, 600))
  // First attempt is refused so the inline error shows; the retry succeeds.
  if (settingConfirmFails.value) {
    settingConfirmFails.value = false
    throw new Error("تعذّر تنفيذ العملية — حاول مرة أخرى")
  }
}
function onSettingConfirmed() {
  sellingOn.value = !sellingOn.value
  settingConfirmFails.value = true
}
const reasonPinOpen = ref(false)
async function confirmReasonPinDemo(_reason: string, pin: string) {
  await new Promise((resolve) => setTimeout(resolve, 700))
  if (pin !== "1111") throw new Error("رمز غير صحيح — جرّب 1111 في هذا العرض التوضيحي")
}

// Composites B — FilterChips / FilterSheet / SearchableSelect / MultiSelect /
// DateField / TimeField / CompactPager / LookupChipBoard demos (local state only).
const regionOptions = [
  { value: "tripoli", label: "طرابلس" },
  { value: "benghazi", label: "بنغازي" },
  { value: "misrata", label: "مصراتة" },
  { value: "kufra", label: "الكفرة" },
  { value: "ajdabiya", label: "أجدابيا" },
  { value: "sabha", label: "سبها" },
]
const filterRegion = ref("")
const filterRegions = ref<string[]>([])
const filterFrom = ref("")
const filterTo = ref("")
const filterTime = ref("")
const filterChips = computed<FilterChip[]>(() => {
  const chips: FilterChip[] = []
  if (filterRegion.value) {
    chips.push({
      id: "region",
      text: regionOptions.find((o) => o.value === filterRegion.value)?.label ?? "",
      clear: () => (filterRegion.value = ""),
    })
  }
  if (filterFrom.value) {
    chips.push({
      id: "from",
      text: "من",
      num: filterFrom.value.replaceAll("-", "/"),
      clear: () => (filterFrom.value = ""),
    })
  }
  if (filterTo.value) {
    chips.push({
      id: "to",
      text: "إلى",
      num: filterTo.value.replaceAll("-", "/"),
      clear: () => (filterTo.value = ""),
    })
  }
  return chips
})
const filterCount = computed(
  () => filterChips.value.length + (filterRegions.value.length ? 1 : 0),
)
function clearDemoFilters() {
  filterRegion.value = ""
  filterRegions.value = []
  filterFrom.value = ""
  filterTo.value = ""
}
const compactPage = ref(0)
const lookupChips = ref<LookupChip[]>([
  { id: 1, name: "كروت شحن" },
  { id: 2, name: "كروت خدمات" },
  { id: 3, name: "فواتير" },
])
let lookupSeq = 4
function onLookupCreate(name: string, done: (ok: boolean) => void) {
  setTimeout(() => {
    lookupChips.value = [...lookupChips.value, { id: lookupSeq++, name }]
    done(true)
  }, 400)
}
function onLookupRename(item: LookupChip, name: string, done: (ok: boolean) => void) {
  setTimeout(() => {
    lookupChips.value = lookupChips.value.map((c) => (c.id === item.id ? { ...c, name } : c))
    done(true)
  }, 400)
}
function onLookupRemove(item: LookupChip) {
  lookupChips.value = lookupChips.value.filter((c) => c.id !== item.id)
}

/* ------------------------------ Composites C ------------------------------ */
// ChartState — one toggle walks the gate's four states over the line chart.
const chartStateDemo = ref<"ready" | "loading" | "error" | "empty">("ready")
const chartDuration = useChartDuration()

// DaybookList — kinds are page-owned: the page maps its API type to a kind key.
const daybookKinds: Record<string, DaybookKind> = {
  charge: { icon: WalletIcon, tone: "primary", sign: 1 },
  receipt: { icon: HandCoinsIcon, tone: "success", sign: -1 },
  transfer: { icon: ArrowLeftRightIcon, tone: "warning", sign: 0 },
}
function localStamp(daysAgo: number, hour: number, minute: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(hour)}:${pad(minute)}:00`
}
const daybookPage = ref(0)
const daybookRefreshing = ref(false)
const daybookPages: DaybookEntry[][] = [
  [
    { id: 1, at: localStamp(0, 10, 42), kind: "charge", label: "شحن رصيد — سوق النموذج", amount: 2500, currency: "د.ل" },
    { id: 2, at: localStamp(0, 9, 15), kind: "receipt", label: "إيصال قبض — مكتبة النموذج", amount: 1310.27591, currency: "د.ل" },
    { id: 3, at: localStamp(1, 17, 5), kind: "transfer", label: "تحويل بين المحافظ", amount: 800, currency: "د.ل" },
    { id: 4, at: localStamp(1, 11, 30), kind: "charge", label: "شحن رصيد — قهوة النموذج", amount: 450.5, currency: "د.ل" },
  ],
  [
    { id: 5, at: localStamp(3, 14, 0), kind: "receipt", label: "إيصال قبض — صيدلية الشفاء التجريبية", amount: 3200, currency: "د.ل" },
    { id: 6, at: localStamp(3, 8, 20), kind: "unknown", label: "حركة غير مصنّفة", amount: 12.5, currency: "د.ل" },
  ],
]
const daybookRows = computed(() => daybookPages[daybookPage.value] ?? [])
function setDaybookPage(next: number) {
  daybookRefreshing.value = true
  setTimeout(() => {
    daybookPage.value = next
    daybookRefreshing.value = false
  }, 500)
}

// AttachmentViewer — inline SVG data URLs for the images and a local blob: URL
// for the document (no external URLs; the viewer refuses data: for non-images).
// Colours are read from the live theme tokens so the demo images follow the palette.
const attachmentOpen = ref<string | number | null>(null)
function tokenColor(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
function demoSvg(label: string, bg: string, fg: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" rx="24" fill="${tokenColor(bg)}"/><circle cx="520" cy="90" r="46" fill="${tokenColor(fg)}" opacity="0.35"/><text x="320" y="215" font-family="sans-serif" font-size="40" text-anchor="middle" fill="${tokenColor(fg)}">${label}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
const demoDocUrl = URL.createObjectURL(new Blob(["demo"], { type: "text/plain" }))
onBeforeUnmount(() => URL.revokeObjectURL(demoDocUrl))
const demoAttachments = computed<Attachment[]>(() => [
  { id: "a1", name: "receipt-2041.svg", url: demoSvg("RECEIPT 2041", "--primary", "--primary-foreground"), mime: "image/svg+xml" },
  { id: "a2", name: "id-card-front.svg", url: demoSvg("ID CARD", "--muted", "--foreground"), mime: "image/svg+xml" },
  { id: "a3", name: "contract.docx", url: demoDocUrl, mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
])

// NotificationBell — an in-memory adapter (a real one maps these four calls to
// the backend's endpoints). Latency is simulated so the skeleton shows.
const demoNotifications = ref<NotificationItem[]>([
  { id: "n1", event: "mentioned", resource: "tickets", title: "تمت الإشارة إليك في التذكرة #812", body: "قسم الدعم يطلب مراجعة الإدارة لطلب الاسترداد.", link: "/reference/tables", readAt: null, createdAt: localStamp(0, 9, 10) },
  { id: "n2", event: "transferred", resource: "tickets", title: "حُوّلت إليك التذكرة #807", body: "من قسم المبيعات إلى قسم المالية.", readAt: null, createdAt: localStamp(1, 15, 40) },
  { id: "n3", event: "ready", resource: "reports", title: "تقرير المبيعات الشهري جاهز", body: "اكتمل التصدير ويمكن تنزيله الآن.", link: "/reference/overview", readAt: localStamp(2, 9, 0), createdAt: localStamp(2, 8, 30) },
])
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const demoNotificationAdapter: NotificationAdapter = {
  async fetchCount() {
    return demoNotifications.value.filter((n) => !n.readAt).length
  },
  async fetchList() {
    await wait(600)
    return demoNotifications.value.map((n) => ({ ...n }))
  },
  async markRead(id) {
    const n = demoNotifications.value.find((x) => x.id === id)
    if (n) n.readAt = new Date().toISOString()
  },
  async markAll() {
    await wait(300)
    const now = new Date().toISOString()
    for (const n of demoNotifications.value) n.readAt ??= now
  },
}
const notificationEventIcons = { mentioned: AtSignIcon, transferred: ArrowLeftRightIcon }
const notificationResourceIcons = { tickets: TicketIcon, reports: FileChartColumnIcon }
const notificationEventTones = {
  mentioned: "bg-primary/15 text-primary",
  transferred: "bg-warning/15 text-warning",
  ready: "bg-success/15 text-success",
}

// StickySubmitBar + useLeaveGuard — while the fake upload runs, leaving the
// page asks first and closing the tab is blocked.
const submitBarBusy = ref(false)
useLeaveGuard(submitBarBusy)
function runSubmitBarDemo() {
  submitBarBusy.value = true
  setTimeout(() => {
    submitBarBusy.value = false
    toast.success("تم رفع 120 كرتاً")
  }, 2500)
}

// Timeline
const timelineDemoItems: TimelineItem[] = [
  {
    time: "قبل 4 دقائق",
    text: "أضاف مستخدم تجريبي نقطة بيع جديدة في بنغازي",
    icon: StoreIcon,
    tone: "primary",
  },
  {
    time: "قبل 22 دقيقة",
    text: "غيّر حد السحب اليومي لنقطة البيع «سوق النموذج»",
    diff: { field: "الحد اليومي", from: "5,000 د.ل", to: "8,000 د.ل" },
  },
  { time: "قبل ساعة", text: "فعّل مستخدم تجريبي خطة محفظة «الباقة التجريبية»" },
  { time: "قبل 3 ساعات", text: "تم تسوية فاتورة مسوّق تجريبي" },
]

// StatCard / EmptyState loading & error demo toggles
const statCardDemoState = ref<"data" | "loading" | "error">("data")
const emptyStateDemoState = ref<"empty" | "loading" | "error">("empty")

/* ------------------------------ Plan 009 demos ---------------------------- */
// FileDropzone — tiny accept/size limits on purpose, so any real file is easy
// to bounce off one of the two rejection reasons for the demo.
const uploadDemoFiles = ref<File[]>([])
const tabsDemoFiles = ref<File[]>([])
function handleUploadDemoRejected(rejectedFiles: File[], reason: string) {
  const count = rejectedFiles.length
  toast.error(`${count} ${count === 1 ? "ملف مرفوض" : "ملفات مرفوضة"} — ${reason}`)
}

// useAsyncJob — simulated export job: 1s "queue" (startFn latency) then 3
// polls at 800ms advancing progress 30/60/100. The failure demo reuses the
// same checkFn/instance via a `shouldFail` flag carried on the job handle.
interface DemoExportHandle {
  shouldFail: boolean
  polls: number
}

function startDemoExport(shouldFail: boolean) {
  return () =>
    new Promise<DemoExportHandle>((resolve) => {
      setTimeout(() => resolve({ shouldFail, polls: 0 }), 1000)
    })
}

function buildDemoCsv(): Blob {
  const rows = [
    ["المرجع", "التاريخ", "المبلغ"],
    ["TX-84918", "2026-07-01", "482.50"],
    ["TX-84920", "2026-07-03", "129.00"],
    ["TX-84925", "2026-07-05", "760.25"],
  ]
  return new Blob([rows.map((row) => row.join(",")).join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
}

async function checkDemoExport(handle: DemoExportHandle): Promise<AsyncJobCheckResult<Blob>> {
  handle.polls += 1
  if (handle.shouldFail && handle.polls >= 2) {
    return { status: "failed", error: "تعذّر إنشاء التقرير — حاول مرة أخرى" }
  }
  if (handle.polls >= 3) {
    return { status: "done", result: buildDemoCsv() }
  }
  return { status: "running", progress: handle.polls * 30 }
}

const {
  status: exportStatus,
  progress: exportProgress,
  error: exportError,
  result: exportResult,
  start: startExportJob,
} = useAsyncJob(checkDemoExport, { interval: 800 })

// Total over every AsyncJobStatus (including "idle") on purpose: the badge
// block is only rendered once status !== "idle" (see the template's v-if),
// but keeping the record total avoids depending on vue-tsc narrowing the
// ref's type across that v-if when the map is indexed a level down.
const exportStatusMeta: Record<
  AsyncJobStatus,
  { label: string; variant: BadgeVariants["variant"] }
> = {
  idle: { label: "—", variant: "outline" },
  queued: { label: "قيد الانتظار", variant: "secondary" },
  running: { label: "جارٍ التنفيذ", variant: "outline" },
  done: { label: "اكتمل", variant: "success" },
  failed: { label: "فشل", variant: "destructive" },
}

const exportDemoBusy = computed(
  () => exportStatus.value === "queued" || exportStatus.value === "running",
)
const lastExportDemoWasFailure = ref(false)

function runExportDemo(shouldFail: boolean) {
  lastExportDemoWasFailure.value = shouldFail
  void startExportJob(startDemoExport(shouldFail))
}

function retryExportDemo() {
  runExportDemo(lastExportDemoWasFailure.value)
}

function downloadDemoReport() {
  if (!exportResult.value) return
  const url = URL.createObjectURL(exportResult.value)
  const link = document.createElement("a")
  link.href = url
  link.download = "تقرير-المبيعات.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="المكوّنات"
      description="مرجع حي لكل مكوّنات النظام — 43 مكوّنًا بأمثلة عربية RTL"
    />

    <!-- Sticky TOC -->
    <div
      class="sticky top-0 z-20 -mx-4 border-b bg-background/85 px-4 py-2.5 backdrop-blur-md md:-mx-8 md:px-8"
    >
      <nav aria-label="فهرس المكوّنات" class="flex gap-1.5 overflow-x-auto pb-0.5">
        <button
          v-for="section in sections"
          :key="section.id"
          class="shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          @click="goTo(section.id)"
        >
          {{ section.label }}
        </button>
      </nav>
    </div>

    <!-- Buttons -->
    <ShowcaseSection
      section-id="buttons"
      title="الأزرار"
      hint="استخدم متغيّرًا واحدًا أساسيًا في كل شاشة، والباقي للأفعال الثانوية."
    >
      <div class="space-y-5">
        <div class="flex flex-wrap items-center gap-2">
          <Button>أساسي</Button>
          <Button variant="outline">محدد</Button>
          <Button variant="secondary">ثانوي</Button>
          <Button variant="ghost">شبح</Button>
          <Button variant="destructive">حذف</Button>
          <Button variant="link">رابط</Button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Button size="xs">صغير جدًا</Button>
          <Button size="sm">صغير</Button>
          <Button>افتراضي</Button>
          <Button size="lg">كبير</Button>
          <Button size="icon" variant="outline" aria-label="الإشعارات">
            <BellIcon class="size-4" />
          </Button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Button disabled>معطّل</Button>
          <Button variant="outline">
            <DownloadIcon class="size-4" />
            مع أيقونة
          </Button>
          <Button class="glow-primary">
            <PlusIcon class="size-4" />
            الإجراء الرئيسي المتوهّج
          </Button>
        </div>
      </div>
    </ShowcaseSection>

    <!-- Badges -->
    <ShowcaseSection
      section-id="badges"
      title="الشارات"
      hint="للحالات والوسوم القصيرة — لا تستخدمها كأزرار."
    >
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <Badge>أساسية</Badge>
          <Badge variant="secondary">ثانوية</Badge>
          <Badge variant="destructive">مرفوضة</Badge>
          <Badge variant="outline">محددة</Badge>
          <Badge variant="ghost">شبح</Badge>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          حالات المعاملات:
          <Badge>مكتملة</Badge>
          <Badge variant="secondary">معلّقة</Badge>
          <Badge variant="destructive">مرفوضة</Badge>
          <Badge variant="outline" class="num">TX-84918</Badge>
        </div>
      </div>
    </ShowcaseSection>

    <!-- Avatars -->
    <ShowcaseSection
      section-id="avatars"
      title="الصور الرمزية"
      hint="الأحرف الأولى كبديل دائم — لا صور خارجية في نسخة العرض."
    >
      <div class="flex flex-wrap items-center gap-6">
        <div class="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>هش</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>خت</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback class="bg-primary/15 text-primary">عب</AvatarFallback>
          </Avatar>
        </div>
        <Separator orientation="vertical" class="h-8 max-sm:hidden" />
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>أم</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>سع</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>هش</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+5</AvatarGroupCount>
        </AvatarGroup>
      </div>
    </ShowcaseSection>

    <!-- Alerts -->
    <ShowcaseSection
      section-id="alerts"
      title="التنبيهات"
      hint="للرسائل الثابتة داخل الصفحة — استخدم Sonner للأحداث العابرة."
    >
      <div class="space-y-3">
        <Alert variant="success">
          <CircleCheckIcon class="size-4" />
          <AlertTitle>تم اعتماد طلب الكروت</AlertTitle>
          <AlertDescription>
            سيصل مندوب التوزيع إلى «سوق النموذج» خلال 48 ساعة. رقم الطلب
            <span class="num">ORD-2214</span>.
          </AlertDescription>
        </Alert>
        <Alert variant="warning">
          <TriangleAlertIcon class="size-4" />
          <AlertTitle>المخزون يقترب من الحد الأدنى</AlertTitle>
          <AlertDescription>
            تبقّى <span class="num">215</span> كرت ليبيانا <span class="num">50</span> في مخزن
            بنغازي — أعد الطلب قبل نهاية الأسبوع.
          </AlertDescription>
        </Alert>
        <Alert variant="info">
          <InfoIcon class="size-4" />
          <AlertTitle>تحديث مجدول للنظام</AlertTitle>
          <AlertDescription>
            صيانة يوم الخميس بين <span class="num">02:00</span> و<span class="num">04:00</span>
            فجرًا — قد تتأخر التسويات لدقائق.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <CircleXIcon class="size-4" />
          <AlertTitle>فشل تجديد الاشتراك</AlertTitle>
          <AlertDescription>
            رصيد المحفظة غير كافٍ. أعد المحاولة بعد شحن الرصيد أو تواصل مع مشرف منطقتك.
          </AlertDescription>
        </Alert>
      </div>
    </ShowcaseSection>

    <!-- Inputs -->
    <ShowcaseSection
      section-id="inputs"
      title="حقول الإدخال"
      hint="التسمية فوق الحقل دائمًا، ونص المساعدة أو الخطأ أسفله."
    >
      <div class="grid gap-5 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="demo-input">اسم نقطة البيع</Label>
          <Input id="demo-input" placeholder="مثال: مقهى النموذج" />
        </div>
        <div class="space-y-2">
          <Label for="demo-disabled">حقل معطّل</Label>
          <Input id="demo-disabled" disabled model-value="هواتف النموذج" />
        </div>
        <div class="space-y-2">
          <Label for="demo-search">مع أيقونة</Label>
          <div class="relative">
            <SearchIcon
              class="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input id="demo-search" placeholder="ابحث عن معاملة…" class="ps-8" />
          </div>
        </div>
        <div class="space-y-2">
          <Label for="demo-error">حالة الخطأ</Label>
          <Input
            id="demo-error"
            aria-invalid="true"
            model-value="091234"
            class="num"
            aria-describedby="demo-error-hint"
          />
          <p id="demo-error-hint" class="text-xs text-destructive">
            الرقم ناقص — يجب أن يتكوّن من 10 أرقام
          </p>
        </div>
        <div class="space-y-2 sm:col-span-2">
          <Label for="demo-amount">مجموعة إدخال (InputGroup)</Label>
          <InputGroup class="max-w-xs">
            <InputGroupInput id="demo-amount" placeholder="0.00" class="num" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>د.ل</InputGroupText>
            </InputGroupAddon>
            <InputGroupAddon>
              <WalletIcon aria-hidden="true" />
            </InputGroupAddon>
          </InputGroup>
          <p class="text-xs text-muted-foreground">
            حقل مبلغ مع وحدة العملة وأيقونة في مجموعة واحدة
          </p>
        </div>
      </div>
    </ShowcaseSection>

    <!-- Textarea -->
    <ShowcaseSection
      section-id="textarea"
      title="مساحة النص"
      hint="تتمدد تلقائيًا مع المحتوى (field-sizing)."
    >
      <div class="max-w-md space-y-2">
        <Label for="demo-textarea">ملاحظات التسليم</Label>
        <Textarea
          id="demo-textarea"
          placeholder="مثال: التسليم بعد الظهر، والاتصال قبل الوصول بنصف ساعة…"
        />
        <p class="text-xs text-muted-foreground">تظهر الملاحظات لمندوب التوزيع فقط</p>
      </div>
    </ShowcaseSection>

    <!-- Select -->
    <ShowcaseSection
      section-id="select"
      title="القوائم المنسدلة"
      hint="للاختيار من قائمة محددة — استخدم Command عند الحاجة للبحث."
    >
      <div class="flex flex-wrap items-end gap-4">
        <div class="space-y-2">
          <Label for="demo-select">المنطقة</Label>
          <Select v-model="selectDemo">
            <SelectTrigger id="demo-select" class="w-44">
              <SelectValue placeholder="اختر المنطقة" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>الساحل</SelectLabel>
                <SelectItem value="tripoli">طرابلس</SelectItem>
                <SelectItem value="benghazi">بنغازي</SelectItem>
                <SelectItem value="misrata">مصراتة</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>الجنوب</SelectLabel>
                <SelectItem value="sabha">سبها</SelectItem>
                <SelectItem value="ubari">أوباري</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="demo-select-disabled">معطّلة</Label>
          <Select disabled>
            <SelectTrigger id="demo-select-disabled" class="w-44">
              <SelectValue placeholder="غير متاحة حاليًا" />
            </SelectTrigger>
            <SelectContent />
          </Select>
        </div>
      </div>
    </ShowcaseSection>

    <!-- Selection controls -->
    <ShowcaseSection
      section-id="selection"
      title="عناصر الاختيار"
      hint="Checkbox للتعدد، Radio للتفرد، وSwitch للتفعيل الفوري."
    >
      <div class="grid gap-6 sm:grid-cols-3">
        <div class="space-y-3">
          <p class="text-xs font-medium text-muted-foreground">مربعات الاختيار</p>
          <div class="flex items-center gap-2">
            <Checkbox id="chk-1" v-model="checkDemo" />
            <Label for="chk-1" class="font-normal">كروت ليبيانا</Label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="chk-2" v-model="checkDemo2" />
            <Label for="chk-2" class="font-normal">كروت المدار</Label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="chk-3" disabled :model-value="true" />
            <Label for="chk-3" class="font-normal">تحصيل فواتير (إلزامي)</Label>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-medium text-muted-foreground">أزرار الراديو</p>
          <RadioGroup v-model="radioDemo" class="gap-3">
            <div class="flex items-center gap-2">
              <RadioGroupItem id="radio-daily" value="daily" />
              <Label for="radio-daily" class="font-normal">تسوية يومية</Label>
            </div>
            <div class="flex items-center gap-2">
              <RadioGroupItem id="radio-weekly" value="weekly" />
              <Label for="radio-weekly" class="font-normal">تسوية أسبوعية</Label>
            </div>
            <div class="flex items-center gap-2">
              <RadioGroupItem id="radio-monthly" value="monthly" />
              <Label for="radio-monthly" class="font-normal">تسوية شهرية</Label>
            </div>
          </RadioGroup>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-medium text-muted-foreground">المفاتيح</p>
          <div class="flex items-center gap-2">
            <Switch id="switch-1" v-model="switchDemo" />
            <Label for="switch-1" class="font-normal">تنبيهات فورية</Label>
          </div>
          <div class="flex items-center gap-2">
            <Switch id="switch-2" v-model="switchDemo2" size="sm" />
            <Label for="switch-2" class="font-normal">وضع الصيانة (صغير)</Label>
          </div>
          <div class="flex items-center gap-2">
            <Switch id="switch-3" disabled :model-value="true" />
            <Label for="switch-3" class="font-normal">معطّل</Label>
          </div>
        </div>
      </div>
    </ShowcaseSection>

    <!-- Pin input -->
    <ShowcaseSection
      section-id="pin-input"
      title="رمز التحقق"
      hint="أرقام LTR دائمًا حتى في الواجهة العربية — استخدم dir=ltr."
    >
      <div class="space-y-3">
        <PinInput
          v-model="pinDemo"
          placeholder="○"
          otp
          dir="ltr"
          aria-label="رمز التحقق المكوّن من 6 أرقام"
        >
          <PinInputGroup class="gap-1.5 sm:gap-2">
            <PinInputSlot
              v-for="(cell, index) in 6"
              :key="cell"
              :index="index"
              class="num size-8 rounded-lg border text-base sm:size-10 sm:text-lg"
            />
          </PinInputGroup>
        </PinInput>
        <p class="text-xs text-muted-foreground">
          القيمة الحالية:
          <span class="num">{{ pinDemo.join("") || "—" }}</span>
        </p>
      </div>
    </ShowcaseSection>

    <!-- PinConfirm -->
    <ShowcaseSection
      section-id="pin-confirm"
      title="تأكيد بالرمز"
      hint="البوابة الموحّدة لأي إجراء مالي — لا تُعِد بناء PinInput خاصًا بك، استخدم هذا المكوّن. جرّب الرمز 111111 للنجاح، وأي رمز آخر لرؤية حالة الخطأ."
    >
      <div class="space-y-3">
        <Button class="glow-primary" @click="pinConfirmOpen = true">
          <WalletIcon class="size-4" />
          سحب 500 د.ل
        </Button>
        <PinConfirm
          v-model:open="pinConfirmOpen"
          title="تأكيد عملية السحب"
          description="أدخل رمز التأكيد المكوّن من 6 أرقام لإتمام سحب 500 د.ل."
          :on-confirm="handlePinConfirmDemo"
          @success="toast.success('تم تنفيذ عملية السحب')"
          @resend="toast.info('تم إرسال رمز جديد')"
        />
      </div>
    </ShowcaseSection>

    <!-- Tabs -->
    <ShowcaseSection
      section-id="tabs"
      title="التبويبات"
      hint="لمحتوى متوازٍ من نفس النوع — لا تتجاوز خمسة تبويبات."
    >
      <div class="space-y-8">
        <Tabs default-value="week" class="max-w-md">
          <TabsList>
            <TabsTrigger value="week">أسبوع</TabsTrigger>
            <TabsTrigger value="month">شهر</TabsTrigger>
            <TabsTrigger value="year">سنة</TabsTrigger>
          </TabsList>
          <TabsContent value="week" class="text-muted-foreground">
            مبيعات آخر أسبوع: <span class="num text-foreground">482,940</span> د.ل عبر
            <span class="num text-foreground">2,208</span> نقطة بيع.
          </TabsContent>
          <TabsContent value="month" class="text-muted-foreground">
            مبيعات الشهر: <span class="num text-foreground">1,482,940</span> د.ل بنمو
            <span class="num text-foreground">+12.4%</span>.
          </TabsContent>
          <TabsContent value="year" class="text-muted-foreground">
            مبيعات السنة حتى اليوم: <span class="num text-foreground">9.6M</span> د.ل.
          </TabsContent>
        </Tabs>

        <Tabs default-value="all" class="max-w-lg">
          <TabsList>
            <TabsTrigger value="all"><InboxIcon />الكل</TabsTrigger>
            <TabsTrigger value="pending">
              <ClockIcon />معلّقة <Badge variant="warning" class="num">7</Badge>
            </TabsTrigger>
            <TabsTrigger value="done"><CircleCheckIcon />ناجحة</TabsTrigger>
          </TabsList>
          <TabsContent value="all" class="text-muted-foreground">
            كل العمليات — التبويبات تتسع للأيقونات والشارات دون تغيير الارتفاع.
          </TabsContent>
          <TabsContent value="pending" class="text-muted-foreground">
            <span class="num text-foreground">7</span> عمليات بانتظار التأكيد.
          </TabsContent>
          <TabsContent value="done" class="text-muted-foreground">
            آخر عملية ناجحة قبل <span class="num text-foreground">12</span> دقيقة.
          </TabsContent>
        </Tabs>

        <Tabs default-value="details">
          <TabsList variant="line">
            <TabsTrigger value="details">التفاصيل</TabsTrigger>
            <TabsTrigger value="history">السجل</TabsTrigger>
            <TabsTrigger value="files">المرفقات</TabsTrigger>
          </TabsList>
          <TabsContent value="details" class="text-muted-foreground">
            نمط line بمؤشر متحرك — الأنسب لصفحات التفاصيل وداخل البطاقات.
          </TabsContent>
          <TabsContent value="history" class="text-muted-foreground"
            >آخر تعديل قبل <span class="num text-foreground">3</span> ساعات.</TabsContent
          >
          <TabsContent value="files" class="max-w-md">
            <FileDropzone v-model="tabsDemoFiles" multiple />
          </TabsContent>
        </Tabs>
      </div>
    </ShowcaseSection>

    <!-- Dialog -->
    <ShowcaseSection
      section-id="dialog"
      title="الحوار"
      hint="لمهمة قصيرة تتطلب تركيز المستخدم — أغلقه بعد النجاح."
    >
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="outline">تعديل بيانات نقطة البيع</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات نقطة البيع</DialogTitle>
            <DialogDescription>عدّل الاسم الظاهر في التقارير ثم احفظ.</DialogDescription>
          </DialogHeader>
          <div class="space-y-2">
            <Label for="dialog-name">الاسم التجاري</Label>
            <Input id="dialog-name" model-value="قهوة النموذج" />
          </div>
          <DialogFooter>
            <DialogClose as-child>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <DialogClose as-child>
              <Button @click="toast.success('تم حفظ الاسم الجديد')">حفظ</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ShowcaseSection>

    <!-- Alert dialog -->
    <ShowcaseSection
      section-id="alert-dialog"
      title="حوار التأكيد"
      hint="للأفعال غير القابلة للتراجع فقط — الفعل المدمّر بلون destructive."
    >
      <AlertDialog>
        <AlertDialogTrigger as-child>
          <Button variant="destructive">
            <Trash2Icon class="size-4" />
            حذف نقطة البيع
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف «مخبز النموذج»؟</AlertDialogTitle>
            <AlertDialogDescription>
              ستتوقف نقطة البيع فورًا وتُحذف بياناتها بعد
              <span class="num">30</span>
              يومًا. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>تراجع</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              @click="toast.success('تم حذف نقطة البيع (عرض توضيحي)')"
            >
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ShowcaseSection>

    <!-- Sheet -->
    <ShowcaseSection
      section-id="sheet"
      title="اللوحة الجانبية"
      hint="لعرض تفاصيل أو نماذج جانبية دون مغادرة السياق."
    >
      <Sheet>
        <SheetTrigger as-child>
          <Button variant="outline">عرض تفاصيل المعاملة</Button>
        </SheetTrigger>
        <SheetContent class="p-6">
          <SheetHeader class="p-0">
            <SheetTitle>المعاملة <span class="num">TX-84918</span></SheetTitle>
            <SheetDescription>شراء كروت — سوبرماركت النموذج</SheetDescription>
          </SheetHeader>
          <dl class="flex-1 space-y-3 text-sm">
            <div class="flex justify-between border-b pb-3">
              <dt class="text-muted-foreground">المبلغ</dt>
              <dd><span class="num font-medium">21,300</span> د.ل</dd>
            </div>
            <div class="flex justify-between border-b pb-3">
              <dt class="text-muted-foreground">التاريخ</dt>
              <dd class="num">2026-07-09 14:22</dd>
            </div>
            <div class="flex justify-between border-b pb-3">
              <dt class="text-muted-foreground">الحالة</dt>
              <dd><Badge>مكتملة</Badge></dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-muted-foreground">العمولة</dt>
              <dd><span class="num font-medium">500</span> د.ل</dd>
            </div>
          </dl>
          <SheetFooter class="p-0">
            <SheetClose as-child>
              <Button variant="outline" class="w-full">إغلاق</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </ShowcaseSection>

    <!-- Dropdown menu -->
    <ShowcaseSection
      section-id="dropdown"
      title="القائمة المنسدلة"
      hint="لأفعال السياق — رتّب الأخطر في الأسفل بعد فاصل."
    >
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">
            خيارات الطلب
            <ChevronsUpDownIcon class="size-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-52">
          <DropdownMenuLabel>الطلب <span class="num">ORD-2214</span></DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @select="toast.success('تم نسخ رقم الطلب')">
            <CopyIcon class="size-4" />
            نسخ الرقم
          </DropdownMenuItem>
          <DropdownMenuItem @select="toast.info('تمت مشاركة الطلب مع المشرف')">
            <SendIcon class="size-4" />
            مشاركة مع المشرف
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem v-model="archiveVisible">
            إظهار في الأرشيف
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" @select="toast.error('تم إلغاء الطلب')">
            <Trash2Icon class="size-4" />
            إلغاء الطلب
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ShowcaseSection>

    <!-- Command -->
    <ShowcaseSection
      section-id="command"
      title="لوحة الأوامر"
      hint="بحث وتنقّل سريع — النسخة الحوارية مربوطة بـ ⌘K في الشريط العلوي."
    >
      <Command class="max-w-sm rounded-xl border">
        <CommandInput placeholder="ابحث عن صفحة أو أمر…" />
        <CommandList>
          <CommandEmpty>لا توجد نتائج.</CommandEmpty>
          <CommandGroup heading="الصفحات">
            <CommandItem value="نظرة عامة" @select="toast.info('الانتقال إلى نظرة عامة (عرض)')">
              <LayoutDashboardIcon class="size-4" />
              نظرة عامة
            </CommandItem>
            <CommandItem value="الجداول" @select="toast.info('الانتقال إلى الجداول (عرض)')">
              <Table2Icon class="size-4" />
              الجداول
            </CommandItem>
            <CommandItem value="الإعدادات" @select="toast.info('الانتقال إلى الإعدادات (عرض)')">
              <SettingsIcon class="size-4" />
              الإعدادات
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="أوامر">
            <CommandItem value="تصدير تقرير" @select="toast.success('تم تصدير التقرير')">
              <DownloadIcon class="size-4" />
              تصدير تقرير
            </CommandItem>
            <CommandItem
              value="تبديل المظهر"
              @select="toast.info('استخدم زر المظهر في الشريط العلوي')"
            >
              <MoonStarIcon class="size-4" />
              تبديل المظهر
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </ShowcaseSection>

    <!-- Tooltip -->
    <ShowcaseSection
      section-id="tooltip"
      title="التلميح"
      hint="إلزامي على كل زر أيقونة بلا نص، مع aria-label عربي."
    >
      <div class="flex flex-wrap items-center gap-3">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline">مرّر المؤشر فوقي</Button>
          </TooltipTrigger>
          <TooltipContent>هذا تلميح بسيط</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" aria-label="بطاقات الدفع">
              <CreditCardIcon class="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>بطاقات الدفع</TooltipContent>
        </Tooltip>
      </div>
    </ShowcaseSection>

    <!-- Popover -->
    <ShowcaseSection
      section-id="popover"
      title="البطاقة المنبثقة"
      hint="لمحتوى تفاعلي خفيف مرتبط بعنصر — أثقل من التلميح وأخف من الحوار."
    >
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline">إعدادات التصدير</Button>
        </PopoverTrigger>
        <PopoverContent class="w-72">
          <PopoverHeader>
            <PopoverTitle>إعدادات التصدير</PopoverTitle>
            <PopoverDescription>تُطبّق على ملف CSV الناتج</PopoverDescription>
          </PopoverHeader>
          <div class="mt-3 space-y-3">
            <div class="grid grid-cols-[1fr_100px] items-center gap-2">
              <Label for="pop-rows" class="font-normal text-muted-foreground">عدد الصفوف</Label>
              <Input id="pop-rows" model-value="500" class="num h-7" />
            </div>
            <div class="grid grid-cols-[1fr_100px] items-center gap-2">
              <Label for="pop-days" class="font-normal text-muted-foreground">آخر (يوم)</Label>
              <Input id="pop-days" model-value="30" class="num h-7" />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </ShowcaseSection>

    <!-- Progress -->
    <ShowcaseSection
      section-id="progress"
      title="شريط التقدم"
      hint="أرفقه دائمًا بنسبة رقمية بخط الأرقام الأحادي."
    >
      <div class="max-w-md space-y-5">
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-muted-foreground">رفع كشف الحساب</span>
            <span class="num">24%</span>
          </div>
          <Progress :model-value="24" aria-label="رفع كشف الحساب 24 بالمئة" />
        </div>
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-muted-foreground">مزامنة نقاط البيع</span>
            <span class="num">68%</span>
          </div>
          <Progress :model-value="68" aria-label="مزامنة نقاط البيع 68 بالمئة" />
        </div>
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-muted-foreground">اكتمال التحقق</span>
            <span class="num">92%</span>
          </div>
          <Progress :model-value="92" aria-label="اكتمال التحقق 92 بالمئة" />
        </div>
      </div>
    </ShowcaseSection>

    <!-- Chart -->
    <ShowcaseSection
      section-id="chart"
      title="الرسوم البيانية"
      hint="Unovis بألوان الثيم (--chart-1…5). التلميح يعرض الإجمالي عبر showTotal، والأرقام بخط الأرقام الأحادي."
    >
      <!-- Charts draw LTR by nature (axes, crosshair); labels stay RTL-safe via tokens. -->
      <div dir="ltr">
        <ChartContainer :config="chartConfig" class="aspect-auto h-[240px] w-full" :cursor="false">
          <VisXYContainer :data="chartData">
            <VisLine
              :x="chartX"
              :y="chartY"
              :color="chartColor"
              :line-width="2"
              :curve-type="CurveType.MonotoneX"
            />
            <VisAxis
              type="x"
              :x="chartX"
              :tick-line="false"
              :domain-line="false"
              :grid-line="false"
              :num-ticks="7"
            />
            <VisAxis
              type="y"
              :num-ticks="4"
              :tick-line="false"
              :domain-line="false"
              :tick-format="formatCompact"
            />
            <ChartTooltip />
            <ChartCrosshair
              :template="
                componentToString(chartConfig, ChartTooltipContent, {
                  showTotal: true,
                  totalLabel: 'الإجمالي',
                })
              "
              :color="chartColor"
              :x="chartX"
              :y="chartY"
              :circle-radius="4"
            />
          </VisXYContainer>
          <ChartLegendContent />
        </ChartContainer>
      </div>
    </ShowcaseSection>

    <!-- Skeleton -->
    <ShowcaseSection
      section-id="skeleton"
      title="هياكل التحميل"
      hint="حاكِ شكل المحتوى النهائي — لا مستطيلات عشوائية."
    >
      <div class="max-w-sm space-y-4">
        <div class="flex items-center gap-3">
          <Skeleton class="size-10 rounded-full" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-4 w-2/3" />
            <Skeleton class="h-3 w-1/3" />
          </div>
        </div>
        <Skeleton class="h-24 w-full rounded-xl" />
        <div class="flex gap-2">
          <Skeleton class="h-8 w-24 rounded-lg" />
          <Skeleton class="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </ShowcaseSection>

    <!-- Spinner -->
    <ShowcaseSection
      section-id="spinner"
      title="مؤشر التحميل"
      hint="أظهره داخل الزر أثناء عملية غير متزامنة، وعطّل الزر معه دائمًا حتى لا يُنقر مرتين."
    >
      <div class="space-y-6">
        <div class="flex flex-wrap items-center gap-8">
          <div class="flex flex-col items-center gap-2">
            <Spinner size="sm" />
            <span class="text-[11px] text-muted-foreground">sm</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Spinner />
            <span class="text-[11px] text-muted-foreground">افتراضي</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <span class="text-[11px] text-muted-foreground">lg</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <Button disabled>
            <Spinner size="sm" />
            جارٍ الحفظ…
          </Button>

          <Button variant="outline" :disabled="spinnerDemoLoading" @click="triggerSpinnerDemo">
            <Spinner v-if="spinnerDemoLoading" size="sm" />
            {{ spinnerDemoLoading ? "جارٍ التحميل…" : "جرّب الزر" }}
          </Button>
        </div>
      </div>
    </ShowcaseSection>

    <!-- Table -->
    <ShowcaseSection
      section-id="table"
      title="الجدول"
      hint="أعمدة الأرقام بخط أحادي المسافة — راجع صفحة الجداول للمثال الكامل."
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="text-start">الفئة</TableHead>
            <TableHead class="text-start">سعر التاجر</TableHead>
            <TableHead class="text-start">المخزون</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in priceRows" :key="row.name">
            <TableCell class="font-medium">{{ row.name }}</TableCell>
            <TableCell
              ><span class="num">{{ row.price }}</span>
              <span class="text-xs text-muted-foreground">د.ل</span></TableCell
            >
            <TableCell class="num text-muted-foreground">{{ row.stock }}</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell class="font-medium">الإجمالي المتاح</TableCell>
            <TableCell />
            <TableCell class="num font-medium">2,285</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </ShowcaseSection>

    <!-- DataTable -->
    <ShowcaseSection
      section-id="datatable"
      title="جدول البيانات"
      hint="جدول ذكي مبني على TanStack: ترتيب بالأعمدة، إظهار/إخفاء الأعمدة، وتحديد جماعي يمتد عبر كل الصفحات — راجع صفحة الجداول للمثال الكامل بالحذف."
    >
      <DataTable
        :columns="demoPosColumns"
        :data="demoPosRows"
        :page-size="5"
        :get-row-id="(pos) => pos.id"
        enable-selection
      >
        <template #toolbar="{ table }">
          <p class="text-xs text-muted-foreground">
            رتّب بالضغط على رأس العمود، وأظهِر/أخفِ الأعمدة من القائمة.
          </p>
          <DataTableViewOptions :table="table" class="ms-auto" />
        </template>

        <template #bulk-actions="{ selectedCount, clearSelection }">
          <Button
            variant="outline"
            size="sm"
            @click="toast.success(`إجراء جماعي على ${selectedCount} نقطة بيع`)"
          >
            إجراء جماعي
          </Button>
          <Button variant="ghost" size="sm" @click="clearSelection">إلغاء التحديد</Button>
        </template>

        <template #cell-id="{ value }">
          <span class="num text-xs text-muted-foreground">{{ value }}</span>
        </template>
        <template #cell-name="{ value }">
          <span class="font-medium">{{ value }}</span>
        </template>
        <template #cell-city="{ value }">
          <span class="text-muted-foreground">{{ value }}</span>
        </template>
        <template #cell-sales="{ value }">
          <span class="num">{{ value }}</span>
          <span class="ms-1 text-xs text-muted-foreground">د.ل</span>
        </template>
        <template #cell-status="{ value }">
          <StatusBadge :status="value as string" />
        </template>
      </DataTable>
    </ShowcaseSection>

    <!-- Pagination -->
    <ShowcaseSection
      section-id="pagination"
      title="ترقيم الصفحات"
      hint="أظهر الأطراف دائمًا (show-edges) في الجداول الطويلة."
    >
      <Pagination
        v-model:page="paginationDemo"
        :total="87"
        :items-per-page="10"
        :sibling-count="1"
        show-edges
        class="mx-0 w-auto justify-start"
      >
        <PaginationContent v-slot="{ items }">
          <PaginationPrevious size="sm" aria-label="الصفحة السابقة">
            <ChevronLeftIcon class="size-3.5 rtl:rotate-180" />
            السابق
          </PaginationPrevious>
          <template v-for="(item, index) in items" :key="index">
            <PaginationItem
              v-if="item.type === 'page'"
              :value="item.value"
              :is-active="item.value === paginationDemo"
              size="icon-sm"
              class="num"
            >
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis v-else />
          </template>
          <PaginationNext size="sm" aria-label="الصفحة التالية">
            التالي
            <ChevronRightIcon class="size-3.5 rtl:rotate-180" />
          </PaginationNext>
        </PaginationContent>
      </Pagination>
    </ShowcaseSection>

    <!-- Breadcrumb -->
    <ShowcaseSection
      section-id="breadcrumb"
      title="مسار التنقل"
      hint="اختصر المسارات الأعمق من ثلاثة مستويات بعلامة الحذف."
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">الجداول</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage class="num">TX-84918</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </ShowcaseSection>

    <!-- Toasts -->
    <ShowcaseSection
      section-id="toasts"
      title="الإشعارات المنبثقة"
      hint="للأحداث العابرة — رسالة واحدة واضحة، بلا تفاصيل طويلة."
    >
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="outline" @click="toast.success('تمت تسوية أرباح الأسبوع — 4,860 د.ل')"
          >نجاح</Button
        >
        <Button variant="outline" @click="toast.error('فشل الاتصال بمزوّد الكروت')">خطأ</Button>
        <Button variant="outline" @click="toast.info('تحديث جديد للوحة التحكم متاح')"
          >معلومة</Button
        >
        <Button
          variant="outline"
          @click="toast.warning('انخفض مخزون كروت ليبيانا 10 عن الحد الأدنى')"
          >تحذير</Button
        >
      </div>
    </ShowcaseSection>

    <!-- Collapsible -->
    <ShowcaseSection
      section-id="collapsible"
      title="القابل للطي"
      hint="لإخفاء تفاصيل ثانوية اختيارية دون تبويبات."
    >
      <Collapsible v-model:open="collapsibleOpen" class="max-w-md rounded-xl border">
        <CollapsibleTrigger as-child>
          <button class="flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
            تفاصيل الطلب <span class="num">ORD-2214</span>
            <ChevronsUpDownIcon class="size-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="space-y-2 border-t px-4 py-3 text-sm text-muted-foreground">
            <p>الكمية: <span class="num text-foreground">400</span> كرت ليبيانا 10</p>
            <p>القيمة: <span class="num text-foreground">3,840</span> د.ل بعد الخصم</p>
            <p>التسليم: مخزن بنغازي المركزي — <span class="num">2026-07-13</span></p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </ShowcaseSection>

    <!-- Scroll area -->
    <ShowcaseSection
      section-id="scroll-area"
      title="منطقة التمرير"
      hint="شريط تمرير مخصص للقوائم الطويلة داخل مساحة محدودة."
    >
      <ScrollArea class="h-44 max-w-sm rounded-xl border">
        <ul class="p-3">
          <li
            v-for="(city, index) in scrollCities"
            :key="city"
            class="num rounded-lg px-2 py-2 text-sm text-muted-foreground"
            :class="index % 2 === 1 && 'bg-muted/40'"
          >
            {{ city }}
          </li>
        </ul>
      </ScrollArea>
    </ShowcaseSection>

    <!-- Separator -->
    <ShowcaseSection
      section-id="separator"
      title="الفواصل"
      hint="أفقي بين الأقسام، وعمودي بين العناصر المتجاورة."
    >
      <div class="max-w-sm space-y-4">
        <div class="text-sm">
          <p class="font-medium">إعدادات المحفظة</p>
          <p class="text-xs text-muted-foreground">حدود السحب والتسوية</p>
        </div>
        <Separator />
        <div class="flex h-5 items-center gap-3 text-sm text-muted-foreground">
          <span>الرصيد</span>
          <Separator orientation="vertical" />
          <span class="num">12,480 د.ل</span>
          <Separator orientation="vertical" />
          <span>آخر تسوية <span class="num">2026-07-08</span></span>
        </div>
      </div>
    </ShowcaseSection>

    <!-- Accordion -->
    <ShowcaseSection
      section-id="accordion"
      title="الأكورديون"
      hint="لعرض إجابات شائعة دون إغراق الصفحة — استخدم collapsible للسماح بإغلاق العنصر المفتوح."
    >
      <Accordion type="single" collapsible default-value="q1" class="max-w-xl">
        <AccordionItem value="q1">
          <AccordionTrigger>ما نسبة عمولة السحب من المحفظة؟</AccordionTrigger>
          <AccordionContent>
            تبدأ العمولة من <span class="num">2%</span> وتنخفض تدريجيًا مع زيادة حجم التحصيل
            الشهري — راجع صفحة الإعدادات لجدول العمولات الكامل.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q2">
          <AccordionTrigger>متى تُطبّق التسوية الأسبوعية؟</AccordionTrigger>
          <AccordionContent>
            تُحوَّل الأرباح كل يوم خميس الساعة <span class="num">14:00</span> إلى المحفظة المرتبطة
            بنقطة البيع، بشرط اكتمال التحقق من الهوية.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q3">
          <AccordionTrigger>كيف أستعيد كلمة المرور المفقودة؟</AccordionTrigger>
          <AccordionContent>
            من شاشة الدخول اختر «نسيت كلمة المرور» — سيصلك رمز تحقق عبر رسالة نصية إلى الرقم المسجّل
            خلال دقيقتين.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ShowcaseSection>

    <!-- Toggle group -->
    <ShowcaseSection
      section-id="toggle-group"
      title="أزرار التبديل"
      hint="لاختيار واحد أو أكثر من مجموعة قصيرة ومرئية دائمًا — أخف من أزرار الراديو."
    >
      <div class="space-y-6">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">حالة المعاملات (اختيار واحد)</p>
          <ToggleGroup v-model="statusFilter" type="single" variant="outline" :spacing="2">
            <ToggleGroupItem value="all">الكل</ToggleGroupItem>
            <ToggleGroupItem
              value="completed"
              class="data-[state=on]:border-success/30 data-[state=on]:bg-success/15 data-[state=on]:text-success data-[state=on]:hover:bg-success/25 dark:data-[state=on]:bg-success/20"
            >
              <CircleCheckIcon data-icon="inline-start" class="size-3.5" />
              مكتملة
            </ToggleGroupItem>
            <ToggleGroupItem
              value="pending"
              class="data-[state=on]:border-warning/30 data-[state=on]:bg-warning/15 data-[state=on]:text-warning data-[state=on]:hover:bg-warning/25 dark:data-[state=on]:bg-warning/20"
            >
              <ClockIcon data-icon="inline-start" class="size-3.5" />
              معلّقة
            </ToggleGroupItem>
            <ToggleGroupItem
              value="rejected"
              class="data-[state=on]:border-destructive/30 data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive data-[state=on]:hover:bg-destructive/20 dark:data-[state=on]:bg-destructive/20"
            >
              <CircleXIcon data-icon="inline-start" class="size-3.5" />
              مرفوضة
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">الخدمات المفعّلة (اختيار متعدد)</p>
          <ToggleGroup
            v-model="servicesFilterDemo"
            type="multiple"
            variant="outline"
            size="sm"
            :spacing="2"
          >
            <ToggleGroupItem value="libyana">كروت ليبيانا</ToggleGroupItem>
            <ToggleGroupItem value="madar">كروت المدار</ToggleGroupItem>
            <ToggleGroupItem value="bills">تحصيل فواتير</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </ShowcaseSection>

    <!-- Number field -->
    <ShowcaseSection
      section-id="number-field"
      title="الحقل الرقمي"
      hint="لإدخال كمية محصورة بحدين أدنى وأقصى — الأسهم أو عجلة الفأرة تُغيّر القيمة بمقدار الخطوة."
    >
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="qty-field">كمية الكروت</Label>
          <NumberField id="qty-field" v-model="quantityDemo" :min="1" :max="500" :step="10">
            <NumberFieldContent>
              <NumberFieldDecrement aria-label="إنقاص الكمية" />
              <NumberFieldInput class="num" />
              <NumberFieldIncrement aria-label="زيادة الكمية" />
            </NumberFieldContent>
          </NumberField>
          <p class="text-xs text-muted-foreground">
            الحد الأقصى للطلب الواحد <span class="num">500</span> كرت
          </p>
        </div>
        <div class="space-y-2">
          <Label for="commission-field">نسبة العمولة (%)</Label>
          <NumberField
            id="commission-field"
            v-model="commissionDemo"
            :min="0"
            :max="10"
            :step="0.5"
          >
            <NumberFieldContent>
              <NumberFieldDecrement aria-label="إنقاص النسبة" />
              <NumberFieldInput class="num" />
              <NumberFieldIncrement aria-label="زيادة النسبة" />
            </NumberFieldContent>
          </NumberField>
          <p class="text-xs text-muted-foreground">تُحتسب على صافي التحصيل الشهري</p>
        </div>
      </div>
    </ShowcaseSection>

    <!-- Calendar -->
    <ShowcaseSection
      section-id="calendar"
      title="التقويم"
      hint="مُهيّأ لليبيا: الأسبوع يبدأ سبتًا والأرقام لاتينية دائمًا — أسهم التنقل تنعكس تلقائيًا حسب الاتجاه."
    >
      <div class="flex flex-wrap items-start gap-6">
        <!--
          @vue-expect-error — CalendarDate/CalendarDateTime/ZonedDateTime
          from @internationalized/date use JS private fields, which vue-tsc
          re-derives as structurally-anonymous types across the generated
          Calendar.vue's own prop-macro boundary; the resulting "DateValue"
          on each side is nominally distinct even though identical at
          runtime. Reproduces with a minimal `<Calendar v-model="ref(new
          CalendarDate(...))" />` outside this file too — not specific to
          this demo's code. Runtime behavior is unaffected.
        -->
        <Calendar
          v-model="calendarDemo"
          locale="ar-LY-u-nu-latn"
          :week-starts-on="6"
          layout="month-and-year"
          calendar-label="اختر تاريخ التقرير"
        />
        <div class="space-y-1 pt-2 text-sm">
          <p class="text-muted-foreground">التاريخ المحدد</p>
          <p class="num text-lg font-medium">{{ calendarDemo?.toString() ?? "—" }}</p>
        </div>
      </div>
    </ShowcaseSection>

    <!-- Range calendar -->
    <ShowcaseSection
      section-id="range-calendar"
      title="نطاق التواريخ"
      hint="لفلاتر التقارير بين تاريخين — نفس إعداد ليبيا: سبت أولًا وأرقام لاتينية."
    >
      <div class="flex flex-wrap items-start gap-6">
        <!-- @vue-expect-error — same private-field type friction as ComponentsPage RangeCalendar. -->
        <RangeCalendar
          v-model="rangeDemo"
          locale="ar-LY-u-nu-latn"
          :week-starts-on="6"
          :number-of-months="2"
          layout="month-and-year"
          calendar-label="اختر نطاق التقرير"
        />
        <div class="space-y-1 pt-2 text-sm">
          <p class="text-muted-foreground">الفترة المحددة</p>
          <p class="text-lg font-medium">
            <span class="num">{{ rangeDemo.start?.toString() ?? "—" }}</span>
            إلى
            <span class="num">{{ rangeDemo.end?.toString() ?? "—" }}</span>
          </p>
        </div>
      </div>
    </ShowcaseSection>

    <!-- Combobox -->
    <ShowcaseSection
      section-id="combobox"
      title="البحث والاختيار"
      hint="بحث متسامح مع الهمزة — جرّب كتابة «اسواق» بلا همزة، سيطابق «أسواق» في القائمة."
    >
      <Combobox v-model="marketValue" :ignore-filter="true" class="max-w-xs">
        <ComboboxAnchor as-child>
          <ComboboxTrigger as-child>
            <Button
              variant="outline"
              :aria-label="selectedMarketLabel ?? 'اختر نقطة بيع أو سوقًا'"
              aria-labelledby="market-trigger-label"
              class="w-full justify-between font-normal"
            >
              <span id="market-trigger-label" class="flex items-center gap-2 truncate">
                <StoreIcon class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {{ selectedMarketLabel ?? "اختر نقطة بيع أو سوقًا…" }}
              </span>
              <ChevronsUpDownIcon class="size-4 shrink-0 opacity-50" aria-hidden="true" />
            </Button>
          </ComboboxTrigger>
        </ComboboxAnchor>
        <ComboboxList>
          <ComboboxInput v-model="marketSearch" placeholder="ابحث عن نقطة بيع أو سوق…" />
          <ComboboxEmpty>لا توجد نتائج.</ComboboxEmpty>
          <ComboboxViewport>
            <ComboboxGroup>
              <ComboboxItem
                v-for="market in filteredMarkets"
                :key="market.value"
                :value="market.value"
                :text-value="market.label"
              >
                {{ market.label }}
                <ComboboxItemIndicator>
                  <CheckIcon class="pointer-events-none" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxViewport>
        </ComboboxList>
      </Combobox>
    </ShowcaseSection>

    <!-- Tags input -->
    <ShowcaseSection
      section-id="tags-input"
      title="الوسوم"
      hint="لإدخال عدة قيم قصيرة — اكتب ثم اضغط Enter لإضافة وسم جديد."
    >
      <div class="max-w-sm space-y-2">
        <Label for="regions-field">المناطق المخدومة</Label>
        <TagsInput id="regions-field" v-model="serviceRegions">
          <TagsInputItem v-for="region in serviceRegions" :key="region" :value="region">
            <TagsInputItemText />
            <TagsInputItemDelete :aria-label="`إزالة ${region}`" />
          </TagsInputItem>
          <TagsInputInput placeholder="أضف منطقة…" />
        </TagsInput>
        <p class="text-xs text-muted-foreground">تُستخدم لتوزيع الطلبات الميدانية على المشرفين</p>
      </div>
    </ShowcaseSection>

    <!-- Schema-driven form -->
    <ShowcaseSection
      section-id="schema-form"
      title="النماذج المخططّية"
      hint="تحقق مبني على مخطط Zod عبر vee-validate — رسائل الخطأ عربية ومربوطة بـ aria-invalid."
    >
      <form novalidate class="max-w-md space-y-5" @submit="onPosFormSubmit">
        <FormField v-slot="{ componentField }" name="posName">
          <FormItem>
            <FormLabel>اسم نقطة البيع</FormLabel>
            <FormControl>
              <Input type="text" placeholder="مثال: سوق النموذج" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="phone">
          <FormItem>
            <FormLabel>رقم الهاتف</FormLabel>
            <FormControl>
              <Input type="tel" placeholder="09xxxxxxxx" class="num" v-bind="componentField" />
            </FormControl>
            <FormDescription>يُستخدم لاستقبال رمز التحقق</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="amount">
          <FormItem>
            <FormLabel>مبلغ الشحن الأول (د.ل)</FormLabel>
            <FormControl>
              <NumberField :min="1" v-bind="componentField">
                <NumberFieldContent>
                  <NumberFieldDecrement aria-label="إنقاص المبلغ" />
                  <NumberFieldInput class="num" />
                  <NumberFieldIncrement aria-label="زيادة المبلغ" />
                </NumberFieldContent>
              </NumberField>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full">
          <SaveIcon class="size-4" />
          حفظ نقطة البيع
        </Button>
      </form>
    </ShowcaseSection>

    <!-- Timeline -->
    <ShowcaseSection
      section-id="timeline"
      title="الخط الزمني"
      hint="لسجلات النشاط — يدعم أيقونة لكل عنصر وعرض تغييرات الحقول (قديم ← جديد) عبر خاصية diff."
    >
      <Timeline :items="timelineDemoItems" />
    </ShowcaseSection>

    <!-- CopyButton + Kbd -->
    <ShowcaseSection
      section-id="copy-kbd"
      title="نسخ واختصارات"
      hint="CopyButton لأي قيمة قصيرة قابلة للنسخ كمراجع المعاملات؛ Kbd لعرض اختصارات لوحة المفاتيح."
    >
      <div class="space-y-6">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">CopyButton</p>
          <div class="flex items-center gap-1.5">
            <span class="num text-sm">TX-84921</span>
            <CopyButton value="TX-84921" with-toast />
          </div>
        </div>
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">Kbd</p>
          <p class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            افتح لوحة الأوامر بالضغط على
            <Kbd>⌘K</Kbd>
            أو
            <Kbd>Ctrl K</Kbd>
          </p>
        </div>
      </div>
    </ShowcaseSection>

    <!-- FileDropzone -->
    <ShowcaseSection
      section-id="upload"
      title="رفع الملفات"
      hint="اسحب وأفلت أو تصفّح — الطقم يتحقق من النوع والحجم فقط، ولا يقرأ محتوى الملف (تحليل Excel قرار تابع للتطبيق)."
    >
      <div class="max-w-md space-y-3">
        <FileDropzone
          v-model="uploadDemoFiles"
          :accept="['.xlsx', '.csv']"
          :max-size="100 * 1024"
          multiple
          @rejected="handleUploadDemoRejected"
        />
        <p class="text-xs text-muted-foreground">
          حدّ هذا العرض التوضيحي: امتدادا xlsx. وcsv. فقط، وحتى 100 كيلوبايت للملف — لتجربة رسائل
          الرفض بسهولة.
        </p>
      </div>
    </ShowcaseSection>

    <!-- usePoll / useAsyncJob -->
    <ShowcaseSection
      section-id="async-jobs"
      title="المهام غير المتزامنة"
      hint="نمط قائمة الانتظار ← الاستطلاع ← النتيجة لعمليات طويلة كتصدير التقارير أو الاستيراد الجماعي."
    >
      <div class="max-w-md space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <Button :disabled="exportDemoBusy" @click="runExportDemo(false)">
            <DownloadIcon class="size-4" />
            تصدير التقرير
          </Button>
          <Button variant="outline" :disabled="exportDemoBusy" @click="runExportDemo(true)">
            محاكاة فشل التصدير
          </Button>
        </div>

        <div v-if="exportStatus !== 'idle'" class="space-y-2.5 rounded-lg border p-3">
          <div class="flex items-center justify-between gap-2">
            <Badge :variant="exportStatusMeta[exportStatus].variant">{{
              exportStatusMeta[exportStatus].label
            }}</Badge>
            <span v-if="exportProgress !== undefined" class="num text-xs text-muted-foreground"
              >{{ exportProgress }}%</span
            >
          </div>
          <Progress :model-value="exportProgress ?? 0" aria-label="تقدّم تصدير التقرير" />

          <p v-if="exportStatus === 'failed'" class="text-xs text-destructive">{{ exportError }}</p>

          <div v-if="exportStatus === 'done' || exportStatus === 'failed'" class="flex gap-2">
            <Button
              v-if="exportStatus === 'done'"
              variant="outline"
              size="sm"
              @click="downloadDemoReport"
            >
              <FileDownIcon class="size-3.5" />
              تنزيل الملف
            </Button>
            <Button
              v-if="exportStatus === 'failed'"
              variant="outline"
              size="sm"
              @click="retryExportDemo"
            >
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    </ShowcaseSection>

    <!-- Composite app-kit components -->
    <ShowcaseSection
      section-id="composite"
      title="مكوّنات مركّبة"
      hint="مكوّنات الطقم الجاهزة المبنية فوق الأساسيات — StatCard وMoneyFigure وSparkline وEmptyState وPageHeader."
    >
      <div class="space-y-8">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            StatCard — بيانات، وحالتا التحميل والخطأ (مع إعادة محاولة)
          </p>
          <div class="flex flex-wrap gap-1.5">
            <Button
              size="xs"
              :variant="statCardDemoState === 'data' ? 'secondary' : 'outline'"
              @click="statCardDemoState = 'data'"
            >
              بيانات
            </Button>
            <Button
              size="xs"
              :variant="statCardDemoState === 'loading' ? 'secondary' : 'outline'"
              @click="statCardDemoState = 'loading'"
            >
              تحميل
            </Button>
            <Button
              size="xs"
              :variant="statCardDemoState === 'error' ? 'secondary' : 'outline'"
              @click="statCardDemoState = 'error'"
            >
              خطأ
            </Button>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="مبيعات اليوم"
              value="48,220"
              unit="د.ل"
              :delta="6.4"
              delta-label="عن أمس"
              :trend="[22, 26, 24, 31, 29, 36, 41, 48]"
              :icon="WalletIcon"
            />
            <StatCard
              label="كروت متبقية"
              value="2,285"
              :delta="-3.2"
              delta-label="هذا الأسبوع"
              :trend="[3.1, 2.9, 3.0, 2.7, 2.6, 2.5, 2.4, 2.3]"
              :icon="CreditCardIcon"
              :loading="statCardDemoState === 'loading'"
              :error="statCardDemoState === 'error' ? 'تعذّر تحميل البيانات' : undefined"
              @retry="statCardDemoState = 'data'"
            />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="الرصيد الدفتري"
              value="154863047.91997"
              unit="د.ل"
              hint="يُحتسب من قيود الفترة المفتوحة"
              :icon="WalletIcon"
            >
              <template #footer>
                <Badge variant="success">دائن</Badge>
              </template>
            </StatCard>
            <Card class="gap-2 p-5">
              <p class="text-[13px] font-medium text-muted-foreground">
                MoneyFigure — رقم كامل لا يُختصر
              </p>
              <MoneyFigure :value="1660000" currency="د.ل" size="hero" />
              <MoneyFigure :value="311843.61092" currency="د.ل" tone="success" />
              <MoneyFigure :value="-4820.5" currency="د.ل" size="sm" tone="destructive" />
            </Card>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            Sparkline — منحنى مصغّر للاتجاه، وحالة بلا بيانات
          </p>
          <div class="flex flex-wrap items-center gap-8">
            <Sparkline :data="[14, 18, 16, 23, 21, 28, 26, 34]" />
            <Sparkline :data="[30, 27, 29, 24, 25, 21, 22, 18]" color="var(--destructive)" />
            <Sparkline
              :data="[8, 9, 12, 11, 14, 13, 17, 16]"
              color="var(--chart-2)"
              :width="80"
              :height="28"
            />
            <Sparkline :data="[]" />
          </div>
          <div class="max-w-xs pt-6">
            <Sparkline
              :data="[1200, 1850.5, 1430, 2210, 1980, 2760.25, 2410]"
              :labels="['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']"
              end-dot
              :width="240"
              :height="56"
            />
            <p class="mt-2 text-xs text-muted-foreground">
              labels + endDot — مرّر المؤشر لرؤية اليوم وقيمته
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            EmptyState — فارغة، تحميل، وخطأ مع إعادة محاولة
          </p>
          <div class="flex flex-wrap gap-1.5">
            <Button
              size="xs"
              :variant="emptyStateDemoState === 'empty' ? 'secondary' : 'outline'"
              @click="emptyStateDemoState = 'empty'"
            >
              فارغة
            </Button>
            <Button
              size="xs"
              :variant="emptyStateDemoState === 'loading' ? 'secondary' : 'outline'"
              @click="emptyStateDemoState = 'loading'"
            >
              تحميل
            </Button>
            <Button
              size="xs"
              :variant="emptyStateDemoState === 'error' ? 'secondary' : 'outline'"
              @click="emptyStateDemoState = 'error'"
            >
              خطأ
            </Button>
          </div>
          <EmptyState
            :icon="InboxIcon"
            :state="emptyStateDemoState"
            :title="
              emptyStateDemoState === 'loading'
                ? 'جارٍ تحميل الإشعارات…'
                : emptyStateDemoState === 'error'
                  ? 'تعذّر تحميل الإشعارات'
                  : 'لا توجد إشعارات جديدة'
            "
            hint="عندما تصل طلبات أو تنبيهات جديدة ستظهر هنا فورًا."
            error-message="تحقق من الاتصال ثم أعد المحاولة."
            @retry="emptyStateDemoState = 'empty'"
          >
            <Button variant="outline" size="sm" @click="toast.info('كل شيء تحت السيطرة')">
              <BellIcon class="size-3.5" />
              إدارة التنبيهات
            </Button>
          </EmptyState>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            EmptyState bare — داخل حاوية مؤطّرة بلا إطار متقطّع ثانٍ
          </p>
          <Card class="gap-0 py-0">
            <EmptyState
              bare
              :icon="SearchIcon"
              title="لا توجد نتائج مطابقة"
              hint="جرّب تعديل كلمة البحث أو الفلاتر."
            />
          </Card>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">PageHeader — ترويسة صفحة مع أفعال</p>
          <div class="rounded-xl border border-dashed p-5">
            <PageHeader title="طلبات الكروت" description="متابعة طلبات الجملة وحالتها">
              <template #actions>
                <Button variant="outline" size="sm" @click="toast.success('تم تصدير الطلبات')">
                  <DownloadIcon class="size-3.5" />
                  تصدير
                </Button>
                <Button size="sm" @click="toast.info('نموذج الطلب غير متضمّن في العرض')">
                  <PlusIcon class="size-3.5" />
                  طلب جديد
                </Button>
              </template>
            </PageHeader>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">PageHeader — مسار تنقّل وزر رجوع</p>
          <div class="rounded-xl border border-dashed p-5">
            <PageHeader
              title="TX-84918"
              description="تفاصيل معاملة شراء كروت"
              :breadcrumbs="[{ label: 'الجداول', to: '/tables' }, { label: 'TX-84918' }]"
              back
              @back="toast.info('رجوع (عرض توضيحي)')"
            />
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            PageHeader — وصفة صفحة التفاصيل: #title و#meta وأفعال (زر أساسي واحد، والبقية تُخفى على
            الهاتف داخل «المزيد»)
          </p>
          <div class="rounded-xl border border-dashed p-5">
            <PageHeader
              title="TX-84918"
              :breadcrumbs="[{ label: 'الجداول', to: '/tables' }, { label: 'TX-84918' }]"
              back="/tables"
            >
              <template #title>
                <span class="num">TX-84918</span>
              </template>
              <template #meta>
                <div class="flex flex-wrap items-center gap-2">
                  <StatusBadge status="completed" />
                  <span class="text-xs text-muted-foreground">
                    أُنشئت في <span class="num">2026-10-05 14:32</span>
                  </span>
                </div>
              </template>
              <template #actions>
                <Button size="sm" class="glow-primary" @click="toast.success('تم الاعتماد')">
                  <CheckIcon class="size-3.5" />
                  اعتماد
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="max-md:hidden"
                  @click="toast.info('تعديل (عرض توضيحي)')"
                >
                  تعديل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="max-md:hidden"
                  @click="toast.success('تم التصدير')"
                >
                  <DownloadIcon class="size-3.5" />
                  تصدير
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="outline" size="icon-sm" aria-label="المزيد">
                      <EllipsisIcon class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem class="md:hidden">تعديل</DropdownMenuItem>
                    <DropdownMenuItem class="md:hidden">تصدير</DropdownMenuItem>
                    <DropdownMenuSeparator class="md:hidden" />
                    <DropdownMenuItem variant="destructive">إلغاء المعاملة</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </template>
            </PageHeader>
          </div>
        </div>

        <Alert>
          <InfoIcon class="size-4 text-primary" />
          <AlertTitle>ملاحظة للمطوّرين</AlertTitle>
          <AlertDescription>
            كل الأمثلة في هذه الصفحة تفاعلية وتعمل من بيانات محلية — لا يوجد أي اتصال بخادم. راجع
            صفحات الجداول والنماذج والإعدادات لأمثلة تركيب كاملة.
          </AlertDescription>
        </Alert>
      </div>
    </ShowcaseSection>

    <!-- Composites A: numbers, switches, async + reason-PIN confirmation -->
    <ShowcaseSection
      section-id="composites-a"
      title="الأرقام والمفاتيح والتأكيد"
      hint="Amount وDocNo وTotalsStrip وStatusSwitch وSettingRow وAsyncConfirmDialog وReasonPinDialog."
    >
      <div class="space-y-8">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            Amount وDocNo — الأرقام داخل .num فقط، والمبلغ يُقتطع ولا يُقرَّب
          </p>
          <div class="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
            <Amount :value="1.23456" unit="د.ل" />
            <Amount value="311,843.61092" unit="د.ل" />
            <Amount :value="-4820.5" abs sign="−" unit="د.ل" />
            <Amount :value="null" />
            <DocNo value="469 - ط /2026" />
            <DocNo value="INV-2026-0042" />
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            TotalsStrip — صفّ لكل عملة من إجمالي كل الصفحات
          </p>
          <TotalsStrip :totals="totalsDemo" />
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            StatusSwitch — المفتاح مع حالته مكتوبة بالكلمات
          </p>
          <div class="flex flex-wrap items-center gap-6">
            <StatusSwitch v-model="statusSwitchOn" label="تفعيل بنك تجريبي أ" />
            <StatusSwitch
              v-model="statusSwitchOff"
              label="تفعيل بنك تجريبي ب"
              disabled-variant="destructive"
              size="sm"
            />
            <StatusSwitch v-model="statusSwitchOn" label="تفعيل بنك تجريبي أ" badge-side="end" />
            <StatusSwitch :model-value="true" pending label="قيد التنفيذ" />
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            SettingRow + AsyncConfirmDialog — التأكيد يبقى مفتوحاً أثناء الطلب ويعرض الرفض داخله
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <SettingRow
              :model-value="sellingOn"
              :icon="StoreIcon"
              title="البيع"
              hint="إيقافه يمنع البيع عبر هذه النقطة فقط."
              on-label="يبيع"
              off-label="متوقف"
              switch-label="تبديل البيع — بقالة النموذج"
              @update:model-value="settingConfirmOpen = true"
            />
            <SettingRow
              :model-value="false"
              :icon="WalletIcon"
              title="الحساب"
              hint="إيقافه يغلق الحساب بالكامل."
              on-label="مفتوح"
              off-label="مغلق"
              off-tone="destructive"
              switch-label="تبديل الحساب — بقالة النموذج"
              note="هذا المفتاح يتجاوز مفتاح البيع"
              dimmed
            />
          </div>
          <AsyncConfirmDialog
            v-model:open="settingConfirmOpen"
            title="تغيير حالة البيع؟"
            description="المحاولة الأولى مرفوضة في هذا العرض لإظهار الخطأ داخل الحوار، والثانية تنجح."
            :on-confirm="confirmSettingDemo"
            @success="onSettingConfirmed"
          />
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            ReasonPinDialog — السبب أولاً ثم الرمز السري (جرّب 1111)
          </p>
          <Button variant="destructive" size="sm" @click="reasonPinOpen = true">
            إلغاء الدفعة
          </Button>
          <ReasonPinDialog
            v-model:open="reasonPinOpen"
            title="إلغاء الدفعة؟"
            description="لا يمكن التراجع عن هذا الإجراء."
            reason-label="سبب الإلغاء"
            reason-placeholder="مثلاً: نفد المخزون لدى المزود"
            continue-label="متابعة"
            pin-title="أدخل رمزك السري"
            pin-description="للتأكيد، أدخل رمزك السري المكوّن من 4 أرقام."
            confirm-label="إلغاء الدفعة"
            :on-confirm="confirmReasonPinDemo"
            @success="toast.success('تم الإلغاء — عرض توضيحي فقط')"
          />
        </div>
      </div>
    </ShowcaseSection>

    <!-- Composites B: filters, pickers, date/time fields, pager, chip board -->
    <ShowcaseSection
      section-id="composites-b"
      title="الفلاتر والمنتقيات"
      hint="FilterChips وFilterSheet وSearchableSelect وMultiSelect وDateField وTimeField وCompactPager وLookupChipBoard."
    >
      <div class="space-y-8">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            الفلاتر — الحقول في الشريط، وFilterSheet على الشاشات الصغيرة، وFilterChips تُظهر ما يُصفّي القائمة
          </p>
          <div class="flex flex-wrap items-end gap-3">
            <div class="w-44">
              <SearchableSelect
                v-model="filterRegion"
                :options="regionOptions"
                placeholder="كل المناطق"
                none-label="كل المناطق"
                ariaLabel="المنطقة"
                size="sm"
              />
            </div>
            <div class="w-44">
              <MultiSelect
                v-model="filterRegions"
                :options="regionOptions"
                placeholder="كل المدن"
                count-label="{count} مدن"
                ariaLabel="المدن"
                size="sm"
              />
            </div>
            <div class="w-40">
              <DateField
                v-model="filterFrom"
                placeholder="من تاريخ"
                :max="filterTo || undefined"
                size="sm"
                clearable
                tinted
              />
            </div>
            <div class="w-40">
              <DateField
                v-model="filterTo"
                placeholder="إلى تاريخ"
                :min="filterFrom || undefined"
                size="sm"
                clearable
                tinted
              />
            </div>
            <FilterSheet :count="filterCount" @clear="clearDemoFilters">
              <div class="space-y-3">
                <SearchableSelect
                  v-model="filterRegion"
                  :options="regionOptions"
                  placeholder="كل المناطق"
                  none-label="كل المناطق"
                  ariaLabel="المنطقة"
                />
                <DateField v-model="filterFrom" placeholder="من تاريخ" clearable />
                <DateField v-model="filterTo" placeholder="إلى تاريخ" clearable />
              </div>
            </FilterSheet>
          </div>
          <FilterChips :chips="filterChips" @clear-all="clearDemoFilters">
            <span class="text-muted-foreground">
              <span class="num">{{ 120 - filterChips.length * 7 }}</span> نتيجة
            </span>
          </FilterChips>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            TimeField — 24 ساعة دائماً، مع كتابة الوقت مباشرة (جرّب 1837)
          </p>
          <div class="max-w-48">
            <TimeField v-model="filterTime" clearable />
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            CompactPager — للقوائم غير المبنية على الجدول؛ اضغط رقم الصفحة للانتقال
          </p>
          <CompactPager v-model:page-index="compactPage" :page-count="12">
            <template #label>عرض البطاقات</template>
          </CompactPager>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            LookupChipBoard — قاموس من حقل واحد: تعديل مباشر، وحذف يعود إلى المضيف
          </p>
          <LookupChipBoard
            :items="lookupChips"
            add-label="إضافة نوع"
            @create="onLookupCreate"
            @rename="onLookupRename"
            @remove="onLookupRemove"
          />
        </div>
      </div>
    </ShowcaseSection>

    <!-- Composites C: brand marks, chart gate, daybook, attachments, notifications, submit bar -->
    <ShowcaseSection
      section-id="composites-c"
      title="الشعارات والدفاتر والإشعارات"
      hint="BrandMark وChartState وDaybookList وAttachmentViewer وNotificationBell وStickySubmitBar + useLeaveGuard."
    >
      <div class="space-y-8">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            BrandMark — الصورة إن وُجدت، وإلا الحرف الأول بلون ثابت لكل كيان (من رموز الثيم)
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <BrandMark name="ليبيانا" seed="libyana" size="sm" />
            <BrandMark name="المدار" seed="almadar" />
            <BrandMark name="Libya Telecom" seed="ltt" />
            <BrandMark name="سوق النموذج" :seed="2041" size="lg" />
            <BrandMark name="صورة" :src="demoAttachments[0]!.url" size="lg" />
            <BrandMark name="رابط معطّل" seed="broken" src="data:image/png;base64,AAAA" size="lg" />
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            ChartState — بوابة لكل مخطط: هيكل تحميل، خطأ مع إعادة المحاولة، «لا بيانات»، ثم المخطط
          </p>
          <div class="flex flex-wrap gap-1.5">
            <Button
              v-for="option in [
                { value: 'ready', label: 'المخطط' },
                { value: 'loading', label: 'تحميل' },
                { value: 'error', label: 'خطأ' },
                { value: 'empty', label: 'فارغ' },
              ] as const"
              :key="option.value"
              size="xs"
              :variant="chartStateDemo === option.value ? 'secondary' : 'outline'"
              @click="chartStateDemo = option.value"
            >
              {{ option.label }}
            </Button>
          </div>
          <Card class="p-4">
            <ChartState
              :loading="chartStateDemo === 'loading'"
              :error="chartStateDemo === 'error' ? 'انتهت مهلة الاتصال بالخادم' : ''"
              :empty="chartStateDemo === 'empty'"
              @retry="chartStateDemo = 'ready'"
            >
              <div dir="ltr" :style="CHART_CONTAINER_STYLE">
                <VisXYContainer :data="chartData" :height="220" :duration="chartDuration">
                  <VisLine
                    :x="chartX"
                    :y="chartY"
                    :color="chartColor"
                    :line-width="2"
                    :curve-type="CurveType.MonotoneX"
                  />
                  <VisAxis type="x" :x="chartX" :num-ticks="7" />
                  <VisAxis type="y" :num-ticks="4" :tick-format="formatCompact" />
                </VisXYContainer>
              </div>
            </ChartState>
          </Card>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            DaybookList — الأنواع يحدّدها المضيف (أيقونة، لون، إشارة)؛ المبالغ عبر money.ts
          </p>
          <DaybookList
            :rows="daybookRows"
            :kinds="daybookKinds"
            :refreshing="daybookRefreshing"
            :page-index="daybookPage"
            :page-count="daybookPages.length"
            :row-count="6"
            @update:page-index="setDaybookPage"
          />
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            AttachmentViewer — صور وPDF داخل التطبيق؛ الأسهم ←/→ تتنقّل حسب اتجاه الصفحة
          </p>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="file in demoAttachments"
              :key="file.id"
              variant="outline"
              size="sm"
              @click="attachmentOpen = file.id"
            >
              <bdi>{{ file.name }}</bdi>
            </Button>
          </div>
          <AttachmentViewer v-model="attachmentOpen" :attachments="demoAttachments" />
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            NotificationBell — محوّل في الذاكرة بدل الخادم؛ يوضع في خانة #notifications في الشريط
            العلوي
          </p>
          <div class="flex items-center gap-3 rounded-lg border p-2">
            <NotificationBell
              :adapter="demoNotificationAdapter"
              :event-icons="notificationEventIcons"
              :event-tones="notificationEventTones"
              :resource-icons="notificationResourceIcons"
            />
            <span class="text-xs text-muted-foreground">
              غير المقروء:
              <span class="num">{{ demoNotifications.filter((n) => !n.readAt).length }}</span>
            </span>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            StickySubmitBar + useLeaveGuard — أثناء الرفع تُطلب موافقة قبل مغادرة الصفحة
          </p>
          <StickySubmitBar
            :stats="[
              { label: 'الكروت', value: '120' },
              { label: 'الملفات', value: '2' },
            ]"
            :busy="submitBarBusy"
            submit-label="رفع الكروت"
            busy-label="جارٍ الرفع…"
            @submit="runSubmitBarDemo"
            @cancel="toast.info('أُلغيت العملية')"
          >
            <template #stats>
              <div class="flex items-center gap-2">
                <dt class="text-muted-foreground">القيمة</dt>
                <dd class="font-semibold"><Amount :value="24500.75" unit="د.ل" /></dd>
              </div>
            </template>
          </StickySubmitBar>
        </div>
      </div>
    </ShowcaseSection>
  </div>
</template>
