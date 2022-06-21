"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = __importDefault(require("../models/users"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class Auth {
    static generateToken(user) {
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return token;
    }
    static async fetchUser(data) {
        try {
            const token = data.split(' ')[1];
            const userId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            console.log(userId);
            return await users_1.default.findOne({ where: { id: userId.id } });
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    static async authorizeUser(data) {
        try {
            const token = data.split(' ')[1];
            return !!jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
}
exports.default = Auth;
