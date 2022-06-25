import { createServer } from "http";
import Users from "./models/users";
import Worlds from "./models/worlds";
import { createExpressServer, useContainer, Action } from "routing-controllers";
import Container from "typedi";
import Auth from './utils/auth';
import Items from "./models/items";
import Account from "./models/account";
import Transactions from "./models/transactions";
import sequelize from "./utils/config";

useContainer(Container)
const app = createExpressServer({
    currentUserChecker: async (action: Action) => {
        const token = action.request.headers['authorization'];
        return Auth.fetchUser(token);
    },
    authorizationChecker: (action: Action) => {
        const token = action.request.headers['authorization'];
        return Auth.authorizeUser(token);
    },
    classTransformer: false,
    cors: true,
    controllers: [__dirname + '/controllers/**/*{.ts,.js}']
});

sequelize.addModels([
    Users,
    Worlds,
    Items,
    Account,
    Transactions
])

sequelize.sync()

const server = createServer(app);
server.listen(3000, 'localhost', ()=>{
    console.log('Server is running on port 3000');
})
