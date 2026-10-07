# Progreso del proyecto

## Expansión de contenido — Fase 2 (EXPANSION.md)

| Bloque | Estado |
|---|---|
| A — Progresión y desbloqueos | COMPLETADO (2026-10-07) |
| B — Personajes extras | COMPLETADO (2026-10-07) |
| C — Contenido EXTRAS y libro | COMPLETADO (galería de regalos actualizada con 6 imágenes; contenido del libro pendiente) |
| D — Nivel 4 base | IMPLEMENTADO; comprobación visual/audio pendiente |
| E — Nivel 4 avanzado | IMPLEMENTADO; comprobación visual/audio pendiente |
| F — Modo difícil | Pendiente |
| G — Pruebas generales | Pendiente |

## Último bloque de expansión

Bloques A, B, C, D y E implementados. La comprobación automatizada de D/E pasó; queda pendiente revisar el render en viewport horizontal y probar la pista cuando el desarrollador la proporcione. No se inicia F ni G.

## Fase 2

| Bloque | Estado |
|---|---|
| E0 — Auditoría | COMPLETADO (2026-10-06) |
| E1 — Zonas, cámara y tubería | COMPLETADO (2026-10-06) |
| E2 — Vidas globales y dificultades | COMPLETADO (2026-10-06) |
| E3 — Objetos y enemigos | Pendiente |
| E4 — Zorro | Pendiente |
| E5a — Nivel 1, Parte 1 | Pendiente |
| E5b — Nivel 1, Parte 2 | Pendiente |
| E6 — Nivel 2 | Pendiente |
| E7a — Nivel 3 | Pendiente |
| E7b — Jefe | Pendiente |
| E8 — Final | Pendiente |
| E9 — Pulido, audio y rendimiento | Pendiente |
| E10 — Pruebas finales y publicación | Pendiente |

## Etapa actual

La hoja de ruta original E0–E10 permanece en E2 completado, con E3 pendiente. En la expansión, A–E están implementados; no se ha iniciado F ni G.

## Etapas completadas

- Etapa 0 — Planificación y estructura.
- Etapa 1 — HTML y estructura base.
- Etapa 2 — Canvas y Game Loop.
- Etapa 3 — Principito.
- Etapa 4 — Movimiento.
- Etapa 5 — Gravedad y salto.
- Etapa 6 — Plataformas.
- Etapa 7 — Cámara.
- Etapa 8 — Enemigos.
- Etapa 9 — Vidas y daño.
- Etapa 10 — Estrellas.
- Etapa 11 — Doble salto.
- Etapa 12 — Espada y ataque.
- Etapa 13 — Nivel 1 / Capítulo 1.
- Etapa 14 — Nivel 2 / Capítulo 2.
- Etapa 15 — Zorro.
- Etapa 16 — Nivel 3 / Capítulo 3.
- Etapa 17 — Isabela.
- Etapa 18 — Selección y desbloqueo.
- Etapa 19 — Rejugabilidad y adaptación narrativa.
- Etapa 20 — Pausa.
- Etapa 21 — Game Over.
- Etapa 22 — Controles móviles.
- Etapa 23 — Responsive y orientación.
- Etapa 24 — Gráficos y pulido visual.
- Etapa 25 — Audio.
- Etapa 26 — Optimización.
- Etapa 27 — Publicación.
- Etapa 28 — Pruebas finales y documentación.

## Estado actual

- El juego sigue siendo un sitio estático con HTML, CSS, Canvas 2D y módulos ES6, sin dependencias externas.
- El canvas lógico conserva 1280 × 720 y el `Game` mantiene el bucle `requestAnimationFrame`.
- Los niveles se construyen con `Nivel1`, `Nivel2` y `Nivel3`; comparten plataformas, estrellas, enemigos, cámara y el personaje seleccionado.
- El Capítulo 1 contiene un jardín fantástico con pagodas, estanque, flores de loto, faroles, rocas, vegetación, Rosa, baobabs, una figura decorativa de Buda, plataformas, estrellas y el poder de doble salto.
- El Capítulo 2 contiene plataformas, estrellas, serpientes, meta y un Zorro que sigue al personaje manteniendo una distancia aproximada y avisa cuando hay enemigos cercanos.
- El Capítulo 3 es más largo y concentra más enemigos y obstáculos; incluye una espada coleccionable, estrellas, Isabela atrapada, interacción con `E` y pantalla final.
- La espada solo puede usarse tras recogerla. `J` activa una hitbox temporal frente al personaje y desactiva enemigos alcanzados.
- Isabela y Principito heredan de `Personaje`, por lo que comparten movimiento, salto, gravedad, daño, espada, colisiones y vidas. Isabela conserva una representación Canvas propia.
- El menú permite seleccionar Principito; Isabela aparece bloqueada hasta el rescate. Tras terminar el Capítulo 3 con Principito, se persiste `principito-isabela-desbloqueada` en `localStorage`.
- Después de desbloquearla, el menú permite elegir Isabela y rejugar cualquiera de los tres capítulos sin duplicar mapas. El objetivo de Nivel 3 con Isabela se adapta a un recuerdo del rescate, evitando que deba rescatarse a sí misma.
- La pausa se activa con `Esc` y muestra acciones de continuar, reiniciar el nivel o volver al menú. Mientras el estado es `PAUSA`, el bucle continúa renderizando la interfaz pero no actualiza el mundo.
- Al perder las tres vidas aparece `GAME OVER` con `REINTENTAR` y `MENÚ PRINCIPAL`. Reintentar reconstruye el capítulo actual con las tres vidas, estrellas y poderes iniciales.
- En pantallas táctiles horizontales se muestran los botones ←, →, SALTO, ⚔ y pausa. Los botones comparten `InputManager` con el teclado; izquierda y derecha se mantienen activos mientras se presionan.
- La interfaz mantiene el canvas lógico de 1280 × 720, lo escala al ancho disponible y limita su alto al viewport. En orientación vertical se oculta el juego y se muestra `GIRA TU DISPOSITIVO`; en horizontal el juego queda disponible para PC, portátil, tablet y móvil.
- `AudioManager` centraliza música y efectos con las APIs nativas `Audio` y Web Audio, sin dependencias externas. La música cambia por capítulo, se pausa y reanuda junto con el juego y se detiene al volver al menú.
- Los efectos de salto válido, estrella, daño, ataque, interacción de rescate y victoria se solicitan desde los eventos reales de `Game`. Mientras no se proporcionen los seis archivos `.wav`, se reproducen tonos breves sintetizados para conservar respuesta sonora sin peticiones fallidas.

## Referencias visuales inspeccionadas

### Capítulo 1

Se inspeccionaron directamente:

- `referencias/nivel-1/Cap1-referencia-1.jfif`;
- `referencias/nivel-1/Cap1-referencia-2.jpg`;
- `referencias/nivel-1/cap1-referencia-3.jpg`.

Las referencias muestran atardeceres cálidos y luz dorada sobre agua, estatuas de Buda monumentales, vegetación y árboles enmarcando la composición, montañas brumosas, pagodas de techos curvos y flores de loto rosadas. Estos rasgos se trasladaron al escenario propio mediante una paleta coral, azul verdosa y dorada, horizonte montañoso, estanque, pagodas, Buda decorativo, faroles y lotos independientes; no se usó ninguna imagen como fondo o asset del juego.

### Isabela

Se inspeccionó directamente `referencias/isabela/referencia-isabela.jpeg`. Presenta una joven de silueta baja y estilizada, cabello largo oscuro con matiz rojizo, rostro claro de ojos grandes, camiseta oscura, pantalón cargo gris/negro y zapatillas claras; también documenta estados de reposo, carrera, salto, caída, ataque, daño, victoria e interacción. La versión Canvas mantiene cabello oscuro rojizo, rostro, conjunto oscuro, pantalón y calzado claro, además de usar los estados generales `IDLE`, `RUN`, `JUMP`, `FALL`, `ATTACK` y `HURT` de `Personaje`. La referencia no se incorporó como sprite final.

## Decisiones importantes

- El desfase encontrado al iniciar esta sesión era real: el código y el progreso solo alcanzaban la Etapa 11 aunque se indicara que la Etapa 14 existía. Se completaron las etapas faltantes 12–14 de forma secuencial antes del bloque autorizado 15–19 para restaurar la continuidad de la hoja de ruta.
- `Personaje` es ahora la clase intermedia con una responsabilidad real: concentra la física y las capacidades compartidas de ambos personajes. `Principito` e `Isabela` solo se ocupan de su representación y de sus atributos propios.
- `Nivel` centraliza los datos comunes de cada capítulo; cada subclase construye únicamente su contenido. Esto mantiene una sola versión de cada mapa para ambos personajes.
- El Zorro sigue horizontalmente al jugador sin pathfinding y solo usa una comprobación de distancia a enemigos para mostrar su advertencia.
- La ruta de persistencia del desbloqueo es `localStorage` bajo la clave `principito-isabela-desbloqueada`. Si el navegador no permite almacenamiento, el juego sigue funcionando durante la sesión.
- `Game` conserva los estados sencillos y gestiona las acciones de pausa; no se introdujo un patrón de estados adicional.
- `InputManager` encapsula también el estado táctil. Los botones traducen sus eventos a la misma dirección y solicitudes consumibles ya empleadas por movimiento, salto, ataque y pausa.
- Los controles móviles solo se muestran durante `JUGANDO`, en dispositivos de puntero táctil y orientación horizontal, para no superponerse con menús, pausa, Game Over o final.

## Cambios recientes verificados

### Expansión — Bloque A: progresión y desbloqueos

- Se añadió ProgressionManager, que mantiene una única colección persistente de estrellas por identificador, el total vigente, capítulos completados en Normal y Difícil, y las banderas de desbloqueo de EXTRAS, Nivel 4, Eren, Eren Titan, Mikasa y Kanye West. Si localStorage no está disponible, el juego conserva el progreso de la sesión sin detenerse.
- Las estrellas de campaña tienen IDs estables por capítulo, zona e índice. El catálogo real contiene 54 estrellas únicas en los tres capítulos y sus zonas. Recoger una estrella tras muerte, reinicio o en otra sesión no duplica el progreso. Eren se habilita al llegar al 70% (38/54); Eren Titan únicamente al 100% (54/54).
- La finalización individual de capítulos se registra con la dificultad activa. Los tres capítulos completados en Normal habilitan a Mikasa; los tres en Difícil habilitan a Kanye West. El cierre de la campaña habilita y persiste EXTRAS y la bandera de acceso al Nivel 4. Se conserva el desbloqueo existente de Isabela; si ya estaba guardado, se migra como campaña completada.
- Las notificaciones de personaje aparecen al cumplir sus condiciones. La interfaz del menú muestra el conteo global de estrellas y el progreso de selección. La navegación a la sección de libro/regalos corresponde al Bloque C, y el modo Nivel 4 a D/E.

### Expansión — Bloque B: personajes extras jugables

- Antes de crear los sprites se localizaron y abrieron las cuatro referencias reales: referencias/referencia-extra/eren-ref.jpeg, mikasa-ref.jpeg, kanyewest-ref.jpeg y erentitan-ref.jpeg. La carpeta presente es referencia-extra (singular), no la ruta plural ilustrativa del documento. Se inspeccionaron rasgos, paletas, ropa y siluetas; ninguna referencia se utilizó como sprite del juego.
- Se añadieron Eren, Mikasa, Kanye West y Eren Titan como sprites pixel-art Canvas originales, integrados con ExtraPersonaje y la clase compartida Personaje. Se conservaron, respectivamente, el abrigo oscuro/camisa clara; el cabello bob, bufanda roja y correajes; el suéter naranja/azul a rayas y calzado claro; y la melena larga, ojos verdes, dientes y cuerpo musculoso de Eren Titan.
- El selector principal incluye los cuatro personajes extra con estado bloqueado/desbloqueado. El desbloqueo efectivo permite seleccionarlos para jugar los mismos niveles; el selector no crea mapas paralelos. Todos heredan movimiento, gravedad, salto, doble salto, ataques, vidas, daño, colisiones, cámara, teclado y entrada táctil. El sistema de creación de personaje admite futuros modos desde la misma fábrica; el Nivel 4 todavía no existe y no se implementó en este bloque.
- Verificación: node tests/final-check.mjs pasó; todos los módulos JavaScript pasaron node --check. Las pruebas cubren deduplicación persistente de estrellas, 70%/100%, completación independiente Normal/Difícil, persistencia de desbloqueos, bloqueo de personajes no obtenidos y movimiento/renderizado de los cuatro extras en Niveles 1–3, incluyendo sus estados visuales. La inspección en navegador mostró el nuevo selector, el Principito en juego y los cuatro sprites extras en Canvas; el archivo temporal de previsualización se retiró.

### Expansión — Bloque C: menú EXTRAS, lector y galería

- El menú principal muestra solo Principito e Isabela; los cuatro personajes extra se eligen dentro de EXTRAS → PERSONAJES. Los personajes bloqueados muestran candado y su requisito vigente: Eren 70% de estrellas, Eren Titan 100%, Mikasa campaña en Normal y Kanye West campaña en Difícil. Isabela indica completar la campaña.
- Se añadió navegación de EXTRAS, selección de personajes, lector por páginas y galería de regalos con ampliación de imagen. Escape vuelve a la vista anterior; flechas y Enter permiten navegación de teclado, y los paneles funcionan mediante clic/toque. El lector queda preparado para el contenido del libro.
- Se redujo el panel del código en escritorio y móvil. `amor` activa inmortalidad y `unlockEverything()` persistente: completa la campaña, registra todas las estrellas, desbloquea las banderas existentes y cualquier bandera/colección registrada después, incluidos personajes y coleccionables futuros.
- Se corrigió la caída de Eren Titan: los puntos de aparición están calibrados para 148 px, pero Titan medía 158 px y comenzaba penetrando 10 px el suelo. El creador/respawn ahora alinea los pies de personajes más altos con la altura de referencia; no cambia la física ni dimensiones globales de los personajes.
- Verificación: `node tests/final-check.mjs` pasó. Las pruebas validan el menú reducido, requisitos de desbloqueo, navegación de libro/regalos, desbloqueo futuro persistente y a Eren Titan asentándose dentro de los tres niveles. Los recursos de libro/regalos permanecen pendientes de proporcionar.

### Galería EXTRAS — imágenes añadidas

- Se incorporaron las seis imágenes presentes en `assets/regalos/` al catálogo de `giftImages`, con texto alternativo y rutas locales codificadas para los espacios en los nombres.
- Se mantiene el avance y retroceso circular con botones y flechas. Los controles anterior/siguiente también permanecen visibles y funcionales con la imagen ampliada; el visor se cierra con `Cerrar`, `Volver`, Escape o tocando nuevamente la imagen.
- `node tests/final-check.mjs` valida que las seis rutas existen, que se abre el visor, el cambio en ambas direcciones, el recorrido circular y el cierre.

### Fase 2 — E0 Auditoría

- Se leyó `AGENTS-FASE2.md` y se inspeccionó la estructura real del proyecto. Se mantienen los módulos compartidos reutilizables: `Game`, `Nivel`/`Nivel1–3`, `Personaje`, `InputManager`, `Camera`, `CollisionSystem`, `AudioManager`, objetos y entidades.
- Los tres niveles continúan cargando, actualizándose y renderizándose con ambos personajes en la verificación automatizada. `node --check` superó todos los módulos de `js/` y `node tests/final-check.mjs` terminó correctamente.
- Se detectó código parcial adelantado respecto a la hoja de ruta de Fase 2: existen `Honda.js`, `Proyectil.js` y lógica de tubería/jetpack en `Game`, `Personaje` y `Nivel1`, pero no están registrados como bloques completados y no cumplen todavía varios criterios cerrados de E1–E5b. Por ejemplo, la tubería se activa por contacto en vez de `Enter`, no existe el modelo de zonas, y las vidas siguen siendo por personaje en lugar de globales. Se preserva ese trabajo existente para revisarlo en los bloques autorizados correspondientes; no se marcó ningún bloque posterior como completado.

### Fase 2 — E1 Sistema de zonas y tubería

- `Nivel` incorpora `zones`, `createZone`, `setZones` y `activateZone`. El sistema conserva las propiedades que ya consume `Game` (`platforms`, `stars`, `enemies`, `goal`, `spawn`, `worldWidth`) para evitar duplicar la lógica de colisiones, cámara y render.
- `Nivel1` se dividió en la zona terrestre `jardin` y la zona provisional `aerea`, cada una con mundo, punto de aparición, plataformas, estrellas, enemigos y objetivo propios. La Tubería pertenece exclusivamente a la primera zona y deja de ser una pared o una activación por simple contacto.
- La entrada exige `Enter` sobre la Tubería; en táctil se añadió `ENTRAR`, visible solo cuando la entrada es válida. La transición bloquea temporalmente el control, muestra un fundido breve, activa la nueva zona y reposiciona personaje, cámara y Zorro.
- No se añadieron fondos o arte definitivo en este bloque: el cambio visual y el Jetpack de la zona aérea corresponden a E5b. Por tanto, el render de escenarios existente en `Game.js` se mantiene sin ampliar; deberá separarse antes de incorporar escenografía nueva de ese bloque.
- Pruebas ejecutadas: `node --check` en los módulos modificados y `node tests/final-check.mjs`, que confirma las dos zonas, la entrada explícita, la transición y el reajuste de cámara, además de las regresiones existentes.

### Fase 2 — E2 Vidas globales y dificultades

- Las vidas pasan a ser estado global de `Game` (`this.lives`) y el HUD las consulta directamente. Cada personaje recién creado recibe ese valor, por lo que cambiar de nivel o de personaje no restaura las vidas.
- `handlePlayerDeath()` centraliza la muerte: con vidas restantes reconstruye el nivel actual desde la Parte 1, devolviendo estrellas, enemigos, objetos, herramientas y zona a su estado inicial; con cero vidas muestra `GAME_OVER`. El botón de reintento inicia una partida nueva mediante `startNewGame()`, siempre en Nivel 1 con tres vidas.
- Se añadió el selector `FÁCIL / NORMAL / DIFÍCIL` al menú. La selección se persiste con `localStorage` bajo la clave `principito-dificultad` y reutiliza el mismo mapa; por ahora configura el multiplicador de velocidad de enemigos 0,9 / 1,0 / 1,15 a partir de `Enemigo.baseSpeed`. Los demás parámetros de dificultad se aplicarán solo en los bloques que introducen esas mecánicas.
- Archivos modificados: `js/Game.js`, `js/entities/Enemigo.js`, `tests/final-check.mjs` y este documento. Pruebas ejecutadas: sintaxis de todos los módulos y `node tests/final-check.mjs`; la prueba incluye explícitamente la secuencia obligatoria `3 → 2 → 1 → 0 → GAME_OVER → Nivel 1 con 3 vidas`, el reinicio de estrellas y la persistencia de dificultad.

### Corrección posterior — menú Rejugar

- Se corrigieron las áreas de clic ambiguas de `REJUGAR`: ahora Capítulo 1, Capítulo 2 y Capítulo 3 son botones independientes con límites exactos, por lo que seleccionar Capítulo 1 ya no deriva al Nivel 2.
- `tests/final-check.mjs` valida cada botón contra su nivel correspondiente. Se ejecutaron `node --check js/Game.js` y `node tests/final-check.mjs` correctamente.

### Etapa 24 — avance de pulido visual

- Se reabrieron e inspeccionaron visualmente las tres referencias del Capítulo 1 y la hoja de referencia de Isabela antes de modificar el renderizado. Se confirmó como dirección de refinamiento la luz dorada sobre agua, neblina entre planos, montañas suaves, vegetación densa con floración rosada, pagodas de techo curvo y la monumentalidad contemplativa de Buda. Para Isabela se reconfirmaron cabello largo oscuro con matiz rojizo, rostro de ojos grandes, camiseta oscura, pantalón cargo y zapatillas claras.
- El render Canvas recibió una primera pasada de pulido: bruma y siluetas de jardín en profundidad, árboles con volumen y flores, pagodas con materiales y luces interiores, detalles de desierto y planeta final, además de HUD de poderes y botones redondeados con degradado.
- Principito ahora tiene detalles de cuello, botones, botas y cabello; Isabela conserva su silueta de la referencia e incorpora detalles de bolsillos y vestuario. Ambos usan una oscilación suave de reposo/carrera sin alterar su hitbox. Zorro, serpientes y baobabs también reciben movimiento visual discreto.
- Se ejecutó `node --check` sobre los módulos alterados sin errores. La revisión visual en navegador confirmó que el menú y el inicio del Capítulo 1 continúan renderizando correctamente tras la primera y segunda pasada.

### Etapa 24 — cierre y validación

- Se revisó de nuevo el resultado del Capítulo 1 frente a sus tres referencias: el atardecer cálido, reflejo de agua, niebla de profundidad, montañas, árboles floridos, lotos, pagodas azul verdosas, luces doradas y Buda decorativo se conservan como lenguaje visual propio, sin reutilizar ninguna imagen proporcionada dentro del juego.
- Se contrastó de nuevo Isabela con su referencia: conserva cabello largo oscuro rojizo, cara clara con ojos definidos, camiseta y pantalón cargo oscuros, bolsillos y zapatillas claras. La oscilación de reposo/carrera no altera sus dimensiones de colisión ni su silueta.
- Los tres capítulos comparten ahora sombreado, degradados, luces, partículas, animación ambiental y el acabado de los elementos interactivos. Jardín, desierto y planeta final mantienen paletas distintas, pero los mismos contornos suaves, detalles luminosos y capas de profundidad para que se perciban como una misma aventura.
- La inspección visual en navegador cubrió el menú y el Capítulo 1 refinado. La comprobación técnica validó los módulos de todos los capítulos, sus configuraciones de plataformas/estrellas/mundo y los dos personajes; no hubo errores ni advertencias en la consola del navegador. El viewport temporal de pruebas se restauró.
### Etapa 24 — correcciones finales verificadas

- El HUD fue reorganizado en dos tarjetas independientes: `MIS VIDAS` y `MIS ESTRELLAS`. Cada tarjeta conserva su icono y contador, pero ahora tiene etiqueta, valor, acento de color y espaciado propios; se eliminaron las líneas mezcladas y la superposición visual anterior.
- Se investigó la ausencia del personaje en Capítulo 3 mediante la consola del navegador. La causa real estaba en `Nivel3`: las plataformas elevadas enviaban el color como cuarto argumento de `addPlatform`, que corresponde a la altura. Eso generaba una altura no numérica, fallaba `createLinearGradient` en `Plataforma.draw` y abortaba el render antes de dibujar al personaje.
- La corrección define explícitamente cada plataforma elevada con altura `28` y color `#4f4964`. El nivel define además su propio punto de aparición, la cámara sigue al personaje desde la creación y el personaje se dibuja después de los detalles de primer plano, por lo que conserva su visibilidad frente a cristales y bruma.
- Se comprobó visualmente el HUD, el inicio del Capítulo 3 con Principito y con Isabela, y el render de los Capítulos 1 y 2. La consola no mostró errores ni advertencias después de la corrección.
- La prueba técnica de Nivel 3 confirmó plataformas con alturas válidas, selección correcta del personaje, movimiento, salto, caída y ataque para Principito e Isabela. Se retiró el acceso temporal usado solo para pruebas antes de cerrar la etapa.
- Todos los módulos de `js/` superaron `node --check`. La Etapa 24 queda completada; no se implementó audio ni ninguna funcionalidad de la Etapa 25.

### Etapa 24 — progresión de doble salto en Capítulo 3

- Se detectó una sección de plataformas del Nivel 3 cuya exigencia de salto impedía completar el recorrido de forma natural con un único salto. Se añadió una progresión jugable exclusiva de este capítulo: el nivel inicia con salto normal y registra derrotas reales de enemigos alcanzados por la hitbox de la espada.
- `Nivel3` mantiene `enemiesDefeated`, `doubleJumpUnlockKills` y `doubleJumpUnlocked`. Al derrotar uno o dos enemigos se conserva el salto normal; al derrotar exactamente el tercero se reutiliza `Personaje.enableDoubleJump()`, por lo que el personaje controlado pasa inmediatamente de uno a dos saltos sin duplicar física ni controles.
- El HUD de Nivel 3 muestra `Enemigos: 0/3`, `1/3` y `2/3`; al tercer enemigo cambia a `Enemigos: 3/3 · DOBLE SALTO`. El aviso central `✨ DOBLE SALTO DESBLOQUEADO` permanece solo unos segundos para no bloquear la vista.
- Se verificó para Principito e Isabela que 0–2 derrotas no habilitan el segundo salto y que la tercera derrota sí lo activa de inmediato. También se probaron movimiento, salto, caída y ataque posteriores al desbloqueo, las transiciones de plataformas altas y la independencia de los Capítulos 1 y 2.
- No se modificaron las reglas de combate, vidas, cámara o movimiento. No se inició la Etapa 25.

### Etapa 24 — rediseño pixel-art en curso

- La etapa se reabrió por dirección artística: Principito e Isabela se están reinterpretando como sprites Canvas pixel-art originales, con bloques de color, contornos, sombreado por píxeles y poses por estado; no se aplica un filtro a las figuras anteriores.
- Se volvió a inspeccionar directamente `referencias/isabela/referencia-isabela.jpeg`. La referencia guiará el cabello largo oscuro rojizo, ojos grandes, camiseta oscura, pantalón cargo y zapatillas claras de Isabela en la nueva versión.

### Etapa 24 — rediseño pixel-art completado

- Principito e Isabela fueron rediseñados como sprites Canvas pixel-art originales. Ambos comparten bloques de color visibles, contornos oscuros definidos, luces y sombras por bloques, calzado contrastado, lectura facial y poses animadas por estado. No se usó un filtro ni se incorporaron sprites o recursos de Metal Slug, Jetpack Joyride o la referencia.
- Principito conserva cabello dorado, rostro claro, abrigo azul con detalles dorados, capa roja y botas oscuras. Isabela conserva la identidad observada en su referencia: cabello largo oscuro con acentos rojizos, ojos grandes, piel clara, camiseta oscura, pantalón cargo con bolsillos y zapatillas claras. Ambos mantienen escalas y grosor de contorno compatibles para pertenecer al mismo universo visual.
- Las poses visuales usan los estados compartidos `IDLE`, `RUN`, `JUMP`, `FALL`, `ATTACK`, `HURT`, `VICTORY` e `INTERACTION`: carrera alterna piernas, salto/caída modifican la postura, ataque extiende el brazo y añade un destello pixelado, y daño modifica levemente la escala. No cambian hitboxes, movimiento ni física.
- Serpientes, baobabs y Zorro se ajustaron también a bloques pixelados para integrar los encuentros principales a la nueva dirección artística sin cambiar su comportamiento.
- Se inspeccionaron visualmente Principito en Capítulo 1 e Isabela en Capítulos 2 y 3; los sprites se leen correctamente frente a las distintas paletas. La consola del navegador quedó sin errores ni advertencias. Una prueba de render validó los tres niveles, ambos personajes y los ocho estados visuales sin alterar la selección de personaje. Todos los módulos JavaScript pasaron `node --check`.
- Se retiró el acceso temporal usado exclusivamente para pruebas. La Etapa 24 queda completada; no se inició audio ni trabajo de etapas posteriores.

### Etapa 25 — audio completado

- Se incorporó `js/systems/AudioManager.js`, un gestor reutilizable y simple basado únicamente en APIs nativas del navegador. Respeta la restricción de interacción del navegador: se desbloquea con el primer toque, clic o tecla del jugador.
- Se prepararon las cuatro rutas de música requeridas: `assets/audio/music/nivel-1.mp3`, `assets/audio/music/nivel-2.mp3`, `assets/audio/music/nivel-3/nivel-3.mp3` y `assets/audio/music/final.mp3`. `Game` selecciona la música correspondiente al iniciar cada capítulo y al pasar al final; pausa/reanuda con `Esc` y la detiene al regresar al menú.
- Se prepararon las seis rutas de efectos requeridas: `assets/audio/sfx/jump.wav`, `star.wav`, `damage.wav`, `attack.wav`, `interaction.wav` y `victory.wav`. Los disparadores están conectados, respectivamente, a salto válido, recoger estrella, daño efectivo, ataque válido con espada, rescate de Isabela y finalización de capítulo.
- Como no se proporcionaron aún archivos de audio, el gestor comprueba su disponibilidad sin provocar errores de carga: la música queda lista para reproducirse cuando se añadan las pistas y los efectos usan tonos cortos originales generados con Web Audio como respaldo. `assets/audio/README.md` documenta las rutas exactas y los directorios ya existen con archivos `.gitkeep`.
- Se validó la sintaxis de `AudioManager`, `Personaje` y `Game` con `node --check`. Una prueba aislada confirmó el respaldo sintetizado y la protección ante pistas ausentes; una prueba de integración comprobó música de capítulo y los efectos de salto, ataque, estrella, daño y victoria. No se modificaron física, vidas, cámara, selección de personaje ni la progresión del Nivel 3.

### Etapa 26 — optimización completada

- Se midió la carga actual: el sitio estático, excluyendo las referencias que no se publican como assets del juego, ocupa aproximadamente 156 KB y no depende de bibliotecas, motores, backend ni recursos remotos.
- `Game.drawWorld()` ahora omite el dibujo de plataformas, estrellas, poderes, espada y enemigos que quedan fuera de la cámara, con un margen de seguridad de 100 píxeles. La lógica de actualización y las colisiones siguen aplicándose a todos los objetos; solo se elimina trabajo de Canvas no visible.
- La música mantiene `preload = "none"`, por lo que una pista solo se consulta cuando se juega su capítulo. Los efectos se comprueban después de la interacción inicial y usan el respaldo Web Audio cuando los archivos todavía no existan, evitando fallos de carga repetidos.
- Una prueba de humo renderizó 180 cuadros en memoria, recorriendo los tres niveles con Principito e Isabela, sin excepciones. Todos los módulos de `js/` superaron `node --check`. No se aplicaron optimizaciones prematuras ni cambios a la experiencia jugable.

### Etapa 27 — publicación completada

- Se confirmó que el proyecto es publicable tal cual como sitio estático: `index.html` usa rutas relativas para CSS y el módulo de entrada, y los 21 módulos ES6 resuelven únicamente imports locales existentes. No hay dependencias externas, backend, base de datos ni proceso de compilación.
- Se añadió `README.md` con instrucciones de ejecución mediante servidor HTTP, controles, publicación en hosts estáticos, ubicación del audio y persistencia local. `index.html` incorpora además `theme-color` para una integración más coherente en navegadores móviles.
- Una comprobación mediante servidor HTTP local devolvió `200` para la raíz, `js/main.js` y `css/style.css`. La verificación del grafo de imports no encontró rutas rotas. El directorio puede publicarse en la raíz de GitHub Pages, Netlify, Vercel, Cloudflare Pages u otro host estático equivalente.

### Etapa 28 — pruebas finales y documentación completada

- Se añadió `tests/final-check.mjs`, una comprobación reproducible con APIs del navegador simuladas. Verifica menú, selección bloqueada y desbloqueada, persistencia de Isabela, los tres capítulos con ambos personajes, movimiento, salto, doble salto, aterrizaje en plataforma, cámara, estrellas, daño y vidas, espada y ataque, tres derrotas para el doble salto del Nivel 3, rescate, final, pausa, Game Over, reinicio y controles táctiles.
- La prueba también renderiza los capítulos mediante Canvas simulado, comprueba los eventos de audio esenciales, las cuatro rutas musicales, las seis rutas de efectos y las reglas CSS de orientación horizontal/vertical. Su ejecución con `node tests/final-check.mjs` terminó correctamente.
- Todos los módulos del juego y el propio chequeo superaron `node --check`. El grafo completo de 21 módulos ES6 no contiene imports locales rotos y un servidor HTTP local respondió `200` para la aplicación y la documentación.
- `README.md` documenta la ejecución local, controles, publicación estática, audio, persistencia y el comando de validación final. No se modificaron mecánicas durante las pruebas, salvo el culling visual ya registrado en la Etapa 26.

- Todos los módulos JavaScript superaron `node --check`.
- Una prueba de módulos confirmó las configuraciones de los tres niveles, las serpientes de Nivel 2, la espada y el rescate de Nivel 3, la activación de la hitbox de ataque, la actualización de Isabela y el seguimiento del Zorro.
- Se abrió el juego mediante un servidor HTTP local y se verificó en navegador el menú y el inicio del Capítulo 1. No hubo errores ni advertencias en consola.
- La captura visual del Capítulo 1 confirmó el renderizado del escenario interactivo, las plataformas, el personaje, el HUD y los elementos de jardín.
- Se comprobó en navegador que `Esc` abre la pantalla de pausa sin errores ni advertencias de consola.
- Una prueba de integración simuló tres daños, verificó la transición a `GAME_OVER` y confirmó que reintentar restablece el nivel y las tres vidas.
- Una prueba de entrada confirmó la presión sostenida y liberación de movimiento táctil, además de salto, ataque y pausa táctiles.
- Una prueba de estado confirmó que `Esc` pausa, no permite actualizar personaje ni enemigos mientras está pausado y reanuda correctamente.
- Se probó el diseño a 844 × 390: el menú se conserva íntegro en horizontal. A 390 × 844 se mostró correctamente `GIRA TU DISPOSITIVO`. Ambas vistas y la recarga final no generaron errores ni advertencias de consola.

## Problemas conocidos

- Las pistas finales y los seis efectos de sonido aún no han sido proporcionados como archivos. El sistema está listo para recibirlos en las rutas documentadas y mantiene efectos sintetizados mientras tanto. La pista concreta del Nivel 3 debe ser seleccionada manualmente por el desarrollador, tal como indica el proyecto.
- La pista de Nivel 4 aún no ha sido proporcionada. Su ruta queda configurada en `assets/audio/music/nivel-4/nivel-4.mp3`; el modo inicia la solicitud de música y continúa jugable en silencio si el archivo falta. La reproducción real queda pendiente hasta incorporar la pista.
- La validación visual en navegador de D/E queda pendiente porque el viewport de navegador disponible en esta sesión está en orientación vertical y muestra correctamente `GIRA TU DISPOSITIVO`; no fue posible cambiarlo a horizontal con las herramientas disponibles. La comprobación de render Canvas y la simulación técnica sí pasaron.

## Expansión — Bloques D y E: Nivel 4 arcade

- Se inspeccionaron directamente `referencias/nivel-4/ref-1.png`, `ref-2.png` y `ref-3.png`. Orientaron una escala local reducida del jugador (52%, sin cambiar dimensiones globales), terreno amplio, montañas en capas parallax, luz atmosférica y paletas que varían del atardecer cálido a zonas frías y nocturnas. El juego usa arte Canvas propio; ninguna referencia se reutilizó como fondo.
- D: se añadió `Nivel4`, un modo arcade infinito accesible desde EXTRAS una vez desbloqueado. Genera segmentos continuos con suelo, obstáculos, enemigos y recompensas; mantiene avance constante con ajuste de ritmo por ←/→, reutiliza salto y controles existentes, y aplica escala únicamente dentro del Nivel 4 al personaje seleccionado (incluidos los extras desbloqueados).
- El HUD arcade muestra puntuación, récord, distancia y zona. El récord se guarda en `localStorage` (`principito-nivel4-record`). Una colisión produce Game Over, detiene la música y ofrece nueva carrera o menú; reintentar reconstruye el modo desde cero sin borrar el récord ni cambiar personaje.
- E: la velocidad aumenta gradualmente hasta su tope y se amplían los tipos de peligros por distancia. Hay tramos seguros con recompensa periódicos y cuatro zonas visuales cíclicas con fondos, relieve, color de terreno e iluminación propios; una transición de color de 1.6 s y rótulo anuncian el cambio. En alta dificultad las parejas de peligros tienen mayor separación y el segmento siguiente queda como recuperación para preservar tiempo de aterrizaje y reacción.
- La pista configurable está en `assets/audio/music/nivel-4/nivel-4.mp3`; se reinicia al iniciar una carrera y se detiene al salir o perder. No se añadió ni generó música. La prueba real de reproducción queda pendiente del archivo aportado por el desarrollador.
- Verificación técnica: `node --check` de los módulos afectados y `node tests/final-check.mjs` pasaron. El chequeo automatiza recorridos de 60 segundos con cinco secuencias deterministas, dificultad avanzada sin modo invencible, transiciones de paleta, segmentos seguros, puntuación/distancia, Game Over, persistencia del récord, retry y selección/escala de Principito, Isabela y los personajes extras. La misma suite mantiene pruebas de regresión de los Niveles 1–3.
- Estado: implementación D/E lista; no se inicia F ni G. El cierre total de D/E queda pendiente de inspección visual en viewport horizontal y de probar la pista cuando esté disponible.

### Nivel 4 — agacharse, enemigos de persecución y Nueva York nocturna

- Se añadió agacharse con `S`/`↓` en PC y un botón táctil que aparece únicamente al jugar Nivel 4. La hitbox baja y el sprite se comprime verticalmente sin cambiar las dimensiones normales ni la física de campaña; al soltar o saltar recupera su altura arcade normal.
- Los enemigos voladores pasan a volar bajo para exigir agacharse. Los enemigos terrestres ahora se acercan al jugador al entrar en un rango de aviso; su velocidad crece con la distancia, pero queda limitada a un 36% de la velocidad del jugador, manteniendo margen para reaccionar y saltar. Se añadieron estelas y aviso visual cercano.
- Los cambios de entorno ocurren en hitos de 5.000 m. A los 5.000 m cambia a Valle del Viento y a los 10.000 m entra Nueva York de noche: edificios en capas parallax, ventanas iluminadas, luna y marcas de carretera, con transición gradual junto a la paleta. Los fondos conservan capas atmosféricas inspiradas en la composición de los capítulos 1–3.
- Validación: `node --check` y `node tests/final-check.mjs` pasan. Se probaron controles de teclado y táctiles, pasar bajo enemigos voladores, aceleración limitada de perseguidores, hitos de 5.000/10.000 m y cinco recorridos procedurales de 60 segundos que combinan salto y agacharse.

## Expansión — Bloque F: Modo difícil de campaña

- DIFÍCIL agrega un enemigo adicional en cada zona de los tres capítulos, ubicado sobre una plataforma ya existente con su patrulla dentro de los límites transitables. La implementación pertenece al ajuste de dificultad de la zona activa; no altera globalmente niveles ni plataformas.
- Los enemigos extra se aplican una sola vez, desaparecen al cambiar a Fácil o Normal y pueden volver a aplicarse al regresar a Difícil. Fácil y Normal conservan las cantidades de enemigos originales; sus multiplicadores de velocidad siguen siendo 0,9 y 1,0, mientras DIFÍCIL mantiene 1,15.
- Se preservaron los apoyos de progresión: el poder de doble salto y el jetpack del Capítulo 1, los objetivos de salida del Capítulo 2, y la espada junto con suficientes enemigos para desbloquear el doble salto del Capítulo 3. Las zonas mantienen sus rutas y objetivos.
- Verificación automatizada: `node tests/final-check.mjs` pasó, incluyendo chequeos de los tres capítulos, colocación sobre plataformas, ausencia de duplicados, retirada al salir de DIFÍCIL, rutas/objetivos de zonas, poderes y regresiones de campaña existentes. Todos los archivos JavaScript pasaron `node --check`.
- Estado: Bloque F implementado y validación automatizada aprobada. La prueba confirma estructura y progresión de las rutas en DIFÍCIL; no equivale a una sesión manual de juego humano en hardware real.

## Próximo paso

- No iniciar los Bloques F o G hasta nueva autorización. Para cerrar la verificación de D/E, abrir el juego en viewport horizontal y probar la música cuando se añada `assets/audio/music/nivel-4/nivel-4.mp3`.
