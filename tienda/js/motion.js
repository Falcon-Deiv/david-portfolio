/* =========================================================
   Vibra · movimiento extra
   - Entrada con el logo (una vez por sesión) que se abre en columnas
   - Scroll suave con la rueda del ratón
   - Mecha de progreso arriba del todo
   - Cursor con luz de vela, botones magnéticos y tarjetas en 3D
   - Títulos que suben palabra a palabra
   - «Así nace una vela»: historia que avanza con el scroll
   - «Gira y elige la tuya»: carrusel en anillo 3D
   - Manifiesto que se enciende palabra a palabra
   - Cinta gigante que acelera con el scroll
   - Llamas que se inclinan cuando mueves el ratón
   - Modo vela: se apaga la luz, se encienden todas las velas

   Rendimiento: solo se anima lo que está en pantalla. Las secciones
   fuera de la vista llevan la clase .is-off (animaciones en pausa) y
   los bucles se paran cuando no hay nada que mover.
   ========================================================= */
(function () {
  'use strict';

  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.from((r || document).querySelectorAll(s)); };
  const root = document.documentElement;
  const mq = function (q) { return window.matchMedia ? window.matchMedia(q).matches : false; };
  const reduce = mq('(prefers-reduced-motion: reduce)');
  const fine = mq('(hover: hover) and (pointer: fine)');
  const hasIO = 'IntersectionObserver' in window;
  let inFrame = false;
  try { inFrame = window.top !== window; } catch (e) { inFrame = true; }

  const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  const lerp = function (a, b, t) { return a + (b - a) * t; };
  const seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  const easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  const easeIn = function (t) { return t * t * t; };
  const easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const bell = function (t) { return Math.sin(clamp(t, 0, 1) * Math.PI); };
  // Suavizado que no depende de los fps: k es la fracción por frame a 60 fps
  const damp = function (k, dt) { return 1 - Math.pow(1 - k, dt / 16.667); };
  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(lerp(pa >> 16, pb >> 16, t)), g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t)), bl = Math.round(lerp(pa & 255, pb & 255, t));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }

  /* Un solo bucle para todo lo que depende del scroll */
  const onScroll = [];
  let ticking = false;
  function tick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll.forEach(function (fn) { fn(); }); });
  }
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
  window.addEventListener('hashchange', function () { setTimeout(tick, 60); });

  /* ---------- Qué secciones están en pantalla ---------- */
  // Las que no se ven llevan .is-off (CSS pausa sus animaciones) y los efectos
  // de JS preguntan aquí antes de medir nada.
  const live = new Set();
  const liveListeners = [];
  function isLive(el) { return !hasIO || live.has(el); }
  function watchSections() {
    if (!hasIO) return;
    const io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        const on = e.isIntersecting;
        e.target.classList.toggle('is-off', !on);
        if (on) live.add(e.target); else live.delete(e.target);
      });
      liveListeners.forEach(function (fn) { fn(); });
      tick();
    }, { rootMargin: '80px 0px' });
    $$('.view > *, .announce, .ftr').forEach(function (el) { io.observe(el); });
  }
  function liveSections() { return Array.from(live); }

  /* ---------- Entrada ---------- */
  function intro() {
    const el = $('#intro');
    if (!el) return;
    if (!root.classList.contains('has-intro')) { el.remove(); return; }
    try { sessionStorage.setItem('vibra-intro', '1'); } catch (e) { /* sin almacenamiento */ }
    let done = false;
    function finish() {
      if (done) return;
      done = true;
      root.classList.add('intro-leaving');
      el.classList.add('is-out');
      setTimeout(function () { root.classList.remove('has-intro', 'intro-leaving'); el.remove(); tick(); }, 1150);
    }
    el.addEventListener('click', finish);
    document.addEventListener('keydown', finish, { once: true });
    setTimeout(finish, 2300);
  }

  /* ---------- Scroll suave con la rueda ---------- */
  // Como las webs de MotionSites: la rueda no salta, se desliza. El teclado,
  // la barra de scroll y los enlaces siguen funcionando como siempre.
  function smoothWheel() {
    if (reduce || !fine || inFrame) return;
    let target = window.scrollY, cur = target, running = false, last = 0;
    function maxY() { return root.scrollHeight - window.innerHeight; }
    function innerScroll(el, dy) {
      for (let n = el; n && n !== document.body && n !== root; n = n.parentElement) {
        if (n.nodeType !== 1 || n.scrollHeight <= n.clientHeight + 1) continue;
        const oy = getComputedStyle(n).overflowY;
        if (oy !== 'auto' && oy !== 'scroll') continue;
        if (dy > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true;
      }
      return false;
    }
    function step(t) {
      const dt = Math.min(64, t - last || 16.667);
      last = t;
      cur = lerp(cur, target, damp(0.11, dt));
      if (Math.abs(target - cur) < 0.4) cur = target;
      window.scrollTo({ top: cur, behavior: 'instant' });
      if (cur !== target) requestAnimationFrame(step);
      else running = false;
    }
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (document.body.classList.contains('is-locked') || root.classList.contains('has-intro')) return;
      if (innerScroll(e.target, e.deltaY)) return;
      e.preventDefault();
      if (!running) { target = cur = window.scrollY; }
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1;
      target = clamp(target + e.deltaY * unit, 0, maxY());
      if (!running) { running = true; last = performance.now(); requestAnimationFrame(step); }
    }, { passive: false });
    // Si otra cosa mueve la página (teclado, enlaces, barra), la seguimos
    window.addEventListener('scroll', function () { if (!running) target = cur = window.scrollY; }, { passive: true });
    window.addEventListener('hashchange', function () { running = false; target = cur = window.scrollY; });
  }

  /* ---------- Mecha de progreso ---------- */
  function wick() {
    const bar = $('#scroll-wick');
    if (!bar) return;
    let lastP = -1;
    onScroll.push(function () {
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      if (Math.abs(p - lastP) < 0.0005) return;
      lastP = p;
      bar.style.transform = 'translate3d(' + ((p - 1) * 100).toFixed(2) + '%,0,0)';
      bar.classList.toggle('is-lit', p > 0.004);
    });
  }

  /* ---------- Títulos palabra a palabra ---------- */
  function splitHeadings() {
    const list = $$('.block-head h2, .secreto-text h2, .crea-promo-text h2, #calidad-title, .wood-text h2, .story-text h2, .guide h2, .ring-head h2');
    if (!list.length) return;
    let n = 0;
    function wrap(node) {
      Array.from(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            const o = document.createElement('span');
            o.className = 'sw';
            const i = document.createElement('span');
            i.className = 'sw-i';
            i.style.setProperty('--wi', n++);
            i.textContent = t;
            o.appendChild(i);
            frag.appendChild(o);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1) {
          wrap(c);
        }
      });
    }
    const io = hasIO ? new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-split-in'); io.unobserve(e.target); } });
    }, { threshold: 0.35 }) : null;
    list.forEach(function (h) {
      n = 0;
      wrap(h);
      h.classList.add('split');
      if (io && !reduce) io.observe(h); else h.classList.add('is-split-in');
    });
  }

  /* ---------- Menú del móvil: los enlaces entran escalonados ---------- */
  function menuStagger() {
    $$('#m-nav > *').forEach(function (el, i) { el.style.setProperty('--mi', i); });
  }

  /* ---------- Cursor con luz de vela ---------- */
  function cursor() {
    if (!fine || reduce || inFrame) return;
    const glow = document.createElement('div');
    glow.className = 'cur-glow';
    const ring = document.createElement('div');
    ring.className = 'cur-ring';
    ring.innerHTML = '<span class="cur-label"></span>';
    const dot = document.createElement('div');
    dot.className = 'cur-dot';
    [glow, ring, dot].forEach(function (el) { el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el); });
    const label = ring.firstChild;
    let x = 0, y = 0, rx = 0, ry = 0, gx = 0, gy = 0, shown = false, mode = '', running = false, last = 0;

    function modeFor(t) {
      if (!t || !t.closest) return ['', ''];
      if (t.closest('input, textarea, select')) return ['text', ''];
      if (t.closest('.quick-add, .fav-btn')) return ['link', ''];
      if (t.closest('.ring-stage')) return ['view', t.closest('.ring-card') ? 'Ver' : 'Gira'];
      if (t.closest('.card-media, .fiesta, .gift-card')) return ['view', 'Ver'];
      if (t.closest('[data-sound]')) return ['view', 'Oír'];
      if (t.closest('a, button, summary, label, [role="tab"]')) return ['link', ''];
      if (t.closest('.carousel')) return ['view', 'Arrastra'];
      return ['', ''];
    }
    function frame(t) {
      const k = damp(0.22, Math.min(64, t - last || 16.667));
      const kg = damp(0.09, Math.min(64, t - last || 16.667));
      last = t;
      rx = lerp(rx, x, k); ry = lerp(ry, y, k);
      gx = lerp(gx, x, kg); gy = lerp(gy, y, kg);
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
      // El bucle se para cuando el cursor ya ha llegado
      if (Math.abs(gx - x) + Math.abs(gy - y) + Math.abs(rx - x) + Math.abs(ry - y) > 0.6) requestAnimationFrame(frame);
      else running = false;
    }
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; rx = gx = x; ry = gy = y; root.classList.add('cursor-on'); }
      const m = modeFor(e.target);
      if (m[0] !== mode || label.textContent !== m[1]) { mode = m[0]; ring.dataset.mode = mode; label.textContent = m[1]; }
      if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    }, { passive: true });
    document.addEventListener('pointerdown', function () { ring.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { ring.classList.remove('is-down'); });
    root.addEventListener('mouseleave', function () { root.classList.remove('cursor-on'); shown = false; });
  }

  /* ---------- Botones magnéticos ---------- */
  function magnetic() {
    if (!fine || reduce) return;
    const SEL = '.btn:not(.btn-block), .round-btn, .sound-btn, .lights-btn';
    let cur = null;
    function release(el) {
      const from = el.style.translate || '0px 0px';
      el.style.translate = '';
      if (el.animate) el.animate([{ translate: from }, { translate: '0px 0px' }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const el = e.target.closest ? e.target.closest(SEL) : null;
      if (cur && cur !== el) release(cur);
      cur = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.translate = (dx * 8).toFixed(1) + 'px ' + (dy * 6).toFixed(1) + 'px';
    }, { passive: true });
  }

  /* ---------- Tarjetas en 3D ---------- */
  function tilt() {
    if (!fine || reduce) return;
    const SEL = '.fiesta, .gift-card';
    let cur = null;
    document.addEventListener('pointermove', function (e) {
      const el = e.target.closest ? e.target.closest(SEL) : null;
      if (cur && cur !== el) { cur.style.transform = ''; cur.classList.remove('is-tilt'); }
      cur = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      el.classList.add('is-tilt');
      el.style.transform = 'perspective(900px) rotateX(' + (-dy * 10).toFixed(2) + 'deg) rotateY(' + (dx * 12).toFixed(2) + 'deg) translateY(-8px)';
      el.style.setProperty('--gx', ((dx + 0.5) * 100).toFixed(0) + '%');
      el.style.setProperty('--gy', ((dy + 0.5) * 100).toFixed(0) + '%');
    }, { passive: true });
  }

  /* ---------- Las llamas se inclinan con el ratón ---------- */
  // Solo se tocan las llamas de las secciones que se ven (antes se recalculaba toda la página).
  function flameLean() {
    if (reduce || !fine) return;
    let flames = [], stale = true, lastX = null, lastT = 0, lean = 0, target = 0, running = false;
    function collect() {
      flames = [];
      liveSections().forEach(function (s) { flames = flames.concat($$('.vela .v-flame', s)); });
      flames = flames.slice(0, 40);
      stale = false;
    }
    liveListeners.push(function () { stale = true; });
    window.addEventListener('hashchange', function () { stale = true; });
    function apply(v) { const r = v ? v.toFixed(2) + 'deg' : ''; flames.forEach(function (f) { f.style.rotate = r; }); }
    function step() {
      lean = lerp(lean, target, 0.12);
      target *= 0.9;
      if (Math.abs(lean) < 0.004 && Math.abs(target) < 0.004) { running = false; apply(0); return; }
      apply(lean * 18);
      requestAnimationFrame(step);
    }
    window.addEventListener('pointermove', function (e) {
      const t = performance.now();
      if (lastX !== null && t - lastT < 120) {
        const v = (e.clientX - lastX) / Math.max(8, t - lastT);
        target = clamp(-v * 0.8, -1, 1);
        if (!running && Math.abs(target) > 0.02) { if (stale) collect(); running = true; requestAnimationFrame(step); }
      }
      lastX = e.clientX; lastT = t;
    }, { passive: true });
  }

  /* ---------- Cinta gigante: acelera y se inclina con el scroll ---------- */
  function marquee() {
    if (reduce) return;
    const box = $('.big-marquee');
    const track = $('.big-marquee-track');
    const sec = box && box.closest('.view > *');
    if (!box || !track || !track.getAnimations) return;
    let lastY = window.scrollY, lastT = performance.now(), dir = 1, boost = 0, skew = 0, running = false;
    function step() {
      boost = lerp(boost, 0, 0.06);
      skew = lerp(skew, 0, 0.1);
      const a = track.getAnimations()[0];
      if (a) { a.playbackRate = dir * (1 + boost); if (a.playState === 'finished') a.play(); }
      box.style.transform = Math.abs(skew) > 0.05 ? 'skewX(' + skew.toFixed(2) + 'deg)' : '';
      if (boost > 0.02 || Math.abs(skew) > 0.05) requestAnimationFrame(step);
      else running = false;
    }
    window.addEventListener('scroll', function () {
      const y = window.scrollY, t = performance.now();
      const dy = y - lastY, dt = clamp(t - lastT, 8, 50);
      lastY = y; lastT = t;
      if (sec && !isLive(sec)) return;
      if (dy) dir = dy > 0 ? 1 : -1;
      const v = dy / dt;
      boost = clamp(Math.abs(v) * 0.9, boost, 6);
      skew = clamp(-v * 2.2, -9, 9);
      if (!running) { running = true; requestAnimationFrame(step); }
    }, { passive: true });
  }

  /* ---------- Así nace una vela (scroll) ---------- */
  function story() {
    const sec = $('#story');
    if (!sec) return;
    const steps = $$('.story-step', sec);
    const btns = $$('[data-story]', sec);
    const fill = $('#story-rail-fill');
    const g = function (id) { return document.getElementById(id); };
    const wax = g('st-wax'), top = g('st-wax-top'), stream = g('st-stream'), pitcher = g('st-pitcher'), pWax = $('.st-pitcher-wax', sec);
    const dropper = g('st-dropper'), drops = $$('#st-drops circle'), wisps = g('st-wisps'), swirl = g('st-swirl'), melt = g('st-melt');
    const letters = g('st-letters'), wickEl = g('st-wick'), flame = g('st-flame'), glow = g('st-glow');
    const WORD = 'TEQUIERO';
    const LX = [116, 129, 148, 161, 172, 183, 196, 209];
    letters.innerHTML = Array.from(WORD).map(function (c, i) { return '<text x="' + LX[i] + '" y="0">' + c + '</text>'; }).join('');
    const L = $$('text', letters);
    const CREAM = '#f2eadb', SAGE = '#cdd6c1';
    drops.forEach(function (d) { d.setAttribute('fill', '#86947d'); });
    let active = -1;

    function render(p) {
      // 1) Fundir y verter
      const t0 = seg(p, 0.02, 0.22);
      const tiltA = easeInOut(seg(p, 0.02, 0.07)) * 40 * (1 - easeInOut(seg(p, 0.2, 0.26)));
      const slide = (1 - easeOut(seg(p, 0, 0.05))) * -90 + easeIn(seg(p, 0.21, 0.28)) * -120;
      pitcher.setAttribute('transform', 'translate(' + slide.toFixed(1) + ' 0) rotate(' + tiltA.toFixed(1) + ' 80 75)');
      pitcher.style.opacity = String(1 - seg(p, 0.24, 0.28));
      const pour = easeOut(seg(p, 0.06, 0.22));
      pWax.setAttribute('y', String(62 + pour * 34));
      pWax.setAttribute('height', String(40 - pour * 34));
      // 2) Capa extra para tapar las letras
      const extra = 16 * easeOut(seg(p, 0.64, 0.72));
      const h = 150 * pour + extra;
      const topY = 372 - h;
      wax.setAttribute('y', topY.toFixed(1));
      wax.setAttribute('height', (h + 4).toFixed(1));
      top.setAttribute('cy', topY.toFixed(1));
      top.style.opacity = h > 2 ? '1' : '0';
      // Chorro de cera
      const a = tiltA * Math.PI / 180;
      const sx = 80 + 44 * Math.cos(a) + 37 * Math.sin(a) + slide, sy = 75 + 44 * Math.sin(a) - 37 * Math.cos(a);
      const pouring = t0 > 0.08 && t0 < 0.97 && tiltA > 30;
      stream.setAttribute('d', 'M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ' Q' + (sx + 14).toFixed(1) + ' ' + (sy + 20).toFixed(1) + ' 158 ' + topY.toFixed(1));
      stream.style.opacity = pouring ? '1' : '0';
      // Color y aroma
      const c = mix(CREAM, SAGE, easeInOut(seg(p, 0.3, 0.46)));
      wax.setAttribute('fill', c);
      top.setAttribute('fill', mix(c, '#ffffff', 0.35));
      stream.setAttribute('stroke', c);
      const dIn = seg(p, 0.25, 0.29) - seg(p, 0.48, 0.52);
      dropper.setAttribute('transform', 'translate(-50 ' + ((1 - dIn) * -70).toFixed(1) + ')');
      dropper.style.opacity = String(dIn);
      drops.forEach(function (d, i) {
        const k = seg(p, 0.29 + i * 0.055, 0.34 + i * 0.055);
        d.setAttribute('cx', '189');
        d.setAttribute('cy', (100 + easeIn(k) * (topY - 100)).toFixed(1));
        d.style.opacity = k > 0 && k < 1 ? '1' : '0';
      });
      const sw = bell(seg(p, 0.3, 0.5));
      swirl.style.opacity = String(sw);
      swirl.setAttribute('transform', 'translate(' + (seg(p, 0.3, 0.5) * 30 - 15).toFixed(1) + ' ' + (topY - 300 + 40).toFixed(1) + ')');
      const wp = seg(p, 0.3, 0.52);
      wisps.style.opacity = String(bell(wp) * 0.9);
      wisps.setAttribute('transform', 'translate(0 ' + (-wp * 26).toFixed(1) + ')');
      // 3) Letras y mecha
      L.forEach(function (el, i) {
        const fall = seg(p, 0.52 + i * 0.018, 0.59 + i * 0.018);
        const depth = 262 + (i % 2) * 12;
        const rise = easeOut(seg(p, 0.83 + i * 0.016, 0.89 + i * 0.016));
        const yy = fall > 0 ? lerp(lerp(118, depth, easeIn(fall)), topY + 24, rise) : 118;
        const rot = (1 - fall) * (i % 2 ? 24 : -24);
        el.setAttribute('y', yy.toFixed(1));
        el.setAttribute('transform', 'rotate(' + rot.toFixed(1) + ' ' + LX[i] + ' ' + yy.toFixed(1) + ')');
        const covered = seg(p, 0.64, 0.72);
        el.style.opacity = fall <= 0 ? '0' : String(lerp(lerp(1, 0.18, covered), 1, rise));
      });
      const wk = seg(p, 0.7, 0.75);
      wickEl.setAttribute('d', 'M160 ' + (topY + 2).toFixed(1) + ' Q162 ' + (topY - 10).toFixed(1) + ' 160 ' + (topY - 20 * wk).toFixed(1));
      wickEl.style.opacity = wk > 0 ? '1' : '0';
      // 4) Encender
      const fl = easeOut(seg(p, 0.77, 0.83));
      const base = topY - 20;
      flame.setAttribute('transform', 'translate(160 ' + base.toFixed(1) + ') scale(' + fl.toFixed(3) + ') translate(-160 -172)');
      flame.style.opacity = fl > 0.01 ? '1' : '0';
      glow.setAttribute('cy', (base - 30).toFixed(1));
      glow.style.opacity = String(easeOut(seg(p, 0.77, 0.88)));
      const m = seg(p, 0.8, 0.95);
      melt.setAttribute('y', (topY - 2).toFixed(1));
      melt.setAttribute('height', (34 * m).toFixed(1));
      melt.setAttribute('fill', mix(c, '#fff8e8', 0.6));
      melt.style.opacity = String(m * 0.85);
      const night = easeInOut(seg(p, 0.76, 0.86));
      sec.style.setProperty('--night', night.toFixed(3));
      sec.classList.toggle('is-night', night > 0.5);
      sec.classList.toggle('is-lit', fl > 0.5);
      // Texto y barra
      const idx = p >= 0.75 ? 3 : p >= 0.5 ? 2 : p >= 0.25 ? 1 : 0;
      if (idx !== active) {
        active = idx;
        steps.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
        btns.forEach(function (b, i) { b.classList.toggle('is-active', i === idx); b.classList.toggle('is-done', i < idx); b.setAttribute('aria-current', i === idx ? 'step' : 'false'); });
      }
      if (fill) fill.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    }

    if (reduce) {
      sec.classList.add('story--static');
      render(1);
      steps.forEach(function (s) { s.classList.add('is-active'); });
      return;
    }
    function progress() {
      const r = sec.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? clamp(-r.top / span, 0, 1) : 0;
    }
    // La animación sigue al scroll con un poco de suavizado (no da saltos)
    let goal = 0, shown = -1, running = false, last = 0;
    function frame(t) {
      const dt = Math.min(64, t - last || 16.667);
      last = t;
      shown = shown < 0 ? goal : lerp(shown, goal, damp(0.16, dt));
      if (Math.abs(goal - shown) < 0.0006) shown = goal;
      render(shown);
      if (shown !== goal) requestAnimationFrame(frame);
      else running = false;
    }
    onScroll.push(function () {
      if (!isLive(sec)) return;
      const p = progress();
      if (p === goal && shown === goal) return;
      goal = p;
      if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    });
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        const r = sec.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        window.scrollTo({ top: window.scrollY + r.top + span * ((i + 0.62) / 4), behavior: 'smooth' });
      });
    });
    render(0);
  }

  /* ---------- Gira y elige la tuya: carrusel en anillo (idea de «Vertex») ---------- */
  // Las tarjetas van sobre un cilindro y la cámara está en el centro: las de los
  // lados se acercan y se curvan. La de delante se enciende.
  function ringCarousel() {
    const sec = $('#ring-sec'), stage = $('#ring-stage'), ring = $('#ring');
    const V = window.Vibra, T = window.TIENDA;
    if (!sec || !stage || !ring || !V || !T) return;
    // Una mezcla de colecciones (sin las cajas de regalo)
    const groups = {};
    T.productos.forEach(function (p) { if (!p.caja) (groups[p.sub] = groups[p.sub] || []).push(p); });
    const keys = Object.keys(groups), picks = [];
    for (let r = 0; picks.length < 24 && r < 8; r++) keys.forEach(function (k) { if (groups[k][r] && picks.length < 24) picks.push(groups[k][r]); });
    const n = picks.length, STEP = 360 / n, CULL = 48;
    // Color suave de cada colección (mezclado con crema para que el texto se lea)
    const COL = { dulces: '#f29cb7', salados: '#e6b85c', naturaleza: '#8fb08a', zodiaco: '#3c3566', mistica: '#9a72c4', escultorica: '#d6c3aa' };
    ring.innerHTML = picks.map(function (p, i) {
      const g = T.tematicas[p.sub] || {};
      const col = g.color || COL[p.sub] || '#c3cbb5';
      return '<a class="ring-card" href="#/producto/' + p.id + '" data-i="' + i + '" draggable="false" style="--bg:' + mix(col, '#f4ede4', 0.74) + '">' +
        V.velaSvg(p, { id: 'ring-' + p.id }) + '<strong>' + V.esc(p.nombre) + '</strong><span>' + V.eur(p.precio) + '</span></a>';
    }).join('');
    const cards = $$('.ring-card', ring);
    const state = cards.map(function () { return { hidden: false }; });
    let R = 890, phase = 0, auto = reduce ? 0 : -4.5, vel = 0, hover = false, front = -1, seek = null, running = false, last = 0;
    let drag = null, moved = 0;

    function sizeUp() {
      const w = stage.clientWidth || window.innerWidth;
      const cw = clamp(w * 0.16, 128, 200);
      R = clamp(cw / Math.sin(STEP * Math.PI / 180) * 1.12, 480, 980);
      const ch = cw * 1.45;
      stage.style.setProperty('--cw', cw.toFixed(0) + 'px');
      stage.style.setProperty('--ch', ch.toFixed(0) + 'px');
      stage.style.setProperty('--rp', R.toFixed(0) + 'px');
      stage.style.setProperty('--ry', (20 + ch / 2).toFixed(0) + 'px');
      stage.style.setProperty('--rh', (ch * 1.28 + 30).toFixed(0) + 'px');
    }
    function layout() {
      let best = 999, bi = -1;
      for (let i = 0; i < n; i++) {
        const el = cards[i], st = state[i];
        const a = ((i * STEP + phase) % 360 + 540) % 360 - 180;
        if (Math.abs(a) > CULL) {
          if (!st.hidden) { st.hidden = true; el.style.visibility = 'hidden'; }
          continue;
        }
        if (st.hidden) { st.hidden = false; el.style.visibility = ''; }
        const r = a * Math.PI / 180, c = Math.cos(r);
        el.style.transform = 'translate3d(' + (R * Math.sin(r)).toFixed(1) + 'px,0,' + (R * (1 - c)).toFixed(1) + 'px) rotateY(' + (-a).toFixed(2) + 'deg)';
        // Las de los lados, más oscuras; en el borde se desvanecen para no aparecer de golpe
        el.style.filter = 'brightness(' + clamp(1 - (1 - c) * 1.7, 0.42, 1).toFixed(3) + ')';
        el.style.opacity = clamp((CULL - Math.abs(a)) / 7, 0, 1).toFixed(3);
        if (Math.abs(a) < best) { best = Math.abs(a); bi = i; }
      }
      if (bi !== front) {
        if (front > -1) { cards[front].classList.remove('is-front'); const s0 = $('.vela', cards[front]); if (s0) s0.classList.remove('is-lit'); }
        front = bi;
        if (front > -1) { cards[front].classList.add('is-front'); const s1 = $('.vela', cards[front]); if (s1) s1.classList.add('is-lit'); }
      }
    }
    function frame(t) {
      const dt = Math.min(0.1, (t - last) / 1000 || 0.016);
      last = t;
      if (!drag) {
        if (seek !== null) {
          const d = ((seek - phase) % 360 + 540) % 360 - 180;
          phase += d * damp(0.12, dt * 1000);
          if (Math.abs(d) < 0.05) seek = null;
        } else {
          vel *= Math.pow(0.05, dt);
          phase += ((hover ? 0 : auto) + vel) * dt;
        }
      }
      layout();
      if (isLive(sec) && document.visibilityState === 'visible') requestAnimationFrame(frame);
      else running = false;
    }
    function start() { if (!running && isLive(sec)) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
    liveListeners.push(start);
    document.addEventListener('visibilitychange', start);
    window.addEventListener('resize', function () { sizeUp(); layout(); });

    // Arrastrar para girar (con inercia)
    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      drag = { x: e.clientX, t: performance.now(), v: 0 };
      moved = 0; seek = null;
      stage.classList.add('is-drag');
      start();
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      const dx = e.clientX - drag.x, t = performance.now();
      const degPerPx = STEP / (R * Math.sin(STEP * Math.PI / 180));
      phase += dx * degPerPx;
      drag.v = (dx * degPerPx) / Math.max(0.008, (t - drag.t) / 1000);
      drag.x = e.clientX; drag.t = t;
      moved += Math.abs(dx);
      if (moved > 6 && !stage.hasPointerCapture(e.pointerId)) { try { stage.setPointerCapture(e.pointerId); } catch (err) { /* nada */ } }
    }, { passive: true });
    function endDrag() {
      if (!drag) return;
      vel = clamp(drag.v, -260, 260);
      drag = null;
      stage.classList.remove('is-drag');
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    // Si se ha arrastrado, no abrir la vela al soltar
    stage.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    stage.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    stage.addEventListener('pointerleave', function () { hover = false; });
    // Con el teclado: la vela con el foco gira hasta delante
    ring.addEventListener('focusin', function (e) {
      const c = e.target.closest('.ring-card');
      if (!c) return;
      seek = -Number(c.dataset.i) * STEP;
      start();
    });
    sizeUp();
    layout();
    start();
  }

  /* ---------- Manifiesto: las palabras se encienden ---------- */
  function manifesto() {
    const el = $('#manifiesto');
    if (!el) return;
    const sec = el.closest('.view > *');
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) {
      return '<span class="mw">' + w.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }) + '</span>';
    }).join(' ');
    const ws = $$('.mw', el);
    if (reduce) { ws.forEach(function (w) { w.classList.add('is-lit'); }); return; }
    let last = -1;
    onScroll.push(function () {
      if (sec && !isLive(sec)) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh * 0.85 - r.top) / (vh * 0.5 + r.height * 0.4), 0, 1);
      const n = Math.round(p * ws.length);
      if (n === last) return;
      last = n;
      ws.forEach(function (w, i) { w.classList.toggle('is-lit', i < n); w.classList.toggle('is-now', i < n && i >= n - 2 && n < ws.length); });
    });
  }

  /* ---------- Nombre gigante del pie ---------- */
  function giant() {
    const el = $('#ftr-giant');
    if (!el) return;
    if (reduce || !hasIO) { el.classList.add('is-in'); return; }
    const io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { el.classList.add('is-in'); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(el);
  }

  /* ---------- Modo vela ---------- */
  // La oscuridad se pinta en un lienzo pequeño (¼ de la pantalla) que el
  // navegador amplía: como todo son degradados suaves, no se nota y cuesta muy poco.
  function nightMode() {
    const btn = $('#lights-btn'), cv = $('#night');
    if (!btn || !cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    const label = $('.lights-label', btn);
    const V = window.Vibra || null;
    const S = 0.25;
    let on = false, ownSound = false, raf = 0, lights = [], lightsAt = 0;
    let x = window.innerWidth / 2, y = window.innerHeight * 0.45, sx = x, sy = y;

    function resize() { cv.width = Math.ceil(window.innerWidth * S); cv.height = Math.ceil(window.innerHeight * S); }
    // Una llama cuenta si de verdad se ve (no en un menú cerrado ni en algo transparente)
    function shown(el) {
      if (getComputedStyle(el).visibility !== 'visible') return false;
      for (let nd = el, k = 0; nd && nd !== document.body && k < 8; nd = nd.parentElement, k++) {
        if (nd.nodeType === 1 && parseFloat(getComputedStyle(nd).opacity) < 0.15) return false;
      }
      return true;
    }
    function findLights() {
      const vh = window.innerHeight, vw = window.innerWidth, out = [];
      let list = [];
      liveSections().forEach(function (s) { list = list.concat($$('.vela .v-flame, #st-flame', s)); });
      for (let i = 0; i < list.length && out.length < 14; i++) {
        const f = list[i];
        const r = f.getBoundingClientRect();
        if (r.height < 3 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
        if (f.id === 'st-flame' && f.style.opacity === '0') continue;
        if (!shown(f)) continue;
        out.push([r.left + r.width / 2, r.top + r.height * 0.55, clamp(r.height * 1.1, 16, 70)]);
      }
      lights = out;
      lightsAt = performance.now();
    }
    function hole(px, py, r1, r2) {
      const g = ctx.createRadialGradient(px * S, py * S, 0, px * S, py * S, r2 * S);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(clamp(r1 / r2, 0, 0.98), 'rgba(0,0,0,1)');
      g.addColorStop(clamp((r1 * 2) / r2, 0, 0.99), 'rgba(0,0,0,.45)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect((px - r2) * S, (py - r2) * S, r2 * 2 * S, r2 * 2 * S);
    }
    function draw(t) {
      raf = 0;
      if (!on) return;
      if (t - lightsAt > 300) findLights();
      sx = lerp(sx, x, 0.25); sy = lerp(sy, y, 0.25);
      const f = 1 + Math.sin(t / 140) * 0.025 + Math.sin(t / 53) * 0.015; // parpadeo de vela
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = 'rgba(8,10,9,.95)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.globalCompositeOperation = 'destination-out';
      hole(sx, sy, 70 * f, 290 * f);
      lights.forEach(function (l, i) { const k = 1 + Math.sin(t / (90 + i * 7) + i) * 0.04; hole(l[0], l[1], l[2] * k, l[2] * 3.6 * k); });
      // Un poco de luz cálida alrededor del ratón
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createRadialGradient(sx * S, sy * S, 0, sx * S, sy * S, 230 * S * f);
      g.addColorStop(0, 'rgba(255,176,96,.16)');
      g.addColorStop(1, 'rgba(255,176,96,0)');
      ctx.fillStyle = g;
      ctx.fillRect((sx - 230) * S, (sy - 230) * S, 460 * S, 460 * S);
      if (document.visibilityState === 'visible') raf = requestAnimationFrame(draw);
    }
    function loop() { if (on && !raf) raf = requestAnimationFrame(draw); }
    window.addEventListener('pointermove', function (e) { if (on) { x = e.clientX; y = e.clientY; } }, { passive: true });
    window.addEventListener('pointerdown', function (e) { if (on && !e.target.closest('#lights-btn')) { x = e.clientX; y = e.clientY; } }, { passive: true });
    onScroll.push(function () { if (on) lightsAt = 0; });
    window.addEventListener('resize', function () { if (on) resize(); });
    document.addEventListener('visibilitychange', loop);

    function set(v) {
      on = v;
      root.classList.toggle('is-night', on);
      btn.setAttribute('aria-pressed', String(on));
      label.textContent = on ? 'Enciende la luz' : 'Apaga la luz';
      if (on) {
        resize();
        sx = x; sy = y; lightsAt = 0;
        loop();
        if (V && !V.sound.isOn()) ownSound = V.sound.start();
        if (V) V.toast(fine ? 'Modo vela: mueve el ratón para alumbrar. Esc para salir.' : 'Modo vela: toca la pantalla para alumbrar.');
      } else {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        if (V && ownSound && V.sound.isOn()) V.sound.stop();
        ownSound = false;
      }
    }
    btn.addEventListener('click', function () { set(!on); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && on) set(false); });
  }

  watchSections();
  intro();
  smoothWheel();
  wick();
  splitHeadings();
  menuStagger();
  story();
  ringCarousel();
  manifesto();
  giant();
  marquee();
  flameLean();
  cursor();
  magnetic();
  tilt();
  nightMode();
  tick();
})();
