import express from "express";
import cors from "cors";
import morgan from "morgan";

import { Env } from "./configs/env-loader";
import AuthMiddleware from "./middleware/auth.middleware";
import { AuthRouter } from "./routes/auth.router";
import { TransactionRouter } from "./routes/transaction.router";
import { UserRouter } from "./routes/user.router";
import { WithdrawRouter } from "./routes/withdraw.router";
import { SupportRouter } from "./routes/support.router";

const port = Env.PORT;

const app = express();
const globalApiPrefix = "/api";

app.use(globalApiPrefix, express.json());
app.use(cors({
	credentials: true,
	origin: "*",
}));
app.use(morgan("tiny"));
app.disable("x-powered-by");

app.use(`${globalApiPrefix}/`,
	express.Router()
	.use("/auth", AuthRouter)
	.use("/joki", TransactionRouter)
	.use("/user", AuthMiddleware.VerifyToken, AuthMiddleware.VerifyRoles, UserRouter)
	.use("/withdraw", AuthMiddleware.VerifyToken, WithdrawRouter)
	.use("/support", SupportRouter)
);

app.use("/", (req, res) => {
	console.log("Server is listening");
	res.send("Jokian gacor wak!");
});


app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});

