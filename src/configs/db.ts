import { Sequelize } from "sequelize";
import { Env } from "./env-loader";

export const sequelize = new Sequelize({
	dialect: "postgres",
	host: Env.DB_HOST,
	port: Env.DB_PORT,
	username: Env.DB_USERNAME,
	password: Env.DB_PASSWORD,
	database: Env.DB_NAME,
});

try {
	sequelize.authenticate();
	if (Env.NODE_ENV === "development") {
		sequelize.sync({alter: true}).then(() => console.log("Database & tables created!"));
	}
} catch (err) {
	console.error(err);
}