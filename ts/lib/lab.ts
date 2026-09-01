import { areCompatible } from "../data/species.js";
import type { Attributes, CrossOptions, Creature, DeriveOptions, Registry, Species } from "../types.js";

// Error de dominio propio para distinguir un rechazo de compatibilidad
// de cualquier otro fallo inesperado del laboratorio.
export class IncompatibleCrossError extends Error {
  speciesA: string;
  speciesB: string;

  constructor(speciesA: Species, speciesB: Species) {
    super(`${speciesA.name} y ${speciesB.name} son incompatibles: el cruce fue rechazado.`);
    this.name = "IncompatibleCrossError";
    this.speciesA = speciesA.id;
    this.speciesB = speciesB.id;
  }
}

// Simula el tiempo que tarda el laboratorio en procesar un cruce.
function simulateLabDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mezcla los atributos base de dos razas con algo de variación aleatoria.
// Usa destructuring para leer los atributos y rest/spread para combinarlos.
function deriveAttributes(
  { baseAttributes: attrsA }: Species,
  { baseAttributes: attrsB }: Species,
  { variation = 0.15 }: DeriveOptions = {}
): Attributes {
  const merged = { ...attrsA, ...attrsB };
  const keys = Object.keys(merged) as (keyof Attributes)[];

  return keys.reduce<Attributes>((derived, key) => {
    const average = (attrsA[key] + attrsB[key]) / 2;
    const swing = average * variation * (Math.random() * 2 - 1);
    derived[key] = Math.max(0, Math.round(average + swing));
    return derived;
  }, {} as Attributes);
}

function generateHybridName(speciesA: Species, speciesB: Species): string {
  const half = (name: string) => name.slice(0, Math.ceil(name.length / 2));
  return `${half(speciesA.name)}${speciesB.name.slice(Math.ceil(speciesB.name.length / 2))}`;
}

// Núcleo asíncrono no bloqueante del laboratorio: valida compatibilidad,
// "procesa" el cruce (delay simulado) y registra el resultado, sea éxito o
// rechazo, en el historial recibido.
export async function crossSpecies(
  speciesA: Species,
  speciesB: Species,
  registry: Registry,
  options: CrossOptions = {}
): Promise<Creature> {
  const { delayMs = 400, ...deriveOptions } = options;

  try {
    if (!areCompatible(speciesA, speciesB)) {
      throw new IncompatibleCrossError(speciesA, speciesB);
    }

    await simulateLabDelay(delayMs);

    const creature: Creature = {
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
    const reason = error instanceof Error ? error.message : String(error);

    registry.addEntry({
      status: "rejected",
      parents: [speciesA.id, speciesB.id],
      reason,
    });

    throw error;
  }
}
