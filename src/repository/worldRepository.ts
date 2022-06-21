import { Service } from "typedi";
import Worlds from "../models/worlds";

@Service()
export default class WorldRepository {
    async fetch(url): Promise<Worlds> {
        return await Worlds.findOne({ where: {url: url} });
    }

    async create(world): Promise<Worlds> {
        return await Worlds.create(world);
    }
}
