import type { NextFunction, Request, Response } from "express";
import { IncompatibleCrossError } from "../lib/lab.js";
import { getRegistrySummary, listSpecies, performCross } from "../services/labService.js";
import { AppError } from "../types.js";

export function getSpecies(_req: Request, res: Response): void {
  res.json(listSpecies());
}

// Controlador asincrono: al ser async, cualquier rechazo debe pasarse a
// next() manualmente para que llegue al middleware centralizado de errores.
export async function postCross(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hybrid = await performCross(req.body ?? {});
    res.status(201).json(hybrid);
  } catch (error) {
    // Un cruce incompatible no es un fallo del servidor: es un conflicto con
    // las reglas del dominio, por eso se traduce a 409.
    if (error instanceof IncompatibleCrossError) {
      next(new AppError(error.message, 409));
      return;
    }

    next(error);
  }
}

export function getRegistry(_req: Request, res: Response): void {
  res.json(getRegistrySummary());
}
