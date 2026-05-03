import { Router } from "express";
import {
  createAdoption,
  getAdoption,
  getAllAdoptions,
} from "../controllers/adoptions.controller.js";

const router = Router();

router.get("/", getAllAdoptions);
router.get("/:aid", getAdoption);
router.post("/:uid/:pid", createAdoption);

export default router;
