import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FilmRoadHandle } from "../film/FilmRoad";
import {
  MASTER_SCROLL_VH,
  MASTER_TIMELINE_DURATION,
  getFilmRoadState,
  masterTimelineLabels,
} from "./motionConfig";

interface CreateMasterTimelineArgs {
  track: HTMLDivElement;
  stage: HTMLElement;
  film: FilmRoadHandle;
  compact: boolean;
}

const nearCardIndexes = new Set([2, 5]);
const farCardIndexes = new Set([0, 3]);

export function createMasterTimeline({ track, stage, film, compact }: CreateMasterTimelineArgs) {
  const select = <T extends Element>(selector: string) => stage.querySelectorAll<T>(selector);
  const hero = stage.querySelector<HTMLElement>("[data-composition='hero']");
  const manifesto = stage.querySelector<HTMLElement>("[data-composition='manifesto']");
  const media = stage.querySelector<HTMLElement>("[data-composition='media']");
  const takeover = stage.querySelector<HTMLElement>("[data-composition='takeover']");
  const culture = stage.querySelector<HTMLElement>("[data-composition='culture']");
  const final = stage.querySelector<HTMLElement>("[data-composition='final']");
  const background = stage.querySelector<HTMLElement>("[data-stage-background]");

  if (!hero || !manifesto || !media || !takeover || !culture || !final || !background) {
    return null;
  }

  const heroTitle = select<HTMLElement>(".hero-title");
  const heroLines = select<HTMLElement>(".hero-title .kinetic-text__line");
  const heroObjects = select<HTMLElement>(".hero-object");
  const heroPortal = select<HTMLElement>(".hero-portal");
  const heroCopy = select<HTMLElement>(".hero-manifesto, .hero-scroll-cue, .hero-kicker");
  const manifestoLines = select<HTMLElement>(".manifesto-title .kinetic-text__line");
  const manifestoSupporting = select<HTMLElement>(".manifesto-copy, .manifesto-stamp, .manifesto-surface");
  const manifestoHandoff = select<HTMLElement>(".manifesto-handoff");
  const mediaCards = Array.from(select<HTMLElement>(".media-card"));
  const mediaTitle = select<HTMLElement>(".media-title");
  const mediaCopy = select<HTMLElement>(".media-copy, .media-kicker");
  const mediaBackground = select<HTMLElement>(".media-background-word");
  const mediaToken = select<HTMLElement>(".media-transfer-token");
  const takeoverNumber = select<HTMLElement>(".takeover-number");
  const takeoverContent = select<HTMLElement>(".takeover-kicker, .takeover-title, .takeover-copy, .takeover-token");
  const takeoverSweep = select<HTMLElement>(".takeover-sweep");
  const cultureTitle = select<HTMLElement>(".culture-title");
  const cultureCopy = select<HTMLElement>(".culture-copy, .culture-kicker");
  const cultureObjects = Array.from(select<HTMLElement>(".culture-object"));
  const cultureForeground = select<HTMLElement>(".culture-foreground");
  const cultureHandoff = select<HTMLElement>(".culture-final-handoff");
  const finalTitle = select<HTMLElement>(".final-title");
  const finalCopy = select<HTMLElement>(".final-copy, .final-kicker");
  const finalLockup = select<HTMLElement>(".final-cta-lockup");
  const finalActions = select<HTMLElement>(".final-actions, .final-credit");
  const largeTakeoverScale = compact ? 3.2 : 5.4;
  const foregroundScale = compact ? 2.35 : 4.1;

  const master = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: track,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * (compact ? MASTER_SCROLL_VH.compact : MASTER_SCROLL_VH.desktop))}`,
      pin: stage,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  Object.entries(masterTimelineLabels).forEach(([label, position]) => master.addLabel(label, position));

  master
    .set(background, { backgroundColor: "#10111b" }, 0)
    .set([manifesto, media, takeover, culture, final], { autoAlpha: 0 }, 0)
    .set([heroTitle, heroObjects, heroPortal, heroCopy], { transformOrigin: "50% 50%" }, 0)
    .set(manifestoLines, { autoAlpha: 0, yPercent: 56, scale: 0.76 }, 0)
    .set(manifestoSupporting, { autoAlpha: 0, xPercent: 18 }, 0)
    .set(manifestoHandoff, { autoAlpha: 0, scale: 0.4, rotation: -16 }, 0)
    .set(mediaCards, { autoAlpha: 0 }, 0)
    .set([mediaTitle, mediaCopy, mediaBackground, mediaToken], { autoAlpha: 0 }, 0)
    .set(takeoverNumber, { autoAlpha: 0, scale: 0.26 }, 0)
    .set([takeoverContent, takeoverSweep], { autoAlpha: 0 }, 0)
    .set([cultureTitle, cultureCopy, cultureObjects, cultureForeground, cultureHandoff], { autoAlpha: 0 }, 0)
    .set([finalTitle, finalCopy, finalLockup, finalActions], { autoAlpha: 0 }, 0)
    .to(heroObjects, {
      xPercent: (index) => (index % 2 ? -18 : 16),
      yPercent: (index) => (index % 2 ? 15 : -13),
      rotation: (index) => (index % 2 ? -11 : 11),
      duration: 9,
    }, 2)
    .to(heroTitle, { scale: 1.08, rotation: -1.5, duration: 8 }, 5)
    .to(heroTitle, { scale: largeTakeoverScale, xPercent: -10, yPercent: -13, rotation: -6, duration: 10 }, 13)
    .to(heroLines, { xPercent: (index) => (index ? 42 : -32), duration: 9 }, 14)
    .to(heroObjects, {
      xPercent: (index) => (index % 2 ? -185 : 170),
      yPercent: (index) => (index % 2 ? 120 : -115),
      scale: (index) => (index === 0 ? foregroundScale : 1.8),
      rotation: (index) => (index % 2 ? -96 : 88),
      duration: 9,
    }, 14)
    .to(heroPortal, { scale: compact ? 7.5 : 13, rotation: -10, xPercent: 10, duration: 10 }, 13)
    .to(heroCopy, { xPercent: -70, autoAlpha: 0, duration: 5 }, 15)
    .to(background, { backgroundColor: "#d9ff32", duration: 10 }, 13)
    .set(manifesto, { autoAlpha: 1 }, 15)
    .to(manifestoLines, {
      autoAlpha: 1,
      yPercent: 0,
      scale: 1,
      rotation: (index) => (index ? 2 : -2),
      duration: 8,
      stagger: 0.55,
    }, 16)
    .to(manifestoSupporting, { autoAlpha: 1, xPercent: 0, duration: 6, stagger: 0.25 }, 20)
    .set(hero, { autoAlpha: 0 }, 23)
    .to(manifestoSupporting, { xPercent: (index) => (index ? -10 : 8), duration: 10 }, 25)
    .to(manifestoHandoff, { autoAlpha: 1, scale: 1, rotation: 0, xPercent: -12, duration: 7 }, 30)
    .set(media, { autoAlpha: 1 }, 34)
    .set(mediaBackground, { autoAlpha: 1, scale: 0.72, rotation: 10 }, 35)
    .set(mediaTitle, { autoAlpha: 1, xPercent: 24, yPercent: 16, scale: 0.78 }, 36)
    .set(mediaCopy, { autoAlpha: 1, xPercent: -18, yPercent: -14 }, 37)
    .to(mediaBackground, { scale: 1, rotation: 0, xPercent: -5, duration: 9 }, 37)
    .to(mediaTitle, { xPercent: 0, yPercent: 0, scale: 1, duration: 7 }, 38)
    .to(mediaCopy, { xPercent: 0, yPercent: 0, duration: 5 }, 39)
    .to(background, { backgroundColor: "#ff9dd3", duration: 6 }, 36)
    .fromTo(mediaCards, {
      xPercent: (index) => (index % 2 ? 145 : -145),
      yPercent: (index) => (index % 3 === 0 ? -130 : 125),
      rotation: (index) => (index % 2 ? 28 : -28),
      scale: (index) => (nearCardIndexes.has(index) ? 0.42 : 0.68),
    }, {
      autoAlpha: 1,
      xPercent: 0,
      yPercent: 0,
      rotation: (index) => (index % 2 ? 10 : -10),
      scale: 1,
      duration: 7,
      stagger: 0.42,
    }, 37)
    .to(manifestoHandoff, { scale: 2.4, xPercent: 105, yPercent: -80, rotation: 24, duration: 8 }, 37)
    .to(mediaCards, {
      xPercent: (index) => (farCardIndexes.has(index) ? (index ? 22 : -18) : (index % 2 ? 50 : -45)),
      yPercent: (index) => (farCardIndexes.has(index) ? (index ? -18 : 12) : (index % 2 ? -46 : 38)),
      scale: (index) => (farCardIndexes.has(index) ? 0.9 : nearCardIndexes.has(index) ? 1.28 : 1.12),
      duration: 7,
    }, 44)
    .to(manifestoLines, { autoAlpha: 0, xPercent: -24, duration: 4 }, 39)
    .to(manifestoSupporting, { autoAlpha: 0, yPercent: -24, duration: 4 }, 40)
    .to(mediaCards.filter((_, index) => nearCardIndexes.has(index)), {
      xPercent: (index) => (index ? 210 : -225),
      yPercent: (index) => (index ? -175 : 155),
      scale: foregroundScale,
      rotation: (index) => (index ? 62 : -58),
      duration: 6,
    }, 48)
    .to(mediaCards.filter((_, index) => !nearCardIndexes.has(index)), {
      xPercent: (index) => (index % 2 ? 132 : -132),
      yPercent: (index) => (index % 2 ? -85 : 80),
      autoAlpha: 0,
      duration: 5,
    }, 50)
    .to(mediaCards.filter((_, index) => nearCardIndexes.has(index)), {
      autoAlpha: 0,
      duration: 2,
    }, 51)
    .to(manifestoHandoff, { autoAlpha: 0, xPercent: 155, yPercent: -115, duration: 3 }, 44)
    .set(manifesto, { autoAlpha: 0 }, 47)
    .set(mediaToken, { autoAlpha: 1, scale: 0.5 }, 49)
    .to(mediaToken, { scale: compact ? 6 : 11, rotation: 150, xPercent: -36, yPercent: -22, duration: 10 }, 54)
    .to(mediaTitle, { scale: largeTakeoverScale, xPercent: 55, yPercent: -20, rotation: -8, duration: 10 }, 54)
    .to(mediaCopy, { xPercent: -100, autoAlpha: 0, duration: 4 }, 55)
    .to(mediaBackground, { scale: 2.8, xPercent: -44, duration: 10 }, 54)
    .to(background, { backgroundColor: "#6974ff", duration: 10 }, 54)
    .set(takeover, { autoAlpha: 1 }, 55)
    .to(takeoverNumber, { autoAlpha: 1, scale: 1, rotation: -4, duration: 6 }, 56)
    .to(takeoverContent, { autoAlpha: 1, xPercent: 0, duration: 6, stagger: 0.2 }, 57)
    .set(takeoverSweep, { autoAlpha: 1, xPercent: 110 }, 57)
    .to(takeoverSweep, { xPercent: -130, duration: 8 }, 58)
    .to(takeoverNumber, { scale: compact ? 4.5 : 7.6, xPercent: 12, rotation: -12, duration: 8 }, 59)
    .set(media, { autoAlpha: 0 }, 64)
    .set(manifesto, { autoAlpha: 0 }, 64)
    .to(background, { backgroundColor: "#f6f0e7", duration: 8 }, 64)
    .set(culture, { autoAlpha: 1 }, 62)
    .set(cultureTitle, { autoAlpha: 1, xPercent: -26, yPercent: 30, scale: 0.8 }, 63)
    .set(cultureCopy, { autoAlpha: 1, xPercent: 20 }, 65)
    .fromTo(cultureObjects, {
      xPercent: (index) => (index % 2 ? 165 : -165),
      yPercent: (index) => (index % 2 ? -125 : 115),
      scale: (index) => (index === 2 ? 0.28 : 0.62),
      rotation: (index) => (index % 2 ? 36 : -36),
    }, {
      autoAlpha: 1,
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      rotation: 0,
      duration: 8,
      stagger: 0.35,
    }, 64)
    .to(cultureTitle, { xPercent: 0, yPercent: 0, scale: 1, duration: 7 }, 64)
    .to(cultureCopy, { xPercent: 0, duration: 5 }, 66)
    .to(takeover, { autoAlpha: 0, duration: 1 }, 67)
    .to(cultureObjects, {
      xPercent: (index) => (index === 0 ? -16 : index === 1 ? 25 : index === 2 ? -42 : 20),
      yPercent: (index) => (index === 0 ? 10 : index === 1 ? -22 : index === 2 ? 32 : -18),
      scale: (index) => (index === 0 ? 0.86 : index === 2 ? 1.3 : 1.08),
      duration: 6,
    }, 70)
    .to(cultureForeground, { autoAlpha: 1, xPercent: -20, duration: 5 }, 71)
    .to(cultureObjects[2], { xPercent: -220, yPercent: -160, scale: foregroundScale, rotation: -70, duration: 7 }, 72)
    .to(cultureForeground, { xPercent: -155, scale: compact ? 2.1 : 3.6, duration: 8 }, 73)
    .to(cultureHandoff, { autoAlpha: 1, scale: 1, rotation: 0, xPercent: -8, duration: 6 }, 73)
    .to(background, { backgroundColor: "#10111b", duration: 8 }, 77)
    .set(final, { autoAlpha: 1 }, 75)
    .set(finalTitle, { autoAlpha: 1, scale: 0.78, yPercent: 30 }, 76)
    .set(finalCopy, { autoAlpha: 1, yPercent: 25 }, 78)
    .to(finalTitle, { scale: 1, yPercent: 0, duration: 7 }, 77)
    .to(finalCopy, { yPercent: 0, duration: 5 }, 79)
    .to(cultureHandoff, { scale: 2.3, xPercent: 80, yPercent: -65, rotation: 22, duration: 8 }, 78)
    .to(finalTitle, { scale: largeTakeoverScale, xPercent: -8, yPercent: -12, rotation: 5, duration: 8 }, 84)
    .to(finalCopy, { xPercent: 100, autoAlpha: 0, duration: 4 }, 85)
    .to(culture, { autoAlpha: 0, duration: 1 }, 86)
    .set(finalLockup, { autoAlpha: 1, scale: 0.7, yPercent: 35 }, 89)
    .set(finalActions, { autoAlpha: 1, yPercent: 26 }, 90)
    .to(finalLockup, { scale: 1, yPercent: 0, duration: 6 }, 90)
    .to(finalActions, { yPercent: 0, duration: 6, stagger: 0.18 }, 91)
    .set(finalTitle, { autoAlpha: 0 }, 91)
    .to(background, { backgroundColor: "#171722", duration: 8 }, 92);

  master.eventCallback("onUpdate", () => film.setState(getFilmRoadState(master.progress())));
  film.setState(getFilmRoadState(0));

  return master;
}
