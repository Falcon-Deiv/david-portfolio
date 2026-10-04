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

## Imágenes

Las fotos de los ejercicios y del equipo están en `assets/img/` y se muestran en su sección:

| Archivo                                     | Dónde aparece                                  |
|---------------------------------------------|------------------------------------------------|
| `diana.jpg`                                | ¿Quién Soy? · Diana de Autoevaluación (se endereza con CSS) |
| `entrecomp-1.jpg`, `entrecomp-2.jpg`      | ¿Quién Soy? · Test Inicial EntreComp           |
| `bloqueo.jpg`                              | Creatividad · Mi bloqueo creativo              |
| `reto1mas1.jpg`                            | Creatividad · Reto 1+1 Málaga                  |
| `scamper.jpg`                              | Creatividad · Técnica SCAMPER                  |
| `bocetos.jpg`                              | Creatividad · Bocetos / Prototipo              |
| `asesoria.jpg`                             | Mi equipo · Caso Asesoría Málaga Centro        |

La foto de perfil es `assets/img/jorge.png`; los avatares del caso Asesoría usan `jorge.png` y `maite.png`.

## Rellenar textos

Los apartados pendientes (narración, carta del objetivo, dinámicas de equipo, contrato,
reflexiones de liderazgo) están en `index.html` dentro de bloques `placeholder-text`,
marcados con un comentario `✏️`. Sustituye el párrafo por tu texto y, si quieres quitar el
estilo punteado, elimina la clase `placeholder-text`.
