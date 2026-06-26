Your project is a TanStack Start app with SSR (server-side rendering) backed by Nitro + Cloudflare. GitHub Pages is a **static-only** host — it does not run a Node/Worker server, so we must switch the build to **Static Site Generation (SSG)** and then wire up a GitHub Actions workflow that builds and publishes the static files.

### What we will do

1. **Switch the Nitro preset to `static`** in `vite.config.ts` so `vite build` emits static HTML/JS/CSS instead of a server bundle.
2. **Configure the base path** in Vite to `/ayuniqa/` because GitHub Pages serves user/organization projects under a sub-path.
3. **Handle client-side routing for the static export** by ensuring all routes are pre-rendered (TanStack Router can generate static HTML for each route). The dynamic route `/games/$slug` needs every game slug known at build time, or it will fall back to a generic 404 on direct access.
4. **Create a GitHub Actions workflow** (`.github/workflows/deploy.yml`) that:
   - Checks out the repo
   - Installs dependencies with `bun install`
   - Runs `vite build`
   - Uploads the `dist/` (or `dist/public/`) folder to GitHub Pages via `actions/deploy-pages`
5. **Enable GitHub Pages** in the repository settings to serve from the GitHub Actions source.

### Important considerations
- **Supabase calls** (games list, game detail) are already client-side via `@supabase/supabase-js`, so they will continue to work after the static export.
- **Dynamic routes** (`/games/:slug`) will only work on direct page loads if we pre-render each slug at build time. If the game list changes after deploy, new slugs won’t have their own HTML file. We can mitigate this by either (a) fetching all slugs during the build and adding them to the prerender list, or (b) relying on client-side routing + a catch-all `index.html` fallback (some static hosts support this via `_redirects` or `404.html`, but GitHub Pages does not natively support SPA fallbacks). If needed, we can generate a `404.html` that mirrors `index.html` so client-side routing works for unknown paths.
- The repo name `ayuniqa` matches the expected base path `/ayuniqa/`.

### Steps in detail

1. Edit `vite.config.ts`:
   - Add `nitro: { preset: 'static' }` inside the config object.
   - Add `base: '/ayuniqa/'` to the Vite config.

2. Edit `src/router.tsx` (if needed):
   - Ensure the router supports static pre-rendering (TanStack Start + Nitro static preset usually handles this automatically for known routes).

3. Create `.github/workflows/deploy.yml`:
   - Trigger on pushes to `main`.
   - Use `actions/setup-node` (or a container with Bun).
   - Run `bun install` and `bun run build`.
   - Upload the static output directory as a Pages artifact.
   - Deploy using `actions/deploy-pages`.

4. Verify build output:
   - Run a local build and inspect the output folder to confirm HTML files exist for `/`, `/about`, `/games`, `/contact`, `/services`, and each game slug.

5. Repository settings:
   - Go to Settings → Pages → Build and deployment → Source: GitHub Actions.

After the workflow runs successfully, the site will be live at `https://doug2210.github.io/ayuniqa/`.