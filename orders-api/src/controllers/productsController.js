import {
  createProductService,
  updateProductService,
  getProductByIdService,
  listProductsService
} from "../services/productService.js";
import { successResponse } from "../utils/responses.js";

export async function createProductController(req, res) {
  const product = await createProductService(req.body);
  res.status(201).json(successResponse(product, "Product created successfully"));
}

export async function updateProductController(req, res) {
  const product = await updateProductService(req.params.id, req.body);
  res.status(200).json(successResponse(product, "Product updated successfully"));
}

export async function getProductByIdController(req, res) {
  const product = await getProductByIdService(req.params.id);
  res.status(200).json(successResponse(product, "Product retrieved successfully"));
}

export async function listProductsController(req, res) {
  const data = await listProductsService(req.query);
  res.status(200).json(successResponse(data, "Products retrieved successfully"));
}
