import type { NextFunction, Request } from "express";
import { AppError } from "../types.js";

// Cualquier ruta que no coincida con las registradas llega aqui. Sin este
// middleware Express respondia con una pagina HTML por defecto, incoherente
// con el resto de la API que siempre contesta JSON.
export function notFound(req: Request, _res: unknown, next: NextFunction): void {
  next(new AppError(`La ruta ${req.method} ${req.originalUrl} no existe en esta API`, 404));
}
