"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const node_env = process.env.NODE_ENV;
const sequelize = (node_env === 'dev') ? new sequelize_typescript_1.Sequelize({
    dialect: 'sqlite',
    storage: './tridinetdb.sqlite',
}) : (node_env === 'prod') ?
    new sequelize_typescript_1.Sequelize(process.env.DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
        dialect: 'mysql'
    }) : null;
exports.default = sequelize;
