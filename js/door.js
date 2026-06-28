// 大糸線データ
const lineData = {
    name: "大糸線",
    stations: [
        { name: "松本", zone: 1 },
        { name: "北松本", zone: 2 },
        { name: "島内", zone: 3 },
        { name: "島高松", zone: 4 },
        { name: "梓橋", zone: 5 },
        { name: "一日市場", zone: 6 }
    ]
};

// 方向幕の行先リスト
const destinations = ["ワンマン 松本", "ワンマン 信濃大町", "ワンマン 南小谷", "回送"];
let currentSignIndex = 0;

let currentStationIndex = 0;
const totalBoxes = 24;
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

// 行先幕・発券機要素
const btnRollSign = document.getElementById('btn-roll-sign');
const rollSignText = document.getElementById('roll-sign-text');
const ticketPaper = document.getElementById('ticket-paper');
const ticketNum = document.getElementById('ticket-num');
const ticketStation = document.getElementById('ticket-station');
const machineLamp = document.getElementById('machine-lamp');
const btnGetTicket = document.getElementById('btn-get-ticket');

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

// 運賃表と駅表示の更新
function updateDisplay() {
    const stations = lineData.stations;
    const targetStation = stations[currentStationIndex];
    
    if (currentStationIndex === 0) {
        nextStationNameEl.textContent = `${stations[0].name} (始発前)`;
        currentStationTextEl.textContent = "松本駅に停車中";
        clearAllBoxes();
    } else {
        nextStationNameEl.textContent = targetStation.name;
        currentStationTextEl.textContent = `次は ${targetStation.name}`;

        for (let i = 1; i <= totalBoxes; i++) {
            const box = document.getElementById(`box-${i}`);
            const fareValueEl = box.querySelector('.fare-value');
            if (i < targetStation.zone) {
                box.classList.remove('disabled');
                const stationDiff = targetStation.zone - i;
                fareValueEl.textContent = 150 + (stationDiff * 40);
            } else {
                box.classList.add('disabled');
                fareValueEl.textContent = '';
            }
        }
    }

    // 駅が変わったら自動で新しい整理券を「シュッ」と発券する
    issueTicket(targetStation.zone, targetStation.name);
}

function clearAllBoxes() {
    for (let i = 1; i <= totalBoxes; i++) {
        const box = document.getElementById(`box-${i}`);
        box.classList.add('disabled');
        box.querySelector('.fare-value').textContent = '';
    }
}

// 【新機能】整理券を発券するロジック
function issueTicket(zone, stationName) {
    // 一旦引っ込める
    ticketPaper.classList.remove('issued');
    machineLamp.classList.remove('active');

    setTimeout(() => {
        // 券面データを書き換えてシュッと出す
        ticketNum.textContent = String(zone).padStart(2, '0');
        ticketStation.textContent = stationName;
        ticketPaper.classList.add('issued');
        machineLamp.classList.add('active'); // ランプ点灯
    }, 500);
}

// 整理券を取るボタン
btnGetTicket.addEventListener('click', () => {
    ticketPaper.classList.remove('issued');
    machineLamp.classList.remove('active');
});

// 【新機能】方向幕をガラガラ回転させるロジック
btnRollSign.addEventListener('click', () => {
    rollSignText.classList.add('rolling'); // 上にスクロールして消えるアニメーション

    setTimeout(() => {
        currentSignIndex = (currentSignIndex + 1) % destinations.length;
        rollSignText.textContent = destinations[currentSignIndex];
        rollSignText.classList.remove('rolling'); // 下からパッと戻る
    }, 400);
});

// 運行ボタン
btnNext.addEventListener('click', () => {
    if (isDoorOpen) return;
    if (currentStationIndex < lineData.stations.length - 1) {
        currentStationIndex++;
        updateDisplay();
    }
});

btnPrev.addEventListener('click', () => {
    if (isDoorOpen) return;
    if (currentStationIndex > 0) {
        currentStationIndex--;
        updateDisplay();
    }
});

// 車掌スイッチ
keySwitch.addEventListener('click', () => {
    if (!isUnlocked) {
        isUnlocked = true;
        keySwitch.textContent = "🔑 解除";
        keySwitch.classList.add('unlocked');
        leverOpen.disabled = false;
        statusText.textContent = "扉操作可能";
        statusText.style.color = "#ffd700";
    } else {
        if (isDoorOpen) return;
        isUnlocked = false;
        keySwitch.textContent = "🔑 ロック";
        keySwitch.classList.remove('unlocked');
        leverOpen.disabled = true;
        btnClose.disabled = true;
        statusText.textContent = "固定";
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

initDisplay();