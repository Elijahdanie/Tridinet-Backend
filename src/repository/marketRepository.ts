import { JsonController } from "routing-controllers";
import { Service } from "typedi";
import Account from "../models/account";
import Repository from "../models/Repository";
import Transactions from "../models/transactions";
import Users from "../models/users";
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import util from 'util';
import { deleteFile, uploadFile } from "../utils/s3";

@Service()
@JsonController()
export default class MarketRepository {

    fettchOffsetLimit(page, count) {
        let maxPages = Math.round(count / 10);

        let offset = (10 * page);
        let limit = offset + 10;
        if (page < maxPages) {
            if (limit > count) {
                limit = count;
            }
        }
        else {
            offset = ((page - 1) * 10) + 10;
            limit = count
        }
        return { offset: offset, limit: limit }
    }

    async fetchRepos(page: number) {
        try {
            let count = await Repository.count();
            let params = this.fettchOffsetLimit(page, count);
            const items = await Repository.findAll(params);
            return items;
        } catch (error) {
            console.log(error)
        }
    }
    async savePreview(Itemid: any, userid: any, file: any) {
        try {
            const item = await Repository.findByPk(Itemid);
            if (item.userId === userid) {
                const key = await this.uploadS3(file, Itemid + '_preview');
                await item.update({ previewUrl: key });
                return true;
            }
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async saveItemToRepo(Itemid: any, userid: any, file: any) {
        try {
            const key = await this.uploadS3(file, Itemid + '_' + userid);
            return key;
            return "";
        } catch (error) {
            console.log(error);
            return "";
        }
    }

    async buyItem(item: Repository, user: Users) {
        try {
            const account = await Account.findOne({ where: { userId: user.id } });
            if (account.oxygen > item.cost) {
                const oxygen = account.oxygen - item.cost;
                await account.update({ oxygen });
                await Transactions.create({
                    id: uuid(),
                    accountId: account.id,
                    itemId: item.id,
                    cost: item.cost,
                })
                let purchasedItems = user.purchasedItems
                purchasedItems.push(item.id);
                const data = await (await Users.findByPk(user.id)).update({ purchasedItems: purchasedItems });
                return data;
            }
            else {
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
            return Repository.findAll({ where: { userId: id } });
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async uploadS3(file, itemId): Promise<string> {
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

    async createItem(payload, file, user: Users) {
        try {
            const url = await this.uploadS3(file, payload.id);
            payload.fileUrl = url;
            console.log(payload)
            user.purchasedItems = user.purchasedItems ? user.purchasedItems : [];
            let pitems = user.purchasedItems;
            pitems.push(payload.id);
            await user.update({ purchasedItems: pitems });
            const result = await Repository.create(payload);
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async updateItem(payload) {
        try {
            return (await Repository.findByPk(payload.id)).update(payload);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async fetchItem(id): Promise<Repository> {
        try {
            return await Repository.findByPk(id);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async deleteItem(id, user): Promise<any> {
        try {
            const item = await (await Repository.findByPk(id));
            if (Transactions.findOne({ where: { itemId: id } })) {
                return { message: "Item is in use" };
            }
            if (item.userId === user.id) {
                await deleteFile(item.manifestUrl);
                await item.destroy();
                return { messagge: "Item deleted" };
            } else {
                return { message: "You are not authorized to delete this item" };
            }
        } catch (error) {
            console.log(error);
            return { message: "Error deleting item" };
        }
    }
}