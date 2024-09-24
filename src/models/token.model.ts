import { Model, DataTypes } from "sequelize";
import { sequelize } from "../configs/db";
import User from "./user.model";

class Token extends Model {
	public tokenId!: string;
	public uid!: string;
	public token!: string;
	public refreshToken!: string;
}

Token.init({
	tokenId: {
		type: DataTypes.STRING,
		primaryKey: true,
		allowNull: false,
	},
	uid: {
		type: DataTypes.STRING,
		references: {
			model: User,
			key: "uid",
		},
		allowNull:false,
	},
	token: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	refreshToken: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
	sequelize,
	modelName: "token",
});

export default Token;