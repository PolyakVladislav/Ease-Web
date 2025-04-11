import { Router } from "express";
import { authMiddleware } from "../controllers/auth_controller";
import { getAllDiaryEntries,createDiaryEntry,deleteDiaryEntry } from "../controllers/diary_controller";

const router = Router();

router.post("/diary", authMiddleware, createDiaryEntry);

router.get("/diary", authMiddleware, getAllDiaryEntries);

router.delete("/deleteDiary/:id", authMiddleware, deleteDiaryEntry);


export default router;