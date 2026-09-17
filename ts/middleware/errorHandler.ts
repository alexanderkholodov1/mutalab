import type { NextFunction, Request, Response } from "express";
import { AppError } from "../types.js";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode,
      requestId: req.id,
    });
    return;
  }

  // express.json() lanza un SyntaxError cuando el cuerpo no es JSON valido.
  // Es un error del cliente, no del servidor: debe responder 400 y no 500.
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      error: "El cuerpo de la peticion no es JSON valido",
      details: err.message,
      status: 400,
      requestId: req.id,
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      error: "Error interno del servidor",
      details: err.message,
      status: 500,
      requestId: req.id,
    });
    return;
  }

  res.status(500).json({
    error: "Error interno del servidor",
    status: 500,
    requestId: req.id,
  });
}
