import User from "../models/user.model";
import { Request, Response } from "express";
import * as bcrypt from "bcrypt";

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

    async EditUserById(req: Request, res: Response): Promise<Response> {
        try {

            const user = await User.findByPk(req.uid);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const { fullName, email, newPassword, oldPassword, username, phoneNumber } = req.body;

            if (email && (email === user.email || await User.findOne({ where: { email } }))) {
                return res.status(400).json({ message: "Email already exists" });
            }

            let hashedPassword;

            if(newPassword){
                const isMatch = await bcrypt.compare(oldPassword, user.password);
                if (!isMatch) {
                    return res.status(400).json({ message: "Invalid credentials" });
                }
                
                hashedPassword = await bcrypt.hash(newPassword, await bcrypt.genSalt());
            }

            await user.update({
                fullName,
                email,
                password: hashedPassword,
                username,
                phoneNumber,
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...updatedUserData } = user.toJSON();
            return res.status(200).json({ message: "User updated successfully", data: updatedUserData});
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    async DeleteUserById(req: Request, res: Response): Promise<Response> {
        try {
            const uid = req.params.id;

            if (!uid) {
                return res.status(400).json({ message: "Invalid parameter" });
            }

            const user = await User.findByPk(uid);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            await user.destroy();
            return res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default new UserController();