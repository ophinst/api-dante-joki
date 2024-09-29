import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction} from "express";
import { Env } from "../configs/env-loader";
import Token from "../models/token.model";

class TokenMiddleware {
	async RefreshToken (req: Request, res: Response, next:NextFunction, expiredToken:string): Promise<Response|void> {
		const decoded = jwt.decode(expiredToken);
		if (typeof decoded === "object" && decoded !== null && "uid" in decoded) {
			req.uid = decoded.uid;
			req.name = decoded.name;
			req.email = decoded.email;
			req.role = decoded.role;
		}

		const oldTokenInstance = await Token.findOne({
			attributes: ["token", "tokenId"],
			where: {
				uid: req.uid,
			},
		});
		if (!oldTokenInstance) {
            return res.status(404).json({
                message: "Can't find token, please relogin!"
            });
        }

		try {
			const oldToken = oldTokenInstance.get("token");
			
			jwt.verify(oldToken, Env.JWT_SECRET);

			const newToken = jwt.sign({ uid: req.uid, name: req.name, email: req.email, role: req.role }, Env.JWT_SECRET, {
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