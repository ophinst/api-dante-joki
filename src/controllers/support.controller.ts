import { Request, Response } from "express";
import Support from "../models/support.model";
import { nanoid } from "nanoid";
import Transaction from "../models/transaction.model";

class SupportController {
	async CreateSupportRequest(req: Request, res: Response): Promise<Response> {
		try {
            const { name, email, phoneNumber, transactionId, issue, description } = req.body;
            if (!name || !email || !phoneNumber ||!transactionId ||!issue ||!description) {
                return res.status(400).json({ message: "Missing required fields" });
            }

			const transaction = await Transaction.findByPk(transactionId);
			if (!transaction) {
				return res.status(404).json({ message: "Transaction not found" });
			}

            const support = await Support.create({
				supportId: `JDS${nanoid(10)}`,
                name,
                email,
                phoneNumber,
                transactionId,
                issue,
                description,
            });

            return res.status(201).json({ message: "Support request created successfully", data: support });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
	}

	async GetAllSupportRequests(req: Request, res: Response): Promise<Response> {
		try {
            const supportRequests = await Support.findAll();

            return res.status(200).json({ message: "Support requests retrieved successfully", data: supportRequests });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
	}

	async GetSupportRequestById(req: Request, res: Response): Promise<Response> {
		try {
            const supportId = req.params.id;
            const supportRequest = await Support.findByPk(supportId);

            if (!supportRequest) {
                return res.status(404).json({ message: "Support request not found" });
            }

            return res.status(200).json({ message: "Support request retrieved successfully", data: supportRequest });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
	}

	async DeleteSupportRequest(req: Request, res: Response): Promise<Response> {
		try {
            const supportId = req.params.id;
            const supportRequest = await Support.findByPk(supportId);

            if (!supportRequest) {
                return res.status(404).json({ message: "Support request not found" });
            }

            await supportRequest.destroy();

            return res.status(200).json({ message: "Support request deleted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
	}
}

export default new SupportController();