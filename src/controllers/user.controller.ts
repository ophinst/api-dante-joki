import User from "../models/user.model";
import { Request, Response } from "express";

class UserController {
	async GetAllUsers(req: Request, res: Response): Promise<Response> {
		try {
            const users = await User.findAll({
				attributes: { exclude: ["password"] }
			});
            return res.status(200).json({
				message: "All users retrieved successfully",
				data: users 
			});
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
	}

	async GetUserById(req: Request, res: Response): Promise<Response> {
		try {
            const uid = req.params.id;

            if (!uid) {
                return res.status(400).json({ message: "Invalid parameter" });
            }

            const user = await User.findByPk(uid, {
				attributes: { exclude: ["password"] }
			});
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json({ 
				message: "User retrived successfully",
				data: user 
			});
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
	}
}

export default new UserController();