import * as express from "express";
import WithdrawController from "../controllers/withdraw.controller";
import AuthMiddleware from "../middleware/auth.middleware";

export const WithdrawRouter = express.Router();

WithdrawRouter.get("/", AuthMiddleware.VerifyRoles, WithdrawController.GetAllWithdrawRequest);
WithdrawRouter.get("/:id", AuthMiddleware.VerifyRoles, WithdrawController.GetWithdrawRequestById);

WithdrawRouter.post("/", WithdrawController.CreateWithdrawRequest);

WithdrawRouter.put("/:id", AuthMiddleware.VerifyRoles, WithdrawController.UpdateWithdrawRequestStatus);