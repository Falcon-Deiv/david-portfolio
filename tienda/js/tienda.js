/* =========================================================
   Chispa · tienda de velas (prototipo)
   Todo funciona en el navegador: no hay servidor ni pagos.
   ========================================================= */
(function () {
  'use strict';

  const T = window.TIENDA;
  const V = window.Velas;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.from((r || document).querySelectorAll(s)); };
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const byId = {};
  T.productos.forEach(function (p) { byId[p.id] = p; });

  /* ---------- Utilidades ---------- */
  const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
  function eur(n) { return money.format(n); }
  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  const store = {
    get: function (k, d) { try { const v = localStorage.getItem('chispa-' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('chispa-' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };
  const ICON = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    warn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>'
  };
  function velaSvg(p, extra) {
    return V.svg(Object.assign({ id: p.id, mecha: p.mecha, etiquetaTexto: p.nombre, titulo: extra && extra.titulo }, p.vela, extra || {}));
  }

  /* ---------- Aviso flotante ---------- */
  const toastEl = $('#toast');
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2800);
  }

  /* =========================================================
     Temporada actual (banner que cambia solo)
     ========================================================= */
  const SEASONS = {
    halloween: { nombre: 'Halloween', color: '#e07a2e', eyebrow: 'Temporada de Halloween', title: 'Noches de calabaza', sub: 'Calabazas, fantasmas y pócimas que huelen a otoño. Hechas a mano, una a una.', cta: 'Ver colección Halloween', href: '#/tematicas/halloween', velas: ['fantasmita', 'calabaza-especiada', 'pocima-de-bruja'], particulas: 'halloween' },
    navidad: { nombre: 'Navidad', color: '#3f6b4f', eyebrow: 'Temporada de Navidad', title: 'Que huela a Navidad', sub: 'Abetos nevados, galletas de jengibre y chocolate caliente con mecha de madera.', cta: 'Ver colección Navidad', href: '#/tematicas/navidad', velas: ['vino-especiado', 'abeto-nevado', 'chocolate-caliente'], particulas: 'nieve' },
    sanvalentin: { nombre: 'San Valentín', color: '#d9465f', eyebrow: 'San Valentín', title: 'Para decir te quiero', sub: 'Corazones, tartas para dos y copas para brindar. Y si quieres, con un mensaje escondido.', cta: 'Ver San Valentín', href: '#/tematicas/sanvalentin', velas: ['brindis', 'corazon', 'tarta-para-dos'], particulas: 'corazones' },
    pascua: { nombre: 'Pascua', color: '#9cc9b4', eyebrow: 'Pascua y primavera', title: 'Primavera en flor', sub: 'Huevos pintados, tarros de miel y tarta de zanahoria.', cta: 'Ver Pascua', href: '#/tematicas/pascua', velas: ['tarro-de-miel', 'huevo-pintado', 'tarta-de-zanahoria'], particulas: 'petalos' },
    dulce: { nombre: 'Gourmand', color: '#f29cb7', eyebrow: 'Colección gourmand', title: 'Para comerte a besos', sub: '(¡No a bocados!) Velas que parecen postres: batidos, cupcakes y donuts de cera.', cta: 'Ver los dulces', href: '#/colecciones/dulces', velas: ['donut-glaseado', 'batido-con-nata', 'cupcake-de-fresa'], particulas: 'fideos' }
  };
  function seasonNow(d) {
    const m = d.getMonth();
    const day = d.getDate();
    if (m === 9 || (m === 8 && day >= 20)) return 'halloween';
    if (m === 10 || m === 11 || (m === 0 && day <= 6)) return 'navidad';
    if (m === 1) return 'sanvalentin';
    if (m === 2 || m === 3) return 'pascua';
    return 'dulce';
  }
  const CURRENT_SEASON = seasonNow(new Date());

  /* ---------- Partículas ---------- */
  const PARTICLE_SVG = {
    bat: '<svg viewBox="0 0 40 20"><path d="M20 6c1-3 3-4 3-4s0 3 1 4c4-4 10-4 16-1-4 1-6 4-6 7-2-2-5-2-7 0-1-2-3-3-4-3s-3 1-4 3c-2-2-5-2-7 0 0-3-2-6-6-7 6-3 12-3 16 1 1-1 1-4 1-4s2 1 3 4z" fill="currentColor"/></svg>',
    leaf: '<svg viewBox="0 0 20 20"><path d="M10 1C4 6 3 12 10 19c7-7 6-13 0-18z" fill="currentColor"/></svg>',
    snow: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="currentColor"/></svg>',
    heart: '<svg viewBox="0 0 20 18"><path d="M10 17S1 11 1 5.5A4.5 4.5 0 0 1 10 3a4.5 4.5 0 0 1 9 2.5C19 11 10 17 10 17z" fill="currentColor"/></svg>',
    petal: '<svg viewBox="0 0 14 20"><ellipse cx="7" cy="10" rx="5" ry="9" fill="currentColor"/></svg>',
    sprinkle: '<svg viewBox="0 0 16 6"><rect width="16" height="6" rx="3" fill="currentColor"/></svg>'
  };
  function particles(kind) {
    const box = $('#hero-particles');
    if (!box) return;
    box.textContent = '';
    if (reduceMotion) return;
    const conf = {
      halloween: [['leaf', 14, 'fall', ['#c8642a', '#e39a3b', '#8a3b1d']], ['bat', 4, 'drift', ['#120c16']]],
      nieve: [['snow', 40, 'fall', ['#ffffff', '#e6efe9']]],
      corazones: [['heart', 18, 'rise', ['#e0607a', '#f29cb0', '#c0394f']]],
      petalos: [['petal', 22, 'fall', ['#f6c9d0', '#ffffff', '#f2dfa0']]],
      fideos: [['sprinkle', 30, 'fall', ['#f28ca0', '#7cc4e8', '#f6d55c', '#9ad18b', '#c49be8']]]
    }[kind] || [];
    let html = '';
    conf.forEach(function (c) {
      for (let i = 0; i < c[1]; i++) {
        const size = c[0] === 'snow' ? 4 + Math.random() * 8 : c[0] === 'bat' ? 34 + Math.random() * 20 : 10 + Math.random() * 12;
        const dur = c[2] === 'drift' ? 18 + Math.random() * 14 : 9 + Math.random() * 10;
        const style = [
          '--x:' + (Math.random() * 100).toFixed(1) + '%',
          '--y:' + (8 + Math.random() * 40).toFixed(1) + '%',
          '--s:' + size.toFixed(1) + 'px',
          '--d:' + dur.toFixed(1) + 's',
          '--delay:-' + (Math.random() * dur).toFixed(1) + 's',
          '--dx:' + ((Math.random() - 0.5) * 160).toFixed(0) + 'px',
          '--rot:' + ((Math.random() - 0.5) * 720).toFixed(0) + 'deg',
          'color:' + c[3][i % c[3].length],
          'opacity:' + (c[0] === 'snow' ? 0.4 + Math.random() * 0.5 : 0.85)
        ].join(';');
        const mod = c[2] === 'rise' ? ' particle--rise' : c[2] === 'drift' ? ' particle--drift' : '';
        html += '<span class="particle' + mod + '" style="' + style + '">' + PARTICLE_SVG[c[0]] + '</span>';
      }
    });
    box.innerHTML = html;
  }

  /* ---------- Banner ---------- */
  const hero = $('#hero');
  let heroSeason = null;
  function splitWords(text) {
    return text.split(' ').map(function (w, i) {
      return '<span class="w"><span style="animation-delay:' + (0.15 + i * 0.09).toFixed(2) + 's">' + esc(w) + '</span></span>';
    }).join(' ');
  }
  function setSeason(key, animate) {
    const s = SEASONS[key];
    if (!s || !hero || key === heroSeason) return;
    heroSeason = key;
    const text = $('.hero-text', hero);
    const apply = function () {
      hero.dataset.season = key;
      $('#hero-eyebrow').textContent = s.eyebrow;
      $('#hero-title').innerHTML = splitWords(s.title);
      $('#hero-title').setAttribute('aria-label', s.title);
      $('#hero-sub').textContent = s.sub;
      const cta = $('#hero-cta');
      cta.href = s.href;
      cta.innerHTML = esc(s.cta) + ' <span class="arrow" aria-hidden="true">→</span>';
      $$('.stage-candle', hero).forEach(function (slot, i) {
        const p = byId[s.velas[i]];
        slot.classList.remove('is-out');
        slot.innerHTML = '<a href="#/producto/' + p.id + '" aria-label="' + esc(p.nombre) + '">' + velaSvg(p, { encendida: true }) + '</a>';
      });
      particles(s.particulas);
      $$('.season-btn').forEach(function (b) {
        const on = b.dataset.season === key;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      text.classList.remove('is-swapping');
      // reinicia la animación de entrada del texto
      Array.from(text.children).forEach(function (c) { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; });
    };
    if (animate && !reduceMotion) {
      text.classList.add('is-swapping');
      $$('.stage-candle', hero).forEach(function (slot) { slot.classList.add('is-out'); });
      setTimeout(apply, 380);
    } else {
      apply();
    }
  }
  function initHero() {
    if (!hero) return;
    const order = ['halloween', 'navidad', 'sanvalentin', 'pascua', 'dulce'];
    $('#hero-seasons').innerHTML = order.map(function (k) {
      const s = SEASONS[k];
      return '<button type="button" class="season-btn" role="tab" data-season="' + k + '" aria-selected="false" style="--c:' + s.color + '"><i aria-hidden="true"></i>' + esc(s.nombre) + (k === CURRENT_SEASON ? ' <small>· ahora</small>' : '') + '</button>';
    }).join('');
    $$('.season-btn').forEach(function (b) {
      b.addEventListener('click', function () { setSeason(b.dataset.season, true); });
    });
    setSeason(CURRENT_SEASON, false);

    // Luz que sigue al ratón y relieve de las velas
    const glow = $('#hero-glow');
    const blocks = $$('.stage-block', hero);
    let tx = window.innerWidth * 0.6, ty = window.innerHeight * 0.4, gx = tx, gy = ty, mx = 0, my = 0, sy = 0;
    hero.addEventListener('pointermove', function (e) {
      const r = hero.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    });
    function frame() {
      if (!reduceMotion && heroVisible) {
        gx += (tx - gx) * 0.08;
        gy += (ty - gy) * 0.08;
        glow.style.transform = 'translate(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px)';
        blocks.forEach(function (b, i) {
          const depth = [14, 22, 30][i];
          b.style.transform = 'translate(' + (mx * -depth).toFixed(1) + 'px,' + (my * -depth * 0.5 + sy * (0.08 + i * 0.05)).toFixed(1) + 'px)';
        });
      }
      requestAnimationFrame(frame);
    }
    let heroVisible = true;
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }).observe(hero);
    window.addEventListener('scroll', function () { sy = Math.min(window.scrollY, 800); }, { passive: true });
    // Los bloques entran animados; el relieve empieza después
    setTimeout(function () { requestAnimationFrame(frame); }, 1300);
  }

  /* =========================================================
     Tarjetas de producto
     ========================================================= */
  let favs = new Set(store.get('favs', []));
  function card(p, i) {
    const fav = favs.has(p.id);
    const tags = (p.nuevo ? '<span class="tag tag--new">Nuevo</span>' : '') + (p.mecha === 'madera' ? '<span class="tag tag--wood">Mecha de madera</span>' : '');
    const media = p.caja
      ? '<div class="box-ill"><div class="box" style="--box:' + p.caja.color + ';--lazo:' + p.caja.lazo + '"></div>' + velaSvg(p, { encendida: true }) + '</div>'
      : velaSvg(p);
    return '<article class="card" style="--i:' + (i || 0) + '">' +
      '<div class="card-media">' + media + '<span class="shine"></span>' +
      '<a class="card-cover" href="#/producto/' + p.id + '" tabindex="-1" aria-hidden="true"></a>' +
      '<div class="tags">' + tags + '</div>' +
      '<button class="fav-btn' + (fav ? ' is-on' : '') + '" type="button" data-fav="' + p.id + '" aria-pressed="' + fav + '" aria-label="Guardar ' + esc(p.nombre) + ' en favoritos">' + ICON.heart + '</button>' +
      '<button class="quick-add" type="button" data-add="' + p.id + '">Añadir · ' + eur(p.precio) + '</button>' +
      '</div>' +
      '<div class="card-body"><div><h3 class="card-name"><a href="#/producto/' + p.id + '">' + esc(p.nombre) + '</a></h3><p class="card-aroma">' + esc(cardLine(p)) + '</p></div>' +
      '<span class="card-price">' + eur(p.precio) + '</span></div>' +
      '</article>';
  }
  // Bajo el nombre: el aroma, o la colección si el aroma se llama igual que la vela
  function cardLine(p) {
    if (norm(p.aroma) !== norm(p.nombre)) return p.aroma;
    const g = T.tematicas[p.sub] || T.colecciones[p.sub];
    return (g ? g.corto + ' · ' : '') + (p.mecha === 'madera' ? 'mecha de madera' : 'cera de soja');
  }
  function fillGrid(el, list) {
    el.innerHTML = list.length ? list.map(card).join('') : '<p class="empty">No hay velas con este filtro.</p>';
  }
  // Brillo que sigue al ratón dentro de la foto
  document.addEventListener('pointermove', function (e) {
    const c = e.target.closest && e.target.closest('.card');
    const m = c && c.querySelector('.card-media');
    if (!m) return;
    const r = m.getBoundingClientRect();
    m.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(0) + '%');
    m.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(0) + '%');
  }, { passive: true });

  /* =========================================================
     Carrito y favoritos
     ========================================================= */
  let cart = store.get('cart', []);
  const cartCount = $('#cart-count');
  const favCount = $('#fav-count');

  function saveCart() { store.set('cart', cart); renderCart(); }
  function cartTotal() { return cart.reduce(function (s, it) { return s + it.precio * it.qty; }, 0); }
  function bump(el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  function updateBadges(animate) {
    const n = cart.reduce(function (s, it) { return s + it.qty; }, 0);
    cartCount.textContent = n;
    cartCount.hidden = n === 0;
    favCount.textContent = favs.size;
    favCount.hidden = favs.size === 0;
    if (animate) bump(animate === 'fav' ? favCount : cartCount);
  }
  function flyToCart(fromEl) {
    const target = $('#open-cart');
    if (!fromEl || !target || reduceMotion || !document.body.animate) { updateBadges('cart'); return; }
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const dot = document.createElement('span');
    dot.className = 'fly-dot';
    dot.style.left = (a.left + a.width / 2) + 'px';
    dot.style.top = (a.top + a.height / 2) + 'px';
    document.body.appendChild(dot);
    const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    const dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    dot.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx * 0.5 + 'px,' + (dy - 120) + 'px) scale(1.3)', opacity: 1, offset: 0.5 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.4)', opacity: 0.6 }
    ], { duration: 750, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = function () { dot.remove(); updateBadges('cart'); };
  }
  function addToCart(item, fromEl) {
    const found = cart.find(function (it) { return it.key === item.key; });
    if (found) found.qty += item.qty || 1;
    else cart.push(Object.assign({ qty: 1 }, item));
    store.set('cart', cart);
    renderCart(true);
    flyToCart(fromEl);
    toast('Añadido al carrito: ' + item.nombre);
  }
  function addProduct(id, qty, fromEl) {
    const p = byId[id];
    if (!p) return;
    addToCart({ key: p.id, id: p.id, nombre: p.nombre, precio: p.precio, detalle: p.aroma, qty: qty || 1 }, fromEl);
  }
  function itemVela(it) {
    if (it.vela) return V.svg(Object.assign({ id: it.key }, it.vela));
    const p = byId[it.id];
    return p ? velaSvg(p) : '';
  }
  function renderCart(skipBadge) {
    const list = $('#cart-list');
    if (!cart.length) {
      list.innerHTML = '<li class="drawer-empty">' + V.svg({ id: 'vacio', forma: 'vaso', cristal: 'ambar', etiqueta: false }) + 'Tu carrito está vacío.<br><a class="link" href="#/colecciones/dulces" data-close-drawers>Ver velas</a></li>';
    } else {
      list.innerHTML = cart.map(function (it, i) {
        return '<li class="drawer-item" style="animation-delay:' + i * 40 + 'ms"><div class="thumb">' + itemVela(it) + '</div>' +
          '<div><h3>' + esc(it.nombre) + '</h3><p>' + esc(it.detalle || '') + '</p>' +
          '<div class="qty"><button type="button" data-qty="-1" data-key="' + esc(it.key) + '" aria-label="Quitar una">−</button><output>' + it.qty + '</output><button type="button" data-qty="1" data-key="' + esc(it.key) + '" aria-label="Añadir una">+</button></div></div>' +
          '<div><span class="price">' + eur(it.precio * it.qty) + '</span><button class="remove" type="button" data-remove="' + esc(it.key) + '">Quitar</button></div></li>';
      }).join('');
    }
    const total = cartTotal();
    $('#cart-total').textContent = eur(total);
    const left = T.envioGratis - total;
    $('#ship-text').textContent = total === 0 ? 'Envío gratis a partir de ' + eur(T.envioGratis) + '.' : left > 0 ? 'Te faltan ' + eur(left) + ' para el envío gratis.' : '¡Tienes el envío gratis!';
    $('#ship-fill').style.width = Math.min(100, total / T.envioGratis * 100) + '%';
    $('#checkout').disabled = !cart.length;
    if (!skipBadge) updateBadges();
  }
  $('#cart-list').addEventListener('click', function (e) {
    const q = e.target.closest('[data-qty]');
    const r = e.target.closest('[data-remove]');
    if (q) {
      const it = cart.find(function (x) { return x.key === q.dataset.key; });
      if (!it) return;
      it.qty += Number(q.dataset.qty);
      if (it.qty <= 0) cart = cart.filter(function (x) { return x !== it; });
      saveCart();
    } else if (r) {
      cart = cart.filter(function (x) { return x.key !== r.dataset.remove; });
      saveCart();
    }
  });
  $('#checkout').addEventListener('click', function () {
    toast('Esto es un prototipo: aquí terminaría la compra. ¡Gracias por probarla!');
  });

  function toggleFav(id, btn) {
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    store.set('favs', Array.from(favs));
    $$('[data-fav="' + id + '"]').forEach(function (b) {
      const on = favs.has(id);
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
      if (b.classList.contains('fav-btn') || b.classList.contains('fav-btn-big')) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
    });
    updateBadges('fav');
    renderFavs();
    if (btn) toast(favs.has(id) ? 'Guardada en favoritos' : 'Quitada de favoritos');
  }
  function renderFavs() {
    const list = $('#fav-list');
    const items = Array.from(favs).map(function (id) { return byId[id]; }).filter(Boolean);
    list.innerHTML = items.length ? items.map(function (p) {
      return '<li class="drawer-item"><div class="thumb">' + velaSvg(p) + '</div><div><h3><a href="#/producto/' + p.id + '" data-close-drawers>' + esc(p.nombre) + '</a></h3><p>' + esc(p.aroma) + '</p>' +
        '<button class="remove" type="button" data-fav="' + p.id + '">Quitar</button></div><div><span class="price">' + eur(p.precio) + '</span><button class="remove" type="button" data-add="' + p.id + '">Añadir</button></div></li>';
    }).join('') : '<li class="drawer-empty">Aún no has guardado ninguna vela. Pulsa el corazón de las que te gusten.</li>';
  }

  // Clics generales: añadir, favoritos, cerrar cajones al navegar
  document.addEventListener('click', function (e) {
    const add = e.target.closest('[data-add]');
    if (add) { e.preventDefault(); addProduct(add.dataset.add, 1, add); return; }
    const fav = e.target.closest('[data-fav]');
    if (fav) { e.preventDefault(); toggleFav(fav.dataset.fav, fav); return; }
    if (e.target.closest('[data-close-drawers]')) closeAll();
    const soon = e.target.closest('[data-soon]');
    if (soon) toast(soon.dataset.soon + ': aún no tenemos perfil, el proyecto está en la fase 1.');
  });

  /* =========================================================
     Cajones, buscador y menús
     ========================================================= */
  const backdrop = $('#backdrop');
  let openPanel = null;
  let lastFocus = null;
  function openLayer(el) {
    if (openPanel === el) return;
    closeAll(true);
    lastFocus = document.activeElement;
    el.hidden = false;
    el.classList.remove('is-closing');
    backdrop.hidden = false;
    document.body.classList.add('is-locked');
    openPanel = el;
    const f = el.querySelector('input, button, a');
    if (f) setTimeout(function () { f.focus(); }, 60);
  }
  function closeAll(instant) {
    $('#account-pop').hidden = true;
    if (!openPanel) return;
    const el = openPanel;
    openPanel = null;
    document.body.classList.remove('is-locked');
    backdrop.hidden = true;
    if (instant || reduceMotion) { el.hidden = true; return; }
    el.classList.add('is-closing');
    setTimeout(function () { el.hidden = true; el.classList.remove('is-closing'); }, 280);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  backdrop.addEventListener('click', function () { closeAll(); });
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { closeAll(); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAll(); closeDrops(); }
    // Mantiene el foco dentro del cajón abierto
    if (e.key === 'Tab' && openPanel) {
      const f = $$('a[href], button:not([disabled]), input, select, textarea', openPanel).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  $('#open-cart').addEventListener('click', function () { renderCart(); openLayer($('#cart-drawer')); });
  $('#open-favs').addEventListener('click', function () { renderFavs(); openLayer($('#fav-drawer')); });
  $('#open-search').addEventListener('click', function () { openLayer($('#search')); runSearch(''); });
  $('#burger').addEventListener('click', function () { openLayer($('#menu-drawer')); });
  $('#open-account').addEventListener('click', function (e) {
    e.stopPropagation();
    const pop = $('#account-pop');
    pop.hidden = !pop.hidden;
  });
  document.addEventListener('click', function (e) {
    const pop = $('#account-pop');
    if (!pop.hidden && !pop.contains(e.target)) pop.hidden = true;
  });

  // Buscador
  const searchInput = $('#search-input');
  function runSearch(q) {
    const out = $('#search-results');
    const n = norm(q.trim());
    let list;
    if (!n) {
      list = ['calabaza-especiada', 'cafe-con-espumita', 'donut-glaseado', 'campo-de-lavanda', 'bosque-de-pinos', 'cuarzo-rosa'].map(function (id) { return byId[id]; });
    } else {
      list = T.productos.filter(function (p) {
        const sub = (T.tematicas[p.sub] || T.colecciones[p.sub] || {}).nombre || '';
        return norm([p.nombre, p.aroma, sub, p.notas.join(' '), p.vela.forma, p.mecha === 'madera' ? 'mecha de madera' : ''].join(' ')).indexOf(n) !== -1;
      }).slice(0, 12);
    }
    out.innerHTML = (n ? '' : '<li class="none">Lo más buscado:</li>') + (list.length ? list.map(function (p, i) {
      return '<li><a href="#/producto/' + p.id + '" data-close-drawers style="--i:' + i + '">' + velaSvg(p) + '<span><strong>' + esc(p.nombre) + '</strong><span>' + esc(p.aroma) + ' · ' + eur(p.precio) + '</span></span></a></li>';
    }).join('') : '<li class="none">No encontramos nada con «' + esc(q) + '». Prueba con «canela» o «taza».</li>');
  }
  searchInput.addEventListener('input', function () { runSearch(searchInput.value); });

  /* ---------- Menús desplegables ---------- */
  function fillDrops() {
    const temLinks = Object.keys(T.tematicas).map(function (k) {
      const t = T.tematicas[k];
      const n = T.productos.filter(function (p) { return p.sub === k; }).length;
      return '<li><a href="#/tematicas/' + k + '"><span class="dot" style="background:' + t.color + '"></span>' + esc(t.nombre) + '<small>' + n + '</small></a></li>';
    }).join('');
    $('#drop-tem-links').innerHTML = temLinks;
    const colColors = { dulces: '#f29cb7', salados: '#e6b85c', naturaleza: '#8fb08a', zodiaco: '#3c3566', mistica: '#9a72c4', escultorica: '#d6c3aa' };
    $('#drop-col-links').innerHTML = Object.keys(T.colecciones).map(function (k) {
      const c = T.colecciones[k];
      const n = T.productos.filter(function (p) { return p.sub === k; }).length;
      return '<li><a href="#/colecciones/' + k + '"><span class="dot" style="background:' + colColors[k] + '"></span>' + esc(c.nombre) + '<small>' + n + '</small></a></li>';
    }).join('');
    const temKey = T.tematicas[CURRENT_SEASON] ? CURRENT_SEASON : 'halloween';
    const fp = byId[SEASONS[temKey].velas[1]];
    const ft = $('#drop-tem-feature');
    ft.href = '#/tematicas/' + temKey;
    ft.innerHTML = velaSvg(fp, { encendida: true }) + '<strong>' + esc(T.tematicas[temKey].corto) + '</strong><span>Temporada actual</span>';
    $('#drop-col-feature').innerHTML = velaSvg(byId['batido-con-nata'], { encendida: true }) + '<strong>Para comerte a besos</strong><span>Dulces y repostería</span>';

    // Menú del móvil
    $('#m-nav').innerHTML =
      '<a href="#/">Inicio</a>' +
      '<details><summary>Temáticas</summary>' + Object.keys(T.tematicas).map(function (k) { return '<a href="#/tematicas/' + k + '">' + esc(T.tematicas[k].nombre) + '</a>'; }).join('') + '</details>' +
      '<details><summary>Colecciones</summary>' + Object.keys(T.colecciones).map(function (k) { return '<a href="#/colecciones/' + k + '">' + esc(T.colecciones[k].nombre) + '</a>'; }).join('') + '</details>' +
      '<a href="#/mecha-de-madera">Mecha de madera</a><a href="#/crea-tu-vela">Crea tu vela</a><a href="#/regalos">Regalos</a><a href="#/nosotros">Sobre nosotros</a><a href="#/contacto">Contacto</a>' +
      '<a class="m-back" href="../index.html#idea-negocio">← Volver al portfolio</a>';
    $('#m-nav').addEventListener('click', function (e) { if (e.target.closest('a')) closeAll(true); });
  }
  let dropTimer = null;
  function closeDrops(except) {
    $$('.has-drop').forEach(function (li) {
      if (li === except) return;
      li.classList.remove('is-open');
      $('button', li).setAttribute('aria-expanded', 'false');
    });
  }
  function openDrop(li) {
    closeDrops(li);
    li.classList.add('is-open');
    $('button', li).setAttribute('aria-expanded', 'true');
  }
  $$('.has-drop').forEach(function (li) {
    const btn = $('button', li);
    btn.addEventListener('click', function () {
      if (li.classList.contains('is-open')) closeDrops(); else openDrop(li);
    });
    li.addEventListener('mouseenter', function () {
      if (!window.matchMedia('(hover: hover)').matches) return;
      clearTimeout(dropTimer);
      openDrop(li);
    });
    li.addEventListener('mouseleave', function () {
      if (!window.matchMedia('(hover: hover)').matches) return;
      dropTimer = setTimeout(function () { closeDrops(); }, 180);
    });
    li.addEventListener('click', function (e) { if (e.target.closest('a')) closeDrops(); });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.has-drop')) closeDrops(); });

  /* ---------- Cabecera al hacer scroll ---------- */
  const hdr = $('#hdr');
  let lastY = 0;
  window.addEventListener('scroll', function () {
    const y = window.scrollY;
    hdr.classList.toggle('is-scrolled', y > 10);
    const down = y > lastY && y > 420;
    const anyOpen = $$('.has-drop.is-open').length > 0;
    hdr.classList.toggle('is-hidden', down && !anyOpen);
    lastY = y;
  }, { passive: true });

  /* =========================================================
     Sonido de la mecha de madera (se genera, no es un archivo)
     ========================================================= */
  const Sound = (function () {
    let ctx = null, master = null, noise = null, bed = null, timer = null;
    let on = false;
    const listeners = [];
    function init() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return true;
    }
    function pop() {
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1200 + Math.random() * 4200;
      bp.Q.value = 0.7 + Math.random() * 2.5;
      const g = ctx.createGain();
      const peak = 0.12 + Math.random() * 0.55;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.015 + Math.random() * 0.07);
      src.connect(bp); bp.connect(g); g.connect(master);
      src.start(t, Math.random() * 1.5, 0.12);
      listeners.forEach(function (fn) { fn(peak); });
    }
    function loop() {
      if (!on) return;
      const burst = Math.random() < 0.22 ? 2 + Math.floor(Math.random() * 4) : 1;
      for (let k = 0; k < burst; k++) setTimeout(function () { if (on) pop(); }, k * (12 + Math.random() * 35));
      timer = setTimeout(loop, 50 + Math.random() * 330);
    }
    function start() {
      if (!ctx && !init()) return false;
      ctx.resume();
      on = true;
      const src = ctx.createBufferSource();
      src.buffer = noise;
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 420;
      const g = ctx.createGain();
      g.gain.value = 0.07;
      src.connect(lp); lp.connect(g); g.connect(master);
      src.start();
      bed = src;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.7, ctx.currentTime, 0.25);
      loop();
      return true;
    }
    function stop() {
      on = false;
      clearTimeout(timer);
      if (!ctx) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
      if (bed) { try { bed.stop(ctx.currentTime + 0.6); } catch (e) { /* ya parado */ } bed = null; }
    }
    return { start: start, stop: stop, isOn: function () { return on; }, onPop: function (fn) { listeners.push(fn); } };
  })();
  function syncSoundButtons() {
    const on = Sound.isOn();
    $$('[data-sound]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(on));
      const l = $('.sound-label', b);
      if (l) l.textContent = on ? 'Parar el sonido' : (b.dataset.label || l.textContent);
    });
    $('#wood-feature').classList.toggle('is-playing', on);
  }
  $$('[data-sound]').forEach(function (b) {
    const l = $('.sound-label', b);
    if (l) b.dataset.label = l.textContent;
    b.addEventListener('click', function () {
      if (Sound.isOn()) Sound.stop();
      else if (!Sound.start()) toast('Tu navegador no permite generar el sonido.');
      syncSoundButtons();
    });
  });

  /* ---------- Chispas (canvas) ---------- */
  function initSparks() {
    const canvas = $('#wood-sparks');
    const section = $('#wood-feature');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, visible = false, sparks = [];
    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.width = section.clientWidth * dpr;
      h = canvas.height = section.clientHeight * dpr;
    }
    function origin() {
      const flame = $('.v-flame', $('#wood-candle'));
      const sr = section.getBoundingClientRect();
      if (!flame) return { x: w * 0.3, y: h * 0.4 };
      const fr = flame.getBoundingClientRect();
      return { x: (fr.left + fr.width / 2 - sr.left) * dpr, y: (fr.top + fr.height * 0.4 - sr.top) * dpr };
    }
    function spawn(n, power) {
      const o = origin();
      for (let i = 0; i < n; i++) {
        sparks.push({ x: o.x + (Math.random() - 0.5) * 10 * dpr, y: o.y, vx: (Math.random() - 0.5) * 2.4 * dpr * power, vy: -(1.5 + Math.random() * 3.5) * dpr * power, life: 1, r: (0.8 + Math.random() * 1.8) * dpr });
      }
    }
    Sound.onPop(function (peak) { if (visible) spawn(Math.round(2 + peak * 10), 0.8 + peak * 1.4); });
    function tick() {
      if (visible) {
        ctx.clearRect(0, 0, w, h);
        if (Math.random() < 0.08) spawn(1, 0.6); // brasas suaves siempre
        sparks = sparks.filter(function (s) { return s.life > 0; });
        sparks.forEach(function (s) {
          s.x += s.vx + Math.sin(s.y / (30 * dpr)) * 0.3 * dpr;
          s.y += s.vy;
          s.vy *= 0.985;
          s.life -= 0.012;
          ctx.beginPath();
          ctx.fillStyle = 'rgba(255,' + Math.round(150 + 80 * s.life) + ',80,' + Math.max(0, s.life).toFixed(2) + ')';
          ctx.shadowColor = 'rgba(255,170,60,.8)';
          ctx.shadowBlur = 8 * dpr;
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      requestAnimationFrame(tick);
    }
    size();
    window.addEventListener('resize', size);
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) size(); }).observe(section);
    requestAnimationFrame(tick);
  }

  /* =========================================================
     Inicio: carrusel, crea, fiestas, mensaje oculto
     ========================================================= */
  function initCarousel(track) {
    const bar = $('#' + track.id.replace('-track', '-progress'));
    const prev = $('[data-carousel-prev="' + track.id + '"]');
    const next = $('[data-carousel-next="' + track.id + '"]');
    function step() { const c = track.firstElementChild; return c ? c.getBoundingClientRect().width + 22 : 300; }
    function update() {
      const max = track.scrollWidth - track.clientWidth;
      if (bar) {
        bar.style.width = (track.clientWidth / track.scrollWidth * 100) + '%';
        bar.style.marginLeft = (track.scrollLeft / track.scrollWidth * 100) + '%';
      }
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step() * 2, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step() * 2, behavior: 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    // Arrastrar con el ratón
    let down = false, startX = 0, startL = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startL = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6 && !moved) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      if (moved) {
        track.classList.remove('is-dragging');
        const s = step();
        track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: 'smooth' });
      }
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    update();
  }

  function initHome() {
    const besos = T.productos.filter(function (p) { return p.comestible; });
    const track = $('#besos-track');
    track.innerHTML = besos.map(card).join('');
    initCarousel(track);

    $('#wood-candle').innerHTML = V.svg({ id: 'wood-big', forma: 'vaso', cristal: 'negro', cera: '#efe6d6', mecha: 'madera', encendida: true, etiquetaTexto: 'Chimenea' });

    // Fiestas
    const fiestas = [
      ['halloween', '#3b2a4d', '#fff', 'calabaza-especiada'],
      ['navidad', '#2e5040', '#fff', 'abeto-nevado'],
      ['pascua', '#dbe9d6', '#2f3d2a', 'huevo-pintado'],
      ['sanvalentin', '#f1c9cf', '#4a1f2a', 'corazon'],
      ['misticas', '#2c3157', '#fff', 'fases-de-la-luna']
    ];
    $('#fiesta-grid').innerHTML = fiestas.map(function (f, i) {
      const t = T.tematicas[f[0]];
      return '<a class="fiesta" data-reveal style="--i:' + i + ';--bg:' + f[1] + ';--fg:' + f[2] + '" href="#/tematicas/' + f[0] + '">' + velaSvg(byId[f[3]]) + '<h3>' + esc(t.corto) + '</h3><span>' + esc(t.aromas.slice(0, 2).join(' · ')) + '</span></a>';
    }).join('');

    // Crea tu vela: va cambiando de diseño
    const designs = [
      { forma: 'taza', cera: '#c8ead9', envase: '#f6c9d0', toppings: ['nata'], tag: 'Taza · Menta · Nata' },
      { forma: 'copa', cera: '#5b3a8c', toppings: ['purpurina'], tag: 'Copa · Pócima · Purpurina' },
      { forma: 'tarta', cera: '#f6c9d0', toppings: ['fresas', 'nata'], tag: 'Tarta · Rosa · Fresas' },
      { forma: 'calabaza', cera: '#e8772e', mecha: 'madera', tag: 'Calabaza · Mecha de madera' },
      { forma: 'tarro', cera: '#9db7de', toppings: ['signo'], glyph: '♒', tag: 'Tarro · Aire · Tu signo' }
    ];
    let di = 0;
    const promo = $('#crea-promo-candle');
    const tag = $('#crea-promo-tag');
    function showDesign() {
      const d = designs[di % designs.length];
      promo.innerHTML = V.svg(Object.assign({ id: 'promo' + di, encendida: true }, d));
      tag.textContent = d.tag;
      tag.style.animation = 'none'; void tag.offsetWidth; tag.style.animation = '';
      di++;
    }
    showDesign();
    let promoVisible = false;
    new IntersectionObserver(function (en) { promoVisible = en[0].isIntersecting; }).observe(promo);
    if (!reduceMotion) setInterval(function () { if (promoVisible && document.visibilityState === 'visible') showDesign(); }, 2600);

    // Mensaje oculto
    $('#secreto-candle').innerHTML = V.svg({ id: 'secreto', forma: 'vaso', cristal: 'claro', cera: '#f6ead6', encendida: true, etiquetaTexto: 'Te quiero', toppings: [] });
    $('#secreto-letters').innerHTML = Array.from('TEQUIERO').map(function (ch, i) { return '<span style="--i:' + i + '">' + ch + '</span>'; }).join('');
  }

  /* =========================================================
     Páginas
     ========================================================= */
  function chipsHtml(keys, source, active, base) {
    return keys.map(function (k) {
      const n = T.productos.filter(function (p) { return p.sub === k; }).length;
      const c = source[k].color;
      return '<a class="chip' + (k === active ? ' is-active' : '') + '" role="tab" aria-selected="' + (k === active) + '" href="' + base + k + '">' + (c ? '<span class="dot" style="background:' + c + '"></span>' : '') + esc(source[k].corto) + ' <span class="n">' + n + '</span></a>';
    }).join('');
  }
  function introHtml(o) {
    return '<div><h2>' + esc(o.nombre) + '</h2><p>' + esc(o.desc) + '</p></div><div class="aromas"><p class="aromas-title">Aromas</p>' + o.aromas.map(function (a) { return '<span>' + esc(a) + '</span>'; }).join('') + '</div>';
  }

  function renderTematicas(sub) {
    if (!T.tematicas[sub]) sub = T.tematicas[CURRENT_SEASON] ? CURRENT_SEASON : 'halloween';
    const t = T.tematicas[sub];
    $('#tem-chips').innerHTML = chipsHtml(Object.keys(T.tematicas), T.tematicas, sub, '#/tematicas/');
    $('#tem-intro').innerHTML = introHtml(t);
    restart($('#tem-intro'));
    const head = $('#tem-head');
    head.style.setProperty('--theme-1', V.shade(t.color, -0.55));
    head.style.setProperty('--theme-2', V.shade(t.color, -0.2));
    fillGrid($('#tem-grid'), T.productos.filter(function (p) { return p.grupo === 'tematicas' && p.sub === sub; }));
    document.title = t.nombre + ' · Chispa';
  }

  let wheelAngle = 0;
  function renderColecciones(sub) {
    if (!T.colecciones[sub]) sub = 'dulces';
    const c = T.colecciones[sub];
    $('#col-chips').innerHTML = chipsHtml(Object.keys(T.colecciones), T.colecciones, sub, '#/colecciones/');
    $('#col-intro').innerHTML = introHtml(c);
    restart($('#col-intro'));
    fillGrid($('#col-grid'), T.productos.filter(function (p) { return p.grupo === 'colecciones' && p.sub === sub; }));
    $('#zodiac').hidden = sub !== 'zodiaco';
    if (sub === 'zodiaco') renderZodiac();
    document.title = c.nombre + ' · Chispa';
  }
  function renderZodiac() {
    const wheel = $('#zodiac-wheel');
    if (!wheel.dataset.ready) {
      wheel.innerHTML = T.signos.map(function (s, i) {
        const el = T.elementos[s.elemento];
        return '<button type="button" class="z-sign" style="--a:' + (i * 30) + 'deg;--c:' + el.color + '" data-sign="' + i + '" aria-label="' + s.nombre + '">' + s.glifo + '&#xFE0E;</button>';
      }).join('') + '<div class="zodiac-center" id="zodiac-center"></div>';
      wheel.dataset.ready = '1';
      wheel.addEventListener('click', function (e) {
        const b = e.target.closest('[data-sign]');
        if (b) pickSign(Number(b.dataset.sign));
      });
    }
    pickSign(Number(wheel.dataset.sign || 0), true);
  }
  function pickSign(i, first) {
    const wheel = $('#zodiac-wheel');
    const s = T.signos[i];
    const el = T.elementos[s.elemento];
    const p = byId[el.producto];
    // gira por el camino más corto para dejar el signo arriba
    const target = -i * 30;
    let delta = ((target - wheelAngle) % 360 + 540) % 360 - 180;
    if (first && !wheel.dataset.sign) delta = target - wheelAngle;
    wheelAngle += delta;
    wheel.dataset.sign = i;
    wheel.style.setProperty('--wheel', wheelAngle + 'deg');
    wheel.style.transform = 'rotate(' + wheelAngle + 'deg)';
    $$('.z-sign', wheel).forEach(function (b, j) { b.classList.toggle('is-active', j === i); b.setAttribute('aria-pressed', String(j === i)); });
    $('#zodiac-center').innerHTML = V.svg({ id: 'zc' + i, forma: 'lata', envase: el.color, cera: '#f4ece2', glyph: s.glifo, encendida: true });
    $('#zodiac-info').innerHTML = '<p class="eyebrow eyebrow--light">Tu vela según tu signo</p><h3>' + s.glifo + '&#xFE0E; ' + esc(s.nombre) + '</h3>' +
      '<p>Signo de <strong>' + el.nombre.toLowerCase() + '</strong>. Su vela lleva el color de su elemento y huele a <strong>' + el.aroma.toLowerCase() + '</strong>.</p>' +
      '<p><a class="btn btn-solid" href="#/producto/' + p.id + '">Ver la ' + esc(p.nombre.toLowerCase()) + ' <span class="arrow" aria-hidden="true">→</span></a></p>';
    restart($('#zodiac-info'));
  }

  let maderaFilter = 'todas';
  function renderMadera() {
    if (!$('#mad-head-candle').innerHTML) {
      $('#mad-head-candle').innerHTML = V.svg({ id: 'madhead', forma: 'taza', envase: '#efe6da', cera: '#6b3b26', toppings: ['nubes'], mecha: 'madera', encendida: true });
    }
    const opts = [['todas', 'Todas']].concat(Object.keys(T.madera).map(function (k) { return [k, T.madera[k].nombre]; }));
    $('#mad-filters').innerHTML = opts.map(function (o) {
      return '<button type="button" class="chip' + (o[0] === maderaFilter ? ' is-active' : '') + '" aria-pressed="' + (o[0] === maderaFilter) + '" data-mfilter="' + o[0] + '">' + esc(o[1]) + '</button>';
    }).join('');
    const list = T.productos.filter(function (p) { return p.mecha === 'madera' && (maderaFilter === 'todas' || p.maderaGrupo === maderaFilter); });
    fillGrid($('#mad-grid'), list);
    document.title = 'Mecha de madera · Chispa';
  }
  $('#mad-filters').addEventListener('click', function (e) {
    const b = e.target.closest('[data-mfilter]');
    if (!b) return;
    maderaFilter = b.dataset.mfilter;
    renderMadera();
  });
  // Pestañas de "¿Por qué mecha de madera?"
  (function () {
    const tabs = $$('.why-tab');
    function act(t, focus) {
      tabs.forEach(function (x) {
        const on = x === t;
        x.classList.toggle('is-active', on);
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        $('#' + x.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { act(t); });
      t.addEventListener('keydown', function (e) {
        const n = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (n) { e.preventDefault(); act(tabs[(i + n + tabs.length) % tabs.length], true); }
      });
    });
  })();

  /* ---------- Ficha de producto ---------- */
  function renderProducto(id) {
    const p = byId[id];
    const box = $('#product');
    if (!p) { box.innerHTML = '<p class="empty">No encontramos esa vela. <a class="link" href="#/">Volver al inicio</a></p>'; return; }
    const grupo = p.grupo === 'tematicas' ? ['Temáticas', '#/tematicas/' + p.sub, T.tematicas[p.sub].corto] : p.grupo === 'colecciones' ? ['Colecciones', '#/colecciones/' + p.sub, T.colecciones[p.sub].corto] : ['Regalos', '#/regalos', 'Cajas y packs'];
    const fav = favs.has(p.id);
    const madera = p.mecha === 'madera';
    const notas = p.notas.filter(Boolean);
    const related = T.productos.filter(function (x) { return x.sub === p.sub && x.id !== p.id; }).concat(T.productos.filter(function (x) { return x.grupo === p.grupo && x.sub !== p.sub; })).slice(0, 4);
    box.innerHTML =
      '<div class="product">' +
      '<p class="crumbs"><a href="#/">Inicio</a> / <a href="' + grupo[1] + '">' + grupo[0] + '</a> / ' + esc(grupo[2]) + '</p>' +
      '<div class="gallery"><div class="gallery-main" id="g-main">' + velaSvg(p, { encendida: true, titulo: p.nombre }) + '</div>' +
      '<div class="gallery-thumbs" role="group" aria-label="Vistas">' +
      '<button type="button" class="is-active" data-g="lit">Encendida</button><button type="button" data-g="off">Apagada</button><button type="button" data-g="zoom">De cerca</button><button type="button" data-g="scene">En casa</button></div></div>' +
      '<div class="p-info">' +
      '<div class="tags" style="position:static;flex-direction:row;margin-bottom:12px">' + (p.nuevo ? '<span class="tag tag--new">Nuevo</span>' : '') + (madera ? '<span class="tag tag--wood">Mecha de madera</span>' : '') + '</div>' +
      '<h1>' + esc(p.nombre) + '</h1>' +
      '<p class="p-price">' + eur(p.precio) + '</p>' +
      '<p class="p-aroma">Aroma: <strong>' + esc(p.aroma) + '</strong>' + (p.signos ? ' · ' + esc(p.signos) : '') + (p.intencion ? ' · Intención: ' + esc(p.intencion) : '') + '</p>' +
      (p.comestible ? '<p class="warn">' + ICON.warn + '¡Precaución! Aunque parezca delicioso, NO ES COMESTIBLE.</p>' : '') +
      '<p class="p-desc">' + esc(p.desc) + '</p>' +
      '<div class="wick-badge"><div><strong>' + (madera ? 'Mecha de madera' : 'Mecha de algodón puro') + '</strong><span>' + (madera ? 'Cruje como una chimenea pequeña.' : 'Llama tranquila y sin humo.') + '</span></div>' +
      (madera ? '<button class="sound-btn" type="button" data-sound aria-pressed="' + Sound.isOn() + '"><span class="sound-ico" aria-hidden="true"><svg class="i-play" viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg><svg class="i-pause" viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg></span><span class="sound-label">Escuchar</span></button>' : '') + '</div>' +
      '<div class="buy"><div class="qty"><button type="button" data-pq="-1" aria-label="Una menos">−</button><output id="p-qty">1</output><button type="button" data-pq="1" aria-label="Una más">+</button></div>' +
      '<button class="btn btn-solid" type="button" id="p-add">Añadir al carrito</button>' +
      '<button class="round-btn fav-btn-big' + (fav ? ' is-on' : '') + '" type="button" data-fav="' + p.id + '" aria-pressed="' + fav + '" aria-label="Guardar en favoritos">' + ICON.heart + '</button></div>' +
      '<div class="acc">' +
      '<details open><summary>Pirámide olfativa</summary><div><div class="pyramid">' +
      '<div><small>Salida</small><span>' + esc(notas[0] || '') + '</span></div><div><small>Corazón</small><span>' + esc(notas[1] || '') + '</span></div><div><small>Fondo</small><span>' + esc(notas[2] || '') + '</span></div>' +
      '</div></div></details>' +
      '<details><summary>Ingredientes y materiales</summary><div><ul>' +
      '<li>Cera vegetal de soja' + (p.vela.forma === 'tarro' || p.vela.forma === 'huevo' ? ' y cera de abeja' : '') + '.</li>' +
      '<li>' + (madera ? 'Mecha de madera natural, que chasquea como una chimenea.' : 'Mecha de algodón puro.') + '</li>' +
      '<li>Aceites aromáticos libres de ftalatos y colorantes ecológicos.</li>' +
      (['taza', 'copa', 'tarro', 'vaso', 'lata'].indexOf(p.vela.forma) !== -1 ? '<li>Envase reutilizable: cuando se acabe, límpialo y úsalo en casa.</li>' : '<li>Figura sin envase: hecha a mano en molde.</li>') +
      '</ul></div></details>' +
      '<details><summary>Instrucciones de quemado</summary><div><ul>' +
      (madera ? '<li>Antes de encenderla, quita la parte quemada de la madera.</li>' : '<li>Corta la mecha a unos 5 mm antes de cada uso.</li>') +
      '<li>La primera vez, déjala encendida hasta que toda la superficie esté líquida.</li>' +
      ((p.vela.toppings && p.vela.toppings.length) || ['calabaza', 'arbol', 'huevo', 'corazon', 'cupcake', 'donut', 'fantasma', 'burbujas', 'arco', 'esfera', 'gemas', 'tarta'].indexOf(p.vela.forma) !== -1 ? '<li>Lleva toppings o no tiene envase: ponla siempre sobre un plato protector.</li>' : '') +
      '<li>Como mucho 3-4 horas seguidas y nunca sin vigilar.</li>' +
      '</ul></div></details>' +
      '</div></div></div>' +
      '<section class="related"><h2 class="sec-title">También te puede gustar</h2><div class="grid" id="related-grid"></div></section>';
    fillGrid($('#related-grid'), related);
    document.title = p.nombre + ' · Chispa';

    // Vistas de la galería
    const main = $('#g-main');
    $$('[data-g]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-g]', box).forEach(function (x) { x.classList.toggle('is-active', x === b); });
        const svg = $('.vela', main);
        svg.classList.toggle('is-lit', b.dataset.g !== 'off');
        main.classList.toggle('is-zoom', b.dataset.g === 'zoom');
        main.classList.toggle('is-scene', b.dataset.g === 'scene');
      });
    });
    let qty = 1;
    $$('[data-pq]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        qty = Math.max(1, Math.min(20, qty + Number(b.dataset.pq)));
        $('#p-qty').textContent = qty;
      });
    });
    $('#p-add').addEventListener('click', function (e) { addProduct(p.id, qty, e.currentTarget); });
    $$('[data-sound]', box).forEach(function (b) {
      b.dataset.label = 'Escuchar';
      b.addEventListener('click', function () {
        if (Sound.isOn()) Sound.stop(); else Sound.start();
        syncSoundButtons();
      });
    });
  }

  /* ---------- Regalos ---------- */
  function renderRegalos() {
    if (!$('#gift-mini').innerHTML) {
      $('#gift-mini').innerHTML = ['#f6c9d0', '#c8ead9', '#f2dfa0'].map(function (c, i) {
        return V.svg({ id: 'mini' + i, forma: 'tarta', cera: c, toppings: i === 1 ? ['fideos'] : ['nata'] });
      }).join('');
      $('#gift-boda').innerHTML = V.svg({ id: 'boda1', forma: 'vaso', cristal: 'claro', cera: '#f6ead6', etiquetaTexto: 'Boda' }) + V.svg({ id: 'boda2', forma: 'vaso', cristal: 'ambar', cera: '#f3e6d3', etiquetaTexto: 'Tu logo' });
    }
    fillGrid($('#reg-grid'), T.productos.filter(function (p) { return p.grupo === 'regalos'; }));
    document.title = 'Regalos y eventos · Chispa';
  }

  /* ---------- Crea tu vela ---------- */
  const crea = {
    step: 0,
    s: { envase: 'taza', mecha: 'algodon', color: '#c8ead9', colorName: 'Menta', aroma: 'Vainilla de Madagascar', toppings: ['nata'], signo: 0, msgMode: 'etiqueta', msg: '', lit: true }
  };
  const STEP_NAMES = ['Envase', 'Mecha', 'Color', 'Aroma', 'Toppings', 'Mensaje'];
  function creaVela() {
    const s = crea.s;
    const env = T.crea.envases.find(function (e) { return e.id === s.envase; });
    const sign = T.signos[s.signo];
    return {
      id: 'crea', forma: env.forma, cera: s.color, mecha: s.mecha,
      envase: env.forma === 'taza' ? '#efe6da' : undefined,
      toppings: s.toppings.slice(), glyph: sign.glifo, encendida: s.lit
    };
  }
  function creaPrice() {
    return T.crea.base + (crea.s.mecha === 'madera' ? 1 : 0) + (crea.s.msgMode === 'oculto' && crea.s.msg.trim() ? T.crea.mensajeOculto : 0);
  }
  function creaRender(kind) {
    const s = crea.s;
    const holder = $('#crea-candle');
    if (kind === 'color' && $('.vela', holder)) {
      $$('.v-wax', holder).forEach(function (el) { el.style.fill = s.color; });
    } else {
      holder.innerHTML = V.svg(creaVela());
    }
    // Mensaje bajo la vela
    const msg = $('#crea-msg');
    const text = s.msg.trim();
    if (!text) msg.innerHTML = '';
    else if (s.msgMode === 'oculto') {
      let n = 0;
      msg.innerHTML = text.toUpperCase().slice(0, 12).split(/\s+/).filter(Boolean).map(function (word) {
        return '<span class="bead-word">' + Array.from(word).map(function (ch) { return '<span class="bead" style="--i:' + (n++) + '">' + esc(ch) + '</span>'; }).join('') + '</span>';
      }).join('');
    }
    else msg.innerHTML = '«' + esc(text) + '»';
    // Resumen y precio
    const env = T.crea.envases.find(function (e) { return e.id === s.envase; });
    const tops = s.toppings.map(function (t) { const o = T.crea.toppings.find(function (x) { return x.id === t; }); return o ? o.nombre : t; });
    $('#crea-summary').innerHTML =
      '<dt>Envase</dt><dd>' + esc(env.nombre) + '</dd>' +
      '<dt>Mecha</dt><dd>' + (s.mecha === 'madera' ? 'Madera (+1 €)' : 'Algodón') + '</dd>' +
      '<dt>Color</dt><dd>' + esc(s.colorName) + '</dd>' +
      '<dt>Aroma</dt><dd>' + esc(s.aroma) + '</dd>' +
      '<dt>Toppings</dt><dd>' + (tops.length ? esc(tops.join(', ')) : 'Sin toppings') + '</dd>' +
      '<dt>Mensaje</dt><dd>' + (text ? (s.msgMode === 'oculto' ? 'Oculto: ' : 'Etiqueta: ') + esc(text) : '—') + '</dd>';
    const priceEl = $('#crea-price');
    const newPrice = eur(creaPrice());
    if (priceEl.textContent !== newPrice) {
      priceEl.textContent = newPrice;
      priceEl.classList.remove('flash'); void priceEl.offsetWidth; priceEl.classList.add('flash');
    }
  }
  function creaGo(step) {
    crea.step = Math.max(0, Math.min(5, step));
    $$('.crea-panel').forEach(function (p) { p.hidden = Number(p.dataset.step) !== crea.step; });
    $$('#crea-progress button').forEach(function (b, i) {
      b.classList.toggle('is-active', i === crea.step);
      b.classList.toggle('is-done', i < crea.step);
      b.setAttribute('aria-current', i === crea.step ? 'step' : 'false');
    });
    $('#crea-prev').disabled = crea.step === 0;
    $('#crea-next').textContent = crea.step === 5 ? 'Añadir al carrito' : 'Siguiente';
  }
  function initCrea() {
    const s = crea.s;
    $('#crea-progress').innerHTML = STEP_NAMES.map(function (n, i) { return '<li><button type="button" data-cstep="' + i + '">' + (i + 1) + '. ' + n + '</button></li>'; }).join('');
    $('#crea-progress').addEventListener('click', function (e) { const b = e.target.closest('[data-cstep]'); if (b) creaGo(Number(b.dataset.cstep)); });

    // 1. Envase
    $('#opt-envase').innerHTML = T.crea.envases.map(function (e) {
      return '<button type="button" class="opt' + (e.id === s.envase ? ' is-active' : '') + '" data-envase="' + e.id + '" aria-pressed="' + (e.id === s.envase) + '">' + V.svg({ id: 'op-' + e.id, forma: e.forma, cera: '#efe2cf', envase: e.forma === 'taza' ? '#efe6da' : undefined, etiqueta: false }) + '<strong>' + esc(e.nombre) + '</strong><small>' + esc(e.desc) + '</small></button>';
    }).join('');
    $('#opt-envase').addEventListener('click', function (e) {
      const b = e.target.closest('[data-envase]');
      if (!b) return;
      s.envase = b.dataset.envase;
      $$('[data-envase]').forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      creaRender();
    });

    // 2. Mecha
    $('#opt-mecha').innerHTML = T.crea.mechas.map(function (m) {
      return '<button type="button" class="opt' + (m.id === s.mecha ? ' is-active' : '') + '" data-mecha="' + m.id + '" aria-pressed="' + (m.id === s.mecha) + '">' + (m.precio ? '<span class="price-add">+' + m.precio + ' €</span>' : '') + V.svg({ id: 'om-' + m.id, forma: 'vaso', cristal: 'claro', cera: '#f4ece2', mecha: m.id, encendida: true, etiqueta: false }) + '<strong>' + esc(m.nombre) + '</strong><small>' + esc(m.desc) + '</small></button>';
    }).join('');
    $('#opt-mecha').addEventListener('click', function (e) {
      const b = e.target.closest('[data-mecha]');
      if (!b) return;
      s.mecha = b.dataset.mecha;
      $$('[data-mecha]').forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      creaRender();
    });

    // 3. Color
    $('#opt-color').innerHTML = T.crea.colores.map(function (g) {
      return '<div class="color-group"><p>' + esc(g.grupo) + '</p><div class="swatches">' + g.items.map(function (c) {
        return '<button type="button" class="swatch' + (c[1] === s.color ? ' is-active' : '') + '" style="--c:' + c[1] + '" data-color="' + c[1] + '" data-cname="' + esc(c[0]) + '" aria-pressed="' + (c[1] === s.color) + '"><i aria-hidden="true"></i>' + esc(c[0]) + '</button>';
      }).join('') + '</div></div>';
    }).join('');
    $('#opt-color').addEventListener('click', function (e) {
      const b = e.target.closest('[data-color]');
      if (!b) return;
      s.color = b.dataset.color;
      s.colorName = b.dataset.cname;
      $$('[data-color]').forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      creaRender('color');
    });

    // 4. Aroma
    const sel = $('#opt-aroma');
    sel.innerHTML = T.crea.aromas.map(function (g) { return '<optgroup label="' + esc(g.grupo) + '">' + g.items.map(function (a) { return '<option' + (a === s.aroma ? ' selected' : '') + '>' + esc(a) + '</option>'; }).join('') + '</optgroup>'; }).join('');
    function aromaHint() {
      const g = T.crea.aromas.find(function (x) { return x.items.indexOf(s.aroma) !== -1; });
      $('#aroma-hint').textContent = g ? 'Aroma ' + g.grupo.toLowerCase() + '. Todos nuestros aceites son aptos para velas y sin ftalatos.' : '';
    }
    sel.addEventListener('change', function () { s.aroma = sel.value; aromaHint(); creaRender('color'); });
    aromaHint();

    // 5. Toppings
    $('#opt-toppings').innerHTML = T.crea.toppings.map(function (t) {
      return '<button type="button" class="topping' + (s.toppings.indexOf(t.id) !== -1 ? ' is-active' : '') + '" data-top="' + t.id + '" aria-pressed="' + (s.toppings.indexOf(t.id) !== -1) + '">' + esc(t.nombre) + '</button>';
    }).join('');
    $('#opt-signo').innerHTML = T.signos.map(function (z, i) { return '<option value="' + i + '">' + z.glifo + '&#xFE0E; ' + esc(z.nombre) + '</option>'; }).join('');
    function toppingState() {
      $$('[data-top]').forEach(function (b) {
        const on = s.toppings.indexOf(b.dataset.top) !== -1;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
        b.disabled = !on && s.toppings.length >= 3;
      });
      $('#sign-field').hidden = s.toppings.indexOf('signo') === -1;
    }
    $('#opt-toppings').addEventListener('click', function (e) {
      const b = e.target.closest('[data-top]');
      if (!b) return;
      const id = b.dataset.top;
      const i = s.toppings.indexOf(id);
      if (i !== -1) s.toppings.splice(i, 1);
      else if (s.toppings.length < 3) s.toppings.push(id);
      toppingState();
      creaRender();
    });
    $('#opt-signo').addEventListener('change', function (e) { s.signo = Number(e.target.value); creaRender(); });
    toppingState();

    // 6. Mensaje
    const msgInput = $('#opt-msg');
    function msgMode() {
      const oculto = s.msgMode === 'oculto';
      msgInput.maxLength = oculto ? 12 : 30;
      if (oculto && msgInput.value.length > 12) msgInput.value = msgInput.value.slice(0, 12);
      s.msg = msgInput.value;
      $('#msg-label').textContent = oculto ? 'Mensaje oculto (máx. 12 letras)' : 'Texto de la etiqueta';
      msgInput.placeholder = oculto ? 'Te quiero' : 'Feliz cumpleaños María';
      $('#msg-hint').textContent = oculto ? 'Las letras son cuentas metálicas que aguantan el calor. Aparecen cuando la cera se derrite (unos 30-45 minutos).' : 'Ejemplos: «Feliz cumpleaños María», «Propiedad de la bruja de la casa», «Energía Tauro».';
      creaRender();
    }
    $$('input[name="msgmode"]').forEach(function (r) {
      r.addEventListener('change', function () { s.msgMode = r.value; msgMode(); });
    });
    msgInput.addEventListener('input', function () { s.msg = msgInput.value; creaRender('color'); });

    // Encender / apagar la vista previa
    $('#crea-light').addEventListener('click', function (e) {
      s.lit = !s.lit;
      const svg = $('#crea-candle .vela');
      if (svg) svg.classList.toggle('is-lit', s.lit);
      e.currentTarget.textContent = s.lit ? 'Apagar' : 'Encender';
      e.currentTarget.setAttribute('aria-pressed', String(s.lit));
    });

    $('#crea-prev').addEventListener('click', function () { creaGo(crea.step - 1); });
    $('#crea-next').addEventListener('click', function (e) { if (crea.step === 5) creaAdd(e.currentTarget); else creaGo(crea.step + 1); });
    $('#crea-add').addEventListener('click', function (e) { creaAdd(e.currentTarget); });
    crea.msgMode = msgMode;
    creaRender();
    creaGo(0);
  }
  function creaAdd(btn) {
    const s = crea.s;
    const env = T.crea.envases.find(function (e) { return e.id === s.envase; });
    const vela = creaVela();
    vela.encendida = false;
    addToCart({
      key: 'crea-' + Date.now(),
      nombre: 'Vela personalizada',
      precio: creaPrice(),
      detalle: [env.nombre, s.colorName, s.aroma].join(' · ') + (s.msg.trim() ? ' · «' + s.msg.trim() + '»' : ''),
      vela: vela
    }, btn);
  }
  function renderCrea(query) {
    if (query === 'mensaje') {
      const r = $('input[name="msgmode"][value="oculto"]');
      r.checked = true;
      crea.s.msgMode = 'oculto';
      crea.msgMode();
      creaGo(5);
    }
    document.title = 'Crea tu vela · Chispa';
  }

  /* =========================================================
     Rutas (#/pagina/sub)
     ========================================================= */
  const VIEWS = { '': 'inicio', tematicas: 'tematicas', colecciones: 'colecciones', 'mecha-de-madera': 'madera', 'crea-tu-vela': 'crea', producto: 'producto', regalos: 'regalos', nosotros: 'nosotros', contacto: 'contacto' };
  let currentView = null;
  function route() {
    const hash = location.hash || '#/';
    if (hash.indexOf('#/') !== 0) return; // enlaces internos normales (#besos, #main)
    const parts = hash.slice(2).split('?');
    const path = parts[0].split('/');
    const query = parts[1] || '';
    const view = VIEWS[path[0]] || 'inicio';
    const sub = path[1] || '';
    const changed = view !== currentView;

    if (changed) {
      $$('.view').forEach(function (v) { v.hidden = v.dataset.view !== view; });
      currentView = view;
      jumpTop();
    }
    $$('.nav-link').forEach(function (a) { a.classList.toggle('is-active', a.dataset.nav === view); });

    if (view === 'inicio') document.title = 'Chispa · Velas hechas a mano';
    if (view === 'tematicas') renderTematicas(sub);
    if (view === 'colecciones') renderColecciones(sub);
    if (view === 'madera') renderMadera();
    if (view === 'crea') renderCrea(query);
    if (view === 'producto') { renderProducto(sub); jumpTop(); }
    if (view === 'regalos') renderRegalos();
    if (view === 'nosotros') document.title = 'Sobre nosotros · Chispa';
    if (view === 'contacto') document.title = 'Contacto · Chispa';
    observeReveals();
    closeDrops();
  }
  window.addEventListener('hashchange', route);

  /* ---------- Apariciones al hacer scroll ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
      $$('.count', en.target).forEach(countUp);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }) : null;
  function observeReveals() {
    $$('[data-reveal]:not(.is-in)').forEach(function (el) {
      if (!el.style.getPropertyValue('--i') && el.parentElement) {
        const sib = $$(':scope > [data-reveal]', el.parentElement);
        el.style.setProperty('--i', sib.indexOf(el));
      }
      if (io) io.observe(el); else el.classList.add('is-in');
    });
  }
  function countUp(el) {
    const end = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = end; return; }
    const t0 = performance.now();
    (function step(t) {
      const k = Math.min(1, (t - t0) / 1400);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  // Subir arriba sin animación al cambiar de página
  function jumpTop() {
    const html = document.documentElement;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.style.scrollBehavior = '';
  }
  function restart(el) { if (!el) return; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }

  /* ---------- Formularios ---------- */
  $('#contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const f = e.currentTarget;
    let ok = true;
    $$('[required]', f).forEach(function (inp) {
      const bad = !inp.value.trim() || (inp.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value));
      inp.closest('.field').classList.toggle('is-error', bad);
      if (bad) ok = false;
    });
    const note = $('#contact-note');
    note.classList.toggle('is-error', !ok);
    note.textContent = ok ? '¡Gracias! Te contestaríamos en un par de días (esto es un prototipo y no se envía de verdad).' : 'Revisa los campos marcados.';
    if (ok) f.reset();
  });
  $('#news-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const inp = $('#news-email');
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value);
    const note = $('#news-note');
    note.textContent = ok ? '¡Hecho! Te avisaremos de las ediciones limitadas.' : 'Escribe un correo válido.';
    note.classList.toggle('is-error', !ok);
    if (ok) inp.value = '';
  });

  /* ---------- Arranque ---------- */
  fillDrops();
  initHero();
  initHome();
  initSparks();
  initCrea();
  renderCart();
  renderFavs();
  updateBadges();
  route();
})();
