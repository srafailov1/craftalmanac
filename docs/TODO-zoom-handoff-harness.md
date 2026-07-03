# Work order — headless regression harness for the zoom-handoff state machine

Phase 4.8 of `docs/critique-remediation-plan.md`. The aggregate↔points handoff
is the codebase's proven weak point — five successive fixes (f42dfff, f35c6cb,
5684f68, 87a094c, 151b6d5; see KNOWN_ISSUES item 1) and its only verification
standard today is the owner manually wheel/pinch-zooming over Charlottesville
and NYC.

## Approach (KNOWN_ISSUES item 1a step 4 already sketches this)

Test the state machine directly, not the rendering:

1. vm-load (or extract) the transition functions from app.js:
   `shouldShowPointLayers`, `updateLayerHandoff`, the aggregate bridge trio
   (`startAggregateBridge`/`cancelAggregateBridge`/`settleAggregateBridgeAfterPaint`),
   and the zoom handler's `pointDataReady` clearing logic — with a stub `map`
   (getZoom/setLayoutProperty/once) and stub `state`.
2. Feed scripted sequences: zoom-in crossing (aggregate → gate → points),
   zoom-out crossing (points → bridge → aggregate paint → settle), pan at
   point zoom, rapid wheel reversals mid-bridge, load-completion racing the
   bridge timer.
3. Assert the invariant from KNOWN_ISSUES: at no step is every layer hidden
   while data for the viewport exists ("no state where the visible layer's
   data covers less than the viewport"), and the bridge always terminates
   (timer or settle).
4. Wire as `scripts/test_zoom_handoff.mjs` into check.sh.

## Boundaries

- No changes to the handoff logic itself in this work order — if the harness
  finds a real bug, log it to KNOWN_ISSUES for the 5am loop instead of fixing
  inline (separate change, separate review).
- Stubs must not depend on mapbox-gl; keep the harness node-only and fast.
