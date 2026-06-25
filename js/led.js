window.addEventListener('DOMContentLoaded', () => {

    // ─── 共通パーツ制御 ───
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

    // ─── リアルタイムデジタル時計 ───
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
    updateLiveClock();

    // ─── ❷ 時刻・先発の交互切り替えタイマーシステム ───
    let displayToggleState = true; // true = 時刻, false = 交互文字
    setInterval(() => {
        displayToggleState = !displayToggleState;
        for (let i = 1; i <= 2; i++) {
            const timeEl = document.getElementById(`led-time-${i}`);
            const altMode = document.getElementById(`input-alt-${i}`)?.value;
            if (!timeEl) continue;

            if (altMode === 'alternate') {
                timeEl.classList.remove('led-blink-effect');
                timeEl.innerText = displayToggleState ? timeEl.getAttribute('data-time') : timeEl.getAttribute('data-alt');
            } else if (altMode === 'blink') {
                timeEl.innerText = timeEl.getAttribute('data-time');
                timeEl.classList.add('led-blink-effect');
            } else {
                timeEl.innerText = timeEl.getAttribute('data-time');
                timeEl.classList.remove('led-blink-effect');
            }
        }
    }, 2500); // 2.5秒ごとにパッパッと切り替わる

    // ─── 💰 同期システム（遅れ、自由番線対応） ───
    function syncRow(rowNum) {
        const inputTime = document.getElementById(`input-time-${rowNum}`);
        const inputAlt = document.getElementById(`input-alt-${rowNum}`);
        const inputColor = document.getElementById(`input-color-${rowNum}`);
        const inputPicker = document.getElementById(`input-picker-${rowNum}`);
        const inputType = document.getElementById(`input-type-${rowNum}`);
        const inputName = document.getElementById(`input-name-${rowNum}`);
        const inputDest = document.getElementById(`input-dest-${rowNum}`);
        const inputCar = document.getElementById(`input-car-${rowNum}`);
        
        // ❶ 遅れ・のりばパーツ
        const inputDelaySw = document.getElementById(`input-delay-sw-${rowNum}`);
        const inputDelayTxt = document.getElementById(`input-delay-txt-${rowNum}`);
        const inputTrack = document.getElementById(`input-track-${rowNum}`);

        const ledTime = document.getElementById(`led-time-${rowNum}`);
        const ledType = document.getElementById(`led-type-${rowNum}`);
        const ledName = document.getElementById(`led-name-${rowNum}`);
        const ledDest = document.getElementById(`led-dest-${rowNum}`);
        const ledCar = document.getElementById(`led-car-${rowNum}`);
        const ledDelay = document.getElementById(`led-delay-${rowNum}`);
        const ledTrack = document.getElementById(`led-track-${rowNum}`);

        // 値をデータ属性に退避（交互表示システム用）
        if(inputTime && ledTime) {
            ledTime.setAttribute('data-time', inputTime.value);
            ledTime.setAttribute('data-alt', rowNum === 1 ? "先発" : "次発");
            // 固定モードなら即座に反映
            if (inputAlt && inputAlt.value !== 'alternate') {
                ledTime.innerText = inputTime.value;
                if(inputAlt.value === 'blink') ledTime.classList.add('led-blink-effect');
                else ledTime.classList.remove('led-blink-effect');
            }
        }

        if(inputType && ledType) ledType.innerText = inputType.value;
        if(inputName && ledName) ledName.innerText = inputName.value;
        if(inputDest && ledDest) ledDest.innerText = inputDest.value;
        if(inputCar && ledCar) ledCar.innerText = inputCar.value;
        if(inputTrack && ledTrack) ledTrack.innerText = inputTrack.value;

        // ❶ 遅れ表示ロジックと両数エリアの自動調整
        if (inputDelaySw && inputDelayTxt && ledDelay && ledCar) {
            if (inputDelaySw.value === 'show') {
                ledDelay.innerText = inputDelayTxt.value;
                ledDelay.style.display = 'block';
                ledCar.style.width = '11%'; // 遅れが出たら両数幅を詰める
            } else {
                ledDelay.style.display = 'none';
                ledCar.style.width = '16%'; // 正常時は少し広げる
            }
        }

        // 色付け
        if(inputColor && ledType) {
            ledType.classList.remove('text-green', 'text-orange', 'text-red', 'text-blue', 'text-pink');
            if(inputColor.value === 'custom' && inputPicker) {
                ledType.style.color = inputPicker.value;
                ledType.style.textShadow = `0 0 6px ${inputPicker.value}`;
            } else {
                ledType.style.color = '';
                ledType.style.textShadow = '';
                ledType.classList.add(inputColor.value);
            }
        }
    }

    function updateAllLED() {
        syncRow(1);
        syncRow(2);

        const inputScroll = document.getElementById('input-scroll');
        const inputColorScroll = document.getElementById('input-color-scroll');
        const ledScrollText = document.getElementById('scroll-text');
        
        if(inputScroll && ledScrollText) {
            if (ledScrollText.innerText !== inputScroll.value) {
                ledScrollText.innerText = inputScroll.value;
                ledScrollText.style.animation = 'none';
                ledScrollText.offsetHeight;
                ledScrollText.style.animation = '';
            }
        }
        if(inputColorScroll && ledScrollText) {
            ledScrollText.classList.remove('text-green', 'text-orange', 'text-red');
            ledScrollText.classList.add(inputColorScroll.value);
        }
    }

    // ─── ❸ 駅ごとの一発プリセットデータ定義 ───
    const stationsData = {
        nagano: {
            time1: "14:10", alt1: "alternate", color1: "text-red", type1: "特急", name1: "しなの16号", dest1: "名古屋", car1: "6両", delaySw1: "none", delayTxt1: "5分遅れ", track1: "6番線",
            time2: "14:23", alt2: "alternate", color2: "text-green", type2: "普通", name2: "", dest2: "妙高高原", car2: "3両", delaySw2: "none", delayTxt2: "約20分遅れ", track2: "7番線",
            scroll: "【篠ノ井線情報】信越線・篠ノ井線各列車は、おおむね平常通り運転しています。足元にご注意ください。"
        },
        matsumoto: {
            time1: "15:00", alt1: "alternate", color1: "text-red", type1: "特急", name1: "あずさ34号", dest1: "新宿", car1: "12両", delaySw1: "none", delayTxt1: "5分遅れ", track1: "3番線",
            time2: "15:09", alt2: "alternate", color2: "text-orange", type2: "快速", name2: "みすず", dest2: "飯田", car2: "3両", delaySw2: "show", delayTxt2: "約8分遅れ", track2: "4番線",
            scroll: "【乗車案内】特急あずさ号は全車指定席です。あらかじめ指定席特急券をお買い求めください。"
        },
        nagoya: {
            time1: "16:48", alt1: "blink", color1: "text-red", type1: "特急", name1: "しなの19号", dest1: "長野", car1: "8両", delaySw1: "none", delayTxt1: "5分遅れ", track1: "10番線",
            time2: "17:00", alt2: "alternate", color2: "text-orange", type2: "快速", name2: "", dest2: "中津川", car2: "8両", delaySw2: "none", delayTxt2: "約20分遅れ", track2: "11番線",
            scroll: "JR東海をご利用いただきありがとうございます。3・4番線ホームのきしめん店は営業中です。"
        },
        shinjuku: {
            time1: "18:00", alt1: "alternate", color1: "text-red", type1: "特急", name1: "あずさ45号", dest1: "松本", car1: "12\\u4e21", delaySw1: "none", delayTxt1: "5分遅れ", track1: "9番線",
            time2: "18:15", alt2: "alternate", color2: "text-green", type2: "普通", name2: "", dest2: "大月", car2: "10両", delaySw2: "none", delayTxt2: "約20分遅れ", track2: "11番線",
            scroll: "【中央線速報】山手線内での異音感知の影響により、中央線快速電車にわずかな遅れが出ています。"
        }
    };

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const st = stationsData[btn.getAttribute('data-station')];
            if(!st) return;

            document.getElementById('input-time-1').value = st.time1;
            document.getElementById('input-alt-1').value = st.alt1;
            document.getElementById('input-color-1').value = st.color1;
            document.getElementById('input-type-1').value = st.type1;
            document.getElementById('input-name-1').value = st.name1;
            document.getElementById('input-dest-1').value = st.dest1;
            document.getElementById('input-car-1').value = st.car1;
            document.getElementById('input-delay-sw-1').value = st.delaySw1;
            document.getElementById('input-delay-txt-1').value = st.delayTxt1;
            document.getElementById('input-track-1').value = st.track1;

            document.getElementById('input-time-2').value = st.time2;
            document.getElementById('input-alt-2').value = st.alt2;
            document.getElementById('input-color-2').value = st.color2;
            document.getElementById('input-type-2').value = st.type2;
            document.getElementById('input-name-2').value = st.name2;
            document.getElementById('input-dest-2').value = st.dest2;
            document.getElementById('input-car-2').value = st.car2;
            document.getElementById('input-delay-sw-2').value = st.delaySw2;
            document.getElementById('input-delay-txt-2').value = st.delayTxt2;
            document.getElementById('input-track-2').value = st.track2;

            document.getElementById('input-scroll').value = st.scroll;

            updateAllLED();
        });
    });

    // 各イベントの監視
    const ids = [
        'input-time-1', 'input-alt-1', 'input-color-1', 'input-picker-1', 'input-type-1', 'input-name-1', 'input-dest-1', 'input-car-1', 'input-delay-sw-1', 'input-delay-txt-1', 'input-track-1',
        'input-time-2', 'input-alt-2', 'input-color-2', 'input-picker-2', 'input-type-2', 'input-name-2', 'input-dest-2', 'input-car-2', 'input-delay-sw-2', 'input-delay-txt-2', 'input-track-2',
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