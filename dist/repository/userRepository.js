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
const typedi_1 = require("typedi");
const account_1 = __importDefault(require("../models/account"));
const users_1 = __importDefault(require("../models/users"));
const uuid_1 = require("uuid");
const worlds_1 = __importDefault(require("../models/worlds"));
let UserRepository = class UserRepository {
    async fetchAccount(id) {
        return await account_1.default.findByPk(id);
    }
    async getWorld(user) {
        return await worlds_1.default.findAll({ where: { userId: user.id } });
    }
    async fetch(payload) {
        const { email, password } = payload;
        return await users_1.default.findOne({ where: { email, password } });
    }
    async create(user) {
        const result = await users_1.default.create(Object.assign({ purchasedItems: [] }, user));
        const acc = await account_1.default.create({
            oxygen: 1000,
            userId: result.id,
            id: (0, uuid_1.v4)()
        });
        result.update({ accountId: acc.id });
        return result;
    }
};
UserRepository = __decorate([
    (0, typedi_1.Service)()
], UserRepository);
exports.default = UserRepository;
