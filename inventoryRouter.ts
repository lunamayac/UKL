import { Router } from "express";
import { 
    createItem,
    deleteItem,
    getAllItem,
    updateItem
} 

    from "../controller/inventoryController";
import { verifyToken, verifyRole } from "../middleware/authorization";
import { createValidation } from "../middleware/validation";
import { updateValidation } from "../middleware/validation";
import { validate } from "uuid";
import { validateItem } from "../middleware/validasiUpdate";

const router = Router();

router.post("/", [verifyToken, verifyRole(["ADMIN"])], createItem);
router.put("/:id", [verifyToken, verifyRole(["ADMIN"]),validateItem], updateItem);
router.get("/", getAllItem);
router.delete("/:id", [verifyToken, verifyRole(["ADMIN"])], deleteItem);


export default router;