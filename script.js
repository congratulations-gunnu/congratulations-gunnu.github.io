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

    // For debugging: instead of star animation, draw dots showing the sampled
    // pixels that form the word so we can visually verify the outline.
    rocketWrapper.style.display = "none";

    // 1) Draw static dot outline of the word
    drawLetterOutline("Congratulations");

    // Number of dot positions we just created
    const dotCount = document.querySelectorAll('.dot').length;

    // 2) Scatter stars outward with a slightly longer, softer ease-out
    const scatterDuration = 1000; // ms – length of the scatter animation
    spawnStars(scatterDuration, dotCount);

    // 3) Assemble stars onto dot positions once scatter completes
    setTimeout(gatherStarsToDots, scatterDuration + 50);

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
  function spawnStars(scatterMs = 600, numStars = 400) {
    const NUM_STARS = numStars; // align star count to dot count for perfect coverage
    // Spawn from the center of the screen so the explosion looks centered
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight / 2 - 40; // slight upward bias like word center

    for (let i = 0; i < NUM_STARS; i++) {
      const star = document.createElement("span");
      star.className = "star";
      star.textContent = "✦"; // smaller sparkle glyph

      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 120; // px (slightly tighter burst)
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      star.style.left = `${originX}px`;
      star.style.top = `${originY}px`;
      star.style.setProperty("--dx", `${dx}px`);
      star.style.setProperty("--dy", `${dy}px`);
      star.style.fontSize = `${8 + Math.random() * 4}px`; // small, consistent stars

      // Override default animation duration for consistent timing
      star.style.animation = `star-fly ${scatterMs}ms forwards ease-out`;

      document.body.appendChild(star);

      stars.push(star);

      // Remove star element after animation ends ***changed: keep star alive for rearrangement***
      // Give the stars time to rearrange into the word before cleaning up.
      setTimeout(() => {
        star.remove();
      }, 5000); // remove 5s after creation
    }
  }

  // === Assemble stars so each sits on top of a dot ===
  function gatherStarsToDots() {
    const dotEls = Array.from(document.querySelectorAll('.dot'));
    if (!dotEls.length || !stars.length) return;

    // Shuffle dots so mapping looks more random
    for (let i = dotEls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dotEls[i], dotEls[j]] = [dotEls[j], dotEls[i]];
    }

    const dotCount = dotEls.length;

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const dot  = dotEls[i % dotCount];
      const rect = dot.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top  + rect.height / 2;

      // Freeze current scattered position
      const current = star.getBoundingClientRect();
      star.style.transition = "none";
      star.style.transform  = "none";
      star.style.animation  = "none";  // cancel ongoing scatter animation
      star.style.left = `${current.left}px`;
      star.style.top  = `${current.top}px`;

      // Next frame – animate into place
      requestAnimationFrame(() => {
        // Glide stars into position with a longer, smoother curve
        star.style.transition = "left 1.6s cubic-bezier(0.25,0.1,0.25,1), top 1.6s cubic-bezier(0.25,0.1,0.25,1)";
        star.style.left = `${targetX}px`;
        star.style.top  = `${targetY}px`;
      });
    }

    // Once the stars have mostly reached their destinations, gently fade the hidden dots
    setTimeout(() => {
      dotEls.forEach(d => d.style.opacity = 0);
      // Reveal the congratulatory text element with a fade-in
      if (message) {
        message.classList.add('show');
      }
    }, 1600);
  }

  // Map stars to positions forming the given word
  function gatherStarsIntoWord(word) {
    const baseHeight = 120;  // baseline letter height

    // 1. Measure raw text width at baseline height
    const measureCanvas = document.createElement("canvas");
    const mCtx = measureCanvas.getContext("2d");
    mCtx.font = `bold ${baseHeight * 0.7}px Arial`;
    const rawWidth = mCtx.measureText(word).width;

    // 2. Uniformly scale word if it would exceed 80% viewport width
    const maxWidth = window.innerWidth * 0.8;
    const scaleFactor = rawWidth + 40 > maxWidth ? maxWidth / (rawWidth + 40) : 1;

    const canvasHeight = Math.round(baseHeight * scaleFactor);
    const canvasWidth  = Math.ceil((rawWidth + 40) * scaleFactor);

    // 3. Sample pixels (gap 5 for balance of detail / perf)
    const points = textToPoints(word, canvasWidth, canvasHeight, 5);
    if (!points.length) return;

    // Shuffle points so stars map across the whole glyph set randomly
    const shuffled = points.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Choose subset equal to number of stars
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const p = shuffled[i % shuffled.length];

      // convert canvas point to viewport center offset
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2 - 40;
      const targetX = centerX + p.x - canvasWidth / 2;  // center horizontally
      const targetY = centerY + p.y - canvasHeight / 2; // center vertically

      star.dataset.tx = targetX;      //  <-- add this
      star.dataset.ty = targetY;      //  <-- add this

      // Step 1: freeze star at its scatter-end position using left/top coordinates
      const current = star.getBoundingClientRect();
      star.style.transition = "none";
      star.style.transform = "none"; // clear scatter transform
      star.style.left = `${current.left}px`;
      star.style.top  = `${current.top}px`;

      // Step 2 (next frame): animate left/top to the target pixel
      requestAnimationFrame(() => {
        star.style.transition = "left 1.4s ease-in-out, top 1.4s ease-in-out";
        star.style.left = `${targetX}px`;
        star.style.top  = `${targetY}px`;
      });
    }

    // After assigning destinations for all stars, dump debug info once
    window._dbg.__lastPoints = points;      // keep a copy for the console
    saveJSON({
      letterPoints : points,
      starTargets  : stars.map(s => [Number(s.dataset.tx), Number(s.dataset.ty)])
    });
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

   // DEBUG EXPOSE
   /* ---------- DEBUG HOOKS ---------- */
   if (!window._dbg) window._dbg = {};
   // expose helpers the console snippet expects
   window._dbg.textToPoints = textToPoints;
   window._dbg.stars        = stars;

   function saveJSON(obj, filename = 'stars-debug.json') {
     const blob = new Blob([JSON.stringify(obj, null, 2)], {type: 'application/json'});
     const a = document.createElement('a');
     a.href = URL.createObjectURL(blob);
     a.download = filename;
     a.click();
     URL.revokeObjectURL(a.href);
   }
   /* --------------------------------- */

  // Render fixed dots at every sample point so we can see the word outline
  function drawLetterOutline(word) {
    const baseHeight = 360; // slightly larger letters
    const mCv = document.createElement("canvas");
    const mCtx = mCv.getContext("2d");
    mCtx.font = `bold ${baseHeight * 0.7}px Arial`;
    const rawWidth = mCtx.measureText(word).width;
    const letterSpacing = 30; // moderate spacing between characters

    // Re-measure width by summing individual glyph widths + spacing
    let contentWidth = 0;
    for (const ch of word) {
      contentWidth += mCtx.measureText(ch).width + letterSpacing;
    }
    contentWidth -= letterSpacing; // no spacing after last char

    // Scale uniformly to fit in 90% viewport width
    const maxWidth = window.innerWidth * 0.9;
    const scaleFactor = contentWidth + 40 > maxWidth ? maxWidth / (contentWidth + 40) : 1;

    const canvasHeight = Math.round(baseHeight * scaleFactor);
    const canvasWidth  = Math.ceil((contentWidth + 40) * scaleFactor);

    // Build canvas and draw each char with spacing
    const tmp = document.createElement("canvas");
    tmp.width = canvasWidth;
    tmp.height = canvasHeight;
    const ctx = tmp.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = `bold ${canvasHeight * 0.7}px Arial`;

    let cursorX = 0;
    const scaledSpacing = letterSpacing * scaleFactor;
    for (const ch of word) {
      ctx.fillText(ch, cursorX, canvasHeight / 2);
      cursorX += ctx.measureText(ch).width + scaledSpacing;
    }

    // Sample points from the rendered canvas
    const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
    const points = [];
    const gap = 4; // even denser sampling for clearer letters
    for (let y = 0; y < canvasHeight; y += gap) {
      for (let x = 0; x < canvasWidth; x += gap) {
        if (imgData[(y * canvasWidth + x) * 4 + 3] > 128) {
          points.push({ x, y });
        }
      }
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 - 40;

    points.forEach(p => {
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.left = `${centerX + p.x - canvasWidth / 2}px`;
      dot.style.top  = `${centerY + p.y - canvasHeight / 2}px`;
      document.body.appendChild(dot);
    });
  }
})(); 
