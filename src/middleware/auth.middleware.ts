import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Env } from "../configs/env-loader";
import tokenMiddleware from "./token.middleware";

class AuthMiddleware {
	async VerifyToken (req: Request, res: Response, next: NextFunction): Promise<Response|void> {
		// Extract the token from the headers
		const header = req.headers["authorization"];
		const token = header && header.split(" ")[1];
		if (!token){
			return res.status(401).json({
				message: "Missing token"
			});
		}

		try {
			jwt.verify(token, Env.JWT_SECRET);
			const decoded = jwt.decode(token);
			if (typeof decoded === "object" && decoded !== null && "username" in decoded) {
				req.uid = decoded.uid;
				req.role = decoded.role;
			} else {
				return res.status(401).json({ error: "Token malformed" });
			}
			next();
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				tokenMiddleware.RefreshToken(req, res, next, token);
			} else if (error instanceof jwt.JsonWebTokenError) {
				console.error(error);
				return res.status(403).json({
					message: "Invalid token"
				});
			} else{
				console.error(error);
				return res.status(500).json({
					message: "Internal server error!"
				});
			}
		}
	}

	async VerifyRoles(req: Request, res: Response, next: NextFunction): Promise<Response|void>{
		try {
			const role = req.role;
			if (!role){
				return res.status(403).json({ message: "Token malformed" });
			}

			if (role === "admin") {
                next();
            } else {
                return res.status(403).json({ message: "Forbidden" });
            }
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
		
	}
}

export default new AuthMiddleware;

