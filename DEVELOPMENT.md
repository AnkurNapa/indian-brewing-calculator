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
| `IbuFormulaSelector` | Tinseth/Rager/Garetz pill selector, shared across Brewhouse/Style Check/Home. Garetz reveals extra inputs (altitude, hop age, boil volume) inline. |
| `GravityUnitToggle` | Standalone unit toggle (separated from `GravityDisplay` itself) so one control can drive multiple displayed values at once -- see Home's Recipe Gravity card, which had a bug where OG/FG each had independent toggles that could show different units simultaneously. Don't reintroduce per-value toggles; lift the unit state to the parent instead. |

## Data flow that's easy to forget

- **Hop schedule + wort gravity + BJCP style selection are shared** (`state.hopAdditions`, `state.wortGravitySg`, `state.bjcpStyleId`) across Brewhouse Calculators' IBU section, BJCP Style Check, and Home — they used to be three disconnected local-state copies; don't reintroduce that.
- **Grain Bill lives on Mash Adjustment** (moved there from Water Report — grist is what drives mash pH, which is calculated on that tab). Water Report only holds source-water ions + the Target Style Profile picker.
- **Acid dosing uses estimated mash water volume**, not the full batch volume (`estimateMashWaterVolumeL` in `waterChemistry.ts`) — batch volume includes sparge water added after the mash is already done. This was a real bug fixed mid-session; don't reintroduce `batchVolumeL` as the acid-dose volume.
- **`targetStyleId`** (water ion target, e.g. "Pale Ale sulfate-forward") and **`bjcpStyleId`** (BJCP numeric-range style, e.g. "American IPA") are two separate settings — don't conflate them.
- **IBU formula (`ibuFormula` + `garetzExtras`) is per-recipe shared state**, same pattern as hops -- `calculateIbu`/`calculateHopWeightForTargetIbu` take an optional `formula` param defaulting to `'tinseth'` for backward compatibility. All three formulas share the same metric mg/L-style constant (`weight * AA-decimal * utilization * 1000 / volumeL`); only the `utilization` function differs per formula (`tinsethUtilization`/`ragerUtilization`/`garetzUtilization` in `ibu.ts`).
- **Grain Bill has two entry modes** (`GrainBillEditor`'s `mode` state, local not shared): by weight (default), or "% of Bill" which solves weights from target OG + each malt's percent share via `solveGrainWeightsByPercent` (`efficiency.ts`). `weightKg` is always the source of truth read everywhere else; `percentOfBill` is just a UI convenience field that doesn't affect calculations directly.
- **Recipe snapshots (`useRecipeSnapshots`) are a separate localStorage key** from the live `AppState`, containing full deep-cloned copies (JSON round-trip, so plain-data only -- don't add functions/Dates to `AppState` or snapshotting breaks). Loading a snapshot calls `setState(snapshot.state)` directly, fully replacing the live session -- always confirm before doing this (see `RecipeSnapshotsPanel`'s `window.confirm` on Load/Delete).

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
- **Protein % / other malt attributes** — only `colorLovibond`, `category`, and `potentialSg` exist on `GrainBillItem`/`WeyermannMalt`. Adding more (protein, moisture, diastatic power) follows the same pattern `potentialSg` used: extend `GrainBillItem` (optional field), extend `WeyermannMalt`, wire into `GrainBillEditor`'s quick-fill.
- **Mass-balance audit** — a full pass verifying every calculator's physical/dimensional correctness was requested but never scoped or done (only the acid-dosing volume bug was caught and fixed). If revisited, go module-by-module through `src/lib/*.ts`.
- **No charts/graphs anywhere** — e.g. a gravity-over-time chart for Fermentation Tracker doesn't exist yet.
- **beer-analytics.com** was checked as a potential data source (CC BY-SA 4.0 licensed, no public API, 1.15M+ recipes) -- could be referenced later to expand `hopVarieties.ts`/`yeastStrains.ts`/`weyermannMalts.ts` with more entries or better AA%/potential data (with attribution), but never bulk-import their recipe database.
- **Recipe snapshots have PDF/BeerXML export (`beerXml.ts`/`recipePrintView.ts`) but no JSON backup/import** -- they live only in the `useRecipeSnapshots` localStorage key, separate from the Backup & Sync tab's export/import (which only covers grain bill + fermentation batches, not full `AppState` or snapshots). If a user wants to back up/restore locked recipes across devices, there's currently no way -- would follow the same `downloadTextFile`/`parseBackupPayload` pattern already in `dataExport.ts`.
- **BeerXML export has no `<YEASTS>` block** -- yeast strain is only local state inside the Pitch Rate calculator (`PitchRateCalculator`'s `strainName`), never lifted to shared `AppState`, so recipe snapshots don't capture it. Lifting it would follow the same pattern as `hopAdditions`/`ibuFormula`.
