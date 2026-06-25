export const meta = {
  name: 'stone-mineral-data-sources',
  description: 'Find and vet data repositories for US stone/mineral collecting localities (coverage, access/API, license, permission overlay) for a possible Craft Almanac stone layer',
  phases: [
    { title: 'Investigate', detail: 'one agent per candidate repository / permission framework' },
    { title: 'Verify', detail: 'adversarially confirm license + access for the promising sources' },
    { title: 'Synthesize', detail: 'ranked recommendation + permission strategy + ATTRIBUTION notes' },
  ],
}

const SITE = `
PROJECT: "Craft Almanac" — a no-build static map (vanilla JS + Mapbox GL) of local material availability + ethical harvesting practices for the CONTIGUOUS US. It has Food / Ink / Medicine maps and is scoping an "Objects / 3D materials" map that would include STONE & MINERAL knapping/carving materials (chert/flint, obsidian, novaculite, alabaster, soapstone/steatite, etc.).

WHY THIS RESEARCH: stone/minerals are NOT biological taxa, so the site's normal geolocation mechanism (iNaturalist observations of a source organism) does NOT work for them. A stone layer would instead need MANUALLY-PLACED or IMPORTED POINTS at named localities, layered over a collecting-legality (permission) layer. We need to know which existing data repositories can supply those points, and what the licensing/permission picture is.

HARD CONSTRAINTS THAT DECIDE USABILITY:
- LICENSE IS THE GATE. The project already uses CC BY-NC-type sources and REQUIRES every data source to be added to ATTRIBUTION.md with correct license terms BEFORE it ships. A source we cannot legally redistribute/cache is unusable no matter how good its coverage. Public-domain (USGS) and open (CC BY / ODbL) sources are strongly preferred. Scrape-prohibited or all-rights-reserved community sites are NOT usable as a data import (at most a "go look here yourself" link).
- The site is static with no backend, so it prefers data it can DOWNLOAD/CACHE as GeoJSON (like it already does for Falling Fruit, NPS orchards, Census boundaries, USFS rules). A live third-party API is possible (it already calls iNaturalist + USGS PAD-US) but caching is the norm.
- "Occurrence is never permission." A locality dataset tells you a material EXISTS somewhere; it does NOT tell you that collecting is legal there. The legal framework is separate (BLM casual collecting under 43 CFR 8365 allows reasonable personal amounts of rock/mineral/semiprecious gems on most non-claimed/non-withdrawn BLM land; USFS similar; NPS prohibits rock collecting; state trust/park rules vary; mining claims and mineral withdrawals remove casual-collecting rights).

For each source, report: what it covers, whether points are precisely geolocated, how data is accessed (API / bulk download / web-only / scrape-prohibited), the LICENSE and attribution requirement, whether it carries any collecting-legality signal, and an honest fit verdict for THIS project.
`

const WEBTOOLS = `FIRST load web tools: ToolSearch with query "select:WebSearch,WebFetch", then use them. Verify license/API claims against the SOURCE'S OWN terms-of-use / API-docs / data-license pages (cite the URL), not third-party summaries. Where an API exists, note the endpoint and whether a key/approval is required.`

const SOURCE_SCHEMA = {
  type: 'object',
  properties: {
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: { type: 'string', description: 'locality-data | bedrock-geology | permission-layer | community-editorial | reference-only' },
          covers: { type: 'string', description: 'What US stone/mineral info it holds, <= 25 words' },
          geolocation: { type: 'string', description: 'point-level? polygon? coordinate precision/obfuscation? <= 15 words' },
          access: { type: 'string', description: 'API / bulk download / web-only / scrape-prohibited; note key/approval needs' },
          license: { type: 'string', description: 'The actual license/terms; can a CC-BY-NC-respecting project redistribute/cache it?' },
          attribution: { type: 'string', description: 'Attribution requirement, or "none"' },
          permissionSignal: { type: 'string', description: 'Does it indicate collecting legality, or only occurrence? <= 20 words' },
          fit: { type: 'string', description: 'strong | moderate | weak | no' },
          caveats: { type: 'string', description: 'Key caveats, <= 30 words' },
          urls: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'category', 'covers', 'access', 'license', 'fit'],
      },
    },
  },
  required: ['sources'],
}

const VERIFY_BATCH_SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          licenseConfirmed: { type: 'string', description: 'The verified license/terms verbatim-ish, with the URL it came from' },
          accessConfirmed: { type: 'string', description: 'Verified access path (API endpoint/key, bulk download format, or none)' },
          usableVerdict: { type: 'string', description: 'yes | conditional | no — can this project legally import/cache & redistribute it?' },
          conditions: { type: 'string', description: 'If conditional: what is required (attribution text, non-commercial ok?, approval, rate limits)' },
          notes: { type: 'string' },
          citations: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'usableVerdict', 'licenseConfirmed'],
      },
    },
  },
  required: ['results'],
}

const SYNTH_SCHEMA = {
  type: 'object',
  properties: {
    markdownReport: { type: 'string', description: 'A structured markdown findings report suitable to drop into docs/.' },
    summary: { type: 'string', description: 'A concise narrative answer for the project owner.' },
  },
  required: ['markdownReport', 'summary'],
}

// ---------- Phase 1: Investigate ----------
phase('Investigate')
const SOURCES = [
  { key: 'mindat', focus: "Mindat.org — the largest mineral/locality database. Coverage of US localities, coordinate precision (note any deliberate obfuscation of sensitive localities), the Mindat API (key/approval needed?), and CRUCIALLY its data license / terms of use — is the locality data redistributable, is bulk/derivative use allowed, is it non-commercial-friendly or all-rights-reserved? This is the classic licensing trap; be precise and cite Mindat's own terms." },
  { key: 'usgs-mrds', focus: "USGS Mineral Resources Data System (MRDS) and the USGS Mineral Resources Online Spatial Data portal. Mines/prospects/occurrences with commodity (incl. gemstone/industrial-mineral) fields, geolocated, bulk-downloadable. Confirm PUBLIC DOMAIN status and download formats (shapefile/CSV/GeoJSON). Assess how well it captures knappable/carvable craft stone vs. metallic ore deposits." },
  { key: 'usgs-usmin-sgmc', focus: "USGS USMIN (mine features) and the USGS State Geologic Map Compilation (SGMC) / national geologic map databases. Public-domain spatial data. Assess usefulness for locating rock UNITS that host craft stone (e.g. chert-bearing limestones, rhyolite/obsidian flows) even when point localities are absent." },
  { key: 'macrostrat-rockd', focus: "Macrostrat (geologic map/column API, lithology by location) and its crowdsourced field app Rockd (outcrop 'checkins'). Licenses (Macrostrat is CC BY 4.0; confirm). Could Macrostrat answer 'what bedrock/lithology is under this point' to INFER chert/obsidian/soapstone presence, and does Rockd provide reusable point observations?" },
  { key: 'osm', focus: "OpenStreetMap as a source of quarry and rock-feature points/polygons: tags landuse=quarry, man_made=quarry, natural=bare_rock/rock/stone, geological=*. ODbL license terms (attribution + share-alike implications for a derived layer). Access via Overpass API / planet extracts. How much useful craft-stone signal is actually tagged?" },
  { key: 'state-surveys', focus: "State Geological Surveys and state rockhounding GIS: do states publish reusable, geolocated rockhounding/collecting-locality datasets (e.g. Oregon DOGAMI, Arizona AZGS, Texas, California CGS, Arkansas for novaculite)? Sample several states; report license variability and whether any are openly downloadable GeoJSON/shapefile." },
  { key: 'community-editorial', focus: "Community/editorial rockhounding sites that AGGREGATE localities: thediggings.com, Western Mining History, MyLandMatters, RockTumbler/rockhounding maps, The-Vug, Rockhounding-USA guides, and rockhounding guidebooks. For each: is there any API/reusable data, or is it web-only and all-rights-reserved / scrape-prohibited? Treat as 'link out, do not import' unless a real open license exists." },
  { key: 'blm-collecting-legality', focus: "BLM collecting-legality data (THE permission layer for stone). 43 CFR 8365 casual collecting rules; BLM rockhounding area designations; and GEODATA we could overlay: BLM Surface Management Agency, mining claims (MLRS / the former LR2000), and MINERAL WITHDRAWAL / segregation areas (where casual collecting is removed). Are these available as downloadable GIS layers, and what licenses?" },
  { key: 'usfs-nps-legality', focus: "USFS and NPS collecting-legality. USFS rock/mineral 'casual use' collecting policy and any spatial data; NPS general PROHIBITION on rock/mineral collecting (36 CFR). What authoritative, citable, ideally-geospatial sources establish where collecting is allowed vs banned on these lands? How does this complement the project's existing PAD-US + USFS-rules encoding?" },
  { key: 'state-legality', focus: "State-level collecting legality frameworks: state trust land, state parks, and state-specific rockhounding laws (e.g. casual collecting allowed/prohibited, daily limits). Is there any spatial dataset, or is this hand-encoded rule work like the project already does for parks? Identify the few states with notable rockhounding programs/areas." },
  { key: 'reference-dbs', focus: "Reference databases that are NOT locality sources but might be mistaken for them: RRUFF (mineral spectra), Smithsonian/GBIF specimen records, Mineralogical Society databases, OneGeology (international geologic maps). Briefly assess each and explain why it is or isn't a usable US craft-stone locality source." },
  { key: 'flagged-material-localities', focus: "For the specific craft stones the project already flagged — obsidian (e.g. Glass Buttes, OR on BLM), chert/flint, Arkansas novaculite, alabaster (gypsum), soapstone/steatite/serpentine — what authoritative source documents these named localities AND their collecting legality? Are there canonical, citable, openly-usable references (USGS, state surveys, BLM rockhounding pages) for the marquee sites?" },
  { key: 'archaeology-toolstone', focus: "Archaeological 'toolstone'/lithic-source datasets: obsidian-source geochemical sourcing databases, chert source provenance studies, and any academic geospatial datasets of knappable-stone sources. Note the strong ethics/legal caveat that ARCHAEOLOGICAL SITES are protected (ARPA) and must NOT be surfaced as collecting spots — distinguish raw geologic sources from artifact sites." },
]

const investigated = (await parallel(SOURCES.map(s => () => agent(
  `${SITE}\n\n${WEBTOOLS}\n\nInvestigate this source/topic for a possible Craft Almanac stone & mineral layer (contiguous US):\n\nSOURCE: ${s.focus}\n\nReturn one or more source entries with the full fields (name, category, covers, geolocation, access, license, attribution, permissionSignal, fit, caveats, urls). Be precise and skeptical about LICENSE — it is the gate for whether we can use the data at all. Cite the source's own terms pages.`,
  { label: `src:${s.key}`, phase: 'Investigate', schema: SOURCE_SCHEMA }
)))).filter(Boolean)

const allSources = investigated.flatMap(r => r.sources || [])
log(`Investigated ${SOURCES.length} topics -> ${allSources.length} source entries.`)

// ---------- Phase 2: Verify (license + access for the promising ones) ----------
phase('Verify')
// Verify the data-supplying candidates (locality/bedrock/community), not the legal-framework writeups.
const dataCandidates = allSources.filter(s => /locality|bedrock|community/i.test(s.category || '') && /strong|moderate|conditional|weak/i.test(s.fit || 'weak'))
const BATCH = 4
const vbatches = []
for (let i = 0; i < dataCandidates.length; i += BATCH) vbatches.push(dataCandidates.slice(i, i + BATCH))
log(`Verifying license+access for ${dataCandidates.length} data candidates in ${vbatches.length} batches.`)

const verifiedNested = (await parallel(vbatches.map((batch, bi) => () => agent(
  `${SITE}\n\n${WEBTOOLS}\n\nADVERSARIALLY verify whether THIS PROJECT can legally import/cache/redistribute each data source below. License is the gate. For EACH: pull up the source's OWN current license / terms-of-use / API-docs page and confirm (a) the exact license, (b) whether redistribution/derivative/caching is allowed, (c) whether non-commercial use is fine, (d) any required attribution text, (e) the real access path (API endpoint + key/approval, or bulk download format). Give usableVerdict yes/conditional/no with conditions. Be skeptical — assume all-rights-reserved unless the terms clearly grant reuse. Cite URLs.\n\nSOURCES (JSON): ${JSON.stringify(batch)}`,
  { label: `verify:batch-${bi + 1}`, phase: 'Verify', schema: VERIFY_BATCH_SCHEMA, effort: 'high' }
).then(r => (r && Array.isArray(r.results)) ? r.results : [])))).filter(Boolean)
const verified = verifiedNested.flat()
log(`Verified ${verified.length} data sources.`)

// ---------- Phase 3: Synthesize ----------
phase('Synthesize')
const synthesis = await agent(
  `${SITE}\n\nSynthesize the research into a deliverable for the project owner, who asked: "are there existing sites or data repositories where we can get the stone/mineral data points? — though the permissions around that might be difficult to pin down."\n\nWrite (1) markdownReport — a structured findings doc with: a ranked table of usable LOCALITY data sources (name | covers | access | license | fit), a short "bedrock-inference" note (Macrostrat/SGMC for 'what stone is under here'), a "do not import — link only" list (all-rights-reserved community sites), a clear PERMISSION-LAYER section (the BLM casual-collecting framework + claims/withdrawals + USFS/NPS/state, and how it overlays on localities — the hard part), the ARPA/archaeological-site ethics caveat, and a concrete "what to add to ATTRIBUTION.md" line per recommended source. (2) summary — a tight narrative: is this a promising angle, what the single best stack is (locality data + permission overlay), the Mindat licensing verdict specifically, and the biggest caveats (license, occurrence≠permission, coordinate obfuscation of sensitive sites, archaeological-site protection).\n\nALL SOURCES (JSON): ${JSON.stringify(allSources)}\n\nLICENSE/ACCESS VERIFICATION (JSON): ${JSON.stringify(verified)}`,
  { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA, effort: 'high' }
)

return { counts: { topics: SOURCES.length, sources: allSources.length, verified: verified.length }, markdownReport: synthesis.markdownReport, summary: synthesis.summary }
