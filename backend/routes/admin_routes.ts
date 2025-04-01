import { Router } from "express";
import { getAllUsers, updateUserRole } from "../controllers/admin_controller";
import { authMiddleware } from "../controllers/auth_controller";
import { verifyRole } from "../Middlewares/verifyRole";

const router = Router();

router.get("/admin/users", authMiddleware, verifyRole(["admin"]), getAllUsers);

router.put("/admin/users/:userId", authMiddleware, verifyRole(["admin"]), updateUserRole);

export default router;