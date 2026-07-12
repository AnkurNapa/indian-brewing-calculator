# Development Log

Internal notes for picking this project back up in a future session. Not user-facing (see `README.md` and the in-app About tab for that).

## Architecture

- Next.js 14 (App Router), static export (`output: 'export'`) deployed to GitHub Pages at `ankurnapa.github.io/indian-brewing-calculator` via `.github/workflows/*` on push to `main`.
- `basePath`/`assetPrefix` only apply in production builds (`next.config.js`); `npm run dev` runs at root.
- Strictly metric internally (`src/lib/units.ts`). Gravity can be *displayed/entered* in SG/Plato/Brix (`GravityField`, `GravityDisplay`) but is always *stored* as SG.
- All state lives in one `AppState` object (`src/hooks/useWaterProfile.ts`), persisted to `localStorage` under `indian-brewing-calculator/app-state/v1`.
  - **Adding a field to `AppState`:** add it to the interface, add a default in `DEFAULT_APP_STATE`, but do **not** add it to `isValidAppState`'s required checks unless you want old saved sessions wiped. The hook merges `{...DEFAULT_APP_STATE, ...storedState}` on read specifically so the shape can grow without nuking existing users' data.
  - Fermentation batches are a separate localStorage key (`useFermentationBatches`), not part of `AppState`.
- Tabs are defined once in `src/app/page.tsx` (`TABS` array) and drive: the swipeable bottom nav (`Tabs.tsx`), the mobile app-bar title, `document.title`, the Home "Brew Day Flow" strip, and the "Next Step" CTA at the bottom of each panel.
- Every panel component follows the same shape: `TutorialCallout` (collapsible, near the top) → the actual controls → results. Shared UI primitives live in `src/components/ui/`.

## Shared UI primitives worth knowing about

| Component | Purpose |
|---|---|
| `SearchableSelect` | Dropdown w/ search + a ~900ms teal flash on selection for confirmation. Use for any list-backed choice. |
| `GravityField` / `GravityDisplay` | SG/Plato/Brix entry / read-only display. Internal value is always SG. |
| `TutorialCallout` | Collapsed-by-default "How to use this screen" accordion. Every panel has one. |
| `useShareText` hook | Web Share API + clipboard fallback + status message, used by Home's full-recipe share and Fermentation Tracker's per-batch share. |
| `OgEstimateCard` | Predicts OG from grain bill extract potential + assumed efficiency. |

## Data flow that's easy to forget

- **Hop schedule + wort gravity + BJCP style selection are shared** (`state.hopAdditions`, `state.wortGravitySg`, `state.bjcpStyleId`) across Brewhouse Calculators' IBU section, BJCP Style Check, and Home — they used to be three disconnected local-state copies; don't reintroduce that.
- **Grain Bill lives on Mash Adjustment** (moved there from Water Report — grist is what drives mash pH, which is calculated on that tab). Water Report only holds source-water ions + the Target Style Profile picker.
- **Acid dosing uses estimated mash water volume**, not the full batch volume (`estimateMashWaterVolumeL` in `waterChemistry.ts`) — batch volume includes sparge water added after the mash is already done. This was a real bug fixed mid-session; don't reintroduce `batchVolumeL` as the acid-dose volume.
- **`targetStyleId`** (water ion target, e.g. "Pale Ale sulfate-forward") and **`bjcpStyleId`** (BJCP numeric-range style, e.g. "American IPA") are two separate settings — don't conflate them.

## Testing / deploy

```bash
npx tsc --noEmit --pretty false   # typecheck
npx vitest run                     # unit tests (lib/*.ts only — no component tests yet)
npm run build                      # static export to out/
```

Push to `main` → GitHub Actions builds + deploys automatically (`gh run watch` to follow).

## Known gaps / backlog (not yet done)

- **No component-level tests** — `src/__tests__/` only covers pure functions in `src/lib/`. `SearchableSelect`, `GravityField`, `HomeSummaryPanel`, etc. have zero test coverage.
- **No dark mode** — design tokens are indirected through Tailwind's `amber`/`teal` names (see `tailwind.config.ts`), which would make this additive, not a rewrite, if wanted later.
- **No onboarding flow** — first-time users land straight on Home with no tour.
- **No BeerXML or PDF export** — Share/Export currently produces plain text only (Web Share API / clipboard) plus a pointer to the browser's own Print → Save as PDF. A real PDF or BeerXML export would need a new dependency.
- **Protein % / other malt attributes** — only `colorLovibond`, `category`, and `potentialSg` exist on `GrainBillItem`/`WeyermannMalt`. Adding more (protein, moisture, diastatic power) follows the same pattern `potentialSg` used: extend `GrainBillItem` (optional field), extend `WeyermannMalt`, wire into `GrainBillEditor`'s quick-fill.
- **Mass-balance audit** — a full pass verifying every calculator's physical/dimensional correctness was requested but never scoped or done (only the acid-dosing volume bug was caught and fixed). If revisited, go module-by-module through `src/lib/*.ts`.
- **No charts/graphs anywhere** — e.g. a gravity-over-time chart for Fermentation Tracker doesn't exist yet.
