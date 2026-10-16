# JRE 範文站

每日（或按日）提供 JRE 考試風格的中英範文閱讀站：手機優先、先列表後全文、可調字體與背景。

## 功能
- 首頁刊頭＋文章卡：標題、日期、語種標籤、摘要；點開才見全文
- 可分享網址（hash）直達單篇
- 閱讀設定：右下角「Aa」圓鈕；**只有撳這顆**才打開設定面板（A−／％／A＋／重設；淺色／深色／暖色）
- 撳面板外、關閉鈕，或操作後約 3 秒自動收合；**不會**因捲動／滑鼠移動／觸控而自動彈出
- 正文底部留白，圓鈕不遮最後幾行；偏好存入 localStorage
- 純靜態、可 GitHub Pages 長期託管

## 範文來源
- 2026-10-16 兩篇範文來源為 grok.com Expert（2026-10-16）。

## 如何自己改
1. 開倉庫：https://github.com/Jpadbot/jre-essays
2. 改文章：編輯 `essays-data.js`（標題、摘要、`bodyHtml`／`translationHtml`、`wordCount`／`charCount`）
3. 改首頁標題／樣式：編輯 `index.html` 內嵌 CSS 與 `<h1>`
4. 改列表／全文顯示邏輯：編輯 `app.js`
5. 推送到 `main` 後，GitHub Pages 約一兩分鐘更新：https://jpadbot.github.io/jre-essays/
