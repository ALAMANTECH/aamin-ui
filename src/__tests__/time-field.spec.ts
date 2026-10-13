// TimeField: the 24-hour time control — an HH:MM model, a tap grid of hours
// named by their part of the day, minutes in steps, and a typed exact time.
import { describe, expect, it } from "vitest";
import { defineComponent, h, ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { i18n } from "@/lib/i18n";
import TimeField from "@/components/app/TimeField.vue";

function mountField(initial = "") {
  const value = ref(initial);
  const Host = defineComponent({
    setup: () => () =>
      h(TimeField, {
        id: "tf",
        clearable: true,
        modelValue: value.value,
        "onUpdate:modelValue": (next: string) => (value.value = next),
      }),
  });
  const wrapper = mount(Host, { attachTo: document.body, global: { plugins: [i18n] } });
  return { wrapper, value };
}

async function openPopover(wrapper: ReturnType<typeof mountField>["wrapper"]) {
  await wrapper.get("#tf").trigger("click");
  await flushPromises();
}

const inDocument = (selector: string) => document.body.querySelector<HTMLElement>(selector)!;

describe("TimeField", () => {
  it("shows the value in 24-hour form and a placeholder when empty", () => {
    expect(mountField("18:05").wrapper.get("#tf").text()).toBe("18:05");
    expect(mountField("").wrapper.get("#tf").text()).toContain("اختر الساعة");
  });

  it("picks an hour, then a minute, keeping 24-hour digits", async () => {
    const { wrapper, value } = mountField();
    await openPopover(wrapper);
    inDocument("[data-hour='18']").click();
    await flushPromises();
    expect(value.value).toBe("18:00");
    inDocument("[data-minute='35']").click();
    await flushPromises();
    expect(value.value).toBe("18:35");
    wrapper.unmount();
  });

  it("names the four parts of the day beside the hour rows", async () => {
    const { wrapper } = mountField();
    await openPopover(wrapper);
    const text = document.body.textContent ?? "";
    for (const period of ["ليلاً", "صباحاً", "ظهراً", "مساءً"]) expect(text).toContain(period);
    wrapper.unmount();
  });

  it("reads a typed time, Arabic digits included, and refuses one past 23:59", async () => {
    const { wrapper, value } = mountField();
    await openPopover(wrapper);
    const input = inDocument("[data-time-typed]") as HTMLInputElement;
    input.value = "٢٣٤٥";
    input.dispatchEvent(new Event("input"));
    await flushPromises(); // the kit Input hands its text up on the next tick
    input.form!.dispatchEvent(new Event("submit"));
    await flushPromises();
    expect(value.value).toBe("23:45");

    await openPopover(wrapper);
    const again = inDocument("[data-time-typed]") as HTMLInputElement;
    again.value = "2460";
    again.dispatchEvent(new Event("input"));
    await flushPromises();
    again.form!.dispatchEvent(new Event("submit"));
    await flushPromises();
    expect(value.value).toBe("23:45");
    expect(document.body.textContent).toContain("وقت غير صحيح");
    wrapper.unmount();
  });

  it("clears with the ✕", async () => {
    const { wrapper, value } = mountField("07:15");
    await wrapper.get("button[aria-label='مسح الساعة']").trigger("click");
    expect(value.value).toBe("");
  });
});
