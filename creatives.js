/* ============================================================
   NET LEADS — CREATIVES HYDRATOR
   Scans [data-creative] elements and builds their inner DOM,
   then creatives.css animates them. Pure vanilla, no deps.
   Re-callable: window.Creatives.hydrate(root)
   ============================================================ */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function div(cls) { var d = document.createElement("div"); if (cls) d.className = cls; return d; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  var builders = {

    /* equalizer spectrum — bars pulse from center */
    spectrum: function (el, o) {
      var n = o.bars || 26;
      var wrap = div("cr-spectrum");
      for (var i = 0; i < n; i++) {
        var b = div("cr-bar");
        b.style.animationDelay = (-rand(0, 1.15)).toFixed(2) + "s";
        b.style.animationDuration = rand(0.85, 1.5).toFixed(2) + "s";
        b.style.opacity = rand(0.6, 1).toFixed(2);
        wrap.appendChild(b);
      }
      el.appendChild(wrap);
    },

    /* oscilloscope waveform */
    wave: function (el) {
      var wrap = div("cr-wave");
      var s = svg("svg", { viewBox: "0 0 400 120", preserveAspectRatio: "none" });
      function wpath(cls, amp, yc, freq) {
        var d = "M0 " + yc, step = 8;
        for (var x = 0; x <= 400; x += step) {
          var y = yc + Math.sin((x / 400) * Math.PI * freq) * amp;
          d += " L" + x + " " + y.toFixed(1);
        }
        return svg("path", { d: d, class: "cr-wpath " + cls });
      }
      s.appendChild(wpath("cr-wpath--3", 14, 60, 12));
      s.appendChild(wpath("cr-wpath--2", 24, 60, 8));
      s.appendChild(wpath("cr-wpath--1", 34, 60, 5));
      wrap.appendChild(s);
      wrap.appendChild(div("cr-scan"));
      el.appendChild(wrap);
    },

    /* sonar rings */
    rings: function (el, o) {
      var n = o.rings || 4, wrap = div("cr-rings");
      for (var i = 0; i < n; i++) {
        var r = div("cr-ring");
        r.style.animationDelay = (i * (3.6 / n)).toFixed(2) + "s";
        wrap.appendChild(r);
      }
      wrap.appendChild(div("cr-core"));
      el.appendChild(wrap);
    },

    /* frequency dot matrix with a sweeping wave */
    matrix: function (el, o) {
      var cols = o.cols || 16, rows = o.rows || 9;
      var wrap = div("cr-matrix");
      wrap.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
      wrap.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var d = div("cr-dot");
          var t = (c / cols) + (r / rows) * 0.35;     // diagonal sweep
          d.style.animationDelay = (-t * 2.6).toFixed(2) + "s";
          wrap.appendChild(d);
        }
      }
      el.appendChild(wrap);
    },

    /* spinning vinyl record */
    vinyl: function (el) {
      var wrap = div("cr-vinyl");
      var disc = div("cr-disc");
      disc.appendChild(div("cr-label"));
      wrap.appendChild(disc);
      el.appendChild(wrap);
    },

    /* connected network graph */
    nodes: function (el, o) {
      var n = o.count || 12, wrap = div("cr-nodes");
      var s = svg("svg", { viewBox: "0 0 100 100", preserveAspectRatio: "none" });
      wrap.appendChild(s);
      var pts = [];
      // a central hub plus scattered nodes
      pts.push({ x: 50, y: 50, hub: true });
      for (var i = 1; i < n; i++) pts.push({ x: rand(10, 90), y: rand(12, 88), hub: false });
      // connect each node to hub + nearest neighbour
      for (var j = 1; j < pts.length; j++) {
        var line = svg("line", {
          x1: pts[0].x, y1: pts[0].y, x2: pts[j].x, y2: pts[j].y,
          class: "cr-link" + (j % 3 === 0 ? " is-live" : "")
        });
        line.style.animationDelay = (-rand(0, 1.6)).toFixed(2) + "s";
        s.appendChild(line);
      }
      pts.forEach(function (p, idx) {
        var node = div("cr-node" + (p.hub ? " cr-node--hub" : ""));
        node.style.left = p.x + "%";
        node.style.top = p.y + "%";
        node.style.animationDelay = (-rand(0, 2.8)).toFixed(2) + "s";
        wrap.appendChild(node);
      });
      el.appendChild(wrap);
    },

    /* radiating burst */
    radial: function (el) {
      var wrap = div("cr-radial");
      wrap.appendChild(div("cr-burst"));
      wrap.appendChild(div("cr-burst cr-burst--2"));
      el.appendChild(wrap);
    },

    /* marketing growth bars + trend line */
    bars: function (el, o) {
      var heights = [34, 28, 52, 46, 70, 64, 92];
      if (o.bars) {
        heights = [];
        for (var i = 0; i < o.bars; i++) heights.push(20 + (i / o.bars) * 75 + rand(-8, 8));
      }
      var wrap = div("cr-bars");
      var n = heights.length;
      heights.forEach(function (h, i) {
        var col = div("cr-col");
        col.style.height = Math.max(6, Math.min(100, h)) + "%";
        col.style.animationDelay = (i * 0.12).toFixed(2) + "s";
        col.style.opacity = (0.55 + 0.45 * (i / (n - 1))).toFixed(2);
        wrap.appendChild(col);
      });
      // trend line tracing the bar tops
      var s = svg("svg", { viewBox: "0 0 100 100", preserveAspectRatio: "none", class: "cr-trend" });
      var pad = 11, span = 100 - pad * 2;
      var d = "", last = {};
      heights.forEach(function (h, i) {
        var x = pad + (span * (i + 0.5) / n);
        var y = 84 - (Math.max(6, Math.min(100, h)) / 100) * 66;
        d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
        last = { x: x, y: y };
      });
      s.appendChild(svg("path", { d: d.trim() }));
      s.appendChild(svg("circle", { cx: last.x, cy: last.y, r: 2.6 }));
      wrap.appendChild(s);
      el.appendChild(wrap);
    },

    /* amplifier glow orb */
    orb: function (el) {
      var wrap = div("cr-orb");
      wrap.appendChild(div("cr-orb-halo"));
      wrap.appendChild(div("cr-orb-core"));
      el.appendChild(wrap);
    },

    /* scanning radar grid */
    pulsegrid: function (el, o) {
      var wrap = div("cr-pulsegrid");
      wrap.appendChild(div("cr-beam"));
      var blips = o.blips || 4;
      for (var i = 0; i < blips; i++) {
        var b = div("cr-blip");
        b.style.left = rand(12, 88) + "%";
        b.style.top = rand(14, 86) + "%";
        b.style.animationDelay = (-rand(0, 3)).toFixed(2) + "s";
        wrap.appendChild(b);
      }
      el.appendChild(wrap);
    },

    /* generative-engine core broadcasting to orbiting AI agents */
    aicore: function (el, o) {
      var wrap = div("cr-ai");
      for (var e = 0; e < 3; e++) {
        var em = div("cr-ai-emit");
        em.style.animationDelay = (e * (2.8 / 3)).toFixed(2) + "s";
        wrap.appendChild(em);
      }
      var rings = o.count || 5;
      for (var i = 0; i < rings; i++) {
        var size = 32 + i * 9;
        var dur = 6.5 + i * 2.4;
        var orbit = div("cr-ai-orbit");
        orbit.style.width = size + "%";
        orbit.style.aspectRatio = "1";
        orbit.style.animationDuration = dur.toFixed(1) + "s";
        orbit.style.animationDirection = (i % 2 ? "reverse" : "normal");
        orbit.style.animationDelay = (-(i / rings) * dur).toFixed(2) + "s";
        var agent = document.createElement("i");
        agent.className = "cr-ai-agent";
        agent.style.animationDelay = (-rand(0, 2.6)).toFixed(2) + "s";
        orbit.appendChild(agent);
        wrap.appendChild(orbit);
      }
      var core = div("cr-ai-core");
      var s = svg("svg", { viewBox: "0 0 24 24", fill: "currentColor" });
      s.appendChild(svg("path", { d: "M12 2 L14.3 9.7 L22 12 L14.3 14.3 L12 22 L9.7 14.3 L2 12 L9.7 9.7 Z" }));
      core.appendChild(s);
      wrap.appendChild(core);
      el.appendChild(wrap);
    }
  };

  function hydrate(root) {
    (root || document).querySelectorAll("[data-creative]").forEach(function (el) {
      if (el.dataset.crDone) return;
      var type = el.getAttribute("data-creative");
      var fn = builders[type];
      if (!fn) return;
      var opts = {
        bars: +el.getAttribute("data-bars") || 0,
        rings: +el.getAttribute("data-rings") || 0,
        cols: +el.getAttribute("data-cols") || 0,
        rows: +el.getAttribute("data-rows") || 0,
        count: +el.getAttribute("data-count") || 0,
        blips: +el.getAttribute("data-blips") || 0
      };
      if (!el.classList.contains("creative")) el.classList.add("creative");
      fn(el, opts);
      // optional caption
      var cap = el.getAttribute("data-cap");
      if (cap) { var c = div("cr-cap"); c.textContent = cap; el.appendChild(c); }
      el.dataset.crDone = "1";
    });
  }

  window.Creatives = { hydrate: hydrate, builders: builders };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { hydrate(); });
  } else {
    hydrate();
  }
})();
