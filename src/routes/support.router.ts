import * as express from "express";
import SupportController from "../controllers/support.controller";
import AuthMiddleware from "../middleware/auth.middleware";

export const SupportRouter = express.Router();

SupportRouter.get("/", AuthMiddleware.VerifyToken, AuthMiddleware.VerifyRoles, SupportController.GetAllSupportRequests);
SupportRouter.get("/:id", AuthMiddleware.VerifyToken, AuthMiddleware.VerifyRoles, SupportController.GetSupportRequestById);

SupportRouter.post("/", SupportController.CreateSupportRequest);

SupportRouter.delete("/:id", AuthMiddleware.VerifyToken, AuthMiddleware.VerifyRoles, SupportController.DeleteSupportRequest);