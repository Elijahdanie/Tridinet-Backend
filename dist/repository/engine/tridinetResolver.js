"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const ioredis_1 = __importDefault(require("ioredis"));
const worlds_1 = __importDefault(require("../../models/worlds"));
const redis = new ioredis_1.default();
const repoWorld = fs_1.default.readFileSync('./repoworld.world', 'utf-8');
class TridinetResolver {
    static async fetchWorldUri(url, password) {
        try {
            if (!this.canUpdate(url)) {
                const datauri = this.geturlrecord(url);
                if (datauri) {
                    return datauri;
                }
            }
            else {
                const db_rec = await worlds_1.default.findOne({ where: { url: url } });
                if (db_rec) {
                    const result = await this.updateWorldRecord(url, db_rec.data);
                    return db_rec.data;
                }
                else {
                    return undefined;
                }
            }
        }
        catch (error) {
            console.log(error);
            return undefined;
        }
    }
    static ConstructRepoWord(url, id) {
        if (url === 'tr://repository.world') {
            const worldParsed = repoWorld.replace('manifestid', id);
            return worldParsed;
        }
        return "";
    }
    static async resolve(data) {
        let url = data.split('/');
        let domain = url[2];
        let name = domain.split('.')[0];
        // let track = 0;
        // let paths = [];
        // url.forEach(x=>{
        //     if(track > 2)
        //     {
        //         paths.push(x);
        //     }
        // })
        return {
            name
        };
    }
    static async geturlrecord(url) {
        try {
            const result = await redis.get(url);
            return result;
        }
        catch (error) {
            console.log(error);
            return undefined;
        }
    }
    static async canUpdate(url) {
        try {
            const result = await redis.get(`${url}_u`);
            return result == 'n' ? false : true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    static async updateRecord(url, update) {
        try {
            const result = await redis.set(`${url}_u`, update);
            return result;
        }
        catch (error) {
            console.log(error);
            return undefined;
        }
    }
    static async updateWorldRecord(url, data) {
        try {
            const result = await redis.set(url, data);
            if (result === 'OK') {
                this.updateRecord(url, 'n');
                return true;
            }
            return false;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
}
exports.default = TridinetResolver;
