# Permission Inferences For Review

## NYC local park PAD-US labels

The verified NYC Parks rule prohibits removing plants, flowers, or other vegetation from New York City parks without permission. PAD-US containment for many Manhattan and nearby NYC park records does not include the phrases "New York City" or "City of New York"; it often uses generic labels such as `City Land | Local Government | Local Park`.

For permission-filtered aggregate computation, Codex added a narrow inference in `app.js`:

- the record must be inside a broad NYC geographic bounding area,
- the Census-derived state code must be `NY`,
- the containing PAD-US unit text must include `city land`,
- the containing PAD-US unit text must include `local government`,
- and the designation must read as local park/recreation land.

Those records are classified under the existing NYC Parks rule 1-04 source, not as a new rule. This should be reviewed by the permissions-research agent against PAD-US vocabulary and NYC park boundaries.

The filtered-aggregate build validation now checks Manhattan records contained by these NYC local-park PAD-US units, rather than all Falling Fruit records in a broad Manhattan bounding box. The broader box includes many private, sidewalk, garden, and unsourced records where a `prohibited` label would not be justified by the NYC Parks rule. The gate retains the TODO's "majority prohibited" standard because the app's overlapping-land resolver may select a more specific non-NYC rule for an occasional record.
