# ChamaOS - Agent Instructions

## Key Commands

- `npm run dev` - Start development server
- `npm run build` - Production build (outputs to `dist/`)
- `npm run preview` - Preview production build

## Deployment

- Deploy to Vercel: `npx vercel --prod --yes --token <VERCEL_TOKEN>`
- Project name in Vercel: `chama-os`
- Framework: Vite with `vite-plugin-singlefile` (inlines all assets into single HTML)

## Build Output

The build produces a single `dist/index.html` (~842KB) that contains all JS/CSS inlined. Do NOT edit the `dist/` folder directly - it is regenerated on build.

## Important Files

- `src/App.tsx` - Main app with React Router. Uses `React.lazy()` for code splitting.
- `src/utils/cn.ts` - ClassName utility (`cn()`), NOT `clsx()` directly
- `src/data/store.ts` - Contains seed data and types
- `vercel.json` - Vercel build config

## Routes

All routes are client-side (SPA): `/`, `/dashboard`, `/members`, `/contributions`, `/loans`, `/meetings`, `/analytics`, `/pricing`, `/settings`

## Common Issues

- Use `cn` from `../utils/cn`, not `./cn` - the latter doesn't exist
- Tailwind v4 uses `@tailwindcss/vite` plugin, not PostCSS
- Single-file build may take ~10s