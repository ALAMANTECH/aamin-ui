import type { Ref } from "vue";
import { shallowRef } from "vue";
import { tryOnScopeDispose, useIntervalFn } from "@vueuse/core";

export interface UsePollOptions {
  /** Poll interval in milliseconds. */
  interval: number;
  /** Start polling as soon as the composable runs. @default true */
  immediate?: boolean;
  /** Consecutive `fn` rejections after which polling auto-stops. @default Infinity */
  maxFailures?: number;
}

export interface UsePollReturn {
  /** Whether the interval timer is currently running. */
  isActive: Readonly<Ref<boolean>>;
  /** (Re)starts polling and resets the consecutive-failure counter. */
  start: () => void;
  /** Stops polling. Does not reset `failures`. */
  stop: () => void;
  /** Consecutive rejection count — reset to 0 on any success or on `start()`. */
  failures: Readonly<Ref<number>>;
}

/**
 * Thin wrapper around `useIntervalFn` that calls `fn` on a fixed interval and
 * auto-stops after `maxFailures` consecutive rejections — e.g. a flaky-network
 * demo, or a real backend that's stopped responding, shouldn't poll forever.
 * `fn` may be sync or async; a thrown error / rejected promise counts as one
 * failure, any other return resets the counter to 0.
 *
 * The interval is always torn down on scope dispose: `useIntervalFn` already
 * registers `tryOnScopeDispose(pause)` internally, and this composable adds
 * its own `tryOnScopeDispose(stop)` on top as cheap, explicit defense-in-depth
 * (see plan 009 — composables in this kit must not leak timers).
 */
export function usePoll(fn: () => unknown, options: UsePollOptions): UsePollReturn {
  const { interval, immediate = true, maxFailures = Infinity } = options;
  const failures = shallowRef(0);

  async function tick() {
    try {
      await fn();
      failures.value = 0;
    } catch {
      failures.value += 1;
      if (failures.value >= maxFailures) {
        pause();
      }
    }
  }

  const { isActive, pause, resume } = useIntervalFn(tick, interval, { immediate });

  function start() {
    failures.value = 0;
    resume();
  }

  tryOnScopeDispose(pause);

  return { isActive, start, stop: pause, failures };
}
