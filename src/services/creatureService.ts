import { AppError, type Creature, type CreateCreatureInput, type UpdateCreatureInput } from "../types.js";

const initialCreatures: Creature[] = [
  {
    id: "c-001",
    name: "Drakonia",
    species: "Dragón",
    habitat: "Cavernas luminosas",
    rarity: "legendario",
    powerLevel: 98,
    description: "Criatura con escamas cristalinas y vuelo de fuego.",
    tags: ["fuego", "volador", "anciano"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c-002",
    name: "Mirelina",
    species: "Fénix",
    habitat: "Bosque de ceniza",
    rarity: "epico",
    powerLevel: 86,
    description: "Ave luminosa que renace de sus cenizas.",
    tags: ["renacimiento", "fuego", "guardian"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c-003",
    name: "Nim",
    species: "Slime",
    habitat: "Lago etéreo",
    rarity: "raro",
    powerLevel: 41,
    description: "Forma adaptable de luz y agua que cambia de aspecto.",
    tags: ["místico", "agua", "adaptable"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let creatures: Creature[] = [...initialCreatures];

// El contador nunca retrocede, ni siquiera cuando se elimina una criatura.
// Derivarlo de creatures.length provocaba ids duplicados: al borrar c-002 y
// crear una nueva, el siguiente id volvia a ser c-003.
let idCounter = initialCreatures.length;

function getNextId(): string {
  idCounter += 1;
  return `c-${String(idCounter).padStart(3, "0")}`;
}

// Filtros opcionales aceptados por GET /api/creatures como query params.
export interface CreatureFilters {
  rarity?: string;
  species?: string;
  tag?: string;
  minPower?: number;
}

export function listCreatures(filters: CreatureFilters = {}): Creature[] {
  const { rarity, species, tag, minPower } = filters;

  return creatures
    .filter((creature) => (rarity ? creature.rarity === rarity : true))
    .filter((creature) =>
      species ? creature.species.toLowerCase().includes(species.toLowerCase()) : true
    )
    .filter((creature) =>
      tag ? creature.tags.some((current) => current.toLowerCase() === tag.toLowerCase()) : true
    )
    .filter((creature) => (minPower === undefined ? true : creature.powerLevel >= minPower))
    .map((creature) => ({ ...creature, tags: [...creature.tags] }));
}

// Usada por el laboratorio: incorpora al catalogo un hibrido ya construido,
// de modo que los cruces queden disponibles para el CRUD normal.
export function addCreature(creature: Creature): Creature {
  creatures = [...creatures, creature];
  return { ...creature, tags: [...creature.tags] };
}

export function getCreatureById(id: string): Creature | undefined {
  return creatures.find((creature) => creature.id === id);
}

export function createCreature(input: CreateCreatureInput): Creature {
  const timestamp = new Date().toISOString();
  const creature: Creature = {
    id: getNextId(),
    name: input.name.trim(),
    species: input.species.trim(),
    habitat: input.habitat.trim(),
    rarity: input.rarity,
    powerLevel: input.powerLevel,
    description: input.description.trim(),
    tags: input.tags.map((tag) => tag.trim()),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  creatures = [...creatures, creature];
  return { ...creature, tags: [...creature.tags] };
}

export function updateCreature(id: string, input: UpdateCreatureInput): Creature {
  const index = creatures.findIndex((creature) => creature.id === id);

  if (index === -1) {
    throw new AppError(`No se encontró una criatura con id ${id}`, 404);
  }

  const current = creatures[index];
  const updated: Creature = {
    ...current,
    ...input,
    name: input.name?.trim() ?? current.name,
    species: input.species?.trim() ?? current.species,
    habitat: input.habitat?.trim() ?? current.habitat,
    description: input.description?.trim() ?? current.description,
    tags: input.tags ? input.tags.map((tag) => tag.trim()) : current.tags,
    updatedAt: new Date().toISOString(),
  };

  creatures = creatures.map((creature) => (creature.id === id ? updated : creature));
  return { ...updated, tags: [...updated.tags] };
}

export function deleteCreature(id: string): Creature {
  const index = creatures.findIndex((creature) => creature.id === id);

  if (index === -1) {
    throw new AppError(`No se encontró una criatura con id ${id}`, 404);
  }

  const removedCreature = creatures[index];
  creatures = creatures.filter((creature) => creature.id !== id);
  return { ...removedCreature, tags: [...removedCreature.tags] };
}
