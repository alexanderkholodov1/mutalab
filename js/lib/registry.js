// Registro/historial del laboratorio. Usa un closure para mantener el
// arreglo de entradas privado: nadie fuera de createRegistry puede mutarlo
// directamente, solo a través de los métodos expuestos.

export function createRegistry() {
  const entries = [];

  function addEntry(entry) {
    entries.push({ ...entry, timestamp: new Date().toISOString() });
    return entries.length - 1;
  }

  function getAll() {
    return [...entries];
  }

  function getSuccessful() {
    return entries.filter((entry) => entry.status === "success");
  }

  function getFailed() {
    return entries.filter((entry) => entry.status === "rejected");
  }

  return { addEntry, getAll, getSuccessful, getFailed };
}
