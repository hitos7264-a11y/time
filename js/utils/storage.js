/* ============================================================
   AETHER CLOCK — utils/storage.js
   localStorageラッパー (設定の永続化)
   ============================================================ */
window.AC = window.AC || {};

AC.Storage = {
    PREFIX: 'aether_clock_',

    get(key, fallback = null) {
        try {
            const raw = localStorage.getItem(this.PREFIX + key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },

    remove(key) {
        try { localStorage.removeItem(this.PREFIX + key); } catch (e) {}
    },

    clearAll() {
        try {
            Object.keys(localStorage)
                .filter(k => k.startsWith(this.PREFIX))
                .forEach(k => localStorage.removeItem(k));
        } catch (e) {}
    }
};
