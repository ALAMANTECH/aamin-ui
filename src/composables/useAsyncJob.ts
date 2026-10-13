import type { Ref, ShallowRef } from "vue";
import { ref, shallowRef, watch } from "vue";
import type { UsePollOptions } from "./usePoll";
import { usePoll } from "./usePoll";

export type AsyncJobStatus = "idle" | "queued" | "running" | "done" | "failed";

/** What `checkFn` reports back on each poll — a discriminated union so the
 * caller can't accidentally read `result` before `status` is `"done"`. */
export type AsyncJobCheckResult<TResult> =
  | { status: "queued" | "running"; progress?: number }
  | { status: "done"; result: TResult }
  | { status: "failed"; error: string };

export interface UseAsyncJobOptions {
  /** Poll interval in milliseconds. @default 1000 */
  interval?: number;
  /** Consecutive `checkFn` rejections after which the job is marked failed. */
  maxFailures?: UsePollOptions["maxFailures"];
}

export interface UseAsyncJobReturn<THandle, TResult> {
  status: Ref<AsyncJobStatus>;
  /** 0–100 when the backend reports it, `undefined` otherwise. */
  progress: Ref<number | undefined>;
  result: ShallowRef<TResult | undefined>;
  error: Ref<string | undefined>;
  /** Calls `startFn` to enqueue the job, then polls `checkFn(handle)` until
   * it resolves `done`/`failed`. Resets any previous job state first, so a
   * "retry" is just calling `start()` again (with the same or a different
   * `startFn`). */
  start: (startFn: () => Promise<THandle>) => Promise<void>;
  /** Stops polling and returns to `idle`, clearing progress/result/error. */
  reset: () => void;
}

/**
 * Backend-agnostic queue → poll → done|failed state machine for long-running
 * jobs (report exports, batch imports…). `checkFn` is fixed for the lifetime
 * of the composable (it's what gets polled via `usePoll`); `startFn` is
 * supplied per `start()` call, so one instance can kick off many jobs of the
 * same "shape" — see the ComponentsPage demo, which drives a single instance
 * from two buttons (a success path and a simulated failure path) via two
 * different `startFn`s.
 *
 * Maintenance note: when the real backend lands, `startFn`/`checkFn` map 1:1
 * to the export endpoints (POST /export → job id, then poll GET /export/:id).
 */
export function useAsyncJob<THandle, TResult>(
  checkFn: (handle: THandle) => Promise<AsyncJobCheckResult<TResult>>,
  options: UseAsyncJobOptions = {},
): UseAsyncJobReturn<THandle, TResult> {
  const status = ref<AsyncJobStatus>("idle");
  const progress = ref<number>();
  const result = shallowRef<TResult>();
  const error = ref<string>();
  const handle = shallowRef<THandle>();

  async function poll() {
    if (handle.value === undefined) return;
    const outcome = await checkFn(handle.value);
    if (outcome.status === "done") {
      result.value = outcome.result;
      progress.value = 100;
      status.value = "done";
      poller.stop();
    } else if (outcome.status === "failed") {
      error.value = outcome.error;
      status.value = "failed";
      poller.stop();
    } else {
      status.value = outcome.status;
      if (outcome.progress !== undefined) progress.value = outcome.progress;
    }
  }

  const poller = usePoll(poll, {
    interval: options.interval ?? 1000,
    immediate: false,
    maxFailures: options.maxFailures,
  });

  // usePoll's own maxFailures already stops the timer on repeated checkFn
  // rejections (transient network errors); without this, the job would be
  // left silently stuck in "queued"/"running" forever with a dead poller.
  watch(poller.failures, (count) => {
    const limit = options.maxFailures;
    if (limit !== undefined && count >= limit && status.value !== "done" && status.value !== "failed") {
      status.value = "failed";
      error.value = "تعذّر التحقق من حالة المهمة بعد عدة محاولات";
    }
  });

  async function start(startFn: () => Promise<THandle>) {
    reset();
    status.value = "queued";
    try {
      handle.value = await startFn();
      poller.start();
    } catch (e) {
      status.value = "failed";
      error.value = e instanceof Error ? e.message : String(e);
    }
  }

  function reset() {
    poller.stop();
    status.value = "idle";
    progress.value = undefined;
    result.value = undefined;
    error.value = undefined;
    handle.value = undefined;
  }

  return { status, progress, result, error, start, reset };
}
