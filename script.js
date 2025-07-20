// Move the rocket upward as the user scrolls and trigger a burst at the end.

(function () {
  const rocket = document.getElementById("rocket");
  const rocketWrapper = document.getElementById("rocket-wrapper");
  const message = document.getElementById("message");

  if (!rocket || !rocketWrapper) return;

  // Convenience for throttling scroll events
  let ticking = false;
  let exploded = false; // track if explosion already happened
  let interactionStarted = false; // only move after user scrolls
  const stars = []; // store star elements

  function onScroll() {
     if (!interactionStarted) return;
    if (!exploded) {
      // Translate exactly with scroll (1:1)
      const translateY = -window.scrollY;
      rocketWrapper.style.transform = `translateX(-50%) translateY(${translateY}px)`;

      // Explode when rocket touches top edge
      const rect = rocket.getBoundingClientRect();
      // Trigger explosion once the rocket has ascended past roughly 65% of the
      // viewport height (i.e. its top edge is within the top 35% band).
      const triggerThreshold = window.innerHeight * 0.35;
      if (rect.top <= triggerThreshold) {
        triggerExplosion();
      }
    }

    ticking = false;
  }

  function triggerExplosion() {
     if (exploded) return;

    // spawn cute star particles
    spawnStars();

    // instantly hide rocket so no wiggle
    rocketWrapper.style.display = "none";

    // After scatter animation, gather stars into text
    setTimeout(() => {
      gatherStarsIntoWord("CONGRATULATIONS");
      // Removed separate message overlay
    }, 700);

    exploded = true;
  }

  // Removed triggerBurst & explosion overlay handling.

  // Wait for first user scroll
  window.addEventListener("scroll", () => {
    if (!interactionStarted) {
      interactionStarted = true;
    }
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Remove initial onScroll call (no auto move)

  // === Star helpers ===
  function spawnStars() {
    const NUM_STARS = 80;
    const rect = rocket.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < NUM_STARS; i++) {
      const star = document.createElement("span");
      star.className = "star";
      star.textContent = "✨"; // cute star emoji

      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 120; // px
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      star.style.left = `${originX}px`;
      star.style.top = `${originY}px`;
      star.style.setProperty("--dx", `${dx}px`);
      star.style.setProperty("--dy", `${dy}px`);
      star.style.fontSize = `${14 + Math.random() * 12}px`;

      document.body.appendChild(star);

      stars.push(star);

      // Remove star element after animation ends
      star.addEventListener(
        "animationend",
        () => {
          star.remove();
        },
        { once: true }
      );
    }
  }

  // Map stars to positions forming the given word
  function gatherStarsIntoWord(word) {
    // Dynamically size the canvas according to word length so longer words fit.
    const canvasWidth = Math.max(400, word.length * 40); // 40-px per char (min 400)
    const canvasHeight = 120;
    // build target points from canvas
    const points = textToPoints(word, canvasWidth, canvasHeight, 6);
    if (!points.length) return;

    // Choose subset equal to number of stars
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const p = points[i % points.length];

      // convert canvas point to viewport center offset
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2 - 40;
      const targetX = centerX + p.x - canvasWidth / 2; // center horizontally
      const targetY = centerY + p.y - canvasHeight / 2; // center vertically

      requestAnimationFrame(() => {
        // delay to ensure at end of scatter anim
        star.style.transition = "transform 1.2s ease-in-out";
        const currentRect = star.getBoundingClientRect();
        const dx = targetX - currentRect.left;
        const dy = targetY - currentRect.top;
        star.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    }
  }

  // Convert text to point array using canvas sampling
  function textToPoints(text, w, h, gap) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${h * 0.7}px Arial`;
    ctx.fillText(text, w / 2, h / 2);

    const img = ctx.getImageData(0, 0, w, h).data;
    const pts = [];
    for (let y = 0; y < h; y += gap) {
      for (let x = 0; x < w; x += gap) {
        const alpha = img[(y * w + x) * 4 + 3];
        if (alpha > 128) {
          pts.push({ x, y });
        }
      }
    }
    return pts;
  }

  // we removed initial onScroll call so no auto movement
})(); 