import { Router } from "express";
import { gerarPix } from "../controllers/pixcontrollers";
const router = Router();
// Rota para gerar um código Pix
router.post("/gerar", gerarPix);
export default router;
