import { Router } from "express";
import {
  createPet,
  deletePet,
  getAllPets,
  getPet,
  updatePet,
} from "../controllers/pets.controller.js";

const router = Router();

router.get("/", getAllPets);
router.get("/:pid", getPet);
router.post("/", createPet);
router.put("/:pid", updatePet);
router.delete("/:pid", deletePet);

export default router;
