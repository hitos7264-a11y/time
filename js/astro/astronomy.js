/* ============================================================
   AETHER CLOCK — astro/astronomy.js
   天文計算 (月相・簡易日の出日の入り)
   ============================================================ */
window.AC = window.AC || {};

AC.Astro = {
    MOON_PHASES: [
        { icon: '🌑', name: 'New' },
        { icon: '🌒', name: 'Waxing Crescent' },
        { icon: '🌓', name: 'First Quarter' },
        { icon: '🌔', name: 'Waxing Gibbous' },
        { icon: '🌕', name: 'Full' },
        { icon: '🌖', name: 'Waning Gibbous' },
        { icon: '🌗', name: 'Last Quarter' },
        { icon: '🌘', name: 'Waning Crescent' }
    ],

    /**
     * 月齢から月相を計算 (簡易・既知の新月基準)
     */
    moonPhase(date = new Date()) {
        // 2000-01-06 18:14 UTC が新月
        const knownNew = Date.UTC(2000, 0, 6, 18, 14, 0);
        const synodic = 29.53058867; // 朔望月 (日)
        const days = (date.getTime() - knownNew) / 86400000;
        let phase = (days % synodic) / synodic;
        if (phase < 0) phase += 1;
        const age = phase * synodic;
        const index = Math.round(phase * 8) % 8;
        return {
            ...this.MOON_PHASES[index],
            age: age.toFixed(1),
            illumination: Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100)
        };
    },

    /**
     * 簡易な日の出・日の入り (緯度を東京固定とした近似)
     * 厳密ではないが表示目的には十分
     */
    sunTimes(date = new Date(), lat = 35.68, lng = 139.69) {
        const rad = Math.PI / 180;
        const dayOfYear = AC.Time.dayOfYear(date);
        // 太陽赤緯
        const decl = -23.45 * Math.cos(rad * (360 / 365) * (dayOfYear + 10));
        const latRad = lat * rad;
        const declRad = decl * rad;
        let cosH = -Math.tan(latRad) * Math.tan(declRad);
        cosH = AC.Math.clamp(cosH, -1, 1);
        const H = Math.acos(cosH) / rad; // 度
        const dayLengthHours = (2 * H) / 15;
        // 太陽南中をおおよそ12時(経度補正は簡略)とする
        const solarNoon = 12 - (lng - 135) / 15; // JST基準
        const sunrise = solarNoon - dayLengthHours / 2;
        const sunset = solarNoon + dayLengthHours / 2;
        return {
            sunrise: this._fmt(sunrise),
            sunset: this._fmt(sunset),
            dayLength: dayLengthHours.toFixed(1)
        };
    },

    _fmt(h) {
        const hours = Math.floor(h);
        const minutes = Math.round((h - hours) * 60);
        return `${AC.Time.pad((hours + 24) % 24)}:${AC.Time.pad((minutes + 60) % 60)}`;
    },

    /** 昼夜判定 (時刻ベース) */
    isDaytime(hour) {
        return hour >= 6 && hour < 18;
    }
};
