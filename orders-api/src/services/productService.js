import { Op } from "sequelize";
import { Product } from "../models/index.js";
import { AppError } from "../utils/appError.js";
import { decodeCursor } from "../utils/cursor.js";
import { buildCursorPage, normalizeLimit } from "../utils/pagination.js";
import {
  ensureNonNegativeInteger,
  ensureOptionalString,
  ensurePositiveNumber,
  ensureRequiredString
} from "../utils/validators.js";

export async function createProductService(payload) {
  const product = await Product.create({
    sku: ensureRequiredString(payload.sku, "sku", 100),
    name: ensureRequiredString(payload.name, "name", 150),
    description: ensureOptionalString(payload.description, "description", 2000),
    price: ensurePositiveNumber(payload.price, "price"),
    stock: ensureNonNegativeInteger(payload.stock, "stock"),
    active: payload.active !== undefined ? Boolean(payload.active) : true
  });

  return product.toJSON();
}

export async function updateProductService(id, payload) {
  const product = await Product.findByPk(Number(id));

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const updates = {};

  if (payload.sku !== undefined) updates.sku = ensureRequiredString(payload.sku, "sku", 100);
  if (payload.name !== undefined) updates.name = ensureRequiredString(payload.name, "name", 150);
  if (payload.description !== undefined)
    updates.description = ensureOptionalString(payload.description, "description", 2000);
  if (payload.price !== undefined) updates.price = ensurePositiveNumber(payload.price, "price");
  if (payload.stock !== undefined) updates.stock = ensureNonNegativeInteger(payload.stock, "stock");
  if (payload.active !== undefined) updates.active = Boolean(payload.active);

  await product.update(updates);

  return product.toJSON();
}

export async function getProductByIdService(id) {
  const product = await Product.findByPk(Number(id));

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product.toJSON();
}

export async function listProductsService(query) {
  const limit = normalizeLimit(query.limit);
  const search = query.search?.trim() || null;
  const cursorId = query.cursor ? Number(decodeCursor(query.cursor)) : null;

  const where = {
    active: true
  };

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { sku: { [Op.iLike]: `%${search}%` } }
    ];
  }

  if (cursorId) {
    where.id = { [Op.lt]: cursorId };
  }

  const products = await Product.findAll({
    where,
    order: [["id", "DESC"]],
    limit: limit + 1
  });

  return buildCursorPage(
    products.map((item) => item.toJSON()),
    limit,
    (item) => item.id
  );
}
