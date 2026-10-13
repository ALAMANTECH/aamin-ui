// Side-effect-free: imported by e2e.mjs and by src/__tests__/registry.spec.ts.

/** Where the public registry is served from (GitHub raw, `main`). */
export const RAW_HOST = "https://raw.githubusercontent.com";
export const STARTER_PATH = "/ALAMANTECH/aamin-ui/main/registry/r/starter.json";

/**
 * Step 1 of a new consumer project: a stock shadcn-vue Vite app with the starter
 * applied as its preset (the preset's `config.registries` brings the `@aamin`
 * registry along). docs/registry.md documents this exact command (a test keeps the
 * two identical); the e2e runs it with the host swapped for its local server.
 */
export const CONSUMER_INIT = `npx shadcn-vue@2.7.4 init -t vite -n my-app --preset ${RAW_HOST}${STARTER_PATH} -y`;

/**
 * The consumer's npm scripts (registry items cannot add scripts). Bootstrap step
 * after the init; docs/registry.md documents the same command
 * (a test keeps the two identical).
 */
export const CONSUMER_SCRIPTS =
  'npm pkg set scripts.dev="vite" scripts.build="vue-tsc -b && vite build" ' +
  'scripts.preview="vite preview" scripts.typecheck="vue-tsc -b --noEmit" ' +
  'scripts.lint="eslint ." scripts.test="vitest run --passWithNoTests" ' +
  'scripts.format="prettier --write src" ' +
  'scripts.check="npm run lint && npm run typecheck && npm run test"';
