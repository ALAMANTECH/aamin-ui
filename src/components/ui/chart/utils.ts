import type { ChartConfig } from ".";
import { isClient } from "@vueuse/core";
import { useId } from "reka-ui";
import { h, render, type Component } from "vue";

// Simple cache using a Map to store serialized object keys.
// Bounded: a long-lived dashboard hovering thousands of points must not leak.
const CACHE_LIMIT = 200;
const cache = new Map<string, string>();

// Convert object to a consistent string key
function serializeKey(key: Record<string, unknown>): string {
  return JSON.stringify(key, Object.keys(key).sort());
}

export function componentToString<P>(config: ChartConfig, component: Component, props?: P) {
  if (!isClient) return;

  // This function will be called once during mount lifecycle
  const id = useId();

  // https://unovis.dev/docs/auxiliary/Crosshair#component-props
  return (_data: unknown, x: number | Date) => {
    const source = _data as Record<string, unknown>;
    const data = ("data" in source ? source.data : source) as Record<string, unknown>;
    const serializedKey = `${id}-${serializeKey(data)}`;
    const cachedContent = cache.get(serializedKey);
    if (cachedContent) return cachedContent;

    const vnode = h(component, { ...props, payload: data, config, x });
    const div = document.createElement("div");
    render(vnode, div);
    if (cache.size >= CACHE_LIMIT) cache.clear();
    cache.set(serializedKey, div.innerHTML);
    return div.innerHTML;
  };
}
