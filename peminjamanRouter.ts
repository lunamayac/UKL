import { Router } from "express";
import { 
    userCreateRequest,
    userGetAllRequest,
    userDeleteRequest,
    updateReturnDate,
    analyzeUsage,
    analyzeItemEfficiency
} from "../controller/peminjamanController";
import { verifyToken, verifyRole } from "../middleware/authorization";
import { validasiPeminjaman, validasiAnalisis } from "../middleware/peminjamanValidation";
const router = Router();

router.post("/borrow", [verifyToken, verifyRole(["USER"]),validasiPeminjaman ], userCreateRequest);
router.get("/", [verifyToken, verifyRole(["USER", "ADMIN"])], userGetAllRequest);
router.post("/return", [verifyToken, verifyRole(["USER", "ADMIN"])], updateReturnDate);
router.delete("/:id", [verifyToken, verifyRole(["USER", "ADMIN"])], userDeleteRequest);
router.post("/usage-report", [verifyToken, verifyRole(["ADMIN"]), validasiAnalisis],analyzeUsage);
router.post("/borrow-analysis", [verifyToken, verifyRole(["ADMIN"])], analyzeItemEfficiency);

export default router;
