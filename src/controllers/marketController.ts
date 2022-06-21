import { Request, Response } from "express";
import { Body, CurrentUser, Get, JsonController, Param, Post, Req, Res, UploadedFile, UploadedFiles } from "routing-controllers";
import { Service } from "typedi";
import {v4 as uuid} from 'uuid';
import Users from "../models/users";
import MarketRepository from "../repository/marketRepository";

@Service()
@JsonController('/market')
export default class MarketController {

  _marketRepository: MarketRepository;
  constructor(){
    this._marketRepository = new MarketRepository();
  }

  @Post('/create')
  async createItem(@UploadedFile('file') file:any, @CurrentUser() user:any, @Body() payload: any, @Res() res: Response) {
    try{
      if(!user)
      {
        return res.status(401).json({success:false, message:"Unauthorized"})
      }
      const {name, description, fileUrl, previewUrl, cost, preview } = payload;
      
      if(!name || !description || !fileUrl || !previewUrl || !cost)
      {
        return res.status(400).send("Missing required fields");
      }
      const item = await this._marketRepository.createItem({
        id: uuid(),
        name,
        description,
        fileUrl,
        previewUrl,
        cost,
        userId: user.id
      });
      return res.status(200).json({success: true, data: item});
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
      if(!id || !name || !description || !fileUrl || !previewUrl || !cost)
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
        fileUrl,
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