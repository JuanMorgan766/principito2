# The Little Prince

Juego web 2D de plataformas hecho con HTML5, CSS3, JavaScript ES6 y Canvas 2D. No necesita instalaciones, backend, base de datos, motor ni dependencias externas.

## Ejecutar localmente

El navegador debe servir los módulos ES6 por HTTP; no se debe abrir `index.html` directamente desde el explorador de archivos.

Puede usarse cualquier servidor estático. Por ejemplo, desde la carpeta del proyecto:

```text
npx serve .
```

Después, abrir la URL indicada por el servidor. También es compatible con Live Server o cualquier servidor HTTP simple.

## Controles

- `A` / `D` o flechas: mover.
- `Espacio`, `W` o flecha arriba: saltar.
- `J`: atacar tras recoger la espada en el Capítulo 3.
- `E`: interactuar con Isabela.
- `Esc`: pausar.
- En móvil horizontal aparecen controles táctiles. En vertical se solicita girar el dispositivo.

## Publicación estática

Publicar el contenido de esta carpeta tal cual, incluyendo `index.html`, `css/`, `js/` y `assets/`. No se requiere compilación ni configuración de servidor especial.

Es compatible con GitHub Pages, Netlify, Vercel, Cloudflare Pages y otros hosts de archivos estáticos. El directorio publicado debe tener `index.html` como raíz del sitio.

## Audio

El sistema ya reconoce las rutas descritas en [assets/audio/README.md](assets/audio/README.md). Las pistas y los efectos finales deben añadirse en esas rutas antes de publicar una versión con audio definitivo. Mientras tanto, los efectos importantes tienen respaldo sintético y el juego continúa funcionando.

## Persistencia

El desbloqueo de Isabela se guarda localmente mediante la clave `principito-isabela-desbloqueada` de `localStorage`. No se envían datos a ningún servidor.

## Verificación técnica

Para ejecutar la validación automatizada final incluida en el proyecto:

```text
node tests/final-check.mjs
```

La comprobación cubre el menú, selección y persistencia de Isabela, capítulos, personajes, movimiento, salto y doble salto, plataformas, cámara, combate, vidas, estrellas, espada, rescate, final, pausa, Game Over, controles táctiles, render y eventos de audio. También se recomienda abrir el juego desde un servidor HTTP y probar los controles en un navegador antes de una entrega pública.
