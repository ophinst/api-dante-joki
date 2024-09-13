import { User } from "../models/user.model";
import { Request, Response } from "express";
import { Env } from "../configs/env-loader";
import { nanoid } from "nanoid";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import Token from "../models/token.model";

class AuthController {
	async UserRegister(req: Request, res: Response): Promise<Response> {
		try {
			const { fullName, username, email, password, confirmPassword, phoneNumber } = req.body;

			// Check if user already exists
			const userExists = await User.findOne({ where: { email } });
			if (userExists) {
				return res.status(400).json({ message: "Email already exists" });
			}

			// Check if passwords match
			if (password !== confirmPassword) {
				return res.status(400).json({ message: "Passwords do not match" });
			}

			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return res.status(400).json({ message: "Invalid email format" });
			}

			// Hash password
			const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());

			// Create uid
			const uid = "jbd-" + nanoid(10);
			// console.log(Env.DB_HOST! + Env.JWT_SECRET);

			// Create new user
			const newUser = await User.create({
				uid,
				fullName,
				username,
				email,
				password: hashedPassword,
				phoneNumber,
				role: "user",
			});

			// Create user current session token and refresh token
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

			// Check if user exists
			const user = await User.findOne({ where: { email } });
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			// Check if password matches
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(400).json({ message: "Invalid credentials" });
			}
			
			const uid = user.uid;
			const username = user.username;

			// Create user current session token and refresh token
			const tokenId = "tkn-" + nanoid(10);
			const token = jwt.sign({ uid, email, username }, Env.JWT_SECRET, { expiresIn: "24h" });
			const refreshToken = jwt.sign({ uid, email, username }, Env.JWT_SECRET, { expiresIn: "7d" });
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