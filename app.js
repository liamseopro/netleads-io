/* NET LEADS — shared behavior */
(function () {
  "use strict";

  /* ---- nav: solid on scroll ---- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- mobile drawer ---- */
  var burger = document.querySelector(".nav__burger");
  var drawer = document.querySelector(".drawer");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (drawer) drawer.setAttribute("aria-hidden", open ? "false" : "true");
  }
  if (burger) {
    burger.setAttribute("aria-expanded", "false");
    burger.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
    document.querySelectorAll(".drawer a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  /* ---- scroll reveals ---- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  function reveal(el) { el.classList.add("in"); }
  if ("IntersectionObserver" in window && revealEls.length) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { reveal(e.target); ro.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    var vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach(function (el) {
      // anything already on screen at load reveals immediately (don't wait on IO paint)
      if (el.getBoundingClientRect().top < vh * 0.95) reveal(el);
      else ro.observe(el);
    });
    // failsafe: never leave content hidden (covers throttled/headless renderers
    // where opacity transitions don't tick — print, PDF, screenshot, etc.)
    setTimeout(function () { revealEls.forEach(reveal); }, 2200);
    setTimeout(function () {
      revealEls.forEach(function (el) {
        if (parseFloat(getComputedStyle(el).opacity) < 0.9) {
          el.style.transition = "none";
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
    }, 2600);
  } else {
    revealEls.forEach(reveal);
  }

  /* ---- counters ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = (el.getAttribute("data-dec") || "0") === "1";
    var dur = 1500, start = null;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = dec ? val.toFixed(1) : Math.round(val).toLocaleString();
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = dec ? target.toFixed(1) : Math.round(target).toLocaleString();
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll(".stat [data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    var cvh = window.innerHeight || document.documentElement.clientHeight;
    counters.forEach(function (el) {
      if (el.getBoundingClientRect().top < cvh * 0.9) animateCount(el);
      else co.observe(el);
    });
  }

  /* ---- process steps progressive highlight ---- */
  var steps = document.querySelectorAll(".step");
  if ("IntersectionObserver" in window && steps.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add("is-on"); });
    }, { threshold: 0.6 });
    steps.forEach(function (el) { so.observe(el); });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq__item").forEach(function (item) {
    var q = item.querySelector(".faq__q");
    var a = item.querySelector(".faq__a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = item.classList.contains("is-open");
      // close siblings within same .faq
      var parent = item.closest(".faq");
      if (parent) parent.querySelectorAll(".faq__item.is-open").forEach(function (other) {
        if (other !== item) { other.classList.remove("is-open"); other.querySelector(".faq__a").style.height = "0px"; }
      });
      if (open) { item.classList.remove("is-open"); a.style.height = "0px"; }
      else { item.classList.add("is-open"); a.style.height = a.firstElementChild.offsetHeight + "px"; }
    });
  });
  window.addEventListener("resize", function () {
    document.querySelectorAll(".faq__item.is-open .faq__a").forEach(function (a) {
      a.style.height = a.firstElementChild.offsetHeight + "px";
    });
  });

  /* ---- contact form: validate, then POST to Net Leads webhook (TODO: configure live webhook for netleads.io) ---- */
  var form = document.querySelector(".form");
  if (form) {
    var WEBHOOK_URL = "https://auto.sdagents.ai/webhook/hbm-contact";
    var val = function (name) {
      var el = form.querySelector("[name=" + name + "]");
      return el ? el.value.trim() : "";
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var valid = input.value.trim().length > 0;
        if (input.type === "email") valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value.trim());
        if (!valid) { field.classList.add("err"); ok = false; }
        else field.classList.remove("err");
      });
      if (!ok) return;

      var btn = form.querySelector("[type=submit]");
      var btnHTML = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.style.opacity = "0.65"; btn.innerHTML = "Sending…"; }

      var payload = {
        name: val("name"),
        email: val("email"),
        business: val("business"),
        service: val("service"),
        message: val("message"),
        source_url: window.location.href,
        date: new Date().toLocaleString()
      };

      fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        var okBox = form.parentElement.querySelector(".form__ok");
        if (okBox) okBox.classList.add("show");
        form.reset();
        form.style.display = "none";
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.style.opacity = "1"; btn.innerHTML = btnHTML; }
        var err = form.querySelector(".form__err");
        if (!err) {
          err = document.createElement("p");
          err.className = "form__err";
          err.style.cssText = "color:#d33;font-weight:600;font-size:14px;margin-top:14px;";
          form.appendChild(err);
        }
        err.textContent = "Sorry, something went wrong sending your message. Please email hello@netleads.io directly.";
      });
    });
    form.querySelectorAll("input, textarea, select").forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field) field.classList.remove("err");
      });
    });
  }

  /* ---- current year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
