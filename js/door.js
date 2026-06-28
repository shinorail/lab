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

// 211系風 一体型幕データ
const rollSigns = [
    { type: "普通", dest: "松本" },
    { type: "普通", dest: "信濃大町" },
    { type: "快速", dest: "南小谷" },
    { type: "回送", dest: " " }
];
let currentSignIndex = 0;

let currentStationIndex = 0;
const totalBoxes = 24;
let isUnlocked = false;
let isDoorOpen = false;
let hasTakenTicket = false; // 1駅1枚制限フラグ

// HTML要素取得
const fareGrid = document.getElementById('fare-grid');
const nextStationNameEl = document.getElementById('next-station-name');
const currentStationTextEl = document.getElementById('current-station-text');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnBuzzer = document.getElementById('btn-buzzer');

const keySwitch = document.getElementById('key-switch');
const leverOpen = document.getElementById('lever-open');
const btnClose = document.getElementById('btn-close');
const doorLeft = document.getElementById('door-left');
const doorRight = document.getElementById('door-right');
const statusText = document.getElementById('status-text');

// 幕・発券機・放送・灯
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

// 運賃マス生成
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

// 状態リフレッシュ
function updateDisplay() {
    const stations = lineData.stations;
    const targetStation = stations[currentStationIndex];
    
    // ワンマンランプ連動
    if (currentStationIndex > 0) {
        onemanIndicator.classList.add('active');
    } else {
        onemanIndicator.classList.remove('active');
    }

    if (currentStationIndex === 0) {
        nextStationNameEl.textContent = `${stations[0].name}`;
        currentStationTextEl.textContent = "松本駅 に停車中 (始発)";
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

    // 駅到着時に整理券を発行（この時点ではまだ取っていない）
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

// 整理券発券処理
function issueTicket(zone, stationName) {
    ticketPaper.classList.remove('issued');
    machineLamp.classList.remove('active');
    btnGetTicket.disabled = true;

    setTimeout(() => {
        ticketNum.textContent = String(zone).padStart(2, '0');
        ticketStation.textContent = stationName;
        ticketPaper.classList.add('issued');
        machineLamp.classList.add('active'); // オレンジランプ点灯
        btnGetTicket.disabled = false; // 「券を取る」を有効化
    }, 600);
}

// 整理券を取るボタン（1駅1回制限）
btnGetTicket.addEventListener('click', () => {
    if (hasTakenTicket) return;

    ticketPaper.classList.remove('issued'); // 券を引き抜く
    machineLamp.classList.remove('active'); // ランプが消える
    btnGetTicket.disabled = true; // 次の駅までボタンをロック
    hasTakenTicket = true; // この駅では発券済みフラグ
});

// 211系風 一体型連動方向幕回転
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

// 連絡ブザー
btnBuzzer.addEventListener('click', () => {
    // 擬似的に車内案内をチカッとさせるなどのダミー演出
    currentStationTextEl.style.color = "#ffeb3b";
    setTimeout(() => { currentStationTextEl.style.color = "#a5d6a7"; }, 200);
});

// 運行ボタン
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

// 車掌スイッチ
keySwitch.addEventListener('click', () => {
    if (!isUnlocked) {
        isUnlocked = true;
        keySwitch.textContent = "🔑 解除";
        keySwitch.classList.add('unlocked');
        leverOpen.disabled = false;
        statusText.textContent = "操作許可";
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