# Mutalab - Catálogo de Criaturas Mutantes

## Intención inicial

Mutalab es un laboratorio genético de fantasía hecho a código. La idea es simple: tomo dos razas de un catálogo y las cruzo para ver qué sale. El programa valida si la combinación tiene sentido, calcula los atributos del híbrido y guarda la criatura resultante en un registro para poder revisarla después.

La narrativa que uso de excusa es la de un genetista que trabaja en un mundo donde conviven criaturas de todo tipo (dragones, conejos, golems, lo que se me ocurra agregar al catálogo). Cada raza tiene sus propios atributos base y algunas restricciones de compatibilidad: no todo combina con todo, y esa validación es justo el tipo de lógica que quiero que quede clara y tipada más adelante en la versión TypeScript.

Un cruce típico se vería así: elijo "Dragón" y "Conejo", el sistema revisa que la combinación sea viable, mezcla los atributos de ambas razas con algo de variación, le pone nombre al resultado ("Drakonejo") y lo agrega al catálogo local de criaturas generadas.

### Restricciones

- No toda combinación de razas es válida; el sistema debe poder rechazar cruces incompatibles y explicar por qué.
- La generación de la criatura y el guardado en el registro deben resolverse de forma asíncrona (promesas o async/await), simulando que el "laboratorio" tarda en procesar el cruce.
- Todo cruce válido o inválido debe quedar registrado en algún tipo de historial, aunque sea en memoria.

### Criterios de aceptación

1. Dado un par de razas existentes en el catálogo, el sistema calcula y muestra una criatura híbrida con atributos derivados de ambas razas base.
2. Dado un par de razas marcado como incompatible, el sistema rechaza el cruce y devuelve un mensaje claro sin romper la ejecución del programa.
3. Toda criatura generada exitosamente queda almacenada en un catálogo/registro consultable, con su nombre, razas de origen y atributos.

## Versión JavaScript

Implementación no bloqueante del laboratorio en JavaScript avanzado, sin dependencias externas.

### Estructura

- `js/data/species.js`: catálogo de razas (atributos base y compatibilidad).
- `js/lib/registry.js`: historial de cruces, implementado con un closure para mantener el estado privado.
- `js/lib/lab.js`: lógica de cruce (`crossSpecies`), validación de compatibilidad y error de dominio `IncompatibleCrossError`.
- `js/index.js`: punto de entrada ejecutable con datos de ejemplo.

### Cómo ejecutar

```bash
node js/index.js
# o
npm start
```

### Conceptos de JavaScript avanzado usados

- **Async/await y promesas**: `crossSpecies` es asíncrona y usa un `setTimeout` envuelto en `Promise` para simular el tiempo de procesamiento del laboratorio.
- **Manejo de errores**: clase de error propia `IncompatibleCrossError` y bloques `try/catch` que registran tanto éxitos como rechazos sin detener la ejecución.
- **Closures**: `createRegistry()` encapsula el arreglo de entradas del historial, expuesto solo a través de métodos (`addEntry`, `getAll`, `getSuccessful`, `getFailed`).
- **Destructuring**: extracción de `baseAttributes`, opciones (`{ delayMs, ...deriveOptions }`) y pares de razas de ejemplo.
- **Spread/rest**: combinación de atributos (`{ ...attrsA, ...attrsB }`), copia inmutable del historial (`[...entries]`) y rest en opciones de cruce.
- **Funciones de orden superior**: `reduce`, `map` y `filter` para derivar atributos y filtrar el registro por estado.
- **Módulos ES**: código dividido en módulos con `import`/`export` (`"type": "module"` en `package.json`).
