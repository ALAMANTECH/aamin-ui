import type { VueWrapper } from "@vue/test-utils";
import DateField from "@/components/app/DateField.vue";

/** The DateField carrying `data-testid` — found through teleports (dialogs, sheets) too. */
export function dateField(wrapper: VueWrapper, testId: string) {
  const field = wrapper
    .findAllComponents(DateField)
    .find((c) => c.attributes("data-testid") === testId);
  if (!field) throw new Error(`DateField ${testId} is not mounted`);
  return field;
}

/** What picking a day does: the calendar is reka's, the contract is the `YYYY-MM-DD` model. */
export async function setDate(wrapper: VueWrapper, testId: string, value: string) {
  dateField(wrapper, testId).vm.$emit("update:modelValue", value);
  await wrapper.vm.$nextTick();
}
