// The topbar bell against a fake NotificationAdapter: the unread count is fetched at mount and polled, the list is
// fetched only when the popover opens, a row click marks it read then follows
// `link`, and "mark all" clears the badge.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { i18n } from "@/lib/i18n";
import NotificationBell, {
  type NotificationAdapter,
  type NotificationItem,
} from "@/components/app/NotificationBell.vue";
import { TooltipProvider } from "@/components/ui/tooltip";

const LIST: NotificationItem[] = [
  {
    id: "n-1",
    resource: "tickets",
    event: "admin_mentioned",
    title: "Mentioned on ticket #812",
    body: "Support asks for an admin",
    link: "/tickets/812",
    readAt: null,
    createdAt: "2026-09-15T13:10:00+02:00",
  },
  {
    id: "n-2",
    resource: "reports",
    event: "ready",
    title: "Report ready",
    body: "Export finished",
    readAt: "2026-09-15T08:30:00+02:00",
    createdAt: "2026-09-15T08:12:00+02:00",
  },
];

function fakeAdapter() {
  return {
    fetchCount: vi.fn(async () => 3),
    fetchList: vi.fn(async () => LIST.map((n) => ({ ...n }))),
    markRead: vi.fn((id: string) => Promise.resolve(void id)),
    markAll: vi.fn(async () => {}),
  } satisfies NotificationAdapter;
}

function mountBell(adapter = fakeAdapter()) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/tickets/:id", component: { template: "<div />" } },
    ],
  });
  const push = vi.spyOn(router, "push");
  const Root = defineComponent({
    setup: () => () => h(TooltipProvider, null, () => h(NotificationBell, { adapter })),
  });
  const wrapper = mount(Root, { global: { plugins: [i18n, router] }, attachTo: document.body });
  return { wrapper, push, adapter };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("NotificationBell", () => {
  it("fetches the unread count at mount, shows it on the badge, and polls it every 60 s", async () => {
    const { wrapper, adapter } = mountBell();
    await flushPromises();
    expect(adapter.fetchCount).toHaveBeenCalledTimes(1);
    expect(wrapper.find("button[aria-label]").text()).toContain("3");
    // The list is not fetched until the popover opens.
    expect(adapter.fetchList).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(60_000);
    expect(adapter.fetchCount).toHaveBeenCalledTimes(2);
  });

  it("opens the feed, marks a row read and follows its link", async () => {
    const { wrapper, push, adapter } = mountBell();
    await flushPromises();

    await wrapper.find("button[aria-label]").trigger("click");
    await flushPromises();
    await nextTick();
    expect(adapter.fetchList).toHaveBeenCalledTimes(1);

    const rows = Array.from(document.body.querySelectorAll("li button"));
    expect(rows.length).toBeGreaterThan(0);
    (rows[0] as HTMLButtonElement).click();
    await flushPromises();

    expect(adapter.markRead).toHaveBeenCalledWith("n-1");
    expect(push).toHaveBeenCalledWith("/tickets/812");
  });

  it("marks everything read and clears the badge", async () => {
    const { wrapper, adapter } = mountBell();
    await flushPromises();
    await wrapper.find("button[aria-label]").trigger("click");
    await flushPromises();
    await nextTick();

    const markAll = Array.from(document.body.querySelectorAll("button")).find((b) =>
      b.textContent?.includes(i18n.global.t("notifications.markAll")),
    );
    expect(markAll).toBeTruthy();
    markAll!.click();
    await flushPromises();

    expect(adapter.markAll).toHaveBeenCalledTimes(1);
    expect(wrapper.find("button[aria-label]").text()).not.toContain("3");
  });

  it("shows the load error with retry when the list fails", async () => {
    const adapter = fakeAdapter();
    adapter.fetchList.mockRejectedValueOnce(new Error("down"));
    const { wrapper } = mountBell(adapter);
    await flushPromises();
    await wrapper.find("button[aria-label]").trigger("click");
    await flushPromises();
    await nextTick();
    expect(document.body.textContent).toContain(i18n.global.t("notifications.loadError"));
  });
});
