# Flowly Motion Dashboard

Next.js dashboard template inspired by a calm, modern project-management interface. The implementation uses Thai UI copy, responsive layouts, meaningful motion, keyboard search, interactive statistics, a live timer, and visual regression checks.

## Design direction

- **Mood:** calm, capable, clean, optimistic
- **Palette:** forest green, mint, clinical white, cool grey
- **Visual signature:** striped analytics bars repeated in the progress gauge
- **Layout:** fixed/collapsible sidebar + sticky top bar + modular card grid
- **Motion:** staggered KPI entry, animated charts/gauge, restrained hover lift, dialog transitions, live state pulse
- **Accessibility:** semantic regions, labels, focus-visible states, keyboard shortcut, `prefers-reduced-motion`

## Main modules

- `src/components/dashboard/dashboard-shell.tsx` — layout, cards, dialogs, timer, interactions
- `src/lib/dashboard-data.ts` — typed mock dashboard data
- `src/app/globals.css` — visual tokens, responsive grid, component styling
- `tests/visual-check.mjs` — desktop/mobile Playwright verification

## Libraries

| Library | Purpose |
|---|---|
| Next.js 16 / React 19 | App Router and UI runtime |
| Tailwind CSS 4 | CSS toolchain and future utility expansion |
| Motion for React | entry choreography, micro-interactions, dialogs |
| Recharts | responsive weekly analytics chart |
| Lucide React | consistent accessible icons |
| Playwright | real-browser desktop/mobile checks |

## Run

```bash
npm install
npm run dev -- --port 3000
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm run lint
npm run build
npm run test:visual
```

Screenshots are written to `artifacts/desktop.png` and `artifacts/mobile.png`.
