# Design flow & UI system

The reusable pattern behind the Home and Water pages. Follow this to give
any new page (or a refresh of an old one) the same hierarchy, depth, and
scannability without reinventing markup. All primitives live in
`src/components/ui/`.

## The page rhythm (top to bottom)

Every substantive page follows the same three-beat rhythm:

1. **Vitals hero** — the 3–5 numbers that *are the decision*, big and
   scannable. Not raw inputs; the derived, meaningful values. Uses
   `StatHero` + `StatTile`. This is the "what am I looking at" anchor.
2. **Guidance** — a collapsible `TutorialCallout` ("How to use this
   screen"). One per page.
3. **Detail sections** — the inputs, tables, and results, each in a
   `SectionCard`. This is where editing happens.

Rule of thumb: **surface the conclusion before the data.** A brewer wants
"SO₄:Cl = 2.1, crisp/hoppy" before seeing seven ion fields; "Est. OG 1.058"
before the grain list. If a page only shows inputs, it's missing its hero.

## Primitives

### `StatHero` — the vitals band

```tsx
<StatHero title="Water Vitals" accentColor={someHex} empty={hasData ? undefined : <p>…</p>}>
  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
    <StatTile … />
  </div>
</StatHero>
```

- `accentColor` washes a soft blurred color into the corner — pass a
  *meaningful* color (the beer's SRM hex, a balance color), never decoration.
- `empty` renders a hint instead of tiles when there's nothing yet. Always
  handle the empty state; a page's first impression is usually empty.
- Grid is `grid-cols-2` on mobile, `sm:grid-cols-4/5` on desktop.

### `StatTile` — one headline number

```tsx
<StatTile label="Est. OG" value="1.058" />
<StatTile label="ABV" value="5.1" unit="%" />
<StatTile label="Color" value="12" unit="SRM" swatch={srmHex} />
<StatTile label="SO₄ : Cl" value="2.1" hint="crisp / hoppy" />
<StatTile label="Style match" value="4/5" tone="good" />
```

- `value` is a big display number; `unit` is the small trailing unit.
- `tone`: `good` (teal), `warn` (burnt orange), or `default` (ink). Use it
  semantically — pass/fail, in-range/out-of-range — never for looks.
- `swatch` shows a color dot before the label; `hint` adds a one-word
  qualifier under the value (the interpretation of the number).
- Show `--` for a value that isn't computable yet, not `0` or `NaN`.

### `SectionCard` — a content section

```tsx
<SectionCard title="Water Source" icon={DropletIcon} action={<EditButton/>} tone="default">
  …inputs / tables / results…
</SectionCard>
```

- Elevated white card, icon in a teal badge, uppercase display title, a
  hover lift, and an optional right-aligned `action` slot (edit link, unit
  toggle).
- `tone`: `default` (white), `teal` (reference/target info), `warning`
  (attention). Reach for `teal`/`warning` sparingly — most cards are default.
- Replaces every ad-hoc `rounded-lg border-2 …` block. If you're writing a
  bordered card by hand, use this instead.

## Tokens & rules (from the global web rules)

- **Color** is semantic: teal = primary/good, burnt orange (`#c2410c`) =
  warn/over, amber = warm chrome, parchment = surface, ink = text. Don't add
  new accent colors ad hoc.
- **Hierarchy through scale**: one big number per tile (`text-2xl`
  `font-extrabold`), small uppercase captions (`text-[0.6rem]`
  `tracking-wider`). Contrast in size, not just weight.
- **Depth**: `shadow-sm` at rest, `hover:shadow-md`. Icon badges (`ring-1`)
  add a layer without borders-everywhere.
- **Motion**: compositor-friendly only (`transition-shadow`, `opacity`,
  `transform`). No animating layout properties.
- **Every field stays free-text / optional**; presets quick-fill but never
  gate. Empty states are first-class.
- **i18n**: every user-facing string goes through `t()` with a key in the
  page's `src/i18n/translations/*.ts` fragment, in all four languages
  (en/de/hi/mr). Unit symbols (°P, %, SRM, mg/L) are universal and stay
  literal.

## Recipe for a new page

1. Identify the 3–5 **derived** numbers a user decides on → `StatHero` +
   `StatTile`, with an `empty` hint. This is the highest-value step.
2. Add one `TutorialCallout`.
3. Put each input group / table / result in a `SectionCard`.
4. Add i18n keys (4 languages) and register the fragment in
   `i18n/translations/index.ts`.
5. Register the tab in `app/page.tsx` (label in `core.ts`, an icon).
6. Pure math in `src/lib/*.ts` with tests; validate against a known source.
7. Verify: typecheck, tests, build, and eyeball mobile + desktop before ship.

Reference implementations: `components/home/HomeSummaryPanel.tsx` and
`components/water-report/WaterVitals.tsx`.
