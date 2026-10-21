/* =========================================================
   Chispa · dibujos de las velas (SVG)
   Velas.svg(opciones) devuelve el SVG de una vela.
   opciones: forma, cera (color), envase (color), cristal, mecha,
             toppings [], etiqueta, encendida, id
   ========================================================= */
(function () {
  'use strict';

  let uid = 0;

  /* ---------- Utilidades de color ---------- */
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(function (c) { return c + c; }).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (v) {
      return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    }).join('');
  }
  // amt > 0 aclara, amt < 0 oscurece (de -1 a 1)
  function shade(hex, amt) {
    if (!hex || hex.indexOf('#') !== 0) return hex;
    const c = hexToRgb(hex);
    const t = amt < 0 ? 0 : 255;
    const p = Math.abs(amt);
    return rgbToHex(c[0] + (t - c[0]) * p, c[1] + (t - c[1]) * p, c[2] + (t - c[2]) * p);
  }

  // Aleatorio con semilla: los mismos toppings siempre en el mismo sitio
  function rng(seed) {
    let s = 0;
    for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /* ---------- Degradados compartidos (se meten una vez en la página) ---------- */
  function ensureDefs() {
    if (document.getElementById('velas-defs')) return;
    const div = document.createElement('div');
    div.innerHTML =
      '<svg id="velas-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
      '<radialGradient id="g-flame" cx="50%" cy="78%" r="65%"><stop offset="0" stop-color="#fffdf0"/><stop offset=".28" stop-color="#ffe7a3"/><stop offset=".6" stop-color="#ffb347"/><stop offset="1" stop-color="#ff7a2f" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="g-glow"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="g-sheen" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".12" stop-color="#fff" stop-opacity=".35"/><stop offset=".22" stop-color="#fff" stop-opacity=".05"/><stop offset=".8" stop-color="#000" stop-opacity=".0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>' +
      '<linearGradient id="g-shade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".1"/><stop offset=".35" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>' +
      '<linearGradient id="g-metal" x1="0" x2="1"><stop offset="0" stop-color="#9aa0a6"/><stop offset=".25" stop-color="#eef0f2"/><stop offset=".55" stop-color="#c4c8cd"/><stop offset="1" stop-color="#8b9096"/></linearGradient>' +
      '<radialGradient id="g-bead" cx="35%" cy="30%"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#d4d8de"/><stop offset="1" stop-color="#8e959f"/></radialGradient>' +
      '</defs></svg>';
    document.body.appendChild(div.firstChild);
  }

  /* ---------- Llama y mecha ---------- */
  function flame(x, y, wood) {
    const wick = wood
      ? '<rect class="v-wick v-wick--wood" x="' + (x - 5) + '" y="' + (y - 4) + '" width="10" height="9" rx="1.5" fill="#7a5232"/><rect x="' + (x - 5) + '" y="' + (y - 4) + '" width="10" height="2.5" rx="1" fill="#2e1f14"/>'
      : '<path class="v-wick" d="M' + x + ' ' + (y + 5) + ' Q' + (x + 1.5) + ' ' + (y - 1) + ' ' + (x + 0.5) + ' ' + (y - 5) + '" stroke="#3b2a1e" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    const fy = wood ? y - 3 : y - 4;
    const w = wood ? 11 : 8.5;
    const h = wood ? 40 : 36;
    return '<g class="v-fire">' +
      '<circle class="v-glow" cx="' + x + '" cy="' + (fy - 14) + '" r="46" fill="url(#g-glow)"/>' +
      '<g class="v-flame"><path d="M' + x + ' ' + (fy - h) + ' C' + (x + w) + ' ' + (fy - h * 0.62) + ' ' + (x + w) + ' ' + (fy - 6) + ' ' + x + ' ' + fy +
      ' C' + (x - w) + ' ' + (fy - 6) + ' ' + (x - w) + ' ' + (fy - h * 0.62) + ' ' + x + ' ' + (fy - h) + 'Z" fill="url(#g-flame)"/>' +
      '<path d="M' + x + ' ' + (fy - h * 0.45) + ' C' + (x + 3.4) + ' ' + (fy - h * 0.3) + ' ' + (x + 3.4) + ' ' + (fy - 5) + ' ' + x + ' ' + (fy - 2) +
      ' C' + (x - 3.4) + ' ' + (fy - 5) + ' ' + (x - 3.4) + ' ' + (fy - h * 0.3) + ' ' + x + ' ' + (fy - h * 0.45) + 'Z" fill="#fffaf0" opacity=".9"/></g>' +
      '</g>' + wick;
  }

  /* ---------- Toppings ---------- */
  function toppings(list, a, seed) {
    if (!list || !list.length) return { svg: '', lift: 0 };
    const r = rng(seed);
    let back = '';
    let front = '';
    let lift = 0;
    const L = a.rx * 0.62;
    list.forEach(function (t, k) {
      const side = k % 2 === 0 ? -1 : 1;
      if (t === 'nata') {
        // Nube de nata que cubre la superficie; la mecha sube
        const cx = a.x;
        const cy = a.y;
        back += '<g class="v-top">' +
          '<ellipse cx="' + cx + '" cy="' + (cy - 2) + '" rx="' + (a.rx * 0.95) + '" ry="' + (a.ry * 1.4) + '" fill="#fffaf2"/>' +
          '<ellipse cx="' + (cx - a.rx * 0.35) + '" cy="' + (cy - 9) + '" rx="' + (a.rx * 0.45) + '" ry="12" fill="#fffdf8"/>' +
          '<ellipse cx="' + (cx + a.rx * 0.32) + '" cy="' + (cy - 8) + '" rx="' + (a.rx * 0.42) + '" ry="11" fill="#fff8ee"/>' +
          '<ellipse cx="' + cx + '" cy="' + (cy - 17) + '" rx="' + (a.rx * 0.4) + '" ry="11" fill="#fffdf8"/>' +
          '<path d="M' + (cx - 10) + ' ' + (cy - 24) + ' Q' + cx + ' ' + (cy - 38) + ' ' + (cx + 10) + ' ' + (cy - 24) + 'Z" fill="#fffaf2"/>' +
          '<path d="M' + (cx - a.rx * 0.6) + ' ' + (cy - 6) + ' q' + (a.rx * 0.3) + ' -8 ' + (a.rx * 0.6) + ' -2" stroke="#efe2cf" stroke-width="2" fill="none" stroke-linecap="round"/>' +
          '</g>';
        lift = Math.max(lift, 28);
        return;
      }
      for (let i = 0; i < 2; i++) {
        const px = a.x + side * (L * (0.45 + r() * 0.5)) * (i === 0 ? 1 : -0.55);
        const py = a.y + (r() - 0.35) * a.ry * 0.9;
        if (t === 'galletas') {
          front += '<g class="v-top"><circle cx="' + px + '" cy="' + (py - 4) + '" r="9" fill="#a8693a"/><circle cx="' + px + '" cy="' + (py - 5) + '" r="7" fill="#c98a52"/>' +
            '<circle cx="' + (px - 2) + '" cy="' + (py - 7) + '" r="1.4" fill="#5a3420"/><circle cx="' + (px + 3) + '" cy="' + (py - 4) + '" r="1.4" fill="#5a3420"/><circle cx="' + (px - 1) + '" cy="' + (py - 2) + '" r="1.2" fill="#5a3420"/></g>';
        } else if (t === 'purpurina') {
          for (let j = 0; j < 5; j++) {
            const sx = a.x + (r() - 0.5) * a.rx * 1.5;
            const sy = a.y + (r() - 0.5) * a.ry * 1.2;
            front += '<path class="v-top v-spark" d="M' + sx + ' ' + (sy - 4) + ' L' + (sx + 1.2) + ' ' + (sy - 1.2) + ' L' + (sx + 4) + ' ' + sy + ' L' + (sx + 1.2) + ' ' + (sy + 1.2) + ' L' + sx + ' ' + (sy + 4) + ' L' + (sx - 1.2) + ' ' + (sy + 1.2) + ' L' + (sx - 4) + ' ' + sy + ' L' + (sx - 1.2) + ' ' + (sy - 1.2) + 'Z" fill="#e8c46a"/>';
          }
          return;
        } else if (t === 'calabacitas') {
          front += '<g class="v-top"><ellipse cx="' + (px - 4) + '" cy="' + (py - 5) + '" rx="6" ry="7" fill="#d9651f"/><ellipse cx="' + (px + 4) + '" cy="' + (py - 5) + '" rx="6" ry="7" fill="#d9651f"/><ellipse cx="' + px + '" cy="' + (py - 5) + '" rx="6" ry="8" fill="#ef8a3a"/><rect x="' + (px - 1.2) + '" y="' + (py - 16) + '" width="2.6" height="5" rx="1" fill="#5d6b34"/></g>';
        } else if (t === 'cactus') {
          if (i > 0) continue;
          front += '<g class="v-top"><rect x="' + (px - 4) + '" y="' + (py - 26) + '" width="8" height="24" rx="4" fill="#6f9a6a"/><path d="M' + (px - 4) + ' ' + (py - 14) + ' h-5 a3 3 0 0 1 -3 -3 v-6" stroke="#6f9a6a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M' + (px + 4) + ' ' + (py - 18) + ' h4 a3 3 0 0 0 3 -3 v-4" stroke="#6f9a6a" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="' + px + '" cy="' + (py - 2) + '" rx="7" ry="2.5" fill="#c88458"/></g>';
        } else if (t === 'signo') {
          if (i > 0) continue;
          front += '<g class="v-top"><circle cx="' + px + '" cy="' + (py - 4) + '" r="10" fill="#d8b25a"/><circle cx="' + px + '" cy="' + (py - 4) + '" r="7.5" fill="none" stroke="#f6e2a8" stroke-width="1"/><text x="' + px + '" y="' + (py - 0.5) + '" text-anchor="middle" font-size="10" fill="#5a3d0f" font-family="serif">' + esc((a.glyph || '✦') + '\uFE0E') + '</text></g>';
        } else if (t === 'gemas') {
          const g = ['#c9a0dc', '#f2b8c6', '#8fc9b0'][Math.floor(r() * 3)];
          front += '<g class="v-top"><path d="M' + px + ' ' + (py - 22) + ' L' + (px + 6) + ' ' + (py - 12) + ' L' + (px + 5) + ' ' + (py - 1) + ' L' + (px - 5) + ' ' + (py - 1) + ' L' + (px - 6) + ' ' + (py - 12) + 'Z" fill="' + g + '"/><path d="M' + px + ' ' + (py - 22) + ' L' + (px + 6) + ' ' + (py - 12) + ' L' + px + ' ' + (py - 9) + 'Z" fill="#fff" opacity=".45"/></g>';
        } else if (t === 'bastones') {
          if (i > 0) continue;
          front += '<g class="v-top"><path d="M' + px + ' ' + (py - 2) + ' V' + (py - 22) + ' a6 6 0 0 1 12 0" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M' + px + ' ' + (py - 2) + ' V' + (py - 22) + ' a6 6 0 0 1 12 0" stroke="#d0342c" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="3 4"/></g>';
        } else if (t === 'fideos') {
          for (let j = 0; j < 9; j++) {
            const sx = a.x + (r() - 0.5) * a.rx * 1.5;
            const sy = a.y + (r() - 0.5) * a.ry * 1.1 - 2;
            const col = ['#f28ca0', '#7cc4e8', '#f6d55c', '#9ad18b', '#c49be8'][j % 5];
            front += '<rect class="v-top" x="' + sx + '" y="' + sy + '" width="6" height="2.4" rx="1.2" fill="' + col + '" transform="rotate(' + Math.round(r() * 180) + ' ' + sx + ' ' + sy + ')"/>';
          }
          return;
        } else if (t === 'nubes') {
          front += '<g class="v-top"><rect x="' + (px - 7) + '" y="' + (py - 12) + '" width="13" height="11" rx="3.5" fill="#fffaf7"/><rect x="' + (px + 1) + '" y="' + (py - 8) + '" width="12" height="10" rx="3.5" fill="#f9dbe3"/></g>';
        } else if (t === 'arandanos') {
          front += '<g class="v-top"><circle cx="' + (px - 4) + '" cy="' + (py - 4) + '" r="5" fill="#3d4f8f"/><circle cx="' + (px + 4) + '" cy="' + (py - 3) + '" r="5" fill="#4a5ea6"/><circle cx="' + px + '" cy="' + (py - 9) + '" r="5" fill="#33447d"/><circle cx="' + (px + 1) + '" cy="' + (py - 10) + '" r="1.2" fill="#9fb0e0"/></g>';
        } else if (t === 'fresas') {
          front += '<g class="v-top"><path d="M' + px + ' ' + (py + 1) + ' C' + (px - 9) + ' ' + (py - 6) + ' ' + (px - 7) + ' ' + (py - 15) + ' ' + px + ' ' + (py - 14) + ' C' + (px + 7) + ' ' + (py - 15) + ' ' + (px + 9) + ' ' + (py - 6) + ' ' + px + ' ' + (py + 1) + 'Z" fill="#d93d4a"/><path d="M' + (px - 5) + ' ' + (py - 14) + ' l5 3 l5 -3 l-5 -2z" fill="#5f8f4e"/><circle cx="' + (px - 2) + '" cy="' + (py - 8) + '" r=".9" fill="#ffd6a0"/><circle cx="' + (px + 2.5) + '" cy="' + (py - 5) + '" r=".9" fill="#ffd6a0"/></g>';
        } else if (t === 'flores') {
          const fc = ['#f3c6d3', '#fff3c4', '#d7c6f0'][Math.floor(r() * 3)];
          let petals = '';
          for (let p = 0; p < 5; p++) {
            const ang = (p / 5) * Math.PI * 2;
            petals += '<ellipse cx="' + (px + Math.cos(ang) * 4.5) + '" cy="' + (py - 6 + Math.sin(ang) * 3.2) + '" rx="3.6" ry="2.8" fill="' + fc + '"/>';
          }
          front += '<g class="v-top">' + petals + '<circle cx="' + px + '" cy="' + (py - 6) + '" r="2.2" fill="#e8b04a"/></g>';
        }
      }
    });
    return { svg: back + front, lift: lift };
  }

  /* ---------- Formas ---------- */
  // Cada forma devuelve { back, front, wick: {x, y}, top: {x, y, rx, ry} }
  const SHAPES = {
    // Vaso de cristal (ámbar, claro o negro) con etiqueta
    vaso: function (o) {
      const glass = o.cristal || 'ambar';
      const tones = {
        ambar: ['#6e3714', '#b8692c', '#7a3e18'],
        negro: ['#1c1714', '#3a302a', '#191411'],
        claro: ['rgba(255,255,255,.25)', 'rgba(255,255,255,.08)', 'rgba(255,255,255,.22)']
      }[glass] || ['#6e3714', '#b8692c', '#7a3e18'];
      const gid = 'gv' + o.id;
      let s = '<defs><linearGradient id="' + gid + '" x1="0" x2="1"><stop offset="0" stop-color="' + tones[0] + '"/><stop offset=".45" stop-color="' + tones[1] + '"/><stop offset="1" stop-color="' + tones[2] + '"/></linearGradient></defs>';
      if (glass === 'claro') {
        s += '<rect x="66" y="114" width="108" height="114" rx="12" class="v-wax" style="fill:' + o.cera + '"/>' +
          '<rect x="66" y="114" width="108" height="114" rx="12" fill="url(#g-shade)"/>';
      }
      s += '<rect x="60" y="96" width="120" height="138" rx="16" fill="url(#' + gid + ')" ' + (glass === 'claro' ? 'stroke="rgba(120,110,100,.35)" stroke-width="2"' : '') + '/>';
      s += '<ellipse cx="120" cy="112" rx="53" ry="9" class="v-wax" style="fill:' + shade(o.cera, 0.08) + '"/>' +
        '<ellipse cx="120" cy="112" rx="53" ry="9" fill="#000" opacity="' + (glass === 'claro' ? 0 : 0.12) + '"/>';
      const front = '<rect x="60" y="96" width="120" height="138" rx="16" fill="url(#g-sheen)"/>' +
        '<ellipse cx="120" cy="97" rx="59" ry="6" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>' +
        (o.etiqueta !== false ? '<g class="v-label"><rect x="86" y="146" width="68" height="56" rx="2" fill="#f1e8db"/><text x="120" y="167" text-anchor="middle" font-family="Jost, sans-serif" font-size="7" letter-spacing="2.4" fill="#5b3a29">CHISPA</text><line x1="112" y1="174" x2="128" y2="174" stroke="#b9a58e" stroke-width=".8"/><text x="120" y="188" text-anchor="middle" font-family="Jost, sans-serif" font-size="5.4" letter-spacing="1.6" fill="#7b6a5e">' + esc((o.etiquetaTexto || '').toUpperCase()).slice(0, 16) + '</text></g>' : '');
      return { back: s, front: front, wick: { x: 120, y: 110 }, top: { x: 120, y: 113, rx: 50, ry: 8 } };
    },

    // Taza con asa
    taza: function (o) {
      const c = o.envase || '#efe6da';
      const s = '<path d="M176 128 C 210 128, 210 192, 172 190" stroke="' + shade(c, -0.12) + '" stroke-width="13" fill="none" stroke-linecap="round"/>' +
        '<path d="M64 104 L176 104 L170 214 C 169 227, 159 234, 146 234 L94 234 C 81 234, 71 227, 70 214 Z" class="v-env" style="fill:' + c + '"/>' +
        '<path d="M64 104 L176 104 L170 214 C 169 227, 159 234, 146 234 L94 234 C 81 234, 71 227, 70 214 Z" fill="url(#g-shade)"/>' +
        '<ellipse cx="120" cy="104" rx="56" ry="11" fill="' + shade(c, -0.18) + '"/>' +
        '<ellipse cx="120" cy="107" rx="50" ry="8.5" class="v-wax" style="fill:' + o.cera + '"/>';
      return { back: s, front: '', wick: { x: 120, y: 105 }, top: { x: 120, y: 108, rx: 48, ry: 8 } };
    },

    // Copa de cristal
    copa: function (o) {
      const gid = 'gc' + o.id;
      const s = '<defs><clipPath id="' + gid + '"><path d="M66 82 C66 146 90 176 120 176 C150 176 174 146 174 82 Z"/></clipPath></defs>' +
        '<ellipse cx="120" cy="228" rx="42" ry="8" fill="rgba(255,255,255,.55)" stroke="rgba(130,120,110,.35)"/>' +
        '<rect x="116" y="174" width="8" height="52" rx="3" fill="rgba(255,255,255,.6)" stroke="rgba(130,120,110,.3)"/>' +
        '<g clip-path="url(#' + gid + ')"><rect x="60" y="114" width="120" height="70" class="v-wax" style="fill:' + o.cera + '"/><rect x="60" y="114" width="120" height="70" fill="url(#g-shade)"/></g>' +
        '<ellipse cx="120" cy="114" rx="50" ry="8" class="v-wax" style="fill:' + shade(o.cera, 0.1) + '"/>';
      const front = '<path d="M66 82 C66 146 90 176 120 176 C150 176 174 146 174 82 Z" fill="rgba(255,255,255,.14)" stroke="rgba(120,110,100,.4)" stroke-width="1.6"/>' +
        '<path d="M78 92 C 78 130, 90 156, 104 166" stroke="rgba(255,255,255,.7)" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="120" cy="82" rx="54" ry="7" fill="none" stroke="rgba(120,110,100,.4)" stroke-width="1.4"/>';
      return { back: s, front: front, wick: { x: 120, y: 112 }, top: { x: 120, y: 115, rx: 46, ry: 7 } };
    },

    // Tarro de galletas
    tarro: function (o) {
      const s = '<rect x="80" y="84" width="80" height="16" rx="5" fill="rgba(255,255,255,.35)" stroke="rgba(120,110,100,.35)"/>' +
        '<path d="M62 116 Q62 100 80 100 L160 100 Q178 100 178 116 L178 208 Q178 234 152 234 L88 234 Q62 234 62 208 Z" fill="rgba(255,255,255,.18)" stroke="rgba(120,110,100,.35)" stroke-width="1.8"/>' +
        '<path d="M68 132 L172 132 L172 206 Q172 228 150 228 L90 228 Q68 228 68 206 Z" class="v-wax" style="fill:' + o.cera + '"/>' +
        '<path d="M68 132 L172 132 L172 206 Q172 228 150 228 L90 228 Q68 228 68 206 Z" fill="url(#g-shade)"/>' +
        '<ellipse cx="120" cy="132" rx="52" ry="9" class="v-wax" style="fill:' + shade(o.cera, 0.1) + '"/>';
      const front = '<path d="M70 112 C 70 160, 72 196, 80 216" stroke="rgba(255,255,255,.65)" stroke-width="3" fill="none" stroke-linecap="round"/>';
      return { back: s, front: front, wick: { x: 120, y: 130 }, top: { x: 120, y: 133, rx: 48, ry: 8 } };
    },

    // Tarta (molde de tarta)
    tarta: function (o) {
      const c = o.cera;
      const frost = o.envase || '#fff6ec';
      const s = '<ellipse cx="120" cy="222" rx="92" ry="14" fill="#f7f2ea" stroke="#e2d6c6"/>' +
        '<path d="M46 132 L46 208 A74 16 0 0 0 194 208 L194 132 Z" class="v-wax" style="fill:' + c + '"/>' +
        '<path d="M46 132 L46 208 A74 16 0 0 0 194 208 L194 132 Z" fill="url(#g-shade)"/>' +
        '<path d="M46 160 A74 16 0 0 0 194 160" stroke="' + shade(c, -0.15) + '" stroke-width="5" fill="none" opacity=".55"/>' +
        '<path d="M46 132 L46 150 Q52 162 58 150 L58 146 Q66 170 74 148 Q82 158 92 150 Q100 172 110 152 Q120 160 130 152 Q138 168 148 150 Q158 158 166 148 Q174 164 182 148 Q188 156 194 148 L194 132 Z" fill="' + frost + '"/>' +
        '<ellipse cx="120" cy="132" rx="74" ry="17" fill="' + frost + '"/>' +
        '<ellipse cx="120" cy="132" rx="74" ry="17" fill="#000" opacity=".03"/>';
      return { back: s, front: '', wick: { x: 120, y: 128 }, top: { x: 120, y: 132, rx: 64, ry: 13 } };
    },

    // Calabaza
    calabaza: function (o) {
      const c = o.cera;
      const s = '<ellipse cx="78" cy="180" rx="34" ry="50" fill="' + shade(c, -0.14) + '"/>' +
        '<ellipse cx="162" cy="180" rx="34" ry="50" fill="' + shade(c, -0.14) + '"/>' +
        '<ellipse cx="98" cy="178" rx="34" ry="56" class="v-wax" style="fill:' + shade(c, -0.04) + '"/>' +
        '<ellipse cx="142" cy="178" rx="34" ry="56" class="v-wax" style="fill:' + shade(c, -0.04) + '"/>' +
        '<ellipse cx="120" cy="176" rx="34" ry="60" class="v-wax" style="fill:' + c + '"/>' +
        '<ellipse cx="120" cy="176" rx="34" ry="60" fill="url(#g-shade)" opacity=".7"/>' +
        '<path d="M104 124 Q102 108 110 98" stroke="#5d6b34" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<path d="M110 100 q14 -6 20 6" stroke="#7b8a45" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
      return { back: s, front: '', wick: { x: 128, y: 118 }, top: { x: 120, y: 124, rx: 40, ry: 8 } };
    },

    // Árbol de Navidad
    arbol: function (o) {
      const c = o.cera;
      const s = '<rect x="110" y="214" width="20" height="18" rx="3" fill="#8a5a3b"/>' +
        '<path d="M120 142 L180 218 Q120 232 60 218 Z" class="v-wax" style="fill:' + shade(c, -0.12) + '"/>' +
        '<path d="M120 112 L168 176 Q120 188 72 176 Z" class="v-wax" style="fill:' + shade(c, -0.05) + '"/>' +
        '<path d="M120 86 L154 136 Q120 146 86 136 Z" class="v-wax" style="fill:' + c + '"/>' +
        '<path d="M60 218 Q120 232 180 218" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>' +
        '<path d="M72 176 Q120 188 168 176" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>' +
        '<path d="M86 136 Q120 146 154 136" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>' +
        '<circle cx="98" cy="198" r="4" fill="#d0342c"/><circle cx="146" cy="204" r="4" fill="#e8c46a"/><circle cx="128" cy="160" r="4" fill="#d0342c"/><circle cx="104" cy="156" r="3.5" fill="#e8c46a"/>';
      return { back: s, front: '', wick: { x: 120, y: 88 }, top: { x: 120, y: 200, rx: 50, ry: 10 } };
    },

    // Huevo de Pascua
    huevo: function (o) {
      const c = o.cera;
      const cid = 'ch' + o.id;
      const s = '<defs><clipPath id="' + cid + '"><ellipse cx="120" cy="168" rx="54" ry="66"/></clipPath></defs>' +
        '<ellipse cx="120" cy="168" rx="54" ry="66" class="v-wax" style="fill:' + c + '"/>' +
        '<g clip-path="url(#' + cid + ')">' +
        '<path d="M60 160 L74 148 L88 160 L102 148 L116 160 L130 148 L144 160 L158 148 L172 160 L186 148 L186 166 L172 178 L158 166 L144 178 L130 166 L116 178 L102 166 L88 178 L74 166 L60 178Z" fill="' + shade(c, -0.2) + '" opacity=".7"/>' +
        '<rect x="50" y="196" width="140" height="7" fill="#fff" opacity=".7"/>' +
        '<circle cx="96" cy="126" r="5" fill="#fff" opacity=".75"/><circle cx="120" cy="120" r="5" fill="#fff" opacity=".75"/><circle cx="144" cy="126" r="5" fill="#fff" opacity=".75"/>' +
        '<ellipse cx="120" cy="168" rx="54" ry="66" fill="url(#g-shade)"/></g>';
      return { back: s, front: '', wick: { x: 120, y: 104 }, top: { x: 120, y: 112, rx: 30, ry: 6 } };
    },

    // Corazón
    corazon: function (o) {
      const c = o.cera;
      const s = '<path d="M120 230 C 58 190, 44 152, 56 124 C 68 96, 104 94, 120 120 C 136 94, 172 96, 184 124 C 196 152, 182 190, 120 230 Z" class="v-wax" style="fill:' + c + '"/>' +
        '<path d="M120 230 C 58 190, 44 152, 56 124 C 68 96, 104 94, 120 120 C 136 94, 172 96, 184 124 C 196 152, 182 190, 120 230 Z" fill="url(#g-shade)"/>' +
        '<path d="M70 128 C 76 110, 96 108, 106 122" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".45"/>';
      return { back: s, front: '', wick: { x: 120, y: 120 }, top: { x: 120, y: 160, rx: 42, ry: 10 } };
    },

    // Cupcake
    cupcake: function (o) {
      const c = o.cera;
      const wrap = o.envase || '#f2c6cf';
      let stripes = '';
      for (let i = 0; i < 7; i++) {
        const x1 = 82 + i * 12.5;
        stripes += '<line x1="' + x1 + '" y1="164" x2="' + (90 + i * 10) + '" y2="230" stroke="' + shade(wrap, -0.15) + '" stroke-width="2.4"/>';
      }
      const s = '<path d="M76 162 L164 162 L152 232 L88 232 Z" class="v-env" style="fill:' + wrap + '"/>' + stripes +
        '<path d="M76 162 L164 162 L152 232 L88 232 Z" fill="url(#g-shade)"/>' +
        '<ellipse cx="120" cy="160" rx="54" ry="16" class="v-wax" style="fill:' + shade(c, -0.08) + '"/>' +
        '<ellipse cx="120" cy="146" rx="46" ry="17" class="v-wax" style="fill:' + c + '"/>' +
        '<ellipse cx="120" cy="130" rx="34" ry="15" class="v-wax" style="fill:' + shade(c, 0.06) + '"/>' +
        '<ellipse cx="120" cy="116" rx="20" ry="11" class="v-wax" style="fill:' + shade(c, 0.12) + '"/>' +
        '<circle cx="142" cy="116" r="8" fill="#c0283a"/><circle cx="139" cy="113" r="2" fill="#fff" opacity=".6"/>' +
        '<path d="M142 108 q4 -10 10 -12" stroke="#5f8f4e" stroke-width="2" fill="none"/>';
      return { back: s, front: '', wick: { x: 118, y: 108 }, top: { x: 120, y: 146, rx: 40, ry: 10 } };
    },

    // Donut
    donut: function (o) {
      const c = o.cera;
      const mid = 'md' + o.id;
      const s = '<defs><mask id="' + mid + '"><rect width="240" height="260" fill="#fff"/><ellipse cx="120" cy="178" rx="22" ry="11" fill="#000"/></mask></defs>' +
        '<g mask="url(#' + mid + ')">' +
        '<ellipse cx="120" cy="182" rx="80" ry="48" fill="#d39a5e"/>' +
        '<ellipse cx="120" cy="190" rx="80" ry="42" fill="#c0844a" opacity=".5"/>' +
        '<path d="M44 172 Q48 144 120 136 Q192 144 196 172 Q190 190 178 186 Q170 200 160 190 Q148 204 136 194 Q124 206 112 194 Q98 204 88 192 Q76 200 68 188 Q52 192 44 172 Z" class="v-wax" style="fill:' + c + '"/>' +
        '<path d="M44 172 Q48 144 120 136 Q192 144 196 172" fill="none" stroke="#fff" stroke-width="3" opacity=".35"/>' +
        '</g><ellipse cx="120" cy="176" rx="22" ry="10" fill="none" stroke="#a86f3c" stroke-width="2" opacity=".5"/>';
      return { back: s, front: '', wick: { x: 120, y: 148 }, top: { x: 120, y: 160, rx: 62, ry: 14 } };
    },

    // Cubo de palomitas
    palomitas: function (o) {
      const cid = 'cp' + o.id;
      let pop = '';
      const pts = [[82, 112], [96, 100], [112, 94], [128, 96], [144, 100], [158, 112], [90, 120], [106, 112], [122, 108], [138, 112], [152, 120], [100, 126], [140, 126], [120, 120]];
      pts.forEach(function (p, i) {
        pop += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (11 + (i % 3)) + '" fill="' + (i % 4 === 0 ? '#f6dc8f' : '#fff6e0') + '" stroke="#ead6a8" stroke-width="1"/>';
      });
      const s = '<defs><clipPath id="' + cid + '"><path d="M70 122 L170 122 L156 234 L84 234 Z"/></clipPath></defs>' + pop +
        '<g clip-path="url(#' + cid + ')"><rect x="60" y="120" width="130" height="120" fill="#fff"/>' +
        '<rect x="74" y="120" width="16" height="120" fill="#d0342c"/><rect x="106" y="120" width="16" height="120" fill="#d0342c"/><rect x="138" y="120" width="16" height="120" fill="#d0342c"/>' +
        '<rect x="60" y="120" width="130" height="120" fill="url(#g-shade)"/></g>' +
        '<rect x="66" y="118" width="108" height="10" rx="3" fill="#f3efe9"/>';
      return { back: s, front: '', wick: { x: 120, y: 92 }, top: { x: 120, y: 112, rx: 40, ry: 8 } };
    },

    // Suculenta en maceta
    suculenta: function (o) {
      const c = o.cera;
      let leaves = '';
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * 360;
        leaves += '<ellipse cx="120" cy="128" rx="9" ry="28" transform="rotate(' + ang + ' 120 152) translate(0 -2)" class="v-wax" style="fill:' + shade(c, -0.08) + '"/>';
      }
      for (let i = 0; i < 7; i++) {
        const ang = (i / 7) * 360 + 20;
        leaves += '<ellipse cx="120" cy="138" rx="7" ry="18" transform="rotate(' + ang + ' 120 152)" class="v-wax" style="fill:' + c + '"/>';
      }
      const s = '<path d="M74 168 L166 168 L156 232 L84 232 Z" fill="#c4734f"/><path d="M74 168 L166 168 L156 232 L84 232 Z" fill="url(#g-shade)"/>' +
        '<rect x="68" y="158" width="104" height="18" rx="4" fill="#b5653f"/>' + leaves +
        '<circle cx="120" cy="152" r="8" class="v-wax" style="fill:' + shade(c, 0.15) + '"/>';
      return { back: s, front: '', wick: { x: 120, y: 146 }, top: { x: 120, y: 160, rx: 44, ry: 8 } };
    },

    // Cubo de burbujas (escultórica)
    burbujas: function (o) {
      const c = o.cera;
      let b = '';
      const rows = [[148, 3], [182, 3], [216, 3]];
      rows.forEach(function (row, ri) {
        for (let i = 0; i < row[1]; i++) {
          const x = 86 + i * 34;
          b += '<circle cx="' + x + '" cy="' + row[0] + '" r="19" class="v-wax" style="fill:' + shade(c, -0.06 * ri) + '" stroke="' + shade(c, -0.18) + '" stroke-width="1.5"/>' +
            '<circle cx="' + (x - 6) + '" cy="' + (row[0] - 7) + '" r="6" fill="#fff" opacity=".35"/>';
        }
      });
      b += '<g opacity=".95">';
      for (let i = 0; i < 3; i++) {
        b += '<ellipse cx="' + (86 + i * 34) + '" cy="128" rx="18" ry="9" class="v-wax" style="fill:' + shade(c, 0.12) + '"/>';
      }
      b += '</g>';
      return { back: b, front: '', wick: { x: 120, y: 126 }, top: { x: 120, y: 130, rx: 40, ry: 6 } };
    },

    // Arco (escultórica)
    arco: function (o) {
      const c = o.cera;
      const mid = 'ma' + o.id;
      const s = '<defs><mask id="' + mid + '"><rect width="240" height="260" fill="#fff"/><path d="M98 234 L98 168 A22 22 0 0 1 142 168 L142 234 Z" fill="#000"/></mask></defs>' +
        '<g mask="url(#' + mid + ')"><path d="M66 234 L66 150 A54 54 0 0 1 174 150 L174 234 Z" class="v-wax" style="fill:' + c + '"/>' +
        '<path d="M66 234 L66 150 A54 54 0 0 1 174 150 L174 234 Z" fill="url(#g-shade)"/></g>';
      return { back: s, front: '', wick: { x: 120, y: 96 }, top: { x: 120, y: 120, rx: 30, ry: 6 } };
    },

    // Esfera
    esfera: function (o) {
      const c = o.cera;
      const s = '<circle cx="120" cy="172" r="62" class="v-wax" style="fill:' + c + '"/>' +
        '<path d="M70 150 Q120 132 170 150 M62 178 Q120 160 178 178 M70 206 Q120 188 170 206" stroke="' + shade(c, -0.12) + '" stroke-width="3" fill="none" opacity=".6"/>' +
        '<circle cx="120" cy="172" r="62" fill="url(#g-shade)"/>';
      return { back: s, front: '', wick: { x: 120, y: 110 }, top: { x: 120, y: 120, rx: 26, ry: 5 } };
    },

    // Vela con gemas (mística)
    gemas: function (o) {
      const c = o.cera;
      const g = o.envase || '#b18ad0';
      const s = '<rect x="68" y="150" width="104" height="84" rx="10" class="v-wax" style="fill:' + c + '"/>' +
        '<rect x="68" y="150" width="104" height="84" rx="10" fill="url(#g-shade)"/>' +
        '<ellipse cx="120" cy="150" rx="52" ry="11" class="v-wax" style="fill:' + shade(c, 0.1) + '"/>' +
        '<path d="M84 152 L92 116 L100 104 L106 118 L104 152 Z" fill="' + g + '"/><path d="M92 116 L100 104 L104 152 L98 152Z" fill="#fff" opacity=".3"/>' +
        '<path d="M140 154 L144 124 L152 112 L160 126 L158 154 Z" fill="' + shade(g, -0.12) + '"/><path d="M144 124 L152 112 L154 154 L150 154Z" fill="#fff" opacity=".3"/>' +
        '<path d="M104 156 L108 136 L114 128 L120 138 L118 156 Z" fill="' + shade(g, 0.15) + '"/>';
      return { back: s, front: '', wick: { x: 128, y: 148 }, top: { x: 120, y: 152, rx: 46, ry: 8 } };
    },

    // Lata (zodiaco, mística)
    lata: function (o) {
      const band = o.envase || '#5b3a29';
      const s = '<rect x="56" y="150" width="128" height="80" rx="8" fill="url(#g-metal)"/>' +
        '<rect x="56" y="166" width="128" height="48" fill="' + band + '"/>' +
        '<text x="120" y="200" text-anchor="middle" font-size="26" fill="#f6e7c8" font-family="serif">' + esc((o.glyph || '✦') + '\uFE0E') + '</text>' +
        '<ellipse cx="120" cy="150" rx="64" ry="11" fill="#b9bdc2"/>' +
        '<ellipse cx="120" cy="151" rx="58" ry="9" class="v-wax" style="fill:' + o.cera + '"/>';
      return { back: s, front: '', wick: { x: 120, y: 150 }, top: { x: 120, y: 151, rx: 54, ry: 8 } };
    },

    // Fantasma
    fantasma: function (o) {
      const c = o.cera;
      const s = '<path d="M76 232 C 78 150, 90 108, 120 104 C 150 108, 162 150, 164 232 Q156 220 148 232 Q140 220 132 232 Q124 220 116 232 Q108 220 100 232 Q92 220 84 232 Q80 226 76 232 Z" class="v-wax" style="fill:' + c + '"/>' +
        '<path d="M76 232 C 78 150, 90 108, 120 104 C 150 108, 162 150, 164 232" fill="url(#g-shade)"/>' +
        '<ellipse cx="106" cy="150" rx="6" ry="9" fill="#3a2a2a"/><ellipse cx="134" cy="150" rx="6" ry="9" fill="#3a2a2a"/>' +
        '<ellipse cx="120" cy="174" rx="7" ry="5" fill="#3a2a2a" opacity=".8"/>' +
        '<ellipse cx="96" cy="166" rx="7" ry="3.5" fill="#f2a7b5" opacity=".6"/><ellipse cx="144" cy="166" rx="7" ry="3.5" fill="#f2a7b5" opacity=".6"/>';
      return { back: s, front: '', wick: { x: 120, y: 104 }, top: { x: 120, y: 112, rx: 24, ry: 5 } };
    }
  };

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  /* ---------- Vela completa ---------- */
  function svg(opts) {
    ensureDefs();
    const o = Object.assign({ forma: 'vaso', cera: '#f3e6d3', mecha: 'algodon', toppings: [], encendida: false }, opts || {});
    o.id = (o.id || 'v') + '-' + (++uid);
    const shape = (SHAPES[o.forma] || SHAPES.vaso)(o);
    const tops = toppings(o.toppings, Object.assign({ glyph: o.glyph }, shape.top), String(opts && opts.id || o.forma) + o.toppings.join(''));
    const wx = shape.wick.x;
    const wy = shape.wick.y - tops.lift;
    const title = o.titulo ? '<title>' + esc(o.titulo) + '</title>' : '';
    return '<svg class="vela' + (o.encendida ? ' is-lit' : '') + '" viewBox="0 0 240 260" role="img"' + (o.titulo ? '' : ' aria-hidden="true"') + '>' + title +
      '<ellipse class="v-shadow" cx="120" cy="238" rx="74" ry="9" fill="rgba(60,30,15,.16)"/>' +
      shape.back + tops.svg + (shape.front || '') + flame(wx, wy, o.mecha === 'madera') +
      '</svg>';
  }

  window.Velas = { svg: svg, shade: shade, formas: Object.keys(SHAPES) };
})();
