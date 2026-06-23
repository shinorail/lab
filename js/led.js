window.addEventListener('DOMContentLoaded', () => {

    // ─── 1. ハンバーガーメニューの開閉制御（使い回し） ───
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

    // ─── 2. 利用規約モーダル制御（使い回し） ───
    const termsModal = document.getElementById('terms-modal');
    const openTermsBtn = document.getElementById('open-terms');
    const closeTermsBtn = document.getElementById('close-terms');

    if (openTermsBtn && termsModal) {
        openTermsBtn.addEventListener('click', () => termsModal.classList.add('active'));
    }
    if (closeTermsBtn && termsModal) {
        closeTermsBtn.addEventListener('click', () => termsModal.classList.remove('active'));
    }


    // ─── 3. LEDリアルタイム同期システム ───
    
    // 入力要素の取得
    const inputTime1 = document.getElementById('input-time-1');
    const inputType1 = document.getElementById('input-type-1');
    const inputName1 = document.getElementById('input-name-1');
    const inputCar1 = document.getElementById('input-car-1');
    const inputTrack1 = document.getElementById('input-track-1');
    const inputScroll = document.getElementById('input-scroll');

    // LED表示側の要素取得
    const ledTime1 = document.getElementById('led-time-1');
    const ledType1 = document.getElementById('led-type-1');
    const ledName1 = document.getElementById('led-name-1');
    const ledCar1 = document.getElementById('led-car-1');
    const ledTrack1 = document.getElementById('led-track-1');
    const ledScrollText = document.getElementById('scroll-text');

    // 反映させる関数
    function updateLED() {
        // テキストの同期
        if(inputTime1 && ledTime1) ledTime1.innerText = inputTime1.value;
        if(inputName1 && ledName1) ledName1.innerText = inputName1.value;
        if(inputCar1 && ledCar1) ledCar1.innerText = inputCar1.value;
        if(inputTrack1 && ledTrack1) ledTrack1.innerText = inputTrack1.value;

        // 種別テキストと色の動的変更
        if(inputType1 && ledType1) {
            ledType1.innerText = inputType1.value;
            
            // 一旦すべての色クラスを消去
            ledType1.classList.remove('text-green', 'text-orange', 'text-red');
            
            // 選択されたoptionからdata-color（色クラス名）を読み取って付与
            const selectedOption = inputType1.options[inputType1.selectedIndex];
            const colorClass = selectedOption.getAttribute('data-color');
            ledType1.classList.add(colorClass);
        }

        // 流れる案内の同期
        if(inputScroll && ledScrollText) {
            // 文字が変わったらアニメーションをリセットして再スタートさせる技
            if (ledScrollText.innerText !== inputScroll.value) {
                ledScrollText.innerText = inputScroll.value;
                ledScrollText.style.animation = 'none';
                ledScrollText.offsetHeight; /* 💡ブラウザに再描画させるおまじない */
                ledScrollText.style.animation = '';
            }
        }
    }

    // フォームに文字が打ち込まれた瞬間（input）や選択が変わった瞬間（change）をすべて監視
    if(inputTime1) inputTime1.addEventListener('input', updateLED);
    if(inputType1) inputType1.addEventListener('change', updateLED);
    if(inputName1) inputName1.addEventListener('input', updateLED);
    if(inputCar1) inputCar1.addEventListener('input', updateLED);
    if(inputTrack1) inputTrack1.addEventListener('input', updateLED);
    if(inputScroll) inputScroll.addEventListener('input', updateLED);

});