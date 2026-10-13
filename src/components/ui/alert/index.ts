import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Alert } from "./Alert.vue"
export { default as AlertAction } from "./AlertAction.vue"
export { default as AlertDescription } from "./AlertDescription.vue"
export { default as AlertTitle } from "./AlertTitle.vue"

export const alertVariants = cva('grid gap-0.5 rounded-xl border px-3 py-2.5 text-start text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pe-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*=size-])]:size-4 group/alert relative w-full', {
  variants: {
    variant: {
      default: 'bg-card text-card-foreground',
      // Status variants: soft tinted surfaces in the kit's status hues (the
      // badge/sonner pattern). Title+icon carry the hue, description at 90%.
      // info borrows the theme's blue (chart-2) so it stays distinct from
      // success's mint — same choice as the sonner redesign.
      destructive: 'border-destructive/40 bg-destructive/10 text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current',
      success: 'border-success/40 bg-success/10 text-success *:data-[slot=alert-description]:text-success/90 *:[svg]:text-current',
      warning: 'border-warning/40 bg-warning/10 text-warning *:data-[slot=alert-description]:text-warning/90 *:[svg]:text-current',
      info: 'border-chart-2/40 bg-chart-2/10 text-chart-2 *:data-[slot=alert-description]:text-chart-2/90 *:[svg]:text-current',
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export type AlertVariants = VariantProps<typeof alertVariants>
