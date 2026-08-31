# Mutalab - Catálogo de Criaturas Mutantes

## Intención inicial

Mutalab es un laboratorio genético de fantasía hecho a código. La idea es simple: tomo dos razas de un catálogo y las cruzo para ver qué sale. El programa valida si la combinación tiene sentido, calcula los atributos del híbrido y guarda la criatura resultante en un registro para poder revisarla después.

La narrativa que uso de excusa es la de un genetista que trabaja en un mundo donde conviven criaturas de todo tipo (dragones, conejos, golems, lo que se me ocurra agregar al catálogo). Cada raza tiene sus propios atributos base y algunas restricciones de compatibilidad: no todo combina con todo, y esa validación es justo el tipo de lógica que quiero que quede clara y tipada más adelante en la versión TypeScript.

Un cruce típico se vería así: elijo "Dragón" y "Conejo", el sistema revisa que la combinación sea viable, mezcla los atributos de ambas razas con algo de variación, le pone nombre al resultado ("Drakonejo") y lo agrega al catálogo local de criaturas generadas.

### Restricciones

- El catálogo de razas base es fijo y se define en el propio código (no hay input externo tipo API).
- No toda combinación de razas es válida; el sistema debe poder rechazar cruces incompatibles y explicar por qué.
- La generación de la criatura y el guardado en el registro deben resolverse de forma asíncrona (promesas o async/await), simulando que el "laboratorio" tarda en procesar el cruce.
- Todo cruce válido o inválido debe quedar registrado en algún tipo de historial, aunque sea en memoria.

### Criterios de aceptación

1. Dado un par de razas existentes en el catálogo, el sistema calcula y muestra una criatura híbrida con atributos derivados de ambas razas base.
2. Dado un par de razas marcado como incompatible, el sistema rechaza el cruce y devuelve un mensaje claro sin romper la ejecución del programa.
3. Toda criatura generada exitosamente queda almacenada en un catálogo/registro consultable, con su nombre, razas de origen y atributos.
