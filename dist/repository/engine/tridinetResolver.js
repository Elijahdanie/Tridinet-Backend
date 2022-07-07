"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const repoWorld = fs_1.default.readFileSync('./repoworld.world', 'utf-8');
class TridinetResolver {
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
    static async resolveWord(data) {
        //check all assets and verify ownership
    }
}
exports.default = TridinetResolver;
