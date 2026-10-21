/*
 * Klok marketing site — interactivity (Option C — dark + colour blocks)
 *
 * The reference mockup drives every `{{clock}}` placeholder from one
 * shared, ever-increasing elapsed-time value (see its own
 * `componentDidMount` timer). Reproduced here as a single real
 * `setInterval` that stamps every live clock element on the page each
 * second — same idea, not the mockup's own runtime.
 */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Shared live "elapsed time" clocks ---------- */

  var CLOCK_IDS = ["app-track-clock"];

  var clockEls = CLOCK_IDS.map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);

  if (clockEls.length) {
    var elapsedSeconds = 0;

    var pad = function (n) {
      return String(n).padStart(2, "0");
    };

    var formatElapsed = function (totalSeconds) {
      var hours = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;
      return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
    };

    var tickClocks = function () {
      var formatted = formatElapsed(elapsedSeconds);
      clockEls.forEach(function (el) {
        el.textContent = formatted;
      });
      elapsedSeconds += 1;
    };

    tickClocks();
    setInterval(tickClocks, 1000);
  }

  /* ---------- Nav bar scroll state ---------- */

  var nav = document.getElementById("site-nav");

  if (nav) {
    var SCROLL_THRESHOLD = 8;

    var updateNavState = function () {
      if (window.scrollY > SCROLL_THRESHOLD) {
        nav.classList.add("is-scrolled");
      } else {
        nav.classList.remove("is-scrolled");
      }
    };

    updateNavState();
    window.addEventListener("scroll", updateNavState, { passive: true });
  }

  /* ---------- Scroll-triggered reveals ---------- */

  var revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
      );

      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* ---------- Magnetic primary buttons ---------- */

  var supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
  var magneticEls = document.querySelectorAll(".btn-primary");

  if (magneticEls.length && supportsFinePointer && !prefersReducedMotion) {
    var MAGNET_STRENGTH = 0.2;
    var MAGNET_MAX_PX = 8;

    var clampMagnet = function (value) {
      return Math.max(-MAGNET_MAX_PX, Math.min(MAGNET_MAX_PX, value));
    };

    magneticEls.forEach(function (el) {
      el.addEventListener("pointermove", function (event) {
        var rect = el.getBoundingClientRect();
        var relX = event.clientX - (rect.left + rect.width / 2);
        var relY = event.clientY - (rect.top + rect.height / 2);

        el.style.transform =
          "translate(" +
          clampMagnet(relX * MAGNET_STRENGTH) +
          "px, " +
          clampMagnet(relY * MAGNET_STRENGTH) +
          "px)";
      });

      el.addEventListener("pointerleave", function () {
        el.style.transform = "translate(0, 0)";
      });
    });
  }

  /* ---------- Hero background: live day dial ----------
   * A looping (24s) animation of a tracked day: per-client arcs on the
   * dial fill in as a sweeping hand advances from 09:00 to 18:00, then
   * a statement card reveals before the loop resets. Mirrors a design
   * reference's React logic (temp files/Hero BG · 4++++ Day dial, glass
   * background-html.zip) in vanilla JS against static SVG markup.
   */

  var dialRingsEl = document.getElementById("hero-dial-rings");

  if (dialRingsEl) {
    var SVG_NS = "http://www.w3.org/2000/svg";
    var D0 = 540, D1 = 1080, SWEEP = 324; // 09:00-18:00, in minutes, over a 324deg sweep
    var DAY_MS = 18000, LOOP_MS = 24000, STROKE_W = 34;

    var DIAL_DATA = [
      {
        name: "Acme Co. · Brand refresh",
        color: "var(--color-dial-a)",
        r: 384,
        bars: [["09:15", "11:00"], ["11:15", "12:00"], ["13:30", "15:00"], ["16:00", "17:15"]]
      },
      {
        name: "TechCorp · Onboarding flow",
        color: "var(--color-dial-b)",
        r: 326,
        bars: [["09:00", "10:30"], ["10:45", "11:30"], ["12:45", "14:45"], ["15:15", "15:45"]]
      },
      {
        name: "Greenfield Ltd. · Kickoff",
        color: "var(--color-dial-c)",
        r: 268,
        bars: [["14:00", "16:30"]]
      },
      {
        name: "Admin",
        color: "var(--color-dial-admin)",
        r: 210,
        bars: [["12:00", "12:45"], ["17:15", "18:00"]]
      }
    ];

    var toMinutes = function (hhmm) {
      var parts = hhmm.split(":");
      return Number(parts[0]) * 60 + Number(parts[1]);
    };

    var ringEls = [];
    var segmentEls = DIAL_DATA.map(function (client) {
      var ring = document.createElementNS(SVG_NS, "g");
      ring.setAttribute("class", "hero-dial-ring");

      var track = document.createElementNS(SVG_NS, "circle");
      track.setAttribute("r", client.r);
      track.setAttribute("stroke-width", STROKE_W);
      track.setAttribute("class", "hero-dial-track");
      ring.appendChild(track);

      var bars = client.bars.map(function () {
        var ghost = document.createElementNS(SVG_NS, "circle");
        ghost.setAttribute("r", client.r);
        ghost.setAttribute("stroke-width", STROKE_W);
        ghost.setAttribute("stroke-linecap", "round");
        ghost.setAttribute("transform", "rotate(-90)");
        ghost.setAttribute("class", "hero-dial-ghost");
        ring.appendChild(ghost);

        var fill = document.createElementNS(SVG_NS, "circle");
        fill.setAttribute("r", client.r);
        fill.setAttribute("stroke-width", STROKE_W);
        fill.setAttribute("stroke-linecap", "round");
        fill.setAttribute("transform", "rotate(-90)");
        fill.setAttribute("class", "hero-dial-seg");
        fill.style.stroke = client.color;
        ring.appendChild(fill);

        return { ghost: ghost, fill: fill };
      });

      dialRingsEl.appendChild(ring);
      ringEls.push(ring);
      return bars;
    });

    var handEl = document.getElementById("hero-dial-hand");
    var clientChipEl = document.getElementById("hero-client-chip");
    var clientLabelEl = document.getElementById("hero-client-label");
    var whoNameEl = document.getElementById("hero-who-name");
    var whoDotEl = document.getElementById("hero-who-dot");
    var clientSuffixEl = document.getElementById("hero-client-suffix");
    var clientRowEl = document.getElementById("hero-client-row");
    var lastClientKey = "";

    var renderDial = function (elapsedMs) {
      var t = elapsedMs % LOOP_MS;
      var play = Math.min(D1, D0 + (t / DAY_MS) * (D1 - D0));
      var showStatement = t >= DAY_MS + 400;
      var who = { name: "Break", color: "var(--color-dial-admin)" };

      DIAL_DATA.forEach(function (client, clientIndex) {
        var circumference = 2 * Math.PI * client.r;
        var perMinute = (circumference * SWEEP / 360) / (D1 - D0);

        client.bars.forEach(function (bar, barIndex) {
          var start = toMinutes(bar[0]);
          var end = toMinutes(bar[1]);

          if (play >= start && play < end) {
            who = { name: client.name, color: client.color };
          }

          var elapsedInBar = Math.max(0, Math.min(play, end) - start);
          var ghostLength = Math.max(0, (end - start) * perMinute - STROKE_W);
          var fillLength = Math.max(0, elapsedInBar * perMinute - STROKE_W);
          var offset = (-(start - D0) * perMinute - STROKE_W / 2).toFixed(1);

          var els = segmentEls[clientIndex][barIndex];
          els.ghost.setAttribute("stroke-dasharray", ghostLength.toFixed(1) + " " + circumference.toFixed(1));
          els.ghost.setAttribute("stroke-dashoffset", offset);
          els.fill.setAttribute("stroke-dasharray", fillLength.toFixed(1) + " " + circumference.toFixed(1));
          els.fill.setAttribute("stroke-dashoffset", offset);
          els.fill.style.opacity = fillLength > 0 ? 0.92 : 0;
        });

        ringEls[clientIndex].classList.toggle("dim", showStatement && clientIndex !== 0);
      });

      if (play >= D1) {
        who = { name: "Day done", color: "var(--color-mint)" };
      }

      if (handEl) {
        handEl.setAttribute("transform", "rotate(" + (((play - D0) / (D1 - D0)) * SWEEP).toFixed(2) + ")");
      }

      // One chip, two states: "Now working on <client>" while the day
      // plays out, then it swaps in place to "Statement" once the day
      // completes, instead of a second card appearing elsewhere.
      var label = showStatement ? "Statement" : "Now working on";
      var dotColor = showStatement ? DIAL_DATA[0].color : who.color;
      var nameText = showStatement ? DIAL_DATA[0].name.split(" · ")[0] : who.name;
      var suffixText = showStatement ? "Sent to your Google Sheet →" : "";
      var key = label + "|" + nameText + "|" + suffixText;

      if (clientLabelEl && whoNameEl && whoDotEl && clientSuffixEl) {
        if (key !== lastClientKey) {
          lastClientKey = key;
          if (clientRowEl) {
            clientRowEl.style.opacity = "0";
          }
          clientSuffixEl.style.opacity = "0";
          setTimeout(function () {
            clientLabelEl.textContent = label;
            whoDotEl.style.background = dotColor;
            whoNameEl.textContent = nameText;
            clientSuffixEl.textContent = suffixText;
            if (clientRowEl) {
              clientRowEl.style.opacity = "1";
            }
            clientSuffixEl.style.opacity = "1";
          }, 150);
        }
      }
      if (clientChipEl) {
        clientChipEl.classList.toggle("is-statement", showStatement);
      }
    };

    if (prefersReducedMotion) {
      renderDial(DAY_MS + 1000);
    } else {
      var dialStart = Date.now();
      renderDial(0);
      setInterval(function () {
        renderDial(Date.now() - dialStart);
      }, 100);
    }
  }

  /* ---------- Hero background: pointer parallax ----------
   * Bound to the whole hero + How-it-works group, not just the hero
   * header — the dial/scrim now visually extend across both (see the
   * .hero-bg markup comment in index.html), so hovering the How-it-works
   * band should drive the same tilt/parallax/spotlight response. */

  var heroEl = document.getElementById("intro-group");
  var heroBgBack = document.getElementById("hero-bg-back");
  var heroBgFront = document.getElementById("hero-bg-front");
  var dialWrapEl = document.getElementById("hero-dial-wrap");
  var dialSpotlightEl = document.getElementById("hero-dial-spotlight");

  if (heroEl && heroBgBack && heroBgFront && supportsFinePointer && !prefersReducedMotion) {
    var MAX_TILT_DEG = 7;

    heroEl.addEventListener("pointermove", function (event) {
      var rect = heroEl.getBoundingClientRect();
      var relX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      var relY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      heroBgBack.style.transform = "translate(" + (relX * -10).toFixed(1) + "px, " + (relY * -10).toFixed(1) + "px)";
      heroBgFront.style.transform = "translate(" + (relX * 22).toFixed(1) + "px, " + (relY * 22).toFixed(1) + "px)";

      // The dial also tilts in 3D toward the cursor (independent of the
      // layer-level translate above), and a soft highlight follows the
      // cursor across its own surface — so hovering feels like touching
      // the dial itself, not just panning a flat background image.
      if (dialWrapEl) {
        var tiltY = (relX * MAX_TILT_DEG).toFixed(2);
        var tiltX = (relY * -MAX_TILT_DEG).toFixed(2);
        dialWrapEl.style.transform =
          "translate(-50%, -50%) perspective(1200px) rotateX(" + tiltX + "deg) rotateY(" + tiltY + "deg)";
      }

      if (dialSpotlightEl) {
        var dialRect = dialWrapEl.getBoundingClientRect();
        var spotX = ((event.clientX - dialRect.left) / dialRect.width) * 100;
        var spotY = ((event.clientY - dialRect.top) / dialRect.height) * 100;
        dialSpotlightEl.style.setProperty("--spot-x", spotX.toFixed(1) + "%");
        dialSpotlightEl.style.setProperty("--spot-y", spotY.toFixed(1) + "%");
        dialSpotlightEl.classList.add("is-active");
      }
    });

    heroEl.addEventListener("pointerleave", function () {
      heroBgBack.style.transform = "translate(0, 0)";
      heroBgFront.style.transform = "translate(0, 0)";
      if (dialWrapEl) {
        dialWrapEl.style.transform = "translate(-50%, -50%)";
      }
      if (dialSpotlightEl) {
        dialSpotlightEl.classList.remove("is-active");
      }
    });
  }

  /* ---------- Setup: live scenes ---------- */

  // Scene 1's sheet: a yellow header row, an orange key column and ghost
  // cells, each fading in on a staggered delay (diagonal wave).
  var setupGridEl = document.getElementById("setup-grid");

  if (setupGridEl) {
    var SETUP_ROWS = 7;
    var SETUP_COLS = 10;
    var SETUP_PITCH = 26;

    for (var row = 0; row < SETUP_ROWS; row++) {
      for (var col = 0; col < SETUP_COLS; col++) {
        var cell = document.createElement("span");
        var kind = row === 0 ? "head" : col === 0 ? "key" : "ghost";
        cell.className = "setup-cell setup-cell--" + kind;
        cell.style.left = 10 + col * SETUP_PITCH + "px";
        cell.style.top = 10 + row * SETUP_PITCH + "px";
        cell.style.animationDelay = (row * 0.072 + col * 0.06).toFixed(2) + "s";
        setupGridEl.appendChild(cell);
      }
    }
  }

  var setupLayoutEl = document.querySelector(".setup-layout");
  var setupObserver = null;

  var startSetupLoop = function () {
    setupLayoutEl.classList.add("is-playing");
    if (setupObserver) {
      setupObserver.disconnect();
    }
  };

  // Start the loop at step 1 when the section first scrolls into view.
  if (setupLayoutEl && !prefersReducedMotion) {
    if ("IntersectionObserver" in window) {
      setupObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              startSetupLoop();
            }
          });
        },
        { threshold: 0.3 }
      );
      setupObserver.observe(setupLayoutEl);
    } else {
      startSetupLoop();
    }
  }

  // Clicking a step jumps the loop to its scene. While the steps or the
  // stage are hovered (or a step has keyboard focus), the current scene plays out
  // and then holds instead of moving on.
  var setupListEl = setupLayoutEl && setupLayoutEl.querySelector(".setup-list");
  var setupStageEl = setupLayoutEl && setupLayoutEl.querySelector(".setup-stage");

  if (setupListEl && setupStageEl) {
    var setupRows = Array.prototype.slice.call(
      setupListEl.querySelectorAll(".setup-row")
    );

    // Must match the 22s keyframes in styles.css: when each scene is fully
    // in, and when it starts to fade out (ms into the loop).
    var SETUP_LOOP_MS = 22000;
    var SETUP_STEPS = [
      { start: 0, end: 3600, leave: 4000 },
      { start: 4300, end: 7600, leave: 8000 },
      { start: 8300, end: 11600, leave: 12000 },
      { start: 12300, end: 15600, leave: 16000 },
      { start: 16300, end: 20500, leave: SETUP_LOOP_MS }
    ];

    var canSeek =
      !prefersReducedMotion && typeof setupLayoutEl.getAnimations === "function";

    var setupAnims = function () {
      return setupLayoutEl.getAnimations({ subtree: true });
    };

    // Scene 1 has no delay, so its animation doubles as the loop clock.
    var setupClock = function () {
      var anims = setupStageEl.querySelector(".setup-scene--1").getAnimations();
      var ms = anims.length ? Number(anims[0].currentTime) || 0 : 0;
      var t = ms % SETUP_LOOP_MS;
      return { base: ms - t, t: t };
    };

    var setupStepAt = function (t) {
      for (var i = 0; i < SETUP_STEPS.length; i++) {
        if (t < SETUP_STEPS[i].leave) {
          return i;
        }
      }
      return 0;
    };

    var seekSetup = function (ms, pause) {
      var base = setupClock().base;
      setupAnims().forEach(function (anim) {
        if (pause) {
          anim.pause();
        }
        anim.currentTime = base + ms;
        if (!pause) {
          anim.play();
        }
      });
    };

    var setupHeld = false;
    var setupHoldStep = 0;
    var setupHoldFrame = 0;

    var holdTick = function () {
      setupHoldFrame = 0;
      if (!setupHeld) {
        return;
      }
      var end = SETUP_STEPS[setupHoldStep].end;
      if (setupClock().t >= end) {
        seekSetup(end, true);
        return;
      }
      setupHoldFrame = requestAnimationFrame(holdTick);
    };

    var startHold = function () {
      if (!canSeek || setupHeld) {
        return;
      }
      startSetupLoop();
      setupHeld = true;
      var t = setupClock().t;
      setupHoldStep = setupStepAt(t);
      // Mid cross-fade into step 1: restart it rather than freeze the fade.
      if (t >= SETUP_STEPS[SETUP_STEPS.length - 1].end) {
        setupHoldStep = 0;
        seekSetup(0, false);
      }
      holdTick();
    };

    var endHold = function () {
      if (!setupHeld) {
        return;
      }
      setupHeld = false;
      cancelAnimationFrame(setupHoldFrame);
      setupAnims().forEach(function (anim) {
        anim.play();
      });
    };

    var isSetupHovered = function () {
      return setupListEl.matches(":hover") || setupStageEl.matches(":hover");
    };

    [setupListEl, setupStageEl].forEach(function (el) {
      el.addEventListener("pointerenter", startHold);
      el.addEventListener("pointerleave", function () {
        if (!isSetupHovered() && !setupListEl.querySelector(":focus-visible")) {
          endHold();
        }
      });
    });

    // Keyboard focus only — a mouse click also focuses the title button.
    setupListEl.addEventListener("focusin", function (event) {
      if (event.target.matches(":focus-visible")) {
        startHold();
      }
    });
    setupListEl.addEventListener("focusout", function (event) {
      if (!setupListEl.contains(event.relatedTarget) && !isSetupHovered()) {
        endHold();
      }
    });

    setupRows.forEach(function (row, index) {
      row.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
          return;
        }
        if (!canSeek) {
          setupLayoutEl.setAttribute("data-step", String(index + 1));
          return;
        }
        startSetupLoop();
        seekSetup(SETUP_STEPS[index].start, false);
        if (setupHeld) {
          setupHoldStep = index;
          cancelAnimationFrame(setupHoldFrame);
          holdTick();
        }
      });
    });
  }

  /* ---------- Gentle section settling ---------- */

  // Scrolling stays native. Only when a scroll comes to rest just short of
  // a section's top — in the direction you were scrolling — does the page
  // glide that last bit so the section settles under the nav. It never
  // pulls back against your scroll (so it can't trap you), and any new
  // input cancels the glide. (CSS scroll-snap `proximity` was tried: it
  // pulled slow wheel scrolling back at the end of tall sections.)
  var settleSectionEls = document.querySelectorAll("main > .section");
  var settleNavEl = document.querySelector(".nav");
  var settleMedia = window.matchMedia("(min-width: 900px)");

  if (settleSectionEls.length && !prefersReducedMotion) {
    var SETTLE_RANGE = 0.18; // of the window height
    var SETTLE_IDLE_MS = 140;
    var SETTLE_DURATION_MS = 380;

    var settleLastY = window.scrollY;
    var settleDir = 0;
    var settleTimer = 0;
    var settleFrame = 0;

    var settleSetScroll = function (y) {
      var rootStyle = document.documentElement.style;
      rootStyle.scrollBehavior = "auto";
      window.scrollTo(0, y);
      rootStyle.scrollBehavior = "";
    };

    var settleCancel = function () {
      cancelAnimationFrame(settleFrame);
      settleFrame = 0;
    };

    var settleGlide = function (distance) {
      var from = window.scrollY;
      var startAt = performance.now();
      var tick = function (now) {
        var t = Math.min(1, (now - startAt) / SETTLE_DURATION_MS);
        var eased = 1 - Math.pow(1 - t, 3);
        settleSetScroll(from + distance * eased);
        settleFrame = t < 1 ? requestAnimationFrame(tick) : 0;
        if (!settleFrame) {
          settleLastY = window.scrollY;
        }
      };
      settleFrame = requestAnimationFrame(tick);
    };

    var settle = function () {
      if (!settleMedia.matches || settleFrame || !settleDir) {
        return;
      }
      var navH = settleNavEl ? settleNavEl.offsetHeight : 0;
      var range = window.innerHeight * SETTLE_RANGE;
      var best = null;
      Array.prototype.forEach.call(settleSectionEls, function (el) {
        // How far the section's top is from the nav's bottom edge.
        var offset = el.getBoundingClientRect().top - navH;
        var ahead = settleDir > 0 ? offset > 1 && offset <= range : offset < -1 && offset >= -range;
        if (ahead && (best === null || Math.abs(offset) < Math.abs(best))) {
          best = offset;
        }
      });
      if (best !== null) {
        settleGlide(best);
      }
    };

    window.addEventListener(
      "scroll",
      function () {
        if (settleFrame) {
          return; // our own glide
        }
        var y = window.scrollY;
        if (y !== settleLastY) {
          settleDir = y > settleLastY ? 1 : -1;
        }
        settleLastY = y;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(settle, SETTLE_IDLE_MS);
      },
      { passive: true }
    );

    ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (type) {
      window.addEventListener(type, settleCancel, { passive: true });
    });
  }

})();
