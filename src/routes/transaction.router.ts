import * as express from "express";
import AuthMiddleware from "../middleware/auth.middleware";
import TransactionController from "../controllers/transaction.controller";
import UploadMiddleware from "../middleware/upload.middleware";

export const TransactionRouter= express.Router();

TransactionRouter.get("/", TransactionController.GetAllJokiTransaction);
TransactionRouter.get("/:id", TransactionController.GetJokiTransactionById);
TransactionRouter.get("/jokiStatus/owned", AuthMiddleware.VerifyToken, TransactionController.GetJokiByOwner);

TransactionRouter.post("/", TransactionController.CreateJokiTransaction);

TransactionRouter.put("/jokistatus/:id", AuthMiddleware.VerifyToken, UploadMiddleware.ProcessFiles, TransactionController.UpdateJokiStatus);
TransactionRouter.put("/paymentStatus/:id", AuthMiddleware.VerifyToken, AuthMiddleware.VerifyRoles, TransactionController.UpdatePaymentStatus);

TransactionRouter.delete("/:id", AuthMiddleware.VerifyToken, AuthMiddleware.VerifyRoles, TransactionController.DeleteJokiTransaction);