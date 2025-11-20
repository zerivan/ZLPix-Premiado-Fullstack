import { Router } from "express";
import { sortearPremio } from "./premioController";

const router = Router();

router.get("/premio", sortearPremio);

export default router;
