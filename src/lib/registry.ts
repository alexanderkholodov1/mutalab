import type { Registry, RegistryEntry, SuccessEntry, RejectedEntry } from "../types.js";

// Registro/historial del laboratorio. Usa un closure para mantener el
// arreglo de entradas privado: nadie fuera de createRegistry puede mutarlo
// directamente, solo a través de los métodos expuestos.
export function createRegistry(): Registry {
  const entries: RegistryEntry[] = [];

  function addEntry(
    entry: Omit<SuccessEntry, "timestamp"> | Omit<RejectedEntry, "timestamp">
  ): number {
    entries.push({ ...entry, timestamp: new Date().toISOString() } as RegistryEntry);
    return entries.length - 1;
  }

  function getAll(): RegistryEntry[] {
    return [...entries];
  }

  function getSuccessful(): SuccessEntry[] {
    return entries.filter((entry): entry is SuccessEntry => entry.status === "success");
  }

  function getFailed(): RejectedEntry[] {
    return entries.filter((entry): entry is RejectedEntry => entry.status === "rejected");
  }

  return { addEntry, getAll, getSuccessful, getFailed };
}
