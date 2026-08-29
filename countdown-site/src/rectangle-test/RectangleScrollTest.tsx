"use client";

import { memo, useEffect, useRef, useState } from "react";
import FilmFrame from "../components/FilmFrame";
import type { FilmFrameSize } from "../components/FilmFrame";
import {
  FLASHBACK_CONTENT,
  FLASHBACK_HERO_CAPTION,
  FLASHBACK_HERO_SUBTITLE,
  FLASHBACK_HERO_TITLE,
  getFlashbackGeneration,
} from "../content/flashbackContent";
import {
  FLASHBACK_SECTION_COUNT,
  getContentSequencePosition,
} from "./contentSequence";
import "./rectangle-scroll-test.css";

// Three four-color cycles cover both 50vh crops at every wrapped position.
const FILM_FRAMES = Array.from({ length: 12 }, (_, index) => index);
const FILM_IMAGES = [
  "/film-images/flash-memory-01.jpg",
  "/film-images/flash-memory-02.jpg",
  "/film-images/flash-memory-03.jpg",
  "/film-images/flash-memory-04.jpg",
  "/film-images/flash-memory-05.png",
] as const;

function createStableRandomImageSequence(length: number, seed: number) {
  let state = seed >>> 0;
  const sequence: number[] = [];

  while (sequence.length < length) {
    const cycle = FILM_IMAGES.map((_, imageIndex) => imageIndex);
    for (let index = cycle.length - 1; index > 0; index -= 1) {
      state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
      const swapIndex = state % (index + 1);
      [cycle[index], cycle[swapIndex]] = [cycle[swapIndex], cycle[index]];
    }

    if (sequence[sequence.length - 1] === cycle[0]) {
      [cycle[0], cycle[1]] = [cycle[1], cycle[0]];
    }
    sequence.push(...cycle);
  }

  return sequence.slice(0, length);
}

const FILM_IMAGE_SEQUENCE = createStableRandomImageSequence(FILM_FRAMES.length, 0x10f1a5);
const A_MIN_SCALE = 0.55;
const B_PERSPECTIVE_VH = 0.8;
const B_HEIGHT_VH = 0.5;
const B_START_WIDTH_RATIO = 0.92;
const LANDING_SECTION_COUNT = FLASHBACK_SECTION_COUNT;
const LAST_CONTENT_SECTION = FLASHBACK_SECTION_COUNT;
const MARQUEE_TAG_INDEXES = [0, 1, 2, 3] as const;
// At a content anchor the two panels are offset by half a viewport, so the
// outer panel rows are the pair that would sit directly around screen center.
const MARQUEE_ROWS = [1, 2, 3, 4, 5, 6] as const;
const CONTENT_IMAGES = Array.from(
  { length: FLASHBACK_CONTENT.length },
  (_, index) => `/content-images/content-${String(index + 1).padStart(2, "0")}.png`,
);

function getMarqueeTag(contentNumber: number, tagIndex: number) {
  return getFlashbackGeneration(contentNumber)?.hashtags[tagIndex] ?? "#FLASH";
}

const BackgroundMarqueeWord = memo(function BackgroundMarqueeWord({
  contentNumber,
  tagIndex,
}: {
  contentNumber: number;
  tagIndex: number;
}) {
  const previousNumberRef = useRef(contentNumber);
  const [outgoingNumber, setOutgoingNumber] = useState<number | null>(null);

  useEffect(() => {
    const previousNumber = previousNumberRef.current;
    if (previousNumber === contentNumber) return;

    previousNumberRef.current = contentNumber;
    setOutgoingNumber(previousNumber);
    const timeoutId = window.setTimeout(() => setOutgoingNumber(null), 560);

    return () => window.clearTimeout(timeoutId);
  }, [contentNumber]);

  return (
    <span className="rectangle-test__background-marquee-word">
      {outgoingNumber === null ? null : (
        <span
          className="rectangle-test__background-marquee-word-copy"
          data-state="outgoing"
        >
          {getMarqueeTag(outgoingNumber, tagIndex)}
        </span>
      )}
      <span
        className="rectangle-test__background-marquee-word-copy"
        data-state={outgoingNumber === null ? "current" : "incoming"}
      >
        {getMarqueeTag(contentNumber, tagIndex)}
      </span>
    </span>
  );
});

function getSectionFromHash(hash: string) {
  const match = /^#flashback-section-(\d+)$/.exec(hash);
  if (!match) return null;

  const section = Number(match[1]);
  return section >= 1 && section <= LANDING_SECTION_COUNT ? section : null;
}

const FilmFrameTrack = memo(function FilmFrameTrack({
  sharedSize,
}: {
  sharedSize: FilmFrameSize | null;
}) {
  return (
    <div className="rectangle-test__track">
      {FILM_FRAMES.map((frame) => (
        <FilmFrame
          className="rectangle-test__film-frame"
          key={frame}
          orientation="vertical"
          thickness={30}
          perforationSize={12}
          perforationGap={9}
          perforationCount={6}
          radius={0}
          sharedSize={sharedSize}
        >
          <img
            alt=""
            className="rectangle-test__film-image"
            decoding="async"
            draggable={false}
            loading="lazy"
            src={FILM_IMAGES[FILM_IMAGE_SEQUENCE[frame]]}
          />
        </FilmFrame>
      ))}
    </div>
  );
});

const BackgroundMarqueePanel = memo(function BackgroundMarqueePanel({
  contentNumber,
  isHidden = false,
}: {
  contentNumber: number;
  isHidden?: boolean;
}) {
  return (
    <div
      className="rectangle-test__background-marquee-panel"
      data-hidden={isHidden ? "true" : undefined}
    >
      {MARQUEE_ROWS.map((row) => (
        <div
          className="rectangle-test__background-marquee-track"
          data-direction={row % 2 === 0 ? "forward" : "reverse"}
          key={row}
          style={{ gridRow: row + 1 }}
        >
          {[0, 1].map((group) => (
            <div className="rectangle-test__background-marquee-group" key={group}>
              {MARQUEE_TAG_INDEXES.map((tagIndex) => (
                <BackgroundMarqueeWord
                  contentNumber={contentNumber}
                  key={tagIndex}
                  tagIndex={tagIndex}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});

function BackgroundMarquee({ currentSection }: { currentSection: number }) {
  const sequencePosition = getContentSequencePosition(currentSection);
  const currentContentNumber = sequencePosition?.contentNumber ?? 1;

  return (
    <div className="rectangle-test__background-marquee" aria-hidden="true">
      <div className="rectangle-test__background-marquee-stack">
        <BackgroundMarqueePanel
          contentNumber={currentContentNumber}
          isHidden={currentSection === 1}
          key="current-content-marquee"
        />
        <BackgroundMarqueePanel
          contentNumber={currentContentNumber}
          key="current-content-marquee-repeat"
        />
      </div>
    </div>
  );
}

function SectionContent({
  contentNumber,
  subContentIndex,
}: {
  contentNumber: number;
  subContentIndex: number;
}) {
  const content = getFlashbackGeneration(contentNumber);
  if (!content) return null;

  if (subContentIndex > 0) {
    return (
      <section
        className="rectangle-test__section-content"
        aria-label={`Gen ${content.generation}: ${content.title}, ảnh phụ ${subContentIndex}`}
        data-layout="subcontent"
      >
        <div
          className="rectangle-test__subcontent-placeholder"
          role="img"
          aria-label={`Ảnh phụ ${subContentIndex} của Gen ${content.generation}: ${content.title}`}
        >
          <span>{`Image ${contentNumber}.${subContentIndex}`}</span>
        </div>
      </section>
    );
  }

  const isBookendContent = contentNumber === 1 || contentNumber === 10;

  return (
    <section
      className="rectangle-test__section-content"
      aria-labelledby={`flashback-content-title-${contentNumber}`}
      data-layout={isBookendContent ? "bookend" : "split"}
      data-imperfection={contentNumber === 1 ? "first" : contentNumber === 10 ? "last" : undefined}
      data-image-side={isBookendContent ? undefined : contentNumber % 2 === 0 ? "left" : "right"}
    >
      <img
        alt={`Minh họa Gen ${content.generation}: ${content.title}`}
        className="rectangle-test__section-image"
        decoding="async"
        draggable={false}
        loading="lazy"
        src={CONTENT_IMAGES[contentNumber - 1]}
      />
      <div className="rectangle-test__section-copy">
        <h2 id={`flashback-content-title-${contentNumber}`}>
          {`Gen ${content.generation}: ${content.title}`}
        </h2>
        <div className="rectangle-test__section-body">
          <p>{content.hashtags.join(" ")}</p>
          <p>{content.description}</p>
          {content.brief ? <p>{content.brief}</p> : null}
        </div>
      </div>
    </section>
  );
}

type RectangleScrollTestProps = {
  embedded?: boolean;
  isActive?: boolean;
};

export default function RectangleScrollTest({
  embedded = false,
  isActive = true,
}: RectangleScrollTestProps = {}) {
  const pageRef = useRef<HTMLElement>(null);
  const [sharedFrameSize, setSharedFrameSize] = useState<FilmFrameSize | null>(null);
  const [currentSection, setCurrentSection] = useState(1);
  const currentContentPosition = getContentSequencePosition(currentSection);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrameId = 0;
    let navigationFrameId = 0;
    let previousFrameTime = 0;
    let previousTouchY: number | null = null;
    let position = 0;
    let velocity = 0;
    let renderedSection = 1;
    let viewportWidth = 0;
    let viewportHeight = 0;
    let framePitch = 0;
    let maximumPosition = 0;

    const updateViewportMetrics = () => {
      viewportWidth = document.documentElement.clientWidth;
      viewportHeight = document.documentElement.clientHeight;
      framePitch = viewportHeight * 0.2;
      maximumPosition = viewportHeight * LANDING_SECTION_COUNT;
      page.style.setProperty("--rectangle-viewport-height", `${viewportHeight}px`);
    };
    const clampPosition = (nextPosition: number) => (
      Math.max(0, Math.min(maximumPosition, nextPosition))
    );

    const updateSharedFrameSize = () => {
      const nextSize = {
        width: Math.round(viewportWidth * 0.2),
        height: Math.round(viewportHeight * 0.2),
      };
      setSharedFrameSize((currentSize) => (
        currentSize?.width === nextSize.width && currentSize.height === nextSize.height
          ? currentSize
          : nextSize
      ));
    };

    const render = () => {
      position = clampPosition(position);
      const cycleLength = framePitch * 4;
      const rawPosition = position % cycleLength;
      const wrappedPosition = rawPosition < 0.01 || cycleLength - rawPosition < 0.01
        ? 0
        : rawPosition;

      const progress = Math.max(0, Math.min(1, position / viewportHeight));
      const sectionPosition = position / viewportHeight;
      const nextSection = Math.min(
        LANDING_SECTION_COUNT,
        Math.floor(sectionPosition + 0.0001) + 1,
      );
      const currentSectionProgress = Math.max(
        0,
        Math.min(1, sectionPosition - (nextSection - 1)),
      );
      const contentFadeOutProgress = Math.max(
        0,
        Math.min(1, (currentSectionProgress - 0.5) / 0.2),
      );
      const contentExitOpacity = 1 - contentFadeOutProgress;
      const contentBelowEntry = Math.max(
        0,
        1 - currentSectionProgress / 0.28,
      );
      const contentPerspectiveScale = currentSectionProgress <= 0.5
        ? 1.6 - currentSectionProgress * 1.2
        : 1 - contentFadeOutProgress * 0.75;
      const lastSectionProgress = Math.max(
        0,
        Math.min(1, sectionPosition - (LAST_CONTENT_SECTION - 1)),
      );
      const easedLastSectionProgress = lastSectionProgress * lastSectionProgress
        * (3 - 2 * lastSectionProgress);
      const easedProgress = progress * progress * (3 - 2 * progress);
      const aScale = 1 - (1 - A_MIN_SCALE) * easedProgress;
      const aWidth = viewportWidth * 0.2 * aScale;
      const bBottomWidthRatio = B_START_WIDTH_RATIO
        + (1 - B_START_WIDTH_RATIO) * easedLastSectionProgress;
      const bBottomWidth = viewportWidth * bBottomWidthRatio;
      const bTopToBottomRatio = aWidth / bBottomWidth;
      const bAngleRadians = Math.atan(
        B_PERSPECTIVE_VH * (1 - bTopToBottomRatio) / B_HEIGHT_VH,
      );
      const bAngle = bAngleRadians * 180 / Math.PI;
      const bDepthScale = 1 / (bTopToBottomRatio * Math.cos(bAngleRadians));

      page.style.setProperty("--rectangle-track-y", `${-wrappedPosition.toFixed(2)}px`);
      page.style.setProperty("--rectangle-a-scale", aScale.toFixed(4));
      page.style.setProperty("--rectangle-a-opacity", (1 - easedProgress).toFixed(4));
      page.style.setProperty(
        "--rectangle-a-title-y",
        `${(-viewportHeight * 0.16 * easedProgress).toFixed(2)}px`,
      );
      const titleColorChannel = Math.round(255 * (1 - easedProgress));
      page.style.setProperty(
        "--rectangle-a-title-color",
        `rgb(${titleColorChannel} ${titleColorChannel} ${titleColorChannel})`,
      );
      page.dataset.heroHidden = titleColorChannel === 0 ? "true" : "false";
      page.style.setProperty("--rectangle-b-fade-opacity", easedProgress.toFixed(4));
      page.style.setProperty(
        "--rectangle-content-opacity",
        contentExitOpacity.toFixed(4),
      );
      page.style.setProperty(
        "--rectangle-content-strip-y",
        `${(viewportHeight * 0.6 * (0.5 - currentSectionProgress)).toFixed(2)}px`,
      );
      page.style.setProperty(
        "--rectangle-marquee-y",
        `${(-viewportHeight * currentSectionProgress).toFixed(2)}px`,
      );
      page.style.setProperty(
        "--rectangle-content-perspective-scale",
        contentPerspectiveScale.toFixed(4),
      );
      page.style.setProperty(
        "--rectangle-content-entry-y",
        `${(viewportHeight * 0.9 * contentBelowEntry).toFixed(2)}px`,
      );
      page.style.setProperty(
        "--rectangle-content-entry-skew",
        `${(10 * contentBelowEntry).toFixed(3)}deg`,
      );
      page.style.setProperty("--rectangle-b-width", `${bBottomWidth.toFixed(2)}px`);
      page.style.setProperty("--rectangle-b-angle", `${bAngle.toFixed(3)}deg`);
      page.style.setProperty("--rectangle-b-depth-scale", bDepthScale.toFixed(4));

      if (nextSection !== renderedSection) {
        renderedSection = nextSection;
        setCurrentSection(nextSection);
      }
    };

    const animate = (frameTime: number) => {
      animationFrameId = 0;
      const frameScale = previousFrameTime === 0
        ? 1
        : Math.min((frameTime - previousFrameTime) / (1_000 / 60), 2);
      previousFrameTime = frameTime;

      velocity *= Math.pow(0.86, frameScale);
      const nextPosition = position + velocity * frameScale;
      const boundedPosition = clampPosition(nextPosition);
      if (boundedPosition !== nextPosition) {
        velocity = 0;
      }
      position = boundedPosition;
      render();

      if (Math.abs(velocity) < 0.02) {
        velocity = 0;
        page.dataset.motion = "idle";
        return;
      }

      page.dataset.motion = "moving";
      animationFrameId = window.requestAnimationFrame(animate);
    };

    const cancelNavigation = () => {
      window.cancelAnimationFrame(navigationFrameId);
      navigationFrameId = 0;
    };

    const applyForce = (delta: number) => {
      cancelNavigation();
      const limitedDelta = Math.max(-120, Math.min(120, delta));

      const isAtStart = position <= 0 && limitedDelta < 0 && velocity <= 0;
      const isAtEnd = position >= maximumPosition && limitedDelta > 0 && velocity >= 0;
      if (isAtStart || isAtEnd) {
        position = clampPosition(position);
        velocity = 0;
        render();
        return;
      }

      if (reducedMotion.matches) {
        position = clampPosition(position + limitedDelta * 0.45);
        render();
        return;
      }

      velocity += limitedDelta * 0.12;
      if (animationFrameId === 0) {
        previousFrameTime = 0;
        animationFrameId = window.requestAnimationFrame(animate);
      }
    };

    const landingScroller = page.closest<HTMLElement>(".landing-page");
    const shouldUseNativeScroll = (delta: number) => {
      if (!landingScroller) return false;
      if (landingScroller.scrollTop > 0.5) return true;

      return position >= maximumPosition - 0.5 && delta > 0 && velocity >= 0;
    };

    const handleWheel = (event: WheelEvent) => {
      const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? viewportHeight
          : 1;
      const delta = event.deltaY * multiplier;
      if (shouldUseNativeScroll(delta)) {
        cancelNavigation();
        velocity = 0;
        return;
      }

      event.preventDefault();
      applyForce(delta);
    };

    const handleTouchStart = (event: TouchEvent) => {
      previousTouchY = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touchY = event.touches[0]?.clientY;
      if (touchY === undefined || previousTouchY === null) return;
      const delta = previousTouchY - touchY;
      if (shouldUseNativeScroll(delta)) {
        cancelNavigation();
        velocity = 0;
        previousTouchY = touchY;
        return;
      }

      event.preventDefault();
      applyForce(delta);
      previousTouchY = touchY;
    };

    const clearTouch = () => {
      previousTouchY = null;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "ArrowDown" && event.code !== "ArrowUp") return;
      const delta = event.code === "ArrowDown" ? 120 : -120;
      if (shouldUseNativeScroll(delta)) {
        cancelNavigation();
        velocity = 0;
        return;
      }

      event.preventDefault();
      applyForce(delta);
    };

    const scrollToSection = (section: number) => {
      cancelNavigation();
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
      velocity = 0;
      const startPosition = position;
      const targetPosition = clampPosition(
        (section - 1 + (section > 1 ? 0.5 : 0))
          * viewportHeight,
      );
      const distance = targetPosition - startPosition;

      if (reducedMotion.matches || Math.abs(distance) < 0.5) {
        position = targetPosition;
        render();
        page.dataset.motion = "idle";
        return;
      }

      const viewportDistance = Math.abs(distance) / viewportHeight;
      const duration = Math.min(2_200, 650 + viewportDistance * 170);
      const startTime = performance.now();
      page.dataset.motion = "moving";

      const animateNavigation = (frameTime: number) => {
        const progress = Math.min(1, (frameTime - startTime) / duration);
        const easedProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        position = startPosition + distance * easedProgress;
        render();

        if (progress >= 1) {
          position = targetPosition;
          render();
          navigationFrameId = 0;
          page.dataset.motion = "idle";
          return;
        }

        navigationFrameId = window.requestAnimationFrame(animateNavigation);
      };

      navigationFrameId = window.requestAnimationFrame(animateNavigation);
    };

    const handleSectionLinkClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>(
        '.dynamic-header a[href^="#flashback-section-"]',
      );
      if (!link) return;

      const section = getSectionFromHash(link.hash);
      if (section === null) return;

      event.preventDefault();
      if (window.location.hash !== link.hash) {
        window.history.pushState(null, "", link.hash);
      }
      scrollToSection(section);
    };

    const handleSectionHistory = () => {
      const section = getSectionFromHash(window.location.hash);
      if (section !== null) scrollToSection(section);
    };

    const handleResize = () => {
      cancelNavigation();
      updateViewportMetrics();
      updateSharedFrameSize();
      render();
      page.dataset.motion = "idle";
    };

    const cleanupBase = () => {
      window.cancelAnimationFrame(animationFrameId);
      cancelNavigation();
      window.removeEventListener("resize", handleResize);
    };

    page.dataset.motion = "idle";
    updateViewportMetrics();
    updateSharedFrameSize();
    render();
    window.addEventListener("resize", handleResize);

    if (!isActive) return cleanupBase;

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", clearTouch, { passive: true });
    window.addEventListener("touchcancel", clearTouch, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleSectionLinkClick);
    window.addEventListener("hashchange", handleSectionHistory);
    window.addEventListener("popstate", handleSectionHistory);
    handleSectionHistory();

    return () => {
      cleanupBase();
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", clearTouch);
      window.removeEventListener("touchcancel", clearTouch);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleSectionLinkClick);
      window.removeEventListener("hashchange", handleSectionHistory);
      window.removeEventListener("popstate", handleSectionHistory);
    };
  }, [isActive]);

  return (
    <div
      className={`rectangle-test${embedded ? " rectangle-test--embedded" : ""}`}
      ref={pageRef}
      aria-label="Hành trình FLASH - 10 năm CÒN - NÉT"
      data-section-count={LANDING_SECTION_COUNT}
      data-current-section={currentSection}
    >
      {embedded ? <BackgroundMarquee currentSection={currentSection} /> : null}
      {embedded ? (
        <h1 className="rectangle-test__hero-title">
          <span>{FLASHBACK_HERO_TITLE}</span>
          <span>{FLASHBACK_HERO_SUBTITLE}</span>
          <span
            style={{
              fontSize: "0.085em",
              letterSpacing: "0.01em",
              lineHeight: 1.25,
              marginTop: "1.4em",
            }}
          >
            {FLASHBACK_HERO_CAPTION}
          </span>
        </h1>
      ) : null}
      {embedded && currentContentPosition ? (
        <SectionContent
          key={currentSection}
          contentNumber={currentContentPosition.contentNumber}
          subContentIndex={currentContentPosition.subContentIndex}
        />
      ) : null}
      <div className="rectangle-test__sequence" aria-hidden="true">
        <div className="rectangle-test__column rectangle-test__column--vertical">
          <div className="rectangle-test__anchor">
            <FilmFrameTrack sharedSize={sharedFrameSize} />
          </div>
        </div>
        <div className="rectangle-test__column rectangle-test__column--perspective">
          <div className="rectangle-test__anchor">
            <FilmFrameTrack sharedSize={sharedFrameSize} />
          </div>
        </div>
      </div>
      <div
        className="rectangle-test__virtual-section"
        id={`flashback-section-${currentSection}`}
        data-section={currentSection}
        aria-hidden="true"
      />
    </div>
  );
}
