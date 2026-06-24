/* ============================================================
   AETHER CLOCK — clocks/word.js
   ワードクロック (英語で時刻を文章表示する古典的時計)
   ============================================================ */
window.AC = window.AC || {};

AC.WordClock = (function () {
    let container;
    let built = false;
    let cells = []; // {word, el} のフラット配列

    // 11x10 の文字グリッド。各行は単語に対応するトークンを並べる
    // 各セルは {text, key} で、keyは点灯判定に使用
    const GRID = [
        ['IT','-','IS','-','HALF','-','TEN'],
        ['QUARTER','-','TWENTY'],
        ['FIVE','MINUTES','-','TO'],
        ['PAST','-','ONE','-','TWO'],
        ['THREE','-','FOUR','-','FIVE'],
        ['SIX','-','SEVEN','-','EIGHT'],
        ['NINE','-','TEN','-','ELEVEN'],
        ['TWELVE','-','OCLOCK']
    ];

    function init() {
        container = AC.DOM.byId('word-clock');
        if (!container) return;
        build();
        AC.Loop.add(render, 'word');
        AC.Bus.on('tick-second', render);
    }

    function build() {
        if (built) return;
        container.innerHTML = '';
        container.style.gridTemplateColumns = 'none';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '8px';
        cells = [];
        GRID.forEach(row => {
            const rowEl = AC.DOM.el('div', {
                class: 'word-row'
            });
            rowEl.style.display = 'flex';
            rowEl.style.gap = '14px';
            rowEl.style.justifyContent = 'center';
            row.forEach(token => {
                if (token === '-') return;
                const span = AC.DOM.el('span', { text: token });
                rowEl.appendChild(span);
                cells.push({ word: token, el: span });
            });
            container.appendChild(rowEl);
        });
        built = true;
    }

    /** 時刻を点灯すべき単語リストに変換 */
    function getActiveWords(h, m) {
        const active = ['IT', 'IS'];
        const round = Math.round(m / 5) * 5;
        let displayHour = h % 12;
        let suffix = null;

        if (round === 0) {
            // ちょうど
        } else if (round <= 30) {
            suffix = 'PAST';
        } else {
            suffix = 'TO';
            displayHour = (displayHour + 1) % 12;
        }

        const minutesMap = {
            5: ['FIVE', 'MINUTES'],
            10: ['TEN', 'MINUTES'],
            15: ['QUARTER'],
            20: ['TWENTY', 'MINUTES'],
            25: ['TWENTY', 'FIVE', 'MINUTES'],
            30: ['HALF'],
            35: ['TWENTY', 'FIVE', 'MINUTES'],
            40: ['TWENTY', 'MINUTES'],
            45: ['QUARTER'],
            50: ['TEN', 'MINUTES'],
            55: ['FIVE', 'MINUTES']
        };
        if (minutesMap[round]) active.push(...minutesMap[round]);
        if (suffix) active.push(suffix);

        const hourWords = ['TWELVE','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN','ELEVEN'];
        active.push(hourWords[displayHour]);

        if (round === 0) active.push('OCLOCK');
        return active;
    }

    function render() {
        if (AC.State.get('mode') !== 'word') return;
        const p = AC.Time.getParts(AC.State.get('timezone'));
        const active = getActiveWords(p.hours, p.minutes);
        // 単語は重複する可能性があるが、左から順に最初の未使用セルを点灯
        const used = new Set();
        cells.forEach(c => c.el.classList.remove('lit'));
        active.forEach(word => {
            const cell = cells.find((c, i) => c.word === word && !used.has(i));
            if (cell) {
                const idx = cells.indexOf(cell);
                used.add(idx);
                cell.el.classList.add('lit');
            }
        });
    }

    return { init };
})();
