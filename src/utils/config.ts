import {Sequelize} from 'sequelize-typescript';
import {config} from 'dotenv';


config();
const node_env = process.env.NODE_ENV;
const sequelize : Sequelize =  (node_env === 'development') ? new Sequelize({
        dialect: 'sqlite',
        storage: './tridinetdb.sqlite',
    }) : (node_env === 'production') ?
    new Sequelize(process.env.DATABASE, process.env.DB_PORT, process.env.DB_PASSWORD, {
        dialect: 'mysql'
      }) : null;

export default sequelize;
