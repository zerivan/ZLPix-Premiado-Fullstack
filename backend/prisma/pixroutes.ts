import { Router } from "express";
import { gerarPix } from "../controllers/pixController";

const router = Router();

router.post("/gerar", gerarPix);

export default router;
