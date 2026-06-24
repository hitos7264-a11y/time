/* ============================================================
   AETHER CLOCK — ui/settings.js
   設定パネルのUIロジック (テーマ・スイッチ・スライダー)
   ============================================================ */
window.AC = window.AC || {};

AC.Settings = (function () {

    function init() {
        buildThemeGrid();
        buildTimezones();
        bindSwitches();
        bindRanges();
        bindReset();
        syncUI();
    }

    /* テーマグリッド生成 */
    function buildThemeGrid() {
        const grid = AC.DOM.byId('theme-grid');
        if (!grid) return;
        grid.innerHTML = '';
        AC.Themes.list.forEach(theme => {
            const swatch = AC.DOM.el('div', {
                class: 'theme-swatch',
                'data-theme': theme.id,
                title: theme.name
            });
            swatch.style.background = `linear-gradient(135deg, ${theme.c1}, ${theme.c2}), ${theme.bg}`;
            swatch.style.backgroundBlendMode = 'overlay';
            swatch.appendChild(AC.DOM.el('span', { class: 'theme-swatch__name', text: theme.name }));
            swatch.addEventListener('click', () => applyTheme(theme.id));
            grid.appendChild(swatch);
        });
        markActiveTheme(AC.State.get('theme'));
    }

    function applyTheme(id) {
        AC.Themes.list.forEach(t => document.body.classList.remove('theme-' + t.id));
        document.body.classList.add('theme-' + id);
        AC.State.set('theme', id);
        markActiveTheme(id);
        // Canvas系に色更新を通知 (CSS変数反映を待つ)
        requestAnimationFrame(() => AC.Bus.emit('theme-changed', id));
        AC.DOM.toast(`テーマ: ${AC.Themes.get(id).name}`, 'fa-palette');
    }

    function markActiveTheme(id) {
        AC.DOM.$$('.theme-swatch').forEach(s => {
            s.classList.toggle('is-active', s.dataset.theme === id);
        });
    }

    /* タイムゾーンセレクト */
    function buildTimezones() {
        const sel = AC.DOM.byId('opt-timezone');
        if (!sel) return;
        sel.innerHTML = '';
        AC.Timezones.list.forEach(tz => {
            sel.appendChild(AC.DOM.el('option', { value: tz.id, text: tz.value }));
        });
        sel.value = AC.State.get('timezone');
        sel.addEventListener('change', () => {
            AC.State.set('timezone', sel.value);
            AC.DOM.toast(`タイムゾーン: ${AC.Timezones.abbr(sel.value)}`, 'fa-earth-asia');
        });
    }

    /* スイッチ群 */
    function bindSwitches() {
        const map = {
            'opt-sweep': 'sweep',
            'opt-ms': 'showMs',
            'opt-24h': 'is24h',
            'opt-particles': 'particles',
            'opt-aurora': 'aurora',
            'opt-glitch': 'glitch',
            'opt-tick': 'tickSound'
        };
        Object.entries(map).forEach(([id, key]) => {
            const input = AC.DOM.byId(id);
            if (!input) return;
            input.checked = !!AC.State.get(key);
            input.addEventListener('change', () => {
                AC.State.set(key, input.checked);
                AC.Bus.emit('setting:' + key, input.checked);
                handleSpecial(key, input.checked);
            });
        });
    }

    function handleSpecial(key, value) {
        if (key === 'glitch') {
            document.body.classList.toggle('glitch-on', value);
        }
        if (key === 'tickSound' && value) {
            AC.State.set('soundEnabled', true);
        }
    }

    /* スライダー群 */
    function bindRanges() {
        const density = AC.DOM.byId('opt-density');
        const densityVal = AC.DOM.byId('val-density');
        if (density) {
            density.value = AC.State.get('density');
            if (densityVal) densityVal.textContent = density.value;
            density.addEventListener('input', () => {
                if (densityVal) densityVal.textContent = density.value;
                AC.State.set('density', parseInt(density.value, 10));
                AC.Bus.emit('setting:density', parseInt(density.value, 10));
            });
        }

        const glow = AC.DOM.byId('opt-glow');
        const glowVal = AC.DOM.byId('val-glow');
        if (glow) {
            glow.value = AC.State.get('glow');
            if (glowVal) glowVal.textContent = glow.value;
            glow.addEventListener('input', () => {
                if (glowVal) glowVal.textContent = glow.value;
                const v = parseInt(glow.value, 10);
                AC.State.set('glow', v);
                document.documentElement.style.setProperty('--glow-intensity', v / 100);
            });
        }
        // 初期反映
        document.documentElement.style.setProperty('--glow-intensity', AC.State.get('glow') / 100);
    }

    /* リセット */
    function bindReset() {
        AC.DOM.on('#btn-reset', 'click', () => {
            AC.State.reset();
            applyTheme(AC.State.get('theme'));
            syncUI();
            document.documentElement.style.setProperty('--glow-intensity', AC.State.get('glow') / 100);
            AC.Bus.emit('setting:density', AC.State.get('density'));
            AC.Bus.emit('setting:particles', AC.State.get('particles'));
            AC.Bus.emit('setting:aurora', AC.State.get('aurora'));
            document.body.classList.toggle('glitch-on', AC.State.get('glitch'));
            AC.Bus.emit('mode-change', AC.State.get('mode'));
            AC.DOM.toast('設定をリセットしました', 'fa-rotate-left');
        });
    }

    /* UIを状態と同期 */
    function syncUI() {
        const checks = {
            'opt-sweep': 'sweep', 'opt-ms': 'showMs', 'opt-24h': 'is24h',
            'opt-particles': 'particles', 'opt-aurora': 'aurora',
            'opt-glitch': 'glitch', 'opt-tick': 'tickSound'
        };
        Object.entries(checks).forEach(([id, key]) => {
            const el = AC.DOM.byId(id);
            if (el) el.checked = !!AC.State.get(key);
        });
        const tz = AC.DOM.byId('opt-timezone');
        if (tz) tz.value = AC.State.get('timezone');
        const density = AC.DOM.byId('opt-density');
        if (density) {
            density.value = AC.State.get('density');
            const dv = AC.DOM.byId('val-density'); if (dv) dv.textContent = density.value;
        }
        const glow = AC.DOM.byId('opt-glow');
        if (glow) {
            glow.value = AC.State.get('glow');
            const gv = AC.DOM.byId('val-glow'); if (gv) gv.textContent = glow.value;
        }
    }

    return { init, applyTheme };
})();
