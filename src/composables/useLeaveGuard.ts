import { inject, type Ref } from "vue";
import { matchedRouteKey, onBeforeRouteLeave } from "vue-router";
import { useEventListener } from "@vueuse/core";
import { i18n } from "@/lib/i18n";

/**
 * Leaving mid-request aborts it with no answer — the operator cannot tell
 * whether the batch / upload / payment landed. While `busy` is true this
 * confirms in-app navigation (route components only — elsewhere there is no
 * route record to guard) and blocks a tab close / reload. `message` overrides
 * the default confirm text; it is read lazily so it follows the locale.
 * Pair with `StickySubmitBar`.
 */
export function useLeaveGuard(busy: Ref<boolean>, message?: () => string): void {
  // onBeforeRouteLeave warns outside a <RouterView> subtree — only register
  // it where there is a matched route to leave.
  if (inject(matchedRouteKey, null)) {
    onBeforeRouteLeave(() => {
      if (!busy.value) return true;
      return window.confirm(message ? message() : i18n.global.t("submitBar.leaveWhileBusy"));
    });
  }
  useEventListener(window, "beforeunload", (event) => {
    if (busy.value) event.preventDefault();
  });
}
