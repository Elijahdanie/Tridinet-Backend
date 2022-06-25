"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TridinetResolver {
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
