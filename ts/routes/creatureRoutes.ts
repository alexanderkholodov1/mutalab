import { Router } from "express";
import {
  deleteCreatureById,
  getAllCreatures,
  getCreature,
  patchCreature,
  postCreature,
  putCreature,
} from "../controllers/creatureController.js";
import { validateCreature } from "../middleware/validation.js";

const router = Router();

router.get("/", getAllCreatures);
router.get("/:id", getCreature);
router.post("/", validateCreature, postCreature);
router.put("/:id", validateCreature, putCreature);
router.patch("/:id", validateCreature, patchCreature);
router.delete("/:id", deleteCreatureById);

export default router;
