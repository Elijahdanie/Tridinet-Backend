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
  UploadedFile,
  Authorized,
} from "routing-controllers";
import { Response } from "express";
import { v4 as uuid } from "uuid";
import { Service } from "typedi";
import WorldRepository from "../repository/worldRepository";
import Worlds from "../models/worlds";
import TridinetResolver from "../repository/engine/tridinetResolver";
import { downLoadFile, uploadFile } from "../utils/s3";

@Service()
@JsonController("/world")
export class WorldController {
  _worldRepository: WorldRepository;
  constructor(worldRepository: WorldRepository) {
    this._worldRepository = worldRepository;
  }

  @Post("/create")
  async create(@UploadedFile('file') file:any,
    @CurrentUser() user: any,
    @Body() payload: any,
    @Res() res: Response
  ) {
    try {
      if(!user)
      {
        return res.status(401).json({success:false});
      }
      let { name, description, access, privateKey, type } = payload;
      if (!name || !description) {
        return res.status(400).send("Missing required fields");
      }
      let url = `tr://${name}.world`;
      const world = await this._worldRepository.create({
        id: uuid(),
        name,
        description,
        userId: user.id,
        url,
        type: type ? type : "public",
        access: access ? access : "public",
        privateKey
      }, file);
      return res.status(200).json({ success: true, data: world });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Unable to process" });
    }
  }

  @Post("/update")
  async update(
    @UploadedFile('file') file:any,
    @CurrentUser() user: any,
    @Body() payload: any,
    @Res() res: Response
  ) {
    try {
      if(!user)
      {
        return res.status(401).json({success:false});
      }
      console.log(payload);
      let {id, description, access, privateKey, type } = payload;
      const world = await this._worldRepository.update(id, {
        description,
        type: type ? type : "public",
        access: access ? access : "public",
        privateKey
      }, file);
      return res.status(200).json({ success: true, data: world });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Unable to process" });
    }
  }  

  @Delete("/delete/:id")
  async deleteWorld(@Param('id') id: string, @CurrentUser() user:any, @Res() res: Response) {
    try {
      if(!user)
      {
        return res.status(401).json({success:false, message:"Unauthorized"});
      }
      const result = await this._worldRepository.delete(id, user);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Unable to process" });
    }
  }


  @Post('/fetchRepoWorld')
  async fetchRepoWorld(@Body() payloads:any, @Res() res: Response) {
    try {
      const {url, id} = payloads;
      const world = TridinetResolver.ConstructRepoWord(url, id);
      return res.status(200).json({ success: true, data: world });
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

  @Post("/fetchworld")
  async fetchworldfile(@Body() payload: any, @Res() res: Response) {
    try {
      const { url, password } = payload;
      if (!url) {
        return res.status(400).send("Missing required fields");
      }
      const data_r = await TridinetResolver.fetchWorldUri(url, password);
      if(!data_r)
      {
        return res.status(404).json({success:false, message:"World not found"});
      }
      res.setHeader('Content-Disposition', `filename=${data_r}.png`);
      res.setHeader('Content-Type', 'image/png');
      return new Promise<Response>((resolve, reject) => {
        const readable = downLoadFile(data_r);
        readable.pipe(res);
        readable.on('end', () => resolve(res));
        readable.on('error', (error) => reject(error));
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Unable to process" });
    }
  }

  @Authorized()
  @Post("/fetch")
  async getWorld(@CurrentUser() user:any, @Body() payload: any, @Res() res: Response) {
    try {
      const { url } = payload;
      if (!url) {
        return res.status(400).send("Missing required fields");
      }
    //   const data_r = await TridinetResolver.resolve(url);
      const worldPayloads = await this._worldRepository.fetch(url, user.id);
      return res.status(200).json({ success: true, data: worldPayloads });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Unable to process" });
    }
  }
}
