import { Router } from "express";
import authRoutes from "./authRoutes.js";
import healthRoutes from "./healthRoutes.js";
import productRoutes from "./productRoutes.js";
import orderRoutes from "./orderRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

export default router;