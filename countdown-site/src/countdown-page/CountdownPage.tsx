"use client";

import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";
import DynamicHeader from "../components/DynamicHeader";
import FilmFrame from "../components/FilmFrame";
import type { FilmFrameSize } from "../components/FilmFrame";
import LandingPage from "../landing-page/LandingPage";
import type { CountdownUnit } from "./countdown";
import {
  DAY_IN_MS,
  getRemainingSeconds,
  getVisibleUnits,
  HOUR_IN_MS,
  MINUTE_IN_MS,
} from "./countdown";
import "./countdown-page.css";

const ROLL_DURATION_MS = 1_000;
const STEP_DURATION_MS = 667;
const REEL_EXIT_SCROLL_MS = 1_200;
const REEL_LAYOUT_EXPAND_MS = 650;
const REEL_EXIT_SETTLE_MS = 50;
const REEL_EXIT_DURATION_MS = REEL_EXIT_SCROLL_MS + REEL_LAYOUT_EXPAND_MS + REEL_EXIT_SETTLE_MS;
const TARGET_FILM_FPS = 24;
const FILM_FRAME_INTERVAL_MS = 1_000 / TARGET_FILM_FPS;
const COUNTDOWN_VIEWPORT_FILL = 0.9;
const COUNTDOWN_COLUMN_COUNT = 4;
const MIN_VIRTUAL_FRAME_COUNT = 9;
const VIRTUAL_FRAME_BUFFER = 3;
const FILM_ROLL_ANGLES: Record<CountdownUnit["label"], number> = {
  DAYS: 2,
  HOURS: 7,
  MINUTES: 0,
  SECONDS: 8,
};
const UNIT_LABELS_VI: Record<CountdownUnit["label"], string> = {
  DAYS: "NGÀY",
  HOURS: "GIỜ",
  MINUTES: "PHÚT",
  SECONDS: "GIÂY",
};
const UNIT_ARIA_LABELS_VI: Record<CountdownUnit["label"], string> = {
  DAYS: "ngày",
  HOURS: "giờ",
  MINUTES: "phút",
  SECONDS: "giây",
};

const CALENDAR_FILENAME = "sinh-nhat-flash-2026.ics";
const DEBUG_KEY_OFFSETS: Record<string, number> = {
  Digit1: DAY_IN_MS,
  Digit2: HOUR_IN_MS,
  Digit3: MINUTE_IN_MS,
};

type FilmRollProps = {
  label: CountdownUnit["label"];
  value: number;
  maxValue: number;
  isInfinite?: boolean;
  isStepped?: boolean;
  isUrgentStep?: boolean;
  markLastTenFrames?: boolean;
  hasPerspectiveTail?: boolean;
  angle?: number;
  showContent?: boolean;
  matchContentAspectRatio?: boolean;
  sharedFrameSize?: FilmFrameSize | null;
};

type RollPosition = {
  current: number;
  previous: number | null;
};

type ReelDeparture = {
  label: CountdownUnit["label"];
  phase: "ending" | "exiting";
};

function getViewportLayout() {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;

  return {
    crossExtent: viewportHeight,
    layoutExtent: viewportWidth,
  };
}

function applyCountdownScale(countdown: HTMLDivElement, scale: number) {
  countdown.style.setProperty("--countdown-scale", scale.toFixed(5));
}

function getBaselineLayoutWidth(countdown: HTMLDivElement, columnCount: number) {
  const stableSegment = Array.from(
    countdown.querySelectorAll<HTMLElement>(".countdown-segment"),
  ).find((segment) => !segment.classList.contains("countdown-segment--exiting"));
  const segmentWidth = stableSegment?.offsetWidth ?? 0;

  return segmentWidth > 0 ? segmentWidth * columnCount : countdown.offsetWidth;
}

function getEaseInOutProgress(progress: number) {
  return progress * progress * (3 - 2 * progress);
}

function getUrgentStepProgress(progress: number) {
  // Hold near the starting frame, then clear it decisively near the end.
  return progress * progress * progress * (4 - 3 * progress);
}

const FilmRollFrame = memo(function FilmRollFrame({
  isCurrent,
  label,
  sharedFrameSize,
  value,
  matchContentAspectRatio,
  isLastTenFrame,
}: {
  isCurrent: boolean;
  label: CountdownUnit["label"];
  sharedFrameSize: FilmFrameSize | null;
  value: number | null;
  matchContentAspectRatio: boolean;
  isLastTenFrame: boolean;
}) {
  const isRollEnd = label === "DAYS" && value === 0;

  return (
    <FilmFrame
      className={`countdown-film-frame film-roll__frame${isCurrent ? " countdown-film-frame--current" : " countdown-film-frame--muted"}${isRollEnd ? " countdown-film-frame--roll-end" : ""}${isLastTenFrame ? " countdown-film-frame--last-ten" : ""}`}
      orientation="vertical"
      thickness={30}
      perforationSize={12}
      perforationGap={9}
      perforationCount={6}
      radius={0}
      matchViewportAspectRatio
      matchContentAspectRatio={matchContentAspectRatio}
      sharedSize={sharedFrameSize}
    >
      {value === null ? null : (
        <div className="film-roll__content">
          <span className="film-roll__value">{value}</span>
          {isLastTenFrame
            ? null
            : <span className="film-roll__label">{UNIT_LABELS_VI[label]}</span>}
        </div>
      )}
    </FilmFrame>
  );
});

const FilmRoll = memo(function FilmRoll({
  label,
  value,
  maxValue,
  isInfinite = true,
  isStepped = false,
  isUrgentStep = false,
  markLastTenFrames = false,
  hasPerspectiveTail = false,
  angle = 0,
  showContent = true,
  matchContentAspectRatio = false,
  sharedFrameSize,
}: FilmRollProps) {
  const rollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationVisibilityRef = useRef({
    isIntersecting: true,
    isPageVisible: true,
    reducedMotion: false,
  });
  const resumeAnimationRef = useRef<() => void>(() => undefined);
  const [position, setPosition] = useState<RollPosition>({ current: value, previous: null });
  const [virtualFrameCount, setVirtualFrameCount] = useState(MIN_VIRTUAL_FRAME_COUNT);
  const [standaloneFrameSize, setStandaloneFrameSize] = useState<FilmFrameSize | null>(null);

  useLayoutEffect(() => {
    if (sharedFrameSize !== undefined) return;

    const track = trackRef.current;
    if (!track) return;

    let animationFrameId = 0;
    let isMounted = true;
    const updateStandaloneFrameSize = () => {
      if (!isMounted) return;
      const referenceFrame = track.querySelector<HTMLElement>(".film-roll__frame");
      if (!referenceFrame) return;

      const nextSize = {
        width: Math.round(referenceFrame.offsetWidth),
        height: Math.round(referenceFrame.offsetHeight),
      };
      setStandaloneFrameSize((currentSize) => (
        currentSize?.width === nextSize.width && currentSize.height === nextSize.height
          ? currentSize
          : nextSize
      ));
    };
    const scheduleStandaloneFrameSizeUpdate = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(updateStandaloneFrameSize);
    };

    const resizeObserver = new ResizeObserver(scheduleStandaloneFrameSizeUpdate);
    resizeObserver.observe(track);
    updateStandaloneFrameSize();
    window.addEventListener("resize", scheduleStandaloneFrameSizeUpdate, { passive: true });
    void document.fonts?.ready.then(scheduleStandaloneFrameSizeUpdate);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", scheduleStandaloneFrameSizeUpdate);
    };
  }, [sharedFrameSize]);

  useEffect(() => {
    const roll = rollRef.current;
    if (!roll) return;

    const visibility = animationVisibilityRef.current;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    visibility.isPageVisible = !document.hidden;
    visibility.reducedMotion = motionQuery.matches;

    const updateAnimationState = () => {
      roll.dataset.animationVisible = String(
        visibility.isIntersecting && visibility.isPageVisible,
      );
      resumeAnimationRef.current();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visibility.isIntersecting = entry?.isIntersecting ?? true;
      updateAnimationState();
    });
    observer.observe(roll);

    const handleVisibilityChange = () => {
      visibility.isPageVisible = !document.hidden;
      updateAnimationState();
    };
    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      visibility.reducedMotion = event.matches;
      updateAnimationState();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionQuery.addEventListener("change", handleReducedMotionChange);
    updateAnimationState();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener("change", handleReducedMotionChange);
    };
  }, []);

  useLayoutEffect(() => {
    const roll = rollRef.current;
    if (!roll) return;

    let animationFrameId = 0;
    let isMounted = true;
    const updateVirtualWindow = () => {
      const frame = roll.querySelector<HTMLElement>(".film-roll__frame");
      if (!frame) return;

      // End-of-roll spacers must occupy the exact same layout height as a
      // film frame. An estimated CSS height accumulates centering error for
      // every spacer added as a unit approaches zero.
      const frameLayoutHeight = Number.parseFloat(window.getComputedStyle(frame).height);
      if (!Number.isFinite(frameLayoutHeight) || frameLayoutHeight <= 0) return;

      roll.style.setProperty("--film-roll-frame-height", `${frameLayoutHeight}px`);

      const visibleFrameCount = Math.ceil(roll.clientHeight / frameLayoutHeight);
      const bufferedFrameCount = Math.max(
        MIN_VIRTUAL_FRAME_COUNT,
        visibleFrameCount + VIRTUAL_FRAME_BUFFER,
      );
      const nextFrameCount = bufferedFrameCount % 2 === 0
        ? bufferedFrameCount + 1
        : bufferedFrameCount;

      setVirtualFrameCount((currentCount) => (
        currentCount === nextFrameCount ? currentCount : nextFrameCount
      ));
    };

    const scheduleVirtualWindowUpdate = () => {
      if (!isMounted) return;
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(updateVirtualWindow);
    };

    scheduleVirtualWindowUpdate();
    window.addEventListener("resize", scheduleVirtualWindowUpdate, { passive: true });
    void document.fonts?.ready.then(scheduleVirtualWindowUpdate);

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", scheduleVirtualWindowUpdate);
    };
  }, []);

  useEffect(() => {
    setPosition((currentPosition) => {
      if (currentPosition.current === value) return currentPosition;
      return { current: value, previous: currentPosition.current };
    });

    const clearPrevious = window.setTimeout(() => {
      setPosition((currentPosition) => ({ ...currentPosition, previous: null }));
    }, isStepped ? STEP_DURATION_MS : ROLL_DURATION_MS);

    return () => window.clearTimeout(clearPrevious);
  }, [isStepped, value]);

  const isMoving = position.previous !== null;

  useLayoutEffect(() => {
    const roll = rollRef.current;
    const track = trackRef.current;
    if (!roll || !track) return;
    roll.dataset.animationValue = String(value);

    const frameStep = 100 / virtualFrameCount;
    const animationDuration = isStepped ? STEP_DURATION_MS : ROLL_DURATION_MS;
    const startedAt = window.performance.now();
    let previousUpdateAt = startedAt - FILM_FRAME_INTERVAL_MS;
    let animationFrameId = 0;

    const setProgress = (progress: number) => {
      track.style.setProperty(
        "--film-roll-offset",
        `${(frameStep * progress).toFixed(4)}%`,
      );
    };

    const animationLoop = (now: number) => {
      animationFrameId = 0;
      const visibility = animationVisibilityRef.current;
      if (!visibility.isIntersecting || !visibility.isPageVisible) {
        roll.dataset.animationState = "paused";
        return;
      }

      if (visibility.reducedMotion) {
        setProgress(1);
        roll.dataset.animationState = "reduced-motion";
        return;
      }

      const elapsed = now - startedAt;
      const sincePreviousUpdate = now - previousUpdateAt;
      if (sincePreviousUpdate >= FILM_FRAME_INTERVAL_MS || elapsed >= animationDuration) {
        previousUpdateAt = now - (sincePreviousUpdate % FILM_FRAME_INTERVAL_MS);
        const rawProgress = Math.min(1, elapsed / animationDuration);
        const easedProgress = isUrgentStep
          ? getUrgentStepProgress(rawProgress)
          : getEaseInOutProgress(rawProgress);
        setProgress(isStepped ? easedProgress : rawProgress);
      }

      if (elapsed < animationDuration) {
        roll.dataset.animationState = "running";
        animationFrameId = window.requestAnimationFrame(animationLoop);
      } else {
        roll.dataset.animationState = "complete";
      }
    };

    const resumeAnimation = () => {
      if (!isMoving || animationFrameId !== 0) return;
      animationFrameId = window.requestAnimationFrame(animationLoop);
    };
    resumeAnimationRef.current = resumeAnimation;

    if (!isMoving) {
      setProgress(0);
      roll.dataset.animationState = isStepped ? "step-idle" : "idle";
    } else {
      setProgress(0);
      resumeAnimation();
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resumeAnimationRef.current = () => undefined;
    };
  }, [isMoving, isStepped, isUrgentStep, value, virtualFrameCount]);

  const anchorValue = position.previous ?? position.current;
  const highlightedValue = position.current;
  const virtualFrameCenter = Math.floor(virtualFrameCount / 2);
  const virtualFrames = useMemo(
    () => Array.from({ length: virtualFrameCount }, (_, index) => {
      const offset = index - virtualFrameCenter;
      const rawValue = anchorValue - offset;
      const valueCount = maxValue + 1;
      const frameValue = isInfinite
        ? ((rawValue % valueCount) + valueCount) % valueCount
        : rawValue;
      const isPastZero = !isInfinite && frameValue < 0;
      const isTrailingFilm = isPastZero && label === "SECONDS";

      return {
        offset,
        isSpacer: isPastZero && !isTrailingFilm,
        key: isPastZero
          ? `${isTrailingFilm ? "tail" : "spacer"}-${offset}`
          : `value-${frameValue}`,
        value: isPastZero ? null : frameValue,
      };
    }),
    [anchorValue, isInfinite, label, maxValue, virtualFrameCenter, virtualFrameCount],
  );
  const rollStyle = {
    "--film-roll-angle": `${angle}deg`,
  } as CSSProperties;
  const renderVirtualFrame = (frame: (typeof virtualFrames)[number]) => (
    frame.isSpacer ? (
      <div
        className="film-roll__spacer"
        key={frame.key}
      />
    ) : (
      <FilmRollFrame
        key={frame.key}
        isCurrent={frame.value === highlightedValue}
        isLastTenFrame={markLastTenFrames && frame.value !== null && frame.value <= 10}
        label={label}
        matchContentAspectRatio={matchContentAspectRatio}
        sharedFrameSize={sharedFrameSize === undefined
          ? standaloneFrameSize
          : sharedFrameSize}
        value={showContent ? frame.value : null}
      />
    )
  );
  const perspectiveTailFrames = hasPerspectiveTail
    ? virtualFrames.filter((frame) => frame.offset === 1 || frame.offset === 2)
    : [];

  return (
    <div
      className={`film-roll${showContent ? "" : " film-roll--empty"}`}
      ref={rollRef}
      aria-label={`${value} ${UNIT_ARIA_LABELS_VI[label]}`}
      data-angle={angle}
      data-unit={label}
      data-infinite={isInfinite}
      data-animation-mode={isUrgentStep ? "urgent-step" : isStepped ? "eased-step" : "24fps"}
      data-target-fps={TARGET_FILM_FPS}
      data-rendered-frames={virtualFrameCount}
      data-total-frames={maxValue + 1}
      style={rollStyle}
    >
      <div
        className={`film-roll__track${isMoving ? " film-roll__track--moving" : ""}`}
        ref={trackRef}
        aria-hidden="true"
      >
        {virtualFrames.map((frame) => {
          if (hasPerspectiveTail && frame.offset === 1) {
            return (
              <div className="film-roll__perspective-tail" key="perspective-tail">
                {perspectiveTailFrames.map(renderVirtualFrame)}
              </div>
            );
          }

          if (hasPerspectiveTail && frame.offset === 2) return null;
          return renderVirtualFrame(frame);
        })}
      </div>
    </div>
  );
});

function CountdownClock({ totalSeconds }: { totalSeconds: number }) {
  const countdownRef = useRef<HTMLDivElement>(null);
  const exitLayoutRef = useRef<{ fromWidth: number; toWidth: number } | null>(null);
  const finalCountdown = totalSeconds < 60;
  const liveUnits = finalCountdown
    ? [{ label: "SECONDS" as const, value: totalSeconds }]
    : getVisibleUnits(totalSeconds);
  const liveUnitsSignature = liveUnits.map((unit) => `${unit.label}:${unit.value}`).join("|");
  const latestUnitsRef = useRef(liveUnits);
  const [displayedUnits, setDisplayedUnits] = useState(liveUnits);
  const [departure, setDeparture] = useState<ReelDeparture | null>(null);
  const [sharedFrameSize, setSharedFrameSize] = useState<FilmFrameSize | null>(null);
  const [initialDays] = useState(
    () => liveUnits.find((unit) => unit.label === "DAYS")?.value ?? 0,
  );
  const leftmostUnitFinishedLastCycle = displayedUnits[0]?.value === 0
    && departure?.phase === "exiting";
  // Keep the existing animation mode and angle while the previous strip makes
  // its final exit. Switching the seconds strip early made the 59-second
  // handoff snap halfway through the departure animation.
  const finalSecondsActive = finalCountdown
    && departure === null
    && displayedUnits.length === 1;
  const lastTenSecondsActive = finalSecondsActive && totalSeconds <= 10;

  latestUnitsRef.current = liveUnits;

  useEffect(() => {
    const currentUnits = latestUnitsRef.current;
    const liveByLabel = new Map(currentUnits.map((unit) => [unit.label, unit]));

    if (departure !== null) {
      setDisplayedUnits((currentDisplayedUnits) => currentDisplayedUnits.map(
        (unit) => liveByLabel.get(unit.label) ?? unit,
      ));
      return;
    }

    const departingUnit = displayedUnits.find((unit) => !liveByLabel.has(unit.label));

    if (departingUnit !== undefined) {
      setDisplayedUnits(displayedUnits.map(
        (unit) => liveByLabel.get(unit.label) ?? { ...unit, value: 0 },
      ));
      setDeparture({ label: departingUnit.label, phase: "ending" });
      return;
    }

    setDisplayedUnits(currentUnits);
  }, [departure, liveUnitsSignature]);

  useEffect(() => {
    if (departure === null) return;

    const timeoutId = window.setTimeout(() => {
      if (departure.phase === "ending") {
        setDeparture({ label: departure.label, phase: "exiting" });
        return;
      }

      setDisplayedUnits(latestUnitsRef.current);
      setDeparture(null);
    }, departure.phase === "ending" ? ROLL_DURATION_MS : REEL_EXIT_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [departure]);

  useLayoutEffect(() => {
    const countdown = countdownRef.current;
    if (!countdown) return;

    let animationFrameId = 0;
    let layoutDelayTimeoutId = 0;

    if (departure?.phase === "ending") {
      const departingSegment = countdown.querySelector<HTMLElement>(
        ".countdown-segment--ending",
      );

      if (departingSegment) {
        const fromWidth = countdown.offsetWidth;
        const toWidth = Math.max(1, fromWidth - departingSegment.offsetWidth);
        exitLayoutRef.current = { fromWidth, toWidth };
        countdown.style.setProperty("--countdown-layout-width", `${fromWidth}px`);
      }
    } else if (departure?.phase === "exiting" && exitLayoutRef.current) {
      const { fromWidth, toWidth } = exitLayoutRef.current;
      layoutDelayTimeoutId = window.setTimeout(() => {
        const startedAt = window.performance.now();
        let previousUpdateAt = startedAt - FILM_FRAME_INTERVAL_MS;

        const animateLayout = (now: number) => {
          const elapsed = now - startedAt;
          const sincePreviousUpdate = now - previousUpdateAt;

          if (sincePreviousUpdate >= FILM_FRAME_INTERVAL_MS || elapsed >= REEL_LAYOUT_EXPAND_MS) {
            previousUpdateAt = now - (sincePreviousUpdate % FILM_FRAME_INTERVAL_MS);
            const progress = Math.min(1, elapsed / REEL_LAYOUT_EXPAND_MS);
            const easedProgress = progress * progress * (3 - 2 * progress);
            const width = fromWidth + (toWidth - fromWidth) * easedProgress;

            countdown.style.setProperty("--countdown-layout-width", `${width}px`);
          }

          if (elapsed < REEL_LAYOUT_EXPAND_MS) {
            animationFrameId = window.requestAnimationFrame(animateLayout);
          }
        };

        animationFrameId = window.requestAnimationFrame(animateLayout);
      }, REEL_EXIT_SCROLL_MS);
    } else if (departure === null) {
      countdown.style.removeProperty("--countdown-layout-width");
      exitLayoutRef.current = null;

      const baselineWidth = getBaselineLayoutWidth(countdown, COUNTDOWN_COLUMN_COUNT);
      if (baselineWidth > 0) {
        const { crossExtent, layoutExtent } = getViewportLayout();
        const scale = (layoutExtent * COUNTDOWN_VIEWPORT_FILL) / baselineWidth;
        applyCountdownScale(countdown, scale);
        countdown.style.setProperty(
          "--countdown-unscaled-height",
          `${crossExtent / scale}px`,
        );
      }
    }

    return () => {
      window.clearTimeout(layoutDelayTimeoutId);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [departure]);

  useLayoutEffect(() => {
    const countdown = countdownRef.current;
    if (!countdown) return;

    let previousHeight = 0;

    const updateScale = () => {
      if (countdown.dataset.departurePhase === "exiting") return;

      const baselineWidth = getBaselineLayoutWidth(countdown, COUNTDOWN_COLUMN_COUNT);
      if (baselineWidth <= 0) return;

      const { crossExtent, layoutExtent } = getViewportLayout();
      countdown.parentElement?.style.setProperty(
        "--film-frame-viewport-aspect-ratio",
        `${layoutExtent} / ${crossExtent}`,
      );
      const scale = (layoutExtent * COUNTDOWN_VIEWPORT_FILL) / baselineWidth;
      const unscaledHeight = crossExtent / scale;

      applyCountdownScale(countdown, scale);

      if (Math.abs(unscaledHeight - previousHeight) > 0.1) {
        countdown.style.setProperty("--countdown-unscaled-height", `${unscaledHeight}px`);
        previousHeight = unscaledHeight;
      }
    };

    let animationFrameId = 0;
    let isMounted = true;
    const scheduleScaleUpdate = () => {
      if (!isMounted) return;
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(updateScale);
    };

    // Establish the viewport aspect ratio before child filmframes measure on
    // their first animation frame. Deferring this initial write left the SVG
    // geometry stuck at the temporary 4:6 fallback ratio.
    updateScale();
    window.addEventListener("resize", scheduleScaleUpdate, { passive: true });
    void document.fonts?.ready.then(scheduleScaleUpdate);

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", scheduleScaleUpdate);
    };
  }, []);

  useLayoutEffect(() => {
    const countdown = countdownRef.current;
    if (!countdown) return;

    let animationFrameId = 0;
    let isMounted = true;
    const updateSharedFrameSize = () => {
      if (!isMounted) return;
      // Every countdown filmframe has the same CSS layout size, so one
      // reference measurement can drive all SVG geometry instances.
      const referenceFrame = countdown.querySelector<HTMLElement>(".film-roll__frame");
      if (!referenceFrame) return;

      const nextSize = {
        width: Math.round(referenceFrame.offsetWidth),
        height: Math.round(referenceFrame.offsetHeight),
      };
      setSharedFrameSize((currentSize) => (
        currentSize?.width === nextSize.width && currentSize.height === nextSize.height
          ? currentSize
          : nextSize
      ));
    };
    const scheduleSharedFrameSizeUpdate = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(updateSharedFrameSize);
    };

    const resizeObserver = new ResizeObserver(scheduleSharedFrameSizeUpdate);
    resizeObserver.observe(countdown);
    updateSharedFrameSize();
    window.addEventListener("resize", scheduleSharedFrameSizeUpdate, { passive: true });
    void document.fonts?.ready.then(scheduleSharedFrameSizeUpdate);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", scheduleSharedFrameSizeUpdate);
    };
  }, []);

  return (
    <div
      className={`countdown${finalSecondsActive ? " countdown--final" : ""}`}
      data-departure-phase={departure?.phase}
      ref={countdownRef}
      role="timer"
      aria-live="polite"
    >
      <span className="countdown__accessible-value">
        {liveUnits.map((unit) => `${unit.value} ${UNIT_ARIA_LABELS_VI[unit.label]}`).join(" : ")}
      </span>
      {displayedUnits.map((unit, index) => (
        <div
          className={`countdown-segment${departure?.label === unit.label ? ` countdown-segment--${departure.phase}` : ""}`}
          key={unit.label}
        >
          {index > 0 && !(departure?.phase === "exiting" && index === 1)
            ? <span className="countdown-colon" aria-hidden="true">:</span>
            : null}
          <FilmRoll
            label={unit.label}
            value={unit.value}
            maxValue={unit.label === "DAYS" ? initialDays : unit.label === "HOURS" ? 23 : 59}
            isInfinite={index > 0 && !(leftmostUnitFinishedLastCycle && index === 1)}
            isStepped={finalSecondsActive}
            isUrgentStep={lastTenSecondsActive && unit.label === "SECONDS"}
            markLastTenFrames={finalSecondsActive && unit.label === "SECONDS"}
            angle={finalSecondsActive ? 0 : FILM_ROLL_ANGLES[unit.label]}
            sharedFrameSize={sharedFrameSize}
          />
        </div>
      ))}
    </div>
  );
}

export default function CountdownPage({ initialNow }: { initialNow: number }) {
  const [now, setNow] = useState(initialNow);
  const [debugOffset, setDebugOffset] = useState(0);
  const [landingActive, setLandingActive] = useState(false);
  const landingSupported = true;
  const activeLanding = landingSupported && landingActive;
  const totalSeconds = getRemainingSeconds(now, debugOffset);

  useEffect(() => {
    if (activeLanding) return;

    let timeoutId: number;
    const scheduleTick = () => {
      const delay = 1_000 - (Date.now() % 1_000) + 10;
      timeoutId = window.setTimeout(() => {
        setNow(Date.now());
        scheduleTick();
      }, delay);
    };

    scheduleTick();
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeLanding]);

  useEffect(() => {
    if (!landingSupported || totalSeconds !== 0 || landingActive) return;

    const animationFrameId = window.requestAnimationFrame(() => {
      setLandingActive(true);
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [landingActive, landingSupported, totalSeconds]);

  useEffect(() => {
    let leftShiftPressed = false;
    let rightShiftPressed = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeLanding) return;

      if (event.code === "ShiftLeft") {
        leftShiftPressed = true;
        return;
      }

      if (event.code === "ShiftRight") {
        rightShiftPressed = true;
        return;
      }

      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.code === "Digit0" && leftShiftPressed && !rightShiftPressed) {
        event.preventDefault();
        const debugNow = Date.now();
        setNow(debugNow);
        setDebugOffset((currentOffset) => {
          const remainingSeconds = getRemainingSeconds(debugNow, currentOffset);
          return currentOffset + (remainingSeconds - 70) * 1_000;
        });
        return;
      }

      const offset = DEBUG_KEY_OFFSETS[event.code];
      if (!offset || leftShiftPressed === rightShiftPressed) return;

      event.preventDefault();
      const direction = leftShiftPressed ? 1 : -1;
      setDebugOffset((currentOffset) => currentOffset + offset * direction);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "ShiftLeft") leftShiftPressed = false;
      if (event.code === "ShiftRight") rightShiftPressed = false;
    };

    const handleBlur = () => {
      leftShiftPressed = false;
      rightShiftPressed = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [activeLanding]);

  return (
    <div
      className="countdown-experience"
      data-final-seconds={totalSeconds < 60}
      data-last-thirty={totalSeconds <= 30}
      data-landing-active={activeLanding}
      data-landing-supported={landingSupported}
    >
      <div className="countdown-experience__track">
        <main
          className="countdown-page"
          aria-label="Đếm ngược đến 10 giờ ngày 30 tháng 8 năm 2026"
          aria-hidden={activeLanding}
          inert={activeLanding ? true : undefined}
        >
          <div className="countdown-page__mobile-meta" aria-hidden="true">
            <span>FLASH / 10 NĂM</span>
            <span>30.08.2026 · 10:00</span>
          </div>
          <CountdownClock totalSeconds={totalSeconds} />
        </main>
        {landingSupported ? <LandingPage isActive={activeLanding} /> : null}
      </div>
      <DynamicHeader expanded={activeLanding} />
      <a
        className="save-date-button"
        href={`/${CALENDAR_FILENAME}`}
        download={CALENDAR_FILENAME}
        role="button"
        aria-label="Lưu sự kiện Sinh nhật FLASH vào lịch"
        title="Ngày 30 tháng 8 năm 2026, 10:00–14:30 · Bamos Coffee - Kim Sơn"
      >
        Lưu ngày
      </a>
    </div>
  );
}
