import { Response } from "express";
import { Authorized, Body, CurrentUser, Get, JsonController, Param, Post, Res, UploadedFile } from "routing-controllers";
import { Service } from "typedi";
import MarketRepository from "../repository/marketRepository";
import { downLoadFile } from "../utils/s3";
import {v4 as uuid} from 'uuid';

@Service()
@JsonController('/Repository')
export default class RepositoryController {

    _marketRepository: MarketRepository;
    constructor(){
      this._marketRepository = new MarketRepository();
    }

    @Post('/upload')
    async createRepository(@UploadedFile('file') file:any, @CurrentUser() user:any, @Body() payload: any, @Res() res: Response) {
      try{
        if(!user){
            return res.status(401).json({success:false, message:"Unauthorized"})
        }
        const assetId = payload.id;
        const url = await this._marketRepository.saveItemToRepo(assetId, user.id, file);
        if(url == "")
        {
          return res.status(400).json({success:false, message:"No url", data:""});
        }
        const finalUrl = `https://api.tridinet.com/Repository/fetch/${url}`;
        return res.status(200).json({success:true, message:"Preview uploaded", data:finalUrl});
    }
    catch(error)
    {
      console.log(error);
      return res.status(500).json({success:false, message:"Internal server error"});
    }
    }

    @Get('/:page')
    async fetchAlRepo(@Param('page') page:number, @Res() res:any){
      try{
        const payload = await this._marketRepository.fetchRepos(page);
        return res.status(200).json({success:true, total:payload.total, message:"Preview uploaded", data:payload.data});
      }
      catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: "Unable to process"});
      }
    }

    @Get('/fetch/:id')
    async DownloadItem(@Param('id') id: string, @Res() res: Response){
        try{
            res.setHeader('Content-Disposition', `filename=${id}.png`);
            res.setHeader('Content-Type', 'image/png');
            return new Promise<Response>((resolve, reject) => {
              const readable = downLoadFile(id);
              readable.pipe(res);
              readable.on('end', () => resolve(res));
              readable.on('error', (error) => reject(error));
            });
          }
          catch(error){
            console.log(error);
            return res.status(500).json({success: false, message: "Unable to process"});
          }
    }
}