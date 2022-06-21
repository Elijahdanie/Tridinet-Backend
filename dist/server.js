"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const sequelize_typescript_1 = require("sequelize-typescript");
const users_1 = __importDefault(require("./models/users"));
const worlds_1 = __importDefault(require("./models/worlds"));
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = __importDefault(require("typedi"));
const auth_1 = __importDefault(require("./utils/auth"));
const items_1 = __importDefault(require("./models/items"));
const account_1 = __importDefault(require("./models/account"));
const transactions_1 = __importDefault(require("./models/transactions"));
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
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'sqlite',
    storage: './tridinetdb.sqlite'
});
sequelize.addModels([
    users_1.default,
    worlds_1.default,
    items_1.default,
    account_1.default,
    transactions_1.default
]);
sequelize.sync();
const server = (0, http_1.createServer)(app);
server.listen(3000, 'localhost', () => {
    console.log('Server is running on port 3000');
});
