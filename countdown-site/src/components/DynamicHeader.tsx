"use client";

import { useEffect, useRef } from "react";
import {
  FLASHBACK_CONTENT,
  getContentStartSection,
} from "../rectangle-test/contentSequence";
import "./DynamicHeader.css";

const HEADER_LINKS = FLASHBACK_CONTENT.map((content, index) => ({
  href: `#flashback-section-${getContentStartSection(index + 1)}`,
  label: `${content.generation}: ${content.title}`,
  number: String(index + 1),
}));

type DynamicHeaderProps = {
  expanded: boolean;
};

export default function DynamicHeader({ expanded }: DynamicHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header || expanded || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
          <img className="dynamic-header__logo" src="/logo-flash.svg" alt="FLASH" />
        </a>
      </div>
      <nav
        className="dynamic-header__navigation"
        aria-label="Điều hướng FLASHBACK"
        aria-hidden={!expanded}
      >
        {HEADER_LINKS.map((link) => (
          <a
            className="dynamic-header__link"
            href={link.href}
            aria-label={link.label}
            key={link.href}
            tabIndex={expanded ? 0 : -1}
          >
            <span aria-hidden="true">{link.number}</span>
          </a>
        ))}
      </nav>
    </header>
  );
}
