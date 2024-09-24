import { Model, DataTypes } from "sequelize";
import { sequelize } from "../configs/db";
import User from "./user.model";

class Transaction extends Model {
	public transactionId!: string;
    public owner?: string;
	public email!: string;
	public password!: string;
	public loginMethod!: string;
	public reqHero?: string;
	public notes?: string;
	public contactNumber!: string;
	public rank!: string;
	public price!: number;
	public quantity!: number;
	public paymentMethod!: string;
	public paymentStatus!: string;
	public jokiStatus!: string;
}

Transaction.init({
	transactionId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    owner: {
        type: DataTypes.STRING,
        references: {
            model: User,
            key: "uid",
        },
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    loginMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    reqHero: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contactNumber: {
        type: DataTypes.STRING,
		allowNull: false,
    },
    rank: {
		type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
		type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    quantity: {
		type: DataTypes.INTEGER,
        allowNull: false,
    },
    paymentMethod: {
		type: DataTypes.STRING,
        allowNull: false,
    },
    paymentStatus: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
    },
	jokiStatus: {
        type: DataTypes.ENUM("onProgress", "actionNeeded", "finished"),
        allowNull: false,
		defaultValue: "actionNeeded",
    }
},
{
    sequelize,
    modelName: "transaction",
});

export default Transaction;