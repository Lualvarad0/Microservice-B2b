import { Router } from "express";
import { healthController } from "../controllers/healthController.js";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Verificar estado del servicio
 *     responses:
 *       200:
 *         description: Servicio activo
 */
router.get("/", healthController);

export default router;