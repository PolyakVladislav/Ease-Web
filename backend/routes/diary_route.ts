import { Router } from "express";
import { authMiddleware } from "../controllers/auth_controller";
import { getAllDiaryEntries,createDiaryEntry } from "../controllers/diary_controller";
const router = Router();

router.post("/diary", authMiddleware, createDiaryEntry);

router.get("/diary", authMiddleware, getAllDiaryEntries);


export default router;