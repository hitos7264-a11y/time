/* ============================================================
   AETHER CLOCK — clocks/digital.js
   デジタル時計 (フリップアニメーション付き)
   ============================================================ */
window.AC = window.AC || {};

AC.DigitalClock = (function () {
    let els = {};
    let last = { h1:'', h2:'', m1:'', m2:'', s1:'', s2:'' };
    let progressBuilt = false;

    function init() {
        els = {
            date: AC.DOM.byId('digital-date'),
            ms: AC.DOM.byId('digital-ms'),
            ampm: AC.DOM.byId('digital-ampm'),
            tz: AC.DOM.byId('digital-tz'),
            week: AC.DOM.byId('digital-week'),
            progressRow: AC.DOM.byId('digital-progress-row'),
            digits: {
                h1: AC.DOM.$('[data-d="h1"]'),
                h2: AC.DOM.$('[data-d="h2"]'),
                m1: AC.DOM.$('[data-d="m1"]'),
                m2: AC.DOM.$('[data-d="m2"]'),
                s1: AC.DOM.$('[data-d="s1"]'),
                s2: AC.DOM.$('[data-d="s2"]')
            }
        };
        buildProgress();
        AC.Loop.add(render, 'digital');
    }

    function buildProgress() {
        if (progressBuilt || !els.progressRow) return;
        const units = [
            { key: 'hours', label: 'HOUR', max: 24 },
            { key: 'minutes', label: 'MINUTE', max: 60 },
            { key: 'seconds', label: 'SECOND', max: 60 }
        ];
        els.progressRow.innerHTML = '';
        units.forEach(u => {
            const item = AC.DOM.el('div', { class: 'dp-item', 'data-key': u.key }, [
                AC.DOM.el('div', { class: 'dp-item__head' }, [
                    AC.DOM.el('span', { text: u.label }),
                    AC.DOM.el('b', { 'data-val': '', text: '0' })
                ]),
                AC.DOM.el('div', { class: 'dp-bar' }, [
                    AC.DOM.el('div', { class: 'dp-bar__fill' })
                ])
            ]);
            els.progressRow.appendChild(item);
        });
        progressBuilt = true;
    }

    function render() {
        const mode = AC.State.get('mode');
        if (mode !== 'digital' && mode !== 'hybrid') return;

        const tz = AC.State.get('timezone');
        const p = AC.Time.getParts(tz);
        const is24h = AC.State.get('is24h');

        let displayHour = p.hours;
        let ampmText = '24H';
        if (!is24h) {
            const t = AC.Time.to12(p.hours);
            displayHour = t.hour;
            ampmText = t.ampm;
        }

        const hStr = AC.Time.pad(displayHour);
        const mStr = AC.Time.pad(p.minutes);
        const sStr = AC.Time.pad(p.seconds);

        setDigit('h1', hStr[0]);
        setDigit('h2', hStr[1]);
        setDigit('m1', mStr[0]);
        setDigit('m2', mStr[1]);
        setDigit('s1', sStr[0]);
        setDigit('s2', sStr[1]);

        // ミリ秒
        if (AC.State.get('showMs')) {
            els.ms.style.display = '';
            els.ms.textContent = '.' + AC.Time.pad(p.ms, 3);
        } else {
            els.ms.style.display = 'none';
        }

        // 日付
        const weekday = AC.Time.WEEKDAYS_JP[p.weekday];
        els.date.textContent = `${p.year}.${AC.Time.pad(p.month)}.${AC.Time.pad(p.day)} ${AC.Time.WEEKDAYS_EN[p.weekday]}`;

        // メタ
        els.ampm.textContent = ampmText;
        els.tz.textContent = `${AC.Timezones.abbr(tz)} · ${AC.Timezones.offsetStr(tz)}`;
        els.week.textContent = `WEEK ${AC.Time.weekNumber(p.raw)}`;

        // 進捗バー
        updateProgress('hours', p.hours, 24, p.minutes / 60);
        updateProgress('minutes', p.minutes, 60, p.seconds / 60);
        updateProgress('seconds', p.seconds, 60, p.ms / 1000);
    }

    function setDigit(key, char) {
        const el = els.digits[key];
        if (!el) return;
        if (last[key] !== char) {
            el.textContent = char;
            el.classList.remove('flip');
            void el.offsetWidth; // reflow
            el.classList.add('flip');
            last[key] = char;
        }
    }

    function updateProgress(key, value, max, fraction) {
        if (!els.progressRow) return;
        const item = els.progressRow.querySelector(`[data-key="${key}"]`);
        if (!item) return;
        const pct = ((value + fraction) / max) * 100;
        const fill = item.querySelector('.dp-bar__fill');
        const val = item.querySelector('[data-val]');
        if (fill) fill.style.width = pct + '%';
        if (val) val.textContent = AC.Time.pad(value);
    }

    return { init };
})();
