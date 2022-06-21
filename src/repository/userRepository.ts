import { Service } from 'typedi';
import Account from '../models/account';
import Users from '../models/users';
import {v4 as uuid} from 'uuid';
import Worlds from '../models/worlds';

@Service()
export default class UserRepository {
    async fetchAccount(id: string) {
        return await Account.findByPk(id);
    }
    async getWorld(user: Users): Promise<Worlds[]>{
        return await Worlds.findAll({where: {userId: user.id}});
    }
    async fetch(payload): Promise<Users> {
        const { email, password } = payload;
        return await Users.findOne({ where: {email, password} });
    }

    async create(user): Promise<Users> {
        const result = await Users.create({purchasedItems:[], ...user});
        const acc = await Account.create({
            oxygen:1000,
            userId: result.id,
            id: uuid()
        });
        result.update({accountId:acc.id});
        return result;
    }
}
