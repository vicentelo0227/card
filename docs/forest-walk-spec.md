# 森林漫步 Forest Walk - 技術規格文件

## 專案概述

一個沈浸式的互動靜態網站，模擬在森林中漫步探索的體驗。使用者可以透過點擊畫面中的不同方向或位置來導航，並在特定「停留點」聆聽音樂、閱讀探索指引。

**目標平台**：行動裝置優先（掃 QR Code 進入），同時支援桌面瀏覽器
**部署方式**：純靜態網站，可部署至 Netlify / Vercel / GitHub Pages

---

## 技術棧

### 核心技術
| 項目 | 選擇 | 理由 |
|------|------|------|
| 框架 | **Vanilla JS** 或 **Vue 3** | 輕量、無需建構複雜環境 |
| 樣式 | **Tailwind CSS** | 快速開發、響應式設計 |
| 動畫 | **GSAP** 或 **CSS Transitions** | 流暢的場景轉場效果 |
| 音訊 | **Howler.js** | 跨瀏覽器音訊控制、淡入淡出 |
| 建構工具 | **Vite** | 快速開發、優化打包 |

### 可選增強
| 項目 | 選擇 | 用途 |
|------|------|------|
| 狀態管理 | **Pinia**（若用 Vue） | 管理探索進度、已訪問節點 |
| 預載入 | **vanilla-lazyload** | 圖片預載入優化 |
| 資料儲存 | **localStorage** | 保存探索進度（可選） |

---

## 功能需求

### P0 - 核心功能（必須實作）

#### 1. 場景導航系統
- 全螢幕顯示場景圖片（cover 模式）
- 場景上可設定多個「熱區」(hotspot)
- 熱區類型：
  - **方向熱區**：點擊後轉場至另一場景
  - **停留點熱區**：點擊後開啟指引面板 + 播放音樂
- 場景轉場動畫（淡入淡出，約 0.8-1.2 秒）

#### 2. 停留點系統
- 底部滑出的指引面板
- 顯示：標題、描述文字
- 自動播放對應音樂
- 可關閉面板繼續探索

#### 3. 音樂播放系統
- 支援 MP3 格式
- 自動淡入播放
- 離開停留點時淡出停止
- 播放狀態指示器（音波動畫）
- 靜音/取消靜音按鈕

#### 4. 導航輔助
- 返回上一場景按鈕
- 場景名稱顯示

#### 5. 開場畫面
- 專案標題 + 進入按鈕
- 使用者點擊後才開始（符合瀏覽器自動播放政策）

### P1 - 重要功能（建議實作）

#### 6. 響應式設計
- 行動裝置：全螢幕體驗，熱區大小適合觸控
- 桌面：置中顯示，保持沈浸感

#### 7. 圖片預載入
- 進入場景前預載入相鄰場景圖片
- 載入中顯示過渡效果

#### 8. 進度保存（localStorage）
- 記錄已訪問的場景
- 下次進入可從上次位置繼續
- 提供「重新開始」選項

### P2 - 加分功能（可選）

#### 9. 隱藏場景機制
- 某些場景需要特定條件才會顯示入口
- 例如：訪問過 A 和 B 後，才會出現通往 C 的路

#### 10. 環境音效
- 背景持續播放環境音（風聲、鳥鳴）
- 與停留點音樂混音播放

#### 11. 探索統計
- 顯示已探索 X / Y 個場景
- 顯示已發現 X / Y 個停留點

---

## 資料結構

### 場景資料 (`scenes.json`)

```json
{
  "scenes": {
    "start": {
      "id": "start",
      "title": "森林入口",
      "image": "images/start.jpg",
      "hotspots": [
        {
          "id": "hs1",
          "type": "direction",
          "position": { "x": 50, "y": 75 },
          "size": { "width": 15, "height": 20 },
          "label": "沿著光走",
          "target": "main-1"
        },
        {
          "id": "hs2",
          "type": "direction",
          "position": { "x": 20, "y": 65 },
          "size": { "width": 12, "height": 18 },
          "label": "左側小徑",
          "target": "branch-L1"
        }
      ]
    },
    "main-1": {
      "id": "main-1",
      "title": "林道起始",
      "image": "images/main-1.jpg",
      "hotspots": [
        {
          "id": "hs1",
          "type": "stop",
          "position": { "x": 70, "y": 40 },
          "size": { "width": 10, "height": 10 },
          "label": "✦ 停留點",
          "stopPoint": "stop-1"
        },
        {
          "id": "hs2",
          "type": "direction",
          "position": { "x": 55, "y": 80 },
          "size": { "width": 15, "height": 15 },
          "label": "繼續深入",
          "target": "main-2"
        }
      ],
      "parent": "start"
    }
  }
}
```

### 停留點資料 (`stopPoints.json`)

```json
{
  "stopPoints": {
    "stop-1": {
      "id": "stop-1",
      "title": "光的指引",
      "description": "在這裡停下腳步，感受光線穿透樹葉的溫度。\n閉上眼睛，聆聽風與樹的對話。",
      "music": "audio/light-guidance.mp3"
    },
    "stop-2": {
      "id": "stop-2",
      "title": "溪流之聲",
      "description": "水流過石頭，發出清脆的聲響。\n這是森林的心跳。",
      "music": "audio/stream.mp3"
    }
  }
}
```

### Hotspot 位置說明
- `position.x` 和 `position.y`：以百分比表示，相對於場景左上角
- `size.width` 和 `size.height`：以百分比表示，熱區寬高

---

## 檔案結構

```
forest-walk/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
│
├── src/
│   ├── main.js              # 進入點
│   ├── App.vue              # 主組件（若用 Vue）
│   │
│   ├── components/
│   │   ├── IntroScreen.vue      # 開場畫面
│   │   ├── SceneView.vue        # 場景顯示
│   │   ├── Hotspot.vue          # 熱區組件
│   │   ├── GuidePanel.vue       # 停留點指引面板
│   │   ├── MusicIndicator.vue   # 音樂播放指示器
│   │   ├── BackButton.vue       # 返回按鈕
│   │   └── SceneTitle.vue       # 場景標題
│   │
│   ├── composables/
│   │   ├── useSceneNavigation.js   # 場景導航邏輯
│   │   ├── useAudio.js             # 音訊控制
│   │   └── useProgress.js          # 進度管理
│   │
│   ├── data/
│   │   ├── scenes.json         # 場景資料
│   │   └── stopPoints.json     # 停留點資料
│   │
│   └── styles/
│       └── main.css            # 全域樣式
│
├── public/
│   ├── images/                 # 場景圖片
│   │   ├── start.jpg
│   │   ├── main-1.jpg
│   │   ├── main-2.jpg
│   │   └── ...
│   │
│   └── audio/                  # 音樂檔案
│       ├── light-guidance.mp3
│       ├── stream.mp3
│       └── ...
│
└── dist/                       # 建構輸出（部署此資料夾）
```

---

## UI/UX 規格

### 視覺風格
- **整體氛圍**：沈浸、靜謐、自然
- **配色**：深色底 (#0a0a0a)，低飽和的金色強調 (#c8b896)
- **字體**：
  - 標題：Cormorant Garamond（優雅襯線體）
  - 內文：Noto Serif TC（繁體中文）
- **過渡效果**：緩慢、柔和（ease, 0.8s-1.2s）

### 熱區視覺
- **方向熱區**：圓形發光點 + 脈動動畫
- **停留點熱區**：方形發光點 + 呼吸光暈
- **Hover 狀態**：放大 + 亮度提升 + 顯示標籤

### 響應式斷點
| 裝置 | 寬度 | 調整 |
|------|------|------|
| 手機 | < 640px | 熱區放大 1.5x，標籤字體放大 |
| 平板 | 640-1024px | 標準尺寸 |
| 桌面 | > 1024px | 場景最大寬度限制，置中顯示 |

### 無障礙考量
- 熱區需有足夠的觸控面積（最小 44x44px）
- 提供鍵盤導航（Tab 切換熱區，Enter 觸發）
- 場景標題作為 aria-label

---

## 技術細節

### 場景轉場實作

```javascript
// 使用 GSAP
function transitionToScene(targetSceneId) {
  const timeline = gsap.timeline();
  
  timeline
    .to('.current-scene', { 
      opacity: 0, 
      duration: 0.6, 
      ease: 'power2.inOut' 
    })
    .call(() => {
      loadScene(targetSceneId);
    })
    .fromTo('.current-scene', 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.6, ease: 'power2.inOut' }
    );
}
```

### 音訊控制實作

```javascript
// 使用 Howler.js
import { Howl } from 'howler';

const music = new Howl({
  src: ['audio/track.mp3'],
  loop: true,
  volume: 0
});

// 淡入播放
function fadeInPlay() {
  music.play();
  music.fade(0, 0.7, 2000); // 2秒淡入至70%音量
}

// 淡出停止
function fadeOutStop() {
  music.fade(music.volume(), 0, 1000);
  setTimeout(() => music.stop(), 1000);
}
```

### 熱區位置計算

```javascript
// 將百分比位置轉換為絕對位置
function calculateHotspotStyle(hotspot) {
  return {
    left: `${hotspot.position.x}%`,
    top: `${hotspot.position.y}%`,
    width: `${hotspot.size.width}%`,
    height: `${hotspot.size.height}%`,
    transform: 'translate(-50%, -50%)' // 以中心點定位
  };
}
```

---

## 部署指南

### 建構指令

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

### Netlify 部署

1. 將 `dist/` 資料夾拖曳至 [app.netlify.com/drop](https://app.netlify.com/drop)
2. 或連結 GitHub repo，設定：
   - Build command: `npm run build`
   - Publish directory: `dist`

### 效能優化

- 圖片壓縮：使用 WebP 格式，品質 80%
- 圖片尺寸：建議 1920x1080（桌面）、1080x1920（手機優先）
- 音訊壓縮：MP3 128kbps 已足夠
- 預載入：優先載入當前場景相鄰的 2-3 個場景圖片

---

## 路線地圖參考

完整的場景節點規劃請參考 `forest-map.html`，包含：
- **6 層深度**的探索結構
- **42 個場景節點**
- **12 個停留點**（音樂 + 指引）
- **6 個隱藏地點**
- **3 個終點/出口**

節點類型：
- 🟢 主路線（綠色）
- 🔵 支線（藍色）
- 🟡 停留點（金色）
- 🟣 隱藏地點（紫色）
- 🔴 終點（紅色）

---

## 開發優先順序

1. **Phase 1**：基礎架構
   - 專案初始化（Vite + Vue/Vanilla）
   - 場景顯示 + 熱區點擊
   - 基本轉場動畫

2. **Phase 2**：核心體驗
   - 停留點面板
   - 音樂播放
   - 返回導航

3. **Phase 3**：完善體驗
   - 開場畫面
   - 圖片預載入
   - 響應式調整

4. **Phase 4**：進階功能
   - 進度保存
   - 隱藏場景邏輯
   - 探索統計

---

## 注意事項

1. **行動裝置音訊限制**：iOS/Android 要求使用者互動後才能播放音訊，因此開場畫面的「進入」按鈕是必要的

2. **圖片比例**：建議所有場景圖片保持相同比例（如 16:9），以確保轉場時視覺一致

3. **熱區位置**：需配合每張圖片內容手動調整，建議製作一個簡單的編輯工具或使用視覺化方式設定

4. **音樂授權**：確保使用的音樂有合法授權（原創、CC授權、或已購買版權）
