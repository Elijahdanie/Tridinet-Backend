import { Service } from "typedi";
import Worlds from "../models/worlds";
import { uploadFile } from "../utils/s3";
import fs from 'fs';
import TridinetResolver from "./engine/tridinetResolver";

@Service()
export default class WorldRepository {

    fettchOffsetLimit(page, count) {
        let maxPages = Math.round(count / 10);

        let offset = (10 * page);
        let limit = offset + 10;
        if (page < maxPages) {
            if (limit > count) {
                limit = count;
            }
        }
        else {
            offset = ((page - 1) * 10) + 10;
            limit = count
        }
        return { offset: offset, limit: limit }
    }

    async fetchAllWorlds(page: number) {
        try {
            let count = await Worlds.count();
            let params = this.fettchOffsetLimit(page, count);
            const items = await Worlds.findAll(params);
            return {data:items, total:count};
        } catch (error) {
            console.log(error)
        }
    }
    async delete (id: any, user) {
        const result = await Worlds.findByPk(id);
        if(result.userId != user.id)
        {
            return false;
        }
        result.destroy();
        return true;
    }
    async update(id, payload: any){
        let data = await Worlds.findByPk(id);
        const result = await data.update(payload);
        TridinetResolver.updateRecord(result.url, 'y');
    }
    async fetch(url, userid): Promise<Worlds> {
        return await Worlds.findOne({ where: {url: url, userId:userid} });
    }

    async uploadS3(file, itemId): Promise<string> {
        // save file from upload
        // return file url
        let arrbuf = new ArrayBuffer(file.buffer.length);
        let view = new Uint8Array(arrbuf);
        for (let i = 0; i < file.buffer.length; i++) {
            view[i] = file.buffer[i];
        }
        const fileName = `${itemId}`;
        let filePath = `./temp/${fileName}`;
        //const writeFile = util.promisify(fs.writeFileSync);
        //const unlink = util.promisify(fs.unlinkSync);
        await fs.writeFileSync(filePath, view, 'binary');
        const SendData = await uploadFile(filePath, fileName);
        fs.unlinkSync(filePath);
        return SendData.Key;
        //return `http://localhost:3000/marlet/download/${fileName}`;
    }

    async create(world, file): Promise<Worlds> {
        const url = await this.uploadS3(file, world.id);
        world.data = url;
        return await Worlds.create(world);
    }
}
