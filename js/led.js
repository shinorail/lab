window.addEventListener('DOMContentLoaded', () => {

    // ─── 1. 共通パーツ制御（メニュー・モーダル） ───
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
    const termsModal = document.getElementById('terms-modal');
    const openTermsBtn = document.getElementById('open-terms');
    const closeTermsBtn = document.getElementById('close-terms');
    if (openTermsBtn && termsModal) openTermsBtn.addEventListener('click', () => termsModal.classList.add('active'));
    if (closeTermsBtn && termsModal) closeTermsBtn.addEventListener('click', () => termsModal.classList.remove('active'));


    // ─── 2. 【新機能①】1秒ごとに連動するリアルタイムデジタル時計 ───
    const liveClockEl = document.getElementById('led-live-clock');
    function updateLiveClock() {
        if (!liveClockEl) return;
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        liveClockEl.innerText = `${hh}:${mm}:${ss}`;
    }
    setInterval(updateLiveClock, 1000);
    updateLiveClock(); // 初回起動


    // ─── 3. 選択肢（両数・のりば）の自動生成 ───
    const carSelect1 = document.getElementById('input-car-1');
    const carSelect2 = document.getElementById('input-car-2');
    const trackSelect1 = document.getElementById('input-track-1');
    const trackSelect2 = document.getElementById('input-track-2');

    const carOptions = [{ val: "", text: "(非表示)" }];
    for(let i = 1; i <= 16; i++) carOptions.push({ val: `${i}両`, text: `${i}両` });
    for(let i = 1; i <= 12; i++) carOptions.push({ val: i, text: `${i} (数字のみ)` });

    const trackOptions = [{ val: "", text: "(なし)" }];
    for(let i = 1; i <= 12; i++) trackOptions.push({ val: i, text: `${i}番線` });

    function populateSelect(element, options, defaultVal) {
        if (!element) return;
        options.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.val;
            el.innerText = opt.text;
            if(opt.val === defaultVal) el.selected = true;
            element.appendChild(el);
        });
    }
    populateSelect(carSelect1, carOptions, "6両");
    populateSelect(carSelect2, carOptions, "8両");
    populateSelect(trackSelect1, trackOptions, 3);
    populateSelect(trackSelect2, trackOptions, 2);


    // ─── 4. 全国対応＆個人自由カスタム色対応 同期システム ───
    function syncRow(rowNum) {
        const inputTime = document.getElementById(`input-time-${rowNum}`);
        const inputColor = document.getElementById(`input-color-${rowNum}`);
        const inputPicker = document.getElementById(`input-picker-${rowNum}`);
        const inputType = document.getElementById(`input-type-${rowNum}`);
        const inputName = document.getElementById(`input-name-${rowNum}`);
        const inputCar = document.getElementById(`input-car-${rowNum}`);
        const inputTrack = document.getElementById(`input-track-${rowNum}`);

        const ledTime = document.getElementById(`led-time-${rowNum}`);
        const ledType = document.getElementById(`led-type-${rowNum}`);
        const ledName = document.getElementById(`led-name-${rowNum}`);
        const ledCar = document.getElementById(`led-car-${rowNum}`);
        const ledTrack = document.getElementById(`led-track-${rowNum}`);

        if(inputTime && ledTime) ledTime.innerText = inputTime.value;
        if(inputType && ledType) ledType.innerText = inputType.value;
        if(inputName && ledName) ledName.innerText = inputName.value;
        if(inputCar && ledCar) ledCar.innerText = inputCar.value;
        if(inputTrack && ledTrack) ledTrack.innerText = inputTrack.value;

        // 色付けロジック（個人カスタム対応）
        if(inputColor && ledType) {
            ledType.classList.remove('text-green', 'text-orange', 'text-red', 'text-blue', 'text-pink');
            
            if(inputColor.value === 'custom' && inputPicker) {
                // カラーピッカーの色を直接テキストに注入（影も同色化）
                ledType.style.color = inputPicker.value;
                ledType.style.textShadow = `0 0 6px ${inputPicker.value}`;
            } else {
                // スタイル直書きをリセットしてクラスを適用
                ledType.style.color = '';
                ledType.style.textShadow = '';
                ledType.classList.add(inputColor.value);
            }
        }
    }

    function updateAllLED() {
        syncRow(1);
        syncRow(2);

        // 3行目（流れる案内＆新機能②：案内文の色）の同期
        const inputScroll = document.getElementById('input-scroll');
        const inputColorScroll = document.getElementById('input-color-scroll');
        const ledScrollText = document.getElementById('scroll-text');
        
        if(inputScroll && ledScrollText) {
            if (ledScrollText.innerText !== inputScroll.value) {
                ledScrollText.innerText = inputScroll.value;
                ledScrollText.style.animation = 'none';
                ledScrollText.offsetHeight; // リフロー
                ledScrollText.style.animation = '';
            }
        }
        if(inputColorScroll && ledScrollText) {
            ledScrollText.classList.remove('text-green', 'text-orange', 'text-red');
            ledScrollText.classList.add(inputColorScroll.value);
        }
    }

    // イベント一括登録
    const ids = [
        'input-time-1', 'input-color-1', 'input-picker-1', 'input-type-1', 'input-name-1', 'input-car-1', 'input-track-1',
        'input-time-2', 'input-color-2', 'input-picker-2', 'input-type-2', 'input-name-2', 'input-car-2', 'input-track-2',
        'input-scroll', 'input-color-scroll'
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', updateAllLED);
            el.addEventListener('change', updateAllLED);
        }
    });

    updateAllLED();
});