/* ============================================================
   AETHER CLOCK — core/state.js
   グローバルアプリケーション状態管理
   ============================================================ */
window.AC = window.AC || {};

AC.State = (function () {
    const DEFAULTS = {
        mode: 'hybrid',          // hybrid | analog | digital | binary | word
        theme: 'aurora',
        sweep: true,             // 秒針スムーズスイープ
        showMs: true,            // ミリ秒表示
        is24h: true,             // 24時間表記
        particles: true,         // パーティクル背景
        aurora: true,            // オーロラ背景
        glitch: false,           // グリッチエフェクト
        tickSound: false,        // ティックサウンド
        timezone: 'local',       // タイムゾーン
        density: 120,            // 粒子密度
        glow: 100,               // 発光強度
        soundEnabled: false,     // サウンド全体
        hudHidden: false
    };

    let state = {};
    const listeners = [];

    function load() {
        const saved = AC.Storage.get('state', {});
        state = Object.assign({}, DEFAULTS, saved);
    }

    function persist() {
        AC.Storage.set('state', state);
    }

    function get(key) {
        return key ? state[key] : Object.assign({}, state);
    }

    function set(key, value, opts = {}) {
        if (typeof key === 'object') {
            Object.assign(state, key);
        } else {
            if (state[key] === value && !opts.force) return;
            state[key] = value;
        }
        if (opts.persist !== false) persist();
        notify(key, value);
    }

    function subscribe(fn) {
        listeners.push(fn);
        return () => {
            const i = listeners.indexOf(fn);
            if (i >= 0) listeners.splice(i, 1);
        };
    }

    function notify(key, value) {
        listeners.forEach(fn => {
            try { fn(key, value, state); } catch (e) { console.error(e); }
        });
    }

    function reset() {
        state = Object.assign({}, DEFAULTS);
        persist();
        notify('*', null);
    }

    return { DEFAULTS, load, get, set, subscribe, reset };
})();
