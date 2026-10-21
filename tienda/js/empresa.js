/* =========================================================
   Vibra · Área de empresa (solo Jorge y Maite)
   - Acceso con usuario y contraseña. En el código NO está la contraseña:
     solo un resumen (hash PBKDF2-SHA256 con sal). Se comprueba en el navegador.
   - Como la web no tiene servidor, los pedidos se guardan en el navegador
     donde se hacen. Es un prototipo del proyecto.
   ========================================================= */
(function () {
  'use strict';

  const USERS = {
    jorge: { nombre: 'Jorge', salt: 'oHKzFM5p4W5Ut0IdWjGE1w==', hash: 'QYxmq/Ro6CCnenZ4xWkPMPQ8Kx8llKHIa9RqafUVUT0=' },
    maite: { nombre: 'Maite', salt: 'Pjj/HJXdciJ8oRN+CwkQrA==', hash: 'h8daHQ3nN8DwI/KlQ1qA5EHwXU7lYuIMjQ8rHwBX4bk=' }
  };
  const ITER = 150000;
  const SESSION_MIN = 120;      // la sesión se cierra sola a las 2 horas
  const MAX_FAILS = 5;          // intentos antes de bloquear
  const LOCK_SECONDS = 60;
  const IVA = 0.21;
  const MARK = '<svg class="doc-mark" viewBox="0 0 60 60" aria-hidden="true"><rect x="1.5" y="1.5" width="57" height="57" fill="none" stroke="currentColor" stroke-width="2"/><path fill="currentColor" d="M20.5 14H27V14.7H25.3L31 33.2L37.7 15.2L35.6 14.7V14H40.5V14.7H38.7L31.2 37H30.3L22.3 14.7H20.5Z"/><path fill="currentColor" fill-rule="evenodd" d="M30.7 41C33.4 43.6 34.4 46.3 33.3 49 32.5 50.9 31 51.8 29.6 51.8 27.6 51.8 26.6 50.3 26.6 48.6 26.6 46.7 27.9 45.3 29 44.4 28.9 45.8 29.3 46.9 30.1 47.5 29.6 45.6 29.8 43 30.7 41ZM31.1 45.3C32.4 46.9 32.6 48.6 31.6 50 31 50.8 30.2 51 29.6 50.6 30.6 49.4 31.3 47.5 31.1 45.3Z"/></svg>';

  /* Proveedores (socios clave del lienzo). Precios orientativos, sin IVA. */
  const PROVEEDORES = [
    { id: 'cera', nombre: 'Proveedor de cera vegetal', que: 'Cera de soja y de abeja', ico: 'drop', items: [
      ['cera-soja', 'Cera de soja en escamas (saco 5 kg)', 29.5], ['cera-abeja', 'Cera de abeja natural (1 kg)', 14.9] ] },
    { id: 'aromas', nombre: 'Proveedor de aceites aromáticos', que: 'Aromas sin ftalatos', ico: 'flask', items: [
      ['aroma-100', 'Aceite aromático sin ftalatos (frasco 100 ml)', 6.8], ['aroma-pack', 'Pack 6 aromas de temporada (6 × 50 ml)', 22] ] },
    { id: 'letras', nombre: 'Distribuidor de letras metálicas', que: 'Para el mensaje oculto', ico: 'letter', items: [
      ['letras-500', 'Letras metálicas resistentes al calor (bolsa 500 uds)', 18.5], ['letras-1000', 'Letras metálicas resistentes al calor (bolsa 1.000 uds)', 33] ] },
    { id: 'mechas', nombre: 'Proveedor de mechas', que: 'Madera y algodón', ico: 'wick', items: [
      ['mecha-madera', 'Mechas de madera (pack 50)', 12], ['mecha-algodon', 'Mechas de algodón con base (pack 100)', 7.5] ] },
    { id: 'envases', nombre: 'Envases y packaging', que: 'Tazas, vasos y cajas', ico: 'jar', items: [
      ['tazas', 'Tazas de cerámica (caja 12)', 30], ['vasos', 'Vasos de cristal ámbar (caja 12)', 21.6], ['cajas', 'Cajas de envío protegidas (pack 25)', 13.75], ['papel', 'Papel reciclado para envolver (rollo)', 9.9] ] },
    { id: 'deco', nombre: 'Colorantes y decoración', que: 'Color, purpurina y toppings', ico: 'spark', items: [
      ['colorantes', 'Colorantes para cera (set 10 colores)', 11.4], ['purpurina', 'Purpurina biodegradable (100 g)', 5.95] ] },
    { id: 'imprenta', nombre: 'Imprenta de etiquetas', que: 'Etiquetas resistentes al calor', ico: 'tag', items: [
      ['etiquetas', 'Etiquetas resistentes a aceite y calor (250 uds)', 24] ] }
  ];
  const ICONS = {
    drop: '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/>',
    letter: '<circle cx="12" cy="12" r="8"/><path d="M9 16l3-8 3 8M10 13.5h4"/>',
    wick: '<path d="M12 21V11"/><path d="M12 9c2-2 2-4 0-6-2 2-2 4 0 6z"/><path d="M8 21h8"/>',
    jar: '<path d="M8 4h8M7 7h10l-1 13H8z"/>',
    spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
    tag: '<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
  };
  const ESTADOS_PED = ['Pendiente', 'Enviado', 'Recibido'];
  const ESTADOS_WEB = ['Nuevo', 'En preparación', 'Enviado'];

  let app = null;     // utilidades que pasa tienda.js
  let draft = null;   // pedido que se está preparando
  let filtro = 'Todos';
  let mem = {};       // por si el navegador no deja usar sessionStorage

  /* ---------- Utilidades ---------- */
  function b64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  function fecha(iso) { return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  function hoy() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function round2(n) { return Math.round(n * 100) / 100; }
  function icon(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || '') + '</svg>'; }
  function ses() {
    try { return JSON.parse(sessionStorage.getItem('vibra-sesion') || 'null'); } catch (e) { return mem.ses || null; }
  }
  function setSes(v) {
    try { if (v) sessionStorage.setItem('vibra-sesion', JSON.stringify(v)); else sessionStorage.removeItem('vibra-sesion'); } catch (e) { mem.ses = v; }
  }
  function pedidos() { return app.store.get('pedidos-proveedor', []); }
  function pedidosWeb() { return app.store.get('pedidos-web', []); }
  function nextNum(kind) {
    const k = 'seq-' + kind;
    const n = app.store.get(k, 0) + 1;
    app.store.set(k, n);
    return (kind === 'ped' ? 'PED-' + new Date().getFullYear() + '-' : 'WEB-') + String(n).padStart(4, '0');
  }

  /* ---------- Comprobar contraseña ---------- */
  async function verify(user, pass) {
    const u = USERS[user];
    // Se calcula igual aunque el usuario no exista, para no dar pistas por el tiempo
    const salt = u ? b64(u.salt) : new Uint8Array(16);
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: ITER, hash: 'SHA-256' }, key, 256));
    if (!u) return false;
    const ref = b64(u.hash);
    let diff = bits.length ^ ref.length;
    for (let i = 0; i < Math.min(bits.length, ref.length); i++) diff |= bits[i] ^ ref[i];
    return diff === 0;
  }
  function lockState() { return app.store.get('acceso', { fallos: 0, hasta: 0 }); }
  function setLock(v) { app.store.set('acceso', v); }

  /* =========================================================
     Entrada
     ========================================================= */
  function render(root, sub, msg) {
    const s = ses();
    if (s && s.exp > Date.now()) {
      s.exp = Date.now() + SESSION_MIN * 60000;   // se renueva mientras se usa
      setSes(s);
      renderPanel(root, sub || 'nuevo', s);
    } else {
      if (s) { setSes(null); msg = 'La sesión ha caducado. Vuelve a entrar.'; }
      renderLogin(root, msg);
    }
  }

  function renderLogin(root, msg) {
    document.title = 'Área de empresa · Vibra';
    root.innerHTML =
      '<div class="emp-login">' +
      '<div class="emp-login-art" aria-hidden="true"><img class="emp-login-photo" src="img/vibra-vela.jpg" alt="" width="1078" height="1347"><span class="emp-login-glow"></span></div>' +
      '<form class="emp-login-form" id="emp-form" novalidate>' +
      '<p class="eyebrow"><span class="lock-ico">' + icon('lock') + '</span>Área de empresa</p>' +
      '<h1>Acceso para el equipo</h1>' +
      '<p class="hint">Solo para Jorge y Maite. Desde aquí hacemos los pedidos a proveedores y vemos los pedidos de la tienda.</p>' +
      '<label class="field"><span>Usuario</span><input id="emp-user" name="usuario" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>' +
      '<label class="field"><span>Contraseña</span><span class="pass-wrap"><input id="emp-pass" name="contrasena" type="password" autocomplete="current-password" required>' +
      '<button type="button" class="pass-toggle" id="emp-eye" aria-pressed="false" aria-label="Mostrar contraseña"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></span></label>' +
      '<button class="btn btn-solid btn-block" type="submit" id="emp-submit"><span class="btn-label">Entrar</span></button>' +
      '<p class="form-note is-error" id="emp-error" role="alert">' + (msg ? app.esc(msg) : '') + '</p>' +
      '<p class="emp-small">Por seguridad, la sesión se cierra sola a las 2 horas y al cerrar la pestaña.</p>' +
      '</form></div>';

    const form = root.querySelector('#emp-form');
    const user = root.querySelector('#emp-user');
    const pass = root.querySelector('#emp-pass');
    const btn = root.querySelector('#emp-submit');
    const err = root.querySelector('#emp-error');
    root.querySelector('#emp-eye').addEventListener('click', function (e) {
      const show = pass.type === 'password';
      pass.type = show ? 'text' : 'password';
      e.currentTarget.setAttribute('aria-pressed', String(show));
      e.currentTarget.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });

    let timer = null;
    function lockTick() {
      const l = lockState();
      const left = Math.ceil((l.hasta - Date.now()) / 1000);
      if (left > 0) {
        btn.disabled = true;
        err.textContent = 'Demasiados intentos. Espera ' + left + ' s.';
        timer = setTimeout(lockTick, 1000);
      } else {
        btn.disabled = false;
        if (/Demasiados/.test(err.textContent)) err.textContent = '';
      }
    }
    lockTick();

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (btn.disabled) return;
      const u = user.value.trim().toLowerCase();
      const p = pass.value;
      if (!u || !p) { err.textContent = 'Escribe el usuario y la contraseña.'; shake(form); return; }
      if (!window.crypto || !crypto.subtle) { err.textContent = 'Abre la web desde su dirección segura (https) para poder entrar.'; return; }
      btn.disabled = true;
      btn.classList.add('is-loading');
      err.textContent = '';
      let ok = false;
      try { ok = await verify(u, p); } catch (x) { ok = false; }
      btn.classList.remove('is-loading');
      if (ok) {
        setLock({ fallos: 0, hasta: 0 });
        setSes({ u: u, exp: Date.now() + SESSION_MIN * 60000 });
        root.querySelector('.emp-login').classList.add('is-in-ok');
        setTimeout(function () {
          if (location.hash.indexOf('#/empresa') === 0) render(root, 'nuevo');
          else location.hash = '#/empresa';
        }, 900);
      } else {
        const l = lockState();
        l.fallos += 1;
        if (l.fallos >= MAX_FAILS) { l.hasta = Date.now() + LOCK_SECONDS * 1000; l.fallos = 0; }
        setLock(l);
        btn.disabled = false;
        pass.value = '';
        err.textContent = 'Usuario o contraseña incorrectos.';
        shake(form);
        clearTimeout(timer);
        lockTick();
        pass.focus();
      }
    });
    setTimeout(function () { user.focus(); }, 80);
  }
  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

  /* =========================================================
     Panel
     ========================================================= */
  function renderPanel(root, tab, s) {
    const who = USERS[s.u];
    const peds = pedidos();
    const webs = pedidosWeb();
    const gasto = peds.reduce(function (t, p) { return t + p.total; }, 0);
    const ventas = webs.reduce(function (t, p) { return t + p.total; }, 0);
    const pendWeb = webs.filter(function (p) { return p.estado !== 'Enviado'; }).length;
    document.title = 'Área de empresa · Vibra';
    root.innerHTML =
      '<div class="emp-panel">' +
      '<header class="emp-top">' +
      '<div><p class="eyebrow">Área de empresa</p><h1>Hola, ' + app.esc(who.nombre) + '</h1><p class="hint">Sesión iniciada. Se cierra sola a las 2 horas sin usarla.</p></div>' +
      '<div class="emp-top-actions"><a class="btn btn-line" href="#/">Ver la tienda</a><button class="btn btn-solid" type="button" id="emp-logout">Cerrar sesión</button></div>' +
      '</header>' +
      '<ul class="emp-kpis">' +
      kpi('Pedidos a proveedores', peds.length, false, 'jar') +
      kpi('Gasto en materiales', gasto, true, 'drop') +
      kpi('Pedidos de la tienda', webs.length, false, 'tag') +
      kpi('Ventas en la web', ventas, true, 'spark') +
      '</ul>' +
      '<nav class="chips emp-tabs" aria-label="Secciones del área">' +
      tabLink('nuevo', 'Nuevo pedido', tab) + tabLink('pedidos', 'Pedidos a proveedores <span class="n">' + peds.length + '</span>', tab) + tabLink('tienda', 'Pedidos de la tienda <span class="n">' + webs.length + '</span>' + (pendWeb ? '<span class="dot-new" title="Pendientes"></span>' : ''), tab) +
      '</nav>' +
      '<div class="emp-body" id="emp-body"></div></div>';
    root.querySelector('#emp-logout').addEventListener('click', function () {
      setSes(null);
      app.toast('Sesión cerrada. ¡Hasta luego, ' + who.nombre + '!');
      render(root);
    });
    root.querySelectorAll('.kpi-num').forEach(function (el) { animateNum(el); });
    const body = root.querySelector('#emp-body');
    if (tab === 'pedidos') renderPedidos(body, s);
    else if (tab === 'tienda') renderWeb(body);
    else renderNuevo(body, s, root);
  }
  function kpi(label, val, money, ico) {
    return '<li class="kpi"><span class="kpi-ico">' + icon(ico) + '</span><span class="kpi-label">' + label + '</span><strong class="kpi-num" data-val="' + val + '" data-money="' + (money ? 1 : 0) + '">' + (money ? app.eur(0) : '0') + '</strong></li>';
  }
  function tabLink(key, label, tab) {
    return '<a class="chip' + (key === tab ? ' is-active' : '') + '" href="#/empresa/' + key + '"' + (key === tab ? ' aria-current="page"' : '') + '>' + label + '</a>';
  }
  function animateNum(el) {
    const end = Number(el.dataset.val);
    const money = el.dataset.money === '1';
    const t0 = performance.now();
    (function step(t) {
      const k = Math.min(1, (t - t0) / 1100);
      const v = end * (1 - Math.pow(1 - k, 3));
      el.textContent = money ? app.eur(v) : Math.round(v);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Nuevo pedido a proveedor ---------- */
  function renderNuevo(body, s) {
    if (!draft) draft = { prov: null, cant: {}, entrega: '', pago: 'Transferencia bancaria', notas: '' };
    body.innerHTML =
      '<form class="po" id="po-form" novalidate>' +
      '<div class="po-main">' +
      '<section class="emp-card"><h2><span class="num">1</span> Elige el proveedor</h2><div class="sup-grid" role="radiogroup" aria-label="Proveedor">' +
      PROVEEDORES.map(function (p) {
        const on = draft.prov === p.id;
        return '<button type="button" class="sup' + (on ? ' is-active' : '') + '" role="radio" aria-checked="' + on + '" data-prov="' + p.id + '"><span class="sup-ico">' + icon(p.ico) + '</span><strong>' + app.esc(p.nombre) + '</strong><small>' + app.esc(p.que) + '</small></button>';
      }).join('') + '</div></section>' +
      '<section class="emp-card" id="po-lines-card"><h2><span class="num">2</span> Productos y cantidades</h2><div id="po-lines"></div></section>' +
      '<section class="emp-card"><h2><span class="num">3</span> Entrega y pago</h2><div class="po-fields">' +
      '<label class="field"><span>Fecha de entrega deseada</span><input type="date" id="po-entrega" min="' + hoy() + '" value="' + app.esc(draft.entrega) + '" required></label>' +
      '<label class="field"><span>Forma de pago</span><select id="po-pago">' + ['Transferencia bancaria', 'Tarjeta', 'Domiciliación bancaria', 'Pago a 30 días'].map(function (o) { return '<option' + (o === draft.pago ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></label>' +
      '<label class="field po-notes"><span>Observaciones</span><textarea id="po-notas" rows="3" placeholder="Ej.: entregar por la tarde">' + app.esc(draft.notas) + '</textarea></label>' +
      '</div></section>' +
      '</div>' +
      '<aside class="po-sum" id="po-sum" aria-live="polite"></aside>' +
      '</form>';
    const form = body.querySelector('#po-form');
    form.addEventListener('click', function (e) {
      const sup = e.target.closest('[data-prov]');
      if (sup) {
        if (draft.prov !== sup.dataset.prov) { draft.prov = sup.dataset.prov; draft.cant = {}; }
        form.querySelectorAll('[data-prov]').forEach(function (b) { const on = b === sup; b.classList.toggle('is-active', on); b.setAttribute('aria-checked', String(on)); });
        lines(body);
        sum(body, s);
        const card = body.querySelector('#po-lines-card');
        if (card && window.innerWidth < 900) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const st = e.target.closest('[data-step]');
      if (st) {
        const id = st.dataset.item;
        draft.cant[id] = Math.max(0, Math.min(999, (draft.cant[id] || 0) + Number(st.dataset.step)));
        const inp = body.querySelector('input[data-qty="' + id + '"]');
        if (inp) inp.value = draft.cant[id];
        rowState(body, id);
        sum(body, s);
      }
    });
    form.addEventListener('input', function (e) {
      if (e.target.matches('input[data-qty]')) {
        const v = parseInt(e.target.value, 10);
        draft.cant[e.target.dataset.qty] = isNaN(v) ? 0 : Math.max(0, Math.min(999, v));
        rowState(body, e.target.dataset.qty);
        sum(body, s);
      }
      if (e.target.id === 'po-entrega') { draft.entrega = e.target.value; e.target.closest('.field').classList.remove('is-error'); }
      if (e.target.id === 'po-notas') draft.notas = e.target.value;
    });
    form.addEventListener('change', function (e) {
      if (e.target.id === 'po-pago') { draft.pago = e.target.value; sum(body, s); }
      if (e.target.id === 'po-entrega') { draft.entrega = e.target.value; e.target.closest('.field').classList.remove('is-error'); sum(body, s); }
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); confirmar(body, s); });
    lines(body);
    sum(body, s);
  }
  function prov() { return PROVEEDORES.find(function (p) { return p.id === draft.prov; }); }
  function lines(body) {
    const p = prov();
    const box = body.querySelector('#po-lines');
    if (!p) { box.innerHTML = '<p class="emp-empty">Primero elige un proveedor.</p>'; return; }
    box.innerHTML = '<div class="po-table" role="table" aria-label="Productos de ' + app.esc(p.nombre) + '">' +
      '<div class="po-row po-row--head" role="row"><span role="columnheader">Producto</span><span role="columnheader">Precio</span><span role="columnheader">Cantidad</span><span role="columnheader">Importe</span></div>' +
      p.items.map(function (it, i) {
        const q = draft.cant[it[0]] || 0;
        return '<div class="po-row' + (q ? ' has-qty' : '') + '" role="row" data-row="' + it[0] + '" style="--i:' + i + '">' +
          '<span role="cell" class="po-desc">' + app.esc(it[1]) + '</span>' +
          '<span role="cell" class="po-price">' + app.eur(it[2]) + '</span>' +
          '<span role="cell" class="po-qty"><button type="button" data-step="-1" data-item="' + it[0] + '" aria-label="Una menos">−</button><input type="number" inputmode="numeric" min="0" max="999" value="' + q + '" data-qty="' + it[0] + '" aria-label="Cantidad de ' + app.esc(it[1]) + '"><button type="button" data-step="1" data-item="' + it[0] + '" aria-label="Una más">+</button></span>' +
          '<span role="cell" class="po-amount" data-amount="' + it[0] + '">' + app.eur(q * it[2]) + '</span></div>';
      }).join('') + '</div><p class="emp-small">Precios orientativos sin IVA, para el prototipo.</p>';
  }
  function rowState(body, id) {
    const p = prov();
    const it = p && p.items.find(function (x) { return x[0] === id; });
    if (!it) return;
    const q = draft.cant[id] || 0;
    const row = body.querySelector('[data-row="' + id + '"]');
    if (row) row.classList.toggle('has-qty', q > 0);
    const a = body.querySelector('[data-amount="' + id + '"]');
    if (a) a.textContent = app.eur(q * it[2]);
  }
  function calc() {
    const p = prov();
    const lineas = p ? p.items.filter(function (it) { return (draft.cant[it[0]] || 0) > 0; }).map(function (it) {
      return { id: it[0], desc: it[1], qty: draft.cant[it[0]], precio: it[2], importe: round2(draft.cant[it[0]] * it[2]) };
    }) : [];
    const base = round2(lineas.reduce(function (t, l) { return t + l.importe; }, 0));
    const iva = round2(base * IVA);
    return { lineas: lineas, base: base, iva: iva, total: round2(base + iva) };
  }
  function sum(body, s) {
    const c = calc();
    const p = prov();
    const box = body.querySelector('#po-sum');
    box.innerHTML = '<h2>Resumen</h2>' +
      '<p class="po-sup">' + (p ? app.esc(p.nombre) : 'Sin proveedor') + '</p>' +
      (c.lineas.length ? '<ul class="po-sum-lines">' + c.lineas.map(function (l) { return '<li><span>' + l.qty + ' × ' + app.esc(l.desc) + '</span><span>' + app.eur(l.importe) + '</span></li>'; }).join('') + '</ul>' : '<p class="emp-small">Aún no hay productos.</p>') +
      '<dl class="po-totals"><div><dt>Base imponible</dt><dd>' + app.eur(c.base) + '</dd></div><div><dt>IVA (21 %)</dt><dd>' + app.eur(c.iva) + '</dd></div><div class="po-total"><dt>Total</dt><dd>' + app.eur(c.total) + '</dd></div></dl>' +
      '<p class="emp-small">Lo pide: <strong>' + app.esc(USERS[s.u].nombre) + '</strong> · ' + app.esc(draft.pago) + '</p>' +
      '<button class="btn btn-solid btn-block" type="submit" form="po-form"' + (c.lineas.length ? '' : ' disabled') + '>Confirmar pedido</button>' +
      '<p class="form-note is-error" id="po-error" role="alert"></p>';
  }
  function confirmar(body, s) {
    const c = calc();
    const p = prov();
    const err = body.querySelector('#po-error');
    if (!p || !c.lineas.length) { err.textContent = 'Elige un proveedor y al menos un producto.'; return; }
    if (!draft.entrega) {
      err.textContent = 'Pon la fecha de entrega.';
      const f = body.querySelector('#po-entrega');
      f.closest('.field').classList.add('is-error');
      f.focus();
      return;
    }
    const pedido = {
      num: nextNum('ped'), fecha: new Date().toISOString(), proveedor: p.id, proveedorNombre: p.nombre,
      lineas: c.lineas, base: c.base, iva: c.iva, total: c.total,
      entrega: draft.entrega, pago: draft.pago, notas: draft.notas.trim(), usuario: USERS[s.u].nombre, estado: 'Pendiente'
    };
    const list = pedidos();
    list.unshift(pedido);
    app.store.set('pedidos-proveedor', list);
    draft = null;
    app.toast('Pedido ' + pedido.num + ' guardado');
    location.hash = '#/empresa/pedidos';
    setTimeout(function () { verDoc(pedido); }, 450);
  }

  /* ---------- Nota de pedido (documento) ---------- */
  function docHtml(p) {
    return '<article class="doc" id="doc">' +
      '<header class="doc-head"><div class="doc-brand">' + MARK + '<span>Vibra</span><small>Velas hechas a mano<br>Jorge González Luque y Maite Basterrechea Carrasco</small></div>' +
      '<div class="doc-title"><h2>Nota de pedido</h2><p>Nº <strong>' + app.esc(p.num) + '</strong></p><p>Fecha: ' + fecha(p.fecha) + '</p></div></header>' +
      '<div class="doc-parties"><div><span class="doc-k">Proveedor</span><strong>' + app.esc(p.proveedorNombre) + '</strong></div>' +
      '<div><span class="doc-k">Entrega deseada</span><strong>' + fecha(p.entrega) + '</strong></div>' +
      '<div><span class="doc-k">Forma de pago</span><strong>' + app.esc(p.pago) + '</strong></div></div>' +
      '<table class="doc-table"><thead><tr><th>Cant.</th><th>Descripción</th><th>Precio unidad</th><th>Importe</th></tr></thead><tbody>' +
      p.lineas.map(function (l) { return '<tr><td>' + l.qty + '</td><td>' + app.esc(l.desc) + '</td><td>' + app.eur(l.precio) + '</td><td>' + app.eur(l.importe) + '</td></tr>'; }).join('') +
      '</tbody></table>' +
      '<dl class="doc-totals"><div><dt>Base imponible</dt><dd>' + app.eur(p.base) + '</dd></div><div><dt>IVA (21 %)</dt><dd>' + app.eur(p.iva) + '</dd></div><div class="doc-total"><dt>Total</dt><dd>' + app.eur(p.total) + '</dd></div></dl>' +
      (p.notas ? '<p class="doc-notes"><span class="doc-k">Observaciones</span>' + app.esc(p.notas) + '</p>' : '') +
      '<footer class="doc-foot">Pedido realizado por ' + app.esc(p.usuario) + ' · Estado: ' + app.esc(p.estado) + '</footer></article>';
  }
  function verDoc(p) {
    const modal = document.getElementById('emp-modal');
    document.getElementById('emp-modal-body').innerHTML = docHtml(p);
    document.getElementById('emp-print').hidden = false;
    app.openLayer(modal);
  }

  /* ---------- Pedidos a proveedores ---------- */
  function renderPedidos(body, s) {
    const all = pedidos();
    const list = filtro === 'Todos' ? all : all.filter(function (p) { return p.estado === filtro; });
    body.innerHTML =
      '<div class="emp-card">' +
      '<div class="emp-card-head"><h2>Pedidos a proveedores</h2><div class="emp-tools">' +
      '<div class="seg-mini" role="group" aria-label="Filtrar por estado">' + ['Todos'].concat(ESTADOS_PED).map(function (e) { return '<button type="button" class="' + (e === filtro ? 'is-active' : '') + '" aria-pressed="' + (e === filtro) + '" data-filtro="' + e + '">' + e + '</button>'; }).join('') + '</div>' +
      '<button type="button" class="btn btn-line btn-sm" id="csv-ped"' + (all.length ? '' : ' disabled') + '>Descargar CSV</button>' +
      '<a class="btn btn-solid btn-sm" href="#/empresa/nuevo">Nuevo pedido</a></div></div>' +
      (list.length ? '<div class="emp-table" role="table" aria-label="Pedidos a proveedores">' +
        '<div class="et-row et-head" role="row"><span role="columnheader">Nº</span><span role="columnheader">Fecha</span><span role="columnheader">Proveedor</span><span role="columnheader">Total</span><span role="columnheader">Estado</span><span role="columnheader"><span class="sr-only">Acciones</span></span></div>' +
        list.map(function (p, i) {
          return '<div class="et-row" role="row" style="--i:' + i + '" data-num="' + p.num + '">' +
            '<span role="cell" data-l="Nº"><strong>' + app.esc(p.num) + '</strong></span>' +
            '<span role="cell" data-l="Fecha">' + fecha(p.fecha) + '<small> · ' + app.esc(p.usuario) + '</small></span>' +
            '<span role="cell" data-l="Proveedor">' + app.esc(p.proveedorNombre) + '</span>' +
            '<span role="cell" data-l="Total"><strong>' + app.eur(p.total) + '</strong></span>' +
            '<span role="cell" data-l="Estado"><select class="estado estado--' + slug(p.estado) + '" data-estado="' + p.num + '" aria-label="Estado de ' + p.num + '">' + ESTADOS_PED.map(function (e) { return '<option' + (e === p.estado ? ' selected' : '') + '>' + e + '</option>'; }).join('') + '</select></span>' +
            '<span role="cell" class="et-actions"><button type="button" data-ver="' + p.num + '">Ver</button><button type="button" data-repetir="' + p.num + '">Repetir</button><button type="button" data-borrar="' + p.num + '" class="danger">Borrar</button></span></div>';
        }).join('') + '</div>'
        : '<p class="emp-empty">' + (all.length ? 'No hay pedidos con este estado.' : 'Todavía no habéis hecho ningún pedido. <a class="link" href="#/empresa/nuevo">Hacer el primero</a>') + '</p>') +
      '</div>';
    body.onclick = function (e) {
      const f = e.target.closest('[data-filtro]');
      if (f) { filtro = f.dataset.filtro; renderPedidos(body, s); return; }
      const v = e.target.closest('[data-ver]');
      if (v) { verDoc(pedidos().find(function (p) { return p.num === v.dataset.ver; })); return; }
      const r = e.target.closest('[data-repetir]');
      if (r) {
        const p = pedidos().find(function (x) { return x.num === r.dataset.repetir; });
        draft = { prov: p.proveedor, cant: {}, entrega: '', pago: p.pago, notas: '' };
        p.lineas.forEach(function (l) { draft.cant[l.id] = l.qty; });
        location.hash = '#/empresa/nuevo';
        app.toast('Pedido copiado: revisa la fecha y confírmalo');
        return;
      }
      const b = e.target.closest('[data-borrar]');
      if (b && window.confirm('¿Borrar el pedido ' + b.dataset.borrar + '?')) {
        app.store.set('pedidos-proveedor', pedidos().filter(function (p) { return p.num !== b.dataset.borrar; }));
        app.toast('Pedido borrado');
        reRender();
      }
      if (e.target.id === 'csv-ped') csv('pedidos-proveedores.csv', [['Número', 'Fecha', 'Proveedor', 'Base', 'IVA', 'Total', 'Estado', 'Pedido por']].concat(pedidos().map(function (p) { return [p.num, fecha(p.fecha), p.proveedorNombre, p.base, p.iva, p.total, p.estado, p.usuario]; })));
    };
    body.onchange = function (e) {
      if (!e.target.matches('[data-estado]')) return;
      const list2 = pedidos();
      const p = list2.find(function (x) { return x.num === e.target.dataset.estado; });
      p.estado = e.target.value;
      app.store.set('pedidos-proveedor', list2);
      e.target.className = 'estado estado--' + slug(p.estado);
      const row = e.target.closest('.et-row');
      row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash');
      app.toast(p.num + ': ' + p.estado.toLowerCase());
    };
  }

  /* ---------- Pedidos de la tienda (clientes) ---------- */
  function renderWeb(body) {
    const list = pedidosWeb();
    body.innerHTML =
      '<div class="emp-card">' +
      '<div class="emp-card-head"><h2>Pedidos de la tienda</h2><div class="emp-tools"><button type="button" class="btn btn-line btn-sm" id="csv-web"' + (list.length ? '' : ' disabled') + '>Descargar CSV</button></div></div>' +
      (list.length ? '<div class="web-orders">' + list.map(function (p, i) {
        return '<article class="wo" style="--i:' + i + '">' +
          '<header class="wo-head"><div><strong>' + app.esc(p.num) + '</strong><small>' + fecha(p.fecha) + '</small></div>' +
          '<select class="estado estado--' + slug(p.estado) + '" data-west="' + p.num + '" aria-label="Estado de ' + p.num + '">' + ESTADOS_WEB.map(function (e) { return '<option' + (e === p.estado ? ' selected' : '') + '>' + e + '</option>'; }).join('') + '</select></header>' +
          '<p class="wo-client"><strong>' + app.esc(p.cliente.nombre) + '</strong> · ' + app.esc(p.cliente.email) + '<br>' + app.esc(p.cliente.direccion) + ', ' + app.esc(p.cliente.ciudad) + '</p>' +
          '<ul class="wo-items">' + p.items.map(function (it) { return '<li><span>' + it.qty + ' × ' + app.esc(it.nombre) + (it.detalle && slug(it.detalle) !== slug(it.nombre) ? ' <small>(' + app.esc(it.detalle) + ')</small>' : '') + '</span><span>' + app.eur(it.precio * it.qty) + '</span></li>'; }).join('') + '</ul>' +
          (p.nota ? '<p class="wo-note">«' + app.esc(p.nota) + '»</p>' : '') +
          '<footer class="wo-foot"><span>Envío: ' + (p.envio ? app.eur(p.envio) : 'gratis') + '</span><strong>' + app.eur(p.total) + '</strong></footer></article>';
      }).join('') + '</div>'
        : '<p class="emp-empty">Aún no ha llegado ningún pedido. Cuando alguien compre en la tienda (Carrito → Finalizar compra), aparecerá aquí.</p>') +
      '</div>';
    body.onclick = function (e) {
      if (e.target.id === 'csv-web') csv('pedidos-tienda.csv', [['Número', 'Fecha', 'Cliente', 'Correo', 'Dirección', 'Ciudad', 'Productos', 'Envío', 'Total', 'Estado']].concat(pedidosWeb().map(function (p) {
        return [p.num, fecha(p.fecha), p.cliente.nombre, p.cliente.email, p.cliente.direccion, p.cliente.ciudad, p.items.map(function (it) { return it.qty + ' x ' + it.nombre; }).join(' | '), p.envio, p.total, p.estado];
      })));
    };
    body.onchange = function (e) {
      if (!e.target.matches('[data-west]')) return;
      const list2 = pedidosWeb();
      const p = list2.find(function (x) { return x.num === e.target.dataset.west; });
      p.estado = e.target.value;
      app.store.set('pedidos-web', list2);
      e.target.className = 'estado estado--' + slug(p.estado);
      app.toast(p.num + ': ' + p.estado.toLowerCase());
    };
  }

  /* ---------- Varios ---------- */
  function slug(t) { return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-'); }
  function csv(name, rows) {
    const text = rows.map(function (r) {
      return r.map(function (v) {
        const s = typeof v === 'number' ? String(v).replace('.', ',') : String(v == null ? '' : v);
        return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(';');
    }).join('\r\n');
    const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  let rootEl = null;
  let lastSub = '';
  function reRender() { if (rootEl) render(rootEl, lastSub); }

  window.Empresa = {
    init: function (helpers) {
      app = helpers;
      const pr = document.getElementById('emp-print');
      if (pr) pr.addEventListener('click', function () { window.print(); });
    },
    render: function (root, sub) {
      rootEl = root;
      lastSub = sub;
      render(root, sub);
    },
    // Lo usa la tienda para guardar los pedidos de los clientes
    nuevoPedidoWeb: function (datos) {
      const p = Object.assign({ num: nextNum('web'), fecha: new Date().toISOString(), estado: 'Nuevo' }, datos);
      const list = pedidosWeb();
      list.unshift(p);
      app.store.set('pedidos-web', list);
      return p;
    }
  };
})();
