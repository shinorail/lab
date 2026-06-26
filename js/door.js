// ステート（状態）管理
let isUnlocked = false; // 車掌鍵のロック状態
let isDoorOpen = false; // ドアの開閉状態

// HTML要素の取得
const keySwitch = document.getElementById('key-switch');
const leverOpen = document.getElementById('lever-open');
const btnClose = document.getElementById('btn-close');
const doorLeft = document.getElementById('door-left');
const doorRight = document.getElementById('door-right');
const statusText = document.getElementById('status-text');

// 1. 車掌鍵の操作
keySwitch.addEventListener('click', () => {
    if (!isUnlocked) {
        // ロック解除
        isUnlocked = true;
        keySwitch.textContent = "🔑 解除中";
        keySwitch.classList.add('unlocked');
        leverOpen.disabled = false; // ドア開レバーを操作可能にする
        statusText.textContent = "ロック解除（扉操作可能）";
        statusText.style.color = "#ffcc00";
    } else {
        // ドアが開いている時は鍵をロックできない（安全装置）
        if (isDoorOpen) {
            alert("扉が開いているため、車掌鍵を固定できません！");
            return;
        }
        // 再びロック
        isUnlocked = false;
        keySwitch.textContent = "🔑 ロック中";
        keySwitch.classList.remove('unlocked');
        leverOpen.disabled = true;
        btnClose.disabled = true;
        statusText.textContent = "固定（ロック）";
        statusText.style.color = "#ff4444";
    }
});

// 2. ドア「開」レバーの操作（上げる）
leverOpen.addEventListener('click', () => {
    if (!isUnlocked) return;

    if (!isDoorOpen) {
        // レバーを上げてドアを開ける
        isDoorOpen = true;
        leverOpen.classList.add('on');
        leverOpen.textContent = "開";
        
        // ドアのアニメーション開始（CSSのclassを追加）
        doorLeft.classList.add('open');
        doorRight.classList.add('open');

        btnClose.disabled = false; // ドア閉ボタンを有効化
        statusText.textContent = "扉 開（レバー投入中）";
        statusText.style.color = "#34a853";
    }
});

// 3. ドア「閉」ボタンの操作（押す）
btnClose.addEventListener('click', () => {
    if (!isUnlocked || !isDoorOpen) return;

    // ドアを閉める
    isDoorOpen = false;
    leverOpen.classList.remove('on');
    leverOpen.textContent = "切";

    // ドアのアニメーション（CSSのclassを外す）
    doorLeft.classList.remove('open');
    doorRight.classList.remove('open');

    btnClose.disabled = true; // ドア閉ボタンを無効化
    statusText.textContent = "扉 閉（ロック解除中）";
    statusText.style.color = "#ffcc00";
});