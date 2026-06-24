/* ============================================================
   AETHER CLOCK — ui/sidebar.js
   サイド情報パネル・ティッカー・天体情報の更新
   ============================================================ */
window.AC = window.AC || {};

AC.Sidebar = (function () {
    let els = {};
    let startTime = Date.now();
    let lastSecond = -1;

    function init() {
        els = {
            systime: AC.DOM.byId('info-systime'),
            fps: AC.DOM.byId('info-fps'),
            uptime: AC.DOM.byId('info-uptime'),
            microBars: AC.DOM.byId('micro-bars'),
            dayProgressText: AC.DOM.byId('day-progress-text'),
            dayProgressRing: AC.DOM.$('[data-ring="day"] .rp-fg'),
            sun: AC.DOM.byId('info-sun'),
            moon: AC.DOM.byId('info-moon'),
            season: AC.DOM.byId('info-season'),
            tickerTrack: AC.DOM.byId('ticker-track')
        };

        // FPS表示
        AC.Bus.on('fps', fps => {
            if (els.fps) els.fps.textContent = fps + ' FPS';
            animateMicroBars(fps);
        });

        buildTicker();
        AC.Loop.add(update, 'sidebar');
        // 1秒ごとの更新
        setInterval(updateAstro, 60000);
        updateAstro();
    }

    function update() {
        const now = new Date();
        const p = AC.Time.getParts(AC.State.get('timezone'));

        // システム時刻
        if (els.systime) {
            els.systime.textContent = `${AC.Time.pad(p.hours)}:${AC.Time.pad(p.minutes)}:${AC.Time.pad(p.seconds)}`;
        }

        // 稼働時間
        if (els.uptime) {
            els.uptime.textContent = AC.Time.formatDuration(Date.now() - startTime, false);
        }

        // 1日の進捗
        const prog = AC.Time.dayProgress(p);
        if (els.dayProgressText) els.dayProgressText.textContent = Math.round(prog * 100) + '%';
        if (els.dayProgressRing) {
            const circ = 2 * Math.PI * 34;
            els.dayProgressRing.style.strokeDashoffset = circ * (1 - prog);
        }

        // 秒の変化を検出してイベント発火
        if (p.seconds !== lastSecond) {
            lastSecond = p.seconds;
            AC.Bus.emit('tick-second', p);
        }
    }

    function animateMicroBars(fps) {
        if (!els.microBars) return;
        const bars = els.microBars.children;
        const norm = AC.Math.clamp(fps / 60, 0, 1);
        for (let i = 0; i < bars.length; i++) {
            const variance = Math.sin(Date.now() / 200 + i) * 0.2 + 0.8;
            const h = AC.Math.clamp(norm * variance * 100, 15, 100);
            bars[i].style.height = h + '%';
        }
    }

    function updateAstro() {
        const now = new Date();
        const p = AC.Time.getParts('local');

        const moon = AC.Astro.moonPhase(now);
        if (els.moon) els.moon.innerHTML = `${moon.icon} ${moon.name} <small style="opacity:.6">(${moon.illumination}%)</small>`;

        const sun = AC.Astro.sunTimes(now);
        if (els.sun) {
            els.sun.innerHTML = `<i class="fa-solid fa-arrow-up"></i> ${sun.sunrise} <i class="fa-solid fa-arrow-down" style="margin-left:8px"></i> ${sun.sunset}`;
        }

        const season = AC.Time.getSeason(p.month, p.day);
        if (els.season) els.season.textContent = `${season.icon} ${season.name}`;
    }

    /* 下部ティッカー */
    function buildTicker() {
        if (!els.tickerTrack) return;
        const now = new Date();
        const p = AC.Time.getParts('local');
        const moon = AC.Astro.moonPhase(now);
        const sun = AC.Astro.sunTimes(now);
        const items = [
            `<span><i class="fa-solid fa-calendar-day"></i> 年間通日 <b>${AC.Time.dayOfYear(now)}日目</b></span>`,
            `<span><i class="fa-solid fa-calendar-week"></i> 第 <b>${AC.Time.weekNumber(now)}</b> 週</span>`,
            `<span><i class="fa-solid fa-sun"></i> 日の出 <b>${sun.sunrise}</b> / 日の入り <b>${sun.sunset}</b></span>`,
            `<span><i class="fa-solid fa-hourglass"></i> 昼の長さ <b>${sun.dayLength}h</b></span>`,
            `<span>${moon.icon} 月齢 <b>${moon.age}</b> (照度 ${moon.illumination}%)</span>`,
            `<span><i class="fa-solid fa-bolt"></i> AETHER CLOCK SYSTEM — REALTIME PRECISION ENGINE</span>`,
            `<span><i class="fa-solid fa-globe"></i> UTC基準 高精度同期表示</span>`
        ];
        const content = items.join('') + items.join(''); // ループ用に2回
        els.tickerTrack.innerHTML = content;
    }

    return { init };
})();
