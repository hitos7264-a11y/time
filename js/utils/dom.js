/* ============================================================
   AETHER CLOCK — utils/dom.js
   DOM操作ヘルパー
   ============================================================ */
window.AC = window.AC || {};

AC.DOM = {
    $(sel, ctx = document) { return ctx.querySelector(sel); },
    $$(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); },
    byId(id) { return document.getElementById(id); },

    /** 要素を作成 */
    el(tag, attrs = {}, children = []) {
        const node = document.createElement(tag);
        for (const [k, v] of Object.entries(attrs)) {
            if (k === 'class') node.className = v;
            else if (k === 'html') node.innerHTML = v;
            else if (k === 'text') node.textContent = v;
            else if (k.startsWith('on') && typeof v === 'function') {
                node.addEventListener(k.slice(2).toLowerCase(), v);
            } else if (k === 'dataset') {
                Object.assign(node.dataset, v);
            } else {
                node.setAttribute(k, v);
            }
        }
        (Array.isArray(children) ? children : [children]).forEach(c => {
            if (c == null) return;
            node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
        });
        return node;
    },

    on(target, event, handler, opts) {
        const node = typeof target === 'string' ? this.$(target) : target;
        if (node) node.addEventListener(event, handler, opts);
        return node;
    },

    addClass(node, ...cls) { if (node) node.classList.add(...cls); },
    removeClass(node, ...cls) { if (node) node.classList.remove(...cls); },
    toggleClass(node, cls, force) { if (node) node.classList.toggle(cls, force); },

    /** トースト通知 */
    toast(message, icon = 'fa-circle-info', duration = 2200) {
        let t = this.byId('ac-toast');
        if (!t) {
            t = this.el('div', { id: 'ac-toast', class: 'toast' });
            document.body.appendChild(t);
        }
        t.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
        t.classList.add('is-show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => t.classList.remove('is-show'), duration);
    }
};
