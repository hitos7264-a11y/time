/* ============================================================
   AETHER CLOCK — utils/math.js
   数学ユーティリティ
   ============================================================ */
window.AC = window.AC || {};

AC.Math = {
    TAU: Math.PI * 2,
    PI: Math.PI,

    /** 度をラジアンに変換 */
    deg2rad(deg) { return deg * Math.PI / 180; },

    /** ラジアンを度に変換 */
    rad2deg(rad) { return rad * 180 / Math.PI; },

    /** 値を範囲内にクランプ */
    clamp(v, min, max) { return Math.min(Math.max(v, min), max); },

    /** 線形補間 */
    lerp(a, b, t) { return a + (b - a) * t; },

    /** 逆線形補間 (0〜1) */
    invLerp(a, b, v) { return (v - a) / (b - a); },

    /** 範囲の再マッピング */
    map(v, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * ((v - inMin) / (inMax - inMin));
    },

    /** 乱数 (min〜max) */
    rand(min, max) { return min + Math.random() * (max - min); },

    /** 整数乱数 */
    randInt(min, max) { return Math.floor(this.rand(min, max + 1)); },

    /** 配列からランダム選択 */
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

    /** イーズ関数群 */
    ease: {
        outCubic: t => 1 - Math.pow(1 - t, 3),
        inOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        outElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1
                : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        outBack: t => {
            const c1 = 1.70158, c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        }
    },

    /** 角度の最短差分 */
    shortestAngle(a, b) {
        let diff = (b - a) % this.TAU;
        if (diff > Math.PI) diff -= this.TAU;
        if (diff < -Math.PI) diff += this.TAU;
        return diff;
    },

    /** 距離 */
    dist(x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /** HSL → RGBオブジェクト */
    hsl2rgb(h, s, l) {
        s /= 100; l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        };
    }
};
