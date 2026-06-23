// ─── 1. 位置情報の初期設定（篠ノ井駅付近） ───
let currentLat = 36.5775;
let currentLng = 138.1378;

// 初期値として今日の日付を設定
document.getElementById('date').valueAsDate = new Date();

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

    const sunPos = SunCalc.getPosition(dateTime, currentLat, currentLng);
    
    let sunAzimuthDeg = (sunPos.azimuth * 180 / Math.PI) + 180; 
    let sunAltitudeDeg = sunPos.altitude * 180 / Math.PI;

    document.getElementById('sun-azimuth').innerText = sunAzimuthDeg.toFixed(1);
    document.getElementById('sun-altitude').innerText = sunAltitudeDeg.toFixed(1);

    if (sunAltitudeDeg < 0) {
        document.getElementById('light-condition').innerText = "夜間（日没しています）";
        document.getElementById('sun-mesh').style.display = 'none';
        return;
    } else {
        document.getElementById('sun-mesh').style.display = 'block';
    }

    let relativeAngle = (sunAzimuthDeg - trackDir + 360) % 360;

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

    document.getElementById('train-mesh').style.transform = `rotate(${trackDir}deg)`;
    
    const radius = 65;
    const sunRad = (sunAzimuthDeg - 90) * Math.PI / 180;
    const sunX = radius * Math.cos(sunRad);
    const sunY = radius * Math.sin(sunRad);
    
    const sunMesh = document.getElementById('sun-mesh');
    sunMesh.style.left = `calc(50% + ${sunX}px - 11px)`;
    sunMesh.style.top = `calc(50% + ${sunY}px - 11px)`;
}

document.getElementById('date').addEventListener('change', updateSimulation);
document.getElementById('time').addEventListener('change', updateSimulation);
document.getElementById('track-dir').addEventListener('change', updateSimulation);

// ─── 5. 利用規約モーダル制御 ───
const modal = document.getElementById('terms-modal');
document.getElementById('open-terms').addEventListener('click', () => modal.classList.add('active'));
document.getElementById('close-terms').addEventListener('click', () => modal.classList.remove('active'));

updateSimulation();
