# FLASH 10 — A4 Scan Compositing V2

> **DEPRECATED / SUPERSEDED**
>
> Do not implement this document directly.
>
> The current authoritative scanner compositing instruction is:
>
> **`INSTRUCTIONS_A4_GUIDE_CLEANUP_V3.md`**
>
> V3 replaces the old assumption that `allowed-region-mask.svg` can also act as the final opaque white silhouette.

## Why V2 is deprecated

The previous compositing model solved two problems:

- keeping untouched character areas white instead of transparent;
- preserving guest strokes that extend outside the printed guide.

However, using the full `allowed-region-mask.svg` as the opaque white base introduced a new failure mode: an unwanted white outer rim/halo can remain around the user's painted contour even after the dashed guide has been removed.

The current implementation must therefore use a layered model:

```text
FINAL SPRITE
=
BASE CHARACTER BODY LAYER
+
USER PAINT LAYER
```

The base body uses a distinct `body-fill-mask`, while the user paint layer is derived from the difference between the normalized scan and the canonical blank template.

For all current implementation work, read and follow:

```text
INSTRUCTIONS_A4_GUIDE_CLEANUP_V3.md
```

That file has priority over this one for A4 output/compositing behavior.
