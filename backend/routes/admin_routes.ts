import { Router } from "express";
import { getAllUsers, updateUserRole,getSessionsPerDoctor,getSessionsPerMonth } from "../controllers/admin_controller";
import { authMiddleware } from "../controllers/auth_controller";
import { verifyRole } from "../Middlewares/verifyRole";

const router = Router();

router.get("/admin/users", authMiddleware, verifyRole(["admin"]), getAllUsers);

router.put("/admin/users/:userId", authMiddleware, verifyRole(["admin"]), updateUserRole);

router.get("/analytics/sessions-per-doctor", authMiddleware, verifyRole(["admin"]), getSessionsPerDoctor);

router.get("/analytics/sessions-per-month",  authMiddleware, verifyRole(["admin"]),getSessionsPerMonth);

export default router;