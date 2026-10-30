// Heating Engineers London — shared site behaviour

(function () {
  "use strict";

  /* ---------- Mobile nav drawer ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var drawer = document.querySelector(".mobile-drawer");
  var drawerClose = document.querySelector(".mobile-close");
  if (navToggle && drawer) {
    navToggle.addEventListener("click", function () {
      drawer.classList.add("open");
    });
    drawer.addEventListener("click", function (e) {
      if (e.target === drawer) drawer.classList.remove("open");
    });
    if (drawerClose) drawerClose.addEventListener("click", function () {
      drawer.classList.remove("open");
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { drawer.classList.remove("open"); });
    });
  }

  /* ---------- Copy-to-clipboard buttons ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        var original = btn.textContent;
        btn.textContent = "Copied";
        btn.classList.add("copied");
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("copied");
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  });

  function fallbackCopy(text, done) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      done();
    } catch (e) { /* no-op: clipboard unavailable in this viewer */ }
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.getAttribute("data-open") === "true";
      item.closest(".faq-list").querySelectorAll(".faq-item").forEach(function (other) {
        other.setAttribute("data-open", "false");
        other.querySelector(".faq-a").style.maxHeight = "0px";
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.setAttribute("data-open", "true");
        a.style.maxHeight = a.scrollHeight + 24 + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Lead / quote form validation ---------- */
  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    var success = form.parentElement.querySelector(".form-success");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("input[required], select[required], textarea[required]").forEach(function (field) {
        field.setAttribute("data-touched", "true");
        var errEl = field.closest(".field") ? field.closest(".field").querySelector(".err") : null;
        if (!field.checkValidity()) {
          valid = false;
          if (errEl) errEl.textContent = field.validationMessage || "Please fill in this field.";
        } else if (errEl) {
          errEl.textContent = "";
        }
      });
      if (!valid) {
        var firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      form.classList.add("hide");
      if (success) success.classList.add("show");
    });
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("blur", function () { field.setAttribute("data-touched", "true"); });
    });
  });

  /* ---------- Mini hero quote form -> scrolls to full form ---------- */
  document.querySelectorAll("form[data-mini-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var target = document.querySelector("#quote");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Animated boiler/pipe "showreel" motion graphic ---------- */
  var canvas = document.querySelector("#showreelCanvas");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h;
    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var t = 0;
    var dropletPulse = 0;

    function drawPipe(y) {
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    function drawFlow(y, offset, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.setLineDash([18, 14]);
      ctx.lineDashOffset = -offset;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawBoiler(cx, cy) {
      var bw = 92, bh = 118;
      ctx.fillStyle = "#13233c";
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 10);
      ctx.fill(); ctx.stroke();

      // display
      ctx.fillStyle = "rgba(93,154,232,0.9)";
      roundRect(cx - bw / 2 + 14, cy - bh / 2 + 14, bw - 28, 26, 5);
      ctx.fill();

      // flame glow, pulsing
      var pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
      var grad = ctx.createRadialGradient(cx, cy + 30, 2, cx, cy + 30, 26 + pulse * 6);
      grad.addColorStop(0, "rgba(255,138,92," + (0.85) + ")");
      grad.addColorStop(1, "rgba(255,138,92,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy + 30, 26 + pulse * 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = "600 10px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("54°C", cx, cy - bh / 2 + 32);
    }

    function roundRect(x, y, w2, h2, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w2, y, x + w2, y + h2, r);
      ctx.arcTo(x + w2, y + h2, x, y + h2, r);
      ctx.arcTo(x, y + h2, x, y, r);
      ctx.arcTo(x, y, x + w2, y, r);
      ctx.closePath();
    }

    function drawRadiator(x, y) {
      var rw = 58, rh = 44;
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2;
      roundRect(x, y, rw, rh, 6);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      for (var i = 1; i < 6; i++) {
        var lx = x + (rw / 6) * i;
        ctx.beginPath();
        ctx.moveTo(lx, y + 4);
        ctx.lineTo(lx, y + rh - 4);
        ctx.stroke();
      }
      var heat = 0.5 + 0.5 * Math.sin(t * 2.4 - 1);
      ctx.fillStyle = "rgba(255,138,92," + (0.12 + heat * 0.18) + ")";
      roundRect(x, y, rw, rh, 6);
      ctx.fill();
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      var midY = h * 0.52;
      drawPipe(midY);
      drawFlow(midY, t * 40, "rgba(255,138,92,0.85)");
      drawBoiler(w * 0.5, midY);
      drawRadiator(w * 0.1, midY - 22);
      drawRadiator(w * 0.82, midY - 22);

      // rising heat particles
      dropletPulse += reduceMotion ? 0 : 0.35;
      for (var i = 0; i < 10; i++) {
        var px = (w * 0.5) + Math.sin(i * 1.7 + t) * 50;
        var py = (midY - 10 - ((t * 26 + i * 24) % 140));
        var alpha = Math.max(0, 1 - ((t * 26 + i * 24) % 140) / 140);
        ctx.fillStyle = "rgba(255,170,120," + (alpha * 0.5) + ")";
        ctx.beginPath();
        ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      t += reduceMotion ? 0 : 0.016;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Rule-based chat widget ---------- */
  var launcher = document.querySelector(".chat-launcher");
  var panel = document.querySelector(".chat-panel");
  var closeBtn = document.querySelector(".chat-close");
  var body = document.querySelector(".chat-body");
  var form = document.querySelector(".chat-input-row");
  var input = form ? form.querySelector("input") : null;
  var chipsWrap = document.querySelector(".chat-suggestions");

  var PHONE_DISPLAY = "020 3637 8943";
  var EMAIL = "service@heatingengineerslondon.com";

  var RULES = [
    { k: ["boiler", "broken", "breakdown", "not working", "no heat", "no hot water"],
      r: "Sorry to hear that. We handle boiler breakdowns, repairs and installations across London. For anything urgent, the fastest route is to call " + PHONE_DISPLAY + " directly — our team can talk you through next steps." },
    { k: ["emergency", "urgent", "leak", "leaking", "burst"],
      r: "For an active leak or urgent fault, please call us straight away on " + PHONE_DISPLAY + ". This chat is for general questions and can't dispatch an engineer on its own." },
    { k: ["area", "areas", "cover", "location", "postcode", "near me"],
      r: "We cover London-wide — Central, North, East, South East, South West, West and North West London. Tell us your postcode when you call or use the quote form and we'll confirm availability." },
    { k: ["price", "cost", "quote", "how much", "charge", "rate"],
      r: "Pricing depends on the job, but quotes are free and no-obligation. The quickest way to get a number is the quote form on this page, or call " + PHONE_DISPLAY + "." },
    { k: ["gas safe", "qualified", "certified", "registered", "accredited"],
      r: "Our engineers are Gas Safe registered and work across plumbing, heating and boiler repairs. If you'd like to see a specific engineer's Gas Safe ID before a visit, just ask when you book." },
    { k: ["book", "appointment", "schedule", "visit", "available", "when can"],
      r: "You can request a time through the quote form on this page and we'll confirm by phone or email, or call " + PHONE_DISPLAY + " to book directly." },
    { k: ["service", "services", "what do you do", "plumbing", "heating", "radiator", "power flush", "heat pump", "drain"],
      r: "We cover central heating installation & repair, boiler installation & repair, general plumbing, power flushing, radiators, air source heat pumps, drain unblocking and commercial heating maintenance. See the Services page for details." },
    { k: ["email", "contact", "reach you"],
      r: "You can reach us by phone on " + PHONE_DISPLAY + " or email " + EMAIL + ". There's also a quote form on the Contact page." },
    { k: ["hello", "hi", "hey"],
      r: "Hi there! I can point you to the right service, service area or booking info — what do you need help with?" },
    { k: ["thank", "thanks", "cheers"],
      r: "You're welcome! If anything else comes up, call " + PHONE_DISPLAY + " and the team will help directly." }
  ];
  var FALLBACK = "I'm a simple assistant and can only help with general questions about services, areas and booking. For anything specific, please call " + PHONE_DISPLAY + " or email " + EMAIL + ".";

  function addMsg(text, who) {
    if (!body) return;
    var el = document.createElement("div");
    el.className = "msg " + who;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function reply(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < RULES.length; i++) {
      for (var j = 0; j < RULES[i].k.length; j++) {
        if (lower.indexOf(RULES[i].k[j]) !== -1) {
          return RULES[i].r;
        }
      }
    }
    return FALLBACK;
  }

  function send(text) {
    if (!text.trim()) return;
    addMsg(text, "user");
    setTimeout(function () { addMsg(reply(text), "bot"); }, 420);
  }

  if (launcher && panel) {
    launcher.addEventListener("click", function () {
      panel.classList.toggle("open");
      if (panel.classList.contains("open") && input) input.focus();
    });
  }
  if (closeBtn && panel) {
    closeBtn.addEventListener("click", function () { panel.classList.remove("open"); });
  }
  if (form && input) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      send(input.value);
      input.value = "";
    });
  }
  if (chipsWrap) {
    chipsWrap.querySelectorAll(".chat-chip").forEach(function (chip) {
      chip.addEventListener("click", function () { send(chip.textContent); });
    });
  }
})();
