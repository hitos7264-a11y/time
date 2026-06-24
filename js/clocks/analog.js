/* ============================================================
   AETHER CLOCK — clocks/analog.js
   高精細なCanvasアナログ時計
   ============================================================ */
window.AC = window.AC || {};

AC.AnalogClock = (function () {
    let canvas, ctx, dpr = 1;
    let size = 640, cx = 320, cy = 320, R = 300;
    let colors = {};
    let smoothSecond = 0; // スムーズスイープ用の補間秒

    function init() {
        canvas = AC.DOM.byId('analog-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        colors = AC.Themes.resolve();
        window.addEventListener('resize', resize);
        AC.Bus.on('theme-changed', () => { colors = AC.Themes.resolve(); });
        AC.Loop.add(render, 'analog');
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const rect = canvas.getBoundingClientRect();
        const cssSize = rect.width || 480;
        canvas.width = cssSize * dpr;
        canvas.height = cssSize * dpr;
        size = canvas.width;
        cx = cy = size / 2;
        R = size * 0.46;
    }

    function render(now) {
        if (!ctx) return;
        // ハイブリッド or analog の時のみ描画 (非表示なら省略してCPU節約)
        const mode = AC.State.get('mode');
        if (mode !== 'analog' && mode !== 'hybrid') return;

        const tz = AC.State.get('timezone');
        const p = AC.Time.getParts(tz);
        const sweep = AC.State.get('sweep');

        // 秒の値 (スイープ or ティック)
        const secFloat = p.seconds + p.ms / 1000;
        if (sweep) {
            smoothSecond = secFloat;
        } else {
            smoothSecond = p.seconds;
        }

        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.translate(cx, cy);

        drawFaceGlow();
        drawOuterRing();
        drawTicks();
        drawNumerals();
        drawTickMarksGlow(secFloat);

        // 角度計算
        const secAngle = (smoothSecond / 60) * AC.Math.TAU;
        const minAngle = ((p.minutes + smoothSecond / 60) / 60) * AC.Math.TAU;
        const hourAngle = (((p.hours % 12) + p.minutes / 60) / 12) * AC.Math.TAU;

        drawHand(hourAngle, R * 0.5, 7, colors.handHour, 'hour');
        drawHand(minAngle, R * 0.74, 5, colors.handMinute, 'minute');
        drawSecondHand(secAngle);
        drawCenterCap();
        drawDigitalSubdial(p);

        ctx.restore();
    }

    /* 中心の発光 */
    function drawFaceGlow() {
        const glow = AC.State.get('glow') / 100;
        const grad = ctx.createRadialGradient(0, 0, R * 0.1, 0, 0, R * 1.05);
        grad.addColorStop(0, hexA(colors.accent, 0.12 * glow));
        grad.addColorStop(0.7, hexA(colors.accent, 0.04 * glow));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, R * 1.05, 0, AC.Math.TAU);
        ctx.fill();
    }

    /* 外周二重リング */
    function drawOuterRing() {
        // 外側リング
        ctx.lineWidth = size * 0.006;
        ctx.strokeStyle = colors.borderStrong;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, AC.Math.TAU);
        ctx.stroke();

        // 内側細リング
        ctx.lineWidth = size * 0.002;
        ctx.strokeStyle = hexA(colors.accent, 0.4);
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.92, 0, AC.Math.TAU);
        ctx.stroke();

        // 微細な装飾円
        ctx.strokeStyle = hexA(colors.accent, 0.12);
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.62, 0, AC.Math.TAU);
        ctx.stroke();
    }

    /* 目盛り (60分割) */
    function drawTicks() {
        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * AC.Math.TAU - Math.PI / 2;
            const isHour = i % 5 === 0;
            const outer = R * 0.92;
            const inner = isHour ? R * 0.84 : R * 0.88;
            const x1 = Math.cos(angle) * outer;
            const y1 = Math.sin(angle) * outer;
            const x2 = Math.cos(angle) * inner;
            const y2 = Math.sin(angle) * inner;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = isHour ? size * 0.006 : size * 0.0022;
            ctx.strokeStyle = isHour ? colors.text : colors.textFaint;
            if (isHour) {
                ctx.shadowColor = colors.glow;
                ctx.shadowBlur = 8;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    /* 時刻に応じて光る分目盛り */
    function drawTickMarksGlow(secFloat) {
        const idx = Math.floor(secFloat) % 60;
        const angle = (idx / 60) * AC.Math.TAU - Math.PI / 2;
        const r = R * 0.88;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.008, 0, AC.Math.TAU);
        ctx.fillStyle = colors.handSecond;
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    /* 数字 (ローマ数字風アラビア) */
    function drawNumerals() {
        ctx.fillStyle = colors.text;
        ctx.font = `600 ${size * 0.07}px 'Orbitron', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let h = 1; h <= 12; h++) {
            const angle = (h / 12) * AC.Math.TAU - Math.PI / 2;
            const r = R * 0.72;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            ctx.fillText(String(h), x, y);
        }
    }

    /* 一般の針 */
    function drawHand(angle, length, width, color, type) {
        ctx.save();
        ctx.rotate(angle);
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;

        const tail = length * 0.18;
        const grad = ctx.createLinearGradient(0, tail, 0, -length);
        grad.addColorStop(0, hexA(color, 0.6));
        grad.addColorStop(1, color);

        ctx.beginPath();
        ctx.moveTo(-width / 2, tail);
        ctx.lineTo(-width / 4, -length);
        ctx.lineTo(width / 4, -length);
        ctx.lineTo(width / 2, tail);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }

    /* 秒針 (赤い細い針 + 後端カウンターウェイト) */
    function drawSecondHand(angle) {
        ctx.save();
        ctx.rotate(angle);
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 14;

        const len = R * 0.82;
        const tail = R * 0.22;
        ctx.strokeStyle = colors.handSecond;
        ctx.lineWidth = size * 0.0035;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, tail);
        ctx.lineTo(0, -len);
        ctx.stroke();

        // 先端の球
        ctx.beginPath();
        ctx.arc(0, -len * 0.78, size * 0.008, 0, AC.Math.TAU);
        ctx.fillStyle = colors.handSecond;
        ctx.fill();

        // カウンターウェイト
        ctx.beginPath();
        ctx.arc(0, tail, size * 0.014, 0, AC.Math.TAU);
        ctx.fillStyle = colors.handSecond;
        ctx.fill();
        ctx.restore();
    }

    /* 中心キャップ */
    function drawCenterCap() {
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.022, 0, AC.Math.TAU);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.022);
        grad.addColorStop(0, colors.text);
        grad.addColorStop(1, colors.handSecond);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.008, 0, AC.Math.TAU);
        ctx.fillStyle = colors.bg || '#0a0e1a';
        ctx.fillStyle = '#0a0e1a';
        ctx.fill();
    }

    /* 小さなデジタルサブダイヤル (日付) */
    function drawDigitalSubdial(p) {
        const y = R * 0.42;
        ctx.font = `500 ${size * 0.032}px 'Orbitron', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = colors.textDim;
        const dateStr = `${AC.Time.pad(p.month)}/${AC.Time.pad(p.day)} ${AC.Time.WEEKDAYS_EN[p.weekday]}`;
        ctx.fillText(dateStr, 0, y);
    }

    /* HEX/任意色 + アルファ */
    function hexA(color, alpha) {
        if (color.startsWith('#')) {
            let c = color.slice(1);
            if (c.length === 3) c = c.split('').map(x => x + x).join('');
            const r = parseInt(c.slice(0, 2), 16);
            const g = parseInt(c.slice(2, 4), 16);
            const b = parseInt(c.slice(4, 6), 16);
            return `rgba(${r},${g},${b},${alpha})`;
        }
        // rgb/rgba文字列はそのまま透明度を付与できないため近似
        return color.replace(/rgba?\(([^)]+)\)/, (m, vals) => {
            const parts = vals.split(',').slice(0, 3).map(s => s.trim());
            return `rgba(${parts.join(',')},${alpha})`;
        });
    }

    return { init, resize };
})();
