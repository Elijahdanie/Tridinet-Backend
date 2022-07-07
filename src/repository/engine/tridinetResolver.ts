import fs from 'fs';


const repoWorld = fs.readFileSync('./repoworld.world', 'utf-8');

export default class TridinetResolver {

    static ConstructRepoWord(url: any, id: any) {
        if(url === 'tr://repository.world')
        {
            const worldParsed = repoWorld.replace('manifestid', id);
            return worldParsed;
        }
        return "";
    }
    static async resolve(data: string): Promise<Object> {
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
        }
    }


    static async resolveWord(data)
    {
        //check all assets and verify ownership
    }
}
