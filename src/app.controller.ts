import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { userDTO } from './dto/user.dto';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { postDTO } from './dto/post.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('user/login')
  async login(@Body() userdata: userDTO, @Res() res: Response) {
    return await this.appService.createUser(userdata, res);
  }

  @Post('user/post')
  async writePost(
    @Body() postData: postDTO,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return this.appService.writePost(postData, res, req);
  }

  @Get('user/post')
  async getPost(@Query('lastId') lastId, @Res() res: Response) {
    console.log(typeof lastId);
    return this.appService.findManyPost(parseInt(lastId), res);
  }

  @Delete('user/post')
  async deletePost(
    @Req() req: Request,
    @Res() res: Response,
    @Query('postId') postId,
  ) {
    return this.appService.deleteByPostId(req, res, parseInt(postId));
  }
}
