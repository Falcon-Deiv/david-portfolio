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

En la web solo se usan estas fotos de `assets/img/`:

| Archivo                  | Dónde aparece                                         |
|--------------------------|-------------------------------------------------------|
| `jorge.png`              | Foto de perfil y avatares (Reto 1+1, caso Asesoría)    |
| `maite.png`              | Avatares (Reto 1+1, caso Asesoría)                     |
| `grupo.png`              | Mi equipo · Contrato de equipo                         |
| `bocetos.jpg`            | Creatividad · Bocetos / Prototipo                      |

La Diana, el Test EntreComp, Mi bloqueo creativo, el Reto 1+1, SCAMPER y el contrato están
construidos con HTML y CSS a partir de los datos de las fichas en papel. Las puntuaciones de la
Diana y del EntreComp reproducen exactamente lo que el alumno marcó en su ficha original.

## Vídeo y documentos

- `assets/video/presentacion.mp4`: vídeo de UniWay, en un marco tipo móvil junto al botón del prototipo (Creatividad · SCAMPER).
- `assets/docs/contrato-equipo.pdf`: el botón "Ver contrato de equipo (PDF)" aparece solo cuando este archivo existe.

> Al renombrar archivos binarios desde la web de GitHub, comprueba que el tamaño se mantiene:
> ya ha pasado dos veces que el archivo renombrado quedó vacío (2 bytes).
