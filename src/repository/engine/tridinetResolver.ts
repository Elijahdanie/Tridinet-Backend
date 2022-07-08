import fs from 'fs';
import Redis from 'ioredis';
import Worlds from '../../models/worlds';
import { downLoadFile } from '../../utils/s3';

const redis = new Redis();

const repoWorld = fs.readFileSync('./repoworld.world', 'utf-8');

export default class TridinetResolver {
    static async fetchWorldUri(url: any, password: any) {
        try {
            if (!this.canUpdate(url)) {
                const datauri = this.geturlrecord(url);
                if (datauri) {
                    return datauri;
                }
            }
            else
            {
                const db_rec = await Worlds.findOne({ where: {url: url} });
                if(db_rec)
                {
                    await this.updateWorldRecord(url, db_rec.data);
                }
                else
                {
                    return undefined;
                }
            }
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

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

    static async geturlrecord(url)
    {
        try {
            const result = await redis.get(url);
            return result;
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    static async canUpdate(url)
    {
        try {
            const result = await redis.get(`${url}_u`);
            return result == 'n'?false:true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }

    static async updateRecord(url, update:string){
        try {
            const result = await redis.set(`${url}_u`, update);
            return result;
        }
        catch (error) {
            console.log(error);
            return undefined;
        }
    }

    static async updateWorldRecord(url, data){
        try {
            const result = await redis.set(url, data);
            if(result === 'OK')
            {
                this.updateRecord(url, 'n');
                return true;
            }
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}
