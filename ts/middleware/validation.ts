import type { NextFunction, Request, Response } from "express";
import { AppError } from "../types.js";

const VALID_RARITIES = ["comun", "raro", "epico", "legendario"] as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateCreaturePayload(payload: unknown, requireAllFields: boolean): void {
  if (!payload || typeof payload !== "object") {
    throw new AppError("El payload debe ser un objeto JSON válido", 400);
  }

  const data = payload as Record<string, unknown>;
  const requiredFields = ["name", "species", "habitat", "rarity", "powerLevel", "description", "tags"] as const;

  if (requireAllFields) {
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new AppError(`Falta el campo obligatorio: ${field}`, 400);
      }
    }
  }

  if ("name" in data && !isNonEmptyString(data.name)) {
    throw new AppError("El campo name debe ser un texto no vacío", 400);
  }

  if ("species" in data && !isNonEmptyString(data.species)) {
    throw new AppError("El campo species debe ser un texto no vacío", 400);
  }

  if ("habitat" in data && !isNonEmptyString(data.habitat)) {
    throw new AppError("El campo habitat debe ser un texto no vacío", 400);
  }

  if ("rarity" in data && typeof data.rarity === "string" && !VALID_RARITIES.includes(data.rarity as (typeof VALID_RARITIES)[number])) {
    throw new AppError("El campo rarity debe ser: comun, raro, epico o legendario", 400);
  }

  if ("powerLevel" in data) {
    if (typeof data.powerLevel !== "number" || !Number.isFinite(data.powerLevel) || data.powerLevel < 1 || data.powerLevel > 1000) {
      throw new AppError("El campo powerLevel debe ser un número válido entre 1 y 1000", 400);
    }
  }

  if ("description" in data && !isNonEmptyString(data.description)) {
    throw new AppError("El campo description debe ser un texto no vacío", 400);
  }

  if ("tags" in data) {
    if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== "string" || tag.trim().length === 0)) {
      throw new AppError("El campo tags debe ser un arreglo de cadenas no vacías", 400);
    }
  }
}

export function validateCreature(req: Request, _res: Response, next: NextFunction): void {
  try {
    const isPartial = req.method === "PATCH";
    validateCreaturePayload(req.body, !isPartial);
    next();
  } catch (error) {
    next(error);
  }
}
