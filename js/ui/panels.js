/* ============================================================
   AETHER CLOCK — ui/panels.js
   オーバーレイパネルの開閉管理
   ============================================================ */
window.AC = window.AC || {};

AC.Panels = (function () {
    let scrim;
    let openPanel = null;

    function init() {
        scrim = AC.DOM.byId('overlay-scrim');

        // 設定パネル
        AC.DOM.on('#btn-settings', 'click', () => toggle('settings-panel'));
        AC.DOM.on('#btn-close-settings', 'click', closeAll);

        // ツールパネル
        AC.DOM.on('#btn-stopwatch', 'click', () => toggle('stopwatch-panel'));
        AC.DOM.on('#btn-timer', 'click', () => toggle('timer-panel'));
        AC.DOM.on('#btn-worldclock', 'click', () => toggle('worldclock-panel'));

        // 閉じるボタン
        AC.DOM.$$('[data-close-tool]').forEach(btn => {
            btn.addEventListener('click', closeAll);
        });

        // スクリムクリックで閉じる
        scrim.addEventListener('click', closeAll);

        // ESCで閉じる
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeAll();
        });
    }

    function open(id) {
        closeAll(true);
        const panel = AC.DOM.byId(id);
        if (!panel) return;
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        scrim.classList.add('is-open');
        openPanel = id;
        AC.Bus.emit('panel-opened', id);
    }

    function closeAll(silent) {
        AC.DOM.$$('.settings-panel, .tool-panel').forEach(p => {
            p.classList.remove('is-open');
            p.setAttribute('aria-hidden', 'true');
        });
        scrim.classList.remove('is-open');
        if (openPanel && !silent) AC.Bus.emit('panel-closed', openPanel);
        openPanel = null;
    }

    function toggle(id) {
        if (openPanel === id) closeAll();
        else open(id);
    }

    return { init, open, closeAll, toggle, isOpen: () => openPanel };
})();
