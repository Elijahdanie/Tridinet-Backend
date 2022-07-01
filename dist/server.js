"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const users_1 = __importDefault(require("./models/users"));
const worlds_1 = __importDefault(require("./models/worlds"));
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = __importDefault(require("typedi"));
const auth_1 = __importDefault(require("./utils/auth"));
const Repository_1 = __importDefault(require("./models/Repository"));
const account_1 = __importDefault(require("./models/account"));
const transactions_1 = __importDefault(require("./models/transactions"));
const config_1 = __importDefault(require("./utils/config"));
(0, routing_controllers_1.useContainer)(typedi_1.default);
const app = (0, routing_controllers_1.createExpressServer)({
    currentUserChecker: async (action) => {
        const token = action.request.headers['authorization'];
        return auth_1.default.fetchUser(token);
    },
    authorizationChecker: (action) => {
        const token = action.request.headers['authorization'];
        return auth_1.default.authorizeUser(token);
    },
    classTransformer: false,
    cors: true,
    controllers: [__dirname + '/controllers/**/*{.ts,.js}']
});
config_1.default.addModels([
    users_1.default,
    worlds_1.default,
    Repository_1.default,
    account_1.default,
    transactions_1.default
]);
config_1.default.sync();
const server = (0, http_1.createServer)(app);
server.listen(3000, 'localhost', () => {
    console.log('Server is running on port 3000');
});
