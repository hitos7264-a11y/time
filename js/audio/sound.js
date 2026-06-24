/* ============================================================
   AETHER CLOCK — audio/sound.js
   Web Audio APIによる効果音生成 (ティック音・アラーム)
   ============================================================ */
window.AC = window.AC || {};

AC.Sound = (function () {
    let audioCtx = null;
    let enabled = false;
    let lastTickSecond = -1;

    function init() {
        AC.Bus.on('setting:soundEnabled', v => { enabled = v; });
        // ティック音
        AC.Bus.on('tick-second', p => {
            if (AC.State.get('tickSound') && AC.State.get('soundEnabled')) {
                tick();
            }
        });

        AC.DOM.on('#btn-sound', 'click', toggle);
        updateButton();
    }

    function ensureCtx() {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return null;
            }
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function toggle() {
        const next = !AC.State.get('soundEnabled');
        AC.State.set('soundEnabled', next);
        enabled = next;
        if (next) { ensureCtx(); blip(880, 0.08); }
        updateButton();
        AC.DOM.toast(next ? 'サウンド ON' : 'サウンド OFF', next ? 'fa-volume-high' : 'fa-volume-xmark');
    }

    function updateButton() {
        const btn = AC.DOM.byId('btn-sound');
        if (!btn) return;
        const on = AC.State.get('soundEnabled');
        btn.classList.toggle('is-active', on);
        btn.querySelector('i').className = on ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    }

    /* 単音 */
    function blip(freq, duration = 0.05, type = 'sine', gain = 0.15) {
        const ctx = ensureCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.value = gain;
        osc.connect(g);
        g.connect(ctx.destination);
        const t = ctx.currentTime;
        g.gain.setValueAtTime(gain, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        osc.start(t);
        osc.stop(t + duration);
    }

    function tick() {
        blip(1200, 0.03, 'square', 0.04);
    }

    function alarm() {
        const ctx = ensureCtx();
        if (!ctx) return;
        // 3回のビープ
        for (let i = 0; i < 6; i++) {
            setTimeout(() => blip(i % 2 === 0 ? 880 : 660, 0.18, 'triangle', 0.2), i * 220);
        }
    }

    return { init, blip, tick, alarm, toggle };
})();
