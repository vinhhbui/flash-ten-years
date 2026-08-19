# Codegrid SVG Scroll Reference Notes

## Reference source

- Tutorial: `https://www.youtube.com/watch?v=PAf8gN7p2eg`
- Title: *Watch GSAP Effortlessly Draw This SVG Path on Scroll Without Breaking a Sweat*
- Author: Codegrid
- Stated visual inspiration: MindMarket
- Tutorial duration: approximately 11 minutes

## Observations

Approximate reference viewport: 1280 × 720, based on the published tutorial thumbnail.

Approximate section count: five main visual beats plus an ending call to action.

Approximate total page height: 550–650vh on desktop.

Background color: warm off-white / cream, approximately `#f7f3e8`.

Primary text color: nearly black, approximately `#1b1b1b`.

Accent colors: vivid green, coral orange, soft lavender, yellow and sky blue.

SVG stroke color: black.

SVG stroke width: approximately 2–3px at desktop scale.

SVG linecap: round.

SVG linejoin: round.

Primary font style: clean geometric sans serif with large, heavy display headings.

Heading scale: approximately 68–110px on desktop; bold, compact line-height.

Body scale: approximately 16–20px with concise paragraphs.

## Layout and route observations

Section 1: Editorial hero with a simple navigation row, oversized headline on the left and a large green visual field / illustration on the right.

Section 2: A large visual composition continues the green field. The scroll stroke curves around the hero artwork and passes between headline and card content.

Section 3: Split editorial block with an illustration and a rounded white text panel. The route bends widely across the composition.

Section 4: Alternating text and image composition. The route changes direction several times rather than running as a straight vertical divider.

Section 5: A final editorial composition with generous whitespace; the route moves toward the lower page.

Section 6: Small centered closing call to action.

The path is a single thin black hand-drawn-like route. The tutorial thumbnail does not show a permanent faint track, so the reference prototype does not add one.

SVG begins drawing when: the first screen begins to scroll away from the top.

SVG finishes drawing when: the last content section reaches the end of the page.

Positioning decision: the path behaves as one absolute SVG layer aligned to the full document, rather than a fixed viewport decoration. This lets the curve travel through the section layouts.

## Secondary animations

- Headings and content blocks enter with short opacity / vertical offset motion.
- The SVG stroke remains the main interaction.
- No autoplay replaces the scroll-linked stroke.

## Known approximation boundaries

The downloadable reference made the thumbnail and metadata available, but not a frame-by-frame playback surface in this workspace. Section proportions, the original illustrations and exact copy are therefore recreated as original, close-proportion visual placeholders. The path, green editorial panels, warm palette, typography hierarchy and scroll behavior are the matching priorities for this first isolated prototype.

## Runtime dependency

The prototype keeps local copies of the already-installed GSAP and ScrollTrigger browser builds in `assets/vendor/`. It can therefore be served from this folder by any static server without a CDN dependency.

## Run locally

From the repository root, serve only this isolated prototype with:

```powershell
npx vite --host 0.0.0.0 --root prototypes/codegrid-svg-scroll
```

Open the local URL printed by Vite. This does not start or modify the FLASH 10 client/server application.
