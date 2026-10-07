# AGENTS.md — THE LITTLE PRINCE

> **Fuente de verdad permanente del proyecto.**
> Este archivo debe leerse completo al inicio de cada sesión, junto con `PROGRESS.md`.

> Las Etapas 0–25 ya están completadas y su documentación original se encuentra archivada en `docs/AGENTS-etapas-0-25.md`.
> Ese archivo es **histórico** y no debe utilizarse como fuente principal durante el desarrollo actual.

> El desarrollo actual corresponde exclusivamente a los bloques **E0–E10 de la Parte B**.

---

# PARTE A — REGLAS PERMANENTES

## A.1 Propósito

Videojuego web 2D de plataformas inspirado en *El Principito*.

Debe ejecutarse en navegadores modernos en:

* PC
* portátil
* Android
* iPhone
* tablet

El resultado final debe ser un **sitio web estático**, sin backend ni base de datos.

El proyecto debe ser:

* funcional;
* sencillo;
* mantenible;
* visualmente coherente;
* jugable en dispositivos móviles;
* fácil de explicar académicamente;
* adecuado para un proyecto universitario de Ingeniería de Sistemas.

### Regla principal

> **MEJORAR LO EXISTENTE SIN DESTRUIR LO QUE YA FUNCIONA.**

No reconstruir el proyecto desde cero simplemente para implementar nuevas características.

Antes de modificar algo, Codex debe comprender cómo funciona actualmente y reutilizarlo siempre que sea razonable.

---

# A.2 Tecnologías

Usar:

* HTML5
* CSS3
* JavaScript ES6+
* Canvas 2D
* ES6 Modules
* `requestAnimationFrame`

No utilizar:

* Java
* Swing
* LibGDX
* Unity
* Unreal
* Godot
* motores externos de videojuegos
* backend
* base de datos
* frameworks innecesarios
* motores de física externos

El desarrollo local puede ejecutarse mediante:

```bash
python -m http.server 8000
```

o mediante Live Server.

El juego no debe necesitar un servidor backend para funcionar.

---

# A.3 Filosofía del código

La prioridad es:

> **La solución más sencilla que cumpla correctamente la mecánica es la solución preferida.**

Priorizar:

* claridad;
* legibilidad;
* responsabilidades claras;
* reutilización;
* facilidad de depuración;
* facilidad para explicar el código.

Usar POO únicamente cuando aporte una responsabilidad real.

No crear clases vacías o abstracciones solamente para “demostrar POO”.

Evitar:

* arquitectura empresarial;
* patrones innecesarios;
* exceso de abstracción;
* sistemas excesivamente genéricos;
* motores de física;
* duplicación de código;
* duplicación de niveles;
* duplicación de sistemas.

Los sistemas compartidos deben mantenerse centralizados.

Por ejemplo:

* movimiento;
* gravedad;
* salto;
* doble salto;
* colisiones;
* cámara;
* controles;
* vidas;
* dificultad;
* proyectiles;
* transición entre zonas.

No crear:

```text
Nivel1Principito.js
Nivel1Isabela.js
Nivel1Facil.js
Nivel1Normal.js
Nivel1Dificil.js
```

ni equivalentes.

---

# A.4 Fuentes de verdad

La prioridad es:

1. `AGENTS.md`
2. `PROGRESS.md`
3. Código real del proyecto
4. Instrucción del bloque autorizado

Si el código contradice la documentación:

1. detectar la contradicción;
2. analizar el comportamiento real;
3. documentarla;
4. corregirla únicamente si corresponde al bloque autorizado.

No asumir que una función existe únicamente porque aparece en esta documentación.

---

# A.5 Arquitectura actual

La estructura debe inspeccionarse antes de modificarla.

Actualmente se espera una organización similar a:

```text
/
├── index.html
├── AGENTS.md
├── PROGRESS.md
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
│   │   └── Zorro.js
│   │
│   ├── objects/
│   │   ├── Plataforma.js
│   │   ├── Estrella.js
│   │   ├── Espada.js
│   │   └── PoderDobleSalto.js
│   │
│   ├── levels/
│   │   ├── Nivel.js
│   │   ├── Nivel1.js
│   │   ├── Nivel2.js
│   │   └── Nivel3.js
│   │
│   ├── systems/
│   │   ├── Camera.js
│   │   ├── CollisionSystem.js
│   │   ├── InputManager.js
│   │   └── AudioManager.js
│   │
│   └── data/
│       ├── finalPoem.js
│       └── credits.js
│
├── assets/
│
└── referencias/
```

Esta estructura es orientativa.

**No crear archivos solamente para coincidir exactamente con ella si el proyecto actual ya posee una organización equivalente y funcional.**

---

# A.6 Bucle del juego

El juego utiliza:

```text
INPUT
 ↓
UPDATE
 ↓
COLISIONES
 ↓
RENDER
```

mediante:

```javascript
requestAnimationFrame()
```

No utilizar `setInterval()` como bucle principal.

El Canvas lógico continúa siendo:

```text
1280 × 720
```

La resolución puede escalarse visualmente según el dispositivo.

La física continúa siendo sencilla:

```javascript
velocityY += gravity;
y += velocityY;
```

Las colisiones utilizan AABB cuando corresponda:

```text
x
y
width
height
```

Durante:

* `PAUSA`
* `GAME_OVER`
* `FINAL`
* `CINEMATICA`

el mundo jugable no debe continuar actualizándose.

---

# A.7 Personajes

Existen dos personajes jugables:

### El Principito

Personaje inicial.

### Isabela

Personaje desbloqueable después de completar la campaña principal.

El juego continúa utilizando los mismos tres niveles para ambos personajes.

No existe un Capítulo 4.

No crear niveles duplicados para Isabela.

El desbloqueo se mantiene mediante:

```text
localStorage
```

utilizando la clave existente:

```text
principito-isabela-desbloqueada
```

Si `localStorage` falla, el juego debe continuar funcionando.

Los sistemas de:

* movimiento;
* cámara;
* colisiones;
* vidas;
* dificultad;
* armas;
* zonas

deben funcionar independientemente del personaje seleccionado.

---

# A.8 Referencias visuales

Las referencias visuales son materiales proporcionados por el desarrollador.

La secuencia obligatoria es:

```text
referencia
↓
inspección visual
↓
análisis
↓
dirección artística
↓
implementación
↓
verificación
```

Referencias actuales:

```text
referencias/nivel-1/
├── Cap1-referencia-1.jfif
├── Cap1-referencia-2.jpg
└── cap1-referencia-3.jpg
```

Isabela:

```text
referencias/isabela/referencia-isabela.jpeg
```

Juan:

```text
referencias/juan/
```

Si la referencia de Juan todavía no existe, Codex debe utilizar únicamente las características indicadas en este documento y dejar constancia de ello.

No modificar ni reemplazar las referencias originales.

Nunca utilizar una referencia directamente como fondo o sprite final sin autorización.

Cada vez que se modifique significativamente el arte del Nivel 1, Isabela o Juan, registrar en `PROGRESS.md` qué referencia se inspeccionó y qué elementos influyeron en la implementación.

---

# A.9 Dirección artística

Todo el juego debe evolucionar hacia un estilo:

> **Pixel art coherente con los personajes existentes.**

Todos los elementos deben pertenecer al mismo universo visual:

* personajes;
* enemigos;
* plataformas;
* estructuras;
* objetos;
* fondos;
* jefe;
* Zorro;
* tubería;
* agua;
* elementos del jetpack;
* interfaz relacionada con el mundo.

Utilizar:

```javascript
ctx.imageSmoothingEnabled = false;
```

cuando se trabajen imágenes pixeladas.

El pixel art no debe mezclarse arbitrariamente con elementos modernos, vectoriales o suavizados que rompan la estética.

---

# A.10 Controles

## PC

```text
A / ←        mover izquierda
D / →        mover derecha

Espacio
W
↑            salto / propulsión / brazada

J             ataque

Enter         entrar por tubería

Esc            pausa
```

La función de `J` cambia según el nivel:

```text
Nivel 1 → tirachinas
Nivel 2 → no existe
Nivel 3 → espada
```

## Móvil

Controles táctiles equivalentes:

```text
←
→
SALTO
ATAQUE
PAUSA
```

En el Nivel 2 no debe aparecer botón de ataque.

En el Nivel 1 debe aparecer `ENTRAR` únicamente cuando el jugador esté sobre la entrada de la tubería.

Los controles táctiles deben utilizar:

* `pointerdown`
* `pointerup`
* `pointercancel`
* `pointerleave`

Los botones izquierda/derecha deben permitir mantener la dirección.

No duplicar la lógica de movimiento para móvil.

---

# A.11 Responsive

La prioridad visual es horizontal.

En orientación vertical mostrar:

```text
GIRA TU DISPOSITIVO
```

El juego debe funcionar tanto en:

* PC;
* portátil;
* tablet;
* Android;
* iPhone.

---

# A.12 Audio

Se mantiene `AudioManager`.

La música y los efectos deben estar separados de la lógica de gameplay.

Música existente:

```text
assets/audio/music/nivel-1.mp3
assets/audio/music/nivel-2.mp3
assets/audio/music/nivel-3/nivel-3.mp3
assets/audio/music/final.mp3
```

Efectos existentes:

```text
assets/audio/sfx/
```

Codex:

* no debe buscar música;
* no debe descargar música;
* no debe generar música;
* no debe sustituir la música proporcionada por el desarrollador.

Si falta un audio, el juego debe continuar funcionando.

Los nuevos sonidos permitidos son:

* disparo de tirachinas;
* jetpack;
* agua;
* golpe al jefe;
* derrota del jefe.

Los archivos serán proporcionados por el desarrollador.

---

# A.13 Trabajo por bloques

Codex trabaja exclusivamente el bloque autorizado.

Ejemplo:

```text
Haz E3
```

significa:

> trabajar únicamente E3.

No implementar E4, E5, E6, etc., por anticipación.

Se permiten únicamente cambios internos mínimos indispensables para que el bloque funcione.

Al terminar un bloque:

1. guardar;
2. ejecutar;
3. probar;
4. corregir errores;
5. revisar regresiones;
6. actualizar `PROGRESS.md`;
7. explicar los cambios;
8. indicar cómo probarlos;
9. indicar problemas pendientes;
10. detenerse.

---

# A.14 Regla de pruebas

No afirmar:

> “funciona”

si no se pudo ejecutar o comprobar.

No afirmar:

> “probado”

si realmente no se realizó la prueba.

Cuando exista un error:

```text
detectar
↓
explicar
↓
corregir
↓
ejecutar nuevamente
↓
comprobar
```

---

# PARTE B — FASE 2: EXPANSIÓN

# 1. PRINCIPIOS DE DISEÑO

Las siguientes decisiones son obligatorias.

## 1.1 Evolucionar, no reconstruir

No eliminar mecánicas existentes que funcionen.

No reemplazar innecesariamente:

* cámara;
* personajes;
* controles;
* estrellas;
* plataformas;
* enemigos;
* Zorro;
* sistemas de colisión;
* audio;
* HUD.

Modificar únicamente lo necesario.

---

# 2. ESTRUCTURA GENERAL DE LOS TRES NIVELES

Los tres niveles deben seguir una lógica común:

```text
PARTE 1
   ↓
TRANSICIÓN
   ↓
PARTE 2
   ↓
META / JEFE
```

Pero **cada parte debe sentirse como una zona diferente del mismo planeta**.

No se deben percibir como dos trozos arbitrarios de un mismo mapa.

---

# 2.1 Las dos partes son zonas reales

Una zona debe poder definir:

* ancho;
* escenografía;
* fondo;
* iluminación;
* plataformas;
* estructuras;
* enemigos;
* estrellas;
* objetos;
* punto inicial;
* punto de salida;
* reglas de movimiento.

La transición debe poder cambiar:

* fondo;
* distribución;
* arquitectura;
* vegetación;
* iluminación;
* tipo de obstáculos;
* ritmo de juego.

---

# 2.2 Regla estética fundamental de la división

> **La Parte 2 no puede parecer simplemente la continuación visual de la Parte 1.**

Debe existir una diferencia perceptible.

Por ejemplo:

```text
PARTE 1
jardín terrestre
templos
vegetación
suelo
plataformas

        ↓ TUBERÍA

PARTE 2
cielo abierto
plataformas suspendidas
estructuras aéreas
vacío
enemigos voladores
obstáculos
```

La transición debe sentirse como un descubrimiento de una nueva zona.

---

# 3. TUBERÍA DEL NIVEL 1

La tubería es una **entrada a otra zona**, no un obstáculo.

Esta distinción es crítica.

## Incorrecto

```text
========================
      PLATAFORMA
          ███
          ███
      TUBERÍA
========================
```

donde el jugador simplemente encuentra una pared/tubería al final del mapa.

## Correcto

La Parte 1 debe estar diseñada para conducir naturalmente hacia una estructura de transición.

Ejemplo:

```text
PARTE 1 — JARDÍN

suelo ───── plataformas ───── templos ─────
                                     
                              ┌──────────┐
                              │ TUBERÍA  │
                              │ ENTRADA  │
                              └────┬─────┘
                                   ↓

                         TRANSICIÓN

                                   ↓

PARTE 2 — ZONA AÉREA

      plataforma       plataforma
             ★
                  enemigo
                        ★

      ───────       ─────────
                 vacío
```

La tubería debe formar parte de la composición del escenario.

No debe ser una restricción visual colocada arbitrariamente para impedir continuar.

---

# 3.1 La tubería como transición de Mario

La referencia conceptual es la lógica de los juegos clásicos donde una tubería permite acceder a una zona diferente.

No se debe copiar visualmente un mapa de Mario.

La idea mecánica es:

```text
Jugador entra
      ↓
animación
      ↓
pantalla/transición
      ↓
nueva zona
      ↓
nuevo movimiento
```

La tubería debe justificar narrativamente el cambio de escenario.

---

# 3.2 Entrada

El jugador debe estar físicamente sobre la entrada.

En teclado:

```text
Enter
```

En móvil:

```text
ENTRAR
```

El botón móvil solo aparece cuando la entrada es válida.

Durante la transición:

* bloquear movimiento;
* ejecutar animación;
* detener temporalmente la interacción;
* cambiar de zona;
* reposicionar jugador;
* reposicionar cámara;
* activar las nuevas reglas;
* reanudar el juego.

---

# 3.3 La tubería no debe ser el final del mundo

La Parte 1 debe terminar visualmente alrededor de la tubería.

No crear:

```text
mapa → vacío → tubería flotando
```

si no existe una razón artística.

Debe existir una pequeña composición alrededor de ella:

* suelo;
* vegetación;
* piedras;
* estructuras;
* plataformas;
* iluminación;
* elementos del jardín.

La tubería debe parecer integrada en el mundo.

---

# 4. NIVEL 1 — JARDÍN DEL PRINCIPITO

El Nivel 1 tendrá dos partes.

```text
NIVEL 1

PARTE 1
Jardín fantástico
↓
Tubería
↓
PARTE 2
Zona aérea / jetpack
↓
Meta
```

---

# 4.1 Nivel 1 — Parte 1

Esta es la sección tradicional de plataformas.

Debe contener:

* suelo;
* plataformas;
* estructuras;
* enemigos;
* estrellas;
* obstáculos;
* vegetación;
* elementos del jardín;
* tirachinas;
* doble salto;
* Zorro.

La escenografía debe inspirarse en las referencias de:

```text
referencias/nivel-1/
```

La dirección artística combina:

* jardín asiático fantástico;
* universo de *El Principito*;
* templos;
* lotos;
* estanques;
* piedras;
* faroles;
* vegetación;
* Buda decorativo;
* atmósfera contemplativa.

---

# 4.2 Tirachinas

La tirachinas aparece por primera vez en el Nivel 1.

No comienza equipada.

Debe existir como objeto recogible.

Al recogerla:

```text
tirachinas = equipada
```

`J` dispara.

Características:

* munición infinita;
* disparo horizontal;
* dirección según orientación del personaje;
* cadencia aproximada inicial de 0,4 segundos;
* proyectiles independientes;
* colisión con enemigos;
* colisión con estructuras cuando corresponda;
* desaparecen al salir del mundo.

Al morir:

```text
tirachinas → posición inicial
```

El jugador debe recogerla nuevamente.

---

# 4.3 Doble salto

El Nivel 1 permite:

```text
salto normal
+
doble salto
```

Debe utilizar el sistema existente de doble salto cuando sea posible.

---

# 4.4 Enemigos de la Parte 1

Los enemigos pueden encontrarse:

* en el suelo;
* sobre plataformas;
* cerca de estructuras;
* en zonas elevadas.

No limitar los enemigos exclusivamente al suelo.

Deben existir diferentes posiciones verticales.

---

# 4.5 Final de Parte 1

La Parte 1 debe conducir progresivamente hacia la tubería.

La tubería debe ser:

* visible;
* reconocible;
* accesible;
* integrada en el escenario;
* visualmente atractiva.

No debe parecer un bloque colocado para cerrar el mapa.

---

# 5. NIVEL 1 — PARTE 2: ZONA AÉREA

Al entrar en la tubería comienza una zona completamente distinta.

La escenografía debe cambiar claramente.

Características:

* cielo abierto;
* plataformas suspendidas;
* estructuras aéreas;
* vacío;
* elementos flotantes;
* obstáculos;
* enemigos móviles;
* estrellas.

La distribución debe sentirse más dinámica que la Parte 1.

---

# 5.1 Jetpack

El jugador obtiene automáticamente el jetpack al entrar.

No es un objeto recogible.

El modo de movimiento cambia:

```text
movementMode = JETPACK
```

Mientras se mantiene:

```text
Espacio / W / ↑
```

el jugador asciende.

Al soltar:

```text
gravedad → caída
```

`A/D` continúa controlando el movimiento horizontal.

La tirachinas continúa disponible.

---

# 5.2 Diferencia respecto al salto normal

El jetpack **NO debe comportarse como un salto doble infinito**.

Debe existir una física propia:

```text
mantener botón
→ propulsión

soltar botón
→ gravedad

volver a mantener
→ nueva propulsión
```

El jugador debe poder controlar su altura mediante pulsaciones.

---

# 5.3 Vacío

La Parte 2 tiene vacío inferior.

Si el jugador cae por debajo de la zona jugable:

```text
MUERTE
```

Esto consume una vida.

---

# 5.4 Enemigos aéreos

Los enemigos de esta zona deben tener movimiento dinámico.

Pueden:

* desplazarse horizontalmente;
* cambiar de dirección;
* moverse verticalmente;
* patrullar;
* esquivar proyectiles.

Especialmente importante:

> **Los enemigos deben poder esquivar de forma visible los disparos de la tirachinas.**

No basta con reducir artificialmente la posibilidad de impacto.

Ejemplo conceptual:

```text
proyectil →
              enemigo
              ↓
          cambia trayectoria
```

La esquiva debe sentirse como comportamiento propio del enemigo.

---

# 5.5 Combustible

### Fácil

Combustible infinito.

### Normal

Combustible infinito.

### Difícil

Combustible limitado.

El HUD muestra:

```text
JETPACK
██████████
```

El combustible:

* disminuye al propulsar;
* se recupera lentamente al dejar de propulsar;
* al llegar a cero deja de producir propulsión.

---

# 6. NIVEL 2 — PLANETA DEL ZORRO

El Nivel 2 también se divide en dos zonas.

```text
PARTE 1
zona terrestre
↓
transición
↓
PARTE 2
zona acuática
↓
meta
```

---

# 6.1 Nivel 2 — Parte 1

Debe contener:

* suelo;
* plataformas;
* estructuras;
* enemigos;
* serpientes;
* estrellas;
* Zorro.

El movimiento es:

> **salto normal únicamente.**

No hay:

* doble salto;
* tirachinas;
* espada.

---

# 6.2 Nivel 2 — Parte 2: agua

La segunda zona debe sentirse realmente acuática.

No basta con:

```text
fondo azul
```

Debe incluir elementos como:

* agua;
* profundidad;
* estructuras sumergidas;
* vegetación acuática;
* obstáculos;
* rutas submarinas;
* decoración;
* enemigos acuáticos.

---

# 6.3 Física acuática

Al entrar al agua:

```text
movementMode = SWIMMING
```

Valores iniciales:

```text
gravedad × 0,35
velocidad horizontal × 0,7
velocidad de caída limitada
```

El botón de salto se convierte en:

```text
brazada
```

Cada pulsación/activación produce un impulso hacia arriba.

---

# 6.4 Salida del agua

Al salir:

```text
movementMode = NORMAL
```

Debe restaurarse:

* gravedad;
* velocidad;
* salto;
* física normal.

No dejar variables acuáticas activas accidentalmente.

---

# 6.5 Muertes en el agua

En esta zona:

> **El jugador únicamente muere por tocar enemigos.**

No existe:

* ahogamiento;
* vacío;
* límite de oxígeno.

Esto es una decisión cerrada.

---

# 7. NIVEL 3 — PLANETA FINAL

El Nivel 3 mantiene una progresión más intensa.

```text
PARTE 1
↓
PARTE 2
↓
ARENA
↓
JEFE
↓
FINAL
```

---

# 7.1 Equipamiento

En el Nivel 3:

* salto normal;
* doble salto;
* espada.

No existe:

* tirachinas;
* jetpack;
* movimiento acuático.

---

# 7.2 Espada

La espada es el arma principal.

Ataque:

```text
J
```

La espada:

* derrota enemigos normales;
* utiliza la hitbox existente;
* conserva el sistema de ataque actual.

Contra el jefe:

> **La espada NO reduce su vida.**

La espada únicamente puede aturdirlo.

---

# 7.3 Doble salto

El Nivel 3 permite doble salto.

Debe utilizar el sistema existente siempre que sea posible.

Si actualmente el juego desbloquea el doble salto mediante una condición de progreso, esa condición debe conservarse únicamente si no perjudica la jugabilidad.

La decisión final de implementación debe registrarse en `PROGRESS.md`.

---

# 8. JEFE FINAL

El jefe es una entidad independiente.

No debe ser simplemente:

```text
Enemigo grande
```

Debe tener:

* comportamiento propio;
* animaciones propias;
* patrones;
* fases;
* barra de salud;
* vulnerabilidad;
* ataques;
* arena propia.

---

# 8.1 Concepto del combate

La inspiración mecánica es el clásico combate de plataformas donde el jugador debe:

```text
esquivar
↓
saltar
↓
esperar oportunidad
↓
aterrizar sobre el punto vulnerable
↓
hacer daño
↓
rebotar
```

No copiar directamente un jefe concreto de otra franquicia.

---

# 8.2 Punto vulnerable

El jefe posee un punto vulnerable.

El jugador debe aterrizar encima de él durante la ventana adecuada.

Un aterrizaje correcto:

```text
boss.health -= 1
```

y provoca un pequeño rebote del jugador.

---

# 8.3 Salud

### Fácil

```text
3 golpes
```

### Normal

```text
5 golpes
```

### Difícil

```text
10 golpes
```

La barra debe representar esos segmentos.

Ejemplo:

```text
JEFE

██████████
```

Debe aparecer únicamente durante el combate.

---

# 8.4 Ataques

El jefe debe tener al menos tres patrones diferentes.

Por ejemplo:

1. movimiento lateral;
2. salto con impacto;
3. ataque de área;
4. persecución corta;
5. ataque especial.

No es necesario implementar todos los ejemplos si otros patrones funcionan mejor.

Lo obligatorio es que el jefe sea claramente diferente de un enemigo normal.

---

# 8.5 Fases

Al disminuir su salud:

```text
100 %
 ↓
66 %
 ↓
33 %
 ↓
0 %
```

debe aumentar la intensidad.

Puede:

* cambiar velocidad;
* añadir un ataque;
* reducir ventanas;
* cambiar patrón.

En Fácil se debe evitar una complejidad innecesaria.

---

# 8.6 Espada contra jefe

La espada puede aturdir:

```text
Fácil   → 4 s
Normal  → 3 s
Difícil → 2 s
```

El aturdimiento:

* detiene temporalmente al jefe;
* no reduce su salud;
* no abre automáticamente la vulnerabilidad.

Después del aturdimiento existe una inmunidad temporal para evitar encadenamientos infinitos.

---

# 8.7 Muerte durante el jefe

No existen checkpoints.

Si el jugador muere:

```text
vida -1
```

y el jefe vuelve a:

```text
salud completa
```

El combate comienza nuevamente.

---

# 8.8 Arena

La arena debe ser una zona específica.

Debe tener:

* suelo;
* plataformas si son necesarias;
* espacio suficiente para esquivar;
* espacio suficiente para saltar;
* límites claros;
* posición del jefe;
* posición inicial del jugador.

Debe sentirse como la culminación del juego.

---

# 9. ZORRO

El Zorro acompaña al jugador durante:

```text
Nivel 1
Nivel 2
Nivel 3
```

No debe desaparecer arbitrariamente.

Debe seguir al personaje y mantenerse dentro de una distancia razonable.

---

# 9.1 Función

El Zorro actualmente:

> avisa sobre enemigos cercanos.

Esta función debe mantenerse.

---

# 9.2 Vida adicional

Al entrar por primera vez a la arena del jefe:

```text
+1 vida
```

Esta bonificación solo puede ocurrir:

```text
una vez por partida
```

No se puede recuperar una vida cada vez que el jugador muere contra el jefe.

Al comenzar una partida nueva después de Game Over:

```text
bonusZorro = disponible
```

---

# 9.3 Zonas especiales

Por ahora el Zorro:

* acompaña en la tubería;
* acompaña en jetpack;
* acompaña en agua;
* acompaña en la arena.

En estas zonas no es necesario añadir nuevas habilidades.

No inventar mecánicas adicionales para el Zorro salvo autorización.

---

# 10. VIDAS GLOBALES

La partida comienza con:

```text
❤️ ❤️ ❤️
```

Las vidas son globales.

No se reinician al cambiar de nivel.

---

# 10.1 Muerte

Si el jugador muere:

```text
vidas -= 1
```

Si todavía quedan vidas:

```text
reiniciar nivel actual
```

pero siempre desde el inicio del nivel.

No existen checkpoints.

---

# 10.2 Reinicio de nivel

Al morir con vidas restantes:

* estrellas del nivel → posición inicial;
* enemigos → posición inicial;
* objetos → posición inicial;
* tirachinas → posición inicial;
* jugador → inicio del nivel;
* herramientas → estado inicial del nivel;
* zona → Parte 1.

---

# 10.3 Game Over

Si:

```text
vidas === 0
```

entonces:

```text
GAME_OVER
```

Al reiniciar:

```text
Nivel = 1
vidas = 3
estrellas = 0
herramientas = estado inicial
bonusZorro = disponible
```

La partida comienza nuevamente desde el principio.

### Regla crítica

> **Perder las tres vidas nunca debe reiniciar únicamente el nivel actual.**

Ejemplo:

```text
Nivel 1 → Nivel 2 → Nivel 3

morir
morir
morir

↓

GAME OVER

↓

Nivel 1
❤️ ❤️ ❤️
```

---

# 11. OBJETOS Y MUERTE

Todos los objetos recogibles deben conservar su posición inicial.

Ejemplo:

```text
posiciónInicial
posiciónActual
recogido
```

Cuando el jugador muere:

```text
posiciónActual = posiciónInicial
recogido = false
```

Esto se aplica especialmente a:

* tirachinas;
* poderes;
* objetos recogibles.

---

# 11.1 Regla de objetos sostenidos

Si el jugador muere mientras sostiene o utiliza un objeto:

> **El objeto nunca puede permanecer en la mano después de la muerte.**

Debe regresar a su ubicación original.

Ejemplo:

```text
recoger tirachinas
↓
usar tirachinas
↓
morir
↓
tirachinas vuelve a su posición inicial
↓
jugador debe recogerla nuevamente
```

---

# 12. DIFICULTADES

Existe un único mapa por nivel.

Las dificultades modifican parámetros.

No duplicar mapas.

Se implementan:

```text
FÁCIL
NORMAL
DIFÍCIL
```

---

# 12.1 Parámetros iniciales

| Parámetro           |    Fácil |   Normal |  Difícil |
| ------------------- | -------: | -------: | -------: |
| Velocidad enemigos  |     ×0,9 |     ×1,0 |    ×1,15 |
| Separación mínima   |  ≥400 px |  ≥320 px |  ≥260 px |
| Jetpack             | infinito | infinito | limitado |
| Golpes jefe         |        3 |        5 |       10 |
| Aturdimiento espada |      4 s |      3 s |      2 s |
| Vulnerabilidad jefe |   amplia |   normal | reducida |

Las vidas siempre son:

```text
3
```

en todas las dificultades.

---

# 12.2 Principio de dificultad

La dificultad debe aumentar el reto, no convertir el juego en una experiencia injusta.

Todos los niveles deben ser completables en:

```text
Fácil
Normal
Difícil
```

No aumentar abruptamente la velocidad de enemigos.

No colocar enemigos de manera que hagan imposible el paso.

---

# 13. ENEMIGOS

Los enemigos pueden existir:

* en suelo;
* en plataformas;
* sobre estructuras;
* en zonas aéreas;
* dentro de zonas acuáticas.

No asumir que todos los enemigos deben estar apoyados sobre el suelo.

Cada enemigo debe tener:

* posición;
* movimiento;
* colisión;
* comportamiento;
* interacción con proyectiles cuando corresponda.

---

# 13.1 Enemigos que esquivan proyectiles

Especialmente en Nivel 1 Parte 2.

Cuando detecten un proyectil próximo, pueden:

* cambiar dirección;
* desplazarse verticalmente;
* realizar una evasión breve.

La reacción debe ser visible.

No hacer una “esquiva invisible” modificando simplemente la colisión.

---

# 14. ESTRELLAS

Las estrellas continúan siendo coleccionables.

Funcionan en:

* Parte 1;
* Parte 2;
* Nivel 1;
* Nivel 2;
* Nivel 3.

Al morir:

```text
estrellas del nivel → reinicio
```

El contador no debe conservar estrellas de una vida anterior.

---

# 15. CÁMARA

La cámara debe soportar:

* mapas largos;
* dos zonas;
* transición;
* jetpack;
* agua;
* arena del jefe.

Debe respetar:

```text
0 ≤ cameraX ≤ worldWidth - canvasWidth
```

Después de la tubería:

1. cambiar zona;
2. reposicionar jugador;
3. recalcular mundo;
4. reposicionar cámara;
5. iniciar nueva sección.

La cámara no debe quedar apuntando al lugar anterior.

---

# 16. ESTADOS

Mantener:

```text
MENU
JUGANDO
PAUSA
GAME_OVER
NIVEL_COMPLETADO
FINAL
```

Puede añadirse:

```text
CINEMATICA
```

si es necesario.

El jefe ocurre dentro de:

```text
JUGANDO
```

No crear un sistema de estados excesivamente complejo.

Los estados:

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

continúan siendo estados de animación del personaje.

No confundirlos con:

```text
NORMAL
JETPACK
SWIMMING
```

Estos últimos representan modos de movimiento.

---

# 17. FINAL — JEFE, JUAN, POEMA Y CRÉDITOS

Después de derrotar al jefe:

```text
JEFE DERROTADO
      ↓
TRANSICIÓN
      ↓
JUAN
      ↓
DIÁLOGO
      ↓
POEMA
      ↓
CRÉDITOS
      ↓
VICTORIA
      ↓
DESBLOQUEO DE ISABELA
```

La jugabilidad se detiene.

---

# 17.1 Juan

Juan no es jugable.

Aparece exclusivamente en la escena final.

Debe tener estética pixel art coherente con el resto del juego.

Características físicas:

* alto;
* delgado;
* pelo negro;
* pelo medio/largo;
* gafas cuadradas negras;
* ropa ancha negra.

No crear un estilo visual diferente para él.

---

# 17.2 Cuadro de diálogo

Juan habla mediante un cuadro de texto.

Debe existir:

```text
JUAN

[texto]
```

El texto puede avanzar por fragmentos.

La interfaz debe ser coherente con el resto del juego.

---

# 17.3 Poema

El poema será parte de los créditos.

No inventar el poema.

Debe existir un archivo editable:

```text
js/data/finalPoem.js
```

Ejemplo:

```javascript
export const finalPoem = [
    "[POEMA PENDIENTE]",
];
```

Cuando el desarrollador entregue el poema, se sustituye el marcador.

---

# 17.4 Créditos

Los créditos deben poder modificarse desde:

```text
js/data/credits.js
```

Codex no debe inventar:

* nombres;
* agradecimientos;
* información académica.

---

# 17.5 Isabela

No existe rescate de Isabela.

La campaña termina con:

```text
jefe
→ Juan
→ poema
→ créditos
→ desbloqueo de Isabela
```

Isabela queda disponible para rejugar los mismos tres niveles.

No crear una campaña diferente para ella.

---

# 18. TRANSICIONES ENTRE ZONAS

Las transiciones son parte del diseño.

No deben ser simplemente:

```javascript
zona = 2;
```

sin ningún tratamiento visual.

Debe existir una transición breve:

* fundido;
* desplazamiento;
* animación;
* entrada por tubería;
* cambio de cámara.

No hacer una animación excesivamente compleja.

---

# 19. TAMAÑO OBJETIVO DE LOS MAPAS

Los tamaños son aproximados y pueden ajustarse durante las pruebas.

| Nivel   |  Parte 1 |          Parte 2 |
| ------- | -------: | ---------------: |
| Nivel 1 | ~5000 px |         ~4000 px |
| Nivel 2 | ~4500 px |         ~4500 px |
| Nivel 3 | ~5000 px | ~3500 px + arena |

La arena del jefe puede utilizar aproximadamente una pantalla lógica:

```text
1280 × 720
```

La prioridad es la calidad del diseño, no cumplir un número artificial.

---

# 20. ARTE DE LOS MAPAS

Los mapas deben ser más detallados que sus versiones actuales.

Añadir, cuando corresponda:

* más plataformas;
* estructuras;
* vegetación;
* objetos;
* fondos;
* elementos interactivos;
* variaciones de altura;
* caminos alternativos;
* decoración;
* elementos propios de cada zona.

No llenar el mapa de elementos únicamente para hacerlo “más grande”.

La expansión debe mejorar la jugabilidad y la sensación de exploración.

---

# 21. ESTRUCTURAS

Los niveles no deben estar construidos exclusivamente mediante plataformas rectangulares.

Se pueden utilizar:

* templos;
* columnas;
* árboles;
* puentes;
* ruinas;
* piedras;
* torres;
* estructuras suspendidas;
* estructuras acuáticas;
* elementos arquitectónicos.

Las estructuras puramente decorativas pueden pertenecer al escenario.

Las estructuras con colisión deben existir como objetos independientes.

---

# 22. ARQUITECTURA DE ZONAS

`Nivel` debe ser capaz de trabajar con zonas.

Conceptualmente:

```javascript
zones = [
    zonaParte1,
    zonaParte2
];
```

Cada zona puede contener:

```text
width
background
platforms
structures
stars
enemies
objects
spawnPoint
exit
```

No es obligatorio utilizar exactamente esta implementación.

La arquitectura real debe reutilizar el sistema existente siempre que sea posible.

---

# 23. NO HACER

Codex no debe:

* reconstruir todo el proyecto;
* crear niveles duplicados por dificultad;
* crear niveles duplicados por personaje;
* convertir la tubería en una pared;
* dejar la tubería como decoración sin función;
* mantener exactamente la misma escenografía después de la tubería;
* hacer que la tubería parezca una restricción artificial;
* convertir el jetpack en un salto normal;
* convertir el agua en un fondo azul;
* permitir tirachinas en Nivel 2;
* permitir espada en Nivel 2;
* permitir tirachinas en Nivel 3;
* crear checkpoints;
* reiniciar únicamente el nivel actual al perder las tres vidas;
* dejar objetos en la mano después de morir;
* hacer que el Zorro desaparezca sin razón;
* convertir al Zorro en una simple decoración;
* hacer del jefe un enemigo gigante común;
* quitar la barra de salud del jefe;
* permitir que la espada mate directamente al jefe;
* inventar el poema;
* inventar los créditos;
* crear una campaña adicional para Isabela;
* buscar o descargar música;
* implementar bloques no autorizados.

---

# 24. PROGRESS.md

`PROGRESS.md` debe contener una sección:

```text
FASE 2
```

con:

```text
E0
E1
E2
E3
E4
E5a
E5b
E6
E7a
E7b
E8
E9
E10
```

Después de cada bloque registrar:

* cambios;
* archivos modificados;
* pruebas realizadas;
* errores encontrados;
* errores solucionados;
* problemas pendientes;
* decisiones tomadas;
* referencias visuales inspeccionadas;
* cambios importantes de arquitectura.

No registrar como probado algo que no fue ejecutado.

---

# 25. HOJA DE RUTA

## E0 — Auditoría

Inspeccionar:

* código;
* niveles;
* GameState;
* vidas;
* cámara;
* personajes;
* objetos;
* enemigos;
* Zorro;
* controles;
* audio;
* referencias.

No realizar cambios grandes.

Resultado:

> informe en `PROGRESS.md`.

---

## E1 — Sistema de zonas y tubería

Implementar:

* estructura de zonas;
* transición;
* cámara;
* tubería;
* entrada mediante `Enter`;
* botón táctil `ENTRAR`;
* reposicionamiento;
* transición visual.

La tubería debe conectar realmente:

```text
Nivel 1 Parte 1
        ↓
Nivel 1 Parte 2
```

No debe comportarse como obstáculo.

Antes de añadir fondos nuevos, separar correctamente el renderizado de escenario de `Game.js` si actualmente está mezclado allí.

---

## E2 — Vidas globales y dificultad

Implementar:

* 3 vidas globales;
* pérdida de vidas;
* reinicio del nivel;
* Game Over;
* regreso al Nivel 1;
* estrellas reiniciadas;
* objetos reiniciados;
* selector de dificultad;
* persistencia de dificultad.

Prueba obligatoria:

```text
3 → 2 → 1 → 0 → Nivel 1
```

---

## E3 — Objetos y enemigos

Implementar:

* tirachinas;
* proyectiles;
* retorno de objetos;
* enemigos sobre plataformas;
* esquiva de proyectiles.

Prueba:

```text
recoger
→ disparar
→ morir
→ objeto vuelve
```

---

## E4 — Zorro

Implementar:

* presencia Nivel 1;
* presencia Nivel 2;
* presencia Nivel 3;
* seguimiento;
* aviso de enemigos;
* reposicionamiento;
* vida adicional al entrar a la arena.

---

## E5a — Nivel 1 Parte 1

Implementar:

* mapa ampliado;
* pixel art;
* jardín;
* estructuras;
* enemigos;
* plataformas;
* estrellas;
* tirachinas;
* doble salto;
* composición final con tubería.

La tubería debe estar integrada estéticamente en el mapa.

---

## E5b — Nivel 1 Parte 2

Implementar:

* nueva escenografía;
* zona aérea;
* jetpack;
* plataformas suspendidas;
* vacío;
* enemigos dinámicos;
* enemigos que esquivan;
* combustible en Difícil;
* estrellas;
* meta.

La zona debe sentirse claramente diferente de la Parte 1.

---

## E6 — Nivel 2

Implementar:

### Parte 1

* terreno;
* plataformas;
* enemigos;
* Zorro;
* salto normal.

### Parte 2

* agua;
* física acuática;
* estructuras;
* enemigos acuáticos;
* decoración;
* rutas submarinas.

No incluir:

* tirachinas;
* espada;
* doble salto.

---

## E7a — Nivel 3

Implementar:

* Parte 1;
* Parte 2;
* pixel art;
* estructuras;
* enemigos;
* espada;
* doble salto;
* dificultad progresiva.

---

## E7b — Jefe

Implementar:

* arena;
* jefe;
* barra de salud;
* vulnerabilidad;
* salto sobre jefe;
* rebote;
* ataques;
* fases;
* aturdimiento;
* dificultad;
* +1 vida del Zorro.

Prueba:

```text
Fácil   → 3 golpes
Normal  → 5 golpes
Difícil → 10 golpes
```

---

## E8 — Final

Implementar:

```text
jefe
↓
victoria
↓
Juan
↓
diálogo
↓
poema
↓
créditos
↓
desbloqueo Isabela
```

Eliminar completamente el flujo antiguo de rescate de Isabela.

No dejar llamadas antiguas que provoquen una pantalla de rescate.

---

## E9 — Pulido

Unificar:

* pixel art;
* animaciones;
* UI;
* transiciones;
* audio;
* efectos;
* controles móviles;
* responsive;
* rendimiento.

No cambiar mecánicas fundamentales sin autorización.

---

## E10 — Pruebas finales y publicación

Comprobar:

* tres dificultades;
* tres niveles;
* dos zonas por nivel;
* vidas globales;
* Game Over;
* objetos;
* tirachinas;
* doble salto;
* jetpack;
* agua;
* espada;
* jefe;
* Zorro;
* Juan;
* poema;
* créditos;
* Isabela;
* pausa;
* móvil;
* audio;
* responsive.

Después preparar publicación estática.

---

# 26. PRUEBAS FINALES OBLIGATORIAS

## Vidas

```text
❤️ ❤️ ❤️
↓
❤️ ❤️
↓
❤️
↓
GAME OVER
↓
Nivel 1
❤️ ❤️ ❤️
```

---

## Nivel 1

Comprobar:

* salto;
* doble salto;
* tirachinas;
* enemigos;
* enemigos en plataformas;
* tubería;
* transición;
* cambio visual;
* jetpack;
* caída;
* proyectiles;
* enemigos que esquivan;
* combustible en Difícil.

---

## Nivel 2

Comprobar:

* salto normal;
* ausencia de tirachinas;
* ausencia de espada;
* entrada al agua;
* física acuática;
* brazada;
* enemigos;
* salida del agua;
* restauración de física normal.

---

## Nivel 3

Comprobar:

* espada;
* doble salto;
* enemigos;
* arena;
* jefe;
* barra;
* ataques;
* vulnerabilidad;
* aturdimiento;
* 3/5/10 golpes;
* muerte y reinicio del combate.

---

## Zorro

Comprobar:

* Nivel 1;
* Nivel 2;
* Nivel 3;
* transición;
* tubería;
* agua;
* arena;
* bonificación de vida única.

---

## Final

Comprobar:

```text
jefe derrotado
↓
Juan
↓
poema
↓
créditos
↓
Isabela desbloqueada
```

---

# 27. CRITERIO FINAL DE ÉXITO

La Fase 2 se considera terminada cuando el juego se perciba como una evolución real del proyecto original y no como una colección de mecánicas aisladas.

Especialmente:

### Nivel 1

Debe sentirse como:

```text
JARDÍN
   ↓
EXPLORACIÓN
   ↓
TIRACHINAS + DOBLE SALTO
   ↓
TUBERÍA
   ↓
CAMBIO DE ESCENOGRAFÍA
   ↓
ZONA AÉREA
   ↓
JETPACK + TIRACHINAS
   ↓
META
```

### Nivel 2

Debe sentirse como:

```text
PLANETA DEL ZORRO
   ↓
EXPLORACIÓN TERRESTRE
   ↓
TRANSICIÓN
   ↓
ZONA ACUÁTICA
   ↓
NUEVA FÍSICA
   ↓
META
```

### Nivel 3

Debe sentirse como:

```text
PLANETA FINAL
   ↓
COMBATE
   ↓
ESPADA + DOBLE SALTO
   ↓
ARENA
   ↓
JEFE
   ↓
VICTORIA
   ↓
JUAN
   ↓
POEMA
   ↓
CRÉDITOS
```

El resultado debe mantener la simplicidad técnica del proyecto, pero ofrecer una experiencia más grande, variada y visualmente coherente.

---

# 28. REGLA FINAL PARA CODEX

Antes de implementar cualquier cosa, Codex debe preguntarse:

> **¿Estoy mejorando el juego existente o estoy reconstruyéndolo innecesariamente?**

Si la respuesta es reconstruirlo:

> detenerse, revisar el código existente y buscar una solución más simple.

Y antes de cada bloque:

```text
leer AGENTS.md
↓
leer PROGRESS.md
↓
inspeccionar código real
↓
implementar SOLO bloque autorizado
↓
probar
↓
actualizar PROGRESS.md
↓
detenerse
```

**FIN DE AGENTS.md**
