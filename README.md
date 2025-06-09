# プレミアム高級時計 - プログラム仕様書

## プログラム概要

### アーキテクチャ概念図
```
┌─────────────────────────────────────────────────────────────┐
│                    ブラウザ環境                              │
├─────────────────────────────────────────────────────────────┤
│                    HTML Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Scene     │  │  Watch Case │  │   Digital   │         │
│  │ Container   │  │  Component  │  │   Display   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    CSS Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Styling    │  │ Animations  │  │ 3D Effects  │         │
│  │   Rules     │  │   Engine    │  │  Transform  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                 JavaScript Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Time     │  │ Interaction │  │   Render    │         │
│  │   Engine    │  │   Handler   │  │   Manager   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                   System APIs                               │
│         Date API    │    Mouse Events    │    RAF API       │
└─────────────────────────────────────────────────────────────┘
```

### 使用技術スタック
- **HTML5**: セマンティックマークアップ、DOM構造
- **CSS3**: アドバンスドスタイリング、アニメーション、3D変換
- **JavaScript ES6+**: モダンJavaScript、イベント処理、時刻計算
- **ブラウザAPI**: Date、MouseEvent、requestAnimationFrame

### 依存関係
```
プレミアム高級時計
├── HTML5 DOM API
├── CSS3
│   ├── Grid Layout
│   ├── Flexbox
│   ├── Transform 3D
│   ├── Animations
│   └── Custom Properties
├── JavaScript ES6+
│   ├── Date API
│   ├── setInterval
│   ├── Event Listeners
│   └── DOM Manipulation
└── Browser Support
    ├── Modern Browsers
    ├── GPU Acceleration
    └── Hardware Acceleration
```

## プログラム構造

### モジュール構成
```
luxury_watch.html
├── HTML Structure
│   ├── Scene Container
│   ├── Watch Components
│   │   ├── Diamond Bezel
│   │   ├── Watch Case
│   │   ├── Watch Face
│   │   ├── Hour Indices
│   │   ├── Premium Diamonds
│   │   ├── Watch Hands
│   │   └── Date Display
│   └── Digital Display
├── CSS Styling
│   ├── Base Styles
│   ├── Component Styles
│   ├── Animation Definitions
│   └── Responsive Design
└── JavaScript Logic
    ├── Time Management
    ├── DOM Manipulation
    ├── Event Handling
    └── Animation Control
```

### クラス階層
```
HTML Elements Hierarchy:
.scene
└── .diamond-bezel
└── .watch-case
    └── .watch-face
        ├── .sunray-effect
        ├── .reflection
        ├── .luxury-brand
        ├── .model-text
        ├── .premium-diamond (x4)
        ├── .hour-index (x8)
        ├── .date-display
        ├── .watch-hand.hour-hand
        ├── .watch-hand.minute-hand
        ├── .watch-hand.second-hand
        └── .center-hub
└── .digital-display
```

### データフロー
```
System Time (Date API)
    ↓
Time Calculation Engine
    ↓
Angle Computation
    ├── Hour Angle
    ├── Minute Angle
    └── Second Angle
    ↓
DOM Update Manager
    ├── Hand Rotation
    ├── Digital Display
    └── Date Display
    ↓
CSS Transform Application
    ↓
Visual Rendering (Browser)
```

## 関数一覧

### 主要関数の概要表

| 関数名 | 種別 | 説明 | 戻り値 |
|--------|------|------|--------|
| `updateTimepiece()` | Core | メイン時刻更新処理 | void |
| `mouseenter handler` | Event | ホバー開始時の3D効果 | void |
| `mouseleave handler` | Event | ホバー終了時の復帰処理 | void |
| `mousemove handler` | Event | 動的光反射効果処理 | void |

### 公開API/インターフェース

#### グローバル変数
```javascript
// 設定定数
const CLOCK_UPDATE_INTERVAL = 50;     // 更新間隔（ms）
const HOUR_ANGLE_PER_HOUR = 30;       // 時針角度係数
const MINUTE_ANGLE_PER_MINUTE = 6;    // 分針角度係数
const SECOND_ANGLE_PER_SECOND = 6;    // 秒針角度係数
```

#### DOM要素参照
```javascript
// 主要DOM要素
const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');
const dateWindow = document.getElementById('dateWindow');
const digitalClock = document.getElementById('digitalClock');
const watchCase = document.getElementById('watchCase');
```

#### 状態管理変数
```javascript
// インタラクション状態
let isHovering = false;  // ホバー状態フラグ
```

## 関数詳細

### updateTimepiece()
**概要**: システム時刻を取得し、アナログ・デジタル両方の表示を更新

**パラメータ**: なし

**戻り値**: void

**例外処理**: try-catch文でエラーハンドリング実装

**内部アルゴリズム説明**:
```javascript
function updateTimepiece() {
    // 1. ログ出力（デバッグ用）
    console.log('時刻を更新中...');
    
    try {
        // 2. 現在時刻取得
        const currentTime = new Date();
        const hours = currentTime.getHours() % 12;
        const minutes = currentTime.getMinutes();
        const seconds = currentTime.getSeconds();
        const milliseconds = currentTime.getMilliseconds();
        const date = currentTime.getDate();
        
        // 3. 高精度角度計算
        // ミリ秒を含む精密な秒数計算
        const preciseSeconds = seconds + (milliseconds / 1000);
        
        // 各針の角度計算（連続的な動きを実現）
        const hourAngle = (hours * HOUR_ANGLE_PER_HOUR) + 
                         (minutes * 0.5) + 
                         (preciseSeconds * 0.00833);
        const minuteAngle = (minutes * MINUTE_ANGLE_PER_MINUTE) + 
                           (preciseSeconds * 0.1);
        const secondAngle = preciseSeconds * SECOND_ANGLE_PER_SECOND;
        
        // 4. DOM更新
        // 針の回転適用
        hourHand.style.transform = `rotate(${hourAngle}deg)`;
        minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
        secondHand.style.transform = `rotate(${secondAngle}deg)`;
        
        // 日付表示更新（ゼロパディング）
        dateWindow.textContent = date.toString().padStart(2, '0');
        
        // デジタル時刻表示更新（24時間形式）
        const timeString = currentTime.toLocaleTimeString('ja-JP', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        digitalClock.textContent = timeString;
        
    } catch (error) {
        // 5. エラーハンドリング
        console.error('時刻更新中にエラーが発生しました:', error);
    }
}
```

### イベントハンドラー関数群

#### mouseenter handler
**概要**: マウスホバー開始時の3D効果とシャドウ変更

**パラメータ**: Event object (暗黙)

**戻り値**: void

**内部処理**:
```javascript
watchCase.addEventListener('mouseenter', function() {
    // ログ出力
    console.log('マウスホバー開始');
    
    // 状態フラグ更新
    isHovering = true;
    
    // 3D変換適用
    this.style.transform = 'rotateX(15deg) rotateY(15deg) scale(1.05)';
    
    // 強化されたシャドウ効果
    this.style.boxShadow = `
        0 0 100px rgba(255, 255, 255, 0.6),
        inset 0 0 50px rgba(0, 0, 0, 0.08),
        0 30px 80px rgba(0, 0, 0, 0.8),
        0 10px 30px rgba(0, 0, 0, 0.4)
    `;
});
```

#### mouseleave handler
**概要**: マウスホバー終了時の元状態復帰

**パラメータ**: Event object (暗黙)

**戻り値**: void

**内部処理**:
```javascript
watchCase.addEventListener('mouseleave', function() {
    // ログ出力
    console.log('マウスホバー終了');
    
    // 状態フラグ更新
    isHovering = false;
    
    // 初期状態に復帰
    this.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    
    // 通常のシャドウ効果
    this.style.boxShadow = `
        0 0 80px rgba(255, 255, 255, 0.4),
        inset 0 0 50px rgba(0, 0, 0, 0.08),
        0 25px 60px rgba(0, 0, 0, 0.6),
        0 5px 20px rgba(0, 0, 0, 0.3)
    `;
});
```

#### mousemove handler
**概要**: マウス位置に応じた動的な3D回転効果

**パラメータ**: MouseEvent object

**戻り値**: void

**内部アルゴリズム**:
```javascript
document.addEventListener('mousemove', function(e) {
    // ホバー状態の場合のみ実行
    if (isHovering) {
        try {
            // 1. 要素の位置情報取得
            const rect = watchCase.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // 2. マウス位置の中心からの距離計算
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            
            // 3. 回転角度計算（-20度〜20度の範囲）
            const rotateY = (mouseX / (rect.width / 2)) * 20;
            const rotateX = -(mouseY / (rect.height / 2)) * 20;
            
            // 4. 動的な3D変換適用
            watchCase.style.transform = 
                `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            
        } catch (error) {
            console.error('マウス移動処理中にエラーが発生しました:', error);
        }
    }
});
```

## 初期化処理

### プログラム起動シーケンス
```javascript
// 1. ログ出力
console.log('高級時計プログラムを初期化中...');

// 2. 最初の時刻表示
updateTimepiece();

// 3. 定期更新タイマー設定
setInterval(updateTimepiece, CLOCK_UPDATE_INTERVAL);

// 4. 初期化完了通知
console.log('高級時計プログラムの初期化が完了しました');
```

## CSSアニメーション仕様

### キーフレーム定義

#### gentle-glow
**用途**: ベゼルの光る効果
**周期**: 4秒（alternate）
```css
@keyframes gentle-glow {
    0% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.3); }
    100% { box-shadow: 0 0 60px rgba(255, 215, 0, 0.5); }
}
```

#### diamond-rotation
**用途**: ベゼルダイヤモンドの回転
**周期**: 8秒（無限ループ）
```css
@keyframes diamond-rotation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

#### sunray-rotation
**用途**: 文字盤のサンレイ効果
**周期**: 30秒（無限ループ）
```css
@keyframes sunray-rotation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

#### diamond-shine
**用途**: ダイヤモンドマーカーの輝き
**周期**: 3秒（alternate）
```css
@keyframes diamond-shine {
    0% { 
        box-shadow: 
            0 0 25px rgba(255, 255, 255, 0.9),
            inset 0 0 8px rgba(0, 0, 0, 0.15),
            0 0 15px rgba(255, 215, 0, 0.4);
    }
    100% { 
        box-shadow: 
            0 0 35px rgba(255, 255, 255, 1),
            inset 0 0 12px rgba(0, 0, 0, 0.1),
            0 0 25px rgba(255, 215, 0, 0.6);
    }
}
```

## パフォーマンス最適化

### レンダリング最適化
- **transform使用**: reflow/repaintを避けるCSS transform使用
- **GPU加速**: 3D変換によるハードウェアアクセラレーション活用
- **効率的な更新**: 必要な要素のみの更新

### メモリ管理
- **イベントリスナー**: 適切なライフサイクル管理
- **タイマー管理**: setIntervalの適切な使用
- **DOM参照**: 事前取得による繰り返しアクセスの回避

## ブラウザ互換性

### 対応ブラウザ
- **Chrome**: 90+ (推奨)
- **Firefox**: 88+ (推奨)  
- **Safari**: 14+ (推奨)
- **Edge**: 90+ (推奨)

### 必要な機能
- CSS3 Transform 3D
- CSS3 Animations
- ES6 JavaScript
- Date API
- MouseEvent API

## ライセンス
個人の範囲でご使用ください。
```
Copyright (c) 2025 Daily Growth
https://yourworklifedesign.blogspot.com/
All rights reserved.
```