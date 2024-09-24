import * as express from "express";
import AuthController from "../controllers/auth.controller";
import AuthMiddleware from "../middleware/auth.middleware";

export const AuthRouter = express.Router();

AuthRouter.post("/register", AuthController.UserRegister);
AuthRouter.post("/login", AuthController.UserLogin);
AuthRouter.get("/logout", AuthMiddleware.VerifyToken, AuthController.UserLogout);
