// ─── 1. 日付と時刻の自動初期設定 ───
const now = new Date();

// 日付を「YYYY-MM-DD」形式にして自動入力
document.getElementById('date').valueAsDate = now;

// 時刻を「HH:MM」形式にして自動入力
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
document.getElementById('time').value = `${hours}:${minutes}`;

// 位置情報の初期値（初期値は篠ノ井駅付近）
let currentLat = 36.5775;
let currentLng = 138.1378;


// ─── 2. ハンバーガーメニューの開閉制御 ───
const toggleBtn = document.getElementById('nav-toggle');
const gNav = document.getElementById('global-nav');

toggleBtn.addEventListener('click', () => {
    toggleBtn.classList.toggle('active');
    gNav.classList.toggle('active');
});

// メニューの外側をクリックしたら閉じる処理
document.addEventListener('click', (e) => {
    if (!toggleBtn.contains(e.target) && !gNav.contains(e.target)) {
        toggleBtn.classList.remove('active');
        gNav.classList.remove('active');
    }
});


// ─── 3. 現在地取得（GPS）処理 ───
document.getElementById('btn-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("お使いのブラウザは位置情報の取得に対応していません。");
        return;
    }

    document.getElementById('btn-location').innerText = "位置情報取得中...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLat = position.coords.latitude;
            currentLng = position.coords.longitude;
            
            document.getElementById('current-lat-lng').innerText = 
                `緯度: ${currentLat.toFixed(4)}, 経度: ${currentLng.toFixed(4)}`;
            document.getElementById('btn-location').innerText = "📍 現在地を取得して計算";
            
            // ★現在地を取得した際にも、その瞬間の最新時刻に自動更新して再計算する
            const latestNow = new Date();
            const latestHours = String(latestNow.getHours()).padStart(2, '0');
            const latestMinutes = String(latestNow.getMinutes()).padStart(2, '0');
            document.getElementById('time').value = `${latestHours}:${latestMinutes}`;
            document.getElementById('date').valueAsDate = latestNow;

            updateSimulation();
        },
        (error) => {
            alert("位置情報の取得に失敗しました。ブラウザの位置情報許可を確認してください。");
            document.getElementById('btn-location').innerText = "📍 現在地を取得して計算";
        }
    );
});


// ─── 4. 太陽光線シミュレーションコアロジック ───
function updateSimulation() {
    const dateInput = document.getElementById('date').value;
    const timeInput = document.getElementById('time').value;
    const trackDir = parseFloat(document.getElementById('track-dir').value);

    if (!dateInput || !timeInput) return;

    const dateTime = new Date(`${dateInput}T${timeInput}`);

    // SunCalcライブラリを利用して太陽方位・高度を計算
    const sunPos = SunCalc.getPosition(dateTime, currentLat, currentLng);
    
    // ラジアンから度数に変換、および北を0度とする補正
    let sunAzimuthDeg = (sunPos.azimuth * 180 / Math.PI) + 180; 
    let sunAltitudeDeg = sunPos.altitude * 180 / Math.PI;

    document.getElementById('sun-azimuth').innerText = sunAzimuthDeg.toFixed(1);
    document.getElementById('sun-altitude').innerText = sunAltitudeDeg.toFixed(1);

    // 日没判定
    if (sunAltitudeDeg < 0) {
        document.getElementById('light-condition').innerText = "夜間（日没しています）";
        document.getElementById('sun-mesh').style.display = 'none';
        return;
    } else {
        document.getElementById('sun-mesh').style.display = 'block';
    }

    // 列車から見た太陽の相対角度
    let relativeAngle = (sunAzimuthDeg - trackDir + 360) % 360;

    // 詳細な光線状態判定基準
    let condition = "";
    if (relativeAngle >= 330 || relativeAngle < 30) {
        condition = "前頭部順光（正面ドカン向き）";
    } else if (relativeAngle >= 30 && relativeAngle < 60) {
        condition = "左前方から光（面デカ・側面やや弱）";
    } else if (relativeAngle >= 60 && relativeAngle < 120) {
        condition = "左側面順光（きれいに光が当たります）";
    } else if (relativeAngle >= 120 && relativeAngle < 150) {
        condition = "左後方から光（後追い順光向き）";
    } else if (relativeAngle >= 150 && relativeAngle < 210) {
        condition = "完全逆光（面も側面も影になります）";
    } else if (relativeAngle >= 210 && relativeAngle < 240) {
        condition = "右後方から光（後追い順光向き）";
    } else if (relativeAngle >= 240 && relativeAngle < 300) {
        condition = "右側面順光（きれいに光が当たります）";
    } else if (relativeAngle >= 300 && relativeAngle < 330) {
        condition = "右前方から光（面デカ・側面やや弱）";
    }
    
    document.getElementById('light-condition').innerText = condition;

    // ビジュアル反映（列車の回転）
    document.getElementById('train-mesh').style.transform = `rotate(${trackDir}deg)`;
    
    // 太陽の円周上配置
    const radius = 65;
    const sunRad = (sunAzimuthDeg - 90) * Math.PI / 180;
    const sunX = radius * Math.cos(sunRad);
    const sunY = radius * Math.sin(sunRad);
    
    const sunMesh = document.getElementById('sun-mesh');
    sunMesh.style.left = `calc(50% + ${sunX}px - 11px)`;
    sunMesh.style.top = `calc(50% + ${sunY}px - 11px)`;
}


// ─── 5. 各種イベントリスナー登録 ───
document.getElementById('date').addEventListener('change', updateSimulation);
document.getElementById('time').addEventListener('change', updateSimulation);
document.getElementById('track-dir').addEventListener('change', updateSimulation);


// ─── 6. 利用規約モーダル制御 ───
const modal = document.getElementById('terms-modal');
document.getElementById('open-terms').addEventListener('click', () => modal.classList.add('active'));
document.getElementById('close-terms').addEventListener('click', () => modal.classList.remove('active'));


// 初回シミュレーション実行
updateSimulation();
