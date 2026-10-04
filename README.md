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
*   **Reflexión Final:** Tabla de valoraciones (con notas y etiquetas doradas) y conclusiones personales en un tono sincero y directo.

## 💻 Características Técnicas y Diseño
*   **Tecnologías:** HTML5, CSS3 puro y Vanilla JavaScript. Sin dependencias externas pesadas.
*   **UI/UX:** Diseño totalmente *Responsive* (Mobile-first). Incluye un menú de navegación que pasa a modo hamburguesa en resoluciones inferiores a 1140px para evitar desbordamientos.
*   **Motion & Animaciones:** Uso de `IntersectionObserver` en JS para lograr efectos de aparición en cascada (*fade-in slide-up*) al hacer scroll, con soporte para opciones de "reducir movimiento" del sistema operativo.
*   **Transparencia (Archivos originales):** Integración de botones fantasma (*ghost buttons*) debajo de cada componente interactivo que abren los JPGs/PDFs originales de los apuntes a mano, alojados directamente en el repo.
*   **Optimización:** *Assets* aligerados y control de versiones estricto (eliminación de imágenes pesadas o en desuso para mantener la carga rápida). CSS cache-busting implementado (`?v=3`).

## 🛠️ Notas para la continuación del proyecto
Como este portfolio se irá ampliando en los próximos meses, ten en cuenta lo siguiente para futuras actualizaciones:
1.  **Añadir nuevas secciones:** Solo hay que replicar la estructura de `<section id="nuevo-id" class="reveal">`. El JavaScript animará los nuevos contenidos automáticamente.
2.  **Imágenes originales:** Si se añaden nuevos apuntes en papel, guárdalos en `assets/img/` y enlázalos usando el diseño de los *ghost buttons* ("Ver apunte original").
3.  **Textos:** Todos los textos están escritos en el HTML. Si se actualizan reflexiones o notas, deben modificarse directamente ahí.
4.  **Despliegue:** Cualquier `git push` a la rama `main` actualizará automáticamente GitHub Pages en un par de minutos.

---
*Desarrollado con mucha dedicación, HTML, CSS y un poco de café.* ☕
