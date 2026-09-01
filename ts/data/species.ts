import type { Species, SpeciesId } from "../types.js";

export const SPECIES: Species[] = [
  {
    id: "dragon",
    name: "Dragón",
    baseAttributes: { fuerza: 80, velocidad: 55, magia: 90, resistencia: 70 },
    incompatibleWith: ["golem"],
  },
  {
    id: "conejo",
    name: "Conejo",
    baseAttributes: { fuerza: 15, velocidad: 85, magia: 20, resistencia: 30 },
    incompatibleWith: [],
  },
  {
    id: "golem",
    name: "Golem",
    baseAttributes: { fuerza: 95, velocidad: 10, magia: 25, resistencia: 100 },
    incompatibleWith: ["dragon", "fenix"],
  },
  {
    id: "fenix",
    name: "Fénix",
    baseAttributes: { fuerza: 50, velocidad: 70, magia: 95, resistencia: 40 },
    incompatibleWith: ["golem"],
  },
  {
    id: "slime",
    name: "Slime",
    baseAttributes: { fuerza: 25, velocidad: 30, magia: 40, resistencia: 60 },
    incompatibleWith: [],
  },
];

export function findSpecies(id: SpeciesId): Species | undefined {
  return SPECIES.find((species) => species.id === id);
}

// Compatibilidad simétrica: si A rechaza a B, el cruce se considera inválido
// sin importar el orden en el que se ingresen las razas.
export function areCompatible(speciesA: Species, speciesB: Species): boolean {
  const { id: idA, incompatibleWith: blocksA } = speciesA;
  const { id: idB, incompatibleWith: blocksB } = speciesB;
  return !blocksA.includes(idB) && !blocksB.includes(idA);
}
