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
  var scale = FONT_DEFAULT;
  var theme = "light";

  var feedEl = document.getElementById("feed");
  var articleEl = document.getElementById("article");
  var settingsEl = document.getElementById("settings");
  var fontLabel = document.getElementById("font-label");

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

  function showSettings() {
    if (!settingsEl) return;
    settingsEl.classList.remove("is-hidden");
    resetHideTimer();
  }

  function hideSettings() {
    if (!settingsEl) return;
    settingsEl.classList.add("is-hidden");
  }

  function resetHideTimer() {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(hideSettings, HIDE_MS);
  }

  function bumpFont(delta) {
    scale = Math.round((scale + delta) * 100) / 100;
    if (scale < FONT_MIN) scale = FONT_MIN;
    if (scale > FONT_MAX) scale = FONT_MAX;
    applyPrefs();
    savePrefs();
    /* Font buttons must also start the auto-hide countdown */
    showSettings();
  }

  function resetFont() {
    scale = FONT_DEFAULT;
    applyPrefs();
    savePrefs();
    showSettings();
  }

  function setTheme(t) {
    theme = t;
    applyPrefs();
    savePrefs();
    showSettings();
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
          '<span class="read-more">開啟全文 →</span>' +
          "</a>"
        );
      })
      .join("");
    feedEl.innerHTML = html;
    feedEl.hidden = false;
    articleEl.hidden = true;
    articleEl.innerHTML = "";
    document.title = "JRE 範文站";
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
    parts.push('<div class="card-meta"><time datetime="' + e.date + '">' + e.dateLabel + "</time>");
    parts.push('<span class="badge">' + (e.lang === "en" ? "英＋中譯" : "中文") + "</span></div>");
    parts.push("<h1>" + e.title + "</h1>");
    if (e.titleEn) parts.push('<p class="sub">' + e.titleEn + "</p>");
    parts.push("</header>");

    parts.push('<section class="block prompt"><h2>' + e.promptTitle + "</h2>" + e.promptHtml + "</section>");
    parts.push('<section class="block body"><h2>' + e.bodyTitle + "</h2>" + e.bodyHtml + "</section>");
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

    ["mousemove", "touchstart", "scroll", "keydown"].forEach(function (ev) {
      window.addEventListener(
        ev,
        function () {
          showSettings();
        },
        { passive: true }
      );
    });
  }

  loadPrefs();
  applyPrefs();
  bindSettings();
  route();
  window.addEventListener("hashchange", route);
  showSettings();
})();
