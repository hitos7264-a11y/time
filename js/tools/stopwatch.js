/* ============================================================
   AETHER CLOCK — tools/stopwatch.js
   高精度ストップウォッチ (ラップ機能付き)
   ============================================================ */
window.AC = window.AC || {};

AC.Stopwatch = (function () {
    let display, lapsEl, startBtn;
    let running = false;
    let startStamp = 0;
    let elapsed = 0;
    let laps = [];
    let rafId = null;

    function init() {
        display = AC.DOM.byId('sw-display');
        lapsEl = AC.DOM.byId('sw-laps');
        startBtn = AC.DOM.byId('sw-start');

        AC.DOM.on('#sw-start', 'click', toggle);
        AC.DOM.on('#sw-lap', 'click', lap);
        AC.DOM.on('#sw-reset', 'click', reset);
        renderDisplay();
    }

    function toggle() {
        running ? pause() : start();
    }

    function start() {
        running = true;
        startStamp = performance.now() - elapsed;
        startBtn.innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE';
        startBtn.classList.add('big-btn--primary');
        loop();
    }

    function pause() {
        running = false;
        cancelAnimationFrame(rafId);
        startBtn.innerHTML = '<i class="fa-solid fa-play"></i> RESUME';
    }

    function loop() {
        if (!running) return;
        elapsed = performance.now() - startStamp;
        renderDisplay();
        rafId = requestAnimationFrame(loop);
    }

    function lap() {
        if (!running && elapsed === 0) return;
        const lapTime = elapsed - (laps.length ? laps[laps.length - 1].total : 0);
        laps.push({ total: elapsed, lap: lapTime });
        renderLaps();
    }

    function reset() {
        running = false;
        cancelAnimationFrame(rafId);
        elapsed = 0;
        laps = [];
        startBtn.innerHTML = '<i class="fa-solid fa-play"></i> START';
        startBtn.classList.add('big-btn--primary');
        renderDisplay();
        renderLaps();
    }

    function renderDisplay() {
        if (display) display.textContent = AC.Time.formatDuration(elapsed, true);
    }

    function renderLaps() {
        if (!lapsEl) return;
        lapsEl.innerHTML = '';
        // 最速・最遅を判定
        let fastest = Infinity, slowest = -Infinity;
        laps.forEach(l => {
            if (l.lap < fastest) fastest = l.lap;
            if (l.lap > slowest) slowest = l.lap;
        });
        [...laps].reverse().forEach((l, i) => {
            const idx = laps.length - i;
            const li = AC.DOM.el('li', {}, [
                AC.DOM.el('span', { text: `LAP ${AC.Time.pad(idx)}` }),
                AC.DOM.el('span', { text: AC.Time.formatDuration(l.lap, true) }),
                AC.DOM.el('span', { text: AC.Time.formatDuration(l.total, true), class: 'sw-total' })
            ]);
            if (laps.length > 1) {
                if (l.lap === fastest) li.style.borderLeftColor = '#2bffb0';
                if (l.lap === slowest) li.style.borderLeftColor = '#ff3860';
            }
            lapsEl.appendChild(li);
        });
    }

    return { init };
})();
