// ===== 定数定義 =====
const CLOCK_UPDATE_INTERVAL = 50; // ms単位（滑らかな秒針のため）
const HOUR_ANGLE_PER_HOUR = 30;   // 1時間あたりの角度
const MINUTE_ANGLE_PER_MINUTE = 6; // 1分あたりの角度
const SECOND_ANGLE_PER_SECOND = 6; // 1秒あたりの角度

// ===== DOM要素取得 =====
const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');
const dateWindow = document.getElementById('dateWindow');
const digitalClock = document.getElementById('digitalClock');
const watchCase = document.getElementById('watchCase');
const historyDisplay = document.getElementById('historyDisplay');
const eraText = document.getElementById('eraText');
const eventText = document.getElementById('eventText');
const historyDetail = document.getElementById('historyDetail');
const detailYear = document.getElementById('detailYear');
const detailEra = document.getElementById('detailEra');
const detailDescription = document.getElementById('detailDescription');

// ===== 歴史データ読み込み =====
let historyData = [];

// 歴史データをfetchで読み込み
async function loadHistoryData() {
    try {
        const response = await fetch('./history.json');
        const data = await response.json();
        historyData = data.events;
        console.log('歴史データを読み込みました:', historyData.length, '件');
    } catch (error) {
        console.error('歴史データの読み込みに失敗しました:', error);
    }
}

// ===== 時刻から年への変換関数 =====
function timeToYear(hours, minutes, seconds) {
    // 00:00:00 = 年1, 23:59:59 = 年2025
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const totalSecondsInDay = 24 * 60 * 60; // 86400秒
    const year = Math.floor((totalSeconds / totalSecondsInDay) * 2025) + 1;
    return Math.min(year, 2025);
}

// ===== 現在の年に対応する歴史イベントを取得 =====
function getCurrentHistoryEvent(currentYear) {
    // 現在の年に最も近い歴史イベントを検索
    for (let i = historyData.length - 1; i >= 0; i--) {
        if (historyData[i].year <= currentYear) {
            return historyData[i];
        }
    }
    return historyData[0]; // 見つからない場合は最初のイベント
}

// ===== 歴史表示の状態管理 =====
let currentHistoryEvent = null;
let historyDisplayTimer = null;
let detailDisplayTimer = null;

// ===== 歴史表示機能 =====
function showHistoryEvent(event) {
    if (!event) return;
    
    // 歴史情報を表示
    eraText.textContent = `${event.era} ${event.year}`;
    eventText.textContent = event.event;
    historyDisplay.classList.add('visible');
    
    // 30秒後に自動で非表示
    if (historyDisplayTimer) {
        clearTimeout(historyDisplayTimer);
    }
    historyDisplayTimer = setTimeout(() => {
        historyDisplay.classList.remove('visible');
    }, 10000*3);
}

function showHistoryDetail(event) {
    if (!event) return;
    
    // 詳細情報を表示
    detailYear.textContent = `${event.year}年`;
    detailEra.textContent = `${event.era}時代`;
    detailDescription.textContent = event.description;
    
    // 現在のカラースキームに合わせてスタイルを更新
    updateHistoryDetailColors();
    
    historyDetail.classList.add('visible');
    
    // 5秒後に自動で非表示
    if (detailDisplayTimer) {
        clearTimeout(detailDisplayTimer);
    }
    detailDisplayTimer = setTimeout(() => {
        historyDetail.classList.remove('visible');
    }, 5000);
}

// 歴史詳細表示の色をカラースキームに合わせて更新
function updateHistoryDetailColors() {
    const scheme = colorSchemes[currentColorScheme];
    
    historyDetail.style.background = `
        linear-gradient(135deg, 
            rgba(0, 0, 0, 0.95), 
            rgba(20, 20, 20, 0.95)
        )
    `;
    historyDetail.style.borderColor = scheme.border;
    historyDetail.style.boxShadow = `
        0 0 50px ${scheme.glow},
        0 10px 30px rgba(0, 0, 0, 0.8),
        inset 0 0 20px rgba(0, 0, 0, 0.3)
    `;
    
    // テキストの色もカラースキームに合わせる
    detailYear.style.color = '#fff';
    detailYear.style.textShadow = `0 0 15px ${scheme.glow}`;
    detailEra.style.color = scheme.digital;
    detailEra.style.textShadow = `0 0 15px ${scheme.glow}`;
    detailDescription.style.color = '#ddd';
    detailDescription.style.textShadow = `0 0 8px ${scheme.glow.replace('0.6', '0.3')}`;
}

// ===== 時刻更新機能 =====
function updateTimepiece() {
    try {
        const currentTime = new Date();
        const hours24 = currentTime.getHours();
        const hours = hours24 % 12;
        const minutes = currentTime.getMinutes();
        const seconds = currentTime.getSeconds();
        const milliseconds = currentTime.getMilliseconds();
        const date = currentTime.getDate();
        
        // 高精度な角度計算（ミリ秒まで考慮した滑らかな動き）
        const preciseSeconds = seconds + (milliseconds / 1000);
        const hourAngle = (hours * HOUR_ANGLE_PER_HOUR) + (minutes * 0.5) + (preciseSeconds * 0.00833);
        const minuteAngle = (minutes * MINUTE_ANGLE_PER_MINUTE) + (preciseSeconds * 0.1);
        const secondAngle = preciseSeconds * SECOND_ANGLE_PER_SECOND;
        
        // 針の回転を適用
        hourHand.style.transform = `rotate(${hourAngle}deg)`;
        minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
        secondHand.style.transform = `rotate(${secondAngle}deg)`;
        
        // 日付表示更新
        dateWindow.textContent = date.toString().padStart(2, '0');
        
        // デジタル時刻表示更新
        const timeString = currentTime.toLocaleTimeString('ja-JP', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        digitalClock.textContent = timeString;
        
        // 歴史表示の更新
        if (historyData.length > 0) {
            const currentYear = timeToYear(hours24, minutes, seconds);
            const newHistoryEvent = getCurrentHistoryEvent(currentYear);
            
            // 新しい歴史イベントがある場合のみ表示を更新
            if (!currentHistoryEvent || newHistoryEvent.year !== currentHistoryEvent.year) {
                currentHistoryEvent = newHistoryEvent;
                showHistoryEvent(currentHistoryEvent);
            }
        }
        
    } catch (error) {
        console.error('時刻更新中にエラーが発生しました:', error);
    }
}

// ===== 3Dインタラクション効果 =====
let isHovering = false;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let deviceOrientationEnabled = false;
let currentColorScheme = 0; // 0: ゴールド, 1: プラチナ, 2: ローズゴールド, 3: ブラック
let isColorControlPanelVisible = false;

// 色の濃さ設定
let opacitySettings = {
    hourHand: 1.0,
    minuteHand: 1.0,
    centerHub: 1.0,
    hourIndex: 1.0,
    diamond: 1.0
};

// ===== カラースキーム定義 =====
const colorSchemes = [
    {
        name: 'ゴールド',
        bezel: 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700, #e6c200)',
        border: '#ffd700',
        indices: 'linear-gradient(to bottom, #ffed4e, #e6c200, #e6c200)',
        hands: 'linear-gradient(to top, #ffd700, #ffed4e, #fff)',
        hourHands: 'linear-gradient(to top, #e6c200, #ffd700, #ffed4e, #ffed4e)',
        minuteHands: 'linear-gradient(to top, #e6c200, #ffd700, #ffed4e, #ffed4e)',
        centerHub: 'radial-gradient(circle at 30% 30%, #ffd700, #e6c200, #b8860b), linear-gradient(45deg, #ffed4e, #ffd700)',
        glow: 'rgba(255, 215, 0, 0.6)',
        digital: '#ffd700'
    },
    {
        name: 'プラチナ',
        bezel: 'linear-gradient(45deg, #e5e5e5, #f8f8f8, #e5e5e5, #d0d0d0)',
        border: '#e5e5e5',
        indices: 'linear-gradient(to bottom, #e5e5e5, #f8f8f8, #d0d0d0)',
        hands: 'linear-gradient(to top, #e5e5e5, #f8f8f8, #fff)',
        hourHands: 'linear-gradient(to top, #d0d0d0, #e5e5e5, #f8f8f8, #fff)',
        minuteHands: 'linear-gradient(to top, #d0d0d0, #e5e5e5, #f8f8f8, #fff)',
        centerHub: 'radial-gradient(circle at 30% 30%, #e5e5e5, #d0d0d0, #b8b8b8), linear-gradient(45deg, #f8f8f8, #e5e5e5)',
        glow: 'rgba(229, 229, 229, 0.6)',
        digital: '#e5e5e5'
    },
    {
        name: 'ローズゴールド',
        bezel: 'linear-gradient(45deg, #e8b4b8, #f4d2d7, #e8b4b8, #d49499)',
        border: '#e8b4b8',
        indices: 'linear-gradient(to bottom, #e8b4b8, #f4d2d7, #d49499)',
        hands: 'linear-gradient(to top, #e8b4b8, #f4d2d7, #fff)',
        hourHands: 'linear-gradient(to top, #d49499, #e8b4b8, #f4d2d7, #fff)',
        minuteHands: 'linear-gradient(to top, #d49499, #e8b4b8, #f4d2d7, #fff)',
        centerHub: 'radial-gradient(circle at 30% 30%, #e8b4b8, #d49499, #b8787d), linear-gradient(45deg, #f4d2d7, #e8b4b8)',
        glow: 'rgba(232, 180, 184, 0.6)',
        digital: '#e8b4b8'
    },
    {
        name: 'ブラック',
        bezel: 'linear-gradient(45deg, #2a2a2a, #404040, #2a2a2a, #1a1a1a)',
        border: '#2a2a2a',
        indices: 'linear-gradient(to bottom, #2a2a2a, #404040, #1a1a1a)',
        hands: 'linear-gradient(to top, #2a2a2a, #404040, #666)',
        hourHands: 'linear-gradient(to top, #1a1a1a, #2a2a2a, #404040, #666)',
        minuteHands: 'linear-gradient(to top, #1a1a1a, #2a2a2a, #404040, #666)',
        centerHub: 'radial-gradient(circle at 30% 30%, #2a2a2a, #1a1a1a, #0a0a0a), linear-gradient(45deg, #404040, #2a2a2a)',
        glow: 'rgba(42, 42, 42, 0.6)',
        digital: '#2a2a2a'
    }
];

// ===== デバイス傾き検出関数 =====
function handleDeviceOrientation(event) {
    if (!isMobile) return;
    
    try {
        // デバイスの傾きを取得（gamma: 左右傾き, beta: 前後傾き）
        const gamma = event.gamma || 0; // -90 to 90 (左右)
        const beta = event.beta || 0;   // -180 to 180 (前後)
        
        // 傾きを制限して回転角度に変換
        const maxTilt = 30; // 最大傾き角度
        const rotateY = Math.max(-20, Math.min(20, (gamma / maxTilt) * 20));
        const rotateX = Math.max(-20, Math.min(20, -(beta / maxTilt) * 20));
        
        // 3D変形を適用
        watchCase.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        watchCase.style.boxShadow = `
            0 0 100px rgba(255, 255, 255, 0.6),
            inset 0 0 50px rgba(0, 0, 0, 0.08),
            0 30px 80px rgba(0, 0, 0, 0.8),
            0 10px 30px rgba(0, 0, 0, 0.4)
        `;
        
    } catch (error) {
        console.error('デバイス傾き処理中にエラーが発生しました:', error);
    }
}

// ===== モバイルデバイス傾き効果の初期化 =====
function initializeDeviceOrientation() {
    if (!isMobile) return;
    
    // iOS 13+での許可要求
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleDeviceOrientation);
                    deviceOrientationEnabled = true;
                    console.log('デバイス傾き検出が有効になりました');
                }
            })
            .catch(console.error);
    } else {
        // その他のモバイルデバイス
        window.addEventListener('deviceorientation', handleDeviceOrientation);
        deviceOrientationEnabled = true;
        console.log('デバイス傾き検出が有効になりました');
    }
}

// マウスホバー開始時の処理
watchCase.addEventListener('mouseenter', function() {
    if (isMobile) return; // モバイルではマウス効果を無効化
    
    console.log('マウスホバー開始');
    isHovering = true;
    
    this.style.transform = 'rotateX(15deg) rotateY(15deg) scale(1.05)';
    this.style.boxShadow = `
        0 0 100px rgba(255, 255, 255, 0.6),
        inset 0 0 50px rgba(0, 0, 0, 0.08),
        0 30px 80px rgba(0, 0, 0, 0.8),
        0 10px 30px rgba(0, 0, 0, 0.4)
    `;
});

// マウスホバー終了時の処理
watchCase.addEventListener('mouseleave', function() {
    if (isMobile) return; // モバイルではマウス効果を無効化
    
    console.log('マウスホバー終了');
    isHovering = false;
    
    this.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    this.style.boxShadow = `
        0 0 80px rgba(255, 255, 255, 0.4),
        inset 0 0 50px rgba(0, 0, 0, 0.08),
        0 25px 60px rgba(0, 0, 0, 0.6),
        0 5px 20px rgba(0, 0, 0, 0.3)
    `;
});

// ===== マウス移動による動的な光の反射効果 =====
document.addEventListener('mousemove', function(e) {
    if (isMobile || !isHovering) return; // モバイルでは無効化
    
    try {
        const rect = watchCase.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        // マウス位置に基づいた回転角度の計算
        const rotateY = (mouseX / (rect.width / 2)) * 15;
        const rotateX = -(mouseY / (rect.height / 2)) * 15;
        
        watchCase.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        
    } catch (error) {
        console.error('マウス移動処理中にエラーが発生しました:', error);
    }
});

// ===== カラースキーム変更機能 =====
function changeColorScheme() {
    currentColorScheme = (currentColorScheme + 1) % colorSchemes.length;
    const scheme = colorSchemes[currentColorScheme];
    
    // ベゼル色変更
    const diamondBezel = document.querySelector('.diamond-bezel');
    diamondBezel.style.background = `${scheme.bezel}, radial-gradient(circle at 30% 30%, #fff, transparent 60%)`;
    
    // インデックス色変更
    const hourIndices = document.querySelectorAll('.hour-index');
    hourIndices.forEach(index => {
        index.style.background = `${scheme.indices}, radial-gradient(ellipse at center, #fff, transparent 70%)`;
        index.style.boxShadow = `0 0 12px ${scheme.glow}, inset 0 0 3px rgba(255, 255, 255, 0.8)`;
    });
    
    // ダイヤモンド枠色変更
    const premiumDiamonds = document.querySelectorAll('.premium-diamond');
    premiumDiamonds.forEach(diamond => {
        diamond.style.borderColor = scheme.border;
        diamond.style.boxShadow = `0 0 25px rgba(255, 255, 255, 0.9), inset 0 0 8px rgba(0, 0, 0, 0.15), 0 0 15px ${scheme.glow}`;
    });
    
    // 針色変更
    const hourHand = document.getElementById('hourHand');
    const minuteHand = document.getElementById('minuteHand');
    hourHand.style.background = `${scheme.hourHands}, radial-gradient(ellipse at center, rgba(255, 255, 255, 0.9), transparent 60%)`;
    minuteHand.style.background = `${scheme.minuteHands}, radial-gradient(ellipse at center, rgba(255, 255, 255, 0.9), transparent 60%)`;
    
    // 中心ハブ色変更
    const centerHub = document.querySelector('.center-hub');
    centerHub.style.background = scheme.centerHub;
    centerHub.style.boxShadow = `0 0 15px ${scheme.glow}, inset 0 0 5px rgba(255, 255, 255, 0.6)`;
    
    // 日付表示枠色変更
    const dateDisplay = document.getElementById('dateWindow');
    dateDisplay.style.borderColor = scheme.border;
    dateDisplay.style.boxShadow = `inset 0 0 8px rgba(0, 0, 0, 0.15), 0 0 10px ${scheme.glow}`;
    
    // デジタル表示色変更
    const digitalClock = document.getElementById('digitalClock');
    digitalClock.style.color = scheme.digital;
    digitalClock.style.textShadow = `0 0 15px ${scheme.glow}, 0 0 30px ${scheme.glow.replace('0.6', '0.4')}`;
    digitalClock.style.borderColor = scheme.glow.replace('0.6', '0.3');
    
    // 歴史詳細表示の色も更新
    if (historyDetail.classList.contains('visible')) {
        updateHistoryDetailColors();
    }
    
    console.log(`カラースキームを${scheme.name}に変更しました`);
}

// 歴史表示のクリックイベント
historyDisplay.addEventListener('click', function(e) {
    e.stopPropagation();
    console.log('歴史表示クリック:', {
        currentHistoryEvent: currentHistoryEvent,
        historyDisplayVisible: historyDisplay.classList.contains('visible')
    });
    if (currentHistoryEvent) {
        console.log('詳細表示を実行します');
        showHistoryDetail(currentHistoryEvent);
    } else {
        console.log('currentHistoryEventがnullです');
    }
});

// PCでのクリックイベント（歴史表示以外）
if (!isMobile) {
    watchCase.addEventListener('click', function(e) {
        // 歴史表示がクリックされた場合は色変更しない
        if (e.target.closest('.history-display')) {
            return;
        }
        e.preventDefault();
        changeColorScheme();
    });
}

// ===== 色の濃さ調整機能 =====
const hiddenTrigger = document.getElementById('hiddenTrigger');
const colorControlPanel = document.getElementById('colorControlPanel');
const closePanelBtn = document.getElementById('closePanelBtn');

// 各スライダーとその値表示
const hourHandSlider = document.getElementById('hourHandOpacity');
const minuteHandSlider = document.getElementById('minuteHandOpacity');
const centerHubSlider = document.getElementById('centerHubOpacity');
const hourIndexSlider = document.getElementById('hourIndexOpacity');
const diamondSlider = document.getElementById('diamondOpacity');

const hourHandValueDisplay = document.getElementById('hourHandValue');
const minuteHandValueDisplay = document.getElementById('minuteHandValue');
const centerHubValueDisplay = document.getElementById('centerHubValue');
const hourIndexValueDisplay = document.getElementById('hourIndexValue');
const diamondValueDisplay = document.getElementById('diamondValue');

// 隠れ機能エリアのクリックイベント
hiddenTrigger.addEventListener('click', function() {
    isColorControlPanelVisible = !isColorControlPanelVisible;
    if (isColorControlPanelVisible) {
        colorControlPanel.classList.add('visible');
    } else {
        colorControlPanel.classList.remove('visible');
    }
});

// パネルを閉じるボタン
closePanelBtn.addEventListener('click', function() {
    isColorControlPanelVisible = false;
    colorControlPanel.classList.remove('visible');
});

// 色の濃さを適用する関数
function applyOpacitySettings() {
    const hourHand = document.getElementById('hourHand');
    const minuteHand = document.getElementById('minuteHand');
    const centerHub = document.querySelector('.center-hub');
    const hourIndices = document.querySelectorAll('.hour-index');
    const premiumDiamonds = document.querySelectorAll('.premium-diamond');
    
    // 時針の不透明度
    hourHand.style.opacity = opacitySettings.hourHand;
    
    // 分針の不透明度
    minuteHand.style.opacity = opacitySettings.minuteHand;
    
    // 中心ハブの不透明度
    centerHub.style.opacity = opacitySettings.centerHub;
    
    // 時間インデックスの不透明度
    hourIndices.forEach(index => {
        index.style.opacity = opacitySettings.hourIndex;
    });
    
    // プレミアムダイヤモンドの不透明度
    premiumDiamonds.forEach(diamond => {
        diamond.style.opacity = opacitySettings.diamond;
    });
}

// スライダーのイベントリスナー
hourHandSlider.addEventListener('input', function() {
    const value = this.value / 100;
    opacitySettings.hourHand = value;
    hourHandValueDisplay.textContent = this.value + '%';
    applyOpacitySettings();
    saveOpacitySettings();
});

minuteHandSlider.addEventListener('input', function() {
    const value = this.value / 100;
    opacitySettings.minuteHand = value;
    minuteHandValueDisplay.textContent = this.value + '%';
    applyOpacitySettings();
    saveOpacitySettings();
});

centerHubSlider.addEventListener('input', function() {
    const value = this.value / 100;
    opacitySettings.centerHub = value;
    centerHubValueDisplay.textContent = this.value + '%';
    applyOpacitySettings();
    saveOpacitySettings();
});

hourIndexSlider.addEventListener('input', function() {
    const value = this.value / 100;
    opacitySettings.hourIndex = value;
    hourIndexValueDisplay.textContent = this.value + '%';
    applyOpacitySettings();
    saveOpacitySettings();
});

diamondSlider.addEventListener('input', function() {
    const value = this.value / 100;
    opacitySettings.diamond = value;
    diamondValueDisplay.textContent = this.value + '%';
    applyOpacitySettings();
    saveOpacitySettings();
});

// 設定の保存
function saveOpacitySettings() {
    try {
        localStorage.setItem('luxuryWatchOpacitySettings', JSON.stringify(opacitySettings));
    } catch (error) {
        console.warn('不透明度設定の保存に失敗しました:', error);
    }
}

// 設定の読み込み
function loadOpacitySettings() {
    try {
        const saved = localStorage.getItem('luxuryWatchOpacitySettings');
        if (saved) {
            const savedSettings = JSON.parse(saved);
            opacitySettings = { ...opacitySettings, ...savedSettings };
            
            // スライダーの値を更新
            hourHandSlider.value = Math.round(opacitySettings.hourHand * 100);
            minuteHandSlider.value = Math.round(opacitySettings.minuteHand * 100);
            centerHubSlider.value = Math.round(opacitySettings.centerHub * 100);
            hourIndexSlider.value = Math.round(opacitySettings.hourIndex * 100);
            diamondSlider.value = Math.round(opacitySettings.diamond * 100);
            
            // 表示値を更新
            hourHandValueDisplay.textContent = hourHandSlider.value + '%';
            minuteHandValueDisplay.textContent = minuteHandSlider.value + '%';
            centerHubValueDisplay.textContent = centerHubSlider.value + '%';
            hourIndexValueDisplay.textContent = hourIndexSlider.value + '%';
            diamondValueDisplay.textContent = diamondSlider.value + '%';
            
            // 不透明度を適用
            applyOpacitySettings();
        }
    } catch (error) {
        console.warn('不透明度設定の読み込みに失敗しました:', error);
    }
}

// ===== 初期化処理 =====
console.log('高級時計プログラムを初期化中...');

// 歴史データを読み込んでから時計を開始
loadHistoryData().then(() => {
    // 最初の時刻表示
    updateTimepiece();
    
    // 定期的な時刻更新（高頻度更新で滑らかな秒針）
    setInterval(updateTimepiece, CLOCK_UPDATE_INTERVAL);
    
    console.log('歴史時計機能が有効になりました');
});

// モバイルデバイス傾き効果の初期化
if (isMobile) {
    // ユーザーの最初のタッチで傾き検出を有効化
    document.addEventListener('touchstart', function() {
        initializeDeviceOrientation();
    }, { once: true });
}

// 初期化時に設定を読み込み
loadOpacitySettings();

console.log('高級時計プログラムの初期化が完了しました');