import { JsonController } from "routing-controllers";
import { Service } from "typedi";
import Account from "../models/account";
import Items from "../models/items";
import Transactions from "../models/transactions";
import Users from "../models/users";
import {v4 as uuid} from 'uuid';
import fs from 'fs';
import util from 'util';
import {deleteFile, uploadFile} from "../utils/s3";

@Service()
@JsonController()
export default class MarketRepository {
    async savePreview(Itemid: any, userid: any, file:any) {
        try {
            const item = await Items.findByPk(Itemid);
            if(item.userId === userid)
            {

                const key = await this.uploadS3(file, Itemid + '_preview');
                await item.update({previewUrl:key});
                return true;
            }
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
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
                let purchasedItems = user.purchasedItems
                purchasedItems.push(item.id);
                const data = await (await Users.findByPk(user.id)).update({purchasedItems:purchasedItems});
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

    async uploadS3(file, itemId): Promise<string>{
        // save file from upload
        // return file url
        let arrbuf = new ArrayBuffer(file.buffer.length);
        let view = new Uint8Array(arrbuf);
        for (let i = 0; i < file.buffer.length; i++) {
          view[i] = file.buffer[i];
        }
        const fileName = `${itemId}`;
        let filePath = `./temp/${fileName}`;
        //const writeFile = util.promisify(fs.writeFileSync);
        //const unlink = util.promisify(fs.unlinkSync);
        await fs.writeFileSync(filePath, view, 'binary');
        const SendData = await uploadFile(filePath, fileName);
        fs.unlinkSync(filePath);
        return SendData.Key;
        //return `http://localhost:3000/marlet/download/${fileName}`;
      }

    async createItem(payload, file, user:Users){
        try {
            const url = await this.uploadS3(file, payload.id);
            payload.fileUrl = url;
            console.log(payload)
            user.purchasedItems = user.purchasedItems ? user.purchasedItems : [];
            let pitems = user.purchasedItems;
            pitems.push(payload.id);
            await user.update({purchasedItems:pitems});
            const result = await Items.create(payload);
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

    async deleteItem(id, user): Promise<any> {
        try {
            const item = await (await Items.findByPk(id));
            if(Transactions.findOne({where:{itemId:id}})){
                return {message:"Item is in use"};
            }
            if(item.userId === user.id)
            {
                await deleteFile(item.fileUrl);
                await item.destroy();
                return {messagge:"Item deleted"};
            }else
            {
                return {message:"You are not authorized to delete this item"};
            }
        } catch (error) {
            console.log(error);
            return {message:"Error deleting item"};
        }
    }
}