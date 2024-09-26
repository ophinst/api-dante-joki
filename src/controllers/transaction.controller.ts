import Transaction from "../models/transaction.model";
import User from "../models/user.model";
import { Request, Response } from "express";
import { nanoid } from "nanoid";
import uploadFile from "../configs/storage";
import { sequelize } from "../configs/db";

class TransactionController{
	async CreateJokiTransaction(req: Request, res: Response): Promise<Response>{
		try{
            const {
				email, 
				password, 
				loginMethod, 
				reqHero, 
				notes, 
				contactNumber, 
				rank, 
				price, 
				quantity, 
				paymentMethod
			} = req.body;

            if (!email || !password || !loginMethod || !contactNumber || !rank || !price || !quantity || !paymentMethod){
                return res.status(400).json({ message: "Missing required fields" });
            }

            const newJokiTransaction = await Transaction.create({
                email: email,
				password: password,
				loginMethod: loginMethod,
                reqHero: reqHero,
                notes: notes,
                contactNumber: contactNumber,
                rank: rank,
				price: price,
				quantity: quantity,
                paymentMethod: paymentMethod,
                transactionId: "JD" + nanoid(10)
            });
            return res.status(201).json({
                message: "Joki transaction created successfully",
                data: newJokiTransaction
            });
        }catch(error){
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
	}

    // async UpdateJokiStatus(req: Request, res: Response): Promise<Response> {
    //     try {
    //         const transactionId = req.params.id;
    //         const { jokiStatus } = req.body;

    //         if (!transactionId) {
    //             return res.status(400).json({ message: "Invalid parameter" });
    //         }

    //         if (!jokiStatus) {
    //             return res.status(400).json({ message: "Missing status field" });
    //         }

    //         const transaction = await Transaction.findOne({
    //             where: { transactionId: transactionId },
    //         });
            
            
    //         if (!transaction) {
    //             return res.status(404).json({ message: "Transaction not found" });
    //         }
            
    //         let owner = transaction?.owner;
    //         if (!owner) {
    //             owner = req.uid;

    //             const updatedTransaction = await transaction.update({
    //                 owner: owner,
    //                 jokiStatus: jokiStatus,
    //             });
    //             return res.status(200).json({
    //                 message: "Joki transaction status updated successfully",
    //                 data: updatedTransaction
    //             });
    //         }

    //         const updatedTransaction = await transaction.update({
    //             jokiStatus: jokiStatus,
    //         });

    //         return res.status(200).json({
    //             message: "Joki transaction status updated successfully",
    //             data: updatedTransaction
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ message: "Internal server error" });
    //     }
    // }

    // async FinishJokiTransaction(req: Request, res: Response): Promise<Response> {
    //     try {
    //         const transactionId = req.params.id;

    //         if (!transactionId) {
    //             return res.status(400).json({ message: "Invalid parameter" });
    //         }

    //         const transaction = await Transaction.findOne({
    //             where: { transactionId: transactionId },
    //         });

    //         if (!transaction) {
    //             return res.status(404).json({ message: "Transaction not found" });
    //         }

    //         const owner = transaction.owner;
    //         if (req.uid != owner) {
    //             return res.status(403).json({ message: "Unauthorized" });
    //         }

    //         const file = req.file;
    //         if (!file) {
    //             return res.status(400).json({ message: "No file uploaded" });
    //         }
            
    //         const proofUpload = await uploadFile(file, transactionId);
    //         if (!proofUpload) {
    //             return res.status(500).json({ message: "Failed to upload proof" });
    //         }
    //         const updatedTransaction = await transaction.update({
    //             proof: proofUpload.data,
    //             jokiStatus: "finished",
    //         });

    //         return res.status(200).json({
    //             message: "Joki transaction updated successfully",
    //             data: updatedTransaction
    //         });
    //     } catch (error) {
        //         console.error(error);
        //         return res.status(500).json({ message: "Internal server error" });
        //     }
        // }
        
    async UpdateJokiStatus(req: Request, res: Response): Promise<Response> {
        const t = await sequelize.transaction();
        try {
            const transactionId = req.params.id;
            const { jokiStatus } = req.body;
            const action = req.query.action;
    
            if (!transactionId) {
                return res.status(400).json({ message: "Invalid parameter" });
            }
    
            const transaction = await Transaction.findOne({
                where: { transactionId: transactionId },
            });
    
            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }

            if (action === "update") {
                if (!jokiStatus) {
                    return res.status(400).json({ message: "Missing status field" });
                }
    
                let owner = transaction.owner;
                if (!owner) {
                    owner = req.uid;
                }
    
                const updatedTransaction = await transaction.update({
                    owner: owner,
                    jokiStatus: jokiStatus,
                });
    
                return res.status(200).json({
                    message: "Joki transaction status updated successfully",
                    data: updatedTransaction,
                });
            } 
            else if (action === "finish") {
                const owner = transaction.owner;
                if (req.uid !== owner) {
                    return res.status(403).json({ message: "Unauthorized" });
                }
    
                const file = req.file;
                if (!file) {
                    return res.status(400).json({ message: "No file uploaded" });
                }
    
                const proofUpload = await uploadFile(file, transactionId);
                if (!proofUpload) {
                    return res.status(500).json({ message: "Failed to upload proof" });
                }
    
                const updatedTransaction = await transaction.update({
                    proof: proofUpload,
                    jokiStatus: "finished",
                }, { transaction: t });

                const user = await User.findByPk(owner);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                const updatedBalance = await user.update({
                    balance: parseFloat(user.balance as unknown as string)  + parseFloat(transaction.price as unknown as string),
                }, { transaction: t });
                if (!updatedBalance) {
                    return res.status(500).json({ message: "Failed to update user balance" });
                }
                console.log(`Updated balance: ${user.balance}`);

                await t.commit();
                return res.status(200).json({
                    message: "Joki transaction finished successfully",
                    data: updatedTransaction,
                });
            } 
            else {
                return res.status(400).json({ message: "Invalid action parameter" });
            }
        } catch (error) {
            await t.rollback();
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async UpdatePaymentStatus(req: Request, res: Response): Promise<Response> {
        try {
            const transactionId = req.params.id;

            if (!transactionId) {
                return res.status(400).json({ message: "Invalid parameter" });
            }

            const transaction = await Transaction.findOne({
                where: { transactionId: transactionId },
            });

            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }

            const updatedTransaction = await transaction.update({
                paymentStatus: true,
            });

            return res.status(200).json({
                message: "Joki transaction status updated successfully",
                data: updatedTransaction
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async GetAllJokiTransaction(req: Request, res: Response): Promise<Response> {
        try {
            const transactions = await Transaction.findAll();
            return res.status(200).json({
                message: "All joki transactions retrieved successfully",
                data: transactions
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async GetJokiTransactionById(req: Request, res: Response): Promise<Response> {
        try {
            const transactionId = req.params.id;

            if (!transactionId) {
                return res.status(400).json({ message: "Invalid parameter" });
            }

            const transaction = await Transaction.findOne({
                where: { transactionId: transactionId },
            });

            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }

            return res.status(200).json({
                message: "Joki transaction retrieved successfully",
                data: transaction
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async GetJokiByOwner(req: Request, res: Response): Promise<Response> {
        try {
            const uid = req.uid;
            const transactions = await Transaction.findAll({
                where: { owner: uid },
            });

            return res.status(200).json({
                message: "Joki transactions retrieved successfully",
                data: transactions
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async DeleteJokiTransaction(req: Request, res: Response): Promise<Response> {
        try {
            const transactionId = req.params.id;

            if (!transactionId) {
                return res.status(400).json({ message: "Invalid parameter" });
            }

            const transaction = await Transaction.findOne({
                where: { transactionId: transactionId },
            });

            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }

            await transaction.destroy();

            return res.status(200).json({
                message: "Joki transaction deleted successfully"
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default new TransactionController();