import { useColorMode } from "@vueuse/core";

// Single shared color-mode instance (module scope) — every call site returns
// the same reactive state and storage/media listeners instead of registering
// its own, matching the singleton pattern useDir uses.
const mode = useColorMode({
  initialValue: "dark",
  disableTransition: false,
});

function toggle() {
  mode.value = mode.value === "dark" ? "light" : "dark";
}

/**
 * Dark-first color mode, persisted to localStorage.
 * `mode` is "dark" | "light" | "auto"; `toggle()` flips between dark/light.
 */
export function useTheme() {
  return { mode, toggle };
}
