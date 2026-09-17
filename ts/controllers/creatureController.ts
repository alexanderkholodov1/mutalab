import type { NextFunction, Request, Response } from "express";
import { createCreature, deleteCreature, getCreatureById, listCreatures, updateCreature } from "../services/creatureService.js";
import type { CreatureFilters } from "../services/creatureService.js";
import { AppError, type CreateCreatureInput, type UpdateCreatureInput } from "../types.js";

function getIdParam(req: Request): string {
  const value = req.params.id;
  return Array.isArray(value) ? value[0] ?? "" : value;
}

// Lee un query param opcional como texto. Express tipa req.query como
// string | string[] | ParsedQs, asi que solo aceptamos cadenas simples.
function readStringQuery(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function getAllCreatures(req: Request, res: Response, next: NextFunction): void {
  try {
    const filters: CreatureFilters = {};

    const rarity = readStringQuery(req.query.rarity);
    if (rarity) filters.rarity = rarity;

    const species = readStringQuery(req.query.species);
    if (species) filters.species = species;

    const tag = readStringQuery(req.query.tag);
    if (tag) filters.tag = tag;

    const rawMinPower = readStringQuery(req.query.minPower);
    if (rawMinPower !== undefined) {
      const minPower = Number(rawMinPower);

      if (!Number.isFinite(minPower)) {
        throw new AppError("El query param minPower debe ser un numero", 400);
      }

      filters.minPower = minPower;
    }

    const results = listCreatures(filters);
    res.json({ count: results.length, filters, data: results });
  } catch (error) {
    next(error);
  }
}

export function getCreature(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = getIdParam(req);
    const creature = getCreatureById(id);

    if (!creature) {
      throw new AppError(`No se encontró una criatura con id ${id}`, 404);
    }

    res.json(creature);
  } catch (error) {
    next(error);
  }
}

export function postCreature(req: Request, res: Response, next: NextFunction): void {
  try {
    const payload = req.body as CreateCreatureInput;
    const creature = createCreature(payload);
    res.status(201).json(creature);
  } catch (error) {
    next(error);
  }
}

export function putCreature(req: Request, res: Response, next: NextFunction): void {
  try {
    const payload = req.body as UpdateCreatureInput;
    const creature = updateCreature(getIdParam(req), payload);
    res.json(creature);
  } catch (error) {
    next(error);
  }
}

export function patchCreature(req: Request, res: Response, next: NextFunction): void {
  try {
    const payload = req.body as UpdateCreatureInput;
    const creature = updateCreature(getIdParam(req), payload);
    res.json(creature);
  } catch (error) {
    next(error);
  }
}

export function deleteCreatureById(req: Request, res: Response, next: NextFunction): void {
  try {
    const removedCreature = deleteCreature(getIdParam(req));
    res.json({
      message: "Criatura eliminada correctamente",
      id: removedCreature.id,
    });
  } catch (error) {
    next(error);
  }
}
