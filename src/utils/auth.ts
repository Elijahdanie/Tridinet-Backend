import Users from "../models/users";
import jwt from 'jsonwebtoken';

export default class Auth {
    static generateToken(user: Users) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return token;
    }
    static async fetchUser(data){
        try {            
            const token = data.split(' ')[1];
            const userId = jwt.verify(token, process.env.JWT_SECRET);
            console.log(userId)
            return await Users.findOne({where:{id:userId.id}});
        } catch (error) {
            console.log(error)
            return null;
        }
    }

    static async authorizeUser(data: string) {
        try {            
            const token = data.split(' ')[1];
            return !!jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.log(error)
            return false;
        }
    }
}
