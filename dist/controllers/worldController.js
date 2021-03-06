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
exports.WorldController = void 0;
const routing_controllers_1 = require("routing-controllers");
const uuid_1 = require("uuid");
const typedi_1 = require("typedi");
const worldRepository_1 = __importDefault(require("../repository/worldRepository"));
const tridinetResolver_1 = __importDefault(require("../repository/engine/tridinetResolver"));
const s3_1 = require("../utils/s3");
let WorldController = class WorldController {
    constructor(worldRepository) {
        this._worldRepository = worldRepository;
    }
    async create(file, user, payload, res) {
        try {
            if (!user) {
                return res.status(401).json({ success: false });
            }
            let { name, description, access, privateKey, type } = payload;
            if (!name || !description) {
                return res.status(400).send("Missing required fields");
            }
            let url = `tr://${name}.world`;
            const world = await this._worldRepository.create({
                id: (0, uuid_1.v4)(),
                name,
                description,
                userId: user.id,
                url,
                type: type ? type : "public",
                access: access ? access : "public",
                privateKey
            }, file);
            return res.status(200).json({ success: true, data: world });
        }
        catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Unable to process" });
        }
    }
    async update(file, user, payload, res) {
        try {
            if (!user) {
                return res.status(401).json({ success: false });
            }
            console.log(payload);
            let { id, description, access, privateKey, type } = payload;
            const world = await this._worldRepository.update(id, {
                description,
                type: type ? type : "public",
                access: access ? access : "public",
                privateKey
            }, file);
            return res.status(200).json({ success: true, data: world });
        }
        catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Unable to process" });
        }
    }
    async deleteWorld(id, user, res) {
        try {
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const result = await this._worldRepository.delete(id, user);
            return res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Unable to process" });
        }
    }
    async fetchRepoWorld(payloads, res) {
        try {
            const { url, id } = payloads;
            const world = tridinetResolver_1.default.ConstructRepoWord(url, id);
            return res.status(200).json({ success: true, data: world });
        }
        catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Unable to process" });
        }
    }
    async fetchAllWorlds(page, res) {
        try {
            const payload = await this._worldRepository.fetchAllWorlds(page);
            let finalPayloads = payload.data.map((world) => {
                return {
                    Name: world.name,
                    Description: 'A world Description',
                    url: world.url,
                    previewUri: "",
                };
            });
            return res.status(200).json({ success: true, total: payload.total, message: "Preview uploaded", data: finalPayloads });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Unable to process" });
        }
    }
    async fetchworldfile(payload, res) {
        try {
            const { url, password } = payload;
            if (!url) {
                return res.status(400).send("Missing required fields");
            }
            const data_r = await tridinetResolver_1.default.fetchWorldUri(url, password);
            if (!data_r) {
                return res.status(404).json({ success: false, message: "World not found" });
            }
            res.setHeader('Content-Disposition', `filename=${data_r}.png`);
            res.setHeader('Content-Type', 'image/png');
            return new Promise((resolve, reject) => {
                const readable = (0, s3_1.downLoadFile)(data_r);
                readable.pipe(res);
                readable.on('end', () => resolve(res));
                readable.on('error', (error) => reject(error));
            });
        }
        catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Unable to process" });
        }
    }
    async getWorld(user, payload, res) {
        try {
            const { url } = payload;
            if (!url) {
                return res.status(400).send("Missing required fields");
            }
            //   const data_r = await TridinetResolver.resolve(url);
            const worldPayloads = await this._worldRepository.fetch(url, user.id);
            return res.status(200).json({ success: true, data: worldPayloads });
        }
        catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Unable to process" });
        }
    }
};
__decorate([
    (0, routing_controllers_1.Post)("/create"),
    __param(0, (0, routing_controllers_1.UploadedFile)('file')),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WorldController.prototype, "create", null);
__decorate([
    (0, routing_controllers_1.Post)("/update"),
    __param(0, (0, routing_controllers_1.UploadedFile)('file')),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WorldController.prototype, "update", null);
__decorate([
    (0, routing_controllers_1.Delete)("/delete/:id"),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WorldController.prototype, "deleteWorld", null);
__decorate([
    (0, routing_controllers_1.Post)('/fetchRepoWorld'),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorldController.prototype, "fetchRepoWorld", null);
__decorate([
    (0, routing_controllers_1.Get)('/:page'),
    __param(0, (0, routing_controllers_1.Param)('page')),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WorldController.prototype, "fetchAllWorlds", null);
__decorate([
    (0, routing_controllers_1.Post)("/fetchworld"),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorldController.prototype, "fetchworldfile", null);
__decorate([
    (0, routing_controllers_1.Authorized)(),
    (0, routing_controllers_1.Post)("/fetch"),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WorldController.prototype, "getWorld", null);
WorldController = __decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.JsonController)("/world"),
    __metadata("design:paramtypes", [worldRepository_1.default])
], WorldController);
exports.WorldController = WorldController;
