## What's broken

The build is failing with:

```text
"getScriptPreloadAttrs" is not exported by "@tanstack/router-core"
```

Nothing in your app code is broken. The video, sections below the hero, NumberTicker animations, and other pages all disappeared because **the SSR bundle is failing to build**, so the server falls back to an empty/error shell.

## Root cause

The previous security fix bumped `@tanstack/react-start` to `1.168.26` to patch transitive `undici` / `js-yaml` vulnerabilities. That version of `react-start` internally pulls `@tanstack/start-server-core@1.169.15`, which in turn requires `@tanstack/router-core@1.171.13` (it uses the newer `getScriptPreloadAttrs` export).

But `package.json` still pins:

```text
"@tanstack/react-router":  "^1.168.25"   → resolves to 1.168.18 (highest in 1.168.x)
"@tanstack/router-plugin": "^1.167.28"   → resolves to 1.167.x
```

So a top-level `router-core@1.168.17` gets hoisted, which does NOT export `getScriptPreloadAttrs`, and Rollup fails when bundling the SSR server entry. Hence the catastrophic 500 / empty preview.

## Fix

Align the rest of the `@tanstack` router family with `react-start@1.168.26` so the hoisted `router-core` is the version `react-start` expects:

1. Bump in `package.json`:
   - `@tanstack/react-router` → `^1.171.13`
   - `@tanstack/router-plugin` → `^1.171.13`
2. Run `bun install` so the lockfile picks up matching `router-core@1.171.13` at the top level.
3. Re-run `bun run build:dev` to confirm the SSR bundle builds and `getScriptPreloadAttrs` resolves.
4. Reload `/`, `/games`, `/about`, `/contact` to verify the hero video, sections below it, animated numbers, and other pages are back.

## Why not just revert react-start

Downgrading `@tanstack/react-start` back to `1.167.50` would also fix the build, but it would re-open the `vulnerable_dependencies_high` / `vulnerable_dependencies_medium` findings we just resolved (`undici` + `js-yaml`). Bumping the router packages keeps the security fix in place and is the standard alignment for the TanStack Start monorepo (router + start move together).

## Scope

Only `package.json` (and the resulting `bun.lock`) change. No app/source code changes. No schema or RLS changes.
