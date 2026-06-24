/* ============================================================
   AETHER CLOCK — background/particles.js
   接続線付きパーティクルネットワーク背景
   ============================================================ */
window.AC = window.AC || {};

AC.Particles = (function () {
    let canvas, ctx, w, h, dpr = 1;
    let particles = [];
    let colors = {};
    let mouse = { x: -9999, y: -9999 };
    let enabled = true;
    let targetCount = 120;

    function init() {
        canvas = AC.DOM.byId('bg-particles');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        colors = AC.Themes.resolve();
        spawn(AC.State.get('density'));

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

        AC.Bus.on('theme-changed', () => { colors = AC.Themes.resolve(); });
        AC.Bus.on('setting:particles', v => { enabled = v; canvas.style.display = v ? '' : 'none'; });
        AC.Bus.on('setting:density', v => { spawn(v); });

        enabled = AC.State.get('particles');
        canvas.style.display = enabled ? '' : 'none';

        AC.Loop.add(render, 'particles');
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.width = window.innerWidth * dpr;
        h = canvas.height = window.innerHeight * dpr;
    }

    function spawn(count) {
        targetCount = count;
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(makeParticle());
        }
    }

    function makeParticle() {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: AC.Math.rand(-0.25, 0.25) * dpr,
            vy: AC.Math.rand(-0.25, 0.25) * dpr,
            r: AC.Math.rand(0.8, 2.4) * dpr,
            pulse: Math.random() * Math.PI * 2
        };
    }

    function render(now, dt) {
        if (!enabled || !ctx) return;
        ctx.clearRect(0, 0, w, h);

        const connectDist = 130 * dpr;
        const mouseDist = 180 * dpr;
        const mx = mouse.x * dpr;
        const my = mouse.y * dpr;

        // 更新 & 描画
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += 0.02;

            // 画面端でラップ
            if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

            // マウス引力
            const dmx = mx - p.x, dmy = my - p.y;
            const dm = Math.sqrt(dmx * dmx + dmy * dmy);
            if (dm < mouseDist && dm > 1) {
                const force = (1 - dm / mouseDist) * 0.4;
                p.x += (dmx / dm) * force;
                p.y += (dmy / dm) * force;
            }

            // 接続線
            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx = p.x - q.x, dy = p.y - q.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < connectDist) {
                    const alpha = (1 - d / connectDist) * 0.5;
                    ctx.strokeStyle = rgba(colors.accent, alpha);
                    ctx.lineWidth = 0.6 * dpr;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }

            // 粒子
            const pulseR = p.r * (1 + Math.sin(p.pulse) * 0.2);
            ctx.beginPath();
            ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(colors.accent, 0.7);
            ctx.shadowColor = colors.glow;
            ctx.shadowBlur = 6 * dpr;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // マウス周辺のハイライト円
        if (mouse.x > -9000) {
            ctx.beginPath();
            ctx.arc(mx, my, mouseDist, 0, Math.PI * 2);
            ctx.strokeStyle = rgba(colors.accent, 0.06);
            ctx.lineWidth = 1 * dpr;
            ctx.stroke();
        }
    }

    function rgba(color, alpha) {
        if (color.startsWith('#')) {
            let c = color.slice(1);
            if (c.length === 3) c = c.split('').map(x => x + x).join('');
            const r = parseInt(c.slice(0, 2), 16);
            const g = parseInt(c.slice(2, 4), 16);
            const b = parseInt(c.slice(4, 6), 16);
            return `rgba(${r},${g},${b},${alpha})`;
        }
        return color;
    }

    return { init };
})();
