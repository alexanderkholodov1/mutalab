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
  id: string;
  name: string;
  species: string;
  habitat: string;
  rarity: "comun" | "raro" | "epico" | "legendario";
  powerLevel: number;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  parents?: [string, string];
  attributes?: Attributes;
}

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

export interface CreateCreatureInput {
  name: string;
  species: string;
  habitat: string;
  rarity: "comun" | "raro" | "epico" | "legendario";
  powerLevel: number;
  description: string;
  tags: string[];
}

export type UpdateCreatureInput = Partial<CreateCreatureInput>;

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}
