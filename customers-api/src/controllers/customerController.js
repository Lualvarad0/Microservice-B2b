import {
  createCustomerService,
  deleteCustomerService,
  getCustomerByIdService,
  getInternalCustomerByIdService,
  listCustomersService,
  updateCustomerService
} from "../services/customerService.js";
import { sendSuccess } from "../utils/response.js";
import {
  parsePositiveInt,
  validateCreateCustomerInput,
  validateUpdateCustomerInput
} from "../utils/validators.js";

export async function createCustomerController(req, res) {
  validateCreateCustomerInput(req.body);
  const customer = await createCustomerService(req.body);

  return sendSuccess(res, customer, "Customer created successfully", 201);
}

export async function getCustomerByIdController(req, res) {
  const id = parsePositiveInt(req.params.id, "id");
  const customer = await getCustomerByIdService(id);

  return sendSuccess(res, customer, "Customer retrieved successfully");
}

export async function getInternalCustomerByIdController(req, res) {
  const id = parsePositiveInt(req.params.id, "id");
  const customer = await getInternalCustomerByIdService(id);

  return sendSuccess(res, customer, "Internal customer retrieved successfully");
}

export async function listCustomersController(req, res) {
  const limit = req.query.limit ? parsePositiveInt(req.query.limit, "limit") : undefined;

  const result = await listCustomersService({
    search: req.query.search,
    cursor: req.query.cursor,
    limit
  });

  return sendSuccess(res, result, "Customers retrieved successfully");
}

export async function updateCustomerController(req, res) {
  const id = parsePositiveInt(req.params.id, "id");
  validateUpdateCustomerInput(req.body);

  const customer = await updateCustomerService(id, req.body);

  return sendSuccess(res, customer, "Customer updated successfully");
}

export async function deleteCustomerController(req, res) {
  const id = parsePositiveInt(req.params.id, "id");
  const result = await deleteCustomerService(id);

  return sendSuccess(res, result, "Customer deleted successfully");
}
