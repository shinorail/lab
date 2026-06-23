window.addEventListener('DOMContentLoaded', () => {

    // ─── 1. 共通パーツの開閉制御 ───
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


    // ─── 2. 簡略化のための選択肢（両数・のりば）の自動生成 ───
    const carSelect1 = document.getElementById('input-car-1');
    const carSelect2 = document.getElementById('input-car-2');
    const trackSelect1 = document.getElementById('input-track-1');
    const trackSelect2 = document.getElementById('input-track-2');

    // 両数の選択肢（1〜16両、および気動車・海外用の数字単体も網羅）
    const carOptions = [];
    for(let i = 1; i <= 16; i++) carOptions.push({ val: `${i}両`, text: `${i}両` });
    for(let i = 1; i <= 10; i++) carOptions.push({ val: `${i} Lot`, text: `${i} (数字のみ)` }); // 私鉄や海外風用

    // のりばの選択肢（1〜10番線）
    const trackOptions = [];
    for(let i = 1; i <= 10; i++) trackOptions.push({ val: i, text: `${i}番線` });

    // 各セレクトボックスに突っ込む関数
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

    // 初期値を指定してセレクトボックスを組み立て
    populateSelect(carSelect1, carOptions, "6両");
    populateSelect(carSelect2, carOptions, "8両");
    populateSelect(trackSelect1, trackOptions, 3);
    populateSelect(trackSelect2, trackOptions, 2);


    // ─── 3. 全国対応・双方向リアルタイム同期システム ───
    function syncRow(rowNum) {
        const inputTime = document.getElementById(`input-time-${rowNum}`);
        const inputColor = document.getElementById(`input-color-${rowNum}`);
        const inputType = document.getElementById(`input-type-${rowNum}`);
        const inputName = document.getElementById(`input-name-${rowNum}`);
        const inputCar = document.getElementById(`input-car-${rowNum}`);
        const inputTrack = document.getElementById(`input-track-${rowNum}`);

        const ledTime = document.getElementById(`led-time-${rowNum}`);
        const ledType = document.getElementById(`led-type-${rowNum}`);
        const ledName = document.getElementById(`led-name-${rowNum}`);
        const ledCar = document.getElementById(`led-car-${rowNum}`);
        const ledTrack = document.getElementById(`led-track-${rowNum}`);

        // テキストの流し込み
        if(inputTime && ledTime) ledTime.innerText = inputTime.value;
        if(inputType && ledType) ledType.innerText = inputType.value;
        if(inputName && ledName) ledName.innerText = inputName.value;
        if(inputCar && ledCar) ledCar.innerText = inputCar.value;
        if(inputTrack && ledTrack) ledTrack.innerText = inputTrack.value;

        // 種別のカラーリングを完全制御
        if(inputColor && ledType) {
            ledType.classList.remove('text-green', 'text-orange', 'text-red');
            ledType.classList.add(inputColor.value);
        }
    }

    // 全体を更新するマスター関数
    function updateAllLED() {
        syncRow(1); // 1行目を同期
        syncRow(2); // 2行目を同期

        // 3行目（流れる案内）の同期
        const inputScroll = document.getElementById('input-scroll');
        const ledScrollText = document.getElementById('scroll-text');
        if(inputScroll && ledScrollText) {
            if (ledScrollText.innerText !== inputScroll.value) {
                ledScrollText.innerText = inputScroll.value;
                ledScrollText.style.animation = 'none';
                ledScrollText.offsetHeight; // リフロー発生
                ledScrollText.style.animation = '';
            }
        }
    }

    // イベントリスナーの一括登録
    const ids = ['input-time-1', 'input-color-1', 'input-type-1', 'input-name-1', 'input-car-1', 'input-track-1',
                 'input-time-2', 'input-color-2', 'input-type-2', 'input-name-2', 'input-car-2', 'input-track-2', 'input-scroll'];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', updateAllLED);
            el.addEventListener('change', updateAllLED);
        }
    });

    // 最初に一度実行して初期化
    updateAllLED();
});