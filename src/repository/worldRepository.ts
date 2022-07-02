import { Service } from "typedi";
import Worlds from "../models/worlds";

@Service()
export default class WorldRepository {
    async delete (id: any) {
        const result = await Worlds.destroy({where:{id: id}});
        return result;
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
