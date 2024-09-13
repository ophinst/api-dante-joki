import { Model, DataTypes } from "sequelize";
import { sequelize } from "../configs/db";

class User extends Model {
	public uid!: string;
	public fullName!: string;
	public username!: string;
	public email!: string;
	public password!: string;
	public phoneNumber!: string;
	public balance!: number;
	public role!: string;
}

User.init({
	uid: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
	}
}, {
	sequelize,
	modelName:"user"
});

export { User };