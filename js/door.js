// 運行駅データ（大糸線）
const lineData = {
    name: "大糸線",
    stations: [
        { name: "松本", zone: 1, text: "大糸線ワンマン列車をご利用いただきありがとうございます。次は 北松本 です。" },
        { name: "北松本", zone: 2, text: "次は 島内 です。運賃は運賃表示器でお確かめください。" },
        { name: "島内", zone: 3, text: "次は 島高松 です。お降りの際は一番前のドアからお降りください。" },
        { name: "島高松", zone: 4, text: "次は 梓橋 です。整理券を無くさずにお持ちください。" },
        { name: "梓橋", zone: 5, text: "次は 一日市場 です。まもなく一日市場に到着いたします。" },
        { name: "一日市場", zone: 6, text: "本日もワンマン列車をご利用いただきありがとうございました。終点 一日市場 です。" }
    ]
};

const rollSigns = [
    { type: "普通", dest: "松本" },
    { type: "普通", dest: "信濃大町" },
    { type: "快速", dest: "南小谷" },
    { type: "回送", dest: " " }
];
let currentSignIndex = 0;
let currentStationIndex = 0;
const totalBoxes = 24;

// ギミック状態フラグ
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

// 新・3D可動パーツの要素取得
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
const btnRollSign = document.getElementById('btn-roll-sign');
const onemanIndicator = document.getElementById('oneman-indicator');
const announcementText = document.getElementById('announcement-text');
const ticketPaper = document.getElementById('ticket-paper');
const ticketNum = document.getElementById('ticket-num');
const ticketStation = document.getElementById('ticket-station');
const machineLamp = document.getElementById('machine-lamp');
const btnGetTicket = document.getElementById('btn-get-ticket');

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
    // 初期はレバー操作を禁止にするスタイルを当てる
    leverOpenZone.classList.add('disabled');
    updateDisplay();
}

function updateDisplay() {
    const stations = lineData.stations;
    const targetStation = stations[currentStationIndex];
    
    if (currentStationIndex > 0) {
        onemanIndicator.classList.add('active');
    } else {
        onemanIndicator.classList.remove('active');
    }

    if (currentStationIndex === 0) {
        nextStationNameEl.textContent = `${stations[0].name}`;
        currentStationTextEl.textContent = "松本駅 停車中 (始発)";
        announcementText.textContent = stations[0].text;
        clearAllBoxes();
    } else {
        nextStationNameEl.textContent = targetStation.name;
        currentStationTextEl.textContent = `走行中 ➔ 次は ${targetStation.name}`;
        announcementText.textContent = targetStation.text;

        for (let i = 1; i <= totalBoxes; i++) {
            const box = document.getElementById(`box-${i}`);
            const fareValueEl = box.querySelector('.fare-value');
            if (i < targetStation.zone) {
                box.classList.remove('disabled');
                const stationDiff = targetStation.zone - i;
                fareValueEl.textContent = 160 + (stationDiff * 30);
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

btnGetTicket.addEventListener('click', () => {
    if (hasTakenTicket) return;
    ticketPaper.classList.remove('issued'); 
    machineLamp.classList.remove('active'); 
    btnGetTicket.disabled = true; 
    hasTakenTicket = true; 
});

btnRollSign.addEventListener('click', () => {
    signType.classList.add('rolling');
    signDest.classList.add('rolling');
    setTimeout(() => {
        currentSignIndex = (currentSignIndex + 1) % rollSigns.length;
        signType.textContent = rollSigns[currentSignIndex].type;
        signDest.textContent = rollSigns[currentSignIndex].dest;
        signType.classList.remove('rolling');
        signDest.classList.remove('rolling');
    }, 500);
});

// 立体車掌鍵：クリックするとカチャッと90度回転する
keySwitch.addEventListener('click', () => {
    if (!isUnlocked) {
        isUnlocked = true;
        keyRotator.classList.add('active'); // 90度回転
        keyStatusText.textContent = "ON";
        keyStatusText.style.color = "#ffd700";
        leverOpenZone.classList.remove('disabled'); // レバーを動かせるようにする
        statusText.textContent = "扉操作許可";
        statusText.style.color = "#ffd700";
    } else {
        if (isDoorOpen) {
            alert("扉が開いている時はロックできません！");
            return;
        }
        isUnlocked = false;
        keyRotator.classList.remove('active'); // 元に戻る
        keyStatusText.textContent = "OFF";
        keyStatusText.style.color = "#888";
        leverOpenZone.classList.add('disabled');
        btnClose.disabled = true;
        statusText.textContent = "ロック中";
        statusText.style.color = "#ff5252";
    }
});

// 立体開レバー：クリックするとレバーがツルッと上にスライドしてドアが開く
leverOpenZone.addEventListener('click', () => {
    if (!isUnlocked || isDoorOpen) return;

    isDoorOpen = true;
    leverOpenZone.classList.add('active'); // レバーが上に上がる
    doorLeft.classList.add('open');
    doorRight.classList.add('open');
    btnClose.disabled = false; // 閉ボタンが有効化
    statusText.textContent = "扉 開（レバー投入）";
    statusText.style.color = "#4caf50";
});

// 立体閉ボタン：押すとグッと奥に沈んで、ドアが閉まり、レバーが下に戻る
btnClose.addEventListener('click', () => {
    if (!isUnlocked || !isDoorOpen) return;

    isDoorOpen = false;
    leverOpenZone.classList.remove('active'); // レバーが勝手に「下」に戻る
    doorLeft.classList.remove('open');
    doorRight.classList.remove('open');
    btnClose.disabled = true;
    statusText.textContent = "扉 閉（ロック解除状態）";
    statusText.style.color = "#ffd700";
});

btnBuzzer.addEventListener('click', () => {
    currentStationTextEl.style.color = "#ffeb3b";
    setTimeout(() => { currentStationTextEl.style.color = "#a5d6a7"; }, 200);
});

btnNext.addEventListener('click', () => {
    if (isDoorOpen) {
        alert("扉が開いています！安全のため出発できません。");
        return;
    }
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

initDisplay();