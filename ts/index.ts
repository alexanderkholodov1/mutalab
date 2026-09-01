import { SPECIES, findSpecies } from "./data/species.js";
import { createRegistry } from "./lib/registry.js";
import { crossSpecies, IncompatibleCrossError } from "./lib/lab.js";
import type { SpeciesId } from "./types.js";

// Datos de ejemplo: pares de razas a cruzar. Incluye combinaciones válidas
// e inválidas para demostrar ambos caminos del laboratorio. El tipo
// [SpeciesId, SpeciesId] impide poner aquí una raza que no exista.
const EXAMPLE_CROSSES: [SpeciesId, SpeciesId][] = [
  ["dragon", "conejo"],
  ["golem", "dragon"], // incompatible
  ["fenix", "slime"],
  ["conejo", "golem"],
  ["dragon", "fenix"],
];

async function runCross([idA, idB]: [SpeciesId, SpeciesId], registry: ReturnType<typeof createRegistry>): Promise<void> {
  const speciesA = findSpecies(idA);
  const speciesB = findSpecies(idB);

  if (!speciesA || !speciesB) {
    console.error(`Raza desconocida en el catálogo: ${idA} o ${idB}`);
    return;
  }

  try {
    const creature = await crossSpecies(speciesA, speciesB, registry);
    console.log(
      `Cruce exitoso: ${speciesA.name} x ${speciesB.name} -> ${creature.name}`,
      creature.attributes
    );
  } catch (error) {
    if (error instanceof IncompatibleCrossError) {
      console.log(`Cruce rechazado: ${speciesA.name} x ${speciesB.name} -> ${error.message}`);
    } else {
      console.error("Error inesperado en el laboratorio:", error);
    }
  }
}

function printRegistrySummary(registry: ReturnType<typeof createRegistry>): void {
  const successful = registry.getSuccessful();
  const failed = registry.getFailed();

  console.log("\n--- Catálogo de criaturas generadas ---");
  successful.forEach(({ result, timestamp }) => {
    console.log(`[${timestamp}] ${result.name} (padres: ${result.parents.join(" + ")})`);
  });

  console.log(`\nTotal cruces: ${registry.getAll().length}`);
  console.log(`Exitosos: ${successful.length} | Rechazados: ${failed.length}`);
}

async function main(): Promise<void> {
  console.log("Razas disponibles:", SPECIES.map((s) => s.name).join(", "));
  console.log("\n--- Iniciando cruces del laboratorio ---\n");

  const registry = createRegistry();

  // Ejecuta los cruces en secuencia, no bloqueante en cada await, para
  // simular un laboratorio procesando un cruce a la vez.
  for (const pair of EXAMPLE_CROSSES) {
    await runCross(pair, registry);
  }

  printRegistrySummary(registry);
}

main().catch((error) => {
  console.error("Fallo crítico del laboratorio:", error);
  process.exitCode = 1;
});
