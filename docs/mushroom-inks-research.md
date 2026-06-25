# Mushroom Inks & Dyes — Research Pass (2026-06)

**Brief (owner request):** evaluate whether fungal dyes/inks (inspired by *The
Mushroom Color Atlas*) can be added to the map, judged specifically on **iNaturalist
data availability** and **consistency of recurrence in a given area**, plus a synopsis
of the craft and the risks of this kind of expansion. **Research only — nothing is
implemented.** Findings, a tiered candidate list, and open issues follow.

Data: iNaturalist API (research-grade observation counts + monthly histograms, US
`place_id=1`, pulled 2026-06) combined with a 40-agent research pass over the craft
and 17 candidate fungi (toxicity adversarially verified). Sources at the bottom.

---

## Bottom line

Mushroom dyeing is real, rich, and well-documented — but it fights this map's core
premise in a specific, measurable way, and there is a hard inverse relationship
between **mappability** and **color value**:

- The fungi that **map well** (abundant, persistent on a fixed woody substrate, easy-ish
  ID, non-toxic) are the **perennial polypores/conks** — and they give *muted* yellows,
  golds, tans, browns, and iron-greens. Turkey tail, artist's conk, red-belted conk,
  tinder conk, chicken of the woods.
- The fungi that give the **spectacular colors** — true reds, purples, blues — are
  **ephemeral soil agarics and small annual brackets** that are unpredictable to find,
  often scarce, and frequently **toxic or conservation-sensitive**. The reds come from
  *Cortinarius* (the deadliest genus to ID); the purple comes from *Hapalopilus*, whose
  dye pigment literally *is* its toxin; the blues come from *Hydnellum*/*Sarcodon* tooth
  fungi that are red-listed in Europe and barely present in iNaturalist.

**Recommendation:** a *full* mushroom-dye layer is **not advisable** as a findability
map. A *small, curated set of persistent, non-toxic wood polypores* (Tier A below, led
by **dyer's polypore** for actual color payoff) is **feasible** — but only if it ships
with a different UI contract than the plant pins (an explicit "seasonal fruiting / a pin
is not a standing harvest" caveat), Advanced-level process warnings (ammonia/iron), and
prominent "ID carefully — dye use only, do not eat, toxic lookalikes" framing. Detail and
reasoning below for an informed decision.

---

## 1. What mushroom dyeing is (synopsis)

**The Mushroom Color Atlas** (Julie Beeler, of the Bloom & Dye studio; launched online
Oct 2021, book by Chronicle Books 2023) is a free reference documenting ~600 hues from
~28 fungi, with mycological advisors (Michael Beug, the Oregon Mycological Society). It
is explicitly a **color reference, not a foraging guide** — and, tellingly, it renders
each mushroom as a *black-and-white illustration* so the dye swatches can never be
mistaken for a real specimen, and notes the mushroom is *simmered for pigment, not eaten*.
That editorial caution is itself a signal of the safety care this subject demands.

**Lineage.** The modern craft was founded by **Miriam C. Rice** (1918–2010), who in the
early 1970s at the Mendocino Art Center discovered wool simmered with *Hypholoma
fasciculare* came out lemon-yellow. Her books (*Let's Try Mushrooms for Color*, 1974;
*Mushrooms for Color*, 1980; *Mushrooms for Dyes, Paper, Pigments & Myco-Stix*, 2007)
launched the field, and she/Dorothy Beebee started what became the biennial
**International Fungi & Fibre Symposium**.

**Color chemistry (why which mushroom gives which color):**

| Pigment class | Colors | Process lever | Source fungi |
|---|---|---|---|
| **Anthraquinones** (emodin, dermocybin) | reds, oranges, pinks, purples | alkaline pH (soda ash) shifts yellow→red; iron raises lightfastness | *Cortinarius* / *Dermocybe* |
| **Polyporic acid** (terphenylquinone) | purple → lavender | **ammonia/alkali** (raise to ~pH 9) | *Hapalopilus* (the pigment is 20–40% of dry weight — and is the toxin) |
| **Xylindein** (naphthoquinone) | blue-green | secreted into wood ("green stain"); poor textile solubility | *Chlorociboria* |
| **Thelephoric acid / atromentin** | blues, greens, browns, greys | **iron** modifier pushes toward blue/green/grey | *Hydnellum*, *Sarcodon*, *Phaeolus* |

**Process & the biomass problem.** Color is tuned by **pH** (ammonia/soda ash for
purples and red-shifts), **mordant metal** (alum = brighter baseline, **iron** = saddening
toward blue/green/grey, copper = greens, tin = brightening), fiber (wool/silk take best),
and heat. Crucially, dyeing needs **substantial fresh fruiting-body biomass — often roughly
equal weight of mushroom to fiber** — which is the direct ecological tension with a
persistence-assuming occurrence map.

---

## 2. The mapping problem — why fungi resist this map

Craft Almanac's premise is that **an organism persists where it is mapped** ("go here and
you can find it"). For most fungi this breaks, because **the thing that gets photographed
and mapped (the fruiting body) is not the thing that persists (the mycelium).**

- **Ephemerality.** Soft soil agarics persist only ~1–3 weeks before they rot. An
  iNaturalist pin for a fleshy agaric documents a window that has *already closed*;
  returning to those coordinates a week — let alone a year — later usually finds nothing.
- **Weather dependence.** Fruiting is gated by recent rain/temperature, not a stable
  calendar date, so timing and even *whether* a species fruits varies year to year.
- **The exception that proves the rule — perennial polypores.** Conks (*Fomes*,
  *Ganoderma*, *Fomitopsis*, *Phellinus*) and persistent annual brackets (*Trametes*) live
  *on a fixed dead log or standing tree* and stay visible for months to years. A pin on a
  bracket is genuinely actionable; a pin on a *Cortinarius* is a one-time event.

**A data-driven persistence signal.** I used each taxon's **monthly observation histogram**
as a proxy: a persistent bracket gets photographed *all year* (low seasonal concentration),
while an ephemeral agaric clusters into a narrow fall window (high concentration). The
"% of observations in the 3 peak months" column below is that signal — lower = more
persistently visible = more mappable.

---

## 3. Data analysis (iNaturalist, contiguous US, research-grade)

Sorted by mappability, then by dye value. "Top-3-mo %" = share of observations in the
3 peak months (lower = more year-round/persistent). Toxicity, fruiting habit, and
recommendation are from the verified research pass.

| Mushroom | Sci. name | CONUS RG obs | Top-3-mo % | Fruiting habit | Toxicity | Dye colors | Map | Dye value |
|---|---|---:|---:|---|---|---|---|---|
| **Turkey tail** | *Trametes versicolor* | **78,882** | 36 | persistent bracket | non-toxic | tan/gold/green/rust (iron) | high | low |
| **Artist's conk** | *Ganoderma applanatum* | 6,341 | 50 | perennial polypore | non-toxic | browns | high | moderate |
| **Red-belted conk** | *Fomitopsis mounceae/schrenkii* cx | ~19,500 | — | perennial polypore | non-toxic | yellow/tan/brown | high | moderate |
| **Tinder conk** | *Fomes fomentarius* cx (SE: *F. fasciatus*) | 2,563 | 39 | perennial polypore | non-toxic | yellow/gold/brown | high | moderate |
| **Chicken of the woods** | *Laetiporus sulphureus* cx | 27,807 | 71 | annual bracket (re-fruits same log) | **edible** | orange/yellow/gold | high | moderate |
| **Dyer's polypore** ★ | *Phaeolus schweinitzii* | 3,523 | 69 | annual bracket | non-toxic | yellow/gold/**green** (iron)/brown | moderate | **high** |
| **Tender nesting polypore** | *Hapalopilus rutilans* (=*nidulans*) | 591 | 82 | small annual polypore | **toxic** (pigment = toxin) | **purple/lilac** (ammonia) | moderate | **high** |
| **Shaggy bracket** | *Inonotus hispidus* / *Phellinus* | 548 / 2,156 (genus) | 80 | persistent bracket | non-toxic | gold/yellow/brown | moderate | high |
| **Green elf cup** | *Chlorociboria aeruginascens* | 2,446 | 63 | wood stain (persists in wood) | non-toxic | **blue-green** (mostly spalted wood) | moderate | moderate |
| **Velvet rollrim** | *Tapinella atrotomentosa* | 4,775 | 86 | ephemeral fruitbody on wood | **toxic** | mauve/purple/green (fades to grey) | moderate | low |
| **Dyeball** | *Pisolithus arhizus* cx | 1,091 | 60 | ephemeral (mycorrhizal) | toxic/irritant | brown/black/gold | low | high |
| **Blue tooth fungi** | *Hydnellum* / *Sarcodon* spp. | 388 / 39 (4,989 genus) | 82 | ephemeral (mycorrhizal) | non-toxic | **blue/green/grey** (iron) | low | high |
| **Red webcaps** | *Cortinarius smithii / semisanguineus / sanguineus* | 395 / 529 / 50 (20,808 genus) | 71–78 | ephemeral (mycorrhizal) | **toxic; deadly genus** | **red/orange/pink** | low | high |
| **Jack-o'-lantern** | *Omphalotus olivascens / illudens* | ~14.8k / ~15.3k | 77–81 | ephemeral | **toxic** (illudin) | purple/lavender | low | high |
| **Sulphur tuft** | *Hypholoma fasciculare* | 8,716 | 61 | ephemeral soil agaric | **toxic** | yellow/green | low | moderate |
| **Big laughing gym** | *Gymnopilus luteofolius* / *junonius* cx | 1,961 | 44 | ephemeral soil agaric | **toxic** + psilocybin | yellow | low | moderate |
| **Fly agaric** | *Amanita muscaria* | 42,638 | 53 | ephemeral soil agaric | **toxic** | ~none ("dye dud") | low | low |

**Read this table top-to-bottom:** the non-toxic, high-mappability rows give moderate-or-low
color; the **high** dye-value rows (purple, blue, red) sit at **moderate-to-low**
mappability and are mostly **toxic**, with the single clean exception being **dyer's
polypore** (non-toxic, high dye value, moderate mappability) — the standout candidate.

---

## 4. Candidate mushrooms (tiered)

### Tier A — Mappable & safe (the realistic shortlist)

Persistent on fixed wood, abundant on iNaturalist, non-toxic, easier ID. Muted palette
(yellows/golds/tans/browns; iron pushes green/grey). These are the only ones that fit the
map's persistence premise reasonably well.

- **Dyer's polypore — *Phaeolus schweinitzii*** ★ — *the recommendation if anything is
  added.* The classic dye polypore: strong yellows, golds, and **greens** (with iron),
  non-toxic, distinctive (velvety rust bracket at conifer bases), 3,500+ CONUS obs. Caveat:
  it's an *annual* bracket (fruits late summer–fall), so moderate — not perfect — mappability.
- **Turkey tail — *Trametes versicolor*** — by far the most-observed (78,882), easiest to
  find, year-round persistent, non-toxic. Color is modest (tans/golds; greenish with iron).
- **Artist's conk — *Ganoderma applanatum***, **red-belted conk — *Fomitopsis mounceae*
  complex**, **tinder conk — *Fomes fomentarius* complex** — perennial conks, very mappable,
  non-toxic; browns/yellows/tans.
- **Chicken of the woods — *Laetiporus sulphureus*** — abundant, distinctive, **edible**;
  oranges/golds. (More seasonal than the conks.)

### Tier B — Great color, real problems (add only with heavy safeguards, if at all)

- **Dyer's polypore's purple cousin — *Hapalopilus rutilans*** — the famous **lilac/purple**
  (with ammonia), but **its dye pigment, polyporic acid, is its toxin** (documented human
  poisonings; hepato/nephrotoxic). Uncommon (591 obs). Would need an Advanced + toxic frame.
- **Green elf cup — *Chlorociboria aeruginascens*** — gorgeous **blue-green** (xylindein),
  non-toxic, and the *stain persists in the wood* (so it's findable) — but it's better as a
  **spalted-wood/pigment** material than a textile dye (poor solubility), and the cups
  themselves are tiny/ephemeral.
- **Velvet rollrim — *Tapinella atrotomentosa*** — mauve/purple, sits on fixed conifer
  stumps (so mappable-ish), but **toxic/inedible**, color **fades to grey**, and it has a
  **deadly lookalike** (*Paxillus involutus*).
- **Shaggy bracket — *Inonotus hispidus***, **dyeball — *Pisolithus arhizus*** — good
  golds/browns/blacks but messy taxonomy / lower obs / irritant (dyeball).

### Tier C — Do not add (low mappability, toxic, and/or conservation-sensitive)

- **Blue tooth fungi — *Hydnellum*/*Sarcodon*** — the only natural source of true **blues**,
  but **ephemeral, scarce** (39–388 obs), mycorrhizal, and **conservation-sensitive**
  (red-listed/old-growth-associated in Europe). Beautiful and exactly wrong for a public
  harvest map.
- **Red webcaps — *Cortinarius* / *Dermocybe*** (US red dyer = *C. smithii*) — the prized
  **reds**, but ephemeral soil agarics in the **single most dangerous genus to ID**: it
  contains the orellanine species (*C. orellanus*, *C. rubellus*) that cause **delayed,
  untreatable kidney failure (4–15 days, no antidote)**. A pin saying "dyer's cort here"
  invites non-experts into that genus.
- **Jack-o'-lantern (*Omphalotus*), sulphur tuft (*Hypholoma fasciculare*)** — abundant but
  ephemeral and **toxic** (and routinely confused with edible chanterelles / edibles).

### Tier D — Exclude outright

- **Big laughing gym — *Gymnopilus* complex** — toxic, several members contain **psilocybin**
  (draws ingestion-minded foragers), and shares a field gestalt with the **deadly amatoxin**
  *Galerina marginata*. Mapping rusty-spored woodland agarics is a safety liability.
- **Fly agaric — *Amanita muscaria*** — a documented **"dye dud"** (≈no usable fiber color)
  *and* toxic *and* an *Amanita* (genus of the death cap / destroying angels). Zero upside.

---

## 5. Potential issues with a mushroom-dye expansion

1. **Safety / toxicity vs. the project's ethos.** The most desirable dye fungi are toxic,
   and the reds live in *Cortinarius* (deadly orellanine relatives). Even though dye fungi
   aren't *eaten*, you must ID them correctly to find and handle them, and a public pin
   normalizes collecting dangerous genera. The existing rule "no fungi on the **food** map
   without a species-level edible whitelist" doesn't directly apply (dye ≠ food), but its
   *spirit* — precaution around fungi — argues for an equally strict, **separate** gate for
   dye fungi (curated whitelist of non-toxic, easy-ID species only; no deadly genera).

2. **Identification difficulty + deadly lookalikes.** Mushroom ID is far harder and more
   error-prone than plant ID, and several candidates have lethal lookalikes (*Tapinella* vs
   deadly *Paxillus involutus*; *Gymnopilus* vs deadly *Galerina*; any *Amanita* vs death
   cap). iNaturalist genus/complex labels are often unreliable here (see #6).

3. **Mappability / recurrence (the owner's core question).** For ephemeral fungi an
   occurrence pin is a *past event*, not a place to return to — it violates the
   "organism persists where mapped" contract. Only the perennial/persistent **wood**
   polypores hold up. Any fungal layer needs UI language like *"seasonal fruiting — a pin
   marks where it was seen, not a standing harvest,"* closer to the existing rain-flush
   treatment than to the tree pins.

4. **Conservation & sustainability.** Dyeing needs **roughly mushroom-weight ≈ fiber-weight**
   of fresh fruiting bodies — real harvest pressure. The most beautiful dyers
   (*Hydnellum*/*Sarcodon*) are slow, uncommon, old-growth-associated, and red-listed
   abroad. Harvesting fruiting bodies off *abundant wood-decay* fungi is low-impact (the
   mycelium persists); harvesting *scarce mycorrhizal* fungi is not.

5. **Process hazards.** The signature colors require **ammonia** (purples) and **iron**
   (blues/greens/greys) — caustic/irritant chemistry. This fits the site's existing
   **Advanced** difficulty + caustic-process framing (cf. dyer's woad, the wood-ash modifier).

6. **Data hygiene — fungal taxonomy churn.** iNaturalist fungal names move constantly, which
   silently distorts counts. Examples found in this pass: "*Fomitopsis pinicola*" returns
   **2** US obs because the North American red-belted conk was split into *F. mounceae*
   (16,545) / *F. ochracea* (2,992) / *F. schrenkii*; *Fomes fomentarius* is a complex (SE
   US = *F. fasciatus*); the US red dye cort is *C. smithii*, not the European *C.
   semisanguineus*; *Cortinarius* genus has 20,808 obs but you can't map at genus level
   because deadly species are mixed in. Any encoding must pin **specific, current taxa** and
   re-check counts, not rely on familiar field-guide names.

7. **Conceptual fit / UX.** A fungal "find" is fundamentally *"this was seen here once,"* not
   *"go here to harvest."* Bolting that onto the plant-pin model would mislead unless the
   card explicitly reframes it. This is a design decision, not just a data one.

---

## 6. If pursued — a minimal, defensible approach

If the owner wants *some* fungal color on the map, the lowest-risk path is a **small
curated "fungal dyes" set**, treated as its own gated category:

- **Whitelist only Tier A** (non-toxic, persistent wood polypores): **dyer's polypore**
  (best color), turkey tail, artist's conk, red-belted conk, tinder conk, chicken of the
  woods. Optionally **green elf cup** as a wood-pigment curiosity.
- **No deadly genera, ever** (no *Cortinarius*, *Amanita*, *Gymnopilus*, *Galerina*-adjacent
  agarics). Possibly *Hapalopilus* only as an **educational-only** entry (great purple,
  honest "the pigment is the toxin" warning), never a casual recommendation.
- **Pin every taxon to a current, specific iNaturalist taxon ID** and re-verify counts
  (taxonomy churn, #6).
- **New UI contract:** a seasonal/ephemeral caveat ("a pin marks a past fruiting, not a
  standing harvest"), **Advanced** difficulty for ammonia/iron processes, and a prominent
  **"identify carefully — dye use only, do not eat, has toxic lookalikes"** stamp (reuse the
  existing safety-box / educational-stamp patterns).
- Frame it honestly as **muted, experimental color** — yellows, golds, tans, browns, greens
  — not the Atlas's full rainbow, which depends on species this map should not send people to.

---

## Sources (selected)

- The Mushroom Color Atlas — about & process: https://mushroomcoloratlas.com/about/ · https://mushroomcoloratlas.com/process/
- Miriam C. Rice (history of the craft): https://en.wikipedia.org/wiki/Miriam_C._Rice · IMDI "Mushrooms for Color": https://www.mushroomsforcolor.com/a-brief-history-of-the-art-of-mushroom-dyeing-2/
- NAMA — best dye mushrooms / dyes & papermaking: https://namyco.org/interests/education/dyes-and-papermaking/a-short-selection-of-the-best-mushrooms-for-color/
- Fungal colorants — *Cortinarius* anthraquinones (Coloration Technology 2019): https://onlinelibrary.wiley.com/doi/abs/10.1111/cote.12376
- *Hapalopilus* polyporic acid toxicity: https://www.fungusfactfriday.com/170-hapalopilus-nidulans/ · NAMA polyporic acid note: https://namyco.org/publications/mcilvainea-journal-of-american-amateur-mycology/polyporic-acid-in-fungi-a-brief-note/
- *Cortinarius* orellanine poisoning & ID risk; *Paxillus* syndrome; *Galerina* amatoxins — see per-candidate sources in the workflow journal (toxicology refs: MDPI *Toxins*, PMC, Wilderness Environ Med).
- Fungal fruiting phenology / ephemerality (PNAS): https://pmc.ncbi.nlm.nih.gov/articles/PMC2268836/
- *Chlorociboria* xylindein / spalting: https://en.wikipedia.org/wiki/Chlorociboria_aeruginascens
- Fibershed — Northern California dye mushrooms: https://fibershed.org/2014/01/12/regional-palettes-a-closer-look-at-northern-california-dye-mushrooms/
- iNaturalist API (observation counts + month-of-year histograms, US place_id=1, 2026-06).

*Full per-candidate research (dye process, toxins, ecology, ID, conservation, sources) is
preserved in the run journal for `mushroom-dye-research`; this document is the synthesis.*
