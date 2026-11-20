import { Op } from "sequelize";
import { Customer } from "../models/index.js";

export async function createCustomer(data) {
  return Customer.create(data);
}

export async function findCustomerById(id, { includeDeleted = false } = {}) {
  const where = { id };

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  return Customer.findOne({ where });
}

export async function findCustomerByEmail(email, { includeDeleted = true } = {}) {
  const where = { email };

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  return Customer.findOne({ where });
}

export async function listCustomers({ search, cursorId, limit }) {
  const where = {
    deletedAt: null
  };

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  if (cursorId) {
    where.id = {
      [Op.gt]: cursorId
    };
  }

  return Customer.findAll({
    where,
    order: [["id", "ASC"]],
    limit: limit + 1
  });
}

export async function updateCustomer(id, fields) {
  const customer = await Customer.findOne({
    where: {
      id,
      deletedAt: null
    }
  });

  if (!customer) {
    return null;
  }

  await customer.update(fields);
  return customer;
}

export async function softDeleteCustomer(id) {
  const customer = await Customer.findOne({
    where: {
      id,
      deletedAt: null
    }
  });

  if (!customer) {
    return null;
  }

  await customer.update({
    deletedAt: new Date()
  });

  return customer;
}
