/* =========================================================
   Vibra · movimiento extra
   - Entrada con el logo (una vez por sesión)
   - Mecha de progreso arriba del todo
   - Cursor con luz de vela, botones magnéticos y tarjetas en 3D
   - Títulos que suben palabra a palabra
   - «Así nace una vela»: historia que avanza con el scroll
   - Manifiesto que se enciende palabra a palabra
   - Cinta gigante que acelera con el scroll
   - Llamas que se inclinan cuando mueves el ratón
   - Modo vela: se apaga la luz, se encienden todas las velas
   ========================================================= */
(function () {
  'use strict';

  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.from((r || document).querySelectorAll(s)); };
  const root = document.documentElement;
  const mq = function (q) { return window.matchMedia ? window.matchMedia(q).matches : false; };
  const reduce = mq('(prefers-reduced-motion: reduce)');
  const fine = mq('(hover: hover) and (pointer: fine)');
  let inFrame = false;
  try { inFrame = window.top !== window; } catch (e) { inFrame = true; }

  const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  const lerp = function (a, b, t) { return a + (b - a) * t; };
  const seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  const easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  const easeIn = function (t) { return t * t * t; };
  const easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const bell = function (t) { return Math.sin(clamp(t, 0, 1) * Math.PI); };
  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(lerp(pa >> 16, pb >> 16, t)), g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t)), bl = Math.round(lerp(pa & 255, pb & 255, t));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }
  function visible(el) { return !!(el && el.offsetParent !== null); }

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
      setTimeout(function () { root.classList.remove('has-intro', 'intro-leaving'); el.remove(); tick(); }, 1000);
    }
    el.addEventListener('click', finish);
    document.addEventListener('keydown', finish, { once: true });
    setTimeout(finish, 2400);
  }

  /* ---------- Mecha de progreso ---------- */
  function wick() {
    const bar = $('#scroll-wick');
    if (!bar) return;
    onScroll.push(function () {
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      bar.style.transform = 'translateX(' + ((p - 1) * 100).toFixed(2) + '%)';
      bar.classList.toggle('is-lit', p > 0.004);
    });
  }

  /* ---------- Títulos palabra a palabra ---------- */
  function splitHeadings() {
    const list = $$('.block-head h2, .secreto-text h2, .crea-promo-text h2, #calidad-title, .wood-text h2, .story-text h2, .guide h2');
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
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-split-in'); io.unobserve(e.target); } });
    }, { threshold: 0.35 }) : null;
    list.forEach(function (h) {
      n = 0;
      wrap(h);
      h.classList.add('split');
      if (io && !reduce) io.observe(h); else h.classList.add('is-split-in');
    });
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
    let x = 0, y = 0, rx = 0, ry = 0, gx = 0, gy = 0, shown = false, mode = '';

    function modeFor(t) {
      if (!t || !t.closest) return ['', ''];
      if (t.closest('input, textarea, select')) return ['text', ''];
      if (t.closest('.quick-add, .fav-btn')) return ['link', ''];
      if (t.closest('.card-media, .fiesta, .gift-card')) return ['view', 'Ver'];
      if (t.closest('[data-sound]')) return ['view', 'Oír'];
      if (t.closest('a, button, summary, label, [role="tab"]')) return ['link', ''];
      if (t.closest('.carousel')) return ['view', 'Arrastra'];
      return ['', ''];
    }
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; rx = gx = x; ry = gy = y; root.classList.add('cursor-on'); }
      const m = modeFor(e.target);
      if (m[0] !== mode || label.textContent !== m[1]) { mode = m[0]; ring.dataset.mode = mode; label.textContent = m[1]; }
    }, { passive: true });
    document.addEventListener('pointerdown', function () { ring.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { ring.classList.remove('is-down'); });
    document.documentElement.addEventListener('mouseleave', function () { root.classList.remove('cursor-on'); shown = false; });
    (function loop() {
      if (shown) {
        rx = lerp(rx, x, 0.2); ry = lerp(ry, y, 0.2);
        gx = lerp(gx, x, 0.08); gy = lerp(gy, y, 0.08);
        dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
        ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
        glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Botones magnéticos ---------- */
  function magnetic() {
    if (!fine || reduce) return;
    const SEL = '.btn:not(.btn-block), .round-btn, .sound-btn, .lights-btn';
    let cur = null;
    function release(el) {
      const from = el.style.translate || '0px 0px';
      el.style.translate = '';
      if (el.animate) el.animate([{ translate: from }, { translate: '0px 0px' }], { duration: 450, easing: 'cubic-bezier(.2,.7,.2,1)' });
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
  function flameLean() {
    if (reduce) return;
    let lastX = null, lastT = 0, lean = 0, target = 0, running = false;
    function step() {
      lean = lerp(lean, target, 0.12);
      target *= 0.9;
      if (Math.abs(lean) < 0.004 && Math.abs(target) < 0.004) {
        running = false;
        root.style.setProperty('--lean', '0');
        return;
      }
      root.style.setProperty('--lean', (lean * 18).toFixed(2));
      requestAnimationFrame(step);
    }
    window.addEventListener('pointermove', function (e) {
      const t = performance.now();
      if (lastX !== null && t - lastT < 120) {
        const v = (e.clientX - lastX) / Math.max(8, t - lastT);
        target = clamp(-v * 0.8, -1, 1);
        if (!running) { running = true; requestAnimationFrame(step); }
      }
      lastX = e.clientX; lastT = t;
    }, { passive: true });
  }

  /* ---------- Cinta gigante: acelera y se inclina con el scroll ---------- */
  function marquee() {
    if (reduce) return;
    const box = $('.big-marquee');
    const track = $('.big-marquee-track');
    if (!box || !track || !track.getAnimations) return;
    let lastY = window.scrollY, lastT = performance.now(), dir = 1, boost = 0, skew = 0, running = false;
    function step() {
      boost = lerp(boost, 0, 0.06);
      skew = lerp(skew, 0, 0.1);
      const a = track.getAnimations()[0];
      if (a) a.playbackRate = dir * (1 + boost);
      box.style.transform = Math.abs(skew) > 0.05 ? 'skewX(' + skew.toFixed(2) + 'deg)' : '';
      if (boost > 0.02 || Math.abs(skew) > 0.05) requestAnimationFrame(step);
      else running = false;
    }
    window.addEventListener('scroll', function () {
      const y = window.scrollY, t = performance.now();
      const dy = y - lastY, dt = clamp(t - lastT, 8, 50);
      lastY = y; lastT = t;
      if (!visible(box)) return;
      const r = box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
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
    let active = -1, lastP = -1;

    function render(p) {
      // 1) Fundir y verter
      const t0 = seg(p, 0.02, 0.22);
      const tilt = easeInOut(seg(p, 0.02, 0.07)) * 40 * (1 - easeInOut(seg(p, 0.2, 0.26)));
      const slide = (1 - easeOut(seg(p, 0, 0.05))) * -90 + easeIn(seg(p, 0.21, 0.28)) * -120;
      pitcher.setAttribute('transform', 'translate(' + slide.toFixed(1) + ' 0) rotate(' + tilt.toFixed(1) + ' 80 75)');
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
      const a = tilt * Math.PI / 180;
      const sx = 80 + 44 * Math.cos(a) + 37 * Math.sin(a) + slide, sy = 75 + 44 * Math.sin(a) - 37 * Math.cos(a);
      const pouring = t0 > 0.08 && t0 < 0.97 && tilt > 30;
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
    onScroll.push(function () {
      if (!visible(sec)) return;
      const r = sec.getBoundingClientRect();
      if (r.bottom < -50 || r.top > window.innerHeight + 50) return;
      const p = progress();
      if (Math.abs(p - lastP) < 0.0005) return;
      lastP = p;
      render(p);
    });
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        const r = sec.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        const target = window.scrollY + r.top + span * ((i + 0.62) / 4);
        window.scrollTo({ top: target, behavior: 'smooth' });
      });
    });
    render(0);
  }

  /* ---------- Manifiesto: las palabras se encienden ---------- */
  function manifesto() {
    const el = $('#manifiesto');
    if (!el) return;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) {
      return '<span class="mw">' + w.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }) + '</span>';
    }).join(' ');
    const ws = $$('.mw', el);
    if (reduce) { ws.forEach(function (w) { w.classList.add('is-lit'); }); return; }
    let last = -1;
    onScroll.push(function () {
      if (!visible(el)) return;
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
    if (reduce || !('IntersectionObserver' in window)) { el.classList.add('is-in'); return; }
    const io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { el.classList.add('is-in'); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(el);
  }

  /* ---------- Modo vela ---------- */
  function nightMode() {
    const btn = $('#lights-btn'), night = $('#night'), glow = $('#night-glow');
    if (!btn || !night) return;
    const label = $('.lights-label', btn);
    const V = window.Vibra || null;
    let on = false, ownSound = false;
    let x = window.innerWidth / 2, y = window.innerHeight * 0.45;

    // Una llama cuenta si de verdad se ve (no está en un menú cerrado ni en algo transparente)
    function shown(el) {
      if (getComputedStyle(el).visibility !== 'visible') return false;
      for (let n = el, k = 0; n && n !== document.body && k < 8; n = n.parentElement, k++) {
        if (n.nodeType === 1 && parseFloat(getComputedStyle(n).opacity) < 0.15) return false;
      }
      return true;
    }
    function lights() {
      const vh = window.innerHeight, vw = window.innerWidth;
      const out = [];
      $$('.vela .v-flame, #st-flame').some(function (f) {
        const r = f.getBoundingClientRect();
        if (r.height < 3 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return false;
        if (f.id === 'st-flame' && f.style.opacity === '0') return false;
        if (!shown(f)) return false;
        const rad = clamp(r.height * 1.1, 16, 70);
        out.push([r.left + r.width / 2, r.top + r.height * 0.55, rad]);
        return out.length >= 14;
      });
      return out;
    }
    function paint() {
      if (!on) return;
      const layers = ['radial-gradient(circle at ' + x + 'px ' + y + 'px, transparent 0, transparent 70px, rgba(0,0,0,.55) 150px, #000 280px)'];
      lights().forEach(function (l) {
        layers.push('radial-gradient(circle at ' + l[0].toFixed(0) + 'px ' + l[1].toFixed(0) + 'px, transparent 0, transparent ' + l[2].toFixed(0) + 'px, rgba(0,0,0,.6) ' + (l[2] * 2).toFixed(0) + 'px, #000 ' + (l[2] * 3.6).toFixed(0) + 'px)');
      });
      const m = layers.join(',');
      night.style.webkitMaskImage = m;
      night.style.maskImage = m;
      if (glow) glow.style.translate = x + 'px ' + y + 'px';
    }
    let raf = 0;
    function schedule() { if (on && !raf) raf = requestAnimationFrame(function () { raf = 0; paint(); }); }
    window.addEventListener('pointermove', function (e) { if (!on) return; x = e.clientX; y = e.clientY; schedule(); }, { passive: true });
    window.addEventListener('pointerdown', function (e) { if (!on || e.target.closest('#lights-btn')) return; x = e.clientX; y = e.clientY; schedule(); }, { passive: true });
    onScroll.push(schedule);
    // Mientras está encendido, las llamas se mueven: repintar de vez en cuando
    setInterval(function () { if (on && document.visibilityState === 'visible') schedule(); }, 400);

    function set(v) {
      on = v;
      root.classList.toggle('is-night', on);
      btn.setAttribute('aria-pressed', String(on));
      label.textContent = on ? 'Enciende la luz' : 'Apaga la luz';
      if (on) {
        paint();
        if (V && !V.sound.isOn()) ownSound = V.sound.start();
        if (V) V.toast(fine ? 'Modo vela: mueve el ratón para alumbrar. Esc para salir.' : 'Modo vela: toca la pantalla para alumbrar.');
      } else {
        if (V && ownSound && V.sound.isOn()) V.sound.stop();
        ownSound = false;
      }
    }
    btn.addEventListener('click', function () { set(!on); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && on) set(false); });
  }

  intro();
  wick();
  splitHeadings();
  story();
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
