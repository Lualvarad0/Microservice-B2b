import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { healthController } from "../controllers/healthController.js";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del servicio
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio operativo
 */
router.get("/", asyncHandler(healthController));

export default router;
