import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createProductController,
  updateProductController,
  getProductByIdController,
  listProductsController
} from "../controllers/productsController.js";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post("/", asyncHandler(createProductController));

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Actualizar producto
 *     tags: [Products]
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
 *         description: Producto actualizado
 */
router.patch("/:id", asyncHandler(updateProductController));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener producto por id
 *     tags: [Products]
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
 *         description: Producto encontrado
 */
router.get("/:id", asyncHandler(getProductByIdController));

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listar productos
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
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
 *         description: Lista de productos
 */
router.get("/", asyncHandler(listProductsController));

export default router;