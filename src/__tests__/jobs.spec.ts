// Behavioural tests for the plan 009 upload/async-job primitives: the
// usePoll interval wrapper, the useAsyncJob queue→poll→done|failed state
// machine, and FileDropzone's accept/reject/remove flow.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { usePoll } from "@/composables/usePoll";
import { useAsyncJob, type AsyncJobCheckResult } from "@/composables/useAsyncJob";
import FileDropzone from "@/components/app/FileDropzone.vue";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("usePoll", () => {
  it("calls fn on every interval tick", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    usePoll(fn, { interval: 1000 });

    // immediateCallback defaults to false — the timer starts right away but
    // the first call only happens once the first interval elapses.
    expect(fn).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);
    expect(fn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("auto-stops after maxFailures consecutive rejections", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("network down"));
    const poll = usePoll(fn, { interval: 500, maxFailures: 3 });

    await vi.advanceTimersByTimeAsync(1500);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(poll.failures.value).toBe(3);
    expect(poll.isActive.value).toBe(false);

    // No further calls once auto-stopped.
    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("resets the failure counter on any success", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("blip")).mockResolvedValue(undefined);
    const poll = usePoll(fn, { interval: 500, maxFailures: 5 });

    await vi.advanceTimersByTimeAsync(500);
    expect(poll.failures.value).toBe(1);

    await vi.advanceTimersByTimeAsync(500);
    expect(poll.failures.value).toBe(0);
  });

  it("stop() halts polling", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const poll = usePoll(fn, { interval: 500 });

    await vi.advanceTimersByTimeAsync(500);
    expect(fn).toHaveBeenCalledTimes(1);

    poll.stop();
    expect(poll.isActive.value).toBe(false);

    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("useAsyncJob", () => {
  interface Handle {
    id: string;
  }

  /** Returns a checkFn that walks through `sequence` one call at a time, then repeats the last entry. */
  function sequencedCheckFn(
    sequence: AsyncJobCheckResult<string>[],
  ): (handle: Handle) => Promise<AsyncJobCheckResult<string>> {
    let call = 0;
    // The mock itself takes no `handle` param — a canned-sequence checkFn
    // never needs to inspect it, and a shorter callback is structurally
    // assignable to this function's declared `(handle: Handle) => ...` return type.
    return vi.fn(async () => {
      const outcome = sequence[Math.min(call, sequence.length - 1)];
      call += 1;
      return outcome;
    });
  }

  it("reaches done with a result on the happy path", async () => {
    const checkFn = sequencedCheckFn([
      { status: "running", progress: 50 },
      { status: "done", result: "تقرير.csv" },
    ]);
    const job = useAsyncJob(checkFn, { interval: 500 });

    const startFn = vi.fn().mockResolvedValue({ id: "job-1" });
    const starting = job.start(startFn);
    expect(job.status.value).toBe("queued");
    await starting;

    await vi.advanceTimersByTimeAsync(500);
    expect(job.status.value).toBe("running");
    expect(job.progress.value).toBe(50);

    await vi.advanceTimersByTimeAsync(500);
    expect(job.status.value).toBe("done");
    expect(job.result.value).toBe("تقرير.csv");
    expect(job.progress.value).toBe(100);
  });

  it("reaches failed on the failure path", async () => {
    const checkFn = sequencedCheckFn([{ status: "failed", error: "تعذّر إنشاء التقرير" }]);
    const job = useAsyncJob(checkFn, { interval: 500 });

    await job.start(vi.fn().mockResolvedValue({ id: "job-2" }));
    await vi.advanceTimersByTimeAsync(500);

    expect(job.status.value).toBe("failed");
    expect(job.error.value).toBe("تعذّر إنشاء التقرير");
  });

  it("reset() returns to idle and clears progress/result/error", async () => {
    const checkFn = sequencedCheckFn([{ status: "done", result: "x" }]);
    const job = useAsyncJob(checkFn, { interval: 500 });

    await job.start(vi.fn().mockResolvedValue({ id: "job-3" }));
    await vi.advanceTimersByTimeAsync(500);
    expect(job.status.value).toBe("done");

    job.reset();
    expect(job.status.value).toBe("idle");
    expect(job.result.value).toBeUndefined();
    expect(job.progress.value).toBeUndefined();
    expect(job.error.value).toBeUndefined();
  });

  it("marks the job failed once polling gives up after maxFailures", async () => {
    const checkFn = vi.fn().mockRejectedValue(new Error("network down"));
    const job = useAsyncJob(checkFn, { interval: 500, maxFailures: 2 });

    await job.start(vi.fn().mockResolvedValue({ id: "job-4" }));
    await vi.advanceTimersByTimeAsync(1000);

    expect(job.status.value).toBe("failed");
    expect(job.error.value).toBeTruthy();
  });
});

describe("FileDropzone", () => {
  function selectFiles(input: HTMLInputElement, incoming: File[]) {
    Object.defineProperty(input, "files", { value: incoming, configurable: true });
    input.dispatchEvent(new Event("change"));
  }

  it("rejects an oversize file, emits the reason, and shows it in the list", async () => {
    const wrapper = mount(FileDropzone, {
      props: { modelValue: [], maxSize: 10 },
    });

    const input = wrapper.find("input[type='file']").element as HTMLInputElement;
    const bigFile = new File(["x".repeat(20)], "report.csv", { type: "text/csv" });
    selectFiles(input, [bigFile]);
    await wrapper.vm.$nextTick();

    const rejectedEmits = wrapper.emitted("rejected");
    expect(rejectedEmits).toBeTruthy();
    const [emittedFiles, reason] = rejectedEmits![0] as [File[], string];
    expect(emittedFiles.map((f) => f.name)).toEqual(["report.csv"]);
    expect(reason).toBe("الحجم أكبر من الحد");

    expect(wrapper.text()).toContain("report.csv");
    expect(wrapper.text()).toContain("الحجم أكبر من الحد");
    // Rejected files never enter the v-model.
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("rejects a disallowed extension with the type reason", async () => {
    const wrapper = mount(FileDropzone, {
      props: { modelValue: [], accept: [".xlsx", ".csv"] },
    });

    const input = wrapper.find("input[type='file']").element as HTMLInputElement;
    selectFiles(input, [new File(["x"], "notes.txt", { type: "text/plain" })]);
    await wrapper.vm.$nextTick();

    const [, reason] = wrapper.emitted("rejected")![0] as [File[], string];
    expect(reason).toBe("النوع غير مسموح");
    expect(wrapper.text()).toContain("النوع غير مسموح");
  });

  it("accepts a valid file into modelValue", async () => {
    const wrapper = mount(FileDropzone, {
      props: { modelValue: [], accept: [".xlsx"] },
    });

    const input = wrapper.find("input[type='file']").element as HTMLInputElement;
    const goodFile = new File(["ok"], "sales.xlsx");
    selectFiles(input, [goodFile]);
    await wrapper.vm.$nextTick();

    const updateEmits = wrapper.emitted("update:modelValue");
    expect(updateEmits).toBeTruthy();
    expect((updateEmits!.at(-1)![0] as File[]).map((f) => f.name)).toEqual(["sales.xlsx"]);
    expect(wrapper.text()).toContain("sales.xlsx");
    expect(wrapper.emitted("rejected")).toBeFalsy();
  });

  it("removes an accepted file when its remove button is clicked", async () => {
    const file = new File(["ok"], "sales.xlsx");
    const wrapper = mount(FileDropzone, {
      props: { modelValue: [file] },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("sales.xlsx");

    const removeButton = wrapper.findAll("button").find((b) => b.attributes("aria-label") === "إزالة");
    expect(removeButton).toBeTruthy();
    await removeButton!.trigger("click");

    const updateEmits = wrapper.emitted("update:modelValue");
    expect(updateEmits).toBeTruthy();
    expect(updateEmits!.at(-1)![0]).toEqual([]);
    expect(wrapper.text()).not.toContain("sales.xlsx");
  });
});
