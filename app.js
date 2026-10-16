(function () {
  "use strict";

  var LS_FONT = "jre-font-scale";
  var LS_THEME = "jre-theme";
  var HIDE_MS = 3000;
  var FONT_MIN = 0.85;
  var FONT_MAX = 1.45;
  var FONT_STEP = 0.05;
  var FONT_DEFAULT = 1;

  var hideTimer = null;
  var panelOpen = false;
  var scale = FONT_DEFAULT;
  var theme = "light";

  var feedEl = document.getElementById("feed");
  var articleEl = document.getElementById("article");
  var fabEl = document.getElementById("settings-fab");
  var panelEl = document.getElementById("settings-panel");
  var overlayEl = document.getElementById("settings-overlay");
  var fontLabel = document.getElementById("font-label");
  var mastheadStats = document.getElementById("masthead-stats");
  var feedLabel = document.getElementById("feed-label");

  function loadPrefs() {
    var s = parseFloat(localStorage.getItem(LS_FONT));
    if (!isNaN(s) && s >= FONT_MIN && s <= FONT_MAX) scale = s;
    var t = localStorage.getItem(LS_THEME);
    if (t === "light" || t === "dark" || t === "warm") theme = t;
  }

  function applyPrefs() {
    document.documentElement.style.setProperty("--font-scale", String(scale));
    document.documentElement.setAttribute("data-theme", theme);
    if (fontLabel) fontLabel.textContent = Math.round(scale * 100) + "%";
    document.querySelectorAll("[data-theme-btn]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-theme-btn") === theme);
    });
  }

  function savePrefs() {
    localStorage.setItem(LS_FONT, String(scale));
    localStorage.setItem(LS_THEME, theme);
  }

  function clearHideTimer() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function openPanel() {
    if (!panelEl || !overlayEl || !fabEl) return;
    panelOpen = true;
    panelEl.hidden = false;
    overlayEl.hidden = false;
    /* force reflow before class for transition */
    void panelEl.offsetWidth;
    panelEl.classList.add("is-open");
    overlayEl.classList.add("is-open");
    fabEl.setAttribute("aria-expanded", "true");
    resetHideTimer();
  }

  function closePanel() {
    if (!panelEl || !overlayEl || !fabEl) return;
    panelOpen = false;
    clearHideTimer();
    panelEl.classList.remove("is-open");
    overlayEl.classList.remove("is-open");
    fabEl.setAttribute("aria-expanded", "false");
    setTimeout(function () {
      if (!panelOpen) {
        panelEl.hidden = true;
        overlayEl.hidden = true;
      }
    }, 220);
  }

  function resetHideTimer() {
    clearHideTimer();
    if (!panelOpen) return;
    hideTimer = setTimeout(closePanel, HIDE_MS);
  }

  function bumpFont(delta) {
    scale = Math.round((scale + delta) * 100) / 100;
    if (scale < FONT_MIN) scale = FONT_MIN;
    if (scale > FONT_MAX) scale = FONT_MAX;
    applyPrefs();
    savePrefs();
    resetHideTimer();
  }

  function resetFont() {
    scale = FONT_DEFAULT;
    applyPrefs();
    savePrefs();
    resetHideTimer();
  }

  function setTheme(t) {
    theme = t;
    applyPrefs();
    savePrefs();
    resetHideTimer();
  }

  function getEssay(id) {
    var list = window.JRE_ESSAYS || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function parseRoute() {
    var hash = (location.hash || "").replace(/^#/, "");
    if (hash.indexOf("essay/") === 0) {
      return { view: "essay", id: decodeURIComponent(hash.slice(6)) };
    }
    if (hash) {
      return { view: "essay", id: decodeURIComponent(hash) };
    }
    return { view: "feed" };
  }

  function updateMasthead(view) {
    var list = window.JRE_ESSAYS || [];
    var n = list.length;
    var latest = list[0] ? list[0].dateLabel : "";
    if (mastheadStats) {
      mastheadStats.textContent =
        n + " 篇" + (latest ? " · 最新 " + latest : "");
    }
    if (feedLabel) feedLabel.hidden = view !== "feed";
    var mast = document.getElementById("site-masthead");
    if (mast) mast.hidden = view !== "feed";
  }

  function renderFeed() {
    var list = window.JRE_ESSAYS || [];
    var html = list
      .map(function (e) {
        var badge = e.lang === "en" ? "英＋中譯" : "中文";
        return (
          '<a class="card" href="#essay/' +
          encodeURIComponent(e.id) +
          '">' +
          '<div class="card-meta"><time datetime="' +
          e.date +
          '">' +
          e.dateLabel +
          '</time><span class="badge">' +
          badge +
          "</span></div>" +
          "<h2>" +
          e.title +
          "</h2>" +
          '<p class="excerpt">' +
          e.excerpt +
          "</p>" +
          '<span class="read-more">讀全文</span>' +
          "</a>"
        );
      })
      .join("");
    feedEl.innerHTML = html;
    feedEl.hidden = false;
    articleEl.hidden = true;
    articleEl.innerHTML = "";
    document.title = "JRE 範文站";
    updateMasthead("feed");
  }

  function renderEssay(id) {
    var e = getEssay(id);
    if (!e) {
      location.hash = "";
      return;
    }
    var parts = [];
    parts.push('<button type="button" class="back" id="btn-back">← 返回列表</button>');
    parts.push('<header class="article-head">');
    parts.push(
      '<div class="card-meta"><time datetime="' +
        e.date +
        '">' +
        e.dateLabel +
        "</time>"
    );
    parts.push(
      '<span class="badge">' +
        (e.lang === "en" ? "英＋中譯" : "中文") +
        "</span></div>"
    );
    parts.push("<h1>" + e.title + "</h1>");
    if (e.titleEn) parts.push('<p class="sub">' + e.titleEn + "</p>");
    parts.push("</header>");

    parts.push(
      '<section class="block prompt"><h2>' +
        e.promptTitle +
        "</h2>" +
        e.promptHtml +
        "</section>"
    );
    parts.push(
      '<section class="block body"><h2>' +
        e.bodyTitle +
        "</h2>" +
        e.bodyHtml +
        "</section>"
    );
    if (e.translationHtml) {
      parts.push(
        '<section class="block translation"><h2>' +
          e.translationTitle +
          "</h2>" +
          e.translationHtml +
          "</section>"
      );
    }

    articleEl.innerHTML = parts.join("");
    articleEl.hidden = false;
    feedEl.hidden = true;
    document.title = e.title + " · JRE 範文站";
    updateMasthead("essay");

    var back = document.getElementById("btn-back");
    if (back) {
      back.addEventListener("click", function () {
        location.hash = "";
      });
    }
    window.scrollTo(0, 0);
  }

  function route() {
    var r = parseRoute();
    if (r.view === "essay") renderEssay(r.id);
    else renderFeed();
  }

  function bindSettings() {
    fabEl.addEventListener("click", function (ev) {
      ev.stopPropagation();
      if (panelOpen) closePanel();
      else openPanel();
    });

    document.getElementById("btn-panel-close").addEventListener("click", function () {
      closePanel();
    });

    overlayEl.addEventListener("click", function () {
      closePanel();
    });

    panelEl.addEventListener("click", function (ev) {
      ev.stopPropagation();
      /* touching controls inside panel resets the auto-close timer */
      if (panelOpen) resetHideTimer();
    });

    document.getElementById("btn-a-minus").addEventListener("click", function () {
      bumpFont(-FONT_STEP);
    });
    document.getElementById("btn-a-plus").addEventListener("click", function () {
      bumpFont(FONT_STEP);
    });
    document.getElementById("btn-font-reset").addEventListener("click", function () {
      resetFont();
    });
    document.querySelectorAll("[data-theme-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setTheme(btn.getAttribute("data-theme-btn"));
      });
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && panelOpen) closePanel();
    });

    /* Explicitly do NOT open panel on scroll / mousemove / touchstart */
  }

  loadPrefs();
  applyPrefs();
  bindSettings();
  route();
  window.addEventListener("hashchange", route);
})();
