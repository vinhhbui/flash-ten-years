# FLASH 10 Countdown Site Guide

This document maps the implementation currently previewed at `http://localhost:3000/`. It is a working guide for editing the countdown and the scroll-driven FLASHBACK landing experience without confusing it with the parent repository's Live Wall application.

## Which project is the preview?

The preview runs from the nested project:

```text
flash-ten-years/countdown-site/
```

The parent repository also contains `client/`, `server/`, scanner tooling, and the Live Wall described in `README.md`. Those are separate from the countdown preview.

`countdown-site` has its own `.git` metadata. When changing or publishing it, always inspect both the parent repository and nested repository status before deciding what to commit.

## Active page flow

```text
app/page.tsx
  -> CountdownPage
      -> countdown film reels
      -> LandingPage (mounted but inactive before zero)
          -> RectangleScrollTest
      -> DynamicHeader
      -> calendar download link
```

The target time is defined in `src/countdown-page/countdown.ts`:

```text
2026-08-30 10:00:00 GMT+07:00
```

Before the target, the countdown is active and the landing page is inert. At zero, `CountdownPage.tsx` activates the landing page and expands the header.

For local transition testing before zero:

- Hold left Shift and press `0` to jump to about 70 seconds remaining.
- Hold left Shift with `1`, `2`, or `3` to advance by one day, hour, or minute.
- Hold right Shift with `1`, `2`, or `3` to move backward by the same unit.

## Source-of-truth files

| Concern | Source of truth |
| --- | --- |
| Approved Vietnamese headings, descriptions, briefs, and hashtags | `FLASH 10 _ Content Website.md` |
| Runtime generation content | `countdown-site/src/rectangle-test/contentSequence.ts` |
| Countdown target and time-unit calculations | `countdown-site/src/countdown-page/countdown.ts` |
| Countdown state, film-reel exit, debug keys, and landing activation | `countdown-site/src/countdown-page/CountdownPage.tsx` |
| Countdown visual styling | `countdown-site/src/countdown-page/countdown-page.css` |
| Landing wrapper and activation boundary | `countdown-site/src/landing-page/LandingPage.tsx` |
| Landing typography, content layout, video layout, and responsive composition | `countdown-site/src/landing-page/landing-page.css` |
| Scroll physics, section state, video selection, film geometry, and hash navigation | `countdown-site/src/rectangle-test/RectangleScrollTest.tsx` |
| Full hero title artwork | `countdown-site/public/Title.svg` |
| Film columns, perspective, tracks, marquee, and frame geometry | `countdown-site/src/rectangle-test/rectangle-scroll-test.css` |
| Expandable generation navigation | `countdown-site/src/components/DynamicHeader.tsx` and `DynamicHeader.css` |
| Dynamic-header logo artwork | `countdown-site/public/Logo10.svg` |
| Shared film-frame component | `countdown-site/src/components/FilmFrame.tsx` and `FilmFrame.css` |
| Metadata, social image, icons, and viewport policy | `countdown-site/app/layout.tsx` |

Files with names such as `LandingPage 2.tsx`, `landing-page 2.css`, `layout 2.tsx`, and `og 2.png` are not imported by the active page. Do not edit them when changing the live preview unless they are deliberately restored into the active import path.

## Content sequence

`contentSequence.ts` defines:

- 10 main generation entries.
- No intermediate sub-content steps.
- 11 virtual sections total: 1 hero plus 10 generation sections.
- Main generation sections at `2, 3, 4, 5, 6, 7, 8, 9, 10, 11`.

Only the current content item is rendered. The dynamic header links directly to each generation's main section using `#flashback-section-N`.

On desktop, the generation links live in a horizontally scrollable, snap-aligned slider. `DynamicHeader.tsx` owns the previous/next button behavior through a navigation ref; `DynamicHeader.css` owns slide width, enlarged number styling, overflow, and snap points.

## Main media mapping

Each main generation renders a looping, muted WebM with its PNG as the poster/fallback image.

| Generation | Title | Main section | Video | Poster |
| --- | --- | ---: | --- | --- |
| Gen 1 | TẠO NÉT | 2 | `1_New.webm` | None |
| Gen 2 | NỐI NÉT | 3 | `2_Cake.webm` | None |
| Gen 3 | LẤY NÉT | 4 | `3_Tet.webm` | None |
| Gen 4 | NÉT CĂNG | 5 | `4_Birthday.webm` | None |
| Gen 5 | NÉT ĐỨT | 6 | `5_Online.webm` | None |
| Gen 6 | NÉT CẬN | 7 | `6_Horse.webm` | None |
| Gen 7 | BẬT NÉT | 8 | `7_Gang.webm` | None |
| Gen 8 | GIỮ NÉT | 9 | `8_Grad.webm` | None |
| Gen 9 | BẺ NÉT | 10 | `9_Subway.webm` | None |
| Gen 10 | CHUNG MỘT NÉT | 11 | `10_Shoot.webm` | None |

The arrays that enforce this order live in `RectangleScrollTest.tsx`. If media order changes, update the arrays and this table together.

## Scroll and motion model

The landing experience does not use normal document scroll for its first 11 virtual sections. `RectangleScrollTest.tsx` captures wheel, touch, and arrow-key input, applies momentum to an internal position, and converts that position into CSS custom properties.

Important generated properties include:

- `--rectangle-track-y`: continuous film-track movement.
- `--rectangle-plane-width`: width of the vertical film plane.
- `--rectangle-b-width`, `--rectangle-b-angle`, `--rectangle-b-depth-scale`: perspective-film geometry.
- `--rectangle-content-strip-y`: shared content travel across a section.
- `--rectangle-content-entry-y`: entrance from below the viewport.
- `--rectangle-content-entry-skew`: entrance skew settling to zero.
- `--rectangle-content-perspective-scale`: approach and exit scale.
- `--rectangle-content-opacity`: content exit fade.
- `--rectangle-marquee-y`: vertical movement of the hashtag background.

`landing-page.css` consumes the content-related properties. `rectangle-scroll-test.css` consumes the film and perspective properties. Geometry changes often require coordinated edits in both TypeScript and CSS.

Current responsive geometry:

| Viewport | Vertical plane | Perspective height ratio | Perspective start width |
| --- | ---: | ---: | ---: |
| Desktop | `0.20 × viewport width` | `0.80 × viewport height` | `0.92 × viewport width` |
| Up to 768 px | `0.44 × viewport width` | `0.64 × viewport height` | `0.88 × viewport width` |

After the final virtual section, scrolling is handed back to the native `.landing-page` scroller so the blank ending section can be reached.

## Assets

```text
countdown-site/public/
  content-images/   PNG posters for the ten main sections
  content-videos/   WebM loops for the ten main sections
  film-images/      images repeated inside the two film tracks
  font/             HTPietMono family
  Logo10.svg        active dynamic-header logo
  Title.svg         active full hero title artwork
  logo-flash.svg    previous header logo; retained but inactive
  og.png            active social preview image
  favicon.svg
  apple-touch-icon.png
  sinh-nhat-flash-2026.ics
```

## Local preview and checks

Run from `countdown-site`:

```bash
npm run dev
```

Open:

- `/` for the countdown-to-landing experience.
- `/rectangle-test` for the standalone film perspective test.

Before handing off an edit:

```bash
git diff --check
npm run build
npx eslint src/countdown-page/CountdownPage.tsx src/components/DynamicHeader.tsx src/rectangle-test/RectangleScrollTest.tsx
```

For visual changes, also verify the rendered page at desktop and mobile widths, exercise multiple virtual sections, confirm videos advance rather than only load, and check browser console errors.

## Editing boundaries

- Keep the approved content brief separate from layout or motion experiments.
- Update `contentSequence.ts` when approved copy changes; do not hard-code generation copy into multiple components.
- Keep main media selection in `RectangleScrollTest.tsx` and responsive media composition in `landing-page.css`.
- Keep JavaScript geometry and CSS perspective values synchronized.
- Preserve the direct Hero → Gen 1 → … → Gen 10 sequence unless the sequence itself is intentionally redesigned.
- A local preview or commit does not imply permission to push or deploy.
