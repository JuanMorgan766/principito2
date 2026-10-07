# AGENTS.md — THE LITTLE PRINCE

## 1. PROPÓSITO DEL PROYECTO

Este proyecto es un videojuego web 2D de plataformas inspirado en la temática y sensibilidad narrativa de *El Principito*.

El juego debe poder ejecutarse directamente desde un navegador moderno en:

* PC;
* portátil;
* Android;
* iPhone;
* tablet.

La versión final debe poder publicarse como un sitio web estático.

El objetivo académico y técnico es construir un videojuego:

* funcional;
* sencillo;
* comprensible;
* mantenible;
* visualmente coherente;
* jugable;
* adaptable a dispositivos móviles;
* desarrollado con POO cuando aporte una responsabilidad real;
* fácil de explicar y defender académicamente.

---

# 2. TECNOLOGÍAS

Utilizar principalmente:

* HTML5;
* CSS3;
* JavaScript ES6+;
* Canvas 2D;
* ES6 Modules;
* `requestAnimationFrame`.

No utilizar:

* Java;
* Java Swing;
* LibGDX;
* Unity;
* motores externos de videojuegos;
* backend;
* base de datos;
* frameworks innecesarios.

No instalar dependencias externas sin una necesidad técnica real.

El proyecto debe poder ejecutarse como sitio web estático.

Para desarrollo local puede utilizarse un servidor HTTP sencillo, por ejemplo:

```bash
python -m http.server 8000
```

También es válido utilizar una herramienta de desarrollo equivalente, como Live Server, siempre que el proyecto continúe siendo un sitio web estático.

No crear un backend únicamente para ejecutar el juego.

---

# 3. FILOSOFÍA GENERAL DE DESARROLLO

El proyecto debe mantenerse sencillo y apropiado para un estudiante de Ingeniería de Sistemas.

Priorizar:

* claridad;
* legibilidad;
* modularidad razonable;
* responsabilidades claras;
* soluciones sencillas;
* facilidad de mantenimiento;
* facilidad para explicar el código.

Evitar:

* arquitectura empresarial;
* patrones de diseño innecesarios;
* abstracciones excesivas;
* sistemas excesivamente sofisticados;
* dependencias innecesarias;
* código generado de forma innecesariamente compleja;
* clases creadas únicamente para demostrar POO.

Si una solución sencilla funciona correctamente, utilizar la solución sencilla.

La sofisticación no es un objetivo por sí misma.

---

# 4. FUENTES DE VERDAD DEL PROYECTO

El proyecto utiliza tres niveles de información.

## AGENTS.md

Define las reglas permanentes y decisiones estructurales del proyecto.

## PROGRESS.md

Define el estado real actual del desarrollo:

* etapa actual;
* etapas completadas;
* cambios recientes;
* problemas conocidos;
* decisiones tomadas;
* decisiones arquitectónicas importantes;
* próxima etapa.

`PROGRESS.md` debe registrar también decisiones que afecten la arquitectura o el comportamiento general del proyecto, para evitar que una sesión futura cambie deliberadamente una decisión ya tomada sin motivo.

## Instrucción de la etapa o bloque actual

Define exactamente qué debe implementarse durante la sesión actual.

Si existe un conflicto:

1. respetar `AGENTS.md`;
2. respetar el estado real indicado por `PROGRESS.md`;
3. ejecutar únicamente la etapa o bloque explícitamente autorizado;
4. no adelantarse a etapas futuras.

---

# 5. DESARROLLO POR ETAPAS

El proyecto debe desarrollarse progresivamente.

Codex puede trabajar:

* una etapa individual; o
* un bloque de varias etapas consecutivas explícitamente autorizado por el usuario.

Antes de comenzar:

1. leer completamente `AGENTS.md`;
2. leer `PROGRESS.md`;
3. inspeccionar el proyecto actual;
4. revisar los archivos relacionados;
5. entender qué existe realmente;
6. determinar qué necesita modificarse;
7. verificar cuál es la etapa o bloque autorizado.

Durante cada etapa:

1. implementar únicamente la funcionalidad correspondiente;
2. ejecutar el proyecto;
3. probar la funcionalidad;
4. identificar errores;
5. corregirlos;
6. volver a ejecutar;
7. comprobar que continúan funcionando las etapas anteriores.

Después de cada etapa completada dentro de un bloque:

* actualizar `PROGRESS.md`;
* comprobar que la implementación sigue estable;
* continuar únicamente con la siguiente etapa del mismo bloque autorizado.

Después de terminar el bloque:

1. verificar el estado completo del bloque;
2. actualizar `PROGRESS.md`;
3. explicar qué cambió;
4. explicar cómo probarlo;
5. indicar cualquier problema pendiente;
6. detenerse.

## REGLA IMPORTANTE

Codex **NO debe continuar automáticamente fuera del bloque autorizado**.

Si el usuario autoriza:

```text
Haz las etapas 6, 7 y 8.
```

Codex puede realizar:

```text
6 → 7 → 8
```

pero no:

```text
6 → 7 → 8 → 9
```

La autorización de un bloque no elimina la obligación de validar cada etapa individual.

---

# 5.1. HOJA DE RUTA OFICIAL

Las siguientes etapas constituyen la hoja de ruta oficial del proyecto.

Codex debe utilizar esta sección para saber exactamente qué corresponde a cada número.

No debe depender de conversaciones anteriores para determinar el contenido de una etapa.

Una etapa solamente se considera completada cuando fue:

1. implementada;
2. ejecutada;
3. probada;
4. corregida cuando fue necesario;
5. registrada como completada en `PROGRESS.md`.

---

## ETAPA 0 — Planificación y estructura

Preparar:

* estructura inicial del proyecto;
* `AGENTS.md`;
* `PROGRESS.md`;
* carpetas principales;
* módulos iniciales.

No implementar todavía las mecánicas completas del videojuego.

---

## ETAPA 1 — HTML y estructura base

Implementar:

* HTML5;
* estructura de la página;
* contenedor del juego;
* Canvas;
* carga inicial de JavaScript;
* estructura visual mínima.

Objetivo:

El proyecto debe abrir correctamente en el navegador.

---

## ETAPA 2 — Canvas y Game Loop

Implementar:

* Canvas lógico de aproximadamente `1280 × 720`;
* contexto 2D;
* `requestAnimationFrame`;
* ciclo principal:

```text
INPUT
↓
UPDATE
↓
COLISIONES
↓
RENDER
```

* base de estados del juego cuando sea necesaria.

Todavía no implementar las mecánicas completas del personaje.

---

## ETAPA 3 — Principito

Crear la base del personaje jugable El Principito.

Incluye:

* representación visual;
* posición;
* dimensiones;
* estado básico;
* estructura preparada para utilizar futuros sistemas generales.

No implementar todavía movimiento completo, gravedad, plataformas, cámara, enemigos, vidas, estrellas ni combate.

La implementación debe evitar depender exclusivamente del nombre `Principito` para futuros sistemas.

---

## ETAPA 4 — Movimiento

Implementar:

* movimiento izquierda;
* movimiento derecha;
* velocidad horizontal;
* dirección/orientación;
* teclado;
* soporte para el personaje actualmente controlado.

Controles principales:

```text
A / ←
D / →
```

El sistema debe poder reutilizarse posteriormente para Isabela.

---

## ETAPA 5 — Gravedad y salto

Implementar:

* gravedad;
* velocidad vertical;
* salto;
* caída;
* estado de salto;
* reinicio de velocidad vertical al aterrizar sobre una superficie válida.

Controles:

```text
SPACE
W
↑
```

No implementar todavía sistemas que correspondan a etapas posteriores salvo la preparación mínima necesaria.

---

## ETAPA 6 — Plataformas

Implementar:

* representación de plataformas;
* posición;
* dimensiones;
* múltiples plataformas;
* colisión personaje/plataforma;
* aterrizaje;
* prevención de atravesar plataformas;
* reutilización del sistema en los niveles.

No implementar todavía enemigos ni combate.

---

## ETAPA 7 — Cámara

Implementar:

* cámara horizontal;
* seguimiento del personaje actualmente controlado;
* límites horizontales;
* conversión entre coordenadas de mundo y pantalla;
* separación entre cámara y HUD.

La cámara debe funcionar independientemente de si el personaje es Principito o Isabela.

---

## ETAPA 8 — Enemigos

Implementar la base de enemigos.

Incluye:

* comportamiento común;
* colisión personaje/enemigo;
* interacción básica con el jugador;
* comportamiento sencillo.

Preparar posteriormente variantes como:

* Baobab;
* Serpiente.

No implementar IA compleja.

---

## ETAPA 9 — Vidas y daño

Implementar:

* 3 vidas por capítulo;
* pérdida de vida;
* daño;
* invulnerabilidad temporal;
* respawn;
* reinicio de velocidad vertical;
* `GAME_OVER` al llegar a 0 vidas.

No implementar checkpoints complejos.

---

## ETAPA 10 — Estrellas

Implementar:

* estrellas coleccionables;
* detección de contacto;
* desaparición;
* contador del nivel;
* HUD:

```text
⭐ Estrellas: X
```

Al reiniciar el nivel, las estrellas deben volver a estar disponibles.

---

## ETAPA 11 — Doble salto

Implementar el poder de doble salto del Nivel 1.

Antes de obtenerlo:

```text
1 salto por caída
```

Después:

```text
2 saltos por caída
```

Incluye:

* contador de saltos;
* reinicio al aterrizar;
* activación del poder;
* reinicio del poder al reiniciar el nivel.

No permitir saltos infinitos.

---

## ETAPA 12 — Espada y ataque

Implementar:

* espada en el Nivel 3;
* ataque inicialmente bloqueado;
* desbloqueo;
* control mediante `J`;
* hitbox temporal delante del personaje;
* interacción ataque/enemigo.

No implementar:

* combos;
* árboles de habilidades;
* inventario complejo;
* sistemas RPG.

---

## ETAPA 13 — Nivel 1 / Capítulo 1

Construir el Nivel 1 completo:

```text
Planeta del Principito
+
jardín asiático fantástico
```

### Referencias obligatorias

Las tres referencias visuales del Capítulo 1 se encuentran exclusivamente dentro de:

```text
referencias/nivel-1/
```

Los archivos tienen como nombres base:

```text
cap1-referencia-1
cap2-referencia-2
cap3-referencia-3
```

Las extensiones reales deben determinarse inspeccionando el proyecto.

Estas tres imágenes son referencias obligatorias para la construcción visual del Nivel 1.

### Inspección obligatoria

Antes de construir visualmente el Nivel 1, Codex debe:

1. localizar las tres imágenes dentro de `referencias/nivel-1/`;
2. abrirlas o inspeccionarlas visualmente;
3. analizar directamente su contenido;
4. identificar las características relevantes;
5. utilizar ese análisis durante la construcción del escenario.

No basta con:

* conocer sus nombres;
* conocer sus rutas;
* leer una descripción textual;
* asumir cómo son las imágenes.

### Características a analizar

Como mínimo:

* composición;
* arquitectura;
* distribución espacial;
* templos;
* jardines;
* flores de loto;
* estanques;
* piedras;
* vegetación;
* faroles;
* representaciones de Buda;
* iluminación;
* colores;
* profundidad;
* perspectiva;
* atmósfera;
* relación entre naturaleza y arquitectura.

### Implementación

Debe incluir:

* templos;
* jardines;
* flores de loto;
* estanques;
* piedras;
* vegetación;
* faroles;
* Buda como elemento decorativo;
* estrellas;
* baobabs;
* Rosa;
* plataformas;
* obstáculos;
* poder de doble salto.

Las referencias deben utilizarse como dirección artística para construir un escenario propio.

No:

* utilizar una referencia como fondo completo;
* convertirla en un único asset gigante;
* copiar literalmente una composición;
* limitar la jugabilidad a la imagen.

La dirección artística debe trasladarse a un escenario jugable.

### Verificación

Después de implementar el nivel, Codex debe comprobar visualmente que el resultado refleja las tres referencias en aspectos importantes de:

* arquitectura;
* composición;
* vegetación;
* iluminación;
* color;
* profundidad;
* atmósfera.

Registrar en `PROGRESS.md`:

* que las tres referencias fueron inspeccionadas;
* sus principales características visuales;
* qué características influyeron en la implementación.

Si alguna imagen no puede ser inspeccionada, Codex debe indicarlo explícitamente.

---

## ETAPA 14 — Nivel 2 / Capítulo 2

Construir el Nivel 2:

```text
Planeta del Zorro
```

Debe incluir:

* plataformas;
* estrellas;
* serpientes;
* obstáculos;
* espacio destinado al acompañamiento del Zorro;
* meta.

La implementación completa del comportamiento del Zorro corresponde a la Etapa 15.

No implementar IA compleja.

---

## ETAPA 15 — Zorro

Implementar:

* presencia funcional del Zorro;
* seguimiento sencillo;
* distancia razonable respecto al jugador;
* detección sencilla de enemigos cercanos;
* posible advertencia visual.

No implementar:

* pathfinding;
* navegación avanzada;
* aprendizaje automático;
* IA compleja.

---

## ETAPA 16 — Nivel 3 / Capítulo 3

Construir el Nivel 3:

```text
Planeta Final
```

Debe incluir:

* plataformas;
* enemigos;
* obstáculos;
* estrellas;
* espada;
* Isabela atrapada como elemento narrativo;
* objetivo de llegar hasta Isabela;
* interacción sencilla de rescate;
* transición al final.

El Nivel 3 debe ser el capítulo de mayor dificultad.

La implementación jugable de Isabela corresponde a la Etapa 17.

La música concreta del Nivel 3 será proporcionada o seleccionada manualmente por el desarrollador.

**Codex no debe buscar, descargar ni generar automáticamente esta pista.**

Codex debe implementar únicamente el sistema necesario para reproducirla.

---

## ETAPA 17 — Isabela

Implementar a Isabela como segundo personaje jugable.

### Referencia obligatoria

La referencia visual de Isabela se encuentra exclusivamente dentro de:

```text
referencias/isabela/
```

Dentro existe una imagen cuyo nombre base es:

```text
referencia-isabela
```

La extensión real debe determinarse inspeccionando el archivo existente.

### Inspección obligatoria

Antes de implementar visualmente a Isabela, Codex debe:

1. localizar la referencia;
2. abrirla o inspeccionarla visualmente;
3. analizar directamente la apariencia del personaje;
4. utilizar ese análisis para construir la versión 2D.

No basta con:

* conocer el nombre;
* conocer la ruta;
* leer una descripción textual;
* asumir cómo es la imagen.

### Características a conservar

Mantener consistentes:

* rostro;
* cabello;
* color del cabello;
* vestimenta;
* colores;
* proporciones;
* silueta;
* características visuales distintivas.

Debe convertirse en un personaje 2D coherente con la dirección artística general del videojuego.

La referencia NO debe utilizarse directamente como sprite final.

### Estados

Puede incluir:

* `IDLE`;
* `RUN`;
* `JUMP`;
* `FALL`;
* `ATTACK`;
* `HURT`;
* `VICTORY`;
* `INTERACTION`.

### Sistemas

No duplicar:

* movimiento;
* gravedad;
* salto;
* colisiones;
* cámara;
* vidas;
* controles.

### Verificación

Después de implementarla:

* comparar visualmente el personaje con la referencia;
* comprobar que conserva las características principales;
* comprobar que las animaciones representan al mismo personaje;
* comprobar que encaja con el universo visual del juego.

Registrar en `PROGRESS.md` que la referencia fue inspeccionada y utilizada.

Si la referencia no puede ser inspeccionada, indicarlo explícitamente.

---

## ETAPA 18 — Selección y desbloqueo

Implementar:

* selección de personaje;
* estado bloqueado/desbloqueado;
* desbloqueo al completar la campaña principal;
* persistencia mediante `localStorage`;
* selección entre Principito e Isabela.

No crear niveles duplicados para Isabela.

---

## ETAPA 19 — Rejugabilidad y adaptación narrativa

Permitir jugar nuevamente:

* Nivel 1;
* Nivel 2;
* Nivel 3;

con Isabela.

Reutilizar exactamente los mismos niveles.

Adaptar de forma sencilla el Nivel 3 y el final cuando Isabela sea el personaje controlado para evitar contradicciones narrativas.

No crear una campaña paralela ni un Capítulo 4.

---

## ETAPA 20 — Pausa

Implementar:

```text
PAUSA

CONTINUAR
REINICIAR NIVEL
MENÚ
```

Debe funcionar mediante:

* `ESC`;
* botón táctil.

El mundo no debe actualizarse mientras está pausado.

---

## ETAPA 21 — Game Over

Implementar:

```text
GAME OVER

El viaje no termina aquí.

REINTENTAR
MENÚ PRINCIPAL
```

Reintentar debe reiniciar correctamente el nivel actual.

---

## ETAPA 22 — Controles móviles

Implementar:

```text
←
→
SALTO
⚔
PAUSA
```

Utilizar preferentemente:

* `pointerdown`;
* `pointerup`;
* `pointercancel`;
* `pointerleave`.

Debe ser posible mantener presionado izquierda o derecha.

---

## ETAPA 23 — Responsive y orientación

Adaptar el juego a:

* PC;
* Android;
* iPhone;
* tablet.

Resolución lógica aproximada:

```text
1280 × 720
```

Priorizar orientación horizontal.

En orientación vertical mostrar:

```text
GIRA TU DISPOSITIVO
```

---

## ETAPA 24 — Gráficos y pulido visual

Realizar el pulido visual general:

* coherencia artística;
* animaciones;
* fondos;
* efectos;
* HUD;
* menú;
* interfaz;
* escenarios;
* consistencia entre personajes y niveles.

### Referencias

Volver a revisar visualmente las referencias utilizadas:

Para el Capítulo 1:

```text
referencias/nivel-1/
```

Para Isabela:

```text
referencias/isabela/
```

Comprobar que:

* el Capítulo 1 conserva la dirección artística derivada de las tres referencias;
* Isabela mantiene coherencia con su referencia;
* las animaciones mantienen sus proporciones e identidad;
* todos los elementos pertenecen al mismo universo visual.

No reemplazar arbitrariamente decisiones artísticas ya establecidas.

---

## ETAPA 25 — Audio

Implementar el sistema de audio definido en `#45 AUDIO`.

La primera versión debe priorizar:

### Música

* Nivel 1;
* Nivel 2;
* Nivel 3;
* Final.

### SFX

* salto;
* estrella;
* daño;
* ataque;
* interacción;
* victoria.

No implementar inicialmente una biblioteca extensa de sonidos ambientales.

---

## ETAPA 26 — Optimización

Comprobar:

* rendimiento;
* memoria;
* carga de assets;
* Canvas;
* animaciones;
* audio;
* compatibilidad básica.

No realizar optimización prematura.

---

## ETAPA 27 — Publicación

Preparar el proyecto para publicación como sitio web estático.

Comprobar:

* rutas;
* assets;
* módulos;
* dependencias locales;
* compatibilidad con una URL pública.

---

## ETAPA 28 — Pruebas finales y documentación

Comprobar:

* menú;
* selección de personaje;
* desbloqueo;
* Nivel 1;
* Nivel 2;
* Nivel 3;
* movimiento;
* salto;
* doble salto;
* plataformas;
* cámara;
* enemigos;
* vidas;
* estrellas;
* espada;
* rescate;
* final;
* pausa;
* Game Over;
* controles móviles;
* responsive;
* audio;
* persistencia.

Actualizar la documentación final.

---

# 5.2. BLOQUES DE ETAPAS

Las etapas pueden ejecutarse individualmente o agrupadas.

Un bloque solamente existe cuando el usuario lo autoriza explícitamente.

La autorización de un bloque significa que Codex puede implementar las etapas consecutivas indicadas durante la misma sesión, validando cada una antes de continuar.

Ejemplo:

```text
Haz las etapas 6, 7, 8, 9 y 10.
```

Esto autoriza:

```text
6 → 7 → 8 → 9 → 10
```

No autoriza:

```text
11
```

Codex debe detenerse al terminar la última etapa autorizada.

## Bloques recomendados

Para reducir el número de sesiones, se recomienda trabajar aproximadamente en bloques de cinco etapas:

```text
BLOQUE 1
Etapas 0–4

BLOQUE 2
Etapas 5–9

BLOQUE 3
Etapas 10–14

BLOQUE 4
Etapas 15–19

BLOQUE 5
Etapas 20–24

BLOQUE 6
Etapas 25–28
```

Estos bloques son una recomendación de organización y **no quedan autorizados automáticamente**.

El usuario debe autorizar cada bloque.

Dentro de cada bloque:

1. implementar la etapa;
2. probarla;
3. corregir errores;
4. comprobar que las etapas anteriores siguen funcionando;
5. actualizar `PROGRESS.md`;
6. continuar con la siguiente etapa autorizada.

No saltar etapas dentro del bloque salvo autorización explícita.

No extender el bloque automáticamente.

---

# 5.3. ESTADO REAL DEL PROYECTO

Si `PROGRESS.md` indica una etapa como completada pero el código real está incompleto:

* no asumir que está terminada;
* identificar la diferencia;
* completar o corregir la etapa;
* actualizar `PROGRESS.md`.

Si el código demuestra que una etapa está correctamente terminada pero `PROGRESS.md` no está actualizado:

* no repetir innecesariamente la implementación;
* corregir `PROGRESS.md`;
* continuar desde la siguiente etapa pendiente.

El estado real del proyecto tiene prioridad sobre una descripción incorrecta del progreso.

---

# 6. MANEJO DE ERRORES

Cuando aparezca un error:

1. identificarlo;
2. explicar brevemente la causa;
3. corregirlo;
4. ejecutar nuevamente;
5. comprobar que desapareció;
6. continuar únicamente dentro de la etapa o bloque autorizado.

No ocultar errores.

No afirmar que algo funciona si no fue comprobado.

No crear soluciones temporales sin explicar sus consecuencias.

---

# 7. MODIFICACIÓN DE ARCHIVOS

Antes de modificar un archivo:

1. leer su contenido actual;
2. entender su responsabilidad;
3. revisar sus relaciones con otros archivos;
4. identificar qué código ya existe;
5. modificar únicamente lo necesario.

No:

* borrar código funcional sin motivo;
* duplicar funciones;
* duplicar clases;
* crear archivos innecesarios;
* reemplazar una solución funcional simplemente por preferencia personal;
* reescribir grandes partes del proyecto sin necesidad.

Si un archivo ya contiene una solución funcional, ampliarla cuando sea razonable en lugar de reemplazarla completamente.

---

# 8. PROGRAMACIÓN ORIENTADA A OBJETOS

Utilizar POO cuando aporte responsabilidades reales.

El proyecto debe permitir explicar conceptos como:

* clases;
* objetos;
* encapsulación;
* herencia;
* composición;
* responsabilidades.

No convertir automáticamente cada elemento visual en una clase.

Antes de crear una clase nueva, comprobar:

1. ¿Tiene una responsabilidad propia?
2. ¿Tiene comportamiento o estado propio?
3. ¿Se reutilizará?
4. ¿Existe una relación lógica de herencia o composición?
5. ¿La clase facilita realmente la comprensión?

Si no aporta una responsabilidad real, no crearla.

---

# 9. ARQUITECTURA

La arquitectura debe ser modular, pero sencilla.

Una estructura posible:

```text
/
├── index.html
├── AGENTS.md
├── PROGRESS.md
│
├── css/
│   └── style.css
│
├── js/
│   ├── main.js
│   ├── Game.js
│   ├── GameState.js
│   │
│   ├── entities/
│   │   ├── Entity.js
│   │   ├── Personaje.js
│   │   ├── Principito.js
│   │   ├── Isabela.js
│   │   ├── Enemigo.js
│   │   ├── Baobab.js
│   │   ├── Serpiente.js
│   │   └── Zorro.js
│   │
│   ├── objects/
│   │   ├── Plataforma.js
│   │   ├── Estrella.js
│   │   ├── Poder.js
│   │   └── Espada.js
│   │
│   ├── levels/
│   │   ├── Nivel.js
│   │   ├── Nivel1.js
│   │   ├── Nivel2.js
│   │   └── Nivel3.js
│   │
│   ├── systems/
│   │   ├── CollisionSystem.js
│   │   ├── InputManager.js
│   │   ├── LevelManager.js
│   │   ├── AssetManager.js
│   │   └── AudioManager.js
│   │
│   └── ui/
│       ├── HUD.js
│       ├── Menu.js
│       ├── PauseScreen.js
│       ├── GameOverScreen.js
│       └── FinalScreen.js
│
├── assets/
│   ├── characters/
│   ├── audio/
│   └── ...
│
└── referencias/
    ├── isabela/
    │   └── referencia-isabela.[extensión real]
    │
    └── nivel-1/
        ├── cap1-referencia-1.[extensión real]
        ├── cap2-referencia-2.[extensión real]
        └── cap3-referencia-3.[extensión real]
```

Esta estructura es una guía, no una obligación absoluta.

No crear todos los archivos desde el principio.

No crear clases vacías.

No crear sistemas antes de que sean necesarios.

## `Personaje.js`

`Personaje.js` es opcional.

Puede utilizarse como clase intermedia entre `Entity` y los personajes jugables si durante la implementación se identifica suficiente comportamiento común.

No crear `Personaje.js` solamente para introducir un nivel adicional de herencia.

Si la solución más sencilla consiste en que ambos personajes hereden directamente de `Entity` y compartan comportamiento mediante métodos, propiedades o composición, esa alternativa es válida.

La estructura definitiva debe decidirse según las responsabilidades reales.

No cambiar toda la arquitectura únicamente por seguir esta estructura de referencia.

## `AudioManager.js`

`AudioManager.js` es el componente previsto para centralizar la reproducción de música y efectos cuando llegue la etapa correspondiente.

No crear un sistema complejo de audio.

No es obligatorio crearlo antes de la Etapa 25.

---

# 10. PERSONAJES JUGABLES

El juego debe soportar dos personajes jugables:

* El Principito;
* Isabela.

El Principito es el personaje inicial.

Isabela comienza bloqueada.

La arquitectura debe permitir controlar cualquiera de los dos sin duplicar el sistema completo del juego.

Los niveles deben trabajar con el personaje actualmente seleccionado.

Evitar diseñar los niveles suponiendo que siempre existe específicamente un objeto `Principito`.

---

# 11. ISABELA DESBLOQUEABLE

La campaña principal tiene exactamente tres capítulos.

No existe un Capítulo 4.

La progresión principal es:

```text
CAPÍTULO 1
     ↓
CAPÍTULO 2
     ↓
CAPÍTULO 3
     ↓
RESCATE DE ISABELA
     ↓
FINAL
     ↓
ISABELA DESBLOQUEADA
```

Después de completar la campaña principal, Isabela se desbloquea como personaje jugable.

El jugador podrá elegir posteriormente:

```text
EL PRINCIPITO
ISABELA
```

Isabela puede volver a jugar:

* Capítulo 1;
* Capítulo 2;
* Capítulo 3.

No crear versiones duplicadas de los niveles exclusivamente para Isabela.

---

# 12. PERSISTENCIA DEL DESBLOQUEO

El desbloqueo debe persistir entre sesiones en el mismo navegador y bajo el mismo origen del sitio.

Utilizar preferentemente:

```text
localStorage
```

No utilizar base de datos ni backend.

Al volver a abrir el juego en el mismo navegador y origen, el jugador no debe tener que completar nuevamente la campaña para desbloquear a Isabela.

Esta persistencia no necesita sincronizarse entre:

* navegadores diferentes;
* dispositivos diferentes;
* cuentas diferentes.

No implementar esta persistencia antes de su etapa correspondiente.

---

# 13. SELECCIÓN DE PERSONAJE

Antes del desbloqueo:

```text
PERSONAJE

EL PRINCIPITO
ISABELA 🔒
```

Después:

```text
PERSONAJE

EL PRINCIPITO
ISABELA
```

La selección determina el personaje controlado durante la partida.

Los niveles, cámara, controles, vidas, estrellas, enemigos y sistemas generales deben reutilizarse independientemente del personaje.

---

# 14. REJUGABILIDAD

Los tres capítulos deben ser reutilizables con ambos personajes.

No duplicar:

* mapas;
* niveles;
* enemigos;
* sistemas;
* plataformas;
* estrellas;
* cámaras;
* controles.

Evitar lógica excesivamente específica cuando pueda utilizarse una propiedad, método o configuración común del personaje.

---

# 15. DIFERENCIAS ENTRE PERSONAJES

Cada personaje puede tener sus propias:

* dimensiones;
* velocidad;
* fuerza de salto;
* animaciones;
* sprites;
* ataques;
* habilidades;
* efectos visuales;
* sonidos.

Estas diferencias deben implementarse de manera sencilla.

No duplicar sistemas completos.

---

# 16. ISABELA Y SU REFERENCIA VISUAL

La referencia visual de Isabela se encuentra exclusivamente dentro de:

```text
referencias/isabela/
```

Dentro existe una imagen cuyo nombre base es:

```text
referencia-isabela
```

La extensión real debe determinarse inspeccionando el archivo existente.

La referencia representa la apariencia que debe tener el personaje.

NO debe utilizarse directamente como sprite dentro del juego.

Debe utilizarse como guía para construir una versión 2D coherente de Isabela.

Mantener consistentes:

* rostro;
* cabello;
* color del cabello;
* vestimenta;
* colores;
* proporciones;
* silueta;
* características visuales distintivas.

Estados previstos:

* `IDLE`;
* `RUN`;
* `JUMP`;
* `FALL`;
* `ATTACK`;
* `HURT`;
* `VICTORY`;
* `INTERACTION`.

La implementación puede utilizar:

* sprite sheets;
* imágenes individuales;
* Canvas;
* combinación de estos métodos.

Elegir la solución más sencilla y mantenible.

La inspección visual obligatoria y el proceso de implementación se definen en la Etapa 17.

---

# 17. REFERENCIAS VISUALES

Las referencias visuales son guías reales proporcionadas por el desarrollador.

No son únicamente descripciones textuales.

La secuencia obligatoria es:

```text
REFERENCIA
↓
INSPECCIÓN VISUAL
↓
ANÁLISIS
↓
DIRECCIÓN ARTÍSTICA
↓
IMPLEMENTACIÓN
↓
VERIFICACIÓN
```

Cuando una etapa dependa visualmente de una referencia:

1. localizar el archivo real;
2. abrirlo o inspeccionarlo directamente;
3. analizarlo;
4. utilizar sus características durante la implementación;
5. verificar posteriormente el resultado.

No basta con:

* conocer el nombre;
* conocer la ruta;
* leer una descripción;
* asumir cómo es la imagen.

No afirmar que una referencia fue utilizada si no fue inspeccionada visualmente.

Si la imagen no puede abrirse o inspeccionarse por una limitación técnica, Codex debe indicarlo explícitamente.

---

# 18. REFERENCIAS DEL CAPÍTULO 1

Las referencias visuales del Capítulo 1 se encuentran exclusivamente dentro de:

```text
referencias/nivel-1/
```

Los tres archivos tienen como nombres base:

```text
cap1-referencia-1
cap2-referencia-2
cap3-referencia-3
```

Las extensiones reales deben determinarse inspeccionando el proyecto.

Estas tres imágenes son referencias obligatorias para la construcción visual del Nivel 1.

No moverlas a otra carpeta.

No renombrarlas sin autorización explícita.

No modificarlas.

No reemplazarlas.

Antes de construir visualmente el Capítulo 1 deben ser abiertas e inspeccionadas las tres.

---

# 19. ESTILO DEL NIVEL 1

El Nivel 1 tendrá una estética de:

```text
jardín asiático fantástico
+
universo de El Principito
```

Debe construirse a partir del análisis de las tres referencias reales ubicadas en:

```text
referencias/nivel-1/
```

Puede incluir:

* templos asiáticos;
* flores de loto;
* estanques;
* jardines;
* piedras;
* faroles;
* vegetación;
* representaciones de Buda;
* elementos naturales orientales;
* cielo fantástico;
* estrellas;
* elementos relacionados con *El Principito*.

Debe conservar una sensación:

* soñadora;
* poética;
* fantástica;
* contemplativa.

La temática asiática no debe sentirse como un escenario genérico separado del universo de *El Principito*.

---

# 20. CREACIÓN VISUAL DEL RESTO DEL JUEGO

Codex puede crear dentro del proyecto:

* El Principito;
* Zorro;
* serpientes;
* baobabs;
* Rosa;
* estrellas;
* espada;
* plataformas;
* objetos;
* enemigos;
* escenarios;
* efectos;
* interfaz.

No buscar ni incorporar assets visuales externos innecesariamente.

La referencia de Isabela y las tres referencias del Capítulo 1 son excepciones porque fueron proporcionadas específicamente para orientar el diseño.

---

# 21. DIRECCIÓN ARTÍSTICA GENERAL

Todos los elementos deben parecer pertenecientes al mismo videojuego.

Mantener coherencia en:

* estilo de ilustración;
* proporciones;
* paleta;
* grosor de línea;
* nivel de detalle;
* iluminación;
* perspectiva;
* sombras.

Evitar mezclas visuales incompatibles.

El objetivo es una estética 2D fantástica, coherente y reconocible.

---

# 22. INDEPENDENCIA DE ELEMENTOS INTERACTIVOS

Los elementos que tengan:

* colisión;
* animación;
* interacción;
* movimiento;
* comportamiento;
* reutilización;

deben poder existir independientemente del fondo cuando sea necesario.

Ejemplos:

* estrella → objeto;
* serpiente → entidad;
* plataforma → objeto;
* Zorro → entidad;
* Isabela → personaje;
* espada → objeto.

Los elementos puramente decorativos pueden formar parte del escenario.

---

# 23. NIVELES

Existen exactamente tres capítulos principales.

## NIVEL 1 — PLANETA DEL PRINCIPITO

Características:

* jardín asiático fantástico;
* templos;
* flores de loto;
* estanques;
* jardines;
* Buda como elemento decorativo;
* estrellas;
* baobabs;
* Rosa;
* obstáculos;
* plataformas;
* poder de doble salto.

Las tres referencias ubicadas en:

```text
referencias/nivel-1/
```

deben influir directamente en la dirección artística.

## NIVEL 2 — PLANETA DEL ZORRO

Características:

* plataformas;
* estrellas;
* serpientes;
* obstáculos;
* Zorro;
* meta.

Zorro acompaña al jugador mediante el sistema definido en la Etapa 15.

No implementar IA compleja.

## NIVEL 3 — PLANETA FINAL

Características:

* plataformas;
* enemigos;
* obstáculos;
* estrellas;
* espada;
* Isabela atrapada;
* objetivo de rescate;
* final.

El objetivo de la campaña principal es rescatar a Isabela.

Cuando se utilice posteriormente a Isabela, el contenido debe adaptarse de forma sencilla para evitar contradicciones narrativas.

---

# 24. NO EXISTE CAPÍTULO 4

No crear un cuarto capítulo.

La experiencia adicional con Isabela consiste en volver a jugar los mismos tres capítulos.

No crear:

```text
Capítulo 4 — Isabela
```

---

# 25. HERENCIA

Utilizar herencia solamente cuando exista una relación lógica real.

Posible estructura:

```text
Entity
   ↓
Enemigo
   ├── Serpiente
   └── Baobab
```

Posible estructura para personajes:

```text
Entity
   ↓
Personaje
   ├── Principito
   └── Isabela
```

`Personaje` es opcional.

La composición puede ser más apropiada.

No forzar herencia para cumplir artificialmente un requisito académico.

---

# 26. GAME LOOP

Utilizar:

```javascript
requestAnimationFrame()
```

Flujo general:

```text
INPUT
↓
UPDATE
↓
COLISIONES
↓
RENDER
```

No utilizar `setInterval` como bucle principal.

Durante:

* `PAUSA`;
* `GAME_OVER`;
* `FINAL`;

no debe continuar la actualización normal del mundo.

---

# 27. ESTADOS DEL JUEGO

Utilizar:

```text
MENU
JUGANDO
PAUSA
GAME_OVER
NIVEL_COMPLETADO
FINAL
```

No implementar un State Pattern complejo si no es necesario.

---

# 28. MENÚ PRINCIPAL

Debe incluir como mínimo:

```text
THE LITTLE PRINCE

Una aventura entre planetas

JUGAR

PERSONAJE

EL PRINCIPITO
ISABELA 🔒 / DESBLOQUEADA

CONTROLES

CRÉDITOS
```

---

# 29. PAUSA

Debe incluir:

```text
PAUSA

CONTINUAR
REINICIAR NIVEL
MENÚ
```

Debe poder activarse mediante `ESC` y botón táctil.

Mientras el juego esté pausado, el mundo no debe actualizarse.

---

# 30. GAME OVER

Mostrar:

```text
GAME OVER

El viaje no termina aquí.

REINTENTAR
MENÚ PRINCIPAL
```

Reintentar reinicia el nivel actual.

---

# 31. FINAL

El final debe ser sencillo.

Puede mostrar:

* Principito;
* Isabela;
* Zorro;
* mensaje de finalización;
* opción para volver a jugar;
* opción para volver al menú.

No implementar una cinemática compleja salvo solicitud posterior.

---

# 32. FÍSICAS

Utilizar física sencilla.

Gravedad conceptual:

```javascript
velocityY += gravity;
y += velocityY;
```

Al aterrizar:

```javascript
velocityY = 0;
```

No utilizar motor de física externo.

---

# 33. COLISIONES

Utilizar AABB:

```text
x
y
width
height
```

Gestionar:

* personaje/plataforma;
* personaje/enemigo;
* personaje/estrella;
* ataque/enemigo;
* personaje/Isabela;
* personaje/obstáculo.

Centralizar las comprobaciones cuando facilite el mantenimiento.

---

# 34. MOVIMIENTO

El sistema general debe permitir:

* izquierda;
* derecha;
* salto;
* gravedad;
* caída;
* colisiones con plataformas.

Las diferencias de velocidad o salto pueden ser propiedades del personaje.

---

# 35. DOBLE SALTO

Nivel 1:

```text
Antes:
1 salto por caída

Después:
2 saltos por caída
```

No permitir saltos infinitos.

Reiniciar el nivel devuelve el poder a su estado inicial.

---

# 36. ESPADA

La espada aparece en el Nivel 3.

Antes de obtenerla:

```text
ataque deshabilitado
```

Después:

```text
ataque habilitado
```

El ataque utiliza una hitbox temporal delante del personaje.

No implementar combos, árboles de habilidades ni sistemas de inventario complejos.

---

# 37. VIDAS

Cada capítulo comienza con:

```text
3 vidas
```

Al recibir daño:

* perder una vida;
* activar invulnerabilidad temporal;
* reaparecer;
* reiniciar velocidad vertical.

Al llegar a 0:

```text
GAME_OVER
```

No implementar checkpoints complejos salvo solicitud posterior.

---

# 38. ESTRELLAS

Las estrellas son coleccionables.

Al recoger una:

* desaparece;
* aumenta el contador.

HUD:

```text
⭐ Estrellas: X
```

Al reiniciar el nivel, vuelven a estar disponibles.

No implementar rankings ni puntuaciones globales inicialmente.

---

# 39. ENEMIGOS

Debe existir una estructura base `Enemigo` cuando aporte comportamiento común.

## Baobab

Puede funcionar como:

* obstáculo;
* enemigo estático;
* elemento ambiental interactivo.

## Serpiente

Debe tener movimiento horizontal sencillo.

Puede:

* desplazarse entre límites;
* cambiar de dirección;
* interactuar con el jugador.

No implementar IA compleja.

---

# 40. ZORRO

Zorro acompaña al personaje durante el Nivel 2.

Debe mantener una distancia razonable.

Puede detectar enemigos cercanos mediante comprobación sencilla de distancia.

Puede mostrar una advertencia visual.

No implementar:

* navegación avanzada;
* pathfinding;
* aprendizaje automático;
* IA compleja.

---

# 41. CÁMARA

La cámara sigue horizontalmente al personaje actualmente controlado.

Debe respetar:

```text
0 <= cameraX <= levelWidth - canvasWidth
```

El HUD permanece fijo.

No asumir que el personaje es siempre Principito.

---

# 42. CONTROLES DE TECLADO

```text
A / ←       izquierda

D / →       derecha

Espacio     salto

W / ↑       salto

J           ataque

Esc         pausa
```

El sistema de entrada es compartido por ambos personajes.

---

# 43. CONTROLES MÓVILES

Debe existir una interfaz táctil con:

```text
←
→
SALTO
⚔
PAUSA
```

Preferentemente utilizar:

* `pointerdown`;
* `pointerup`;
* `pointercancel`;
* `pointerleave`.

Debe ser posible mantener presionado izquierda o derecha.

Los controles táctiles no deben romper ni duplicar la lógica del teclado.

---

# 44. RESPONSIVE

El juego debe adaptarse a:

* PC;
* Android;
* iPhone;
* tablet.

Resolución lógica aproximada:

```text
1280 × 720
```

Priorizar orientación horizontal.

Si el dispositivo está en vertical:

```text
GIRA TU DISPOSITIVO
```

No modificar innecesariamente la resolución lógica.

---

# 45. AUDIO

El audio debe utilizarse para reforzar principalmente:

* la identidad de cada capítulo;
* las acciones importantes del jugador;
* los momentos narrativos principales.

El sistema de audio debe ser sencillo, reutilizable y separado de la lógica de los niveles.

No crear un sistema de audio excesivamente complejo.

No utilizar un motor de audio externo si las capacidades nativas del navegador son suficientes.

## 45.1 Música principal

La primera versión utiliza:

```text
assets/
└── audio/
    └── music/
        ├── nivel-1.mp3
        ├── nivel-2.mp3
        ├── nivel-3/
        │   └── nivel-3.mp3
        └── final.mp3
```

La estructura puede variar ligeramente por razones técnicas.

Cada capítulo debe poder tener su propia pista.

La música del menú es opcional y no es necesaria para la primera implementación.

El sistema debe permitir cambiar una pista sin modificar la lógica del nivel.

## 45.2 Capítulo 1 — Jardín de fantasía

### Identidad emocional

Debe transmitir:

* paz;
* contemplación;
* descubrimiento;
* belleza;
* curiosidad.

Sensación buscada:

> "Estoy entrando en un lugar hermoso que todavía no comprendo completamente."

### Música

Debe ser instrumental.

Características deseadas:

* aproximadamente 70–85 BPM;
* melodía sencilla;
* ligeramente melancólica;
* delicada;
* fantástica;
* contemplativa;
* nunca excesivamente alegre o caricaturesca.

Instrumentación de referencia:

* piano suave;
* cuerdas ambientales;
* flauta de bambú o instrumento similar;
* koto o instrumento de cuerdas similar;
* campanas delicadas;
* percusión orgánica muy ligera.

La inspiración asiática debe sentirse principalmente como textura musical y atmósfera.

No intentar reproducir estrictamente una tradición musical histórica.

## 45.3 Capítulo 2 — Planeta del Zorro

### Identidad emocional

Debe transmitir:

* soledad;
* amistad;
* curiosidad;
* aventura;
* compañía.

Sensación buscada:

> "Estoy viajando y alguien me acompaña."

### Música

Debe ser más dinámica que la del Capítulo 1, pero no convertirse en música de acción.

Características deseadas:

* aproximadamente 80–100 BPM;
* cálida;
* aventurera;
* contemplativa;
* ligeramente nostálgica.

Instrumentación de referencia:

* guitarra acústica suave;
* piano;
* cuerdas cálidas;
* flauta;
* percusión ligera;
* campanas sutiles.

No es necesario implementar un motivo musical independiente para el Zorro en la primera versión.

## 45.4 Capítulo 3 — Planeta Final

### Identidad sonora

Debe transmitir:

* peligro;
* misterio;
* soledad;
* determinación;
* tensión;
* proximidad al final.

La música concreta será seleccionada manualmente por el desarrollador.

**Codex no debe buscar, descargar ni generar automáticamente esta pista.**

Codex debe implementar únicamente el sistema necesario para reproducirla.

### Archivo

Debe existir una ubicación clara:

```text
assets/audio/music/nivel-3/
```

La pista debe poder sustituirse sin modificar la lógica del juego.

### Rescate de Isabela

Puede realizarse:

```text
Música del nivel
↓
reducción o pausa
↓
interacción de rescate
↓
música del final
```

No implementar una secuencia de audio compleja.

## 45.5 Música del final

Debe transmitir:

* resolución;
* tranquilidad;
* nostalgia;
* emoción;
* cierre del viaje.

Puede reutilizar sutilmente elementos musicales de los capítulos anteriores.

## 45.6 Efectos de sonido esenciales

La primera versión debe utilizar únicamente:

```text
jump.wav
star.wav
damage.wav
attack.wav
interaction.wav
victory.wav
```

### Salto

Se reproduce al realizar un salto válido.

### Estrella

Se reproduce al recoger una estrella.

### Daño

Se reproduce cuando el jugador recibe daño.

### Ataque

Se reproduce al utilizar la espada.

### Interacción

Se utiliza para acciones narrativas importantes, principalmente el rescate de Isabela.

### Victoria

Se utiliza al completar un nivel o alcanzar un momento de victoria importante.

Los efectos deben ser claros, breves y reutilizables.

## 45.7 Sonidos NO esenciales

No implementar inicialmente sonidos específicos para:

* agua;
* viento;
* hojas;
* pájaros;
* insectos;
* pasos;
* serpientes;
* baobabs;
* Zorro;
* espada especial;
* campanas ambientales;
* objetos decorativos;
* efectos ambientales dinámicos.

Estos elementos son mejoras posteriores.

No forman parte de los requisitos básicos de audio.

## 45.8 Rosa

La Rosa no necesita un sistema de sonido propio en la primera implementación.

Su importancia debe comunicarse mediante:

* diseño visual;
* animación;
* interacción;
* música existente del nivel.

No crear una pista o sistema independiente únicamente para la Rosa.

## 45.9 Ambiente

El ambiente sonoro es opcional.

No implementar inicialmente capas independientes de:

* agua;
* viento;
* naturaleza;
* pájaros;
* insectos;
* vegetación.

Podrán añadirse posteriormente si aportan una mejora clara.

La música principal debe ser suficiente para dar identidad sonora a cada capítulo.

## 45.10 Obtención de audio

Los archivos pueden proceder de:

* creación propia;
* generación mediante herramientas autorizadas;
* bibliotecas de audio con licencia compatible;
* recursos proporcionados directamente por el desarrollador.

No utilizar música o sonidos con copyright sin autorización.

Cuando corresponda, conservar la información de licencia.

## 45.11 Responsabilidad de Codex

Codex debe implementar el sistema técnico de reproducción y organización del audio.

No debe buscar ni generar automáticamente una gran cantidad de sonidos.

No añadir efectos simplemente porque sea posible.

Prioridad:

```text
pocos recursos
+
buena elección
+
reutilización
+
identidad
```

Cuando falte un archivo:

* preparar su ruta;
* preparar el sistema;
* indicar qué archivo debe proporcionar el desarrollador.

No bloquear el desarrollo por la ausencia temporal de un recurso de audio secundario.

## 45.12 Navegadores

Tener en cuenta las restricciones de autoplay.

Cuando sea necesario, iniciar la música después de una interacción como:

* pulsar JUGAR;
* tocar la pantalla.

El sistema debe manejar correctamente los casos en que el navegador bloquee inicialmente la reproducción.

## 45.13 Reutilización

Principito e Isabela deben utilizar el mismo sistema de audio.

No crear sistemas de sonido separados por personaje.

Los mismos efectos deben poder utilizarse independientemente del personaje seleccionado.

## 45.14 Principio general

La primera versión debe cumplir:

```text
4 pistas principales
+
6 efectos esenciales
```

El audio ambiental y los efectos especiales son mejoras posteriores.

El objetivo es obtener una identidad sonora clara sin aumentar innecesariamente la complejidad del proyecto.

Priorizar:

* música;
* acciones importantes;
* momentos narrativos principales;
* simplicidad;
* reutilización.

---

# 46. ASSETS

Los elementos visuales pueden implementarse mediante:

* Canvas;
* JavaScript;
* sprites;
* imágenes;
* sprite sheets;
* combinaciones de los anteriores.

No existe obligación de convertir todos los elementos en archivos de imagen.

Priorizar:

* calidad visual;
* simplicidad;
* rendimiento;
* mantenibilidad;
* coherencia artística.

---

# 47. REFERENCIAS VS ASSETS FINALES

Separar conceptualmente:

```text
referencias/
↓
guías visuales proporcionadas por el desarrollador

assets/
↓
recursos realmente utilizados por el juego
```

Una referencia no debe convertirse automáticamente en un asset final.

Las referencias visuales deben mantenerse separadas de los recursos finales del juego.

---

# 48. ANIMACIONES

Las animaciones deben basarse en estados.

Estados posibles:

```text
IDLE
RUN
JUMP
FALL
ATTACK
HURT
VICTORY
INTERACTION
```

No todos los personajes deben implementar todos los estados inmediatamente.

El sistema de animación debe poder reutilizarse.

Las dimensiones y número de frames no deben asumirse como universales.

Las animaciones de Isabela deben mantener coherencia con su referencia visual.

---

# 49. PROGRESS.md

Debe existir:

```text
PROGRESS.md
```

Este archivo es la memoria externa del proyecto.

Debe registrar:

* etapa actual;
* etapas completadas;
* cambios recientes;
* decisiones importantes;
* decisiones arquitectónicas;
* tareas pendientes;
* problemas conocidos;
* próxima etapa.

Después de **cada etapa completada**, `PROGRESS.md` debe actualizarse.

Si se está trabajando en un bloque, debe actualizarse después de cada etapa individual para reflejar el progreso real.

Al terminar el bloque, verificar que el archivo refleje correctamente el estado final.

No marcar una etapa como completada si no fue implementada y comprobada.

Cuando cambie una decisión arquitectónica, registrar:

* qué cambió;
* por qué;
* archivos afectados;
* consecuencias.

`PROGRESS.md` debe mantenerse suficientemente actualizado para permitir retomar el proyecto correctamente desde otra sesión o cuenta.

Cuando una etapa utilice referencias visuales importantes, registrar además:

* qué referencias fueron inspeccionadas;
* qué características se observaron;
* qué características influyeron en la implementación.

---

# 50. PRUEBAS

Después de cada modificación, comprobar según corresponda:

* HTML;
* módulos JavaScript;
* errores JavaScript;
* Canvas;
* teclado;
* controles táctiles;
* movimiento;
* salto;
* gravedad;
* colisiones;
* cámara;
* HUD;
* estados;
* transiciones;
* animaciones;
* responsive;
* audio;
* rendimiento básico.

Las pruebas deben ser prácticas.

No afirmar que una prueba fue realizada si realmente no se pudo ejecutar.

Cuando una etapa dependa de referencias visuales:

* comprobar también visualmente el resultado;
* comparar con las referencias utilizadas.

Para el Capítulo 1, la comparación debe realizarse con las tres referencias de:

```text
referencias/nivel-1/
```

Para Isabela, la comparación debe realizarse con:

```text
referencias/isabela/
```

---

# 51. NO ANTICIPACIÓN

No implementar funcionalidades futuras antes de tiempo.

Si una etapa futura requiere una preparación mínima de arquitectura, realizar únicamente la preparación estrictamente necesaria.

Ejemplo válido:

Preparar una estructura general para soportar Principito e Isabela.

Ejemplo no válido:

Implementar todas las animaciones, habilidades, ataques y efectos de Isabela durante una etapa de movimiento básico.

La arquitectura puede prepararse.

La funcionalidad completa debe implementarse en su etapa correspondiente.

---

# 52. REUTILIZACIÓN

Priorizar la reutilización de:

* movimiento;
* gravedad;
* salto;
* colisiones;
* cámara;
* enemigos;
* plataformas;
* estrellas;
* poderes;
* espada;
* vidas;
* HUD;
* controles;
* niveles;
* animaciones;
* audio.

No copiar y pegar sistemas completos para crear una versión específica para Isabela.

---

# 53. REGLA DE NO DUPLICACIÓN

No crear:

```text
Nivel1Principito.js
Nivel1Isabela.js
```

si ambos pueden utilizar:

```text
Nivel1.js
```

Tampoco crear:

```text
MovementPrincipito.js
MovementIsabela.js
```

si pueden compartir un sistema general.

Las diferencias deben estar en propiedades, métodos, configuración o comportamiento específico cuando corresponda.

---

# 54. REGLA DE COHERENCIA ACADÉMICA

El código debe ser comprensible para un estudiante de Ingeniería de Sistemas.

Cuando existan dos soluciones válidas:

* preferir la más fácil de explicar;
* preferir la menos compleja;
* preferir la que tenga responsabilidades claras.

No implementar tecnología avanzada únicamente para aparentar complejidad.

El proyecto debe poder defenderse explicando por qué existe cada componente.

---

# 55. REGLA DE DISEÑO VISUAL Y REFERENCIAS

Cuando se proporcione una imagen de referencia:

1. localizar la referencia real;
2. abrirla o inspeccionarla visualmente;
3. identificar sus características importantes;
4. utilizarla como inspiración;
5. recrear el lenguaje visual dentro del proyecto;
6. comprobar el resultado frente a la referencia.

No copiar automáticamente una imagen completa como fondo si el objetivo es construir un escenario interactivo.

No asumir el contenido de una imagen por su nombre.

No afirmar que una referencia fue utilizada si no fue inspeccionada.

---

# 56. PUBLICACIÓN

La aplicación final debe poder desplegarse como sitio web estático.

Opciones posibles:

* GitHub Pages;
* Netlify;
* Vercel;
* Cloudflare Pages;
* otros servicios equivalentes.

No introducir backend únicamente para publicar el juego.

Experiencia final:

```text
abrir URL
↓
cargar juego
↓
jugar
```

sin instalación obligatoria.

---

# 57. REGLA DE CONTINUIDAD ENTRE SESIONES

El proyecto debe poder continuar correctamente desde otra sesión o cuenta.

Al iniciar una nueva sesión:

1. leer completamente `AGENTS.md`;
2. leer `PROGRESS.md`;
3. inspeccionar el proyecto;
4. comprobar el estado real;
5. identificar la etapa actual;
6. determinar el siguiente bloque o etapa pendiente;
7. continuar únicamente desde ese punto.

No asumir que una funcionalidad existe solamente porque aparece mencionada en una instrucción.

Comprobar siempre el estado real del proyecto.

La persistencia del progreso del videojuego mediante `localStorage` y la continuidad del desarrollo mediante `PROGRESS.md` son conceptos diferentes y no deben confundirse.

---

# 58. PRIORIDAD DE LAS DECISIONES

Cuando exista una duda técnica:

1. respetar `AGENTS.md`;
2. respetar el estado real de `PROGRESS.md`;
3. respetar la etapa o bloque autorizado;
4. elegir la solución técnicamente más sencilla;
5. evitar introducir complejidad innecesaria.

Si una nueva decisión contradice una regla permanente, no ignorarla silenciosamente.

Explicar el conflicto antes de modificar la arquitectura.

---

# 59. REGLA PRINCIPAL

El objetivo no es terminar el proyecto lo más rápido posible.

El objetivo es construir un videojuego:

* funcional;
* sencillo;
* comprensible;
* mantenible;
* visualmente coherente;
* jugable;
* adaptable a PC y dispositivos móviles;
* preparado para dos personajes;
* con tres capítulos reutilizables;
* con Isabela como personaje desbloqueable;
* con una identidad visual propia;
* con una identidad sonora clara;
* y defendible académicamente.

Trabajar siempre dentro de la etapa o bloque autorizado.

Antes de cada sesión, releer `AGENTS.md` y `PROGRESS.md`.

Cuando una etapa utilice referencias visuales, inspeccionarlas directamente antes de implementar.

Implementar.

Probar.

Corregir errores.

Actualizar `PROGRESS.md`.

Explicar el resultado.

**Detenerse al terminar la etapa o bloque autorizado.**
