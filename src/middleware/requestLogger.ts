import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId(req: Request, _res: Response, next: NextFunction): void {
  req.id = req.get("x-request-id") ?? randomUUID();
  next();
}

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${req.id}] ${req.method} ${req.originalUrl}`);
  next();
}
