import { Router } from "express";
import {
  createCustomerController,
  deleteCustomerController,
  getCustomerByIdController,
  listCustomersController,
  updateCustomerController
} from "../controllers/customerController.js";
import { authenticateJwt } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticateJwt);

/**
 * @swagger
 * /customers:
 *   post:
 *     tags:
 *       - Customers
 *     summary: Crear un customer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomerRequest'
 *     responses:
 *       201:
 *         description: Customer creado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token inválido o ausente
 *       409:
 *         description: Email duplicado
 */
router.post("/", asyncHandler(createCustomerController));

/**
 * @swagger
 * /customers:
 *   get:
 *     tags:
 *       - Customers
 *     summary: Listar customers con búsqueda y cursor
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
 *           example: 10
 *     responses:
 *       200:
 *         description: Lista de customers
 */
router.get("/", asyncHandler(listCustomersController));

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     tags:
 *       - Customers
 *     summary: Obtener customer por id
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
 *         description: Customer encontrado
 *       401:
 *         description: Token inválido o ausente
 *       404:
 *         description: Customer no encontrado
 */
router.get("/:id", asyncHandler(getCustomerByIdController));

/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     tags:
 *       - Customers
 *     summary: Actualizar customer por id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCustomerRequest'
 *     responses:
 *       200:
 *         description: Customer actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token inválido o ausente
 *       404:
 *         description: Customer no encontrado
 *       409:
 *         description: Email duplicado
 */
router.put("/:id", asyncHandler(updateCustomerController));

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     tags:
 *       - Customers
 *     summary: Eliminar customer por soft delete
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
 *         description: Customer eliminado
 *       401:
 *         description: Token inválido o ausente
 *       404:
 *         description: Customer no encontrado
 */
router.delete("/:id", asyncHandler(deleteCustomerController));

export default router;
