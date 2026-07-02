// 路線データベース
const lineDatabase = {
    ooito: {
        name: "大糸線",
        stations: [
            { name: "松本", zone: 1, text: "大糸線ワンマン列車です。次は 北松本 です。" },
            { name: "北松本", zone: 2, text: "次は 島内 です。運賃は運賃表示器でお確かめください。" },
            { name: "島内", zone: 3, text: "次は 島高松 です。一番前のドアからお降りください。" },
            { name: "島高松", zone: 4, text: "次は 梓橋 です。整理券をお持ちください。" },
            { name: "梓橋", zone: 5, text: "次は 一日市場 です。まもなく一日市場です。" },
            { name: "一日市場", zone: 6, text: "次は 中萱 です。お出口は右側です。" },
            { name: "中萱", zone: 7, text: "次は 南豊科 です。" },
            { name: "南豊科", zone: 8, text: "次は 豊科 です。" },
            { name: "豊科", zone: 9, text: "次は 柏矢町 です。" },
            { name: "柏矢町", zone: 10, text: "次は 穂高 です。" },
            { name: "穂高", zone: 11, text: "次は 有明 です。" },
            { name: "有明", zone: 12, text: "次は 安曇追分 です。" },
            { name: "安曇追分", zone: 13, text: "次は 信濃大町 です。この列車の終点です。" },
            { name: "信濃大町", zone: 14, text: "大糸線、終点 信濃大町 です。どなた様もお忘れ物のないよう…" }
        ]
    },
    shinonoi: {
        name: "篠ノ井線",
        stations: [
            { name: "松本", zone: 1, text: "篠ノ井線、長野行きワンマン列車です。次は 田沢 です。" },
            { name: "田沢", zone: 2, text: "次は 明科 です。運賃表をご確認ください。" },
            { name: "明科", zone: 3, text: "次は 西条 です。長いトンネルに入ります。" },
            { name: "西条", zone: 4, text: "次は 坂北 です。" },
            { name: "坂北", zone: 5, text: "次は 聖高原 です。" },
            { name: "聖高原", zone: 6, text: "次は 冠着 です。" },
            { name: "冠着", zone: 7, text: "次は 姥捨 です。日本三大車窓、スイッチバックの駅です。" },
            { name: "姥捨", zone: 8, text: "次は 稲荷山 です。スイッチバックのため一度バックします。" },
            { name: "稲荷山", zone: 9, text: "次は 篠ノ井 です。しなの鉄道線はお乗り換えです。" },
            { name: "篠ノ井", zone: 10, text: "次は 今井 です。これより信越本線に乗り入れます。" },
            { name: "今井", zone: 11, text: "次は 川中島 です。" },
            { name: "川中島", zone: 12, text: "次は 安茂里 です。" },
            { name: "安茂里", zone: 13, text: "次は 終点 長野 です。新幹線、飯山線はお乗り換えです。" },
            { name: "長野", zone: 14, text: "ご乗車ありがとうございました。終点 長野 に到着です。" }
        ]
    },
    chuo: {
        name: "中央本線",
        stations: [
            { name: "松本", zone: 1, text: "中央本線ワンマン列車です。次は 南松本 です。" },
            { name: "南松本", zone: 2, text: "次は 平田 です。" },
            { name: "平田", zone: 3, text: "次は 村井 です。" },
            { name: "村井", zone: 4, text: "次は 広丘 です。" },
            { name: "広丘", zone: 5, text: "次は 塩尻 です。中央東線、中央西線はお乗り換えです。" },
            { name: "塩尻", zone: 6, text: "次は みどり湖 です。" },
            { name: "みどり湖", zone: 7, text: "次は 岡谷 です。" },
            { name: "岡谷", zone: 8, text: "次は 下諏訪 です。" },
            { name: "下諏訪", zone: 9, text: "次は 終点 上諏訪 です。" },
            { name: "上諏訪", zone: 10, text: "ご乗車ありがとうございました。終点 上諏訪 です。" }
        ]
    }
};

// データの読み込み（なければデフォルトは大糸線）
let currentLineKey = localStorage.getItem('selectedLine') || "ooito";
let savedType = localStorage.getItem('selectedType') || "普通";
let savedDest = localStorage.getItem('selectedDest') || "松本";
let isOnemanMode = localStorage.getItem('selectedOneman') !== 'false'; // デフォルトtrue

let currentStationIndex = 0;
const totalBoxes = 24;

let isUnlocked = false;
let isDoorOpen = false;
let hasTakenTicket = false;

// 要素取得
const fareGrid = document.getElementById('fare-grid');
const nextStationNameEl = document.getElementById('next-station-name');
const currentStationTextEl = document.getElementById('current-station-text');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnBuzzer = document.getElementById('btn-buzzer');

const keySwitch = document.getElementById('key-switch');
const keyRotator = document.getElementById('key-rotator');
const keyStatusText = document.getElementById('key-status-text');
const leverOpenZone = document.getElementById('lever-open-zone');
const btnClose = document.getElementById('btn-close');
const doorLeft = document.getElementById('door-left');
const doorRight = document.getElementById('door-right');
const statusText = document.getElementById('status-text');

const signType = document.getElementById('sign-type');
const signDest = document.getElementById('sign-dest');
const onemanIndicator = document.getElementById('oneman-indicator');
const announcementText = document.getElementById('announcement-text');
const ticketPaper = document.getElementById('ticket-paper');
const ticketNum = document.getElementById('ticket-num');
const ticketStation = document.getElementById('ticket-station');
const machineLamp = document.getElementById('machine-lamp');
const btnGetTicket = document.getElementById('btn-get-ticket');

function initSystem() {
    // 運賃グリッド生成
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
    leverOpenZone.classList.add('disabled');

    // 起動時に幕をくるくる回して初期セットする演出
    triggerInitialRollSign();
    updateDisplay();
}

function triggerInitialRollSign() {
    signType.classList.add('rolling');
    signDest.classList.add('rolling');
    setTimeout(() => {
        signType.textContent = savedType;
        signDest.textContent = savedDest;
        signType.classList.remove('rolling');
        signDest.classList.remove('rolling');
    }, 600);
}

function updateDisplay() {
    const activeLine = lineDatabase[currentLineKey];
    const stations = activeLine.stations;
    const targetStation = stations[currentStationIndex];
    
    // ワンマン表示灯の連動
    if (isOnemanMode && currentStationIndex > 0) {
        onemanIndicator.classList.add('active');
    } else {
        onemanIndicator.classList.remove('active');
    }

    if (currentStationIndex === 0) {
        nextStationNameEl.textContent = `${stations[0].name}`;
        currentStationTextEl.textContent = `${stations[0].name}駅 停車中 (始発)`;
        announcementText.textContent = stations[0].text;
        clearAllBoxes();
    } else {
        nextStationNameEl.textContent = targetStation.name;
        currentStationTextEl.textContent = `運行中 ➔ 次は ${targetStation.name}`;
        announcementText.textContent = targetStation.text;

        for (let i = 1; i <= totalBoxes; i++) {
            const box = document.getElementById(`box-${i}`);
            const fareValueEl = box.querySelector('.fare-value');
            if (i < targetStation.zone) {
                box.classList.remove('disabled');
                const stationDiff = targetStation.zone - i;
                fareValueEl.textContent = 170 + (stationDiff * 40);
            } else {
                box.classList.add('disabled');
                fareValueEl.textContent = '';
            }
        }
    }

    hasTakenTicket = false;
    issueTicket(targetStation.zone, targetStation.name);
}

function clearAllBoxes() {
    for (let i = 1; i <= totalBoxes; i++) {
        const box = document.getElementById(`box-${i}`);
        box.classList.add('disabled');
        box.querySelector('.fare-value').textContent = '';
    }
}

function issueTicket(zone, stationName) {
    ticketPaper.classList.remove('issued');
    machineLamp.classList.remove('active');
    btnGetTicket.disabled = true;

    setTimeout(() => {
        ticketNum.textContent = String(zone).padStart(2, '0');
        ticketStation.textContent = stationName;
        ticketPaper.classList.add('issued');
        machineLamp.classList.add('active'); 
        btnGetTicket.disabled = false; 
    }, 600);
}

// 整理券
btnGetTicket.addEventListener('click', () => {
    if (hasTakenTicket) return;
    ticketPaper.classList.remove('issued'); 
    machineLamp.classList.remove('active'); 
    btnGetTicket.disabled = true; 
    hasTakenTicket = true; 
});

// スイッチギミック
keySwitch.addEventListener('click', () => {
    if (!isUnlocked) {
        isUnlocked = true;
        keyRotator.classList.add('active');
        keyStatusText.textContent = "ON";
        keyStatusText.style.color = "#ffd700";
        leverOpenZone.classList.remove('disabled');
        statusText.textContent = "扉操作許可";
        statusText.style.color = "#ffd700";
    } else {
        if (isDoorOpen) return;
        isUnlocked = false;
        keyRotator.classList.remove('active');
        keyStatusText.textContent = "OFF";
        keyStatusText.style.color = "#888";
        leverOpenZone.classList.add('disabled');
        btnClose.disabled = true;
        statusText.textContent = "ロック中";
        statusText.style.color = "#ff5252";
    }
});

leverOpenZone.addEventListener('click', () => {
    if (!isUnlocked || isDoorOpen) return;
    isDoorOpen = true;
    leverOpenZone.classList.add('active');
    doorLeft.classList.add('open');
    doorRight.classList.add('open');
    btnClose.disabled = false;
    statusText.textContent = "扉 開";
    statusText.style.color = "#4caf50";
});

btnClose.addEventListener('click', () => {
    if (!isUnlocked || !isDoorOpen) return;
    isDoorOpen = false;
    leverOpenZone.classList.remove('active');
    doorLeft.classList.remove('open');
    doorRight.classList.remove('open');
    btnClose.disabled = true;
    statusText.textContent = "扉 閉";
    statusText.style.color = "#ffd700";
});

btnBuzzer.addEventListener('click', () => {
    currentStationTextEl.style.color = "#ffeb3b";
    setTimeout(() => { currentStationTextEl.style.color = "#a5d6a7"; }, 200);
});

btnNext.addEventListener('click', () => {
    if (isDoorOpen) return;
    const maxStations = lineDatabase[currentLineKey].stations.length;
    if (currentStationIndex < maxStations - 1) {
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

initSystem();