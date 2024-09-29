import { Request, Response } from "express";
import Withdraw from "../models/withdraw.model";
import { nanoid } from "nanoid";
import { sequelize } from "../configs/db";
import User from "../models/user.model";

class WithdrawController {
	async CreateWithdrawRequest(req: Request, res: Response): Promise<Response> {
		try {
			const { withdrawAmount, withdrawMethod, accountNumber, accountName, notes } = req.body;
			if (!withdrawAmount || !withdrawMethod || !accountNumber || !accountName) {
				return res.status(400).json({ message: "Missing required fields" });
			}

			const newWithdrawRequest = await Withdraw.create({
				withdrawId: `JDW${nanoid(10)}`,
				uid: req.uid,
				withdrawAmount,
                withdrawMethod,
                accountNumber,
                accountName,
                notes,
			});

			const requester = await User.findByPk(req.uid);
			if (!requester) {
                return res.status(404).json({ message: "Requester not found" });
            }

			if (requester.balance < withdrawAmount) {
				return res.status(400).json({ message: "Unsufficient user balance"});
			}

			return res.status(201).json({
                message: "Withdrawal request created successfully",
                data: newWithdrawRequest,
            });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}

	// async GetAllWithdrawRequest(req: Request,res: Response): Promise<Response> {
	// 	try {
    //         const withdrawRequests = await Withdraw.findAll();

    //         return res.status(200).json({
    //             message: "Withdrawal requests retrieved successfully",
    //             data: withdrawRequests,
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ message: "Internal server error" });
    //     }
	// }

	async GetWithdrawRequestById(req: Request, res: Response): Promise<Response> {
		try {
            const withdrawId = req.params.id;
            const withdrawRequest = await Withdraw.findByPk(withdrawId);

            if (!withdrawRequest) {
                return res.status(404).json({ message: "Withdrawal request not found" });
            }

            return res.status(200).json({
                message: "Withdrawal request retrieved successfully",
                data: withdrawRequest,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
	}

	async UpdateWithdrawRequestStatus(req: Request, res: Response): Promise<Response> {
		const t = await sequelize.transaction();
		try {
            const withdrawId = req.params.id;

            const withdrawRequest = await Withdraw.findByPk(withdrawId);
            if (!withdrawRequest) {
                return res.status(404).json({ message: "Withdrawal request not found" });
            }

			const requester = await User.findByPk(withdrawRequest.uid);
			if (!requester) {
                return res.status(404).json({ message: "Requester not found" });
            }

			const userBalance = requester.balance;
			if (userBalance < withdrawRequest.withdrawAmount) {
				return res.status(400).json({ message: "Unsufficient user balance"});
			}

            const updatedWithdrawRequest = await withdrawRequest.update({ status: "accepted" }, { transaction: t });
			const updatedUserBalance = await requester.update({
				balance: parseFloat(userBalance as unknown as string) - parseFloat(withdrawRequest.withdrawAmount as unknown as string),
			}, { transaction: t });

			console.log(`Old balance: ${userBalance}, New balance: ${updatedUserBalance.balance}`);

			t.commit();

            return res.status(200).json({
                message: "Withdrawal request status updated successfully",
                data: updatedWithdrawRequest,
            });
        } catch (error) {
			t.rollback();
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
	}

    // async GetWithdrawRequestByOwner(req: Request, res: Response): Promise<Response>{
    //     try {
    //         const uid = req.uid;
    //         const withdrawRequests = await Withdraw.findAll({
    //             where: { uid },
    //         });

    //         return res.status(200).json({
    //             message: "Withdrawal requests retrieved successfully",
    //             data: withdrawRequests,
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ message: "Internal server error" });
    //     }
    // }

    async GetWithdrawRequests(req: Request, res: Response): Promise<Response> {
        try {
            const uid = req.query.uid;
            let withdrawRequests;
    
            if (uid) {
                withdrawRequests = await Withdraw.findAll({
                    where: { uid },
                });
                return res.status(200).json({
                    message: `Withdrawal requests for user ${uid} retrieved successfully`,
                    data: withdrawRequests,
                });
            } else {
                if (req.role != "admin") {
                    return res.status(403).json({ message: "Unauthorized" });
                }

                withdrawRequests = await Withdraw.findAll();
                return res.status(200).json({
                    message: "All withdrawal requests retrieved successfully",
                    data: withdrawRequests,
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    
}

export default new WithdrawController();