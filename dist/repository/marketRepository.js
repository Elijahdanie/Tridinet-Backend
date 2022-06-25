"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const account_1 = __importDefault(require("../models/account"));
const items_1 = __importDefault(require("../models/items"));
const transactions_1 = __importDefault(require("../models/transactions"));
const users_1 = __importDefault(require("../models/users"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const s3_1 = require("../utils/s3");
let MarketRepository = class MarketRepository {
    async savePreview(Itemid, userid, file) {
        try {
            const item = await items_1.default.findByPk(Itemid);
            if (item.userId === userid) {
                const key = await this.uploadS3(file, Itemid + '_preview');
                await item.update({ previewUrl: key });
                return true;
            }
            return false;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    async buyItem(item, user) {
        try {
            const account = await account_1.default.findOne({ where: { userId: user.id } });
            if (account.oxygen > item.cost) {
                const oxygen = account.oxygen - item.cost;
                await account.update({ oxygen });
                await transactions_1.default.create({
                    id: (0, uuid_1.v4)(),
                    accountId: account.id,
                    itemId: item.id,
                    cost: item.cost,
                });
                let purchasedItems = user.purchasedItems;
                purchasedItems.push(item.id);
                const data = await (await users_1.default.findByPk(user.id)).update({ purchasedItems: purchasedItems });
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
    fetchItemsFromUser(id) {
        try {
            return items_1.default.findAll({ where: { userId: id } });
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async uploadS3(file, itemId) {
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
        await fs_1.default.writeFileSync(filePath, view, 'binary');
        const SendData = await (0, s3_1.uploadFile)(filePath, fileName);
        fs_1.default.unlinkSync(filePath);
        return SendData.Key;
        //return `http://localhost:3000/marlet/download/${fileName}`;
    }
    async createItem(payload, file, user) {
        try {
            const url = await this.uploadS3(file, payload.id);
            payload.fileUrl = url;
            console.log(payload);
            user.purchasedItems = user.purchasedItems ? user.purchasedItems : [];
            let pitems = user.purchasedItems;
            pitems.push(payload.id);
            await user.update({ purchasedItems: pitems });
            const result = await items_1.default.create(payload);
            return result;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async updateItem(payload) {
        try {
            return (await items_1.default.findByPk(payload.id)).update(payload);
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async fetchItem(id) {
        try {
            return await items_1.default.findByPk(id);
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async deleteItem(id, user) {
        try {
            const item = await (await items_1.default.findByPk(id));
            if (transactions_1.default.findOne({ where: { itemId: id } })) {
                return { message: "Item is in use" };
            }
            if (item.userId === user.id) {
                await (0, s3_1.deleteFile)(item.fileUrl);
                await item.destroy();
                return { messagge: "Item deleted" };
            }
            else {
                return { message: "You are not authorized to delete this item" };
            }
        }
        catch (error) {
            console.log(error);
            return { message: "Error deleting item" };
        }
    }
};
MarketRepository = __decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.JsonController)()
], MarketRepository);
exports.default = MarketRepository;
