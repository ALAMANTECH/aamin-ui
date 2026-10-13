import { beforeAll, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import FileDropzone from "@/components/app/FileDropzone.vue";

// jsdom ships no object-URL implementation — the preview thumbnails need one.
beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock-preview");
  URL.revokeObjectURL = vi.fn();
});

function pick(wrapper: ReturnType<typeof mount>, file: File) {
  const input = wrapper.find("input[type=file]");
  Object.defineProperty(input.element, "files", { value: [file], configurable: true });
  return input.trigger("change");
}

describe("FileDropzone compact variant", () => {
  it("renders a single-line chip with the browse label when empty", () => {
    const wrapper = mount(FileDropzone, { props: { variant: "compact" } });
    expect(wrapper.text()).toContain("اسحب الملف هنا أو تصفّح");
    // no full-size dropzone panel
    expect(wrapper.find(".bg-grid").exists()).toBe(false);
  });

  it("shows the accepted file name and clears it via the remove button", async () => {
    const wrapper = mount(FileDropzone, {
      props: { variant: "compact", multiple: false, modelValue: [] },
    });
    await pick(wrapper, new File(["x"], "cards.xlsx"));
    const updates = wrapper.emitted("update:modelValue");
    expect(updates?.at(-1)?.[0]).toHaveLength(1);
    await wrapper.setProps({ modelValue: [new File(["x"], "cards.xlsx")] });
    expect(wrapper.text()).toContain("cards.xlsx");
    await wrapper.find('button[aria-label="إزالة"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual([]);
  });

  it("shows the rejection reason inline for a disallowed extension", async () => {
    const wrapper = mount(FileDropzone, {
      props: { variant: "compact", accept: [".xlsx"], multiple: false },
    });
    await pick(wrapper, new File(["x"], "notes.txt"));
    expect(wrapper.emitted("rejected")).toBeTruthy();
    expect(wrapper.text()).toContain("النوع غير مسموح");
  });

  it("removing an accepted file clears a rejection queued while it was present, leaving the browse label", async () => {
    const wrapper = mount(FileDropzone, {
      props: { variant: "compact", accept: [".xlsx"], multiple: false, modelValue: [] },
    });
    // Accept a valid file first — the filename chip shows it.
    await pick(wrapper, new File(["x"], "cards.xlsx"));
    await wrapper.setProps({ modelValue: [new File(["x"], "cards.xlsx")] });
    expect(wrapper.text()).toContain("cards.xlsx");

    // A rejection arrives while the accepted file is still present. The
    // template's filled-file branch wins, so the chip is unchanged, but the
    // rejection is still queued internally.
    await pick(wrapper, new File(["x"], "notes.txt"));
    expect(wrapper.emitted("rejected")).toBeTruthy();
    expect(wrapper.text()).toContain("cards.xlsx");

    // Removing the accepted file must also clear that queued rejection —
    // otherwise it resurfaces once the file chip is gone.
    await wrapper.find('button[aria-label="إزالة"]').trigger("click");
    await wrapper.setProps({ modelValue: [] });
    expect(wrapper.text()).not.toContain("cards.xlsx");
    expect(wrapper.text()).not.toContain("notes.txt");
    expect(wrapper.text()).not.toContain("النوع غير مسموح");
    expect(wrapper.text()).toContain("اسحب الملف هنا أو تصفّح");
  });
});

describe("FileDropzone image previews", () => {
  it("previews a single picked image inside the drop field instead of a row below", () => {
    const wrapper = mount(FileDropzone, {
      props: { multiple: false, modelValue: [new File(["x"], "logo.png", { type: "image/png" })] },
    });
    const stage = wrapper.find(".bg-grid");
    expect(stage.find("img").attributes("src")).toBe("blob:mock-preview");
    // The name still shows (truncated) but not as a separate list row.
    expect(stage.text()).toContain("logo.png");
    expect(wrapper.find("ul").exists()).toBe(false);
    // Remove sits beside the field (a sibling, never inside the role=button target).
    expect(wrapper.find('button[aria-label="إزالة"]').exists()).toBe(true);
  });

  it("lists multiple images below the field with thumbnails instead of the generic icon", () => {
    const wrapper = mount(FileDropzone, {
      props: {
        multiple: true,
        modelValue: [
          new File(["x"], "a.png", { type: "image/png" }),
          new File(["x"], "b.jpg", { type: "image/jpeg" }),
        ],
      },
    });
    // The field keeps its prompt; the images list under it.
    expect(wrapper.find(".bg-grid img").exists()).toBe(false);
    expect(wrapper.findAll("ul img")).toHaveLength(2);
    expect(wrapper.text()).toContain("a.png");
    expect(wrapper.text()).toContain("b.jpg");
  });

  it("shows a thumbnail in the compact chip for an image file, the type icon otherwise", () => {
    const image = mount(FileDropzone, {
      props: {
        variant: "compact",
        multiple: false,
        modelValue: [new File(["x"], "logo.png", { type: "image/png" })],
      },
    });
    expect(image.find("img").attributes("src")).toBe("blob:mock-preview");

    const sheet = mount(FileDropzone, {
      props: { variant: "compact", multiple: false, modelValue: [new File(["x"], "cards.xlsx")] },
    });
    expect(sheet.find("img").exists()).toBe(false);
    expect(sheet.text()).toContain("cards.xlsx");
  });

  it("keeps the plain row for a single non-image file", () => {
    const wrapper = mount(FileDropzone, {
      props: { multiple: false, modelValue: [new File(["x"], "cards.xlsx")] },
    });
    expect(wrapper.find(".bg-grid img").exists()).toBe(false);
    expect(wrapper.find("ul").text()).toContain("cards.xlsx");
  });
});

describe("FileDropzone remove buttons are keyboard-operable", () => {
  function press(el: Element, key: string): KeyboardEvent {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    return event;
  }

  const cases = [
    {
      name: "compact chip",
      props: { variant: "compact", multiple: false },
      file: new File(["x"], "cards.xlsx"),
    },
    {
      name: "inline image preview",
      props: { multiple: false },
      file: new File(["x"], "logo.png", { type: "image/png" }),
    },
  ] as const;

  for (const { name, props, file } of cases) {
    it(`${name}: remove button is a sibling of the role=button target and Enter/Space do not open the picker`, async () => {
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");
      const wrapper = mount(FileDropzone, { props: { ...props, modelValue: [file] } });
      const remove = wrapper.find('button[aria-label="إزالة"]');
      expect(remove.exists()).toBe(true);
      // Not nested inside role="button" (children of it are presentational to AT).
      expect(remove.element.closest('[role="button"]')).toBeNull();

      for (const key of ["Enter", " "]) {
        const event = press(remove.element, key);
        // The key must keep its native button activation (click) and never open the picker.
        expect(event.defaultPrevented, key).toBe(false);
      }
      expect(clickSpy).not.toHaveBeenCalled();

      // Native activation (Enter/Space on a button fires click) removes the file.
      await remove.trigger("click");
      expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual([]);
      expect(clickSpy).not.toHaveBeenCalled();
      clickSpy.mockRestore();
    });
  }

  it("is a single root so class/id attrs fall through", () => {
    const wrapper = mount(FileDropzone, {
      props: { variant: "compact" },
      attrs: { id: "dz", class: "w-60" },
    });
    expect(wrapper.attributes("id")).toBe("dz");
    expect(wrapper.classes()).toContain("w-60");
  });
});
