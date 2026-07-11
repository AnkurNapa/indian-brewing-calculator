# Indian Brewing Water Calculator

A metric-only brewing water chemistry calculator built with Next.js, TypeScript, and Tailwind CSS.

It implements generally-published, public brewing water chemistry science
(residual alkalinity, mash pH estimation, salt/acid dosing, sparge water
acidification, and water-source blending) as an original implementation.
**It is not affiliated with, endorsed by, or a copy of any commercial or
proprietary brewing water calculator** (including Bru'n Water). No
proprietary spreadsheet, source file, or copyrighted content was copied;
only the well-documented underlying chemistry (residual alkalinity,
mEq/L ion conversions, standard brewing-salt dissolution rates, and
common acid-dosing practice) was implemented from scratch.

Live site (once deployed): https://ankurnapa.github.io/indian-brewing-calculator/

## Units

This app is strictly metric/MKS. The only units used anywhere are:

- Volume: Liters (L), Hectoliters (HL)
- Mass: milligrams (mg), grams (g)
- Temperature: degrees Celsius (°C)
- Grain color: degrees Lovibond (°L) -- the universal grain-color
  convention used by maltsters and brewers worldwide, retained even
  though it isn't itself an SI unit

There are zero imperial units (no gallons, ounces, or °F) anywhere in
the app or its source.

## Features

Four tabs, sharing state (persisted to `localStorage` when available):

1. **Water Report** -- enter a source water's ion profile (Ca, Mg, Na,
   SO4, Cl, HCO3, total alkalinity as CaCO3) and a grain bill (name,
   weight in kg, color in °L). Shows the computed Residual Alkalinity.
2. **Mash Adjustment** -- pick a target style profile (Pale Ale,
   Pilsner, or Stout), enter batch volume, and see: predicted mash pH,
   recommended salt additions (grams) to reach the target ion profile,
   and an approximate acid dose (mL) to reach a target mash pH.
3. **Sparge Adjustment** -- enter sparge volume and get a recommendation
   (and approximate acid dose) to keep sparge runnings below a safe pH
   and avoid tannin extraction.
4. **Blending** -- enter two source water profiles and a blend ratio
   (0-100%) to see the resulting volume-weighted ion profile.

## Core formulas implemented

- **Residual Alkalinity (RA)**: `RA = Alkalinity - (Ca/1.4 + Mg/1.7)`,
  all as mg/L CaCO3-equivalent.
- **mEq/L conversions**: standard divisors for Ca (20.04), Mg (12.15),
  Na (23.0), SO4 (48.03), Cl (35.45), HCO3 (61.02).
- **Mash pH prediction**: `predictedPh = BASE_MALT_DISTILLED_PH (5.7) + RA-based term + color adjustment`,
  clamped to the physically plausible range 4.0-6.5. **This is a
  simplified, documented linear approximation of the real
  (nonlinear) Kolbach/Palmer mash-buffering behavior described in the
  brewing water chemistry literature -- it is not a precise
  reproduction of any published model's exact coefficients.** See the
  comments in `src/lib/waterChemistry.ts` for the exact constants used
  and why. Always verify predicted mash pH with a calibrated pH meter.
- **Salt additions solver**: a straightforward, sequential per-ion
  best-fit approach (not a true multi-variable optimizer) using
  standard brewing-salt dissolution constants for Gypsum, Calcium
  Chloride, Epsom Salt, Canning/Non-Iodized Salt, Baking Soda, and
  Chalk. See `src/lib/saltAdditions.ts` for the documented approach and
  its approximation/infeasibility handling.
- **Acid dosing**: an empirical mEq-based linear approximation for
  Lactic Acid 88%, Phosphoric Acid 10%, and Phosphoric Acid 85%. See
  `src/lib/acidAdditions.ts`.
- **Sparge water adjustment**: recommends acid addition when residual
  alkalinity is high enough to risk pushing sparge runnings pH above
  ~5.8-6.0 (tannin extraction risk).
- **Blending**: volume-weighted average of two water sources' ion
  profiles, not a naive 50/50 average.

## Approximations and assumptions (please read)

- The mash pH model is a **linear approximation**, not a literature-exact
  reproduction of any specific published buffering model. Constants are
  documented in code comments.
- The salt solver is **sequential and per-ion**, not a true simultaneous
  multi-ion optimizer. When a target profile requires trade-offs between
  salts that affect the same ion (e.g. gypsum and Epsom salt both add
  sulfate), the result is flagged "approximate."
- The acid dosing model uses a **fixed empirical mEq/pH-unit constant**,
  not a full titration curve. Use it for planning only, always titrate
  and verify empirically.
- Seed water profiles (soft/medium/hard tap water, target style
  profiles) are **illustrative, realistic example values**, not
  measurements of any specific real water utility.

## Edge cases explicitly handled (with tests)

- RA with Ca = Mg = 0 (RO/distilled water) -- no divide-by-zero/NaN.
- Negative or missing ion inputs -- validated/clamped at the input
  boundary; empty input becomes 0, never NaN.
- Empty grain bill / zero total weight -- mash pH prediction returns a
  defined fallback with a clear message.
- Extreme grist color (all black malt or all base malt) -- predicted pH
  is always clamped to 4.0-6.5.
- Very large (5000 L) and very small (1 L) batch volumes -- salt/acid
  dosing scales linearly; full float precision is retained internally
  and rounded only for display.
- Infeasible target profile (target ion lower than source, which no
  salt addition can reduce) -- solver detects this and returns a clear
  message recommending dilution/RO blending instead of a negative dose.
- Over-constrained/contradictory targets -- flagged as "approximate."
- Acid dosing already at target pH -- returns exactly 0 mL, using an
  epsilon threshold so floating-point noise never produces a spurious
  nonzero dose.
- Zero sparge volume (BIAB/no-sparge) -- returns "no sparge
  acidification needed."
- Blend ratio at 0% or 100% -- reduces cleanly to the single-source
  case.
- Two sources with very different alkalinity -- blend math is verified
  to be volume-weighted, not a naive average.
- Non-numeric/malformed input in number fields -- rejected at the UI
  boundary with an inline validation message.
- HL <-> L conversion -- commercial-scale entries convert to liters
  before any per-liter ion math.
- Rounding -- full float precision is stored internally; rounding only
  happens at display time.
- Corrupted or schema-mismatched `localStorage` (e.g. after an app
  update changes the stored shape) -- fails safe to in-app defaults,
  never crashes.
- `localStorage` unavailable (private browsing) -- the app still works
  fully in-session, just without persistence across reloads.

## Project structure

```
src/
  lib/
    units.ts               -- unit labels, conversions, safe numeric parsing
    waterChemistry.ts       -- RA, mEq/L, mash pH prediction
    saltAdditions.ts        -- salt dosing solver
    acidAdditions.ts        -- acid dosing
    spargeAdjustment.ts     -- sparge acid recommendation
    blending.ts              -- two-source blend math
    waterProfiles.ts         -- seed source + target style profiles
  hooks/
    useLocalStorageState.ts -- safe localStorage-backed state hook
    useWaterProfile.ts       -- shared app state (persisted)
  components/
    ui/                      -- Input, NumberField, ResultCard, Tabs
    water-report/            -- source water ion input form
    grain-bill/              -- grain bill editor
    mash-adjustment/         -- target profile + salt/acid dosing + mash pH
    sparge-adjustment/       -- sparge volume + acid recommendation
    blending/                -- two-source blend ratio + resulting profile
  app/
    layout.tsx, page.tsx, globals.css
  __tests__/                 -- Vitest unit tests for every lib module
```

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # run the Vitest suite
npm run test:coverage
npm run build    # static export to ./out
```

`next.config.js` sets `output: 'export'` for a fully static site, and
only applies the `/indian-brewing-calculator` `basePath`/`assetPrefix`
in production builds, so `npm run dev` still serves at the site root.

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main`: installs
dependencies, runs the test suite, builds the static export, and
publishes the `out/` directory to the `gh-pages` branch via
`peaceiris/actions-gh-pages`.

## Design direction

"Brewery lab notebook" visual language: warm amber and teal accents on
a parchment background, serif display type for headings paired with a
clean system sans for body text, and intentional hover/focus states
throughout. The layout is mobile-first: a horizontally scrollable pill
tab bar, single-column stacked forms with 44px+ touch targets, and
numeric-keyboard-friendly inputs (`inputMode="decimal"`), verified at
320/375/768/1024/1440px breakpoints with no hover-only interactions.
