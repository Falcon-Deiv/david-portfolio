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

  /* ---------- Huecos de imagen ----------
     Cada .img-slot intenta cargar la imagen indicada en data-src
     (p. ej. assets/img/perfil.jpg). Si no existe, muestra un placeholder.
     Al pulsar el placeholder se puede elegir una imagen del ordenador
     para previsualizarla (solo en este navegador). */
  document.querySelectorAll('.img-slot').forEach(function (slot) {
    const src = slot.dataset.src;
    const label = slot.dataset.label || 'Imagen';

    function showImage(url) {
      slot.innerHTML = '';
      const img = new Image();
      img.alt = label;
      img.src = url;
      slot.appendChild(img);
    }

    function showPlaceholder() {
      slot.innerHTML = '';
      const ph = document.createElement('button');
      ph.type = 'button';
      ph.className = 'img-placeholder';
      ph.setAttribute('aria-label', 'Seleccionar imagen: ' + label);
      ph.innerHTML =
        '<span class="ph-icon" aria-hidden="true">🖼️</span>' +
        '<span class="ph-label"></span>' +
        '<span class="ph-hint">Pulsa para previsualizar o guarda el archivo en</span>' +
        '<code></code>';
      ph.querySelector('.ph-label').textContent = label;
      ph.querySelector('code').textContent = src;

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.hidden = true;
      input.addEventListener('change', function () {
        const file = input.files && input.files[0];
        if (file) showImage(URL.createObjectURL(file));
      });

      ph.addEventListener('click', function () { input.click(); });
      slot.appendChild(ph);
      slot.appendChild(input);
    }

    if (!src) { showPlaceholder(); return; }

    const probe = new Image();
    probe.onload = function () { showImage(src); };
    probe.onerror = showPlaceholder;
    probe.src = src;
  });
})();
