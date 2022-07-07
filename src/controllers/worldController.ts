import {
  Body,
  Post,
  Res,
  JsonController,
  Get,
  CurrentUser,
  Put,
  Delete,
  Param,
} from "routing-controllers";
import { Response } from "express";
import { v4 as uuid } from "uuid";
import { Service } from "typedi";
import WorldRepository from "../repository/worldRepository";
import Worlds from "../models/worlds";

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

  @Put("/update")
  async update(
    @CurrentUser() user: any,
    @Body() payload: any,
    @Res() res: Response
  ) {
    try {
      if(!user)
      {
        return res.status(401).json({success:false});
      }
      let {id, name, description, data, access, privateKey, type } = payload;
      if (!name || !description || !data) {
        return res.status(400).send("Missing required fields");
      }
      let url = `tr://${name}.world`;
      const world = await this._worldRepository.update(id, {
        name,
        description,
        data,
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

  @Delete("/delete/:id")
  async deleteWorld(@Param('id') id: any, @CurrentUser() user:any, @Res() res: Response) {
    try {
      const result = await this._worldRepository.delete(id, user);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Unable to process" });
    }
  }


  
  @Get('/:page')
  async fetchAllWorlds(@Param('page') page:number, @Res() res:any){
    try{
      const payload = await this._worldRepository.fetchAllWorlds(page);
      let finalPayloads = payload.data.map((world:Worlds)=>{
        return {
          Name: world.name,
          Description:'A world Description',
          url:world.url,
          previewUri:"",
        }
      });
      return res.status(200).json({success:true, total: payload.total, message:"Preview uploaded", data:finalPayloads});
    }
    catch(error){
      console.log(error);
      return res.status(500).json({success: false, message: "Unable to process"});
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
