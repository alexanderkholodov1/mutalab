import { SPECIES, findSpecies } from "../data/species.js";
import { crossSpecies } from "../lib/lab.js";
import { createRegistry } from "../lib/registry.js";
import { AppError, type Creature, type RegistryEntry, type Species, type SpeciesId } from "../types.js";
import { addCreature } from "./creatureService.js";

// Historial del laboratorio. Vive en un closure (createRegistry), asi que
// solo puede crecer a traves de los metodos expuestos por Registry.
const registry = createRegistry();

export function listSpecies(): Species[] {
  return SPECIES.map((species) => ({ ...species, incompatibleWith: [...species.incompatibleWith] }));
}

// Convierte un id recibido por HTTP (string sin tipar) en una Species valida.
// Es la frontera entre el mundo sin tipos de la peticion y el dominio tipado.
function resolveSpecies(rawId: unknown, field: string): Species {
  if (typeof rawId !== "string" || rawId.trim().length === 0) {
    throw new AppError(`El campo ${field} debe ser el id de una especie`, 400);
  }

  const species = findSpecies(rawId.trim() as SpeciesId);

  if (!species) {
    const available = SPECIES.map((item) => item.id).join(", ");
    throw new AppError(`La especie "${rawId}" no existe. Disponibles: ${available}`, 400);
  }

  return species;
}

export interface CrossRequest {
  speciesA: unknown;
  speciesB: unknown;
  variation?: unknown;
  delayMs?: unknown;
}

// Operacion asincrona: el cruce simula el trabajo del laboratorio con un
// delay no bloqueante, de modo que Node sigue atendiendo otras peticiones
// mientras este cruce se "procesa".
export async function performCross(input: CrossRequest): Promise<Creature> {
  const speciesA = resolveSpecies(input.speciesA, "speciesA");
  const speciesB = resolveSpecies(input.speciesB, "speciesB");

  if (input.variation !== undefined) {
    if (typeof input.variation !== "number" || input.variation < 0 || input.variation > 1) {
      throw new AppError("El campo variation debe ser un numero entre 0 y 1", 400);
    }
  }

  if (input.delayMs !== undefined) {
    if (typeof input.delayMs !== "number" || input.delayMs < 0 || input.delayMs > 5000) {
      throw new AppError("El campo delayMs debe ser un numero entre 0 y 5000", 400);
    }
  }

  const hybrid = await crossSpecies(speciesA, speciesB, registry, {
    ...(input.variation !== undefined ? { variation: input.variation as number } : {}),
    ...(input.delayMs !== undefined ? { delayMs: input.delayMs as number } : {}),
  });

  // El hibrido entra al catalogo principal: a partir de aqui se puede
  // consultar, editar o borrar con los mismos endpoints CRUD.
  return addCreature(hybrid);
}

export function listRegistry(): RegistryEntry[] {
  return registry.getAll();
}

export function getRegistrySummary(): {
  total: number;
  successful: number;
  rejected: number;
  entries: RegistryEntry[];
} {
  const successful = registry.getSuccessful();
  const rejected = registry.getFailed();

  return {
    total: successful.length + rejected.length,
    successful: successful.length,
    rejected: rejected.length,
    entries: registry.getAll(),
  };
}
