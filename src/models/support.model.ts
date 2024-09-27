import { sequelize } from "../configs/db";
import { Model, DataTypes } from "sequelize";
import Transaction from "./transaction.model";

class Support extends Model {
	public supportId!: string;
	public name!: string;
	public email!: string;
	public phoneNumber!: string;
	public transactionId!: string;
	public issue!: string;
	public description!: string;
}

Support.init({
	supportId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
		references: {
			model: Transaction,
            key: "transactionId",
		}
    },
    issue: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, { 
	sequelize,
    modelName: "support",
});

export default Support;
