# 🚀 Portfolio de Simulación Empresarial

**Autor:** Jorge González Luque (2º Administración y Finanzas)  
**Desarrollo Técnico:** Octubre 2026  
**Estado:** 🚧 Proyecto vivo y en desarrollo continuo (Próximos meses)  
**Sitio en vivo:** [Enlace a GitHub Pages] *(Nota: asegúrate de que el enlace de GitHub Pages esté configurado)*

## 📖 Sobre el proyecto
Este repositorio contiene el código fuente del portfolio de la asignatura de Simulación Empresarial. El objetivo es documentar de forma interactiva y profesional el proceso de aprendizaje, autoconocimiento, creatividad, trabajo en equipo y liderazgo a lo largo del curso.

## 🏗️ Lo que hemos construido hasta ahora (Base del Proyecto)
El portfolio ha evolucionado de simples apuntes en papel a una experiencia web interactiva completa. Actualmente cuenta con las siguientes secciones funcionales:

*   **¿Quién Soy?:** Presentación personal con foto de perfil optimizada (recorte circular perfecto y responsivo).
*   **Autoconocimiento:** Transformación de la *Diana de Evaluación* y el *Test EntreComp* en paneles interactivos de HTML/CSS con barras de progreso que se animan al hacer scroll. *(Nota: Las puntuaciones reproducen exactamente lo marcado por el alumno en papel, preservando la fidelidad del ejercicio original).*
*   **Creatividad:** Tablas responsivas para el "Bloqueo Creativo" y "Reto 1+1" (incluyendo un sistema de filtros interactivo para las ideas), y la técnica SCAMPER.
*   **Proyecto UniWay (App):** Sección *hero* destacada que incluye el prototipo de Netlify, enlace al código y una demostración en vídeo emulada dentro de un marco de smartphone creado con CSS.
*   **Mi Equipo:** Maquetación del Caso Asesoría y diseño visual del "Contrato de Equipo" simulando un documento A4 real con firmas.
*   **Liderazgo:** Reflexiones y conclusiones sobre las dinámicas grupales ("Estilo novia", "El espejo", "El baile").
*   **Idea de negocio (Fase 1 · grupal):** "Velas con mensaje oculto" con una vela interactiva y pestañas propias: cómo llegamos a la idea (SCAMPER, sombreros y flor de loto), lienzo Canvas, evaluación con números, taller y web, y por qué emprender. En "Taller y web" hay una vista previa en vivo de la tienda y un botón para abrirla, igual que el prototipo de UniWay.
*   **Tienda «Vibra» (`tienda/`):** Web completa de la tienda de velas (prototipo, sin pagos). Menú con desplegables, banner que cambia según la temporada (Halloween, Navidad, San Valentín, Pascua), carrusel «Para comerte a besos», mecha de madera con sonido de chimenea generado en el navegador, configurador «Crea tu vela» de 6 pasos, ficha de producto con pirámide olfativa y aviso de «no es comestible», regalos, zodiaco, carrito, favoritos y buscador.
*   **Reflexión Final:** Tabla de valoraciones (con notas y etiquetas doradas) y conclusiones personales en un tono sincero y directo.

## 💻 Características Técnicas y Diseño
*   **Tecnologías:** HTML5, CSS3 puro y Vanilla JavaScript. Sin dependencias externas pesadas.
*   **UI/UX:** Diseño totalmente *Responsive* (Mobile-first). Incluye un menú de navegación que pasa a modo hamburguesa en resoluciones inferiores a 1140px para evitar desbordamientos.
*   **Motion & Animaciones:** Uso de `IntersectionObserver` en JS para lograr efectos de aparición en cascada (*fade-in slide-up*) al hacer scroll, con soporte para opciones de "reducir movimiento" del sistema operativo.
*   **Transparencia (Archivos originales):** Integración de botones fantasma (*ghost buttons*) debajo de cada componente interactivo que abren los JPGs/PDFs originales de los apuntes a mano, alojados directamente en el repo.
*   **Optimización:** *Assets* aligerados y control de versiones estricto (eliminación de imágenes pesadas o en desuso para mantener la carga rápida). CSS cache-busting implementado (`?v=9`): sube el número cada vez que cambies `styles.css`.

## 🕯️ La tienda (`tienda/`)
*   `tienda/index.html`: estructura de todas las páginas. Se navega con rutas tipo `#/tematicas/halloween`, `#/producto/<id>` o `#/crea-tu-vela`, así funciona en GitHub Pages sin servidor.
*   `tienda/js/datos.js`: el catálogo (productos, precios, aromas, colecciones y opciones del configurador). Para añadir una vela basta con añadir un objeto aquí.
*   `tienda/js/velas.js`: dibuja las velas en SVG (taza, copa, tarta, calabaza, árbol, etc.). No hay fotos: todas las velas son ilustraciones.
*   `tienda/js/tienda.js`: rutas, banner de temporada, carrusel, sonido, configurador, carrito y favoritos (se guardan en el navegador).
*   `tienda/js/motion.js`: los efectos de movimiento. Entrada con el logo (una vez por sesión), mecha de progreso arriba, cursor con luz de vela, botones magnéticos, títulos que suben palabra a palabra, la historia «Así nace una vela» que avanza con el scroll (fundir, aroma y color, esconder el mensaje y encender), el manifiesto que se enciende palabra a palabra, la cinta que acelera con el scroll, las llamas que se inclinan con el ratón, tarjetas en 3D, fotos que se abren como una cortina, el nombre gigante del pie y el **modo vela** («Apaga la luz»: la página se queda a oscuras, se encienden todas las velas, el ratón alumbra y suena la chimenea). Con «reducir movimiento» activado, todo se muestra quieto.
*   `tienda/js/empresa.js`: **Área de empresa** (`#/empresa`, enlace «Acceso empresa» en el pie). Solo para Jorge y Maite, con usuario y contraseña. Desde ahí se hacen pedidos a proveedores (con base imponible, IVA del 21 % y nota de pedido para imprimir o guardar en PDF), se lleva el historial con su estado y se ven los pedidos que hacen los clientes en la tienda. Se pueden descargar en CSV.
    *   Las contraseñas **no están en el código**: solo un resumen cifrado (PBKDF2-SHA256 con sal). Tras 5 intentos fallidos se bloquea 1 minuto y la sesión se cierra a las 2 horas o al cerrar la pestaña.
    *   Como la web no tiene servidor, es una protección de prototipo y los pedidos se guardan en el navegador donde se hacen. Para cambiar una contraseña hay que generar un nuevo resumen y sustituirlo en `USERS`.
*   La marca es **Vibra**. El logo (una V con una llama dentro de un cuadrado) está dibujado en SVG en `tienda/index.html`, los colores salen de las fotos de la marca (salvia, beige y gris pizarra) y las fotos están en `tienda/img/`. El nombre también está en `marca` de `datos.js`.

## 🛠️ Notas para la continuación del proyecto
Como este portfolio se irá ampliando en los próximos meses, ten en cuenta lo siguiente para futuras actualizaciones:
1.  **Añadir nuevas secciones:** Solo hay que replicar la estructura de `<section id="nuevo-id" class="reveal">`. El JavaScript animará los nuevos contenidos automáticamente.
2.  **Imágenes originales:** Si se añaden nuevos apuntes en papel, guárdalos en `assets/img/` y enlázalos usando el diseño de los *ghost buttons* ("Ver apunte original").
3.  **Fase 1:** Todo el contenido de la idea de negocio está en `#idea-negocio`. Los textos se escriben en primera persona y con el mismo tono que el resto del portfolio. Las pestañas, sombreros, pétalos, lienzo, precios y web usan el mismo mecanismo en `js/main.js` (`data-sw-btn` / `data-sw-panel`).
4.  **Menú:** El menú de escritorio va justo de ancho. Si añades otra sección, comprueba que los enlaces no se partan en dos líneas (o acorta el texto del enlace).
5.  **Textos:** Todos los textos están escritos en el HTML. Si se actualizan reflexiones o notas, deben modificarse directamente ahí.
6.  **Despliegue:** Cualquier `git push` a la rama `main` actualizará automáticamente GitHub Pages en un par de minutos.

---
*Desarrollado con mucha dedicación, HTML, CSS y un poco de café.* ☕
