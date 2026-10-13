import { ref, watchEffect } from "vue";

export type Dir = "rtl" | "ltr";

// Plain module-level ref — NOT persisted. The persisted source of truth is the
// locale (`aamin-ui-locale`, see useLocale), which rewrites this on every load.
const dir = ref<Dir>("rtl");

// Register the <html> side-effect ONCE at module scope rather than per call
// site (there are several). The effect reads the shared `dir` ref, so every
// consumer stays in sync from this single writer. `<html lang>` belongs to
// useLocale(), which also writes `dir` — locale owns direction.
watchEffect(() => {
  document.documentElement.dir = dir.value;
});

/**
 * Document direction, RTL-first (derived from the persisted locale). The value is applied to <html>
 * so every logical property and reka-ui primitive follows automatically.
 * Read it here (it feeds reka's ConfigProvider); change it only through
 * useLocale() — never toggle direction alone (rule 7), which is why there is
 * deliberately no `toggle()` here.
 */
export function useDir() {
  return { dir };
}
