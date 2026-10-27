/* =========================================================
   Vibra · catálogo (prototipo)
   Precios según el plan: colección 13-15 €, personalizada 16-18 €,
   packs 28-35 €. Coste de cada vela: 3,50-5 €.
   ========================================================= */
window.TIENDA = {
  marca: 'Vibra',
  envioGratis: 45,

  // Grupos del menú
  tematicas: {
    halloween:   { nombre: 'Halloween', corto: 'Halloween', desc: 'Calabazas, fantasmas, sombreros de bruja y pócimas.', aromas: ['Calabaza especiada', 'Manzana con canela', 'Humo de madera', 'Frutos del bosque oscuros'], color: '#e07a2e' },
    navidad:     { nombre: 'Navidad e invierno', corto: 'Navidad', desc: 'Árboles, copos de nieve, muñecos de jengibre y bastones de caramelo.', aromas: ['Pino silvestre', 'Galleta de jengibre', 'Chocolate caliente', 'Vino caliente con especias'], color: '#3f6b4f' },
    pascua:      { nombre: 'Pascua y primavera', corto: 'Pascua', desc: 'Huevos decorados, conejitos, nidos y flores.', aromas: ['Zanahoria dulzona', 'Vainilla', 'Flores frescas', 'Miel'], color: '#9cc9b4' },
    sanvalentin: { nombre: 'San Valentín', corto: 'San Valentín', desc: 'Corazones y tartas románticas.', aromas: ['Fresas con nata', 'Champán'], color: '#d9465f' },
    misticas:    { nombre: 'Místicas', corto: 'Místicas', desc: 'Fases lunares, calaveras y cartas de tarot.', aromas: ['Incienso', 'Mirra', 'Sándalo'], color: '#3c3566' }
  },
  colecciones: {
    dulces:      { nombre: 'Dulces y repostería', corto: 'Dulces', desc: 'Velas en taza, tartas, cupcakes, donuts y golosinas.', aromas: ['Vainilla de Madagascar', 'Caramelo salado', 'Tarta de queso con arándanos', 'Algodón de azúcar', 'Cacao puro'] },
    salados:     { nombre: 'Salados y snacks', corto: 'Salados', desc: 'Cubos de palomitas, tarros de crema de cacahuete y miel con frutos secos.', aromas: ['Palomitas mantequilladas', 'Mantequilla de cacahuete', 'Miel con frutos secos', 'Maíz tostado'] },
    naturaleza:  { nombre: 'Naturaleza y botánica', corto: 'Naturaleza', desc: 'Suculentas, cactus, piñas y flores en 3D hechas de cera.', aromas: ['Eucalipto fresco', 'Bosque de pinos', 'Lavanda silvestre', 'Flor de azahar', 'Rocío matinal', 'Tierra mojada'] },
    zodiaco:     { nombre: 'Signos del zodiaco', corto: 'Zodiaco', desc: 'Una vela para cada signo, con los colores y el aroma de su elemento.', aromas: ['Cítricos (fuego)', 'Lavanda y maderas (tierra)', 'Florales (aire)', 'Marinos y dulces (agua)'] },
    mistica:     { nombre: 'Mística, cristales y energías', corto: 'Mística', desc: 'Velas de intención con gemas hechas de cera: cuarzo rosa, amatista y jade.', aromas: ['Sándalo', 'Incienso', 'Palo santo', 'Salvia blanca', 'Mirra'] },
    escultorica: { nombre: 'Arte escultórico', corto: 'Escultórica', desc: 'Arcos, esferas y formas geométricas para decorar.', aromas: ['Lino blanco', 'Ámbar', 'Cedro puro', 'Algodón'] }
  },
  madera: {
    dulce:   { nombre: 'Gourmand y dulce', desc: 'Tazas de café y cacao con mecha de madera.' },
    festiva: { nombre: 'Festiva y navideña', desc: 'Aromas de pino, chimenea y noches de otoño.' },
    bosque:  { nombre: 'Naturaleza y bosque', desc: 'Pino, cedro y ámbar.' }
  },

  // Zodiaco: elemento, color y aroma
  signos: [
    { id: 'aries', nombre: 'Aries', glifo: '♈', elemento: 'fuego' },
    { id: 'tauro', nombre: 'Tauro', glifo: '♉', elemento: 'tierra' },
    { id: 'geminis', nombre: 'Géminis', glifo: '♊', elemento: 'aire' },
    { id: 'cancer', nombre: 'Cáncer', glifo: '♋', elemento: 'agua' },
    { id: 'leo', nombre: 'Leo', glifo: '♌', elemento: 'fuego' },
    { id: 'virgo', nombre: 'Virgo', glifo: '♍', elemento: 'tierra' },
    { id: 'libra', nombre: 'Libra', glifo: '♎', elemento: 'aire' },
    { id: 'escorpio', nombre: 'Escorpio', glifo: '♏', elemento: 'agua' },
    { id: 'sagitario', nombre: 'Sagitario', glifo: '♐', elemento: 'fuego' },
    { id: 'capricornio', nombre: 'Capricornio', glifo: '♑', elemento: 'tierra' },
    { id: 'acuario', nombre: 'Acuario', glifo: '♒', elemento: 'aire' },
    { id: 'piscis', nombre: 'Piscis', glifo: '♓', elemento: 'agua' }
  ],
  elementos: {
    fuego:  { nombre: 'Fuego', color: '#c8553d', aroma: 'Cítricos intensos', producto: 'vela-fuego' },
    tierra: { nombre: 'Tierra', color: '#7d8c56', aroma: 'Lavanda y maderas', producto: 'vela-tierra' },
    aire:   { nombre: 'Aire', color: '#9db7de', aroma: 'Florales', producto: 'vela-aire' },
    agua:   { nombre: 'Agua', color: '#2f6f9f', aroma: 'Marinos y dulces', producto: 'vela-agua' }
  },

  /* Productos
     grupo: tematicas | colecciones | regalos
     sub:   clave dentro del grupo
     comestible: true si parece comida (lleva el aviso "no es comestible")
     vela: opciones del dibujo (ver velas.js) */
  productos: [
    // ---- Halloween
    { id: 'calabaza-especiada', nombre: 'Calabaza especiada', grupo: 'tematicas', sub: 'halloween', precio: 14, aroma: 'Calabaza especiada', notas: ['Canela', 'Calabaza asada', 'Vainilla'], mecha: 'algodon', nuevo: true,
      desc: 'Una calabaza de cera de soja que huele a tarde de otoño.', vela: { forma: 'calabaza', cera: '#e07a2e' } },
    { id: 'fantasmita', nombre: 'Fantasmita', grupo: 'tematicas', sub: 'halloween', precio: 13, aroma: 'Manzana con canela', notas: ['Manzana verde', 'Canela', 'Azúcar moreno'], mecha: 'algodon',
      desc: 'El fantasma más tierno de la casa. Mejor encenderlo con alguien cerca.', vela: { forma: 'fantasma', cera: '#f6f1ea' } },
    { id: 'pocima-de-bruja', nombre: 'Pócima de bruja', grupo: 'tematicas', sub: 'halloween', precio: 15, aroma: 'Frutos del bosque oscuros', notas: ['Mora', 'Grosella negra', 'Pachuli'], mecha: 'madera', maderaGrupo: 'festiva',
      desc: 'Copa de cristal con cera morada y purpurina biodegradable.', vela: { forma: 'copa', cera: '#5b3a8c', toppings: ['purpurina'] } },
    { id: 'noche-de-hoguera', nombre: 'Noche de hoguera', grupo: 'tematicas', sub: 'halloween', precio: 15, aroma: 'Humo de madera', notas: ['Hojas secas', 'Humo de madera', 'Ámbar'], mecha: 'madera', maderaGrupo: 'festiva',
      desc: 'Vaso negro y mecha de madera que cruje como una hoguera.', vela: { forma: 'vaso', cristal: 'negro', cera: '#efe6d6', etiquetaTexto: 'Hoguera' } },

    // ---- Navidad
    { id: 'abeto-nevado', nombre: 'Abeto nevado', grupo: 'tematicas', sub: 'navidad', precio: 14, aroma: 'Pino silvestre', notas: ['Agujas de pino', 'Resina', 'Musgo'], mecha: 'algodon',
      desc: 'Un árbol de tres pisos con nieve de cera y bolitas de colores.', vela: { forma: 'arbol', cera: '#3f6b4f' } },
    { id: 'galleta-de-jengibre', nombre: 'Galleta de jengibre', grupo: 'tematicas', sub: 'navidad', precio: 15, aroma: 'Galleta de jengibre', notas: ['Jengibre', 'Canela', 'Miel'], mecha: 'algodon', comestible: true,
      desc: 'Taza roja con nata de cera y galletitas por encima.', vela: { forma: 'taza', envase: '#b8352b', cera: '#f3e3cf', toppings: ['nata', 'galletas'] } },
    { id: 'chocolate-caliente', nombre: 'Chocolate caliente', grupo: 'tematicas', sub: 'navidad', precio: 15, aroma: 'Chocolate caliente', notas: ['Cacao', 'Nube de golosina', 'Vainilla'], mecha: 'madera', maderaGrupo: 'festiva', comestible: true,
      desc: 'Con nubes de cera y mecha de madera: suena a chimenea.', vela: { forma: 'taza', envase: '#efe6da', cera: '#6b3b26', toppings: ['nubes'] } },
    { id: 'vino-especiado', nombre: 'Vino caliente', grupo: 'tematicas', sub: 'navidad', precio: 14, aroma: 'Vino caliente con especias', notas: ['Naranja', 'Clavo', 'Vino tinto'], mecha: 'algodon',
      desc: 'Copa de cristal con cera granate. Huele a mercadillo de Navidad.', vela: { forma: 'copa', cera: '#7a1f2b', toppings: ['bastones'] } },

    // ---- Pascua
    { id: 'huevo-pintado', nombre: 'Huevo pintado', grupo: 'tematicas', sub: 'pascua', precio: 13, aroma: 'Vainilla', notas: ['Leche', 'Vainilla', 'Haba tonka'], mecha: 'algodon',
      desc: 'Huevo de cera pintado a mano en tonos pastel.', vela: { forma: 'huevo', cera: '#c8ead9' } },
    { id: 'tarro-de-miel', nombre: 'Tarro de miel', grupo: 'tematicas', sub: 'pascua', precio: 14, aroma: 'Miel', notas: ['Flor de naranjo', 'Miel', 'Cera de abeja'], mecha: 'algodon',
      desc: 'Tarro de cristal con flores de cera por encima.', vela: { forma: 'tarro', cera: '#f2c46d', toppings: ['flores'] } },
    { id: 'tarta-de-zanahoria', nombre: 'Tarta de zanahoria', grupo: 'tematicas', sub: 'pascua', precio: 15, aroma: 'Zanahoria dulzona', notas: ['Zanahoria', 'Nuez moscada', 'Crema de queso'], mecha: 'algodon', comestible: true,
      desc: 'Tarta naranja con glaseado blanco y flores.', vela: { forma: 'tarta', cera: '#f0a35a', toppings: ['flores'] } },

    // ---- San Valentín
    { id: 'corazon', nombre: 'Corazón', grupo: 'tematicas', sub: 'sanvalentin', precio: 13, aroma: 'Fresas con nata', notas: ['Fresa', 'Nata', 'Azúcar'], mecha: 'algodon',
      desc: 'Un corazón de cera para decir lo que cuesta decir.', vela: { forma: 'corazon', cera: '#d9465f' } },
    { id: 'tarta-para-dos', nombre: 'Tarta para dos', grupo: 'tematicas', sub: 'sanvalentin', precio: 15, aroma: 'Fresas con nata', notas: ['Fresa', 'Nata montada', 'Vainilla'], mecha: 'algodon', comestible: true,
      desc: 'Tarta rosa con nata y fresas de cera.', vela: { forma: 'tarta', cera: '#f2b8c6', toppings: ['nata', 'fresas'] } },
    { id: 'brindis', nombre: 'Brindis', grupo: 'tematicas', sub: 'sanvalentin', precio: 15, aroma: 'Champán', notas: ['Pera', 'Champán', 'Almizcle blanco'], mecha: 'algodon',
      desc: 'Copa dorada con purpurina. Para celebrar.', vela: { forma: 'copa', cera: '#f1d38a', toppings: ['purpurina'] } },

    // ---- Místicas (temáticas)
    { id: 'fases-de-la-luna', nombre: 'Fases de la luna', grupo: 'tematicas', sub: 'misticas', precio: 14, aroma: 'Incienso', notas: ['Bergamota', 'Incienso', 'Madera de cedro'], mecha: 'algodon',
      desc: 'Lata azul noche con la luna.', vela: { forma: 'lata', envase: '#2c3157', cera: '#f4ece2', glyph: '☾' } },
    { id: 'arcano', nombre: 'Arcano', grupo: 'tematicas', sub: 'misticas', precio: 15, aroma: 'Mirra', notas: ['Pimienta rosa', 'Mirra', 'Vainilla oscura'], mecha: 'algodon',
      desc: 'Vaso negro con cristales de cera por encima.', vela: { forma: 'vaso', cristal: 'negro', cera: '#e9e0f2', toppings: ['gemas'], etiquetaTexto: 'Arcano' } },

    // ---- Dulces
    { id: 'batido-con-nata', nombre: 'Batido con nata', grupo: 'colecciones', sub: 'dulces', precio: 14, aroma: 'Algodón de azúcar', notas: ['Fresa', 'Algodón de azúcar', 'Vainilla'], mecha: 'algodon', comestible: true, nuevo: true,
      desc: 'Copa rosa con nata montada de cera (whip wax) y fideos de colores.', vela: { forma: 'copa', cera: '#f4a7bd', toppings: ['nata', 'fideos'] } },
    { id: 'cafe-con-espumita', nombre: 'Café con espumita', grupo: 'colecciones', sub: 'dulces', precio: 14, aroma: 'Caramelo salado', notas: ['Café', 'Caramelo salado', 'Leche'], mecha: 'madera', maderaGrupo: 'dulce', comestible: true,
      desc: 'La taza de café de por la mañana, pero con mecha de madera.', vela: { forma: 'taza', envase: '#f1ece4', cera: '#c99a6b', toppings: ['nata'] } },
    { id: 'cupcake-de-fresa', nombre: 'Cupcake de fresa', grupo: 'colecciones', sub: 'dulces', precio: 13, aroma: 'Vainilla de Madagascar', notas: ['Fresa', 'Vainilla de Madagascar', 'Mantequilla'], mecha: 'algodon', comestible: true,
      desc: 'Con fideos de colores y su cereza.', vela: { forma: 'cupcake', cera: '#f8e1e7', toppings: ['fideos'] } },
    { id: 'donut-glaseado', nombre: 'Donut glaseado', grupo: 'colecciones', sub: 'dulces', precio: 13, aroma: 'Algodón de azúcar', notas: ['Azúcar glas', 'Algodón de azúcar', 'Masa dulce'], mecha: 'algodon', comestible: true,
      desc: 'Glaseado rosa y fideos. Parece recién hecho.', vela: { forma: 'donut', cera: '#f29cb7', toppings: ['fideos'] } },
    { id: 'tarta-de-queso', nombre: 'Tarta de queso', grupo: 'colecciones', sub: 'dulces', precio: 15, aroma: 'Tarta de queso con arándanos', notas: ['Limón', 'Queso crema', 'Arándanos'], mecha: 'algodon', comestible: true,
      desc: 'Tarta clara con arándanos de cera.', vela: { forma: 'tarta', cera: '#f4ead8', toppings: ['arandanos'] } },
    { id: 'taza-de-cacao', nombre: 'Taza de cacao', grupo: 'colecciones', sub: 'dulces', precio: 14, aroma: 'Cacao puro', notas: ['Cacao', 'Avellana', 'Vainilla'], mecha: 'madera', maderaGrupo: 'dulce', comestible: true,
      desc: 'Cacao con nubes y mecha de madera que cruje.', vela: { forma: 'taza', envase: '#8a5a3b', cera: '#5a3220', toppings: ['nubes'] } },

    // ---- Salados
    { id: 'cubo-de-palomitas', nombre: 'Cubo de palomitas', grupo: 'colecciones', sub: 'salados', precio: 14, aroma: 'Palomitas mantequilladas', notas: ['Mantequilla', 'Maíz tostado', 'Sal'], mecha: 'algodon', comestible: true,
      desc: 'Para las noches de peli.', vela: { forma: 'palomitas' } },
    { id: 'crema-de-cacahuete', nombre: 'Crema de cacahuete', grupo: 'colecciones', sub: 'salados', precio: 13, aroma: 'Mantequilla de cacahuete', notas: ['Cacahuete tostado', 'Caramelo', 'Vainilla'], mecha: 'algodon', comestible: true,
      desc: 'Un tarro que huele a desayuno de domingo.', vela: { forma: 'tarro', cera: '#c98a4b' } },
    { id: 'miel-y-frutos-secos', nombre: 'Miel y frutos secos', grupo: 'colecciones', sub: 'salados', precio: 14, aroma: 'Miel con frutos secos', notas: ['Almendra', 'Miel', 'Nuez'], mecha: 'algodon', comestible: true,
      desc: 'Vaso ámbar con aroma dulce y tostado.', vela: { forma: 'vaso', cristal: 'ambar', cera: '#f3dfb3', etiquetaTexto: 'Miel' } },

    // ---- Naturaleza
    { id: 'suculenta', nombre: 'Suculenta', grupo: 'colecciones', sub: 'naturaleza', precio: 14, aroma: 'Tierra mojada', notas: ['Lluvia', 'Tierra mojada', 'Vetiver'], mecha: 'algodon',
      desc: 'Una planta que no hay que regar.', vela: { forma: 'suculenta', cera: '#9bb88f' } },
    { id: 'campo-de-lavanda', nombre: 'Campo de lavanda', grupo: 'colecciones', sub: 'naturaleza', precio: 13, aroma: 'Lavanda silvestre', notas: ['Lavanda', 'Romero', 'Almizcle'], mecha: 'algodon',
      desc: 'Vaso transparente con cera lila y flores secas.', vela: { forma: 'vaso', cristal: 'claro', cera: '#cdb6e6', toppings: ['flores'], etiquetaTexto: 'Lavanda' } },
    { id: 'bosque-de-pinos', nombre: 'Bosque de pinos', grupo: 'colecciones', sub: 'naturaleza', precio: 15, aroma: 'Bosque de pinos', notas: ['Eucalipto', 'Pino', 'Musgo'], mecha: 'madera', maderaGrupo: 'bosque',
      desc: 'Mecha de madera y olor a paseo por el monte.', vela: { forma: 'vaso', cristal: 'claro', cera: '#a8c3a0', etiquetaTexto: 'Bosque' } },
    { id: 'flor-de-azahar', nombre: 'Flor de azahar', grupo: 'colecciones', sub: 'naturaleza', precio: 14, aroma: 'Flor de azahar', notas: ['Naranja amarga', 'Azahar', 'Rocío matinal'], mecha: 'algodon',
      desc: 'Copa blanca con flores de cera.', vela: { forma: 'copa', cera: '#fbf6ee', toppings: ['flores'] } },

    // ---- Zodiaco (una por elemento)
    { id: 'vela-fuego', nombre: 'Vela de fuego', grupo: 'colecciones', sub: 'zodiaco', precio: 15, aroma: 'Cítricos intensos', notas: ['Pomelo', 'Jengibre', 'Ámbar'], mecha: 'algodon', signos: 'Aries, Leo y Sagitario',
      desc: 'Para Aries, Leo y Sagitario.', vela: { forma: 'lata', envase: '#c8553d', cera: '#f4ece2', glyph: '♌' } },
    { id: 'vela-tierra', nombre: 'Vela de tierra', grupo: 'colecciones', sub: 'zodiaco', precio: 15, aroma: 'Lavanda y maderas', notas: ['Lavanda', 'Cedro', 'Pachuli'], mecha: 'algodon', signos: 'Tauro, Virgo y Capricornio',
      desc: 'Para Tauro, Virgo y Capricornio.', vela: { forma: 'lata', envase: '#7d8c56', cera: '#f4ece2', glyph: '♉' } },
    { id: 'vela-aire', nombre: 'Vela de aire', grupo: 'colecciones', sub: 'zodiaco', precio: 15, aroma: 'Florales', notas: ['Peonía', 'Jazmín', 'Almizcle'], mecha: 'algodon', signos: 'Géminis, Libra y Acuario',
      desc: 'Para Géminis, Libra y Acuario.', vela: { forma: 'lata', envase: '#8fa9d4', cera: '#f4ece2', glyph: '♒' } },
    { id: 'vela-agua', nombre: 'Vela de agua', grupo: 'colecciones', sub: 'zodiaco', precio: 15, aroma: 'Marinos y dulces', notas: ['Sal marina', 'Coco', 'Vainilla'], mecha: 'algodon', signos: 'Cáncer, Escorpio y Piscis',
      desc: 'Para Cáncer, Escorpio y Piscis.', vela: { forma: 'lata', envase: '#2f6f9f', cera: '#f4ece2', glyph: '♓' } },

    // ---- Mística
    { id: 'cuarzo-rosa', nombre: 'Cuarzo rosa', grupo: 'colecciones', sub: 'mistica', precio: 15, aroma: 'Palo santo', notas: ['Rosa', 'Palo santo', 'Sándalo'], mecha: 'algodon', intencion: 'Amor propio',
      desc: 'Vela de intención para el amor propio.', vela: { forma: 'gemas', cera: '#f8ece9', envase: '#f2a9bd' } },
    { id: 'amatista', nombre: 'Amatista', grupo: 'colecciones', sub: 'mistica', precio: 15, aroma: 'Sándalo', notas: ['Lavanda', 'Sándalo', 'Incienso'], mecha: 'algodon', intencion: 'Calma',
      desc: 'Vela de intención para la calma.', vela: { forma: 'gemas', cera: '#f1ecf6', envase: '#9a72c4' } },
    { id: 'jade', nombre: 'Jade', grupo: 'colecciones', sub: 'mistica', precio: 15, aroma: 'Salvia blanca', notas: ['Salvia blanca', 'Té verde', 'Cedro'], mecha: 'algodon', intencion: 'Prosperidad',
      desc: 'Vela de intención para la prosperidad.', vela: { forma: 'gemas', cera: '#eef4ee', envase: '#5fa889' } },

    // ---- Escultórica
    { id: 'cubo-de-burbujas', nombre: 'Cubo de burbujas', grupo: 'colecciones', sub: 'escultorica', precio: 14, aroma: 'Algodón', notas: ['Ropa limpia', 'Algodón', 'Almizcle'], mecha: 'algodon', nuevo: true,
      desc: 'La vela de burbujas para la estantería.', vela: { forma: 'burbujas', cera: '#ecdfcd' } },
    { id: 'arco', nombre: 'Arco', grupo: 'colecciones', sub: 'escultorica', precio: 14, aroma: 'Lino blanco', notas: ['Lino', 'Flor de algodón', 'Madera clara'], mecha: 'algodon',
      desc: 'Un arco de cera como los de las casas antiguas.', vela: { forma: 'arco', cera: '#e3d5c2' } },
    { id: 'esfera-de-cedro', nombre: 'Esfera de cedro', grupo: 'colecciones', sub: 'escultorica', precio: 15, aroma: 'Cedro puro', notas: ['Bergamota', 'Cedro', 'Ámbar'], mecha: 'madera', maderaGrupo: 'bosque',
      desc: 'Una esfera con relieves y mecha de madera.', vela: { forma: 'esfera', cera: '#a07850' } },
    { id: 'ambar', nombre: 'Ámbar', grupo: 'colecciones', sub: 'escultorica', precio: 15, aroma: 'Ámbar', notas: ['Mandarina', 'Ámbar', 'Benjuí'], mecha: 'madera', maderaGrupo: 'bosque',
      desc: 'El clásico vaso ámbar, ahora con mecha de madera.', vela: { forma: 'vaso', cristal: 'ambar', cera: '#f3e6d3', etiquetaTexto: 'Ámbar' } },

    // ---- Regalos (packs y cajas)
    { id: 'caja-magica-halloween', nombre: 'Caja mágica de Halloween', grupo: 'regalos', sub: 'cajas', precio: 28, aroma: 'Calabaza especiada', notas: ['Canela', 'Calabaza', 'Humo de madera'], mecha: 'algodon',
      desc: '1 vela calabaza + 1 melt de poción + cerillas temáticas.', caja: { color: '#3b2a4d', lazo: '#e07a2e' }, vela: { forma: 'calabaza', cera: '#e07a2e' } },
    { id: 'caja-astral', nombre: 'Caja astral', grupo: 'regalos', sub: 'cajas', precio: 32, aroma: 'Según tu signo', notas: ['Según el elemento', '', ''], mecha: 'algodon',
      desc: 'La vela de tu signo con gemas de cera, en una caja de regalo.', caja: { color: '#2c3157', lazo: '#d8b25a' }, vela: { forma: 'lata', envase: '#2c3157', cera: '#f4ece2', glyph: '✦' } },
    { id: 'pack-lectura', nombre: 'Pack lectura', grupo: 'regalos', sub: 'packs', precio: 30, aroma: 'Papel viejo y vainilla', notas: ['Té negro', 'Papel viejo', 'Vainilla'], mecha: 'madera', maderaGrupo: 'bosque',
      desc: 'Velas con frases de libros escondidas que aparecen al encenderlas.', caja: { color: '#5b3a29', lazo: '#c9a24a' }, vela: { forma: 'vaso', cristal: 'ambar', cera: '#f3e6d3', etiquetaTexto: 'Lectura' } },
    { id: 'pack-opositor', nombre: 'Pack opositor', grupo: 'regalos', sub: 'packs', precio: 30, aroma: 'Romero y menta', notas: ['Menta', 'Romero', 'Limón'], mecha: 'algodon',
      desc: 'Velas para estudiar, con mensajes de ánimo escondidos.', caja: { color: '#3f6b4f', lazo: '#f1d38a' }, vela: { forma: 'vaso', cristal: 'claro', cera: '#d7ead9', etiquetaTexto: 'Ánimo' } }
  ],

  // Configurador "Crea tu vela"
  crea: {
    base: 16,
    envases: [
      { id: 'taza', nombre: 'Taza', desc: 'Se queda para casa cuando se acaba.', forma: 'taza' },
      { id: 'copa', nombre: 'Copa de cristal', desc: 'Para batidos, pócimas y brindis.', forma: 'copa' },
      { id: 'tarro', nombre: 'Tarro de galletas', desc: 'Cristal con cuello ancho.', forma: 'tarro' },
      { id: 'tarta', nombre: 'Molde de tarta', desc: 'Una tarta entera de cera.', forma: 'tarta' },
      { id: 'calabaza', nombre: 'Figura: calabaza', desc: 'Figura 3D sin envase.', forma: 'calabaza' },
      { id: 'arbol', nombre: 'Figura: árbol', desc: 'Figura 3D sin envase.', forma: 'arbol' }
    ],
    mechas: [
      { id: 'algodon', nombre: 'Algodón', desc: 'La de siempre, llama tranquila.', precio: 0 },
      { id: 'madera', nombre: 'Madera', desc: 'Cruje como una chimenea.', precio: 1 }
    ],
    colores: [
      { grupo: 'Pastel', items: [['Rosa', '#f6c9d0'], ['Menta', '#c8ead9'], ['Lavanda', '#d9cdf0'], ['Crema', '#f4e7d3']] },
      { grupo: 'Festividad', items: [['Naranja Halloween', '#e8772e'], ['Rojo Navidad', '#b8352b'], ['Verde abeto', '#3f6b4f']] },
      { grupo: 'Zodiaco', items: [['Fuego', '#c8553d'], ['Tierra', '#7d8c56'], ['Aire', '#9db7de'], ['Agua', '#2f6f9f']] }
    ],
    aromas: [
      { grupo: 'Dulces', items: ['Vainilla de Madagascar', 'Caramelo salado', 'Algodón de azúcar', 'Cacao puro', 'Fresas con nata'] },
      { grupo: 'Especiados', items: ['Canela', 'Galleta de jengibre', 'Vino caliente con especias'] },
      { grupo: 'De temporada', items: ['Calabaza especiada', 'Pino silvestre', 'Manzana con canela'] },
      { grupo: 'Herbales', items: ['Lavanda silvestre', 'Eucalipto fresco', 'Salvia blanca', 'Tierra mojada'] },
      { grupo: 'Astrológicos', items: ['Cítricos (fuego)', 'Lavanda y maderas (tierra)', 'Florales (aire)', 'Marinos (agua)'] }
    ],
    toppings: [
      { id: 'galletas', nombre: 'Mini galletas' },
      { id: 'nata', nombre: 'Nata montada de cera' },
      { id: 'purpurina', nombre: 'Purpurina biodegradable' },
      { id: 'calabacitas', nombre: 'Mini calabacitas' },
      { id: 'cactus', nombre: 'Cactus de cera' },
      { id: 'signo', nombre: 'Símbolo de tu signo' },
      { id: 'gemas', nombre: 'Gemas de cera' },
      { id: 'bastones', nombre: 'Bastones de caramelo' },
      { id: 'fideos', nombre: 'Fideos de colores' },
      { id: 'fresas', nombre: 'Fresas de cera' }
    ],
    mensajeOculto: 1
  }
};
