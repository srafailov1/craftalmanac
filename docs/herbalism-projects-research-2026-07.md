# Herbalism Projects: Hazard-Classified Research Pass (2026-07-07)

Research pass to populate the empty herbalism/"medicine" projects section, grounded in the
14 catalog plants on the medicine map. Method: for each plant a researcher proposed candidate
projects (web-grounded, authoritative sources), each candidate was stress-tested by three
independent adversarial lenses (toxicology/poisoning, spurious-claims/FTC-FDA, misID/sourcing-
ethics), then adjudicated to a hazard tier and verdict. 203 agents. This doc is the editorial
decision brief; it is educational/traditional-use framing only, never medical, em-dash-free.

## Finalized direction (owner decisions, 2026-07-07)

The map is being reframed from "Herbalism" to **"Herbs"** (user-facing label only; the internal
`medicine` mode id and `medicine-*` plantIds stay, to avoid a large refactor of tags/ethics/
recipes/permission-set/tests). The body-system categories (`immune` / `digestive` / `lymphatic`
/ `topical`) are replaced by four **claim-neutral product-type categories**. Owner elected to
keep all edible preparations in Herbs (one "Wild Greens & Kitchen" category) and to keep plants
with no publishable project on the map as identification/lore entries.

**Four categories, 25 projects, 11 project-plants:**

- **Dried & Everlasting** (bergamot, yarrow, goldenrod, elderberry, echinacea, violet, witch
  hazel): bundles/sachets, wreaths, fragrance bundles, pressed art, forced branches (8).
- **Skin & Body** external-only (witch hazel, dandelion, violet): facial splash, twig wash,
  blossom oil, skin oil (4).
- **Wild Greens & Kitchen** (bergamot, violet, dandelion, garlic mustard, cleavers): teas,
  seasoning, flower syrups, candied flowers, cooked wild greens, pesto (9).
- **Garden, Fiber & Household** (echinacea, mullein, cleavers): seed heads for birds, garden
  torch, tinder/wick, milk-sieve mat (4).

**Identification & lore only** (no project card): jewelweed, plantain, chickweed.

**Removed from Herbs, routed to the Ink & Dye map:** dandelion dye, goldenrod dye, yarrow dye
bath (goldenrod already exists there as `ink-goldenrod`).

Rationale unchanged from below: categorize by the *made product*, never a body system, so no
category badge manufactures an implied health claim. See Section 6 (category leak) — the rename
plus this category swap is that fix.

## At a glance (authoritative tally from the adjudications)

47 candidate projects across 14 plants:

- **28 publishable with caveats** (11 at Tier 2 low, 17 at Tier 3 moderate-caution)
- **12 hold** (fixable blocking defect)
- **7 reject** (unfixable implied health claim or unsalvageable design)

By hazard tier: Tier 2 = 12, Tier 3 = 23, Tier 4 = 12. No candidate reached Tier 1 (all carry
at least one real caveat). The safest slate is dominated by non-body crafts (dye, dried bundles,
pressed art, torches), because those remove the poisoning surface entirely.

> Note: the synthesis narrative below cites "52 candidates / 24 publishable" in a couple of
> places; the authoritative structured count is 47 / 28 as above. One adjudication is internally
> odd (cleavers skin poultice: verdict=reject on claims grounds but tier=2-low on toxicity) —
> treat the verdict as controlling. One toxicology lens (chickweed infused oil) was blocked by a
> safety check mid-run; it did not change the outcome (chickweed items land hold either way).

## Full candidate ledger

| Tier | Verdict | Plant | Route | Project |
|---|---|---|---|---|
| T2 | publish-with-caveats | bergamot | non-body-craft | Wild Bergamot Aromatic Bundles and Sachets |
| T2 | publish-with-caveats | dandelion | non-body-craft | Dandelion Blossom Botanical Dye |
| T2 | publish-with-caveats | dandelion | topical | Dandelion Blossom Infused Oil |
| T2 | publish-with-caveats | echinacea | non-body-craft | Coneflower Seed Heads for the Winter Garden and the Birds |
| T2 | publish-with-caveats | echinacea | non-body-craft | Dried Coneflower Bundles and Wreaths |
| T2 | publish-with-caveats | echinacea | non-body-craft | Pressed Coneflower Botanical Art |
| T2 | publish-with-caveats | goldenrod | non-body-craft | Everlasting Goldenrod: Drying Flowering Tops for Autumn Bundles |
| T2 | publish-with-caveats | violet | ingested-food-beverage | Candied Violet Flowers |
| T2 | publish-with-caveats | violet | non-body-craft | Pressed Violet Botanical Cards |
| T2 | publish-with-caveats | witch-hazel | non-body-craft | Forced Witch Hazel Winter Branches |
| T2 | publish-with-caveats | witch-hazel | topical | Witch Hazel and Rose Facial Splash |
| T2 | reject | cleavers | topical | Cool Cleavers Skin Poultice and Wash |
| T3 | publish-with-caveats | bergamot | ingested-food-beverage | Wild Bergamot Leaf Tea, a Liberty Tea Beverage |
| T3 | publish-with-caveats | bergamot | ingested-food-beverage | Wild Bergamot in the Kitchen, Petals and Pizza-Plant Leaf |
| T3 | publish-with-caveats | cleavers | ingested-food-beverage | Spring Cleavers Soup Greens |
| T3 | publish-with-caveats | cleavers | non-body-craft | Cleavers Milk Sieve Mat |
| T3 | publish-with-caveats | dandelion | ingested-food-beverage | Dandelion Flower Syrup |
| T3 | publish-with-caveats | dandelion | ingested-food-beverage | Sauteed Dandelion Spring Greens |
| T3 | publish-with-caveats | elderberry | aromatic | Dried Elderflower Fragrance Bundles |
| T3 | publish-with-caveats | garlic-mustard | ingested-food-beverage | Blanched Garlic Mustard Pesto |
| T3 | publish-with-caveats | garlic-mustard | ingested-food-beverage | Wilted Garlic Mustard Greens Skillet |
| T3 | publish-with-caveats | goldenrod | non-body-craft | Goldenrod Yellow: Natural Dye from Late Summer Blooms |
| T3 | publish-with-caveats | mullein | non-body-craft | Candlewick down: mullein leaf tinder and rustic wick |
| T3 | publish-with-caveats | mullein | non-body-craft | Hag's Taper: a dipped mullein garden torch |
| T3 | publish-with-caveats | violet | ingested-food-beverage | Violet Flower Syrup |
| T3 | publish-with-caveats | violet | topical | Violet Flower and Leaf Infused Skin Oil |
| T3 | publish-with-caveats | witch-hazel | topical | Cultivated Witch Hazel Twig Skin Wash |
| T3 | publish-with-caveats | yarrow | non-body-craft | Everlasting Yarrow Bundles |
| T3 | publish-with-caveats | yarrow | non-body-craft | Yarrow Yellow Dye Bath |
| T3 | hold | broadleaf-plantain | topical | Waybread Salve: Plantain Infused Oil and Beeswax |
| T3 | hold | chickweed | ingested-food-beverage | Spring Chickweed Salad and Pesto |
| T3 | hold | chickweed | topical | Chickweed Infused Oil |
| T3 | hold | garlic-mustard | ingested-food-beverage | Second-Year Seed Table Mustard |
| T3 | hold | jewelweed | non-body-craft | Touch Me Not Seed Catch and Seed Saving |
| T3 | hold | jewelweed | topical | Fresh Jewelweed Field Rinse |
| T4 | hold | broadleaf-plantain | ingested-food-beverage | Young Plantain Greens for the Pot |
| T4 | hold | elderberry | ingested-food-beverage | Cooked Ripe Elderberry Kitchen Cordial |
| T4 | hold | elderberry | ingested-food-beverage | Elderflower Cordial Beverage Syrup |
| T4 | hold | elderberry | topical | Traditional Elderflower Water Skin Splash |
| T4 | hold | jewelweed | topical | Frozen Jewelweed Garden Cubes |
| T4 | hold | yarrow | topical | Yarrow Infused Oil for the Skin |
| T4 | reject | broadleaf-plantain | topical | Trailside Green Bandage: Fresh Plantain Spit Poultice |
| T4 | reject | chickweed | topical | Chickweed Skin Salve |
| T4 | reject | cleavers | ingested-food-beverage | Roasted Cleavers Seed Coffee |
| T4 | reject | goldenrod | ingested-food-beverage | Sweet Goldenrod Liberty Tea: A Historical Anise-Scented Beverage |
| T4 | reject | jewelweed | topical | Jewelweed Infused Skin Oil and Simple Salve |
| T4 | reject | mullein | topical | Mullein flower infused oil, a home botanical oil |

---

# Craft Almanac Herbalism Projects — Editorial Research Report

Owner-facing decision brief covering all 14 herbalism plants and every adjudicated candidate project (52 total). Every recommendation below keeps published copy strictly traditional/educational, never medical, and em-dash-free.

---

## 1. Hazard-classification rubric (tiers actually used)

Each project was scored on three independent adversarial lenses (toxicology/poisoning, spurious health claims/FTC-FDA, misidentification/sourcing/ethics). The final verdict is the **most conservative** verdict across the three lenses, and the hazard tier is the highest tier any lens assigned.

| Tier | Name | Meaning | Disposition |
|---|---|---|---|
| **1** | minimal | No realistic harm or claim pathway. | Publish. (No candidate landed here; all carry at least one real caveat.) |
| **2** | low | Real but minor, self-limiting hazards (contact allergy, mordant/glue handling, prickle) or a pure display-context claim risk. Manageable with short cautions. | Publish with caveats. |
| **3** | moderate-caution | Genuine hazards (toxic lookalikes, co-harvest exposure, ingestion of a plant needing warnings, mold/botulism in oils) that are **real but manageable with strong, specific warnings**. | Publish with caveats, or Hold if a warning is currently missing/false. |
| **4** | high — hold or reject | A lethal-lookalike ingestion pathway, an unavoidable implied drug claim, a food-mimic poisoning vector, or a design that is affirmatively unsafe as written. | Hold (fixable) or Reject (unfixable). |

**Route principle (the safety spine of the whole section):** prefer **non-body crafts** (dried bundles, dye, pressed art, torches, seed-saving) first, then **topical external** preparations, and admit **ingested** projects only where the plant has a well-established FOOD/beverage record and simple safe prep, framed as food or flavor. Non-body craft removes the entire poisoning surface; topical removes systemic/ingestion risk but concentrates misID irritants against skin; ingestion makes any lookalike error potentially fatal. This ordering is why the safest slate below is dominated by crafts.

---

## 2. PUBLISH FIRST slate (Tier 2 — safest, most beginner-empowering)

These are ready to ship once the standard caveats and the category-decoupling fix (Section 6) are applied. Grouped by plant.

**Witch hazel** (observe-only ethic, live-bark restricted — all sourcing is cultivated/bought)
- **Forced Witch Hazel Winter Branches** · non-body-craft · *no body contact, no ingestion, cut branches forced in a vase.* safety[]: cut only from cultivated/permission/nursery stems, never wild or mapped plants (observe only); keep vase water from children/pets, do not drink (tannins); decorative only, no steeping/dabbing.
- **Witch Hazel and Rose Facial Splash** · topical · *starts from store-bought distillate, no wild harvest, external only.* safety[]: external use only, keep from eyes/mouth; distillate is flammable (warm gently, no flame); Asteraceae allergy caution for the calendula; patch test; no wild witch hazel harvested. **Remove the word "astringent"** (FDA OTC drug term).

**Echinacea** (root discouraged — all use cultivated above-ground parts, zero health claims)
- **Coneflower Seed Heads for the Winter Garden and Birds** · non-body-craft · *seed-saving/habitat, cultivated plants, no human use.* safety[]: gloves for prickly cones; Asteraceae dust caution; no roots; cultivated only; occurrence is not permission.
- **Dried Coneflower Bundles and Wreaths** · non-body-craft · *decorative cut flowers, cultivated only.* safety[]: Asteraceae contact/pollen caution, gloves; dry in ventilation; cultivated only (E. laevigata is federally listed); non-toxic to pets.
- **Pressed Coneflower Botanical Art** · non-body-craft · *nothing eaten or applied.* safety[]: Asteraceae contact allergy during handling only; gloves; cultivated/purchased flowers; occurrence is not permission.

**Wild bergamot**
- **Wild Bergamot Aromatic Bundles and Sachets** · non-body-craft · *dried mint-family scent craft, no ingestion.* safety[]: harvest mildew/rust-free foliage, strip/crush in ventilation; keep from cats (thymol/carvacrol phenols); light harvest, leave flowers for pollinators. **Drop the thymol/carvacrol name-drop** (primes a medicinal read).

**Goldenrod**
- **Everlasting Goldenrod Bundles** · non-body-craft · *dried decorative bundles.* safety[]: Asteraceae/ragweed/latex handling caution; harvest only common weedy Solidago, avoid rare/protected species; rayless goldenrod is a different toxic plant; keep from pets/children.

**Dandelion** (root discouraged — flowers/leaves only)
- **Dandelion Blossom Botanical Dye** · non-body-craft · *nothing eaten or applied; flower heads only.* safety[]: gloves for latex; alum is non-food (dust/eye caution, keep from children/pets); dedicated non-food pots; clean unsprayed sites.
- **Dandelion Blossom Infused Oil** · topical · *flowers only, external only.* safety[]: label "external use only, do not eat" (botulism if repurposed); Asteraceae patch test; harvest only unsprayed ground (dandelion is the #1 lawn-herbicide target) or use purchased dried flowers. **Delete "tired gardening muscles"** (structure/function drug claim).

**Violet** (roots excluded — flowers/leaves only)
- **Pressed Violet Botanical Cards** · non-body-craft · *nothing eaten or applied, harvest at bloom.* safety[]: harvest only flowering plants (leaf lookalike = lesser celandine, NOT monkshood — fix the record); wash hands; craft object, keep from children/pets.
- **Candied Violet Flowers** · ingested · *flowers only, established confection, well-documented edible.* safety[]: true Viola only, NOT African violet (Saintpaulia); pasteurized egg white (no raw egg); flowers only (leaves laxative); clean unsprayed source; small garnish quantities.

---

## 3. PUBLISH WITH CAVEATS slate (Tier 3 — ship only with specific mitigations)

Each can ship, but carries a hazard requiring the listed load-bearing fix before publish.

**Yarrow**
- **Everlasting Yarrow Bundles** (non-body-craft) — REQUIRED: named lethal-lookalike block (poison hemlock, water hemlock) with discriminators; recommend cultivated/purchased default; ASPCA pet-toxicity note for the finished bundle; decorative-only, no smudging.
- **Yarrow Yellow Dye Bath** (non-body-craft) — REQUIRED: named hemlock lookalikes + discriminators; Asteraceae glove/handling note; **iron modifier (ferrous sulfate) is a leading cause of fatal pediatric poisoning** — label/store/dispose safely, ventilate fumes.

**Elderberry**
- **Dried Elderflower Fragrance Bundles** (aromatic) — REQUIRED: replace "umbels" with "flat clusters (cymes)"; positive whole-plant ID vs poison/water hemlock and dwarf elder; cyanogenic green stems out of reach of children/pets; drop the "lowest-risk, no cautions" all-clear.

**Mullein**
- **Hag's Taper garden torch** (non-body-craft) — REQUIRED: positive ID vs poison hemlock (its dead stalks stay toxic and release toxic smoke when burned); strip/bag seed heads before burning (rotenone/saponins); burn outdoors, stay out of smoke.
- **Candlewick down tinder/wick** (non-body-craft) — REQUIRED: N95 + eye protection + gloves for the intentionally airborne trichomes; foxglove rosette lookalike; exclude toxic seed capsules.

**Wild bergamot**
- **Liberty Tea Beverage** (ingested) — REQUIRED: avoid in pregnancy (emmenagogue) and lactation; occasional normal-brew only (no concentrated/EO-strength); cultivated default; ID in bloom.
- **In the Kitchen (petals/leaf seasoning)** (ingested) — REQUIRED: garnish/light amounts only; do not substitute higher-thymol M. punctata; clarify it is mint-family bee balm, not citrus bergamot; pregnancy caution.

**Goldenrod**
- **Goldenrod Yellow Natural Dye** (non-body-craft) — REQUIRED: positive ID vs pyrrolizidine-alkaloid ragworts/tansy and rayless goldenrod; iron mordant pediatric-poisoning note; rare-species conservation; clean (non-roadside) sourcing.

**Dandelion**
- **Sauteed Dandelion Spring Greens** (ingested) — REQUIRED: harvested at leafless rosette stage, so surface ID checklist and name hepatotoxic rosette lookalikes (tansy ragwort, coltsfoot); clean-ground sourcing; vitamin-K/warfarin note; drop "not a therapeutic dose."
- **Dandelion Flower Syrup** (ingested) — REQUIRED: petals only, cook to proper sugar concentration + refrigerate; not for infants under 1; harvest only unsprayed ground; strengthen herbicide-target sourcing warning.

**Garlic mustard** (invasive removal — a plus)
- **Wilted Greens Skillet** (ingested) — REQUIRED: "always cook, never raw" (close the "raw in quantity" loophole; first-year leaves are highest-cyanide); positive garlic-scent ID + named native lookalikes to avoid uprooting; permitted removal/permission; bag-and-trash seed disposal.
- **Blanched Pesto** (ingested) — REQUIRED: blanching is mandatory (not optional flavor step) and **discard the blanch water**; forbid the common raw variant; garlic-scent ID gate; sealed-bag disposal; permission/permitted-pull sourcing.

**Violet**
- **Violet Flower and Leaf Infused Skin Oil** (topical) — REQUIRED: name lesser celandine leaf lookalike (protoanemonin survives cold oil infusion); per-plant flower confirmation, not batch leaf-gathering; methyl salicylate caution; **delete "salves"** and drop the claim-laden herbal sources.
- **Violet Flower Syrup** (ingested) — REQUIRED: flowers only (no leaves), blue/purple only; identify at bloom; herbicide/contamination sourcing; refrigerate-while-steeping + brief simmer; keep all lymphatic/cough language out.

**Cleavers**
- **Cleavers Milk Sieve Mat** (non-body-craft) — REQUIRED: front-load "not a food-safe filter, never contact consumables"; snip clean single strands (do not roll tangled hedgerow mats that carry poison ivy/nettle); gloves for the hooked bristles.
- **Spring Cleavers Soup Greens** (ingested) — REQUIRED: cook thoroughly; harvest strand-by-strand (cleavers velcros itself to poison ivy/nightshade); minor/occasional green only; diuretic/lithium/kidney and pregnancy cautions; upgrade sourcing beyond blogs.

**Witch hazel**
- **Cultivated Witch Hazel Twig Skin Wash** (topical) — REQUIRED: state that a home decoction is tannin-rich and NOT the tannin-free store distillate; intact-skin patch test; refrigerate short-dated; cultivated/bought default with a prominent do-not-wild-harvest line; **remove "astringent" and "cooling."**

---

## 4. HOLD / REJECT list (do NOT publish as written)

### REJECT — unfixable implied health claim or unsalvageable design
| Plant | Project | Reason |
|---|---|---|
| Jewelweed | Infused Skin Oil and Simple Salve | Jewelweed's sole identity is a poison-ivy/anti-itch remedy; a jewelweed salve carries an implied drug claim by plant identity alone (FTC net impression), unfixable by wording. Efficacy also disproven (Zink RCT). |
| Plantain | Trailside Green Bandage (spit poultice) | Entire deliverable is applying plant to a bite/sting/scrape for relief = implied treatment; plus chew-and-apply routes a possible foxglove misID through the mouth. |
| Chickweed | Skin Salve | "Salve" is a drug-connoting format; chickweed's only topical tradition is itch/eczema relief; a body-directed salve has no non-therapeutic reason to exist. |
| Mullein | Flower Infused Oil | "Mullein flower infused oil" is a de facto proper noun for earache drops; name = implied drug claim, unfixable. Risk of a parent instilling in a child's ear. |
| Goldenrod | Sweet Goldenrod Liberty Tea | Filed under "immune"; monographed diuretic herb with no food-crop safety record dressed as a beverage; drug-interaction warnings telegraph efficacy. Reroute to the dye map. |
| Cleavers | Cool Skin Poultice and Wash | "Poultice" is a medicinal term; pairs preparation with nettle stings and sun exposure = implied symptom relief; a rash-causing weed with no non-claim purpose. |
| Cleavers | Roasted Seed Coffee | Fails the food-safety-record bar (blog-sourced only); diuretic/coumarin/drug-interaction plant; "coffee substitute" invites daily habitual intake; also a season/part mismatch with the catalog. |

### HOLD — fixable, but must not ship until the blocking defect is repaired
| Plant | Project | Blocking defect to fix |
|---|---|---|
| Jewelweed | Seed Catch / Seed Saving | Method directs sowing seed into new ground; touch-me-not hook is shared with invasive Himalayan balsam. Remove sow-elsewhere directive; add invasive-lookalike warning. |
| Jewelweed | Fresh Field Rinse | Implied poison-ivy treatment + cites a study that shows jewelweed underperforms soap. Strip citation and after-exposure application; reframe as streamside plant lore. |
| Jewelweed | Frozen Garden Cubes | Concentrated soluble-oxalate liquid frozen as ice cubes in a household freezer = food-mimic child/pet poisoning vector. Redesign form factor or drop frozen storage. |
| Plantain | Waybread Salve | Implied OTC-drug positioning ("green sticking plaster," "not for serious wounds"); plus foxglove/lily-of-the-valley lethal rosette lookalikes need a positive-ID checklist. |
| Plantain | Young Greens for the Pot | Deadly-lookalike (foxglove) warning lives only in an internal field; ingested + harvested at hardest-to-ID rosette stage. Surface lookalikes, cook-first, clean sourcing. |
| Yarrow | Infused Oil for the Skin | Name + "soldier's woundwort/first-aid" = implied wound remedy; plus dermally-absorbable poison hemlock lookalike. Reframe as maceration craft or drop. |
| Chickweed | Infused Oil | Fresh-plant oil at room temp for weeks = botulism vector, and a smell-test is falsely presented as the safety control; plus petty spurge/scarlet pimpernel toxic lookalikes. Switch to dried/refrigerated + positive ID gate. |
| Chickweed | Salad and Pesto | Raw, volume-harvested with toxic lookalikes (scarlet pimpernel, spurge) hardest to ID before flowering. Add flowering-window ID gate, nitrate/site caution, de-emphasize bulk grazing. |
| Elderberry | Elderflower Water Skin Splash | Deadly hemlock lookalikes; method strips florets and discards the ID evidence; "complexion rinse"/"remedy" + "immune" category. Add whole-plant ID + decouple category. |
| Elderberry | Elderflower Cordial | Only ID warning is red elderberry; omits lethal hemlock lookalikes; falsely calls flowers "non-cyanogenic, safe raw." Add hemlock ID, mandatory heat, decouple "immune." |
| Elderberry | Cooked Berry Cordial | No pokeweed warning (most common misID, NOT detoxified by cooking); vague cook time; "cordial" + "immune" category. Add pokeweed-first ID gate, cultivated default, rename. |
| Garlic mustard | Seed Table Mustard | Ships a RAW seed condiment while the plant is tagged "cook"; unsupported food-safety basis; AITC inhalation, mustard allergen, herbicide-residue, and seed-shatter dispersal all unwarned. |

---

## 5. Per-plant coverage (14 rows)

| Plant | Publishable now (P-w-C) | Best pick | Note |
|---|---|---|---|
| Jewelweed | 0 | none ship-ready | All 4 hold/reject; strongest salvage is the seed-saving craft once the sow-elsewhere directive is removed. |
| Broadleaf plantain | 0 | none ship-ready | 2 hold, 1 reject; a claim-free identification/folk-history exhibit is the only clean path. |
| Yarrow | 2 | Everlasting Yarrow Bundles | Both crafts publishable with hemlock-lookalike + pet-toxicity + iron-mordant caveats. No tea (thujone). |
| Chickweed | 0 | none ship-ready | Botulism-method and toxic-lookalike gaps; oil is salvageable with dried-material + ID gate. |
| Witch hazel | 3 | Forced Winter Branches | Model observe-only reframe; all sourcing cultivated/bought. Strip "astringent." |
| Elderberry | 1 | Dried Elderflower Fragrance Bundles | Flowers-only crafts safest; every candidate needs hemlock ID and "immune"-category decoupling. |
| Echinacea | 3 | Pressed Coneflower Botanical Art | Whole plant is a claims minefield; all 3 are claim-free cultivated crafts. Suppress the "immune" badge. |
| Mullein | 2 | Hag's Taper garden torch | Fire/fiber crafts publishable; the flower oil (earache) is a hard reject. |
| Wild bergamot | 3 | Aromatic Bundles and Sachets | Strong GRAS mint; one craft + two food/beverage options, all needing "immune" decoupling. |
| Goldenrod | 2 | Everlasting Goldenrod Bundles | Two crafts ship with ragwort/hemlock ID; the tea is a reject (reroute to dye map). |
| Dandelion | 4 | Dandelion Blossom Botanical Dye | Best-covered plant; dye + oil + two foods, all needing herbicide-target sourcing warnings. |
| Garlic mustard | 2 | Wilted Greens Skillet | Invasive-removal food showcase; cook-mandatory + native-lookalike + permitted-pull caveats. Seed mustard holds. |
| Violet | 4 | Pressed Violet Botanical Cards | Best-covered plant; harvest-at-bloom resolves the leaf lookalike. Fix record's monkshood error. |
| Cleavers | 2 | Cleavers Milk Sieve Mat | Mat + soup ship; the skin poultice and seed coffee are rejects. Decouple "lymphatic." |

**Section totals:** of 52 candidates — 24 publish-with-caveats (11 at Tier 2, 13 at Tier 3), 21 hold or reject (13 hold, 8 reject... note some plants overlap). Roughly half the pipeline is shippable now; the non-body crafts and a handful of well-documented foods carry the load.

---

## 6. Cross-cutting recommendations

### A. The single biggest regulatory finding: kill the category leak
The most-repeated defect across the entire set is **contextual, not textual**. Nine plants carry a therapeutic category on their record (`immune`: echinacea, elderberry, bergamot, goldenrod; `digestive`: dandelion, garlic mustard; `lymphatic`: violet, cleavers). Under the FTC net-impression standard, rendering that category badge/chip/filter/heading next to an otherwise claim-free craft **manufactures an implied structure/function claim for free.** This is the load-bearing fix on a majority of the Tier-2 and Tier-3 slate.

**Do this globally:** never surface a plant's medicine-map therapeutic category (`immune`, `lymphatic`, `digestive`, or any organ/system/benefit word) on a project card, teaser, tooltip, breadcrumb, share-card, or filter. Group herbalism projects under **claim-neutral kinds** instead (e.g. "Dried & fragrance crafts," "Dye & fiber," "Botanical art," "Fire & fiber," "Traditional skin oils," "Wild foods & beverages," "Kitchen preserves"). If the UI cannot suppress the inherited category, **hold** the affected projects until it can.

### B. Standard safety[] boilerplate every herbalism card should carry
Layer these on top of the project-specific entries:
1. "Educational reference to historical and traditional use. Not medical advice, and not a harvest recommendation." (the standing medicine-mode disclaimer — keep visible on every card).
2. "Occurrence on the map shows where a plant grows. It is never permission to harvest, and public land may prohibit collecting."
3. "Positively identify the plant before harvesting" + the plant's named lookalikes with concrete discriminators (never a bare "confirm ID").
4. For topical: "External use only. Do not ingest. Patch test on intact skin first. Keep the finished product away from children and pets."
5. For ingested: the plant's food-safety cautions framed as ordinary food notes (allergen, pregnancy, clean-ground sourcing), never dosing.
6. Prefer/permit **cultivated or purchased material** as the beginner default wherever wild harvest carries a lethal-lookalike or overharvest risk.

### C. Recipe schema mapping
Each shipped project maps cleanly onto the existing recipe shape:
- **name** — claim-free, food/craft-anchored, em-dash-free (e.g. "Dandelion Blossom Botanical Dye," not "Detox Dandelion...").
- **teaser** — one sensory/craft line, no benefit verb.
- **difficulty** — beginner for the Tier-2 crafts; the ingested and infused-oil projects skew intermediate (ID stakes, cook/spoilage control).
- **route** — `non-body-craft` | `topical` | `ingested-food-beverage` | `aromatic`; drives the safety boilerplate set and the shelf placement.
- **toxic** — set **true** on essentially every card here (it forces the `safety[]` list to render). Note: `toxic: true` reflects "requires a populated safety list," not "the plant is poisonous" — document this so audits do not re-flag benign crafts.
- **safety[]** — the project-specific entries from Sections 2–3 plus the boilerplate from B.
- **plantId** — the existing `medicine-*` id.

### D. PROJECT_SHELVES needs medicine shelves/kinds added
The project collection currently has **0 herbalism entries** and only food/ink/mineral shelves. `PROJECT_SHELVES` in `app.js` must gain **medicine-mode shelves and kinds** before any of this can surface. Recommend kinds that mirror the route/claim-neutral groupings in (A) — this both organizes the ~24 shippable projects and is the mechanism that keeps the therapeutic category off the cards.

### E. Standing reminders for the copy editor
- **Educational disclaimer** stays visible on every herbalism card; it does not cure an implied claim but it is required context.
- **Restricted parts / observe-only:** witch hazel is observe-only with a live-bark restriction (all sourcing cultivated/bought/distillate — no wild harvest anywhere); echinacea, dandelion, and violet exclude roots. Never let a project drift to the restricted part.
- **Elderberry rule:** any elderberry project must cook ripe berries and warn that raw berries, leaves, green stems, and bark are toxic. Flowers are the low-risk part and lead.
- **No em dashes** in any published name, teaser, framing, or safety line. Use commas, periods, colons, parentheses. All proposed copy above already complies.
- **No efficacy drift, ever:** ban treat/cure/relieve/soothe/heal/boost/immune/detox/anti-inflammatory/tonic/astringent/salve/poultice and every condition name from published copy. Where a plant's only tradition is medical (jewelweed, mullein-flower-oil, cleavers-poultice), there is no claim-free rename — drop the plant from that route rather than reword it.