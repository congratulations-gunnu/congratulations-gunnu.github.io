// Move the rocket upward as the user scrolls and trigger a burst at the end.

(function () {
  const rocket = document.getElementById("rocket");
  const rocketWrapper = document.getElementById("rocket-wrapper");

  if (!rocket || !rocketWrapper) return;

  // Convenience for throttling scroll events
  let ticking = false;

  function onScroll() {
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0; // clamp 0-1

    // Travel distance: move rocket slightly more than full viewport so it fully exits
    const travel = window.innerHeight * 1.1 + rocket.offsetHeight;
    const translateY = -progress * travel; // px units

    // Directly transform the wrapper (keeps horizontal centering)
    rocketWrapper.style.transform = `translateX(-50%) translateY(${translateY}px)`;

    // No burst/explosion – just translate.

    ticking = false;
  }

  // Removed triggerBurst & explosion overlay handling.

  // Scroll event listener with rAF throttling for smoother performance
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  });

  // Initialise position on page load (in case not at very top)
  onScroll();
})(); 