// 状態管理
let keyPosition = "off"; // "auto" (自動), "off" (切), "semi" (半自動)
let isDoorOpen = false;

// HTML要素の取得
const keyCylinder = document.getElementById('key-cylinder');
const leverOpen = document.getElementById('lever-open');
const leverClose = document.getElementById('lever-close');
const doorIndicator = document.getElementById('door-indicator');
const btnBuzzer = document.getElementById('btn-buzzer');
const btnChime = document.getElementById('btn-chime');

// 1. 車掌鍵ロータリースイッチのタップ切り替え
keyCylinder.addEventListener('click', () => {
    if (isDoorOpen) {
        alert("扉が開いている時は、車掌鍵を『切』にできません！");
        return;
    }

    // カチカチと状態をループ切り替え (切 -> 半自動 -> 自動 -> 切)
    keyCylinder.classList.remove('pos-off', 'pos-semi', 'pos-auto');
    
    if (keyPosition === "off") {
        keyPosition = "semi";
        keyCylinder.classList.add('pos-semi');
        enableLevers(true);
    } else if (keyPosition === "semi") {
        keyPosition = "auto";
        keyCylinder.classList.add('pos-auto');
        enableLevers(true);
    } else {
        keyPosition = "off";
        keyCylinder.classList.add('pos-off');
        enableLevers(false);
    }
});

// レバーのロック/解除を切り替える関数
function enableLevers(enabled) {
    leverOpen.disabled = !enabled;
    leverClose.disabled = !enabled;
}

// 2. ドア「開」レバーの操作
leverOpen.addEventListener('click', () => {
    if (keyPosition === "off" || isDoorOpen) return;

    isDoorOpen = true;
    leverOpen.classList.add('active');
    leverClose.classList.remove('active');
    
    // 側灯（表示灯）を点灯
    doorIndicator.classList.add('lit');
});

// 3. ドア「閉」レバーの操作
leverClose.addEventListener('click', () => {
    if (keyPosition === "off" || !isDoorOpen) return;

    isDoorOpen = false;
    leverClose.classList.add('active');
    leverOpen.classList.remove('active');
    
    // 側灯（表示灯）を消灯
    doorIndicator.classList.remove('lit');
});

// 4. 連絡ブザーと促進チャイム（擬似クリック動作のみ）
btnBuzzer.addEventListener('mousedown', () => { /* ボタン押し下げの演出用 */ });
btnChime.addEventListener('mousedown', () => { /* ボタン押し下げの演出用 */ });