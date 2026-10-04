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

  /* ---------- Animación de aparición ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
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
})();
