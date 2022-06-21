import { JsonController } from "routing-controllers";
import { Service } from "typedi";
import Account from "../models/account";
import Items from "../models/items";
import Transactions from "../models/transactions";
import Users from "../models/users";
import {v4 as uuid} from 'uuid';

@Service()
@JsonController()
export default class MarketRepository {
    async buyItem(item: Items, user: Users) {
        try {
            const account = await Account.findOne({where:{userId:user.id}});
            if(account.oxygen > item.cost)
            {
                const oxygen = account.oxygen - item.cost;
                await account.update({oxygen});
                await Transactions.create({
                    id: uuid(),
                    accountId: account.id,
                    itemId: item.id,
                    cost: item.cost,
                })
                let purchasedItems = user.purchasedItems ? user.purchasedItems : [];
                purchasedItems.push(item.id);
                const data = await user.update({purchasedItems});
                return data;
            }
            else
            {
                return null;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }

    fetchItemsFromUser(id: any) {
        try {            
            return Items.findAll({where:{userId:id}});
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async createItem(payload){
        try {
            const result = Items.create(payload);
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async updateItem(payload){
        try {
            return (await Items.findByPk(payload.id)).update(payload);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async fetchItem(id): Promise<Items> {
        try {
            return await Items.findByPk(id);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async deleteItem(id){
        try {
            await (await Items.findByPk(id)).destroy();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}