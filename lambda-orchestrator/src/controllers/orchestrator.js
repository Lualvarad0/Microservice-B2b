import { createAndConfirmOrderFlow } from "../services/orchestrator.js";

export async function createAndConfirmOrderController(req, res, next) {
  try {
    const result = await createAndConfirmOrderFlow(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
