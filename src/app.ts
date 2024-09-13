import express from "express";
import cors from "cors";
import morgan from "morgan";

import { Env } from "./configs/env-loader";
import AuthRouter from "./routes/auth.router";

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
);

app.use("/", (req, res) => {
	console.log("Server is listening");
	res.send("Jokian gacor wak!");
});


app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});

