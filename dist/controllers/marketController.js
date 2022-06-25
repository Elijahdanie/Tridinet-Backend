"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const uuid_1 = require("uuid");
const users_1 = __importDefault(require("../models/users"));
const marketRepository_1 = __importDefault(require("../repository/marketRepository"));
const s3_1 = require("../utils/s3");
let MarketController = class MarketController {
    constructor() {
        this._marketRepository = new marketRepository_1.default();
    }
    async uploadPreview(file, payload, user, res) {
        try {
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const id = payload.id;
            const validateItem = await this._marketRepository.savePreview(id, user.id, file);
            if (!validateItem) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            return res.status(200).json({ success: true, message: "Preview uploaded" });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
    async createItem(file, user, payload, res) {
        try {
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { name, description, cost } = payload;
            if (!name || !description || !cost) {
                return res.status(400).send("Missing required fields");
            }
            const item = await this._marketRepository.createItem({
                id: (0, uuid_1.v4)(),
                name,
                description,
                cost,
                userId: user.id
            }, file, user);
            return res.status(200).json({ success: true, data: item });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Unable to process" });
        }
    }
    async deleteItem(user, id, res) {
        try {
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const item = await this._marketRepository.deleteItem(id, user);
            return res.status(200).json({ success: true, message: item.message, data: !!item });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Unable to process" });
        }
    }
    async previewItem(id, res) {
        try {
            const item = await this._marketRepository.fetchItem(id);
            res.setHeader('Content-Disposition', `filename=${item.fileUrl}.png`);
            res.setHeader('Content-Type', 'image/png');
            return new Promise((resolve, reject) => {
                const readable = (0, s3_1.downLoadFile)(item.previewUrl);
                readable.pipe(res);
                readable.on('end', () => resolve(res));
                readable.on('error', (error) => reject(error));
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Unable to process" });
        }
    }
    async fetchItem(id, res) {
        try {
            const item = await this._marketRepository.fetchItem(id);
            res.setHeader('Content-Disposition', `filename=${item.fileUrl}.png`);
            res.setHeader('Content-Type', 'image/png');
            return new Promise((resolve, reject) => {
                const readable = (0, s3_1.downLoadFile)(item.fileUrl);
                readable.pipe(res);
                readable.on('end', () => resolve(res));
                readable.on('error', (error) => reject(error));
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Unable to process" });
        }
    }
    async update(user, payload, res) {
        try {
            const { id, name, description, fileUrl, previewUrl, cost } = payload;
            if (!id || !name || !description || !fileUrl || !previewUrl || !cost) {
                return res.status(400).send("Missing required fields");
            }
            const item = await this._marketRepository.fetchItem(id);
            if (item.userId !== user.id) {
                return res.status(401).json({ success: false });
            }
            await item.update({
                id,
                name,
                description,
                fileUrl,
                previewUrl,
                cost
            });
            return res.status(200).json({ success: true, data: item });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Unable to process" });
        }
    }
    async fetch(id, res) {
        try {
            const item = await this._marketRepository.fetchItem(id);
            if (!item) {
                return res.status(404).send("Item not found");
            }
            const data = {
                id: item.id,
                name: item.name,
                description: item.description,
                previewUrl: item.previewUrl,
                cost: item.cost
            };
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Unable to process" });
        }
    }
    async buy(user, id, res) {
        try {
            if (!user) {
                return res.status(401).json({ success: false });
            }
            const item = await this._marketRepository.fetchItem(id);
            if (!item) {
                return res.status(404).send("Item not found");
            }
            console.log(user.purchasedItems.includes(item.id));
            console.log(user.purchasedItems);
            const check = user.purchasedItems !== null ? user.purchasedItems.includes(item.id) : false;
            // if(item.userId === user.id || check)
            if (check) {
                return res.status(401).json({ success: false, message: "You already own this item" });
            }
            const result = await this._marketRepository.buyItem(item, user);
            if (!result) {
                return res.status(401).json({ success: false, message: "Insufficient oxygen" });
            }
            return res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Unable to process" });
        }
    }
    async fetchItemsFromUser(user, res) {
        try {
            if (!user) {
                return res.status(401).json({ success: false });
            }
            const items = await this._marketRepository.fetchItemsFromUser(user.id);
            return res.status(200).json({ success: true, data: items });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Unable to process" });
        }
    }
};
__decorate([
    (0, routing_controllers_1.Post)('/upload/preview'),
    __param(0, (0, routing_controllers_1.UploadedFile)('file')),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.CurrentUser)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "uploadPreview", null);
__decorate([
    (0, routing_controllers_1.Post)('/create'),
    __param(0, (0, routing_controllers_1.UploadedFile)('file')),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "createItem", null);
__decorate([
    (0, routing_controllers_1.Delete)('/item/:id'),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __param(1, (0, routing_controllers_1.Param)('id')),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_1.default, String, Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "deleteItem", null);
__decorate([
    (0, routing_controllers_1.Get)('/preview/:id'),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "previewItem", null);
__decorate([
    (0, routing_controllers_1.Get)('/item/:id'),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "fetchItem", null);
__decorate([
    (0, routing_controllers_1.Post)('/update'),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "update", null);
__decorate([
    (0, routing_controllers_1.Get)('/fetch/:id'),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "fetch", null);
__decorate([
    (0, routing_controllers_1.Get)('/buy/:id'),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __param(1, (0, routing_controllers_1.Param)('id')),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_1.default, String, Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "buy", null);
__decorate([
    (0, routing_controllers_1.Get)('/fetch'),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "fetchItemsFromUser", null);
MarketController = __decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.JsonController)('/market'),
    __metadata("design:paramtypes", [])
], MarketController);
exports.default = MarketController;
