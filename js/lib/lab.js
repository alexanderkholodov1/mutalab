import { areCompatible } from "../data/species.js";

// Error de dominio propio para distinguir un rechazo de compatibilidad
// de cualquier otro fallo inesperado del laboratorio.
export class IncompatibleCrossError extends Error {
  constructor(speciesA, speciesB) {
    super(
      `${speciesA.name} y ${speciesB.name} son incompatibles: el cruce fue rechazado.`
    );
    this.name = "IncompatibleCrossError";
    this.speciesA = speciesA.id;
    this.speciesB = speciesB.id;
  }
}

// Simula el tiempo que tarda el laboratorio en procesar un cruce.
function simulateLabDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mezcla los atributos base de dos razas con algo de variación aleatoria.
// Usa destructuring para leer los atributos y rest/spread para combinarlos.
function deriveAttributes({ baseAttributes: attrsA }, { baseAttributes: attrsB }, { variation = 0.15 } = {}) {
  const keys = Object.keys({ ...attrsA, ...attrsB });

  return keys.reduce((derived, key) => {
    const average = ((attrsA[key] ?? 0) + (attrsB[key] ?? 0)) / 2;
    const swing = average * variation * (Math.random() * 2 - 1);
    derived[key] = Math.max(0, Math.round(average + swing));
    return derived;
  }, {});
}

function generateHybridName(speciesA, speciesB) {
  const half = (name) => name.slice(0, Math.ceil(name.length / 2));
  return `${half(speciesA.name)}${speciesB.name.slice(Math.ceil(speciesB.name.length / 2))}`;
}

// Núcleo asíncrono no bloqueante del laboratorio: valida compatibilidad,
// "procesa" el cruce (delay simulado) y registra el resultado, sea éxito o
// rechazo, en el historial recibido.
export async function crossSpecies(speciesA, speciesB, registry, options = {}) {
  const { delayMs = 400, ...deriveOptions } = options;

  try {
    if (!areCompatible(speciesA, speciesB)) {
      throw new IncompatibleCrossError(speciesA, speciesB);
    }

    await simulateLabDelay(delayMs);

    const creature = {
      name: generateHybridName(speciesA, speciesB),
      parents: [speciesA.name, speciesB.name],
      attributes: deriveAttributes(speciesA, speciesB, deriveOptions),
    };

    registry.addEntry({
      status: "success",
      parents: [speciesA.id, speciesB.id],
      result: creature,
    });

    return creature;
  } catch (error) {
    registry.addEntry({
      status: "rejected",
      parents: [speciesA.id, speciesB.id],
      reason: error.message,
    });

    throw error;
  }
}
