/* ============================================================
   AETHER CLOCK — background/aurora.js
   流体的なオーロラ/プラズマ背景 (Canvas 2D, ノイズベース)
   ============================================================ */
window.AC = window.AC || {};

AC.Aurora = (function () {
    let canvas, ctx, w, h, dpr = 1;
    let colors = {};
    let enabled = true;
    let t = 0;
    let blobs = [];

    function init() {
        canvas = AC.DOM.byId('bg-aurora');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        colors = AC.Themes.resolve();
        createBlobs();

        window.addEventListener('resize', resize);
        AC.Bus.on('theme-changed', () => { colors = AC.Themes.resolve(); });
        AC.Bus.on('setting:aurora', v => { enabled = v; canvas.style.display = v ? '' : 'none'; });

        enabled = AC.State.get('aurora');
        canvas.style.display = enabled ? '' : 'none';

        AC.Loop.add(render, 'aurora');
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        w = canvas.width = window.innerWidth * dpr;
        h = canvas.height = window.innerHeight * dpr;
    }

    function createBlobs() {
        blobs = [];
        const count = 5;
        for (let i = 0; i < count; i++) {
            blobs.push({
                baseX: Math.random(),
                baseY: Math.random(),
                ampX: AC.Math.rand(0.1, 0.3),
                ampY: AC.Math.rand(0.1, 0.25),
                speedX: AC.Math.rand(0.1, 0.4),
                speedY: AC.Math.rand(0.1, 0.35),
                phaseX: Math.random() * Math.PI * 2,
                phaseY: Math.random() * Math.PI * 2,
                radius: AC.Math.rand(0.3, 0.6),
                colorIndex: i % 3
            });
        }
    }

    function render(now, dt) {
        if (!enabled || !ctx) return;
        t += dt * 0.0002;
        ctx.clearRect(0, 0, w, h);

        const glow = AC.State.get('glow') / 100;
        const palette = [colors.accent, colors.accent2, colors.accent3];

        ctx.globalCompositeOperation = 'lighter';
        blobs.forEach(b => {
            const x = (b.baseX + Math.sin(t * b.speedX + b.phaseX) * b.ampX) * w;
            const y = (b.baseY + Math.cos(t * b.speedY + b.phaseY) * b.ampY) * h;
            const r = b.radius * Math.min(w, h);
            const color = palette[b.colorIndex];

            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, rgba(color, 0.22 * glow));
            grad.addColorStop(0.5, rgba(color, 0.08 * glow));
            grad.addColorStop(1, rgba(color, 0));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';
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
