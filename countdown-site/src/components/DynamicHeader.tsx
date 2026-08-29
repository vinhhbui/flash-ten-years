"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  FLASHBACK_CONTENT,
  FLASHBACK_PRIMARY_COLORS,
  getContentStartSection,
} from "../rectangle-test/contentSequence";
import "./DynamicHeader.css";

const HEADER_LINKS = FLASHBACK_CONTENT.map((content, index) => ({
  href: `#flashback-section-${getContentStartSection(index + 1)}`,
  label: `${content.generation}: ${content.title}`,
  number: String(index + 1),
}));

const FIRST_GENERATION = 1;
const LAST_GENERATION = HEADER_LINKS.length;

const getGenerationFromSection = (section: number) => (
  Math.max(FIRST_GENERATION, Math.min(LAST_GENERATION, section - 1))
);

type DynamicHeaderProps = {
  expanded: boolean;
};

function DateGroup({
  digits,
  label,
  side,
}: {
  digits: string[];
  label: string;
  side: "left" | "right";
}) {
  return (
    <div
      aria-label={label}
      className={`dynamic-header__date dynamic-header__date--${side}`}
      role="img"
    >
      {digits.map((digit, index) => (
        digit === "." ? (
          <span
            aria-hidden="true"
            className="dynamic-header__date-separator"
            key={`separator-${index}`}
          >
            .
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="dynamic-header__date-circle"
            key={`${digit}-${index}`}
          >
            {digit}
          </span>
        )
      ))}
    </div>
  );
}

export default function DynamicHeader({ expanded }: DynamicHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [currentGeneration, setCurrentGeneration] = useState(FIRST_GENERATION);

  const moveToGeneration = (generation: number) => {
    const nextGeneration = Math.max(
      FIRST_GENERATION,
      Math.min(LAST_GENERATION, generation),
    );
    const nextSection = getContentStartSection(nextGeneration);
    const nextHash = `#flashback-section-${nextSection}`;

    setCurrentGeneration(nextGeneration);
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", nextHash);
    }
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  useEffect(() => {
    const syncToSection = (section: number) => {
      setCurrentGeneration(getGenerationFromSection(section));
    };

    const handleSectionChange = (event: Event) => {
      const section = (event as CustomEvent<{ section?: number }>).detail?.section;
      if (typeof section === "number") syncToSection(section);
    };

    const renderedSection = Number(
      document.querySelector<HTMLElement>(".rectangle-test[data-current-section]")
        ?.dataset.currentSection,
    );
    if (Number.isFinite(renderedSection)) syncToSection(renderedSection);

    window.addEventListener("flashbacksectionchange", handleSectionChange);
    return () => {
      window.removeEventListener("flashbacksectionchange", handleSectionChange);
    };
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (
      !header
      || expanded
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches
      || window.matchMedia("(max-width: 700px), (pointer: coarse)").matches
    ) {
      return;
    }

    const initialRect = header.getBoundingClientRect();
    let x = initialRect.left;
    let y = initialRect.top;
    let velocityX = 92;
    let velocityY = 68;
    let previousTime = 0;
    let animationFrameId = 0;
    let maximumX = 0;
    let maximumY = 0;

    const updateBounds = () => {
      maximumX = Math.max(0, window.innerWidth - header.offsetWidth);
      maximumY = Math.max(0, window.innerHeight - header.offsetHeight);
      x = Math.max(0, Math.min(maximumX, x));
      y = Math.max(0, Math.min(maximumY, y));
    };

    const renderPosition = () => {
      header.style.setProperty(
        "--dynamic-header-position",
        `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`,
      );
    };

    const animate = (time: number) => {
      const elapsedSeconds = previousTime === 0
        ? 0
        : Math.min((time - previousTime) / 1_000, 0.05);
      previousTime = time;

      x += velocityX * elapsedSeconds;
      y += velocityY * elapsedSeconds;

      if (x <= 0) velocityX = Math.abs(velocityX);
      if (x >= maximumX) velocityX = -Math.abs(velocityX);
      if (y <= 0) velocityY = Math.abs(velocityY);
      if (y >= maximumY) velocityY = -Math.abs(velocityY);

      renderPosition();
      animationFrameId = window.requestAnimationFrame(animate);
    };

    const handleResize = () => {
      updateBounds();
      renderPosition();
    };

    updateBounds();
    renderPosition();
    header.dataset.bouncing = "true";
    window.addEventListener("resize", handleResize);
    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      delete header.dataset.bouncing;
      header.style.removeProperty("--dynamic-header-position");
    };
  }, [expanded]);

  return (
    <>
      <header
        ref={headerRef}
        className="dynamic-header"
        data-expanded={expanded}
        aria-label="FLASHBACK"
      >
        <div className="dynamic-header__logo-slot">
          <a
            className="dynamic-header__logo-link"
            href={expanded ? "#flashback-section-1" : undefined}
            aria-label="Hero FLASHBACK"
            tabIndex={expanded ? 0 : -1}
          >
            {/* The source is a local vector logo; browser-native SVG rendering avoids rasterization. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="dynamic-header__logo" src="/Logo10.svg" alt="FLASH 10" />
          </a>
        </div>
        <div
          className="dynamic-header__slider"
          aria-hidden={!expanded}
          style={{
            "--dynamic-header-current-color": FLASHBACK_PRIMARY_COLORS[currentGeneration - 1],
            "--dynamic-header-slider-progress": `${(
              (currentGeneration - FIRST_GENERATION)
              / (LAST_GENERATION - FIRST_GENERATION)
            ) * 100}%`,
          } as CSSProperties}
        >
          <div className="dynamic-header__slider-track" aria-hidden="true">
            <span className="dynamic-header__slider-fill" />
            <span className="dynamic-header__slider-handle">
              {currentGeneration}
            </span>
          </div>
          <input
            aria-label="Chọn thế hệ FLASHBACK"
            aria-valuetext={HEADER_LINKS[currentGeneration - 1]?.label}
            className="dynamic-header__slider-input"
            disabled={!expanded}
            max={LAST_GENERATION}
            min={FIRST_GENERATION}
            onInput={(event) => moveToGeneration(Number(event.currentTarget.value))}
            step="1"
            tabIndex={expanded ? 0 : -1}
            type="range"
            value={currentGeneration}
          />
          <div className="dynamic-header__slider-labels" aria-hidden="true">
            {HEADER_LINKS.map((link, index) => (
              <span
                key={link.href}
                style={{
                  "--dynamic-header-number-color": FLASHBACK_PRIMARY_COLORS[index],
                } as CSSProperties}
              >
                {link.number}
              </span>
            ))}
          </div>
        </div>
      </header>
      <div data-expanded={expanded}>
        <DateGroup digits={["2", "7", ".", "0", "8"]} label="27 tháng 08" side="left" />
        <DateGroup digits={["2", "0", "2", "6"]} label="Năm 2026" side="right" />
      </div>
    </>
  );
}
