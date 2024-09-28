import * as express from "express";
import UserController from "../controllers/user.controller";
import AuthMiddleware from "../middleware/auth.middleware";


export const UserRouter = express.Router();

UserRouter.get("/", AuthMiddleware.VerifyRoles, UserController.GetAllUsers);
UserRouter.get("/:id", AuthMiddleware.VerifyRoles, UserController.GetUserById);

UserRouter.put("/", UserController.EditUserById);

UserRouter.delete("/:id", AuthMiddleware.VerifyRoles, UserController.DeleteUserById);