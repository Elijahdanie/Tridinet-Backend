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
const userRepository_1 = __importDefault(require("../repository/userRepository"));
const routing_controllers_1 = require("routing-controllers");
const uuid_1 = require("uuid");
const typedi_1 = require("typedi");
const sha1_1 = __importDefault(require("sha1"));
const auth_1 = __importDefault(require("../utils/auth"));
const users_1 = __importDefault(require("../models/users"));
let UserController = class UserController {
    constructor(userRepository) {
        this._userRepository = userRepository;
    }
    async register(payload, res) {
        try {
            let { name, email, password } = payload;
            if (!name || !email || !password) {
                return res.status(400).send('Missing required fields');
            }
            password = (0, sha1_1.default)(password);
            const user = await this._userRepository.create({ id: (0, uuid_1.v4)(), name, email, password });
            return res.status(200).json({ success: true, data: user });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Unable to process" });
        }
    }
    async login(payload, res) {
        try {
            let { email, password } = payload;
            if (!email || !password) {
                return res.status(400).send('Missing required fields');
            }
            password = (0, sha1_1.default)(password);
            const user = await this._userRepository.fetch({ email, password });
            const token = auth_1.default.generateToken(user);
            if (!user) {
                return res.status(400).send('Invalid credentials');
            }
            return res.status(200).json({ success: true, data: { user, token } });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Unable to process" });
        }
    }
    async fetchUserAccount(user, res) {
        try {
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            const account = await this._userRepository.fetchAccount(user.accountId);
            return res.status(200).json({ success: true, data: account });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: 'Unable to process request' });
        }
    }
    async getWorld(user, res) {
        try {
            const world = await this._userRepository.getWorld(user);
            return res.status(200).json({ success: true, data: world });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Unable to process" });
        }
    }
};
__decorate([
    (0, routing_controllers_1.Post)('/register'),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, routing_controllers_1.Post)('/login'),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    (0, routing_controllers_1.Get)('/account'),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_1.default, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "fetchUserAccount", null);
__decorate([
    (0, routing_controllers_1.Get)('/world'),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_1.default, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getWorld", null);
UserController = __decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.JsonController)('/user'),
    __metadata("design:paramtypes", [userRepository_1.default])
], UserController);
exports.default = UserController;
