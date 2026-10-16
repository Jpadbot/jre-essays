(function () {
  "use strict";

  var LS_FONT = "jre-font-scale";
  var LS_THEME = "jre-theme";
  var LS_CAT = "jre-category";
  var HIDE_MS = 3000;
  var FONT_MIN = 0.85;
  var FONT_MAX = 1.45;
  var FONT_STEP = 0.05;
  var FONT_DEFAULT = 1;

  var hideTimer = null;
  var panelOpen = false;
  var scale = FONT_DEFAULT;
  var theme = "light";
  var activeCat = "zh";

  var feedEl = document.getElementById("feed");
  var articleEl = document.getElementById("article");
  var fabEl = document.getElementById("settings-fab");
  var panelEl = document.getElementById("settings-panel");
  var overlayEl = document.getElementById("settings-overlay");
  var fontLabel = document.getElementById("font-label");
  var feedLabel = document.getElementById("feed-label");
  var feedChrome = document.getElementById("feed-chrome");
  var feedSectionLabel = document.getElementById("feed-section-label");

  var CAT_META = {
    en: { label: "英文範文", empty: "暫無英文範文。" },
    zh: { label: "中文範文", empty: "暫無中文範文。" },
    tips: { label: "心得與常見錯誤", empty: "暫無心得文章。" }
  };

  function loadPrefs() {
    var s = parseFloat(localStorage.getItem(LS_FONT));
    if (!isNaN(s) && s >= FONT_MIN && s <= FONT_MAX) scale = s;
    var t = localStorage.getItem(LS_THEME);
    if (t === "light" || t === "dark" || t === "warm") theme = t;
    var c = localStorage.getItem(LS_CAT);
    if (c === "en" || c === "zh" || c === "tips") activeCat = c;
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
    localStorage.setItem(LS_CAT, activeCat);
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

  function essayCategories(e) {
    if (e.categories && e.categories.length) return e.categories;
    if (e.category) return [e.category];
    if (e.lang === "en" && e.translationHtml) return ["en", "zh"];
    return [e.lang === "en" ? "en" : "zh"];
  }

  function getEssay(id) {
    var list = window.JRE_ESSAYS || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function countForCat(cat) {
    var list = window.JRE_ESSAYS || [];
    var n = 0;
    for (var i = 0; i < list.length; i++) {
      if (essayCategories(list[i]).indexOf(cat) !== -1) n++;
    }
    return n;
  }

  function updateTabUI() {
    document.querySelectorAll(".cat-tab").forEach(function (btn) {
      var cat = btn.getAttribute("data-cat");
      btn.setAttribute("aria-selected", cat === activeCat ? "true" : "false");
    });
    document.querySelectorAll("[data-count-for]").forEach(function (el) {
      var cat = el.getAttribute("data-count-for");
      el.textContent = "· " + countForCat(cat);
    });
    if (feedSectionLabel) {
      var meta = CAT_META[activeCat] || CAT_META.zh;
      feedSectionLabel.textContent = meta.label;
    }
  }

  function parseRoute() {
    var hash = (location.hash || "").replace(/^#/, "");
    if (hash.indexOf("essay/") === 0) {
      var rest = decodeURIComponent(hash.slice(6));
      var parts = rest.split("/");
      var id = parts[0];
      var view = parts[1] || "";
      if (view !== "en" && view !== "zh") view = "";
      return { view: "essay", id: id, langView: view };
    }
    if (hash.indexOf("cat/") === 0) {
      var cat = hash.slice(4);
      if (cat === "en" || cat === "zh" || cat === "tips") {
        return { view: "feed", cat: cat };
      }
    }
    if (hash) {
      return { view: "essay", id: decodeURIComponent(hash), langView: "" };
    }
    return { view: "feed" };
  }

  function updateMasthead(view) {
    if (feedLabel) feedLabel.hidden = view !== "feed";
    if (feedChrome) feedChrome.hidden = view !== "feed";
    var mast = document.getElementById("site-masthead");
    if (mast) mast.hidden = view !== "feed";
  }

  function wordCountLabel(e, langView) {
    if (langView === "en" || (!langView && e.lang === "en" && !e.translationHtml)) {
      var en = e.wordCount || 0;
      return en ? "英文約 " + en + " 詞" : "";
    }
    if (langView === "zh" || e.lang === "zh" || (e.categories && e.categories.indexOf("tips") !== -1)) {
      var n = e.charCount || 0;
      if (langView === "zh" && e.translationHtml) {
        return n ? "中譯約 " + n + " 字" : "";
      }
      return n ? "約 " + n + " 字" : "";
    }
    if (e.lang === "en") {
      var en2 = e.wordCount || 0;
      var zh2 = e.charCount || 0;
      if (en2 && zh2) return "英文約 " + en2 + " 詞 · 中譯約 " + zh2 + " 字";
      if (en2) return "英文約 " + en2 + " 詞";
    }
    var n2 = e.charCount || 0;
    return n2 ? "約 " + n2 + " 字" : "";
  }

  function shortCountLabel(e, cat) {
    if (cat === "en") {
      var en = e.wordCount || 0;
      return en ? "約 " + en + " 詞" : "";
    }
    var n = e.charCount || 0;
    return n ? "約 " + n + " 字" : "";
  }

  function cardTitle(e, cat) {
    if (cat === "en") return e.titleEn || e.title;
    if (cat === "zh") return e.titleZh || (e.title || "").replace(/（英＋中譯）\s*$/, "") || e.title;
    return e.title;
  }

  function cardBadge(e, cat) {
    if (cat === "tips") return "心得";
    if (cat === "en") return "English";
    if (e.lang === "en" && e.translationHtml) return "中譯";
    return "中文";
  }

  function cardLangClass(e, cat) {
    if (cat === "tips") return "tips";
    if (cat === "en") return "en";
    return "zh";
  }

  function essayHref(e, cat) {
    if (cat === "en") return "#essay/" + encodeURIComponent(e.id) + "/en";
    if (cat === "zh" && e.lang === "en" && e.translationHtml) {
      return "#essay/" + encodeURIComponent(e.id) + "/zh";
    }
    return "#essay/" + encodeURIComponent(e.id);
  }

  function renderFeed() {
    updateTabUI();
    var list = window.JRE_ESSAYS || [];
    var items = [];
    for (var i = 0; i < list.length; i++) {
      if (essayCategories(list[i]).indexOf(activeCat) !== -1) items.push(list[i]);
    }
    var html;
    if (!items.length) {
      html = '<p class="excerpt">' + (CAT_META[activeCat] || CAT_META.zh).empty + "</p>";
    } else {
      html = items
        .map(function (e) {
          var badge = cardBadge(e, activeCat);
          var wc = shortCountLabel(e, activeCat);
          var langClass = cardLangClass(e, activeCat);
          return (
            '<a class="card lang-' +
            langClass +
            '" href="' +
            essayHref(e, activeCat) +
            '">' +
            '<div class="card-meta"><time datetime="' +
            e.date +
            '">' +
            e.dateLabel +
            '</time><span class="badge">' +
            badge +
            "</span>" +
            (wc ? '<span class="badge">' + wc + "</span>" : "") +
            "</div>" +
            "<h2>" +
            cardTitle(e, activeCat) +
            "</h2>" +
            '<p class="excerpt">' +
            e.excerpt +
            "</p>" +
            '<span class="read-more">讀全文</span>' +
            "</a>"
          );
        })
        .join("");
    }
    feedEl.innerHTML = html;
    feedEl.hidden = false;
    articleEl.hidden = true;
    articleEl.innerHTML = "";
    document.title = "JRE範文.beta";
    updateMasthead("feed");
  }

  function resolveLangView(e, langView) {
    if (langView === "en" || langView === "zh") return langView;
    if (essayCategories(e).indexOf("tips") !== -1) return "zh";
    if (e.lang === "zh") return "zh";
    if (e.lang === "en" && e.translationHtml) return "both";
    return e.lang === "en" ? "en" : "zh";
  }

  function renderEssay(id, langView) {
    var e = getEssay(id);
    if (!e) {
      location.hash = "";
      return;
    }
    var view = resolveLangView(e, langView);
    var parts = [];
    var wc = wordCountLabel(e, view === "both" ? "" : view);
    var headLang = view === "en" ? "en" : view === "tips" ? "tips" : "zh";
    if (essayCategories(e).indexOf("tips") !== -1) headLang = "tips";

    parts.push('<button type="button" class="back" id="btn-back">← 返回列表</button>');
    parts.push('<header class="article-head lang-' + headLang + '">');
    parts.push(
      '<div class="card-meta"><time datetime="' +
        e.date +
        '">' +
        e.dateLabel +
        "</time>"
    );

    var badge;
    if (headLang === "tips") badge = "心得";
    else if (view === "en") badge = "English";
    else if (view === "zh" && e.translationHtml) badge = "中譯";
    else if (view === "both") badge = "英＋中譯";
    else badge = "中文";
    parts.push('<span class="badge">' + badge + "</span></div>");

    var h1;
    if (view === "en") h1 = e.titleEn || e.title;
    else if (view === "zh") h1 = e.titleZh || e.title.replace(/（英＋中譯）\s*$/, "") || e.title;
    else h1 = e.title;
    parts.push("<h1>" + h1 + "</h1>");
    if (wc) parts.push('<p class="wordcount" aria-label="字數統計">' + wc + "</p>");
    if (view === "en" && e.titleZh) {
      parts.push('<p class="sub">' + e.titleZh + "</p>");
    } else if (view !== "en" && e.titleEn) {
      parts.push('<p class="sub">' + e.titleEn + "</p>");
    }
    parts.push("</header>");

    parts.push(
      '<section class="block prompt lang-' +
        headLang +
        '"><h2>' +
        e.promptTitle +
        "</h2>" +
        e.promptHtml +
        "</section>"
    );

    if (view === "en") {
      parts.push(
        '<section class="block body lang-en" lang="en"><h2>' +
          (e.bodyTitle || "Essay") +
          "</h2>" +
          e.bodyHtml +
          "</section>"
      );
    } else if (view === "zh" && e.translationHtml) {
      parts.push(
        '<section class="block body lang-zh" lang="zh-Hant"><h2>範文全文（中譯）</h2>' +
          e.translationHtml +
          "</section>"
      );
      parts.push(
        '<section class="block body lang-en" lang="en"><h2>英文原文</h2>' +
          e.bodyHtml +
          "</section>"
      );
    } else if (view === "both") {
      parts.push(
        '<section class="block body lang-en" lang="en"><h2>' +
          e.bodyTitle +
          "</h2>" +
          e.bodyHtml +
          "</section>"
      );
      if (e.translationHtml) {
        parts.push(
          '<section class="block translation lang-zh" lang="zh-Hant"><h2>' +
            (e.translationTitle || "中文翻譯") +
            "</h2>" +
            e.translationHtml +
            "</section>"
        );
      }
    } else {
      var bodyLangAttr = e.lang === "en" ? ' lang="en"' : ' lang="zh-Hant"';
      var bodyClass = headLang === "tips" ? "tips" : e.lang === "en" ? "en" : "zh";
      parts.push(
        '<section class="block body lang-' +
          bodyClass +
          '"' +
          bodyLangAttr +
          "><h2>" +
          e.bodyTitle +
          "</h2>" +
          e.bodyHtml +
          "</section>"
      );
    }

    articleEl.innerHTML = parts.join("");
    articleEl.hidden = false;
    feedEl.hidden = true;
    document.title = h1 + " · JRE範文.beta";
    updateMasthead("essay");

    var back = document.getElementById("btn-back");
    if (back) {
      back.addEventListener("click", function () {
        location.hash = "cat/" + activeCat;
      });
    }
    window.scrollTo(0, 0);
  }

  function setCategory(cat, pushHash) {
    if (cat !== "en" && cat !== "zh" && cat !== "tips") return;
    activeCat = cat;
    savePrefs();
    if (pushHash) {
      var cur = parseRoute();
      if (cur.view === "feed") {
        location.hash = "cat/" + cat;
        return;
      }
    }
    renderFeed();
  }

  function route() {
    var r = parseRoute();
    if (r.view === "essay") {
      renderEssay(r.id, r.langView);
    } else {
      if (r.cat) {
        activeCat = r.cat;
        savePrefs();
      }
      renderFeed();
    }
  }

  function bindCategories() {
    document.querySelectorAll(".cat-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setCategory(btn.getAttribute("data-cat"), true);
      });
    });
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
  }

  loadPrefs();
  applyPrefs();
  bindSettings();
  bindCategories();
  route();
  window.addEventListener("hashchange", route);
})();
