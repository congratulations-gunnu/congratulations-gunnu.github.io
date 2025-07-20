// Move the rocket upward as the user scrolls and trigger a burst at the end.

(function () {
  const rocket = document.getElementById("rocket");
  const rocketWrapper = document.getElementById("rocket-wrapper");
  const explosion = document.getElementById("explosion");

  if (!rocket || !rocketWrapper || !explosion) return;

  // Convenience for throttling scroll events
  let ticking = false;

  function onScroll() {
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0; // clamp 0-1

    // Travel distance: move rocket slightly more than full viewport so it fully exits
    const travel = window.innerHeight * 1.1 + rocket.offsetHeight;
    const translateY = -progress * travel; // px units

    // Update vertical offset via CSS variable on the wrapper
    rocketWrapper.style.setProperty("--ty", `${translateY}px`);

    // If near the top (>= 95% progress) and not yet burst
    if (progress >= 0.95 && !rocket.classList.contains("burst")) {
      triggerBurst();
    }

    ticking = false;
  }

  function triggerBurst() {
    // Make rocket burst
    rocket.classList.add("burst");

    // Show explosion overlay
    explosion.classList.add("active");

    // Clean up explosion overlay after animation ends
    explosion.addEventListener(
      "animationend",
      () => {
        explosion.classList.remove("active");
      },
      { once: true }
    );
  }

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