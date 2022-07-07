import { Service } from "typedi";
import Worlds from "../models/worlds";

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
        return await data.update(payload);
    }
    async fetch(url): Promise<Worlds> {
        return await Worlds.findOne({ where: {url: url} });
    }

    async create(world): Promise<Worlds> {
        return await Worlds.create(world);
    }
}
