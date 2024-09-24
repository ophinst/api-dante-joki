import * as express from "express";
import UserController from "../controllers/user.controller";
// import AuthMiddleware from "../middleware/auth.middleware";

export const UserRouter = express.Router();

UserRouter.get("/", UserController.GetAllUsers);
UserRouter.get("/:id", UserController.GetUserById);