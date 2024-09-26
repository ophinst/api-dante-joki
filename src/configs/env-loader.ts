import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken";
dotenv.config();

export const EnvironmentsVariables = () => ({
	PORT: +process.env.PORT!,
	DB_HOST: process.env.DB_HOST,
	DB_PORT: +process.env.DB_PORT!,
	DB_USERNAME: process.env.DB_USERNAME,
	DB_PASSWORD: process.env.DB_PASSWORD,
	DB_NAME: process.env.DB_NAME,
	JWT_SECRET: process.env.JWT_SECRET as jwt.Secret,
	GCP_EMAIL: process.env.GCP_EMAIL,
	GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
	GCP_KEY: process.env.GCP_KEY,
	NODE_ENV: process.env.NODE_ENV,
	SUPABASE_URL: process.env.SUPABASE_URL,
	SUPABASE_KEY: process.env.SUPABASE_KEY,
	SUPABASE_BUCKET: process.env.SUPABASE_BUCKET
});

export const Env = EnvironmentsVariables();