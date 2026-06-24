/* ============================================================
   AETHER CLOCK — tools/worldclock.js
   世界時計パネル
   ============================================================ */
window.AC = window.AC || {};

AC.WorldClock = (function () {
    let grid;
    let cards = [];
    let built = false;

    function init() {
        grid = AC.DOM.byId('world-grid');
        if (!grid) return;
        build();
        AC.Loop.add(update, 'worldclock');
    }

    function build() {
        if (built) return;
        grid.innerHTML = '';
        cards = [];
        AC.Timezones.worldCities.forEach(c => {
            const timeEl = AC.DOM.el('div', { class: 'world-card__time', text: '--:--:--' });
            const metaEl = AC.DOM.el('div', { class: 'world-card__meta' }, [
                AC.DOM.el('span', { class: 'wc-date', text: '' }),
                AC.DOM.el('span', { class: 'wc-offset', text: AC.Timezones.offsetStr(c.tz) })
            ]);
            const dayNight = AC.DOM.el('div', { class: 'world-card__daynight', text: '☀️' });
            const card = AC.DOM.el('div', { class: 'world-card' }, [
                dayNight,
                AC.DOM.el('div', { class: 'world-card__city' }, [
                    AC.DOM.el('span', { class: 'world-card__flag', text: c.flag }),
                    document.createTextNode(c.city)
                ]),
                timeEl,
                metaEl
            ]);
            grid.appendChild(card);
            cards.push({ tz: c.tz, timeEl, dateEl: metaEl.querySelector('.wc-date'), dayNight, card });
        });
        built = true;
    }

    function update() {
        if (AC.Panels && AC.Panels.isOpen() !== 'worldclock-panel') return;
        cards.forEach(c => {
            const p = AC.Time.getParts(c.tz);
            c.timeEl.textContent = `${AC.Time.pad(p.hours)}:${AC.Time.pad(p.minutes)}:${AC.Time.pad(p.seconds)}`;
            c.dateEl.textContent = `${AC.Time.pad(p.month)}/${AC.Time.pad(p.day)} ${AC.Time.WEEKDAYS_EN[p.weekday]}`;
            const day = AC.Astro.isDaytime(p.hours);
            c.dayNight.textContent = day ? '☀️' : '🌙';
            c.card.style.borderColor = day ? 'rgba(255,200,80,0.3)' : 'rgba(100,140,255,0.3)';
        });
    }

    return { init };
})();
