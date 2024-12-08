import { Router } from "express";
import { loginController } from "../controller/loginController";
import { loginValidate } from "../middleware/loginValidation";
;

const router = Router()

router.post('/login', loginValidate, loginController)

export default router