// 状態管理
let keyPosition = "off"; 
let isDoorOpen = false;

// 音声ファイルの定義（フォルダ構造に合わせる）
const sndBuzzer = new Audio('audio/buzzer.mp3');
const sndChime = document.getElementById('btn-chime') ? new Audio('audio/chime.mp3') : null;
const sndDoorOpen = new Audio('audio/door_open.mp3');
const sndDoorClose = new Audio('audio/door_close.mp3');

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
    if (isDoorOpen) return;

    keyCylinder.classList.remove('pos-off', 'pos-semi', 'pos-auto');
    
    if (keyPosition === "off") {
        keyPosition = "semi"; // 【半自動モード】
        keyCylinder.classList.add('pos-semi');
        enableLevers(true);
        // 半自動のときは車内ボタンの「あける」が有効化の待機状態になる
        btnInsideOpen.disabled = false;
    } else if (keyPosition === "semi") {
        keyPosition = "auto"; // 【自動モード】
        keyCylinder.classList.add('pos-auto');
        enableLevers(true);
        btnInsideOpen.disabled = true;
        btnInsideClose.disabled = true;
    } else {
        keyPosition = "off";
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
        // 自動モードなら即開く
        openDoorSystem();
    } else if (keyPosition === "semi") {
        // 半自動モードなら、車掌が許可を出したので車内「あける」ボタンがピカピカ光る
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
        btnInsideClose.disabled = false; // しめるボタンを有効化
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

// 🚪 ドアを開ける共通処理（音・ランプ）
function openDoorSystem() {
    isDoorOpen = true;
    leverOpen.classList.add('active');
    leverClose.classList.remove('active');
    doorIndicator.classList.add('lit');
    
    // 音声を再生
    sndDoorOpen.currentTime = 0;
    sndDoorOpen.play().catch(e => console.log("音声ファイルがまだありません"));
}

// 🚪 ドアを閉める共通処理（音・ランプ）
function closeDoorSystem() {
    isDoorOpen = false;
    leverClose.classList.add('active');
    leverOpen.classList.remove('active');
    doorIndicator.classList.add('lit'); // 一瞬消灯、実車同様に完全に閉まるまで
    doorIndicator.classList.remove('lit');
    
    sndDoorClose.currentTime = 0;
    sndDoorClose.play().catch(e => console.log("音声ファイルがまだありません"));
}

// 6. 連絡ブザー（押している間鳴るようにする）
btnBuzzer.addEventListener('mousedown', () => {
    sndBuzzer.currentTime = 0;
    sndBuzzer.play().catch(e => {});
});
if (btnChime) {
    btnChime.addEventListener('click', () => {
        sndChime.currentTime = 0;
        sndChime.play().catch(e => {});
    });
}