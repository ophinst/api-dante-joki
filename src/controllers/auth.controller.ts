import User from "../models/user.model";
import { Request, Response } from "express";
import { Env } from "../configs/env-loader";
import { nanoid } from "nanoid";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import Token from "../models/token.model";

class AuthController {
	async UserRegister(req: Request, res: Response): Promise<Response> {
		try {
			const { fullName, username, email, password, confirmPassword, phoneNumber, role } = req.body;

			const userExists = await User.findOne({ where: { email } });
			if (userExists) {
				return res.status(400).json({ message: "Email already exists" });
			}

			if (password !== confirmPassword) {
				return res.status(400).json({ message: "Passwords do not match" });
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return res.status(400).json({ message: "Invalid email format" });
			}

			const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());

			const uid = "UJD" + nanoid(10);
			const newUser = await User.create({
				uid,
				fullName,
				username,
				email,
				password: hashedPassword,
				phoneNumber,
				role,
			});

			const tokenId = "tkn-" + nanoid(10);
			const token = jwt.sign({ uid, email, username }, Env.JWT_SECRET, { expiresIn: "24h" });
			const refreshToken = jwt.sign({ uid, email, username }, Env.JWT_SECRET, { expiresIn: "7d" });
			await Token.create({
				tokenId: tokenId,
				uid,
				token,
				refreshToken
			});
			return res.status(201).json({
				message: "User created successfully",
				data: {
					uid: newUser.uid,
                    fullName: newUser. fullName,
                    username: newUser.username,
                    email: newUser.email,
                    phoneNumber: newUser.phoneNumber,
                    role: newUser.role,
					token: token
				}
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}

	async UserLogin(req: Request, res: Response): Promise<Response> {
		try {
			const { email, password } = req.body;

			const user = await User.findOne({ where: { email } });
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(400).json({ message: "Invalid credentials" });
			}
			
			const uid = user.uid;
			const username = user.username;
			const role = user.role;

			await Token.destroy({ where: { uid:uid }});

			const tokenId = "tkn-" + nanoid(10);
			const token = jwt.sign({ uid, email, username, role }, Env.JWT_SECRET, { expiresIn: "24h" });
			const refreshToken = jwt.sign({ uid, email, username, role }, Env.JWT_SECRET, { expiresIn: "7d" });
			await Token.create({
				tokenId: tokenId,
				uid,
				token,
				refreshToken
			});
			return res.status(200).json({
				message: "Logged in successfully",
				data: {
					uid,
                    email,
                    username,
					role,
                    token
				}
			});
		}
		catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}

	async UserLogout(req: Request, res: Response): Promise<Response> { 
		const uid = req.uid;
		if (!uid) {
			return res.status(401).json({ message: "Missing token, logged out automatically" });
		}

		try {
			// Delete user token
			await Token.destroy({ where: { uid } });
            return res.status(200).json({ message: "Logged out successfully" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}
}

export default new AuthController();