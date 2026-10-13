// Types for generate.mjs (imported by src/__tests__/registry.spec.ts).

export interface RegistryFile {
  path: string;
  type: string;
  target?: string;
}

export interface ConsumerConfig {
  $schema?: string;
  style: string;
  font?: string;
  typescript?: boolean;
  tailwind: {
    config?: string;
    css: string;
    baseColor: string;
    cssVariables?: boolean;
    prefix?: string;
  };
  iconLibrary?: string;
  rtl?: boolean;
  aliases: Record<string, string>;
  registries?: Record<string, { url: string; headers?: Record<string, string> }>;
  [key: string]: unknown;
}

export interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  extends?: string;
  config?: Partial<ConsumerConfig>;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files?: RegistryFile[];
}

export interface Registry {
  $schema: string;
  name: string;
  homepage: string;
  items: RegistryItem[];
}

export const REGISTRY_NAMESPACE: string;
export const REGISTRY_URL: string;
export const SHADCN_VUE_VERSION: string;
export const OUT_DIR: string;

export function kebab(s: string): string;
export function scanImports(source: string): string[];
export function scanI18n(
  source: string,
  knownNamespaces: Set<string>,
): { keys: string[]; namespaces: string[]; dynamic: string[] };
export function collectI18nUsage(opts: { root: string }): {
  keys: Map<string, string[]>;
  dynamic: { file: string; expr: string }[];
};
export function buildConsumerConfig(opts: { root: string }): ConsumerConfig;
export function buildRegistry(opts: { root: string }): Registry;
