import { Router } from "express";
import { getInternalCustomerByIdController } from "../controllers/customerController.js";
import { authenticateServiceToken } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticateServiceToken);

/**
 * @swagger
 * /internal/customers/{id}:
 *   get:
 *     tags:
 *       - Internal
 *     summary: Obtener customer por id para consumo interno
 *     security:
 *       - serviceTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customer interno encontrado
 *       401:
 *         description: Service token inválido o ausente
 *       404:
 *         description: Customer no encontrado
 */
router.get("/customers/:id", asyncHandler(getInternalCustomerByIdController));

export default router;