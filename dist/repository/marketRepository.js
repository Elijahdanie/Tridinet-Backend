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
const uuid_1 = require("uuid");
let MarketRepository = class MarketRepository {
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
                let purchasedItems = user.purchasedItems ? user.purchasedItems : [];
                purchasedItems.push(item.id);
                const data = await user.update({ purchasedItems });
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
    async createItem(payload) {
        try {
            const result = items_1.default.create(payload);
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
    async deleteItem(id) {
        try {
            await (await items_1.default.findByPk(id)).destroy();
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
};
MarketRepository = __decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.JsonController)()
], MarketRepository);
exports.default = MarketRepository;
