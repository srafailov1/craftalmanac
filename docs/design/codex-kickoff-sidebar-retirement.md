# Codex kickoff — Retire the original sidebar (`#controlPanel`)

**Branch:** `design/relaunch` (never `main`). Commit locally with short
imperative messages; the owner reviews in GitHub Desktop and pushes. **Never
push.**

**Run/test locally:** `python3 -m http.server 4173 --bind 127.0.0.1` from the
repo root, open `http://127.0.0.1:4173/` in a **foreground** browser tab (the
Mapbox `load` event needs the tab visible; a backgrounded tab leaves the
basemap blank and `state.mapReady` false — that's an environment quirk, not a
bug).

**After each step:** `node --check app.js` must pass; bump the relevant `?v=`
cache token(s) in `index.html` (convention: a short descriptive token, e.g.
`?v=sidebar-2`); add a `docs/design/decisions.md` entry (newest first); commit.

**Lane note:** this task edits `app.js` filter logic + `index.html` +
`styles.css`, which `work-order-redesign.md §2` normally reserves for Claude.
**The owner has explicitly authorized Codex to take this on while Claude is
paused.** Respect every `CLAUDE.md` non-negotiable: occurrence is never harvest
permission; safety/access colors stay fixed across registers; the medicine
educational-use disclaimer stays prominent; no build step; vanilla JS/CSS only;
keep the single-file `app.js`/`styles.css` structure.

---

## Background — what's already done (don't redo)

The redesign has moved essentially all chrome into floating UI:

- **Masthead** (top-left): wordmark + Maps / Plants / Recipes / About sheets.
  Mode switching (Food / Ink / Herbalism) now happens in the **Maps sheet**.
- **Legend** (bottom-right): interactive `.leg-chip` filters — category chips
  (drive species selection) and access-status chips (drive
  `state.selectedAccessStatuses`). This is the live filter UI now.
- **Conditions rail + panels** (top-right): sun/moon/rain/wind/tide.
- **Floating season slider** (`#season-bar`, bottom-left) and **search bar**
  (`#search-bar`, top-left) — just added, working.

The old left panel `<aside id="controlPanel">` now holds ONLY: the brand block
(wordmark, the `.map-tabs` mode nav, `#mapLede`, `#mapSafetyNote`), the
per-species list (`#speciesList`, "Food Types & Species"), and `#dataStatus`.
The brand is duplicated by the masthead; mode-switching is in the Maps sheet;
category/access filtering is in the legend. **So the panel is fully redundant
except that `#speciesList`'s checkboxes are still the source of truth for which
species are shown on the map.**

---

## Goal

Delete `<aside id="controlPanel">` entirely. The owner is fine dropping the
per-species multi-select UI (they'll reorganize filters later). The one catch:
**you must migrate species selection from the DOM checkboxes to `state` first**,
or the map will filter out every point.

Do it in **two commits** (Step 1 then Step 2), verifying each.

---

## Step 1 (commit 1): species selection → `state.selectedSpecies`

Introduce `state.selectedSpecies` (a `Set` of species ids) as the source of
truth; default = all species in the active catalog; reset on mode switch.

1. **Initialize/reset** in `syncActiveCatalog()` (search `function
   syncActiveCatalog`), right after `speciesCatalog = config.catalog;`:
   ```js
   state.selectedSpecies = new Set(speciesCatalog.map((s) => s.id));
   ```
   `syncActiveCatalog` runs in `initControls()` at startup and in `setMapMode`,
   so this both initializes and resets-on-mode-switch. (Also add
   `selectedSpecies: new Set()` to the `const state = {…}` literal for clarity.)

2. **Readers** — replace species-checkbox reads with the state set:
   - `getSelectedCatalogItems()` → `return speciesCatalog.filter((s) =>
     state.selectedSpecies.has(s.id));`
   - `getVisibleRecords()` → replace `new Set(getCheckedValues("species"))` and
     the `.has(record.speciesId)` check to read `state.selectedSpecies`.
   - `renderHistogram()` → `getCheckedValues("species")` becomes
     `state.selectedSpecies`; the `selectedSpecies.includes(species.id)` test
     becomes `state.selectedSpecies.has(species.id)`.
   - `getCategorySelectionState(categoryId)` (used by the legend chips) →
     count with `state.selectedSpecies.has(species.id)` instead of
     `getSpeciesInput(species.id)?.checked`.

3. **Writers** — drive the state set:
   - `setSpeciesByCategory(category, checked)` (legend category chips):
     ```js
     speciesCatalog.filter((s) => s.category === category).forEach((s) => {
       if (checked) state.selectedSpecies.add(s.id);
       else state.selectedSpecies.delete(s.id);
     });
     ```
   - `selectOnlySpecies(speciesId)` (Plants sheet): `state.selectedSpecies =
     new Set([speciesId]); render();`

4. **Remove the species `<section>`** from `index.html` — the
   `<section class="control-group mobile-section">` containing `.species-actions`
   and `#speciesList` (and `#speciesSectionTitle`/`#speciesCount`). Keep the
   brand block and `#dataStatus` for Step 2.

5. **Neutralize dead species-list code** so nothing touches the deleted DOM:
   - In `renderFilterControls()`: delete `speciesList.innerHTML =
     getSpeciesListHTML();` and the `input[name='species']` /
     `input[name='species-group']` / `.species-group-arrow-button` /
     `[data-favorite-species]` event-wiring that follows. (The `#categoryList`
     block is already guarded from Phase 3e.) The function can end up nearly
     empty — keep it defined and still called.
   - Remove the species-action handlers (search `#selectAllSpeciesButton`,
     `#selectFavoriteSpeciesButton`, `#selectSavedLocationsButton`,
     `#clearSpeciesButton`) — those buttons are gone.
   - `renderSpeciesState()`: gut to a no-op (it updated `#speciesCount` and
     list labels, both gone). Keep its call in `render()` harmless.
   - `getSpeciesListHTML`, `getSpeciesInput`, `setSpeciesByGroup`,
     `syncCategoryCheckboxes`, `syncSpeciesGroupCheckboxes`, `toggleSpeciesGroup`,
     `renderFavoriteSpeciesState` become unused — delete them or leave them
     defined-but-uncalled, as long as **no live path references `#speciesList`
     or `input[name='species']`** (grep to confirm).
   - Leave `state.savedLocationsOnly` (stays `false`, referenced inertly) and
     `state.favoriteSpecies` in place; their only UI toggles are gone.

**Gate (Step 1):** `node --check app.js` passes; grep shows no remaining live
reference to `#speciesList` / `input[name='species']`. In a foreground browser:
points show by default (all species selected); a legend category chip toggles
its category's points off/on; a Plants-sheet card shows only that species;
switching modes via the Maps sheet resets to all species of the new catalog; no
console errors. Bump `app.js` token; decisions.md entry; commit.

---

## Step 2 (commit 2): remove the panel shell

1. **Delete the whole `<aside id="controlPanel"> … </aside>`** from
   `index.html` (brand block, `#panelGrip`, `#panelContent`, `#dataStatus`).
   `.map-area` now fills the viewport; the floating UI is the entire interface.
   The floating `#search-bar`/`#season-bar`/legend/masthead are positioned
   relative to `.map-area`, so they shift flush-left automatically once the
   panel is gone — confirm they don't overlap (nudge their `left`/`top` if so).

2. **Guard/rewire the now-dangling refs in `app.js`:**
   - `renderModeChrome()`: it sets `mapLede.textContent`,
     `mapSafetyNote.textContent`/`.hidden`, `speciesSectionTitle.textContent`,
     and toggles `mapModeButtons`. All gone — guard each (`if (mapLede) …`) or
     remove. The Maps sheet shows the active mode (`.mode-card.on`) and carries
     the herbalism disclaimer (also in popups + About), so dropping the panel
     lede/safety is fine.
   - `initControls()`: remove the `panelGrip.addEventListener(...)` line and any
     `syncPanelGripLabel()` call. The `.section-toggle` forEach becomes a no-op
     (empty NodeList) — fine.
   - `setDataStatus()`: guard the write (`if (dataStatus) …`).
   - Grep `app.js`/`styles.css` for other `#controlPanel` / `.panel` /
     `#panelContent` references and clean up. Old panel-only CSS can be left as
     dead rules or removed; **do not** remove classes the floating UI still uses
     (e.g. `.text-button`, `.location-search-form`, `.season-*`, `.histogram-*`).

3. **Mobile:** Phase 5 owns the mobile layer. Just ensure removal doesn't throw
   on load; don't attempt a full responsive pass here.

**Gate (Step 2):** `node --check app.js` passes; no `#controlPanel` in the DOM;
app loads with zero console errors; masthead, legend, season slider, search,
and conditions rail all work; mode switch (Maps sheet) and filtering (legend
chips + Plants sheet) work. Bump `app.js` + `styles.css` tokens; decisions.md
entry; commit.

---

## When you're done

Two local commits on `design/relaunch` for the owner to review and push. Note in
your final `decisions.md` entry that the sidebar is fully retired and what (if
anything) you left as dead code for a later cleanup. Then it's back to Claude
for Phase 5 (mobile) / Phase 6 (hardening).
