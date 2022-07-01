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
const marketRepository_1 = __importDefault(require("../repository/marketRepository"));
const s3_1 = require("../utils/s3");
let RepositoryController = class RepositoryController {
    constructor() {
        this._marketRepository = new marketRepository_1.default();
    }
    async uploadPreview(file, user, payload, res) {
        try {
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const repoId = payload.id;
            const fileid = payload.itemId;
            const url = await this._marketRepository.saveItemToRepo(repoId, user.id, file, fileid);
            if (url == "") {
                return res.status(400).json({ success: false, message: "No url", data: "" });
            }
            const finalUrl = `https://api.tridinet.com/Repository/fetch/${url}`;
            return res.status(200).json({ success: true, message: "Preview uploaded", data: finalUrl });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
    async DownloadItem(id, res) {
        try {
            res.setHeader('Content-Disposition', `filename=${id}.png`);
            res.setHeader('Content-Type', 'image/png');
            return new Promise((resolve, reject) => {
                const readable = (0, s3_1.downLoadFile)(id);
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
};
__decorate([
    (0, routing_controllers_1.Post)('/upload'),
    __param(0, (0, routing_controllers_1.UploadedFile)('file')),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RepositoryController.prototype, "uploadPreview", null);
__decorate([
    (0, routing_controllers_1.Get)('/fetch/id'),
    __param(0, (0, routing_controllers_1.Param)('id')),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RepositoryController.prototype, "DownloadItem", null);
RepositoryController = __decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.JsonController)('/Repository'),
    __metadata("design:paramtypes", [])
], RepositoryController);
exports.default = RepositoryController;
