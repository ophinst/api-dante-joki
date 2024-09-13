import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction} from "express";
import { Env } from "../configs/env-loader";
import Token from "../models/token.model";

class TokenMiddleware {
	async RefreshToken (req: Request, res: Response, next:NextFunction, expiredToken:string): Promise<Response|void> {
		// Get uid from token
		const decoded = jwt.decode(expiredToken);
		if (typeof decoded === "object" && decoded !== null && "uid" in decoded) {
			req.uid = decoded.uid;
		}

		// Check if old token exist
		const oldTokenInstance = await Token.findOne({
			where: {
				uid: req.uid,
			},
		});
		if (!oldTokenInstance) {
            return res.status(404).json({
                message: "Can't find token, please relogin!"
            });
        }

		// Validate old token and update user token
		try {
			const oldToken = oldTokenInstance.refreshToken;
			
			jwt.verify(oldToken, Env.JWT_SECRET);

			const newToken = jwt.sign({ uid: req.uid, name: req.name, email: req.email }, Env.JWT_SECRET, {
				expiresIn: "7d"
			});

			await oldTokenInstance.update({
				token: oldToken,
				refreshToken: newToken
			}, {
				where: {
					uid: req.uid
				}
			});
			next();
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				return res.status(401).json({
					message: "Your session expired, please relogin!"
				});
			}
			else{
				console.log(error);
				return res.status(500).json({
					message: "Internal server error!"
				});
			}
		}
	}
}

export default new TokenMiddleware;