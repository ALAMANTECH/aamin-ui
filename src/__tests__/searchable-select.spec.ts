import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick } from "vue";
import SearchableSelect from "@/components/app/SearchableSelect.vue";
import { i18n } from "@/lib/i18n";

const options = [
  { value: "1", label: "المنطقة الجنوبية" },
  { value: "7", label: "الكفرة" },
  { value: "20", label: "طرابلس" },
];

describe("SearchableSelect", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    Element.prototype.scrollIntoView = () => {};
  });

  it("shows the selected label on the trigger, not the raw id", async () => {
    const wrapper = mount(SearchableSelect, {
      attachTo: document.body,
      props: {
        options,
        modelValue: "7",
        placeholder: "اختر…",
        ariaLabel: "المنطقة الرئيسية",
      },
      global: { plugins: [i18n] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("الكفرة");
    expect(wrapper.text()).not.toMatch(/(^|\s)7(\s|$)/);

    wrapper.unmount();
  });

  it("emits empty string when the none row is chosen", async () => {
    const wrapper = mount(SearchableSelect, {
      attachTo: document.body,
      props: {
        options,
        modelValue: "1",
        placeholder: "اختر…",
        ariaLabel: "المنطقة الرئيسية",
        noneLabel: "بدون — منطقة رئيسية",
      },
      global: { plugins: [i18n] },
    });
    await flushPromises();

    const trigger = wrapper.find("[aria-haspopup=listbox]");
    await trigger.trigger("click");
    await flushPromises();
    await nextTick();

    const none = [...document.body.querySelectorAll("[role=option]")].find((el) =>
      el.textContent?.includes("بدون"),
    );
    expect(none).toBeTruthy();
    (none as HTMLElement).click();
    await flushPromises();

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([""]);

    wrapper.unmount();
  });

  it("keeps the search input empty of the selected id when opened", async () => {
    const wrapper = mount(SearchableSelect, {
      attachTo: document.body,
      props: {
        options,
        modelValue: "20",
        placeholder: "اختر…",
        ariaLabel: "المنطقة الرئيسية",
      },
      global: { plugins: [i18n] },
    });
    await flushPromises();

    const trigger = wrapper.find("[aria-haspopup=listbox]");
    await trigger.trigger("click");
    await flushPromises();
    await nextTick();

    const search = document.body.querySelector(
      "[data-slot=combobox-input]",
    ) as HTMLInputElement | null;
    expect(search).toBeTruthy();
    expect(search!.value).toBe("");
    expect(search!.value).not.toBe("20");

    wrapper.unmount();
  });

  it("shows loading immediately when opened with empty options", async () => {
    vi.useFakeTimers();
    const wrapper = mount(SearchableSelect, {
      attachTo: document.body,
      props: {
        options: [],
        modelValue: "",
        placeholder: "اختر…",
        ariaLabel: "المنطقة الرئيسية",
        loading: false,
      },
      global: { plugins: [i18n] },
    });
    await flushPromises();

    const trigger = wrapper.find("[aria-haspopup=listbox]");
    await trigger.trigger("click");
    await flushPromises();
    await nextTick();

    expect(document.body.querySelector("[data-testid=searchable-select-loading]")).toBeTruthy();
    expect(wrapper.emitted("open")?.length).toBe(1);

    vi.useRealTimers();
    wrapper.unmount();
  });

  it("shows a loading state when the loading prop is true", async () => {
    const wrapper = mount(SearchableSelect, {
      attachTo: document.body,
      props: {
        options: [],
        modelValue: "",
        placeholder: "اختر…",
        ariaLabel: "المنطقة الرئيسية",
        loading: true,
      },
      global: { plugins: [i18n] },
    });
    await flushPromises();

    const trigger = wrapper.find("[aria-haspopup=listbox]");
    expect(trigger.attributes("aria-busy")).toBe("true");
    await trigger.trigger("click");
    await flushPromises();
    await nextTick();

    expect(document.body.querySelector("[data-testid=searchable-select-loading]")).toBeTruthy();
    expect(document.body.querySelectorAll("[role=option]").length).toBe(0);

    wrapper.unmount();
  });

  it("keeps cached options visible while loading is true", async () => {
    const wrapper = mount(SearchableSelect, {
      attachTo: document.body,
      props: {
        options,
        modelValue: "",
        placeholder: "اختر…",
        ariaLabel: "المنطقة الرئيسية",
        loading: true,
      },
      global: { plugins: [i18n] },
    });
    await flushPromises();

    const trigger = wrapper.find("[aria-haspopup=listbox]");
    expect(trigger.attributes("aria-busy")).toBeUndefined();
    await trigger.trigger("click");
    await flushPromises();
    await nextTick();

    expect(document.body.querySelector("[data-testid=searchable-select-loading]")).toBeNull();
    expect(
      [...document.body.querySelectorAll("[role=option]")].some((el) =>
        el.textContent?.includes("الكفرة"),
      ),
    ).toBe(true);

    wrapper.unmount();
  });
});

describe("SearchableSelect remote mode", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    Element.prototype.scrollIntoView = () => {};
  });

  async function openAndType(wrapper: ReturnType<typeof mount>, text: string) {
    await wrapper.find("[aria-haspopup=listbox]").trigger("click");
    await flushPromises();
    await nextTick();
    const input = document.body.querySelector("[data-slot=combobox-input]") as HTMLInputElement;
    input.value = text;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flushPromises();
    return input;
  }

  it("hands every typed term to the parent and shows its options unfiltered", async () => {
    const wrapper = mount(SearchableSelect, {
      attachTo: document.body,
      props: {
        options,
        modelValue: "",
        placeholder: "اختر…",
        ariaLabel: "نقطة البيع",
        remote: true,
      },
      global: { plugins: [i18n] },
    });
    await flushPromises();

    await openAndType(wrapper, "1234");

    expect(wrapper.emitted("search")?.at(-1)).toEqual(["1234"]);
    // "1234" matches none of the labels: a local filter would have hidden them all.
    const labels = [...document.body.querySelectorAll("[role=option]")].map((el) =>
      el.textContent?.trim(),
    );
    expect(labels).toEqual(expect.arrayContaining(["المنطقة الجنوبية", "الكفرة", "طرابلس"]));

    wrapper.unmount();
  });

  it("keeps the search box usable while the parent loads", async () => {
    const wrapper = mount(SearchableSelect, {
      attachTo: document.body,
      props: {
        options: [],
        modelValue: "",
        placeholder: "اختر…",
        ariaLabel: "نقطة البيع",
        remote: true,
        loading: true,
      },
      global: { plugins: [i18n] },
    });
    await flushPromises();

    const input = await openAndType(wrapper, "نخ");

    expect(input.disabled).toBe(false);
    expect(wrapper.emitted("search")?.at(-1)).toEqual(["نخ"]);

    wrapper.unmount();
  });

  it("filters locally and emits no search when not remote", async () => {
    const wrapper = mount(SearchableSelect, {
      attachTo: document.body,
      props: { options, modelValue: "", placeholder: "اختر…", ariaLabel: "المنطقة" },
      global: { plugins: [i18n] },
    });
    await flushPromises();

    await openAndType(wrapper, "الكفر");

    expect(wrapper.emitted("search")).toBeUndefined();
    const labels = [...document.body.querySelectorAll("[role=option]")].map((el) =>
      el.textContent?.trim(),
    );
    expect(labels).toEqual(["الكفرة"]);

    wrapper.unmount();
  });
});

describe("SearchableSelect notice", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    Element.prototype.scrollIntoView = () => {};
  });

  it("shows its notice at the top of the open list", async () => {
    const wrapper = mount(SearchableSelect, {
      attachTo: document.body,
      props: {
        options: [],
        modelValue: "",
        placeholder: "اختر…",
        ariaLabel: "نقطة البيع",
        noneLabel: "الكل",
        remote: true,
        notice: "تعذّر البحث",
      },
      global: { plugins: [i18n] },
    });
    await flushPromises();
    await wrapper.find("[aria-haspopup=listbox]").trigger("click");
    await flushPromises();
    await nextTick();

    expect(
      document.body.querySelector("[data-testid=searchable-select-notice]")?.textContent?.trim(),
    ).toBe("تعذّر البحث");

    wrapper.unmount();
  });
});
