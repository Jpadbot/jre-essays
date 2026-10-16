# TICKET — 012 JRE 範文站

## 目標
新建可長期託管的靜態閱讀站，重寫今日兩篇 JRE 風格範文，並以 GitHub Pages 公開。

## 驗收
- [x] `/workspace/jre-essays` 可開 `index.html`：列表見標題／日期／摘要，點開見全文
- [x] 閱讀設定改為「Aa」按鈕觸發；面板可調字體／背景；約 3 秒或關閉後收合；不因捲動／移動自動彈出；localStorage 記住
- [x] 首頁刊頭與文章卡排版加強（雜誌／閱讀風、手機優先、無外連 CDN）
- [x] 兩篇全文已上線（後續可由專家模式另行換稿）；英篇含完整中譯
- [x] 公開倉庫 `Jpadbot/jre-essays`，Pages 啟用（根目錄 + `.nojekyll`）
- [x] 分類分頁：英文範文／中文範文／心得與常見錯誤；雙語篇兩入口
- [x] 新增兩篇中文長文；心得分類至少兩篇（現三篇）

## 日常更新（交主 bot）
- [ ] 主 bot 設 routine：**每天中英文各一篇**長文（可另加心得）；交稿後更新 `essays-data.js` 並 push `main`
- 本 ticket／執行者只負責站內結構與單次內容；不在此 repo 建 cron

## 不要做什麼
- 不讀 `/workspace/notes/`
- 不改其他專案
- 不接外部 CDN／金鑰
- 不做登入／付費
- 不改 marketplace bots
