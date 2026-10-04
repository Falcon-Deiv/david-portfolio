# Portfolio · Jorge González Luque

Portfolio de una sola página para la asignatura **Simulación Empresarial (S.E) 2º A.F**.
Hecho con HTML, CSS y JavaScript sin dependencias ni paso de compilación.

## Estructura

```
index.html        Contenido y secciones
css/styles.css    Estilos (paleta azul universitaria, responsive)
js/main.js        Menú móvil, scroll activo, pestañas, animaciones e imágenes
assets/img/       Imágenes del portfolio
```

Secciones: ¿Quién Soy? · Autoconocimiento · Creatividad · Mi equipo · Liderazgo.

## Cómo verlo

Abre `index.html` en el navegador, o sirve la carpeta:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

También se puede publicar tal cual con GitHub Pages (Settings → Pages → rama y carpeta raíz).

## Añadir imágenes

Guarda las imágenes en `assets/img/` con estos nombres y aparecerán solas:

| Archivo                    | Dónde aparece                 |
|----------------------------|-------------------------------|
| `assets/img/perfil.jpg`    | Foto de perfil (¿Quién Soy?)  |
| `assets/img/diana.jpg`     | Diana de Autoevaluación       |
| `assets/img/entrecomp.jpg` | Test Inicial EntreComp        |

Mientras no existan se muestra un hueco punteado. Al pulsarlo puedes elegir una imagen
para previsualizarla, pero esa vista previa no se guarda: para que quede publicada hay que
añadir el archivo a la carpeta.

## Rellenar textos

Los apartados pendientes (narración, carta del objetivo, dinámicas de equipo, contrato,
reflexiones de liderazgo) están en `index.html` dentro de bloques `placeholder-text`,
marcados con un comentario `✏️`. Sustituye el párrafo por tu texto y, si quieres quitar el
estilo punteado, elimina la clase `placeholder-text`.
