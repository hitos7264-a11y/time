/* ============================================================
   AETHER CLOCK — clocks/binary.js
   バイナリ時計 (BCD: Binary Coded Decimal表示)
   ============================================================ */
window.AC = window.AC || {};

AC.BinaryClock = (function () {
    let container;
    let built = false;
    let dots = []; // [col][row]

    // 各桁の最大ビット数 (BCD)
    const COLS = [
        { name: 'H', bits: 2 }, { name: 'H', bits: 4 },
        { name: 'M', bits: 3 }, { name: 'M', bits: 4 },
        { name: 'S', bits: 3 }, { name: 'S', bits: 4 }
    ];
    const MAX_ROWS = 4;

    function init() {
        container = AC.DOM.byId('binary-clock');
        if (!container) return;
        build();
        AC.Loop.add(render, 'binary');
    }

    function build() {
        if (built) return;
        container.innerHTML = '';
        dots = [];
        COLS.forEach((col, ci) => {
            const colEl = AC.DOM.el('div', { class: 'binary-col' });
            const colDots = [];
            // 上から(MSB) 下へ(LSB)。空白行はplaceholder
            for (let row = MAX_ROWS - 1; row >= 0; row--) {
                if (row < col.bits) {
                    const dot = AC.DOM.el('div', { class: 'binary-dot' });
                    colEl.appendChild(dot);
                    colDots[row] = dot;
                } else {
                    colEl.appendChild(AC.DOM.el('div', { class: 'binary-dot placeholder' }));
                }
            }
            const label = AC.DOM.el('div', { class: 'binary-col__label', text: '0' });
            colEl.appendChild(label);
            colEl._label = label;
            container.appendChild(colEl);
            dots[ci] = colDots;
        });
        built = true;
    }

    function render() {
        if (AC.State.get('mode') !== 'binary') return;
        const p = AC.Time.getParts(AC.State.get('timezone'));
        const values = [
            Math.floor(p.hours / 10), p.hours % 10,
            Math.floor(p.minutes / 10), p.minutes % 10,
            Math.floor(p.seconds / 10), p.seconds % 10
        ];
        values.forEach((val, ci) => {
            const colDots = dots[ci];
            for (let row = 0; row < COLS[ci].bits; row++) {
                const bit = (val >> row) & 1;
                const dot = colDots[row];
                if (dot) dot.classList.toggle('on', bit === 1);
            }
            const colEl = container.children[ci];
            if (colEl && colEl._label) colEl._label.textContent = val;
        });
    }

    return { init };
})();
