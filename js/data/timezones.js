/* ============================================================
   AETHER CLOCK — data/timezones.js
   タイムゾーン・世界都市データ
   ============================================================ */
window.AC = window.AC || {};

AC.Timezones = {
    /** 設定パネルのタイムゾーンセレクト用 */
    list: [
        { id: 'local',                value: 'ローカルタイム (端末設定)' },
        { id: 'Asia/Tokyo',           value: '東京 (JST, UTC+9)' },
        { id: 'Asia/Seoul',           value: 'ソウル (KST, UTC+9)' },
        { id: 'Asia/Shanghai',        value: '上海 (CST, UTC+8)' },
        { id: 'Asia/Hong_Kong',       value: '香港 (HKT, UTC+8)' },
        { id: 'Asia/Singapore',       value: 'シンガポール (UTC+8)' },
        { id: 'Asia/Kolkata',         value: 'ムンバイ (IST, UTC+5:30)' },
        { id: 'Asia/Dubai',           value: 'ドバイ (GST, UTC+4)' },
        { id: 'Europe/Moscow',        value: 'モスクワ (MSK, UTC+3)' },
        { id: 'Europe/Paris',         value: 'パリ (CET, UTC+1)' },
        { id: 'Europe/Berlin',        value: 'ベルリン (CET, UTC+1)' },
        { id: 'Europe/London',        value: 'ロンドン (GMT, UTC+0)' },
        { id: 'America/Sao_Paulo',    value: 'サンパウロ (BRT, UTC-3)' },
        { id: 'America/New_York',     value: 'ニューヨーク (EST, UTC-5)' },
        { id: 'America/Chicago',      value: 'シカゴ (CST, UTC-6)' },
        { id: 'America/Denver',       value: 'デンバー (MST, UTC-7)' },
        { id: 'America/Los_Angeles',  value: 'ロサンゼルス (PST, UTC-8)' },
        { id: 'Pacific/Honolulu',     value: 'ホノルル (HST, UTC-10)' },
        { id: 'Pacific/Auckland',     value: 'オークランド (NZST, UTC+12)' },
        { id: 'Australia/Sydney',     value: 'シドニー (AEST, UTC+10)' },
        { id: 'UTC',                  value: '協定世界時 (UTC)' }
    ],

    /** 世界時計パネル用 */
    worldCities: [
        { tz: 'Asia/Tokyo',          city: '東京',         flag: '🇯🇵' },
        { tz: 'Asia/Shanghai',       city: '上海',         flag: '🇨🇳' },
        { tz: 'Asia/Singapore',      city: 'シンガポール', flag: '🇸🇬' },
        { tz: 'Asia/Dubai',          city: 'ドバイ',       flag: '🇦🇪' },
        { tz: 'Europe/London',       city: 'ロンドン',     flag: '🇬🇧' },
        { tz: 'Europe/Paris',        city: 'パリ',         flag: '🇫🇷' },
        { tz: 'America/New_York',    city: 'ニューヨーク', flag: '🇺🇸' },
        { tz: 'America/Los_Angeles', city: 'ロサンゼルス', flag: '🇺🇸' }
    ],

    /** タイムゾーン名から短い略称を返す */
    abbr(tz) {
        const found = this.list.find(t => t.id === tz);
        if (!found) return tz;
        const m = found.value.match(/\(([^,)]+)/);
        return m ? m[1] : tz;
    },

    /** UTCオフセット文字列を計算 */
    offsetStr(tz) {
        try {
            const now = new Date();
            const fmt = new Intl.DateTimeFormat('en-US', {
                timeZone: tz === 'local' ? undefined : tz,
                timeZoneName: 'longOffset'
            });
            const part = fmt.formatToParts(now).find(p => p.type === 'timeZoneName');
            return part ? part.value.replace('GMT', 'UTC') : 'UTC';
        } catch (e) {
            return 'UTC';
        }
    }
};
