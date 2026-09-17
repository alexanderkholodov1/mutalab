import express from "express";
import creatureRoutes from "./routes/creatureRoutes.js";
import labRoutes from "./routes/labRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requestId, requestLogger } from "./middleware/requestLogger.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

// El orden importa: primero se etiqueta y registra la peticion (para que
// incluso un JSON malformado quede trazado con su requestId), luego se
// parsea el cuerpo, despues se resuelven las rutas y, al final, los
// middlewares de 404 y de errores.
app.use(requestId);
app.use(requestLogger);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "mutalab-api" });
});

app.use("/api/creatures", creatureRoutes);
app.use("/api/lab", labRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Mutalab API corriendo en http://localhost:${PORT}`);
});
