import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createOrderController,
  getOrderByIdController,
  listOrdersController,
  confirmOrderController,
  cancelOrderController
} from "../controllers/ordersController.js";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crear orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Orden creada
 */
router.post("/", asyncHandler(createOrderController));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Obtener orden por id
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orden encontrada
 */
router.get("/:id", asyncHandler(getOrderByIdController));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Listar órdenes
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CREATED, CONFIRMED, CANCELLED]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de órdenes
 */
router.get("/", asyncHandler(listOrdersController));

/**
 * @swagger
 * /orders/{id}/confirm:
 *   post:
 *     summary: Confirmar orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: header
 *         name: X-Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden confirmada
 */
router.post("/:id/confirm", asyncHandler(confirmOrderController));

/**
 * @swagger
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancelar orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orden cancelada
 */
router.post("/:id/cancel", asyncHandler(cancelOrderController));

export default router;
