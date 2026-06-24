/* ============================================================
   AETHER CLOCK — main.js
   アプリケーション初期化とオーケストレーション
   ============================================================ */
(function () {
    'use strict';
    const { DOM, State, Bus, Loop } = AC;

    /* ---------- 起動シーケンス ---------- */
    function boot() {
        // 1. 状態を読み込み
        State.load();

        // 2. テーマを適用
        applyInitialTheme();

        // 3. モードを適用
        applyMode(State.get('mode'), true);

        // 4. グローバル発光強度
        document.documentElement.style.setProperty('--glow-intensity', State.get('glow') / 100);

        // 5. グリッチ状態
        document.body.classList.toggle('glitch-on', State.get('glitch'));

        // 6. 各モジュール初期化
        initModules();

        // 7. イベント結線
        bindNavigation();
        bindHudButtons();
        bindKeyboard();
        injectMobileWarning();

        // 8. ループ開始
        Loop.start();

        // 9. ローディング演出
        runLoadingSequence();
    }

    /* ---------- ローディング ---------- */
    function runLoadingSequence() {
        const screen = DOM.byId('loading-screen');
        const bar = DOM.byId('loader-bar');
        const status = DOM.byId('loader-status');
        if (!screen) return;

        const steps = [
            { p: 18, t: 'LOADING MODULES...' },
            { p: 40, t: 'CALIBRATING TIME ENGINE...' },
            { p: 62, t: 'RENDERING PARTICLES...' },
            { p: 82, t: 'SYNCHRONIZING UTC...' },
            { p: 100, t: 'READY' }
        ];
        let i = 0;
        const advance = () => {
            if (i >= steps.length) {
                setTimeout(() => {
                    screen.classList.add('is-done');
                    const cluster = DOM.byId('clock-cluster');
                    document.body.classList.add('is-entering');
                    if (cluster) cluster.classList.add('is-entering');
                    setTimeout(() => {
                        document.body.classList.remove('is-entering');
                        if (cluster) cluster.classList.remove('is-entering');
                        screen.style.display = 'none';
                    }, 900);
                }, 350);
                return;
            }
            const step = steps[i++];
            if (bar) bar.style.width = step.p + '%';
            if (status) status.textContent = step.t;
            setTimeout(advance, AC.Math.randInt(220, 420));
        };
        setTimeout(advance, 300);
    }

    /* ---------- モジュール初期化 ---------- */
    function initModules() {
        const modules = [
            'Settings', 'Panels', 'Sidebar',
            'AnalogClock', 'DigitalClock', 'BinaryClock', 'WordClock',
            'Particles', 'Aurora',
            'Stopwatch', 'Timer', 'WorldClock', 'Sound'
        ];
        modules.forEach(name => {
            if (AC[name] && typeof AC[name].init === 'function') {
                try { AC[name].init(); } catch (e) { console.error(`[init ${name}]`, e); }
            }
        });
    }

    /* ---------- テーマ初期適用 ---------- */
    function applyInitialTheme() {
        AC.Themes.list.forEach(t => document.body.classList.remove('theme-' + t.id));
        document.body.classList.add('theme-' + State.get('theme'));
    }

    /* ---------- 表示モード ---------- */
    function applyMode(mode, silent) {
        document.body.dataset.clockMode = mode;
        State.set('mode', mode);

        // ナビボタンのアクティブ状態
        DOM.$$('.hud-nav__btn').forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.mode === mode);
        });

        // ステージ表示制御
        const stages = {
            analog: DOM.byId('analog-stage'),
            digital: DOM.byId('digital-stage'),
            binary: DOM.byId('binary-stage'),
            word: DOM.byId('word-stage')
        };
        Object.values(stages).forEach(s => s && s.classList.remove('is-visible'));

        if (mode === 'hybrid') {
            // hybridはCSSで両方表示。is-visibleは不要
            stages.analog && stages.analog.classList.remove('is-visible');
            stages.digital && stages.digital.classList.remove('is-visible');
        } else if (stages[mode]) {
            stages[mode].classList.add('is-visible');
        }

        // アナログのリサイズ反映
        if ((mode === 'analog' || mode === 'hybrid') && AC.AnalogClock) {
            requestAnimationFrame(() => AC.AnalogClock.resize());
        }

        if (!silent) {
            const labels = { hybrid: 'ハイブリッド', analog: 'アナログ', digital: 'デジタル', binary: 'バイナリ', word: 'ワードクロック' };
            DOM.toast(`表示モード: ${labels[mode] || mode}`, 'fa-display');
        }
    }

    /* ---------- ナビゲーション ---------- */
    function bindNavigation() {
        DOM.$$('.hud-nav__btn').forEach(btn => {
            btn.addEventListener('click', () => applyMode(btn.dataset.mode));
        });
        Bus.on('mode-change', m => applyMode(m, true));
    }

    /* ---------- HUDボタン ---------- */
    function bindHudButtons() {
        // フルスクリーン
        DOM.on('#btn-fullscreen', 'click', toggleFullscreen);
        document.addEventListener('fullscreenchange', () => {
            const btn = DOM.byId('btn-fullscreen');
            if (btn) btn.querySelector('i').className = document.fullscreenElement
                ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
        });
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {});
        } else {
            document.exitFullscreen?.();
        }
    }

    /* ---------- キーボードショートカット ---------- */
    function bindKeyboard() {
        const modeKeys = { '1': 'hybrid', '2': 'analog', '3': 'digital', '4': 'binary', '5': 'word' };
        document.addEventListener('keydown', e => {
            if (e.target.matches('input, select, textarea')) return;
            const k = e.key.toLowerCase();
            if (modeKeys[e.key]) { applyMode(modeKeys[e.key]); return; }
            switch (k) {
                case 'f': toggleFullscreen(); break;
                case 's': AC.Panels.toggle('settings-panel'); break;
                case 't': cycleTheme(); break;
                case 'h': toggleHud(); break;
                case 'g': toggleGlitch(); break;
            }
        });
    }

    function cycleTheme() {
        const list = AC.Themes.list;
        const cur = State.get('theme');
        const idx = list.findIndex(t => t.id === cur);
        const next = list[(idx + 1) % list.length].id;
        AC.Settings.applyTheme(next);
    }

    function toggleHud() {
        const hidden = !State.get('hudHidden');
        State.set('hudHidden', hidden);
        document.body.classList.toggle('hud-hidden', hidden);
        DOM.toast(hidden ? 'HUD非表示 (Hで戻す)' : 'HUD表示', 'fa-eye');
    }

    function toggleGlitch() {
        const next = !State.get('glitch');
        State.set('glitch', next);
        document.body.classList.toggle('glitch-on', next);
        const chk = DOM.byId('opt-glitch'); if (chk) chk.checked = next;
        DOM.toast(next ? 'グリッチ ON' : 'グリッチ OFF', 'fa-wave-square');
    }

    /* HUD非表示状態を起動時に反映 */
    function applyHudState() {
        document.body.classList.toggle('hud-hidden', State.get('hudHidden'));
    }

    /* ---------- モバイル警告 ---------- */
    function injectMobileWarning() {
        const warn = DOM.el('div', { class: 'mobile-warning' }, [
            DOM.el('i', { class: 'fa-solid fa-desktop' }),
            DOM.el('h2', { text: 'PC専用サイトです' }),
            DOM.el('p', { text: 'AETHER CLOCK は大画面のPCブラウザでの表示に最適化されています。デスクトップ環境でアクセスしてください。' })
        ]);
        document.body.appendChild(warn);
    }

    /* ---------- 起動 ---------- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { boot(); applyHudState(); });
    } else {
        boot();
        applyHudState();
    }
})();
