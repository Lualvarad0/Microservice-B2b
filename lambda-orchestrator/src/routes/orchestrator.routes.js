import { Router } from "express";
import { createAndConfirmOrderController } from "../controllers/orchestrator.js";

const router = Router();

/**
 * @openapi
 * /orchestrator/create-and-confirm-order:
 *   post:
 *     summary: Create and confirm an order
 *     tags:
 *       - Orchestrator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - items
 *               - idempotency_key
 *             properties:
 *               customer_id:
 *                 type: integer
 *                 example: 1
 *               idempotency_key:
 *                 type: string
 *                 example: idem-001
 *               correlation_id:
 *                 type: string
 *                 example: corr-001
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       example: PROD-100
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       200:
 *         description: Order created and confirmed successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Customer not found
 *       409:
 *         description: Customer inactive or deleted
 *       500:
 *         description: Internal server error
 */
router.post("/create-and-confirm-order", createAndConfirmOrderController);

export default router;
