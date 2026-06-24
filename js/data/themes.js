/* ============================================================
   AETHER CLOCK — data/themes.js
   テーマ定義 (CSSクラス名 + プレビュー色 + Canvas用色)
   ============================================================ */
window.AC = window.AC || {};

AC.Themes = {
    list: [
        { id: 'aurora',    name: 'Aurora',    c1: '#45d4ff', c2: '#7c5cff', bg: '#0a0e1a' },
        { id: 'sunset',    name: 'Sunset',    c1: '#ff8a3c', c2: '#ff4d6d', bg: '#1c0e0a' },
        { id: 'emerald',   name: 'Emerald',   c1: '#2bffb0', c2: '#00d4a0', bg: '#061811' },
        { id: 'crimson',   name: 'Crimson',   c1: '#ff3860', c2: '#ff7849', bg: '#16060a' },
        { id: 'midnight',  name: 'Midnight',  c1: '#5b8cff', c2: '#3b5bdb', bg: '#040814' },
        { id: 'gold',      name: 'Gold',      c1: '#ffd24a', c2: '#d4a017', bg: '#131008' },
        { id: 'mono',      name: 'Mono',      c1: '#ffffff', c2: '#b8b8b8', bg: '#0d0d0d' },
        { id: 'cyberpunk', name: 'Cyber',     c1: '#ff2bd6', c2: '#00f0ff', bg: '#100620' },
        { id: 'ice',       name: 'Ice',       c1: '#9fe8ff', c2: '#5cc8ff', bg: '#0a141f' }
    ],

    get(id) { return this.list.find(t => t.id === id) || this.list[0]; },

    /** 現在のCSS変数から実際の計算色を取得 (Canvas描画用) */
    resolve() {
        const cs = getComputedStyle(document.body);
        const read = name => cs.getPropertyValue(name).trim();
        return {
            accent: read('--accent') || '#45d4ff',
            accent2: read('--accent-2') || '#7c5cff',
            accent3: read('--accent-3') || '#ff5ca8',
            text: read('--text') || '#e8f0ff',
            textDim: read('--text-dim') || '#9fb0d0',
            textFaint: read('--text-faint') || '#586480',
            handHour: read('--hand-hour') || '#e8f0ff',
            handMinute: read('--hand-minute') || '#c0d4ff',
            handSecond: read('--hand-second') || '#45d4ff',
            border: read('--border') || 'rgba(120,170,255,0.14)',
            borderStrong: read('--border-strong') || 'rgba(120,170,255,0.32)',
            glow: read('--accent-glow') || 'rgba(69,212,255,0.7)'
        };
    }
};
