<script setup lang="ts">
import { ref, useTemplateRef } from "vue"
import type { ColumnDef } from "@tanstack/vue-table"
import {
  DownloadIcon,
  EllipsisIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  RotateCwIcon,
  SearchIcon,
  Trash2Icon,
} from "@/lib/icons";
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DataTable from "@/components/app/datatable/DataTable.vue"
import DataTableViewOptions from "@/components/app/datatable/DataTableViewOptions.vue"
import { selectionColumn } from "@/components/app/datatable/columns"
import CopyButton from "@/components/app/CopyButton.vue"
import EmptyState from "@/components/app/EmptyState.vue"
import PageHeader from "@/components/app/PageHeader.vue"
import StatusBadge from "@/components/app/StatusBadge.vue"

type TxStatus = "completed" | "pending" | "rejected"

interface Tx {
  id: string
  name: string
  city: string
  type: string
  amount: string
  date: string
  status: TxStatus
}

const rows = ref<Tx[]>([
  {
    id: "TX-84921",
    name: "سوق النموذج",
    city: "طرابلس",
    type: "تعبئة رصيد",
    amount: "12,400",
    date: "2026-07-10",
    status: "completed",
  },
  {
    id: "TX-84920",
    name: "اتصالات النموذج",
    city: "غريان",
    type: "شراء كروت",
    amount: "7,150",
    date: "2026-07-10",
    status: "completed",
  },
  {
    id: "TX-84919",
    name: "مكتبة النموذج",
    city: "بنغازي",
    type: "سحب أرباح",
    amount: "3,980",
    date: "2026-07-09",
    status: "pending",
  },
  {
    id: "TX-84918",
    name: "سوبرماركت النموذج",
    city: "مصراتة",
    type: "شراء كروت",
    amount: "21,300",
    date: "2026-07-09",
    status: "completed",
  },
  {
    id: "TX-84917",
    name: "قهوة النموذج",
    city: "طرابلس",
    type: "تعبئة رصيد",
    amount: "1,750",
    date: "2026-07-09",
    status: "rejected",
  },
  {
    id: "TX-84916",
    name: "صيدلية الشفاء التجريبية",
    city: "الزاوية",
    type: "شراء كروت",
    amount: "5,425",
    date: "2026-07-08",
    status: "completed",
  },
  {
    id: "TX-84915",
    name: "بقالة النموذج",
    city: "زليتن",
    type: "تعبئة رصيد",
    amount: "940",
    date: "2026-07-08",
    status: "completed",
  },
  {
    id: "TX-84914",
    name: "مطعم النموذج",
    city: "بنغازي",
    type: "تسوية حساب",
    amount: "18,260",
    date: "2026-07-07",
    status: "pending",
  },
  {
    id: "TX-84913",
    name: "محلات النموذج",
    city: "سبها",
    type: "شراء كروت",
    amount: "9,875",
    date: "2026-07-07",
    status: "completed",
  },
  {
    id: "TX-84912",
    name: "مقهى النموذج",
    city: "طرابلس",
    type: "تعبئة رصيد",
    amount: "640",
    date: "2026-07-06",
    status: "completed",
  },
  {
    id: "TX-84911",
    name: "هواتف النموذج",
    city: "طرابلس",
    type: "شراء كروت",
    amount: "33,800",
    date: "2026-07-06",
    status: "completed",
  },
  {
    id: "TX-84910",
    name: "أسواق المثال",
    city: "طرابلس",
    type: "سحب أرباح",
    amount: "14,020",
    date: "2026-07-05",
    status: "pending",
  },
  {
    id: "TX-84909",
    name: "مركز النموذج التجاري",
    city: "البيضاء",
    type: "شراء كروت",
    amount: "4,510",
    date: "2026-07-05",
    status: "completed",
  },
  {
    id: "TX-84908",
    name: "كافيه النموذج",
    city: "بنغازي",
    type: "تعبئة رصيد",
    amount: "1,125",
    date: "2026-07-04",
    status: "rejected",
  },
  {
    id: "TX-84907",
    name: "محطة الوقود التجريبية",
    city: "طرابلس",
    type: "تسوية حساب",
    amount: "27,640",
    date: "2026-07-03",
    status: "completed",
  },
  {
    id: "TX-84906",
    name: "ستوديو النموذج",
    city: "درنة",
    type: "شراء كروت",
    amount: "2,340",
    date: "2026-07-03",
    status: "completed",
  },
  {
    id: "TX-84905",
    name: "سوبرماركت المثال",
    city: "مصراتة",
    type: "شراء كروت",
    amount: "8,930",
    date: "2026-07-02",
    status: "completed",
  },
  {
    id: "TX-84904",
    name: "مكتب الاتصالات التجريبي",
    city: "طبرق",
    type: "تعبئة رصيد",
    amount: "6,280",
    date: "2026-07-02",
    status: "pending",
  },
  {
    id: "TX-84903",
    name: "بقالة المثال",
    city: "طرابلس",
    type: "تعبئة رصيد",
    amount: "760",
    date: "2026-07-01",
    status: "completed",
  },
  {
    id: "TX-84902",
    name: "عطور النموذج",
    city: "الزاوية",
    type: "شراء كروت",
    amount: "3,415",
    date: "2026-07-01",
    status: "completed",
  },
  {
    id: "TX-84901",
    name: "إلكترونيات النموذج",
    city: "طرابلس",
    type: "تسوية حساب",
    amount: "19,750",
    date: "2026-06-30",
    status: "completed",
  },
  {
    id: "TX-84900",
    name: "مخبز النموذج",
    city: "زليتن",
    type: "تعبئة رصيد",
    amount: "890",
    date: "2026-06-30",
    status: "rejected",
  },
  {
    id: "TX-84899",
    name: "صيدلية النموذج",
    city: "بنغازي",
    type: "شراء كروت",
    amount: "11,540",
    date: "2026-06-29",
    status: "completed",
  },
  {
    id: "TX-84898",
    name: "سوق المثال",
    city: "طرابلس",
    type: "سحب أرباح",
    amount: "15,660",
    date: "2026-06-29",
    status: "pending",
  },
  {
    id: "TX-84897",
    name: "ملابس النموذج",
    city: "مصراتة",
    type: "شراء كروت",
    amount: "2,975",
    date: "2026-06-28",
    status: "completed",
  },
  {
    id: "TX-84896",
    name: "صالة النموذج",
    city: "بنغازي",
    type: "تسوية حساب",
    amount: "24,110",
    date: "2026-06-28",
    status: "completed",
  },
])

const search = ref("")
const statusFilter = ref("all")
const dataTable = useTemplateRef("dataTable")

/** Parse the grouped-digit amount ("12,400") to a number for numeric sorting. */
const parseAmount = (value: string) => Number(value.replace(/,/g, ""))

const columns: ColumnDef<Tx, unknown>[] = [
  selectionColumn<Tx>(),
  // `mobile*` meta shapes the phone ledger card (below md): name is the
  // headline, amount + status stack at the row end, the reference joins the
  // muted meta line labeled, and city (hidden from narrow desktop tables)
  // still earns a labeled slot on the card.
  { accessorKey: "id", header: "المرجع", meta: { label: "المرجع", mobileLabeled: true } },
  { accessorKey: "name", header: "نقطة البيع", meta: { label: "نقطة البيع", mobile: "title" } },
  {
    accessorKey: "city",
    header: "المدينة",
    meta: { label: "المدينة", class: "max-md:hidden", mobile: "stat" },
  },
  { accessorKey: "type", header: "النوع", enableSorting: false, meta: { label: "النوع" } },
  {
    accessorKey: "amount",
    header: "المبلغ",
    meta: { label: "المبلغ", mobile: "trailing" },
    sortingFn: (a, b) => parseAmount(a.original.amount) - parseAmount(b.original.amount),
  },
  {
    accessorKey: "date",
    header: "التاريخ",
    meta: { label: "التاريخ", class: "max-sm:hidden" },
  },
  {
    accessorKey: "status",
    header: "الحالة",
    enableSorting: false,
    filterFn: "equals",
    meta: { label: "الحالة", mobile: "trailing", mobileLabeled: false },
  },
  { id: "actions", enableSorting: false, enableHiding: false, meta: { label: "إجراءات" } },
]

/** Jump back to the first page — filters/search changing the row set shouldn't
 *  strand the pager deep in a now-shorter list (autoResetPageIndex is off). */
function resetPage() {
  dataTable.value?.table.setPageIndex(0)
}

function onStatusChange(value: unknown) {
  const next = typeof value === "string" ? value : "all"
  statusFilter.value = next
  dataTable.value?.table.getColumn("status")?.setFilterValue(next === "all" ? undefined : next)
  resetPage()
}

function resetFilters() {
  search.value = ""
  onStatusChange("all")
}

/* ------------------------------ Delete flow ------------------------------ */
const deleteOpen = ref(false)
const deleteTarget = ref<Tx | null>(null) // null → bulk delete of `deleteSelection`
const deleteSelection = ref<Tx[]>([])

function askDeleteRow(tx: Tx) {
  deleteTarget.value = tx
  deleteSelection.value = []
  deleteOpen.value = true
}

function askDeleteSelected(selected: Tx[]) {
  deleteTarget.value = null
  deleteSelection.value = selected
  deleteOpen.value = true
}

function confirmDelete() {
  if (deleteTarget.value) {
    const id = deleteTarget.value.id
    rows.value = rows.value.filter((tx) => tx.id !== id)
    toast.success(`تم حذف المعاملة ${id}`)
  } else {
    const ids = new Set(deleteSelection.value.map((tx) => tx.id))
    rows.value = rows.value.filter((tx) => !ids.has(tx.id))
    toast.success(`تم حذف ${ids.size} معاملات`)
    dataTable.value?.table.resetRowSelection()
  }
  deleteTarget.value = null
  deleteSelection.value = []
  // No manual clamp: when a cross-page bulk delete shrinks the list past the
  // current page, DataTable (client mode) lands on the new last page itself.
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="الجداول"
      description="جدول معاملات كامل: بحث، فلترة، ترتيب، تحديد جماعي، وترقيم صفحات"
    >
      <template #actions>
        <Button class="glow-primary" @click="toast.info('نموذج المعاملة غير متضمّن في نسخة العرض')">
          <PlusIcon class="size-4" />
          معاملة جديدة
        </Button>
      </template>
    </PageHeader>

    <DataTable
      ref="dataTable"
      :columns="columns"
      :data="rows"
      :page-size="10"
      storage-key="reference-tables"
      :get-row-id="(tx) => tx.id"
      enable-selection
      :global-filter="search"
      @update:global-filter="
        (value) => {
          search = value
          resetPage()
        }
      "
    >
      <!-- Toolbar: search + status filter + export + column visibility -->
      <template #toolbar>
        <div class="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
          <SearchIcon
            class="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            v-model="search"
            placeholder="ابحث بالاسم أو المرجع أو المدينة…"
            class="ps-8"
            aria-label="بحث في المعاملات"
          />
        </div>

        <Select :model-value="statusFilter" @update:model-value="onStatusChange">
          <SelectTrigger
            class="max-md:order-last max-md:basis-full sm:w-36"
            aria-label="فلترة حسب الحالة"
          >
            <SelectValue placeholder="كل الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="completed">مكتملة</SelectItem>
            <SelectItem value="pending">معلّقة</SelectItem>
            <SelectItem value="rejected">مرفوضة</SelectItem>
          </SelectContent>
        </Select>

        <div class="ms-auto flex shrink-0 items-center gap-2">
          <DataTableViewOptions v-if="dataTable" :table="dataTable.table" />
          <Button
            variant="outline"
            class="max-md:size-9 max-md:p-0"
            aria-label="تصدير CSV"
            @click="
              toast.success(
                `تم تصدير ${dataTable?.table.getFilteredRowModel().rows.length ?? 0} معاملة بصيغة CSV`,
              )
            "
          >
            <DownloadIcon class="size-4" />
            <span class="max-md:hidden">تصدير</span>
          </Button>
        </div>
      </template>

      <!-- Bulk actions -->
      <template #bulk-actions="{ selectedRows }">
        <Button variant="destructive" size="sm" @click="askDeleteSelected(selectedRows as Tx[])">
          <Trash2Icon class="size-3.5" />
          حذف المحدد
        </Button>
      </template>

      <!-- Cells -->
      <template #cell-id="{ value }">
        <span class="inline-flex items-center gap-1">
          <span class="num text-xs text-muted-foreground">{{ value }}</span>
          <CopyButton :value="value as string" />
        </span>
      </template>
      <template #cell-name="{ value }">
        <span class="font-medium">{{ value }}</span>
      </template>
      <template #cell-city="{ value }">
        <span class="text-muted-foreground">{{ value }}</span>
      </template>
      <template #cell-type="{ value }">
        <span class="text-muted-foreground">{{ value }}</span>
      </template>
      <template #cell-amount="{ value }">
        <span class="num">{{ value }}</span>
        <span class="ms-1 text-xs text-muted-foreground">د.ل</span>
      </template>
      <template #cell-date="{ value }">
        <span class="num text-xs text-muted-foreground">{{ value }}</span>
      </template>
      <template #cell-status="{ value }">
        <StatusBadge :status="value as string" />
      </template>
      <template #cell-actions="{ row }">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="icon-sm"
              :aria-label="`خيارات المعاملة ${(row as Tx).id}`"
            >
              <EllipsisIcon class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-40">
            <DropdownMenuItem @select="toast.info(`عرض تفاصيل ${(row as Tx).id}`)">
              <EyeIcon class="size-4" />
              عرض
            </DropdownMenuItem>
            <DropdownMenuItem @select="toast.info(`تعديل ${(row as Tx).id} (عرض توضيحي)`)">
              <PencilIcon class="size-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" @select="askDeleteRow(row as Tx)">
              <Trash2Icon class="size-4" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </template>

      <!-- Empty state: bare — the table sheet is already the frame. Filtered
           (offer a reset) vs truly empty (nothing to reset). -->
      <template #empty>
        <EmptyState
          v-if="search || statusFilter !== 'all'"
          bare
          :icon="SearchIcon"
          title="لا توجد نتائج مطابقة"
          hint="جرّب تعديل كلمة البحث أو فلتر الحالة"
        >
          <Button variant="outline" size="sm" @click="resetFilters">مسح الفلاتر</Button>
        </EmptyState>
        <EmptyState v-else bare title="لا توجد عمليات بعد" hint="ستظهر العمليات هنا فور تنفيذها." />
      </template>
    </DataTable>

    <!-- Empty-state table demo -->
    <Card class="gap-0 py-0">
      <CardHeader class="border-b py-4!">
        <CardTitle>طلبات الاسترجاع</CardTitle>
      </CardHeader>
      <CardContent class="p-4">
        <EmptyState
          title="لا توجد طلبات استرجاع"
          hint="عندما تقدّم نقاط البيع طلبات استرجاع كروت ستظهر هنا للمراجعة والاعتماد."
        >
          <Button variant="outline" size="sm" @click="toast.info('لا جديد حتى الآن')">
            <RotateCwIcon class="size-3.5" />
            تحديث
          </Button>
        </EmptyState>
      </CardContent>
    </Card>

    <!-- Delete confirmation -->
    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {{ deleteTarget ? "حذف المعاملة؟" : "حذف المعاملات المحددة؟" }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <template v-if="deleteTarget">
              سيتم حذف المعاملة
              <span class="num">{{ deleteTarget.id }}</span>
              الخاصة بـ «{{ deleteTarget.name }}» نهائيًا. لا يمكن التراجع عن هذا الإجراء.
            </template>
            <template v-else>
              سيتم حذف
              <span class="num">{{ deleteSelection.length }}</span>
              معاملات نهائيًا. لا يمكن التراجع عن هذا الإجراء.
            </template>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction variant="destructive" @click="confirmDelete"
            >حذف نهائي</AlertDialogAction
          >
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
