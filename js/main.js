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
  ['idea', 'sombrero', 'petalo', 'canvas', 'precio'].forEach(initSwitch);

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

  /* ---------- Idea de negocio: vela con mensaje oculto ---------- */
  const candle = document.getElementById('candle');
  const candleForm = document.getElementById('candle-form');
  if (candle && candleForm) {
    const msgInput = document.getElementById('candle-msg');
    const pool = document.getElementById('candle-letters');
    const candleBtn = candleForm.querySelector('button');
    const candleStatus = document.getElementById('candle-status');
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timers = [];

    function stopTimers() {
      timers.forEach(clearTimeout);
      timers = [];
    }

    function putOut() {
      stopTimers();
      candle.dataset.state = 'off';
      pool.textContent = '';
      msgInput.readOnly = false;
      candleBtn.textContent = 'Encender';
      candleStatus.textContent = 'Las letras están escondidas bajo la cera.';
    }

    function light() {
      const text = (msgInput.value.trim() || 'Ánimo').toUpperCase().slice(0, 12);
      pool.textContent = '';
      // Cada palabra va junta, para que las filas se corten entre palabras
      text.split(/\s+/).filter(Boolean).forEach(function (word) {
        const group = document.createElement('span');
        group.className = 'bead-word';
        Array.from(word).forEach(function (ch) {
          const bead = document.createElement('span');
          bead.className = 'bead';
          bead.textContent = ch;
          group.appendChild(bead);
        });
        pool.appendChild(group);
      });
      candle.dataset.state = 'lit';
      msgInput.readOnly = true;
      candleBtn.textContent = 'Apagar';
      candleStatus.textContent = 'Se está derritiendo la cera… (en la vida real, 30-45 minutos)';

      const beads = Array.from(pool.querySelectorAll('.bead'));
      const wait = reduceMotion ? 0 : 1500;
      const gap = reduceMotion ? 0 : 280;
      beads.forEach(function (bead, i) {
        timers.push(setTimeout(function () { bead.classList.add('is-shown'); }, wait + i * gap));
      });
      timers.push(setTimeout(function () {
        candle.dataset.state = 'done';
        candleStatus.textContent = 'Mensaje: «' + text + '». Apágala para probar otro.';
      }, wait + beads.length * gap + 300));
    }

    candleForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (candle.dataset.state === 'off') light(); else putOut();
    });

    candleForm.hidden = false;
    putOut();
  }
})();
