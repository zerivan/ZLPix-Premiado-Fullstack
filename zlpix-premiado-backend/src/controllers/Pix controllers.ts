import { Request, Response } from "express";
import QRCode from "qrcode";

export async function gerarPix(req: Request, res: Response) {
  try {
    const { nome, valor } = req.body;
    const payload = `00020126360014BR.GOV.BCB.PIX0114+558199999999520400005303986540${valor}5802BR5913${nome}6009SAO PAULO62070503***6304ABCD`;
    
    const qrCode = await QRCode.toDataURL(payload);
    res.json({ sucesso: true, payload, qrCode });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: "Falha ao gerar Pix" });
  }
      }
