window.addEventListener('DOMContentLoaded', () => {

    // ─── 1. 日付と時刻の自動初期設定 ───
    const now = new Date();

    const dateEl = document.getElementById('date');
    const timeEl = document.getElementById('time');
    const trackDirEl = document.getElementById('track-dir');
    const btnLocationEl = document.getElementById('btn-location');

    if (dateEl) dateEl.valueAsDate = now;
    if (timeEl) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeEl.value = `${hours}:${minutes}`;
    }

    let currentLat = 36.5775;
    let currentLng = 138.1378;


    // ─── 2. ハンバーガーメニューの開閉制御 ───
    const toggleBtn = document.getElementById('nav-toggle');
    const gNav = document.getElementById('global-nav');

    if (toggleBtn && gNav) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBtn.classList.toggle('active');
            gNav.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!toggleBtn.contains(e.target) && !gNav.contains(e.target)) {
                toggleBtn.classList.remove('active');
                gNav.classList.remove('active');
            }
        });
    }


    // ─── 3. 現在地取得（GPS）確認処理 ───
    if (btnLocationEl) {
        btnLocationEl.addEventListener('click', () => {
            const isConfirmed = confirm("正確な太陽の角度を計算するために、お使いの端末の位置情報（GPS）を使用します。取得してもよろしいですか？");
            
            if (!isConfirmed) return;

            if (!navigator.geolocation) {
                alert("お使いのブラウザは位置情報の取得に対応していません。");
                return;
            }

            btnLocationEl.innerText = "位置情報取得中...";

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentLat = position.coords.latitude;
                    currentLng = position.coords.longitude;
                    
                    const latLngEl = document.getElementById('current-lat-lng');
                    if (latLngEl) {
                        latLngEl.innerText = `緯度: ${currentLat.toFixed(4)}, 経度: ${currentLng.toFixed(4)}`;
                    }
                    btnLocationEl.innerText = "📍 現在地を取得して計算";
                    
                    const latestNow = new Date();
                    if (timeEl) {
                        const latestHours = String(latestNow.getHours()).padStart(2, '0');
                        const latestMinutes = String(latestNow.getMinutes()).padStart(2, '0');
                        timeEl.value = `${latestHours}:${latestMinutes}`;
                    }
                    if (dateEl) dateEl.valueAsDate = latestNow;

                    updateSimulation();
                },
                (error) => {
                    alert("位置情報の取得に失敗しました。ブラウザの位置情報許可（設定）を確認してください。");
                    btnLocationEl.innerText = "📍 現在地を取得して計算";
                }
            );
        });
    }


    // ─── 4. 太陽光線シミュレーションコアロジック ───
    function updateSimulation() {
        if (!dateEl || !timeEl || !trackDirEl) return;

        const dateInput = dateEl.value;
        const timeInput = timeEl.value;
        const trackDir = parseFloat(trackDirEl.value);

        if (!dateInput || !timeInput) return;

        const dateTime = new Date(`${dateInput}T${timeInput}`);

        if (typeof SunCalc === 'undefined') {
            console.error("SunCalcライブラリが読み込まれていません。");
            return;
        }
        const sunPos = SunCalc.getPosition(dateTime, currentLat, currentLng);
        
        let sunAzimuthDeg = (sunPos.azimuth * 180 / Math.PI) + 180; 
        let sunAltitudeDeg = sunPos.altitude * 180 / Math.PI;

        const azimuthEl = document.getElementById('sun-azimuth');
        const altitudeEl = document.getElementById('sun-altitude');
        const conditionEl = document.getElementById('light-condition');
        const sunMeshEl = document.getElementById('sun-mesh');
        const trainMeshEl = document.getElementById('train-mesh');

        if (azimuthEl) azimuthEl.innerText = sunAzimuthDeg.toFixed(1);
        if (altitudeEl) altitudeEl.innerText = sunAltitudeDeg.toFixed(1);

        if (sunAltitudeDeg < 0) {
            if (conditionEl) conditionEl.innerText = "夜間（日没しています）";
            if (sunMeshEl) sunMeshEl.style.display = 'none';
            return;
        } else {
            if (sunMeshEl) sunMeshEl.style.display = 'block';
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
        
        if (conditionEl) conditionEl.innerText = condition;
        if (trainMeshEl) trainMeshEl.style.transform = `rotate(${trackDir}deg)`;
        
        if (sunMeshEl) {
            const radius = 65;
            const sunRad = (sunAzimuthDeg - 90) * Math.PI / 180;
            const sunX = radius * Math.cos(sunRad);
            const sunY = radius * Math.sin(sunRad);
            
            sunMeshEl.style.left = `calc(50% + ${sunX}px - 11px)`;
            sunMeshEl.style.top = `calc(50% + ${sunY}px - 11px)`;
        }
    }


    // ─── 5. 各種イベントリスナー登録 ───
    if (dateEl) dateEl.addEventListener('change', updateSimulation);
    if (timeEl) {
        timeEl.addEventListener('change', updateSimulation);
        timeEl.addEventListener('input', updateSimulation);
    }
    if (trackDirEl) trackDirEl.addEventListener('change', updateSimulation);


    // ─── 6. 利用規約モーダル制御 ───
    const termsModal = document.getElementById('terms-modal');
    const openTermsBtn = document.getElementById('open-terms');
    const closeTermsBtn = document.getElementById('close-terms');

    if (openTermsBtn && termsModal) {
        openTermsBtn.addEventListener('click', () => termsModal.classList.add('active'));
    }
    if (closeTermsBtn && termsModal) {
        closeTermsBtn.addEventListener('click', () => termsModal.classList.remove('active'));
    }

    updateSimulation();
});