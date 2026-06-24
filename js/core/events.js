/* ============================================================
   AETHER CLOCK — core/events.js
   軽量イベントバス + 共有のrequestAnimationFrameループ
   ============================================================ */
window.AC = window.AC || {};

/* イベントバス */
AC.Bus = (function () {
    const map = {};
    return {
        on(name, fn) {
            (map[name] = map[name] || []).push(fn);
            return () => this.off(name, fn);
        },
        off(name, fn) {
            if (!map[name]) return;
            map[name] = map[name].filter(f => f !== fn);
        },
        emit(name, payload) {
            (map[name] || []).forEach(fn => {
                try { fn(payload); } catch (e) { console.error('[Bus]', name, e); }
            });
        }
    };
})();

/* 共有アニメーションループ (全描画系がこれに登録) */
AC.Loop = (function () {
    const tasks = [];
    let running = false;
    let lastTime = performance.now();
    let frames = 0;
    let fpsAccum = 0;
    let fps = 0;

    function frame(now) {
        if (!running) return;
        const dt = now - lastTime;
        lastTime = now;

        // FPS計測
        frames++;
        fpsAccum += dt;
        if (fpsAccum >= 500) {
            fps = Math.round((frames * 1000) / fpsAccum);
            frames = 0;
            fpsAccum = 0;
            AC.Bus.emit('fps', fps);
        }

        for (let i = 0; i < tasks.length; i++) {
            try { tasks[i].fn(now, dt); } catch (e) { console.error('[Loop]', e); }
        }
        requestAnimationFrame(frame);
    }

    return {
        add(fn, name = 'task') {
            tasks.push({ fn, name });
            return fn;
        },
        remove(fn) {
            const i = tasks.findIndex(t => t.fn === fn);
            if (i >= 0) tasks.splice(i, 1);
        },
        start() {
            if (running) return;
            running = true;
            lastTime = performance.now();
            requestAnimationFrame(frame);
        },
        stop() { running = false; },
        getFps() { return fps; }
    };
})();
