// LookupChipBoard — the one-field-vocabulary shape behind /catalog/lookups card
// types and provider categories. The board owns the chip UX; the host owns
// persistence through done() callbacks, so these tests drive the keys and
// assert the emitted contract.
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import LookupChipBoard from "@/components/app/LookupChipBoard.vue";
import { TooltipProvider } from "@/components/ui/tooltip";

const items = [
  { id: 1, name: "كروت شحن" },
  { id: 2, name: "كروت خدمات" },
];

/** Board inside a TooltipProvider (the app shell supplies one); emitted
 *  events are re-exposed on the host so tests can read them off `emitted()`. */
function make(props: Record<string, unknown> = {}) {
  const Host = defineComponent({
    emits: ["create", "rename", "remove"],
    setup(_, { emit }) {
      const board = ref();
      return () =>
        h(
          TooltipProvider,
          { delayDuration: 0 },
          {
            default: () =>
              h(LookupChipBoard, {
                ref: board,
                items,
                addLabel: "إضافة نوع كرت",
                ...props,
                onCreate: (...a: unknown[]) => emit("create", ...a),
                onRename: (...a: unknown[]) => emit("rename", ...a),
                onRemove: (...a: unknown[]) => emit("remove", ...a),
              }),
          },
        );
    },
  });
  return mount(Host, { attachTo: document.body });
}

describe("LookupChipBoard", () => {
  it("renders every item as a chip plus the add chip, and the count", () => {
    const w = make();
    const chips = w.findAll("li");
    expect(chips).toHaveLength(items.length + 1);
    expect(w.text()).toContain("كروت شحن");
    expect(w.find('input[aria-label="إضافة نوع كرت"]').exists()).toBe(true);
    expect(w.text()).toContain("2");
    w.unmount();
  });

  it("clicking a name opens inline edit; Enter emits rename with the trimmed value", async () => {
    const w = make();
    await w.findAll("li")[0].find("button").trigger("click");
    const input = w.find('input[data-id="1"]');
    expect(input.exists()).toBe(true);
    await input.setValue("  كروت شحن جديدة ");
    await input.trigger("keydown", { key: "Enter" });
    const ev = w.emitted("rename");
    expect(ev).toHaveLength(1);
    expect(ev![0][0]).toEqual(items[0]);
    expect(ev![0][1]).toBe("كروت شحن جديدة");
    // done(true) closes the editor
    (ev![0][2] as (ok: boolean) => void)(true);
    await nextTick();
    expect(w.find('input[data-id="1"]').exists()).toBe(false);
    w.unmount();
  });

  it("Esc cancels an edit without emitting; an unchanged name does not emit either", async () => {
    const w = make();
    await w.findAll("li")[1].find("button").trigger("click");
    const input = w.find('input[data-id="2"]');
    await input.setValue("whatever");
    await input.trigger("keydown", { key: "Escape" });
    expect(w.emitted("rename")).toBeUndefined();
    expect(w.find('input[data-id="2"]').exists()).toBe(false);

    await w.findAll("li")[1].find("button").trigger("click");
    await w.find('input[data-id="2"]').trigger("keydown", { key: "Enter" });
    expect(w.emitted("rename")).toBeUndefined();
    w.unmount();
  });

  it("a failed rename (done(false)) keeps the editor open with the typed value", async () => {
    const w = make();
    await w.findAll("li")[0].find("button").trigger("click");
    const input = w.find('input[data-id="1"]');
    await input.setValue("x");
    await input.trigger("keydown", { key: "Enter" });
    (w.emitted("rename")![0][2] as (ok: boolean) => void)(false);
    await nextTick();
    expect((w.find('input[data-id="1"]').element as HTMLInputElement).value).toBe("x");
    w.unmount();
  });

  it("Enter in the add chip emits create; done(true) clears it for the next entry", async () => {
    const w = make();
    const add = w.find('input[aria-label="إضافة نوع كرت"]');
    await add.setValue(" فواتير ");
    await add.trigger("keydown", { key: "Enter" });
    const ev = w.emitted("create");
    expect(ev).toHaveLength(1);
    expect(ev![0][0]).toBe("فواتير");
    (ev![0][1] as (ok: boolean) => void)(true);
    await nextTick();
    expect((add.element as HTMLInputElement).value).toBe("");
    w.unmount();
  });

  it("an empty add is ignored", async () => {
    const w = make();
    const add = w.find('input[aria-label="إضافة نوع كرت"]');
    await add.setValue("   ");
    await add.trigger("keydown", { key: "Enter" });
    expect(w.emitted("create")).toBeUndefined();
    w.unmount();
  });

  it("✕ emits remove with the item — the host confirms, the board does not", async () => {
    const w = make();
    const del = w.find('button[aria-label="حذف كروت شحن"]');
    expect(del.exists()).toBe(true);
    await del.trigger("click");
    expect(w.emitted("remove")![0][0]).toEqual(items[0]);
    w.unmount();
  });
});
