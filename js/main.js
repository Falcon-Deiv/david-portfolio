/* Portfolio · Jorge González Luque · S.E 2º A.F */
(function () {
  'use strict';

  /* ---------- Menú móvil ---------- */
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const links = Array.from(menu.querySelectorAll('.nav-link'));

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  }

  toggle.addEventListener('click', function () {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  links.forEach(function (link) { link.addEventListener('click', closeMenu); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target)) closeMenu();
  });

  /* ---------- Sombra de la barra al hacer scroll ---------- */
  function onScroll() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Enlace activo según la sección visible ---------- */
  const sections = links
    .map(function (l) { return document.querySelector(l.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(function (l) {
      l.classList.toggle('is-active', l.getAttribute('href') === '#' + id);
    });
  }

  function updateActive() {
    const offset = navbar.offsetHeight + window.innerHeight * 0.3;
    let current = sections[0].id;
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top - offset <= 0) current = s.id;
    });
    // Al llegar al final de la página, activa la última sección
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = sections[sections.length - 1].id;
    }
    setActive(current);
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();

  /* ---------- Motion: aparición al hacer scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');

  function reveal(el) {
    el.classList.add('active', 'is-visible');
    // Al terminar la entrada se retiran las clases de animación para que
    // el transform no anule los efectos hover propios del elemento.
    el.addEventListener('transitionend', function done(e) {
      if (e.target !== el || e.propertyName !== 'opacity') return;
      el.removeEventListener('transitionend', done);
      el.classList.remove('reveal', 'active');
    });
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(reveal);
  }

  /* ---------- Pestañas (Creatividad) ---------- */
  const tabs = Array.from(document.querySelectorAll('.tab'));

  function activateTab(tab) {
    tabs.forEach(function (t) {
      const selected = t === tab;
      t.classList.toggle('is-active', selected);
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !selected;
      panel.classList.toggle('is-active', selected);
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activateTab(tab); });
    tab.addEventListener('keydown', function (e) {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        next.focus();
        activateTab(next);
      }
    });
  });

  /* ---------- Enlaces opcionales ----------
     Los enlaces con data-optional solo se muestran si el archivo existe
     (p. ej. el PDF del contrato de equipo). */
  document.querySelectorAll('a[data-optional]').forEach(function (a) {
    if (!window.fetch) return;
    fetch(a.getAttribute('href'), { method: 'HEAD' })
      .then(function (r) { if (r.ok) a.hidden = false; })
      .catch(function () {});
  });

  /* ---------- Filtro de ideas (Reto 1+1 Málaga) ---------- */
  const retoTable = document.getElementById('reto-table');
  if (retoTable) {
    const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
    const retoRows = Array.from(retoTable.querySelectorAll('tbody tr'));
    const live = document.getElementById('reto-live');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const f = btn.dataset.filter;
        let shown = 0;
        retoRows.forEach(function (row) {
          const visible = f === 'all' || row.dataset.status === f;
          row.hidden = !visible;
          if (visible) shown++;
        });
        filterBtns.forEach(function (b) {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        if (live) live.textContent = shown + (shown === 1 ? ' idea' : ' ideas');
      });
    });
  }

  /* ---------- Idea de negocio: pasos ---------- */
  const steps = document.getElementById('idea-steps');
  if (steps) {
    const stepBtns = Array.from(steps.querySelectorAll('.step-btn'));
    const stepPanels = stepBtns.map(function (b) { return document.getElementById(b.getAttribute('aria-controls')); });
    const stepNav = document.getElementById('idea-steps-nav');
    const prevBtn = stepNav.querySelector('[data-step="prev"]');
    const nextBtn = stepNav.querySelector('[data-step="next"]');
    const stepCount = stepNav.querySelector('.step-count');
    let current = 0;

    function goTo(i, focus) {
      current = Math.max(0, Math.min(stepBtns.length - 1, i));
      stepBtns.forEach(function (b, j) {
        const on = j === current;
        b.classList.toggle('is-active', on);
        b.classList.toggle('is-done', j < current);
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        stepPanels[j].hidden = !on;
      });
      steps.style.setProperty('--p', current / (stepBtns.length - 1));
      stepPanels[current].dispatchEvent(new CustomEvent('stepshow'));
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === stepBtns.length - 1;
      stepCount.textContent = 'Paso ' + (current + 1) + ' de ' + stepBtns.length;
      if (focus) stepBtns[current].focus();
    }

    stepBtns.forEach(function (b, i) {
      b.addEventListener('click', function () { goTo(i); });
      b.addEventListener('keydown', function (e) {
        let next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % stepBtns.length;
        if (e.key === 'ArrowLeft') next = (i - 1 + stepBtns.length) % stepBtns.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = stepBtns.length - 1;
        if (next !== null) { e.preventDefault(); goTo(next, true); }
      });
    });
    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });
    document.querySelectorAll('[data-step-goto]').forEach(function (b) {
      b.addEventListener('click', function () { goTo(Number(b.dataset.stepGoto), true); });
    });

    stepNav.hidden = false;
    goTo(0);
  }

  /* ---------- Idea de negocio: grupos de botones que cambian lo que se ve ----------
     Cada botón lleva data-sw-btn="grupo" y data-key; cada panel, data-sw-panel="grupo"
     y la misma data-key. Sirve para las pestañas, sombreros, pétalos, lienzo y precios. */
  function initSwitch(group) {
    const btns = Array.from(document.querySelectorAll('[data-sw-btn="' + group + '"]'));
    const panels = Array.from(document.querySelectorAll('[data-sw-panel="' + group + '"]'));
    if (!btns.length || !panels.length) return;
    const isTab = btns[0].getAttribute('role') === 'tab';

    function show(key, focusBtn) {
      btns.forEach(function (b) {
        const on = b.dataset.key === key;
        b.classList.toggle('is-active', on);
        if (isTab) {
          b.setAttribute('aria-selected', String(on));
          b.tabIndex = on ? 0 : -1;
        } else {
          b.setAttribute('aria-pressed', String(on));
        }
        if (on && focusBtn) b.focus();
      });
      panels.forEach(function (p) { p.hidden = p.dataset.key !== key; });
    }

    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        show(b.dataset.key);
        // En el lienzo, en móvil, bajar hasta la explicación
        if (group === 'canvas' && window.innerWidth < 960) {
          const detail = document.getElementById('cv-detail');
          if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
      if (!isTab) return;
      b.addEventListener('keydown', function (e) {
        let next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % btns.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + btns.length) % btns.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = btns.length - 1;
        if (next !== null) { e.preventDefault(); show(btns[next].dataset.key, true); }
      });
    });

    const active = btns.find(function (b) { return b.classList.contains('is-active'); });
    const hasIntro = panels.some(function (p) { return p.dataset.key === 'intro'; });
    show(active ? active.dataset.key : (hasIntro ? 'intro' : btns[0].dataset.key));
  }
  ['idea', 'sombrero', 'petalo', 'canvas', 'motivo'].forEach(initSwitch);

  /* ---------- Idea de negocio: vista previa de la web (iframe a escala) ---------- */
  const webFrame = document.getElementById('web-frame');
  if (webFrame) {
    const fit = function () {
      if (webFrame.clientWidth) webFrame.style.setProperty('--s', (webFrame.clientWidth / 1366).toFixed(4));
    };
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(webFrame);
    window.addEventListener('resize', fit);
    fit();
  }

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Idea de negocio: tablero de la lluvia de ideas ----------
     «Ordenar por puesto» recoloca los post-its y los mueve con suavidad. */
  const brain = document.getElementById('brain');
  const brainSort = document.getElementById('brain-sort');
  if (brain && brainSort) {
    const cards = Array.from(brain.children);
    brainSort.addEventListener('click', function () {
      const on = brainSort.getAttribute('aria-pressed') !== 'true';
      const before = new Map(cards.map(function (c) { return [c, c.getBoundingClientRect()]; }));
      const order = on ? cards.slice().sort(function (a, b) { return a.dataset.rank - b.dataset.rank; }) : cards;
      order.forEach(function (c) { brain.appendChild(c); });
      brainSort.setAttribute('aria-pressed', String(on));
      brainSort.textContent = on ? 'Orden del tablero' : 'Ordenar por puesto';
      if (reduceMotion || !Element.prototype.animate) return;
      cards.forEach(function (c) {
        const a = before.get(c), z = c.getBoundingClientRect();
        const dx = a.left - z.left, dy = a.top - z.top;
        if (dx || dy) c.animate([{ translate: dx + 'px ' + dy + 'px' }, { translate: '0px 0px' }], { duration: 550, easing: 'cubic-bezier(.2,.7,.2,1)' });
      });
    });
  }

  /* ---------- Idea de negocio: filtrado de ideas (barras) ----------
     Cada idea guarda sus 6 subtotales (data-s). «Total» los suma (sobre 110). */
  const filt = document.getElementById('filt');
  if (filt) {
    const rows = Array.from(filt.querySelectorAll('.filt-row'));
    const MAX = [25, 20, 15, 15, 20, 15];
    const NAMES = ['Mercado y nicho', 'Valor y diferenciación', 'Viabilidad técnica', 'Parte legal', 'Números', 'Equipo, riesgos e impacto'];
    const filtBtns = Array.from(document.querySelectorAll('[data-filt]'));
    const scale = document.getElementById('filt-scale');
    const maxEl = document.getElementById('filt-max');
    let mode = 'total';
    const renderFilt = function () {
      const vals = rows.map(function (r) {
        const s = r.dataset.s.split(',').map(Number);
        return mode === 'total' ? s.reduce(function (a, b) { return a + b; }, 0) : s[Number(mode)];
      });
      const max = mode === 'total' ? 110 : MAX[Number(mode)];
      const top = Math.max.apply(null, vals);
      rows.forEach(function (r, i) {
        r.querySelector('.filt-bar i').style.width = (vals[i] / max * 100).toFixed(1) + '%';
        r.querySelector('.filt-num').textContent = vals[i];
        r.classList.toggle('is-top', vals[i] === top);
      });
      if (scale) scale.classList.toggle('is-hidden', mode !== 'total');
      if (maxEl) maxEl.textContent = mode === 'total' ? 'Puntuación total, sobre 110. Menos de 60: aparcar · 60-74: investigar o pivotar · 75-89: avanzar corrigiendo debilidades · 90-110: validar ya.' : NAMES[Number(mode)] + ', sobre ' + max + '.';
    };
    filtBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.dataset.filt;
        filtBtns.forEach(function (x) { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
        renderFilt();
      });
    });
    // Las barras crecen cada vez que se abre el paso
    const filtPanel = filt.closest('.step-panel');
    if (filtPanel) {
      filtPanel.addEventListener('stepshow', function () {
        rows.forEach(function (r) { r.querySelector('.filt-bar i').style.width = '0'; });
        requestAnimationFrame(function () { requestAnimationFrame(renderFilt); });
      });
    }
    renderFilt();
  }

  /* ---------- Idea de negocio: circuito del negocio ----------
     Filtra por bienes o dinero, o recorre los 8 tramos uno a uno. */
  const circ = document.getElementById('circ');
  if (circ) {
    const showBtns = Array.from(document.querySelectorAll('[data-circ]'));
    const flows = Array.from(circ.querySelectorAll('.flow')).sort(function (a, b) { return a.dataset.o - b.dataset.o; });
    const caption = document.getElementById('circ-caption');
    const playBtn = document.querySelector('.circ-play');
    const baseCaption = caption.textContent;
    const basePlay = playBtn.innerHTML;
    let step = -1;
    const setShow = function (k) {
      circ.dataset.show = k;
      showBtns.forEach(function (b) { const on = b.dataset.circ === k; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    };
    const flowText = function (f) {
      const c = f.cloneNode(true);
      c.querySelectorAll('.flow-route, em').forEach(function (x) { x.remove(); });
      return c.textContent.trim();
    };
    const stopSteps = function () {
      step = -1;
      circ.classList.remove('is-stepping');
      flows.forEach(function (f) { f.classList.remove('is-on'); });
      caption.textContent = baseCaption;
      playBtn.innerHTML = basePlay;
    };
    const showStep = function (i) {
      step = (i + flows.length) % flows.length;
      setShow('todo');
      circ.classList.add('is-stepping');
      flows.forEach(function (f, j) { f.classList.toggle('is-on', j === step); });
      const f = flows[step];
      caption.textContent = 'Paso ' + (step + 1) + ' de ' + flows.length + ' · ' + f.querySelector('.flow-route').textContent + ': ' + flowText(f) + '.';
      playBtn.innerHTML = 'Siguiente <span aria-hidden="true">→</span>';
      if (window.innerWidth < 960) f.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    };
    showBtns.forEach(function (b) { b.addEventListener('click', function () { stopSteps(); setShow(b.dataset.circ); }); });
    document.querySelectorAll('[data-circ-step]').forEach(function (b) {
      b.addEventListener('click', function () {
        const d = Number(b.dataset.circStep);
        showStep(step < 0 ? (d > 0 ? 0 : flows.length - 1) : step + d);
      });
    });
  }
})();
