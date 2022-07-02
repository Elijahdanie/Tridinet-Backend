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
const worlds_1 = __importDefault(require("../models/worlds"));
let WorldRepository = class WorldRepository {
    async delete(id) {
        const result = await worlds_1.default.destroy({ where: { id: id } });
        return result;
    }
    async update(id, payload) {
        let data = await worlds_1.default.findByPk(id);
        return await data.update(payload);
    }
    async fetch(url) {
        return await worlds_1.default.findOne({ where: { url: url } });
    }
    async create(world) {
        return await worlds_1.default.create(world);
    }
};
WorldRepository = __decorate([
    (0, typedi_1.Service)()
], WorldRepository);
exports.default = WorldRepository;
