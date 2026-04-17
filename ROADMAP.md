# V2 Roadmap

## Purpose

This document defines the `repo-receipt` v2 direction on the `dev` branch. The goal is to make the product more memorable, more replayable, and more shareable without losing the serious print-first identity that makes the app distinctive.

The rule for v2 is simple:

- keep the receipt premise premium
- make the output more collectible
- make the interaction more theatrical
- increase the number of things people want to share

## Product Direction

V1 proves the core loop:

1. paste a public repo
2. get a receipt
3. download or share it

V2 expands that loop into a broader receipt studio:

- multiple receipt styles
- multiple output formats
- repo-to-repo comparisons
- generated commentary and milestones
- richer presentation and loading states

The product should feel less like a single-page utility and more like a small publishing tool for repository bragging rights.

## Design Principles

- The joke must stay serious. The app works because the design treats the receipt format as real editorial output.
- Fun should come from contrast, not clutter.
- Every new feature must strengthen the share loop.
- The HTML receipt and PNG receipt must remain visually aligned.
- New modes should be distinct enough to feel collectible, not just recolors.

## V2 Pillars

### 1. Receipt Modes

Add themeable, selectable rendering modes while preserving a shared receipt data model.

Planned modes:

- `Fine Print`: current premium baseline
- `Thermal`: lighter contrast, receipt-printer realism, stronger line rhythm
- `Archive`: document catalog feel, quieter hierarchy, institutional typography
- `Ledger Noir`: darker accounting document aesthetic, sharp contrast, more dramatic totals

Requirements:

- mode selection on landing and receipt pages
- mode reflected in DOM receipt and PNG output
- mode encoded into sharable URLs
- mode-safe token system for light and dark variants

### 2. Share Formats

Expand the output beyond the tall receipt.

Planned formats:

- portrait receipt: current baseline
- square social card
- story / vertical share card
- README strip / banner format
- framed poster view for on-page display

Requirements:

- shared receipt model adapted into multiple render templates
- selectable format in the action panel
- share URLs preserve format and mode
- PNG generator supports multiple aspect ratios cleanly

### 3. Compare Two Repos

Introduce “split bill” comparisons.

Core concept:

- two repositories appear on a shared check
- totals and deltas are emphasized
- strengths are framed like line items on a bill

Comparison data:

- stars
- forks
- watchers
- open issues
- total commits
- contributors
- age
- language mix

Requirements:

- input supports one or two repos
- compare route
- compare PNG output
- side-by-side and subtotal/delta visual patterns

### 4. Milestones and Generated Notes

Make receipts feel authored, not just assembled.

Planned generated elements:

- milestone badges:
  - first 100 stars
  - 1k stars
  - 10k stars
  - decade-old repo
  - first release anniversary style moments
- commentary lines:
  - “Most expensive line item”
  - “House specialty”
  - “Open tab”
- tonal footer notes:
  - praise
  - dry roast
  - neutral archival note
- repo fortune line

Requirements:

- deterministic generation from repo stats
- tone system with strict copy rules
- no low-quality random AI output
- every line must remain short, quotable, and screenshot-friendly

### 5. Better Loading Theater

Turn generation into a stronger ritual.

Planned effects:

- receipt drop-in from top of viewport
- progressive print reveal
- subtle printer jitter
- perforation tear transition
- stamp / approval moment on completion
- optional sound toggle later

Requirements:

- CSS-first where possible
- no heavy animation libraries
- motion must remain smooth on mobile
- reduced-motion mode respected

### 6. Paper Personality

Introduce controlled variance so receipts feel more tactile.

Planned touches:

- slight alignment variation
- occasional fold lines
- stamp overlays
- docket / order numbers
- paper curl framing
- desk / clipboard / scanner presentation shells on the web page

Requirements:

- DOM and PNG parity where practical
- variance must be deterministic for a given render seed
- never reduce readability

### 7. Viral Surfaces

Increase the number of places where the product can travel well.

Planned surfaces:

- receipt vanity URLs
- square-first social exports
- story-sized exports
- easy one-click “share image”
- compare receipts as social bait
- gallery collections by theme or milestone

Requirements:

- good Open Graph output per format
- direct image URLs for embeds
- clean filenames for downloads
- minimal friction between generation and sharing

## V2 Workstreams

## Workstream A: Design System Expansion

Deliverables:

- mode token matrix
- format token matrix
- typography rules per mode
- motion spec
- environmental shells for on-page display

Dependencies:

- current Fine Print tokens
- receipt layout invariants

## Workstream B: Receipt Data Enrichment

Deliverables:

- milestone derivation utility
- commentary generator utility
- compare receipt model
- deterministic render seed utility

Dependencies:

- existing GitHub data layer
- current `RepoData` model

## Workstream C: Renderer Architecture

Deliverables:

- multi-template DOM receipt renderer
- multi-template Satori renderer
- format-aware image generation
- compare receipt renderer

Dependencies:

- token resolver
- receipt model

## Workstream D: App UX

Deliverables:

- mode selector
- format selector
- compare input flow
- upgraded action panel
- richer loading state

Dependencies:

- renderer architecture
- design system expansion

## Workstream E: Share and Growth

Deliverables:

- better share text templates
- per-format OG metadata
- milestone gallery concepts
- vanity URL plan

Dependencies:

- share formats
- commentary system

## Release Sequence

## Phase 1: Fast Win V2

Goal:

- ship the highest-viral, lowest-risk upgrades first

Scope:

- receipt modes
- better loading animation
- generated footer notes / fortune lines
- improved action panel for formats

Success signal:

- users generate multiple variants for the same repo

## Phase 2: Share Expansion

Goal:

- make the product travel better across social and README contexts

Scope:

- square card
- story card
- README strip
- framed display mode
- OG per format

Success signal:

- higher share conversion per generation

## Phase 3: Compare and Collections

Goal:

- deepen replayability

Scope:

- split bill comparisons
- milestone badges
- decorated galleries
- themed collections

Success signal:

- users compare their repo against well-known repos

## Technical Tasks

- refactor receipt rendering into mode- and format-aware templates
- isolate reusable typography, divider, and footer primitives
- add compare route and compare transform layer
- add deterministic seed support for decorative variance
- expand metadata generation to include mode + format
- update caching keys to include mode, format, and compare variants
- extend signed image routes for new output variants

## Constraints

- no UI libraries
- no icon libraries
- no mode should feel like a random skin
- Satori-safe properties only inside PNG templates
- PNG output remains the source of truth for shared artifacts
- readability must stay intact in every mode and format

## Open Questions

- whether mode should be user-selected or auto-suggested per repo
- whether commentary should be fully deterministic or partially templated by tone
- whether compare receipts should be separate routes or query-driven variants
- whether gallery v2 should show most-shared, most-starred, or themed collections first

## Exit Criteria For V2

- at least 4 distinct receipt modes shipped
- at least 3 export formats shipped
- compare mode shipped
- commentary / milestone system shipped
- loading experience upgraded
- all new outputs shareable and Open Graph-safe
- DOM and PNG parity maintained across all supported modes
