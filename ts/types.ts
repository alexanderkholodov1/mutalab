// Formas de datos centrales del laboratorio. Definir esto explícitamente es
// lo que la versión JavaScript dejaba implícito.

// Unión literal: identifica las razas válidas del catálogo. Cualquier string
// que no sea uno de estos valores es rechazado por el compilador, no solo en
// tiempo de ejecución.
export type SpeciesId = "dragon" | "conejo" | "golem" | "fenix" | "slime";

export interface Attributes {
  fuerza: number;
  velocidad: number;
  magia: number;
  resistencia: number;
}

export interface Species {
  id: SpeciesId;
  name: string;
  baseAttributes: Attributes;
  incompatibleWith: SpeciesId[];
}

export interface Creature {
  name: string;
  parents: [string, string];
  attributes: Attributes;
}

// Unión literal para el estado de un cruce.
export type CrossStatus = "success" | "rejected";

export interface SuccessEntry {
  status: "success";
  parents: [SpeciesId, SpeciesId];
  result: Creature;
  timestamp: string;
}

export interface RejectedEntry {
  status: "rejected";
  parents: [SpeciesId, SpeciesId];
  reason: string;
  timestamp: string;
}

// Unión discriminada por "status": TypeScript reduce el tipo dentro de un
// `if (entry.status === "success")` sin necesidad de casteos manuales.
export type RegistryEntry = SuccessEntry | RejectedEntry;

export interface DeriveOptions {
  variation?: number;
}

export interface CrossOptions extends DeriveOptions {
  delayMs?: number;
}

export interface Registry {
  addEntry(entry: Omit<SuccessEntry, "timestamp"> | Omit<RejectedEntry, "timestamp">): number;
  getAll(): RegistryEntry[];
  getSuccessful(): SuccessEntry[];
  getFailed(): RejectedEntry[];
}
