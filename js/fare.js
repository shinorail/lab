// 大糸線（松本 〜 信濃大町）の簡易駅データと運賃テーブルのシミュレート
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
        { name: "穂高", zone: 11 },
        { name: "有明", zone: 12 },
        { name: "安曇追分", zone: 13 },
        { name: "細野", zone: 14 },
        { name: "北細野", zone: 15 },
        { name: "信濃松川", zone: 16 },
        { name: "安曇沓掛", zone: 17 },
        { name: "信濃常盤", zone: 18 },
        { name: "南大町", zone: 19 },
        { name: "信濃大町", zone: 20 }
    ]
};

// 現在の駅インデックス（0 = 松本停車中、1 = 次は北松本...）
let currentStationIndex = 0;
const totalBoxes = 24; // 表示器のマス数（1〜24番）

// HTML要素の取得
const fareGrid = document.getElementById('fare-grid');
const nextStationNameEl = document.getElementById('next-station-name');
const currentStationTextEl = document.getElementById('current-station-text');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

// 運賃表示器のマス目を初期生成（1〜24番）
function initDisplay() {
    fareGrid.innerHTML = '';
    for (let i = 1; i <= totalBoxes; i++) {
        const box = document.createElement('div');
        box.className = 'fare-box disabled'; // 初期状態は消灯
        box.id = `box-${i}`;

        const numLabel = document.createElement('span');
        numLabel.className = 'num-label';
        numLabel.textContent = String(i).padStart(2, '0'); // 01, 02...

        const fareValue = document.createElement('span');
        fareValue.className = 'fare-value';
        fareValue.textContent = '';

        box.appendChild(numLabel);
        box.appendChild(fareValue);
        fareGrid.appendChild(box);
    }
    updateDisplay();
}

// 画面の表示を更新する関数
function updateDisplay() {
    const stations = lineData.stations;
    
    // 始発駅（出発前）の処理
    if (currentStationIndex === 0) {
        nextStationNameEl.textContent = `${stations[0].name} (始発発車前)`;
        currentStationTextEl.textContent = "松本（停車中）";
        clearAllBoxes();
        return;
    }

    // 現在目指している「次の駅」の情報
    const targetStation = stations[currentStationIndex];
    nextStationNameEl.textContent = targetStation.name;
    currentStationTextEl.textContent = `${stations[currentStationIndex - 1].name} を出発`;

    // 運賃のパチパチ計算ロジック
    // 駅が進むごとに、古い整理券番号の運賃が高くなり、新しい番号が有効化される
    for (let i = 1; i <= totalBoxes; i++) {
        const box = document.getElementById(`box-${i}`);
        const fareValueEl = box.querySelector('.fare-value');

        // 整理券番号 i が、現在の駅のゾーン（駅順）より前の場合に運賃を表示
        if (i < targetStation.zone) {
            box.classList.remove('disabled');
            
            // 運賃の擬似計算：初乗り150円 ＋ 駅移動ごとに30円〜40円加算
            const stationDiff = targetStation.zone - i;
            let calculatedFare = 150 + (stationDiff * 40);
            
            // 鉄道の運賃っぽく、上限や端数をちょっと丸める（最大でも700円程度に設定）
            if (calculatedFare > 680) calculatedFare = 680;

            fareValueEl.textContent = calculatedFare;
        } else {
            // まだ使われていない整理券番号は消灯
            box.classList.add('disabled');
            fareValueEl.textContent = '';
        }
    }
}

// すべてのマスを消灯する
function clearAllBoxes() {
    for (let i = 1; i <= totalBoxes; i++) {
        const box = document.getElementById(`box-${i}`);
        box.classList.add('disabled');
        box.querySelector('.fare-value').textContent = '';
    }
}

// ボタンのイベントリスナー
btnNext.addEventListener('click', () => {
    if (currentStationIndex < lineData.stations.length - 1) {
        currentStationIndex++;
        updateDisplay();
    } else {
        alert("終点の信濃大町に到着しました！");
    }
});

btnPrev.addEventListener('click', () => {
    if (currentStationIndex > 0) {
        currentStationIndex--;
        updateDisplay();
    }
});

// 起動時に初期化
initDisplay();