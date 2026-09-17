import { Router } from "express";
import { getRegistry, getSpecies, postCross } from "../controllers/labController.js";

const router = Router();

router.get("/species", getSpecies);
router.post("/cross", postCross);
router.get("/registry", getRegistry);

export default router;
