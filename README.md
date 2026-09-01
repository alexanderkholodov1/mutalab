# Mutalab - Catálogo de Criaturas Mutantes

## Intención inicial

Mutalab es un laboratorio genético de fantasía hecho a código. La idea es simple: tomo dos razas de un catálogo y las cruzo para ver qué sale. El programa valida si la combinación tiene sentido, calcula los atributos del híbrido y guarda la criatura resultante en un registro para poder revisarla después.

La narrativa que uso de excusa es la de un genetista que trabaja en un mundo donde conviven criaturas de todo tipo (dragones, conejos, golems, lo que se me ocurra agregar al catálogo). Cada raza tiene sus propios atributos base y algunas restricciones de compatibilidad: no todo combina con todo, y esa validación es justo el tipo de lógica que quiero que quede clara y tipada más adelante en la versión TypeScript.

Un cruce típico se vería así: elijo "Dragón" y "Conejo", el sistema revisa que la combinación sea viable, mezcla los atributos de ambas razas con algo de variación, le pone nombre al resultado ("Dranejo") y lo agrega al catálogo local de criaturas generadas.

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

## Versión TypeScript

Migración de la lógica anterior a TypeScript, haciendo explícitas las formas de datos, los estados permitidos y las funciones principales. El comportamiento en tiempo de ejecución es el mismo que la versión JavaScript.

### Estructura

- `ts/types.ts`: todas las formas de datos del dominio (razas, criaturas, entradas de historial, opciones).
- `ts/data/species.ts`: catálogo de razas y validación de compatibilidad, ahora tipados.
- `ts/lib/registry.ts`: historial tipado, con narrowing por `status` mediante type guards (`entry is SuccessEntry`).
- `ts/lib/lab.ts`: `crossSpecies` tipada como `Promise<Creature>`, error de dominio tipado.
- `ts/index.ts`: punto de entrada, con los cruces de ejemplo validados en tiempo de compilación.
- `tsconfig.json`: configuración del compilador (`strict`, módulos `NodeNext` para ESM en Node).

### Cómo compilar y ejecutar

```bash
npm install        # instala typescript y @types/node como devDependencies
npm run build       # compila ts/ -> dist/ usando tsc
npm run start:ts    # compila y ejecuta dist/index.js
```

### Tipos personalizados (mínimo 3 requerido)

- `Attributes`, `Species`, `Creature` (interfaces para las formas de datos base).
- `SuccessEntry` / `RejectedEntry` (interfaces) unidas en `RegistryEntry` (unión discriminada por `status`).
- `Registry`, `DeriveOptions`, `CrossOptions` (interfaces para contratos de funciones/opciones).

### Unión literal (mínimo 1 requerido)

- `SpeciesId = "dragon" | "conejo" | "golem" | "fenix" | "slime"`: representa las razas válidas del catálogo. Cualquier raza mal escrita (`"lobo"`, por ejemplo) es rechazada por el compilador antes de ejecutar el programa.
- `CrossStatus = "success" | "rejected"`: representa el resultado de un cruce y es el discriminante de la unión `RegistryEntry`.

### Funciones tipadas (mínimo 3 requerido)

- `findSpecies(id: SpeciesId): Species | undefined`
- `areCompatible(speciesA: Species, speciesB: Species): boolean`
- `crossSpecies(speciesA: Species, speciesB: Species, registry: Registry, options?: CrossOptions): Promise<Creature>`
- `createRegistry(): Registry`

### Qué detectó TypeScript durante la migración

- **Tipos de Node faltantes**: al usar `process.exitCode` en `ts/index.ts`, `tsc` lanzó `TS2591: Cannot find name 'process'` y sugirió instalar `@types/node`. Se resolvió instalando el paquete y agregando `"types": ["node"]` en `tsconfig.json`.
- **Resolución de módulos ESM**: con `module`/`moduleResolution` en `NodeNext`, TypeScript exige que los `import` relativos usen extensión `.js` (aunque el archivo fuente sea `.ts`), ya que así se resolverán una vez compilados. Sin la extensión, `tsc` no encuentra el módulo.
- **Unión literal como barrera de entrada**: al probar a propósito un cruce con una raza inventada (`["dragon", "lobo"]`), `tsc` lo rechazó con `TS2322: Type '"lobo"' is not assignable to type 'SpeciesId'`, antes de que el programa llegara a ejecutarse. En la versión JavaScript ese mismo error solo se habría notado en tiempo de ejecución (`findSpecies` devolviendo `undefined`).
- **Narrowing de uniones discriminadas**: gracias al campo `status` en `RegistryEntry`, filtrar con type guards (`entry is SuccessEntry`) permite que `getSuccessful()` devuelva `SuccessEntry[]` sin necesidad de castear manualmente `result` o `reason`.

### Aprendizajes

Migrar a TypeScript obligó a nombrar explícitamente conceptos que en la versión JS quedaban implícitos en la forma de los objetos (una entrada exitosa vs. una rechazada, qué razas existen realmente). El mayor beneficio no fue atrapar bugs de lógica, sino mover validaciones que antes solo se veían en tiempo de ejecución (raza inexistente, campo faltante) al momento de compilar.
