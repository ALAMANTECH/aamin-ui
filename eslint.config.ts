import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import pluginVueA11y from "eslint-plugin-vuejs-accessibility";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

// eslint-plugin-vuejs-accessibility's recommended config ships every rule as
// "error". The kit's components haven't been audited for a11y yet, so start
// everything at "warn" and tighten later once the backlog is triaged.
const a11yRecommended = pluginVueA11y.configs["flat/recommended"];
const a11yRulesConfig = a11yRecommended[a11yRecommended.length - 1];
const a11yWarnRules = Object.fromEntries(
  Object.keys(a11yRulesConfig.rules ?? {}).map((rule) => [rule, "warn"]),
);

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", ".registry-e2e/**", "**/*.d.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  ...a11yRecommended,
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
      },
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.vue"],
    rules: a11yWarnRules,
  },
  {
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  // Convention guards: enforce README.md's "logical direction utilities
  // only" rule (RTL is sacred — see docs/rtl.md). Only checks
  // static/bound `class` attributes in template bodies; it will not catch
  // physical classes embedded in `cva()` variant strings inside <script>.
  //
  // Severity was "warn" from plan 001 through plan 004's step 2 (ml-auto in
  // CommandItem.vue and DropdownMenuSubTrigger.vue, left-1/2 in
  // RadioGroupItem.vue). Plan 004 fixed the ml-auto sites and flips this back
  // to "error". RadioGroupItem.vue:37's `left-1/2` is a deliberate exception
  // (absolute-centering idiom paired with -translate-x-1/2, direction-
  // agnostic since 50% is the midpoint either way) — it carries its own
  // targeted disable directive at that call site instead of relaxing this
  // rule globally.
  {
    files: ["**/*.vue"],
    rules: {
      "vue/no-restricted-class": [
        "error",
        "/^(ml|mr|pl|pr)-/",
        "/^-?(left|right)-\\d/",
        "text-left",
        "text-right",
        "/^border-l(-|$)/",
        "/^border-r(-|$)/",
        "/^rounded-l-/",
        "/^rounded-r-/",
      ],
    },
  },
  // Icons: import only via @/lib/icons so swapping libraries is a one-file change.
  // icons.ts holds the kit's icons (kit-owned, overwritten by registry updates);
  // icons.app.ts holds the project's (re-exported by icons.ts).
  {
    ignores: ["src/lib/icons.ts", "src/lib/icons.app.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "lucide-vue-next", message: "Import icons from @/lib/icons." },
            { name: "@lucide/vue", message: "Import icons from @/lib/icons." },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
);
