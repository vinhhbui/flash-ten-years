import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import FilmFrame from "../components/FilmFrame";
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
const REEL_EXIT_SCROLL_MS = 1_200;
const REEL_LAYOUT_EXPAND_MS = 650;
const REEL_EXIT_SETTLE_MS = 50;
const REEL_EXIT_DURATION_MS = REEL_EXIT_SCROLL_MS + REEL_LAYOUT_EXPAND_MS + REEL_EXIT_SETTLE_MS;
const TARGET_FILM_FPS = 24;
const FILM_FRAME_INTERVAL_MS = 1_000 / TARGET_FILM_FPS;
const COUNTDOWN_VIEWPORT_FILL = 0.9;
const MIN_VIRTUAL_FRAME_COUNT = 9;
const VIRTUAL_FRAME_BUFFER = 3;
const FILM_ROLL_ANGLES: Record<CountdownUnit["label"], number> = {
  DAYS: 2,
  HOURS: 7,
  MINUTES: 0,
  SECONDS: 8,
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
  angle?: number;
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
  const isPortrait = viewportHeight > viewportWidth;

  return {
    crossExtent: isPortrait ? viewportWidth : viewportHeight,
    layoutExtent: isPortrait ? viewportHeight : viewportWidth,
  };
}

function applyCountdownScale(countdown: HTMLDivElement, scale: number) {
  countdown.style.setProperty("--countdown-scale", scale.toFixed(5));
}

const FilmRollFrame = memo(function FilmRollFrame({
  label,
  value,
}: {
  label: CountdownUnit["label"];
  value: number;
}) {
  return (
    <FilmFrame
      className="countdown-film-frame film-roll__frame"
      orientation="vertical"
      thickness={30}
      perforationSize={12}
      perforationGap={9}
      perforationCount={6}
      radius={0}
      fitContent
      matchViewportAspectRatio
    >
      <div className="film-roll__content">
        <span className="film-roll__value">{value}</span>
        <span className="film-roll__label">{label}</span>
      </div>
    </FilmFrame>
  );
});

const FilmRoll = memo(function FilmRoll({
  label,
  value,
  maxValue,
  isInfinite = true,
  isStepped = false,
  angle = 0,
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

    updateVirtualWindow();
    animationFrameId = window.requestAnimationFrame(updateVirtualWindow);

    const observer = new ResizeObserver(updateVirtualWindow);
    observer.observe(roll);
    const measuredFrame = roll.querySelector<HTMLElement>(".film-roll__frame");
    if (measuredFrame) observer.observe(measuredFrame);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setPosition((currentPosition) => {
      if (currentPosition.current === value) return currentPosition;
      return { current: value, previous: currentPosition.current };
    });

    const clearPrevious = window.setTimeout(() => {
      setPosition((currentPosition) => ({ ...currentPosition, previous: null }));
    }, ROLL_DURATION_MS);

    return () => window.clearTimeout(clearPrevious);
  }, [value]);

  const isMoving = position.previous !== null;

  useLayoutEffect(() => {
    const roll = rollRef.current;
    const track = trackRef.current;
    if (!roll || !track) return;

    const frameStep = 100 / virtualFrameCount;
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
      if (sincePreviousUpdate >= FILM_FRAME_INTERVAL_MS || elapsed >= ROLL_DURATION_MS) {
        previousUpdateAt = now - (sincePreviousUpdate % FILM_FRAME_INTERVAL_MS);
        setProgress(Math.min(1, elapsed / ROLL_DURATION_MS));
      }

      if (elapsed < ROLL_DURATION_MS) {
        roll.dataset.animationState = "running";
        animationFrameId = window.requestAnimationFrame(animationLoop);
      } else {
        roll.dataset.animationState = "complete";
      }
    };

    const resumeAnimation = () => {
      if (!isMoving || isStepped || animationFrameId !== 0) return;
      animationFrameId = window.requestAnimationFrame(animationLoop);
    };
    resumeAnimationRef.current = resumeAnimation;

    if (!isMoving) {
      setProgress(0);
      roll.dataset.animationState = "idle";
    } else if (isStepped) {
      setProgress(0);
      roll.dataset.animationState = "stepped";
    } else {
      setProgress(0);
      resumeAnimation();
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resumeAnimationRef.current = () => undefined;
    };
  }, [isMoving, isStepped, position.current, virtualFrameCount]);

  const anchorValue = position.previous ?? position.current;
  const virtualFrameCenter = Math.floor(virtualFrameCount / 2);
  const virtualFrames = useMemo(
    () => Array.from({ length: virtualFrameCount }, (_, index) => {
      const offset = index - virtualFrameCenter;
      const rawValue = anchorValue - offset;
      const valueCount = maxValue + 1;
      const frameValue = isInfinite
        ? ((rawValue % valueCount) + valueCount) % valueCount
        : rawValue;
      const isSpacer = !isInfinite && frameValue < 0;

      return {
        key: isSpacer ? `spacer-${offset}` : `value-${rawValue}`,
        value: isSpacer ? null : frameValue,
      };
    }),
    [anchorValue, isInfinite, maxValue, virtualFrameCenter, virtualFrameCount],
  );
  const widestDigitCount = String(maxValue + virtualFrameCenter).length;
  const rollStyle = {
    "--film-roll-width": `calc(${widestDigitCount}ch + 60px)`,
    "--film-roll-angle": `${angle}deg`,
  } as CSSProperties;

  return (
    <div
      className="film-roll"
      ref={rollRef}
      aria-label={`${value} ${label.toLowerCase()}`}
      data-angle={angle}
      data-unit={label}
      data-infinite={isInfinite}
      data-animation-mode={isStepped ? "step" : "24fps"}
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
        {virtualFrames.map((frame) => (
          frame.value === null ? (
            <div
              className="film-roll__spacer"
              key={`${isStepped ? "final" : "rolling"}-${frame.key}`}
            />
          ) : (
            <FilmRollFrame
              key={`${isStepped ? "final" : "rolling"}-${frame.key}`}
              label={label}
              value={frame.value}
            />
          )
        ))}
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
  const initialDays = useRef(liveUnits.find((unit) => unit.label === "DAYS")?.value ?? 0);
  const leftmostUnitFinishedLastCycle = displayedUnits[0]?.value === 0
    && departure?.phase === "exiting";
  const finalSecondsActive = finalCountdown
    && departure === null
    && displayedUnits.length === 1;

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
            const { layoutExtent } = getViewportLayout();
            const scale = (layoutExtent * COUNTDOWN_VIEWPORT_FILL) / width;

            countdown.style.setProperty("--countdown-layout-width", `${width}px`);
            applyCountdownScale(countdown, scale);
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

      const naturalWidth = countdown.offsetWidth;
      if (naturalWidth > 0) {
        const { crossExtent, layoutExtent } = getViewportLayout();
        const scale = (layoutExtent * COUNTDOWN_VIEWPORT_FILL) / naturalWidth;
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

      const naturalWidth = countdown.offsetWidth;
      if (naturalWidth <= 0) return;

      const { crossExtent, layoutExtent } = getViewportLayout();
      countdown.parentElement?.style.setProperty(
        "--film-frame-viewport-aspect-ratio",
        `${layoutExtent} / ${crossExtent}`,
      );
      const scale = (layoutExtent * COUNTDOWN_VIEWPORT_FILL) / naturalWidth;
      const unscaledHeight = crossExtent / scale;

      applyCountdownScale(countdown, scale);

      if (Math.abs(unscaledHeight - previousHeight) > 0.1) {
        countdown.style.setProperty("--countdown-unscaled-height", `${unscaledHeight}px`);
        previousHeight = unscaledHeight;
      }
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(countdown);
    window.addEventListener("resize", updateScale, { passive: true });
    updateScale();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
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
        {liveUnits.map((unit) => `${unit.value} ${unit.label.toLowerCase()}`).join(" : ")}
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
            maxValue={unit.label === "DAYS" ? initialDays.current : unit.label === "HOURS" ? 23 : 59}
            isInfinite={index > 0 && !(leftmostUnitFinishedLastCycle && index === 1)}
            isStepped={finalSecondsActive}
            angle={finalSecondsActive ? 0 : FILM_ROLL_ANGLES[unit.label]}
          />
        </div>
      ))}
    </div>
  );
}

export default function CountdownPage() {
  const [now, setNow] = useState(Date.now);
  const [debugOffset, setDebugOffset] = useState(0);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "CountDown";

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
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    let leftShiftPressed = false;
    let rightShiftPressed = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "ShiftLeft") {
        leftShiftPressed = true;
        return;
      }

      if (event.code === "ShiftRight") {
        rightShiftPressed = true;
        return;
      }

      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;

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
  }, []);

  const totalSeconds = getRemainingSeconds(now, debugOffset);

  return (
    <main className="countdown-page" aria-label="Countdown to 30 August 2026 at 10 AM">
      <CountdownClock totalSeconds={totalSeconds} />
      <div className="flash-logo-frame">
        <img className="flash-logo" src="/logo-flash.svg" alt="FLASH" />
      </div>
      <a
        className="save-date-button"
        href={`/${CALENDAR_FILENAME}`}
        download={CALENDAR_FILENAME}
        role="button"
        aria-label="Save Sinh nhật FLASH to your calendar"
        title="30 August 2026, 10:00–14:30 · Bamos Coffee - Kim Sơn"
      >
        Save the Date
      </a>
    </main>
  );
}
