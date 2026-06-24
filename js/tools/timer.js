/* ============================================================
   AETHER CLOCK — tools/timer.js
   カウントダウンタイマー (プリセット付き)
   ============================================================ */
window.AC = window.AC || {};

AC.Timer = (function () {
    let display, panel;
    let inputs = {};
    let running = false;
    let endStamp = 0;
    let remaining = 0;
    let rafId = null;

    const PRESETS = [
        { label: '1分', s: 60 },
        { label: '3分', s: 180 },
        { label: '5分', s: 300 },
        { label: '10分', s: 600 },
        { label: '15分', s: 900 },
        { label: '25分', s: 1500 }
    ];

    function init() {
        display = AC.DOM.byId('timer-display');
        panel = AC.DOM.byId('timer-panel');
        inputs = {
            h: AC.DOM.byId('timer-h'),
            m: AC.DOM.byId('timer-m'),
            s: AC.DOM.byId('timer-s')
        };
        buildPresets();
        AC.DOM.on('#timer-start', 'click', toggle);
        AC.DOM.on('#timer-reset', 'click', reset);
        [inputs.h, inputs.m, inputs.s].forEach(inp => {
            if (inp) inp.addEventListener('change', () => { if (!running) updateFromInputs(); });
        });
        updateFromInputs();
    }

    function buildPresets() {
        const wrap = AC.DOM.byId('timer-presets');
        if (!wrap) return;
        wrap.innerHTML = '';
        PRESETS.forEach(p => {
            const btn = AC.DOM.el('button', { text: p.label });
            btn.addEventListener('click', () => {
                setSeconds(p.s);
                if (running) reset();
            });
            wrap.appendChild(btn);
        });
    }

    function setSeconds(total) {
        inputs.h.value = Math.floor(total / 3600);
        inputs.m.value = Math.floor((total % 3600) / 60);
        inputs.s.value = total % 60;
        updateFromInputs();
    }

    function getInputSeconds() {
        const h = parseInt(inputs.h.value, 10) || 0;
        const m = parseInt(inputs.m.value, 10) || 0;
        const s = parseInt(inputs.s.value, 10) || 0;
        return h * 3600 + m * 60 + s;
    }

    function updateFromInputs() {
        remaining = getInputSeconds() * 1000;
        renderDisplay();
    }

    function toggle() {
        running ? pause() : start();
    }

    function start() {
        if (remaining <= 0) {
            updateFromInputs();
            if (remaining <= 0) { AC.DOM.toast('時間を設定してください', 'fa-triangle-exclamation'); return; }
        }
        running = true;
        endStamp = performance.now() + remaining;
        AC.DOM.byId('timer-start').innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE';
        loop();
    }

    function pause() {
        running = false;
        cancelAnimationFrame(rafId);
        AC.DOM.byId('timer-start').innerHTML = '<i class="fa-solid fa-play"></i> RESUME';
    }

    function loop() {
        if (!running) return;
        remaining = endStamp - performance.now();
        if (remaining <= 0) {
            remaining = 0;
            finish();
            return;
        }
        renderDisplay();
        rafId = requestAnimationFrame(loop);
    }

    function finish() {
        running = false;
        renderDisplay();
        AC.DOM.byId('timer-start').innerHTML = '<i class="fa-solid fa-play"></i> START';
        AC.DOM.toast('⏰ タイマー終了！', 'fa-bell');
        if (AC.Sound) AC.Sound.alarm();
        // パネル点滅
        if (panel) {
            panel.style.animation = 'alertFlash 0.5s 6';
            setTimeout(() => { panel.style.animation = ''; }, 3200);
        }
    }

    function reset() {
        running = false;
        cancelAnimationFrame(rafId);
        AC.DOM.byId('timer-start').innerHTML = '<i class="fa-solid fa-play"></i> START';
        updateFromInputs();
    }

    function renderDisplay() {
        if (!display) return;
        const totalSec = Math.ceil(remaining / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        display.textContent = `${AC.Time.pad(h)}:${AC.Time.pad(m)}:${AC.Time.pad(s)}`;
        // 残り10秒で赤く
        display.style.color = (totalSec <= 10 && running) ? '#ff3860' : '';
    }

    return { init };
})();
