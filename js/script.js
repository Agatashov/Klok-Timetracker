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

})();
