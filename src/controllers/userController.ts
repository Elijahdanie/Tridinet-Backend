import UserRepository from '../repository/userRepository';
import { Body, CurrentUser, Get, JsonController, Post, Res } from 'routing-controllers';
import { Response } from 'express';
import {v4 as uuid} from 'uuid';
import { Service } from 'typedi';
import sha1 from 'sha1';
import Auth from '../utils/auth';
import Users from '../models/users';

@Service()
@JsonController('/user')
export default class UserController
{
    _userRepository: UserRepository;
    constructor(userRepository: UserRepository) {
        this._userRepository = userRepository;
    }

    @Post('/register')
    async register(@Body() payload: any, @Res() res: Response)
    {
        try {            
            let { name, email, password } = payload;
            if(!name || !email || !password)
            {
                return res.status(400).send('Missing required fields');
            }
            password = sha1(password);
            const user = await this._userRepository.create({id: uuid(),  name, email, password });
            return res.status(200).json({success: true, data:user});
        } catch (error) {
            console.log(error);
            return res.status(500).json({success: false, message:"Unable to process"});
        }
    }

    @Post('/login')
    async login(@Body() payload: any, @Res() res: Response)
    {
        try {
            let { email, password } = payload;
            if(!email || !password)
            {
                return res.status(400).send('Missing required fields');
            }
            password = sha1(password);
            const user = await this._userRepository.fetch({email, password});
            const token = Auth.generateToken(user);
            if(!user)
            {
                return res.status(400).send('Invalid credentials');
            }
            return res.status(200).json({success: true, data:{user, token}});
        } catch (error) {
            console.log(error);
            return res.status(500).json({success: false, message:"Unable to process"});
        }
    }

    @Get('/account')
    async fetchUserAccount(@CurrentUser() user:Users, @Res() res: Response)
    {
        try {
            if(!user)
            {
                return res.status(401).json({success:false, message:'Invalid credentials'});
            }
            const account = await this._userRepository.fetchAccount(user.accountId);
            return res.status(200).json({success: true, data:account});
        } catch (error) {
            console.log(error);
            res.status(500).json({success: false, message: 'Unable to process request'})
        }
    }

    @Get('/world')
    async getWorld(@CurrentUser() user:Users, @Res() res: Response)
    {
        try {
            const world = await this._userRepository.getWorld(user);
            return res.status(200).json({success: true, data:world});
        } catch (error) {
            console.log(error);
            return res.status(500).json({success: false, message:"Unable to process"});
        }

    }

    // @Post('/logout')
    // async logout(@Body() payload: any, @Res() res: Response)
    // {
    //     try {
    //         let { token } = payload;
    //         if(!token)
    //         {
    //             return res.status(400).send('Missing required fields');
    //         }
    //         return res.status(200).json({success: true, data:null});
    //     } catch (error) {
    //         console.log(error);
    //         return res.status(500).json({success: false, message:"Unable to process"});
    //     }
    // }
}
