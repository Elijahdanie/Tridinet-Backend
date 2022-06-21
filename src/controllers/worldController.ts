import {
  Body,
  Post,
  Res,
  JsonController,
  Get,
  CurrentUser,
} from "routing-controllers";
import { Response } from "express";
import { v4 as uuid } from "uuid";
import { Service } from "typedi";
import WorldRepository from "../repository/worldRepository";

@Service()
@JsonController("/world")
export class WorldController {
  _worldRepository: WorldRepository;
  constructor(worldRepository: WorldRepository) {
    this._worldRepository = worldRepository;
  }

  @Post("/create")
  async create(
    @CurrentUser() user: any,
    @Body() payload: any,
    @Res() res: Response
  ) {
    try {
      if(!user)
      {
        return res.status(401).json({success:false});
      }
      let { name, description, data, access, privateKey, type } = payload;
      if (!name || !description || !data) {
        return res.status(400).send("Missing required fields");
      }
      let url = `tr://${name}.world`;
      const world = await this._worldRepository.create({
        id: uuid(),
        name,
        description,
        userId: user.id,
        data,
        url,
        type: type ? type : "public",
        access: access ? access : "public",
        privateKey
      });
      return res.status(200).json({ success: true, data: world });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Unable to process" });
    }
  }

  @Post("/fetch")
  async getWorld(@Body() payload: any, @Res() res: Response) {
    try {
      const { url, password } = payload;
      if (!url) {
        return res.status(400).send("Missing required fields");
      }
    //   const data_r = await TridinetResolver.resolve(url);
      const worldPayloads = await this._worldRepository.fetch(url);
      return res.status(200).json({ success: true, data: worldPayloads });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Unable to process" });
    }
  }
}