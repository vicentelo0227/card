# 森林漫步 Forest Walk

一個沉浸式的互動靜態網站，模擬在森林中漫步探索的體驗。

## 功能特色

- 🌲 **場景導航**：透過點擊發光熱區探索不同場景
- 🎵 **停留點系統**：在特定地點聆聽音樂、閱讀探索指引
- 💾 **進度保存**：自動保存探索進度，下次可繼續
- 📱 **響應式設計**：支援手機和桌面瀏覽器
- ✨ **精美視覺**：優雅的轉場動畫和發光效果

## 技術棧

- **框架**：Vue 3 + Vite
- **樣式**：Tailwind CSS
- **狀態管理**：Pinia
- **音訊**：Howler.js

## 快速開始

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建構生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 專案結構

```
forest-walk/
├── src/
│   ├── components/          # Vue 組件
│   │   ├── IntroScreen.vue  # 開場畫面
│   │   ├── SceneView.vue    # 場景顯示
│   │   ├── Hotspot.vue      # 熱區組件
│   │   ├── GuidePanel.vue   # 停留點指引面板
│   │   └── ...
│   ├── composables/         # 組合式函數
│   │   ├── useAudio.js      # 音訊控制
│   │   └── usePreload.js    # 圖片預載入
│   ├── stores/              # Pinia stores
│   │   └── gameStore.js     # 遊戲狀態管理
│   ├── data/                # 資料檔案
│   │   ├── scenes.json      # 場景資料
│   │   └── stopPoints.json  # 停留點資料
│   └── style.css            # 全域樣式
├── public/
│   ├── images/              # 場景圖片（待新增）
│   └── audio/               # 音樂檔案（待新增）
└── ...
```

## 場景資料

目前包含 11 個場景：

| 場景 | 名稱 | 類型 |
|------|------|------|
| forest-entrance | 森林入口 | 主線 |
| main-path-1 | 林道起始 | 主線 |
| moss-steps | 苔蘚石階 | 支線 |
| main-path-2 | 林間分岔 | 主線 |
| bamboo-path | 竹林小道 | 支線 |
| forest-heart | 森林心臟 | 主線 |
| waterfall | 瀑布 | 支線 |
| misty-woods | 迷霧深林 | 主線 |
| light-corridor | 光之回廊 | 主線 |
| forest-end | 森林盡頭 | 主線 |
| ending | 歸途 | 結局 |

## 停留點

共 6 個停留點，每個都有專屬音樂和文字指引：

- 光的指引
- 溪流之聲
- 竹韻
- 瀑布交響
- 迷霧之歌
- 森林輓歌

## 新增圖片和音樂

### 圖片規格

- **桌面**：1920x1080px，WebP 格式，< 200KB
- **手機**：1080x1920px，WebP 格式，< 150KB

將圖片放入 `public/images/` 資料夾，檔名需對應 `scenes.json` 中的設定。

### 音樂規格

- **格式**：MP3
- **位元率**：128kbps
- **類型**：環境音樂、氛圍音效

將音樂放入 `public/audio/music/` 資料夾。

## 部署

建構後的 `dist/` 資料夾可部署至：

- Netlify
- Vercel
- GitHub Pages

```bash
# 建構
npm run build

# 部署 dist 資料夾
```

## 授權

MIT License
