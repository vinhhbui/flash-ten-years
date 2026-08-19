(function initializeScrollReference() {
  const path = document.querySelector(".path-progress");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!path) {
    return;
  }

  const pathLength = path.getTotalLength();

  if (!Number.isFinite(pathLength) || pathLength <= 0) {
    path.style.strokeDashoffset = "0";
    return;
  }

  if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
    path.style.strokeDasharray = "none";
    path.style.strokeDashoffset = "0";
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.set(path, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  });

  gsap.to(path, {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".page",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });

  gsap.utils.toArray("[data-reveal]").forEach((element) => {
    gsap.from(element, {
      autoAlpha: 0,
      y: 34,
      duration: 0.75,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 82%",
        toggleActions: "play none none reverse",
      },
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}());
