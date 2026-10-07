# FASE 2 — EXPANSIÓN Y CONTENIDO ADICIONAL
El objetivo es ampliar el juego sin romper la campaña principal de tres capítulos.
La campaña original debe permanecer funcional y estable.
---
# 1. SECCIÓN EXTRAS
Agregar una nueva sección **EXTRAS** al menú principal.
Inicialmente debe aparecer bloqueada:
```text
EXTRAS 🔒
```
La sección se desbloquea automáticamente cuando el jugador completa la campaña principal.
El desbloqueo debe persistir mediante `localStorage`.
Al desbloquearla, el menú debe mostrar:
```text
EXTRAS
PERSONAJES
EL LIBRO
REGALOS
```
La sección debe poder ampliarse posteriormente sin modificar la estructura principal del menú.
---
# 2. PERSONAJES EXTRAS JUGABLES
Dentro de:
```text
referencias/
└── referencia-extras/
```
se encontrarán las referencias visuales de los personajes adicionales.
Inicialmente existirán:
- Eren;
- Mikasa;
- Kanye West.
**Todos los personajes extras deben ser jugables.**
No deben funcionar únicamente como galería, fichas o elementos decorativos.
Una vez desbloqueado un personaje, este debe poder seleccionarse desde el sistema de selección de personajes y utilizarse para jugar.
Los personajes extras deben funcionar como mínimo en:
- Nivel 1;
- Nivel 2;
- Nivel 3;
- Nivel 4 cuando esté desbloqueado.
Deben reutilizar los sistemas existentes de:
- movimiento;
- gravedad;
- salto;
- doble salto cuando corresponda;
- ataque;
- daño;
- vidas;
- colisiones;
- cámara;
- controles de PC;
- controles móviles;
- HUD.
No duplicar innecesariamente toda la lógica para cada personaje.
El sistema debe:
1. localizar los archivos existentes;
2. identificar sus extensiones reales;
3. inspeccionar las referencias directamente;
4. utilizar las referencias como guía visual;
5. crear versiones pixel-art originales;
6. mantener coherencia con el estilo visual del juego.
No asumir nombres de archivos ni extensiones que no existan.
No utilizar las imágenes de referencia directamente como sprites finales.
Cada personaje debe conservar los rasgos visuales necesarios para poder ser reconocido dentro de la estética pixel-art del juego.
---
# 3. DESBLOQUEO DE PERSONAJES EXTRAS
Cada personaje extra tendrá una condición diferente de desbloqueo.
Los desbloqueos son permanentes una vez obtenidos y deben persistir mediante `localStorage`.
Los personajes pueden desbloquearse independientemente.
## EREN — ESTRELLAS
Eren se desbloquea cuando el jugador consigue como mínimo:
**70% de todas las estrellas únicas disponibles en la campaña principal.**
La condición será:
```text
estrellas únicas obtenidas
--------------------------- × 100 >= 70%
estrellas únicas totales
```
Ejemplo:
```text
100 estrellas disponibles
70 estrellas obtenidas
→ EREN DESBLOQUEADO
```
Esto significa que las estrellas pasan a tener una función adicional dentro del juego:
1. coleccionable durante los niveles;
2. progreso global para desbloquear a Eren.
### Estrellas únicas
Una misma estrella no puede aumentar varias veces el progreso global.
Ejemplo:
```text
Nivel 1:
10 estrellas disponibles
Jugador consigue:
8/10
Progreso global:
8 estrellas únicas
Jugador muere o reinicia el nivel.
Las estrellas reaparecen dentro del nivel.
Si vuelve a recoger las mismas 8:
el progreso global continúa siendo 8/10,
NO 16/10.
```
Por lo tanto, cada estrella debe tener algún identificador persistente que permita saber si ya fue obtenida anteriormente.
El progreso debe poder conseguirse entre diferentes partidas y sesiones.
No es necesario conseguir el 70% en una única partida.
---
## MIKASA — CAMPAÑA EN NORMAL
Mikasa se desbloquea cuando el jugador completa los tres niveles de la campaña principal en dificultad:
**NORMAL**
Debe registrarse individualmente:
```text
Nivel 1 — NORMAL ✓
Nivel 2 — NORMAL ✓
Nivel 3 — NORMAL ✓
→ MIKASA DESBLOQUEADA
```
No es necesario completar los tres niveles en una única sesión.
El progreso debe persistir mediante `localStorage`.
---
## KANYE WEST — CAMPAÑA EN DIFÍCIL
Kanye West se desbloquea cuando el jugador completa los tres niveles de la campaña principal en dificultad:
**DIFÍCIL**
Debe registrarse:
```text
Nivel 1 — DIFÍCIL ✓
Nivel 2 — DIFÍCIL ✓
Nivel 3 — DIFÍCIL ✓
→ KANYE WEST DESBLOQUEADO
```
No es necesario completar los tres niveles en una única sesión.
El progreso debe persistir mediante `localStorage`.
Debido a que Kanye West depende de completar la campaña en Difícil, esta dificultad debe ser exigente pero completamente superable.
## EREN TITAN — 100% DE ESTRELLAS
Eren Titan se desbloquea cuando el jugador consigue el:
100% de las estrellas únicas disponibles en la campaña principal.
La condición será:
estrellas únicas obtenidas
--------------------------- × 100 = 100%
estrellas únicas totales
Esto significa que el jugador debe conseguir todas las estrellas únicas de la campaña.
Ejemplo:
100 estrellas disponibles
100 estrellas obtenidas
→ EREN TITAN DESBLOQUEADO
No debe desbloquearse simplemente recogiendo estrellas repetidas.
Debe utilizar el mismo sistema global de estrellas únicas utilizado para desbloquear a Eren.
Relación con Eren
Los dos desbloqueos son independientes:
70% de estrellas
      ↓
EREN
100% de estrellas
      ↓
EREN TITAN
Por lo tanto:
al llegar al 70% → Eren;
al llegar al 100% → Eren Titan.
El jugador no necesita realizar una acción adicional después de conseguir las estrellas.
---
## NOTIFICACIONES DE DESBLOQUEO
Cuando se cumpla una condición debe mostrarse brevemente:
```text
¡EREN DESBLOQUEADO!
```
o:
```text
¡MIKASA DESBLOQUEADA!
```
o:
```text
¡KANYE WEST DESBLOQUEADO!
```
No es necesaria una cinemática compleja.
Después del desbloqueo, el personaje debe aparecer disponible en el selector.
Antes:
```text
PERSONAJES
EL PRINCIPITO
ISABELA
EREN 🔒
MIKASA 🔒
KANYE WEST 🔒
```
Después:
```text
PERSONAJES
EL PRINCIPITO
ISABELA
EREN ✓
MIKASA ✓
KANYE WEST ✓
```
---
# 5. REGALOS
Dentro de EXTRAS agregar:
```text
REGALOS
```
Esta sección permitirá mostrar imágenes completas de regalos personales proporcionados por el desarrollador.
Las imágenes se almacenarán en una carpeta específica del proyecto, por ejemplo:
```text
assets/
└── regalos/
```
La sección debe funcionar como una galería.
Debe permitir:
- mostrar los regalos;
- visualizar la imagen completa;
- navegar entre imágenes;
- abrir una imagen en mayor tamaño;
- regresar a la galería;
- funcionar correctamente en PC y móvil.
La estructura debe permitir agregar nuevos regalos posteriormente sin modificar la lógica principal.
No buscar imágenes externas.
Las imágenes serán proporcionadas por el desarrollador.
---
# 6. NIVEL 4 — MODO ARCADE INFINITO
Agregar un cuarto modo jugable que se desbloquea al completar la campaña principal.
Este modo es conceptualmente diferente de los capítulos 1–3.
No debe tener una meta final tradicional.
El objetivo es:
> CONSEGUIR LA MAYOR PUNTUACIÓN POSIBLE.
Debe estar inspirado conceptualmente en la sensación de:
- arcade clásico;
- endless runners;
- juegos de habilidad;
- Alto's Odyssey;
- Subway Surfers;
- Flappy Bird.
No copiar mecánicas, personajes, escenarios ni recursos de estos juegos.
---
# 7. CARACTERÍSTICAS DEL NIVEL 4
El Nivel 4 debe ser **infinito o prácticamente infinito**.
El jugador continúa avanzando mientras pueda sobrevivir.
La partida termina cuando el jugador pierde.
La puntuación aumenta conforme avanza.
Ejemplo:
```text
PUNTUACIÓN
000125
DISTANCIA
350 m
RÉCORD
001820
```
El objetivo es superar la puntuación anterior.
Debe existir:
- puntuación;
- distancia;
- récord;
- aumento progresivo de dificultad;
- obstáculos;
- enemigos;
- generación continua de secciones;
- progresión visual.
El récord debe guardarse mediante:
```text
localStorage
```
---
# 8. PROGRESIÓN VISUAL DEL NIVEL 4
Una característica importante del Nivel 4 será que **el mundo cambie progresivamente mientras el jugador avanza**.
No debe parecer que simplemente se repite el mismo escenario infinitamente.
A medida que aumenta la distancia:
```text
DISTANCIA
   ↓
cambian colores
   ↓
cambia iluminación
   ↓
cambian fondos
   ↓
cambian elementos decorativos
   ↓
aumenta dificultad
```
Crear diferentes zonas visuales.
Por ejemplo:
```text
Zona 1
→ colores suaves
→ dificultad inicial
Zona 2
→ nueva paleta
→ más obstáculos
Zona 3
→ nueva atmósfera
→ mayor velocidad
Zona 4
→ colores más intensos/oscuros
→ mayor densidad de obstáculos
Zona 5+
→ combinaciones progresivamente más difíciles
```
Las zonas pueden repetirse posteriormente con variaciones para evitar generar contenido infinito manualmente.
La transición entre zonas debe sentirse progresiva.
---
# 9. DIFICULTAD DEL NIVEL 4
La dificultad debe aumentar gradualmente.
Puede modificarse:
- velocidad;
- separación entre obstáculos;
- cantidad de enemigos;
- frecuencia de obstáculos;
- tipos de obstáculos;
- combinaciones de peligros;
- longitud de segmentos seguros.
NO aumentar la dificultad de manera injusta.
Debe existir siempre una posibilidad razonable de reaccionar.
No generar combinaciones proceduralmente imposibles.
La dificultad debe probarse jugando realmente el modo.
---
# 10. AUDIO Y MÚSICA PERSONALIZADA DEL NIVEL 4
El Nivel 4 debe disponer de **música propia e independiente** de los capítulos 1, 2 y 3.
La música será seleccionada y proporcionada manualmente por el desarrollador.
El agente NO debe:
- buscar música por Internet;
- descargar canciones;
- generar música automáticamente;
- sustituir la canción seleccionada por otra;
- modificar innecesariamente el archivo proporcionado.
Debe preparar el sistema para reproducir el archivo proporcionado.
Crear una ubicación específica, por ejemplo:
```text
assets/
└── audio/
    └── music/
        └── nivel-4/
            └── nivel-4.mp3
```
La extensión real debe respetar el archivo proporcionado.
No asumir obligatoriamente `.mp3` si el recurso utiliza otro formato compatible.
La música debe:
- comenzar al iniciar una partida del Nivel 4;
- reproducirse correctamente durante el modo infinito;
- detenerse al abandonar el Nivel 4;
- reiniciarse correctamente al comenzar una nueva partida;
- respetar las restricciones de autoplay de los navegadores;
- funcionar en PC y móvil;
- utilizar el sistema de audio existente siempre que sea posible.
La lógica del Nivel 4 NO debe depender del nombre exacto de una canción concreta.
Debe ser sencillo reemplazar la música posteriormente.
## Posible evolución futura
La primera versión puede utilizar una sola canción.
Sin embargo, el sistema debe quedar preparado de forma sencilla para que posteriormente puedan existir varias pistas asociadas a diferentes zonas o niveles de intensidad.
Por ejemplo:
```text
Zona 1
→ música inicial
Zona 2
→ misma música o transición
Zona 3
→ posible nueva pista
Zona avanzada
→ música de mayor intensidad
```
Esto es únicamente una posibilidad futura.
**No implementar un sistema musical complejo si todavía no existen varias canciones.**
---
# 11. DIFICULTAD GENERAL — MODO DIFÍCIL
Mejorar el modo:
```text
DIFÍCIL
```
de la campaña.
La dificultad difícil debe incluir más enemigos y/o combinaciones de enemigos.
Sin embargo:
**NO debe convertirse en una dificultad imposible.**
Cada capítulo debe seguir siendo completable mediante habilidad.
Debe verificarse especialmente:
- saltos;
- distancia entre plataformas;
- enemigos;
- enemigos ubicados sobre plataformas;
- zonas de combate;
- cantidad de obstáculos;
- disponibilidad de poderes;
- doble salto;
- espada;
- secciones especiales.
La regla es:
> MÁS DIFÍCIL ≠ IMPOSIBLE.
Después de aumentar la dificultad, realizar pruebas completas de los tres capítulos.
Esto es especialmente importante porque completar los tres niveles en Difícil es la condición necesaria para desbloquear a Kanye West.
---
# 12. DESBLOQUEO GENERAL
Al completar los tres capítulos de la campaña:
```text
CAMPAÑA COMPLETADA
       ↓
┌──────┴──────┐
EXTRAS      NIVEL 4
DESBLOQUEADO DESBLOQUEADO
```
Los desbloqueos deben persistir mediante `localStorage`.
El jugador no debe tener que volver a completar la campaña después de cerrar el navegador.
Los desbloqueos individuales de Eren, Mikasa y Kanye West funcionan independientemente según las condiciones especificadas anteriormente.
---
# 13. ARQUITECTURA
No duplicar innecesariamente sistemas existentes.
Reutilizar:
- InputManager;
- cámara cuando corresponda;
- personajes;
- colisiones;
- HUD;
- audio;
- GameState;
- sistemas de renderizado;
- controles móviles;
- responsive;
- localStorage.
El Nivel 4 puede tener sistemas específicos para:
- generación procedural;
- puntuación;
- distancia;
- récord;
- dificultad progresiva;
- segmentos;
- zonas visuales.
No crear una arquitectura excesivamente compleja.
---
# 14. PERSISTENCIA
Guardar mediante `localStorage` como mínimo:
- estrellas únicas obtenidas;
- estrellas totales disponibles;
- porcentaje global de estrellas;
- niveles completados en Normal;
- niveles completados en Difícil;
- Isabela desbloqueada;
- Eren desbloqueado;
- Eren Titan desbloqueado;
- Mikasa desbloqueada;
- Kanye West desbloqueado;
- EXTRAS desbloqueado;
- Nivel 4 desbloqueado;
- récord del Nivel 4.
No utilizar backend.
---
# 15. REFERENCIAS VISUALES
Cuando existan referencias visuales:
1. localizar el archivo real;
2. abrirlo;
3. inspeccionarlo;
4. analizarlo;
5. implementar una interpretación original;
6. verificar visualmente el resultado.
Nunca afirmar que una referencia fue utilizada si no pudo ser inspeccionada.
---
**# 16. REFERENCIAS ESPECÍFICAS DEL NIVEL 4
El Nivel 4 tendrá referencias visuales propias ubicadas en:
referencias/
└── nivel-4/
Estas referencias son obligatorias para definir la dirección visual del modo.
Antes de implementar o modificar el Nivel 4, el agente debe:
1. localizar todos los archivos de referencia existentes;
2. identificar sus extensiones reales;
3. abrir e inspeccionar directamente las imágenes;
4. analizar la escala del personaje respecto al escenario;
5. analizar la proporción entre personaje, terreno y obstáculos;
6. analizar la composición horizontal;
7. analizar paleta, iluminación y atmósfera;
8. analizar profundidad y capas de fondo;
9. analizar la distribución de obstáculos;
10. utilizar este análisis para construir una implementación original;
11. verificar visualmente el resultado final frente a las referencias.
No depender únicamente de una instrucción textual como "hacerlo parecido a Alto's Odyssey".
Las referencias sirven para orientar composición, escala, atmósfera y lenguaje visual, pero no deben utilizarse literalmente.
No usar las referencias como:
- fondos finales;
- sprites finales;
- texturas gigantes;
- copias literales.
Escala del personaje
Los personajes de la campaña principal tienen aproximadamente:
super(x, y, 84, 148, "Principito");
Ese tamaño no debe asumirse automáticamente para el Nivel 4.
El Nivel 4 es un modo visual y jugablemente diferente y puede necesitar una escala de personaje menor para permitir una vista más amplia del recorrido.
No modificar globalmente el tamaño de los personajes de los niveles 1–3 para solucionar el Nivel 4.
La escala del Nivel 4 debe definirse después de:
- inspeccionar las referencias;
- analizar la proporción personaje/escenario;
- implementar una escala específica para el modo;
- probar el gameplay;
- verificar visualmente el resultado.
La prioridad es que el jugador tenga suficiente espacio de visión para leer terreno, obstáculos y cambios de zona, manteniendo al personaje perfectamente visible y controlable.
Si las referencias no pueden abrirse o inspeccionarse, el agente debe indicarlo explícitamente y no afirmar que fueron utilizadas.
17. ORDEN RECOMENDADO DE IMPLEMENTACIÓN**
No implementar toda esta expansión de una sola vez.
Trabajar por bloques.
### BLOQUE A — PROGRESIÓN Y DESBLOQUEOS
- sistema global de estrellas únicas;
- porcentaje global;
- registro de campaña Normal;
- registro de campaña Difícil;
- desbloqueo de Eren;
- desbloqueo de Mikasa;
- desbloqueo de Kanye West;
- desbloqueo de EXTRAS;
- desbloqueo del Nivel 4;
- persistencia.
### BLOQUE B — PERSONAJES EXTRAS
- inspección de referencias;
- Eren;
- Mikasa;
- Kanye West;
- sprites pixel-art;
- animaciones;
- selección;
- compatibilidad con los tres niveles;
- compatibilidad con Nivel 4.
### BLOQUE C — CONTENIDO EXTRAS
- menú EXTRAS;
- navegación PC/móvil.
### BLOQUE D — NIVEL 4 BASE
- estructura del Nivel 4;
- generación de segmentos;
- movimiento;
- obstáculos;
- enemigos;
- puntuación;
- distancia;
- Game Over;
- récord.
### BLOQUE E — NIVEL 4 AVANZADO
- progresión de dificultad;
- zonas visuales;
- cambios de colores;
- cambios de iluminación;
- nuevos obstáculos;
- balance;
- música personalizada del Nivel 4.
### BLOQUE F — MODO DIFÍCIL
- aumentar enemigos;
- nuevas combinaciones;
- enemigos sobre plataformas cuando corresponda;
- balance;
- pruebas completas de los tres capítulos;
- verificar que los tres niveles siguen siendo superables.
### BLOQUE G — PRUEBAS GENERALES
- responsive;
- controles móviles;
- controles PC;
- rendimiento;
- persistencia;
- música;
- personajes;
- desbloqueos;
- Nivel 4;
- documentación.

---
# 18. REGLA FUNDAMENTAL
La expansión nunca debe romper la campaña original.
Antes de considerar cualquier bloque terminado se debe comprobar que:
- Nivel 1 funciona;
- Nivel 2 funciona;
- Nivel 3 funciona;
- Principito funciona;
- Isabela funciona;
- Eren funciona cuando esté desbloqueado;
- Eren Titan funciona cuando esté desbloqueado;
- Mikasa funciona cuando esté desbloqueada;
- Kanye West funciona cuando esté desbloqueado;
- selección de personajes funciona;
- controles de PC funcionan;
- controles móviles funcionan;
- pausa funciona;
- Game Over funciona;
- estrellas funcionan;
- desbloqueos funcionan;
- música funciona;
- persistencia funciona;
- Nivel 4 funciona cuando corresponda.
La expansión debe construirse sobre la versión estable existente, no reemplazarla.