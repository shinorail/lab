// 大糸線データ
const lineData = {
    name: "大糸線",
    stations: [
        { name: "松本", zone: 1 },
        { name: "北松本", zone: 2 },
        { name: "島内", zone: 3 },
        { name: "島高松", zone: 4 },
        { name: "梓橋", zone: 5 },
        { name: "一日市場", zone: 6 },
        { name: "中萱", zone: 7 },
        { name: "南豊科", zone: 8 },
        { name: "豊科", zone: 9 },
        { name: "柏矢町", zone: 10 },
        { name: "穂高", zone: 11 }
    ]
};

let currentStationIndex = 0;
const totalBoxes = 24;

// スイッチ状態
let isUnlocked = false;
let isDoorOpen = false;

// 要素取得
const fareGrid = document.getElementById('fare-grid');
const nextStationNameEl = document.getElementById('next-station-name');
const currentStationTextEl = document.getElementById('current-station-text');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

const keySwitch = document.getElementById('key-switch');
const leverOpen = document.getElementById('lever-open');
const btnClose = document.getElementById('btn-close');
const doorLeft = document.getElementById('door-left');
const doorRight = document.getElementById('door-right');
const statusText = document.getElementById('status-text');

// 運賃マス初期生成
function initDisplay() {
    fareGrid.innerHTML = '';
    for (let i = 1; i <= totalBoxes; i++) {
        const box = document.createElement('div');
        box.className = 'fare-box disabled';
        box.id = `box-${i}`;

        const numLabel = document.createElement('span');
        numLabel.className = 'num-label';
        numLabel.textContent = String(i).padStart(2, '0');

        const fareValue = document.createElement('span');
        fareValue.className = 'fare-value';

        box.appendChild(numLabel);
        box.appendChild(fareValue);
        fareGrid.appendChild(box);
    }
    updateDisplay();
}

// 運賃表アップデート
function updateDisplay() {
    const stations = lineData.stations;
    
    if (currentStationIndex === 0) {
        nextStationNameEl.textContent = `${stations[0].name} (始発前)`;
        currentStationTextEl.textContent = "松本駅に停車中";
        clearAllBoxes();
        return;
    }

    const targetStation = stations[currentStationIndex];
    nextStationNameEl.textContent = targetStation.name;
    currentStationTextEl.textContent = `${stations[currentStationIndex - 1].name} を発車 ➔ 次は ${targetStation.name}`;

    for (let i = 1; i <= totalBoxes; i++) {
        const box = document.getElementById(`box-${i}`);
        const fareValueEl = box.querySelector('.fare-value');

        if (i < targetStation.zone) {
            box.classList.remove('disabled');
            const stationDiff = targetStation.zone - i;
            let calculatedFare = 150 + (stationDiff * 40);
            if (calculatedFare > 500) calculatedFare = 500;
            fareValueEl.textContent = calculatedFare;
        } else {
            box.classList.add('disabled');
            fareValueEl.textContent = '';
        }
    }
}

function clearAllBoxes() {
    for (let i = 1; i <= totalBoxes; i++) {
        const box = document.getElementById(`box-${i}`);
        box.classList.add('disabled');
        box.querySelector('.fare-value').textContent = '';
    }
}

// 運行ボタンのイベント
btnNext.addEventListener('click', () => {
    if (isDoorOpen) {
        alert("扉が開いた状態では出発できません！");
        return;
    }
    if (currentStationIndex < lineData.stations.length - 1) {
        currentStationIndex++;
        updateDisplay();
    } else {
        alert("終点に到着しました。");
    }
});

btnPrev.addEventListener('click', () => {
    if (isDoorOpen) return;
    if (currentStationIndex > 0) {
        currentStationIndex--;
        updateDisplay();
    }
});

// 車掌スイッチイベント
keySwitch.addEventListener('click', () => {
    if (!isUnlocked) {
        isUnlocked = true;
        keySwitch.textContent = "🔑 解除";
        keySwitch.classList.add('unlocked');
        leverOpen.disabled = false;
        statusText.textContent = "解除（扉操作可能）";
        statusText.style.color = "#ffd700";
    } else {
        if (isDoorOpen) {
            alert("扉が開いている時はロックできません！");
            return;
        }
        isUnlocked = false;
        keySwitch.textContent = "🔑 ロック";
        keySwitch.classList.remove('unlocked');
        leverOpen.disabled = true;
        btnClose.disabled = true;
        statusText.textContent = "固定（ロック）";
        statusText.style.color = "#ff5252";
    }
});

leverOpen.addEventListener('click', () => {
    if (!isUnlocked || isDoorOpen) return;
    isDoorOpen = true;
    leverOpen.classList.add('on');
    doorLeft.classList.add('open');
    doorRight.classList.add('open');
    btnClose.disabled = false;
    statusText.textContent = "扉 開";
    statusText.style.color = "#4caf50";
});

btnClose.addEventListener('click', () => {
    if (!isUnlocked || !isDoorOpen) return;
    isDoorOpen = false;
    leverOpen.classList.remove('on');
    doorLeft.classList.remove('open');
    doorRight.classList.remove('open');
    btnClose.disabled = true;
    statusText.textContent = "扉 閉";
    statusText.style.color = "#ffd700";
});

// 起動
initDisplay();