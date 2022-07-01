import { Request, Response } from "express";
import { Body, CurrentUser, Delete, Get, JsonController, Param, Post, Req, Res, UploadedFile, UploadedFiles } from "routing-controllers";
import { Service } from "typedi";
import {v4 as uuid} from 'uuid';
import Users from "../models/users";
import MarketRepository from "../repository/marketRepository";
import { downLoadFile } from "../utils/s3";

@Service()
@JsonController('/market')
export default class MarketController {

  _marketRepository: MarketRepository;
  constructor(){
    this._marketRepository = new MarketRepository();
  }

  @Post('/upload/preview')
  async uploadPreview(@UploadedFile('file') file:any, @Body() payload: any,  @CurrentUser() user:any, @Res() res: Response) {
    try{
      if(!user)
      {
        return res.status(401).json({success:false, message:"Unauthorized"})
      }
      const id = payload.id;
      const validateItem = await this._marketRepository.savePreview(id, user.id, file);
      if(!validateItem)
      {
        return res.status(401).json({success:false, message:"Unauthorized"})
      }
      return res.status(200).json({success:true, message:"Preview uploaded"});
  }
  catch(error)
  {
    console.log(error);
    return res.status(500).json({success:false, message:"Internal server error"});
  }
  }

  @Post('/create')
  async createItem(@UploadedFile('file') file:any, @CurrentUser() user:any, @Body() payload: any, @Res() res: Response) {
    try{
      if(!user)
      {
        return res.status(401).json({success:false, message:"Unauthorized"})
      }
      const {name, description, cost } = payload;
      
      if(!name || !description || !cost)
      {
        return res.status(400).send("Missing required fields");
      }

      const item = await this._marketRepository.createItem({
        id: uuid(),
        name,
        description,
        cost,
        userId: user.id
      }, file, user);
      return res.status(200).json({success: true, data: item});
    }
    catch(error){
      console.log(error);
      return res.status(500).json({success: false, message: "Unable to process"});
    }
  }

  @Delete('/item/:id')
  async deleteItem(@CurrentUser() user:Users, @Param('id') id: string, @Res() res: Response) {
    try{
      if(!user)
      {
        return res.status(401).json({success:false, message:"Unauthorized"})
      }
      const item = await this._marketRepository.deleteItem(id, user);
      return res.status(200).json({success: true, message:item.message, data: !!item});
    }
    catch(error){
      console.log(error);
      return res.status(500).json({success: false, message: "Unable to process"});
    }
  }

  @Get('/preview/:id')
  async previewItem(@Param('id') id: string, @Res() res: Response) {
    try{
      const item = await this._marketRepository.fetchItem(id);
      res.setHeader('Content-Disposition', `filename=${item.previewUrl}.png`);
      res.setHeader('Content-Type', 'image/png');
      return new Promise<Response>((resolve, reject) => {
        const readable = downLoadFile(item.previewUrl);
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


  @Get('/item/:id')
  async fetchItem(@Param('id') id: string, @Res() res: Response) {
    try{
      const item = await this._marketRepository.fetchItem(id);
      res.setHeader('Content-Disposition', `filename=${item.manifestUrl}.png`);
      res.setHeader('Content-Type', 'image/png');
      return new Promise<Response>((resolve, reject) => {
        const readable = downLoadFile(item.manifestUrl);
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

  @Post('/update')
  async update(@CurrentUser() user:any, @Body() payload: any, @Res() res: Response) {
    try{
      const {id, name, description, fileUrl, previewUrl, cost } = payload;
      if(!id || !name || !description || !previewUrl || !cost)
      {
        return res.status(400).send("Missing required fields");
      }
      const item = await this._marketRepository.fetchItem(id);
      if(item.userId !== user.id)
      {
        return res.status(401).json({success:false});
      }
      await item.update({
        id,
        name,
        description,
        previewUrl,
        cost
      });
      return res.status(200).json({success: true, data: item});
    }
    catch(error){
      console.log(error);
      return res.status(500).json({success: false, message: "Unable to process"});
    }
  }

  @Get('/fetch/:id')
  async fetch(@Param('id') id: string, @Res() res: Response) {
    try{
      const item = await this._marketRepository.fetchItem(id);
      if(!item)
      {
        return res.status(404).send("Item not found");
      }
      const data = {
        id: item.id,
        name: item.name,
        description: item.description,
        previewUrl: item.previewUrl,
        cost: item.cost
      }
      return res.status(200).json({success: true, data});
    }
    catch(error){
      console.log(error);
      return res.status(500).json({success: false, message: "Unable to process"});
    }
  }

  @Get('/buy/:id')
  async buy(@CurrentUser() user:Users, @Param('id') id: string, @Res() res: Response) {
    try{
      if(!user)
      {
        return res.status(401).json({success:false});
      }
      const item = await this._marketRepository.fetchItem(id);
      if(!item)
      {
        return res.status(404).send("Item not found");
      }
      console.log(user.purchasedItems.includes(item.id));
      console.log(user.purchasedItems)
      const check = user.purchasedItems !== null ? user.purchasedItems.includes(item.id) : false;
      // if(item.userId === user.id || check)
      if(check)
      {
        return res.status(401).json({success:false, message:"You already own this item"});
      }
      const result = await this._marketRepository.buyItem(item, user);
      if(!result)
      {
        return res.status(401).json({success:false, message:"Insufficient oxygen"});
      }
      return res.status(200).json({success: true, data: result});
    }
    catch(error){
      console.log(error);
      return res.status(500).json({success: false, message: "Unable to process"});
    }
  }

  @Get('/fetch')
  async fetchItemsFromUser(@CurrentUser() user: any, @Res() res: Response) {
    try{
      if(!user)
      {
        return res.status(401).json({success:false});
      }
      const items = await this._marketRepository.fetchItemsFromUser(user.id);
  
      return res.status(200).json({success: true, data: items});
    }
    catch(error){
      console.log(error);
      return res.status(500).json({success: false, message: "Unable to process"});
    }
  }
}