import { sequelize } from "../configs/db";
import { Model, DataTypes } from "sequelize";
import User from "./user.model";

class Withdraw extends Model {
	public withdrawId!: string;
	public uid!: string;
	public withdrawAmount!: number;
	public withdrawMethod!: string;
	public accountNumber!: string;
	public accountName!: string;
	public notes?: string;
	public status!: string;
}

Withdraw.init({
	withdrawId: {
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
        allowNull: false,
    },
    withdrawAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    withdrawMethod: {
        type: DataTypes.ENUM("BCA", "GOPAY"),
        allowNull: false,
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    accountName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    notes: {
        type: DataTypes.TEXT,
		allowNull: true,
    },
    status: {
		type: DataTypes.ENUM("pending", "accepted"),
        allowNull: false,
        defaultValue: "pending",
    },	
}, {
	sequelize,
    modelName: "withdraw",
});

export default Withdraw;
