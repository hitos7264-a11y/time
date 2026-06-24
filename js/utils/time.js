/* ============================================================
   AETHER CLOCK — utils/time.js
   時刻関連ユーティリティ
   ============================================================ */
window.AC = window.AC || {};

AC.Time = {
    WEEKDAYS_JP: ['日', '月', '火', '水', '木', '金', '土'],
    WEEKDAYS_EN: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    MONTHS_EN: ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],

    /** ゼロパディング */
    pad(n, len = 2) { return String(n).padStart(len, '0'); },

    /**
     * 指定タイムゾーンの現在時刻パーツを取得
     * tz が null の場合はローカル時刻
     */
    getParts(tz) {
        const now = new Date();
        let d = now;
        if (tz && tz !== 'local') {
            try {
                // Intlを使ってタイムゾーン変換
                const fmt = new Intl.DateTimeFormat('en-US', {
                    timeZone: tz, hour12: false,
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    weekday: 'short'
                });
                const parts = {};
                fmt.formatToParts(now).forEach(p => parts[p.type] = p.value);
                let hour = parseInt(parts.hour, 10);
                if (hour === 24) hour = 0;
                return {
                    year: parseInt(parts.year, 10),
                    month: parseInt(parts.month, 10),
                    day: parseInt(parts.day, 10),
                    hours: hour,
                    minutes: parseInt(parts.minute, 10),
                    seconds: parseInt(parts.second, 10),
                    ms: now.getMilliseconds(),
                    weekday: this.WEEKDAYS_EN.indexOf(parts.weekday.toUpperCase()),
                    raw: now
                };
            } catch (e) {
                d = now;
            }
        }
        return {
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate(),
            hours: d.getHours(),
            minutes: d.getMinutes(),
            seconds: d.getSeconds(),
            ms: d.getMilliseconds(),
            weekday: d.getDay(),
            raw: d
        };
    },

    /** 12時間表記に変換 */
    to12(h) {
        const ampm = h >= 12 ? 'PM' : 'AM';
        let hour = h % 12;
        if (hour === 0) hour = 12;
        return { hour, ampm };
    },

    /** ISO週番号 */
    weekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    /** 年間通日 */
    dayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        return Math.floor(diff / 86400000);
    },

    /** 一日の経過割合 (0〜1) */
    dayProgress(p) {
        return (p.hours * 3600 + p.minutes * 60 + p.seconds) / 86400;
    },

    /** ミリ秒を hh:mm:ss.mmm 形式に */
    formatDuration(ms, showMs = true) {
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const milli = Math.floor(ms % 1000);
        const base = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
        return showMs ? `${base}.${this.pad(milli, 3)}` : base;
    },

    /** 季節判定 (北半球) */
    getSeason(month, day) {
        const m = month;
        if ((m === 3 && day >= 20) || m === 4 || m === 5 || (m === 6 && day < 21)) return { name: '春 / SPRING', icon: '🌸' };
        if ((m === 6 && day >= 21) || m === 7 || m === 8 || (m === 9 && day < 23)) return { name: '夏 / SUMMER', icon: '☀️' };
        if ((m === 9 && day >= 23) || m === 10 || m === 11 || (m === 12 && day < 22)) return { name: '秋 / AUTUMN', icon: '🍂' };
        return { name: '冬 / WINTER', icon: '❄️' };
    }
};
