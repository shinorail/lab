// 状態管理
let keyPosition = "off"; 
let isDoorOpen = false;

// Web Audio APIの初期化（音を合成する心臓部）
let audioCtx = null;
let buzzerOsc = null; // 押しっぱなしに対応するためのブザー保持用

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// HTML要素の取得
const keyCylinder = document.getElementById('key-cylinder');
const leverOpen = document.getElementById('lever-open');
const leverClose = document.getElementById('lever-close');
const doorIndicator = document.getElementById('door-indicator');
const btnBuzzer = document.getElementById('btn-buzzer');
const btnChime = document.getElementById('btn-chime');
const btnInsideOpen = document.getElementById('btn-inside-open');
const btnInsideClose = document.getElementById('btn-inside-close');

// 1. 車掌鍵の切り替え
keyCylinder.addEventListener('click', () => {
    initAudio(); // 画面タップ時にオーディオを有効化
    if (isDoorOpen) return;

    keyCylinder.classList.remove('pos-off', 'pos-semi', 'pos-auto');
    
    if (keyPosition === "off") {
        keyPosition = "semi"; // 半自動
        keyCylinder.classList.add('pos-semi');
        enableLevers(true);
        btnInsideOpen.disabled = false;
    } else if (keyPosition === "semi") {
        keyPosition = "auto"; // 自動
        keyCylinder.classList.add('pos-auto');
        enableLevers(true);
        btnInsideOpen.disabled = true;
        btnInsideClose.disabled = true;
    } else {
        keyPosition = "off"; // 切
        keyCylinder.classList.add('pos-off');
        enableLevers(false);
        btnInsideOpen.disabled = true;
        btnInsideClose.disabled = true;
    }
});

function enableLevers(enabled) {
    leverOpen.disabled = !enabled;
    leverClose.disabled = !enabled;
}

// 2. 車掌スイッチ「開」
leverOpen.addEventListener('click', () => {
    if (keyPosition === "off" || isDoorOpen) return;
    if (keyPosition === "auto") {
        openDoorSystem();
    } else if (keyPosition === "semi") {
        btnInsideOpen.disabled = false;
    }
});

// 3. 車掌スイッチ「閉」
leverClose.addEventListener('click', () => {
    if (keyPosition === "off" || !isDoorOpen) return;
    closeDoorSystem();
});

// 4. 車内ボタン「あける」
btnInsideOpen.addEventListener('click', () => {
    if (keyPosition === "semi" && !isDoorOpen) {
        openDoorSystem();
        btnInsideOpen.disabled = true;
        btnInsideClose.disabled = false;
    }
});

// 5. 車内ボタン「しめる」
btnInsideClose.addEventListener('click', () => {
    if (keyPosition === "semi" && isDoorOpen) {
        closeDoorSystem();
        btnInsideOpen.disabled = false;
        btnInsideClose.disabled = true;
    }
});

// 🚪 ドアを開ける（プシュー音の代わりに電子音で通知）
function openDoorSystem() {
    isDoorOpen = true;
    leverOpen.classList.add('active');
    leverClose.classList.remove('active');
    doorIndicator.classList.add('lit');
    playTone(880, 'sine', 0.1); // ピッ（高音）
}

// 🚪 ドアを閉める
function closeDoorSystem() {
    isDoorOpen = false;
    leverClose.classList.add('active');
    leverOpen.classList.remove('active');
    doorIndicator.classList.remove('lit');
    playTone(440, 'sine', 0.1); // ポッ（低音）
}

// 🔊 【電子音を合成する関数】
function playTone(freq, type, duration) {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime); // 音量調整
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration); // 滑らかに消音
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// 6. 連絡ブザー（押している間だけ「ブーーー」と鳴るリアル仕様）
btnBuzzer.addEventListener('mousedown', () => {
    initAudio();
    if (buzzerOsc) return; // 既に鳴ってたら無視
    
    buzzerOsc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    buzzerOsc.type = 'sawtooth'; // 実車のブザーに近いギザギザ波形
    buzzerOsc.frequency.setValueAtTime(400, audioCtx.currentTime); // 400Hzの低い音
    
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    
    buzzerOsc.connect(gain);
    gain.connect(audioCtx.destination);
    buzzerOsc.start();
});

// マウスや指を離したらブザーを止める
const stopBuzzer = () => {
    if (buzzerOsc) {
        buzzerOsc.stop();
        buzzerOsc.disconnect();
        buzzerOsc = null;
    }
};
btnBuzzer.addEventListener('mouseup', stopBuzzer);
btnBuzzer.addEventListener('mouseleave', stopBuzzer);
btnBuzzer.addEventListener('touchend', stopBuzzer); // スマホ対応

// 7. 促進チャイム（JR東日本風の電子音「ピピピピ、ピピピピ」を計算で再現）
if (btnChime) {
    btnChime.addEventListener('click', () => {
        initAudio();
        const now = audioCtx.currentTime;
        const notes = [1320, 1320, 1320, 1320]; // 電子チャイムの音程
        
        notes.forEach((freq, index) => {
            const timeOffset = index * 0.15; // 音と音の間隔
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + timeOffset);
            
            gain.gain.setValueAtTime(0.2, now + timeOffset);
            gain.gain.exponentialRampToValueAtTime(0.00001, now + timeOffset + 0.1);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now + timeOffset);
            osc.stop(now + timeOffset + 0.1);
        });
    });
}