import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { userDTO } from './dto/user.dto';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { postDTO } from './dto/post.dto';

const prisma = new PrismaClient();

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async createUser(userdata: userDTO, res: Response) {
    // TODO : 유효성 검사, 중복 확인
    const nickname: string = userdata.nickname;
    let message: string;

    const userFind = await prisma.user.findUnique({
      where: {
        nickname: nickname,
      },
    });

    if (userFind === null) {
      await prisma.user.create({
        data: {
          nickname: userdata.nickname,
        },
      });
      message = `${nickname} 유저 생성됨`;
    } else {
      message = `${nickname} 유저 이미 존재하여 로그인됨`;
    }
    res.cookie('nickname', userdata.nickname);
    // TODO : JWT토큰 발급 후 리턴
    return res.json({ success: 'true', message });
  }

  async writePost(postData: postDTO, res: Response, req: Request) {
    const nickname = req.cookies['nickname'];
    console.log(nickname);
    const user = await prisma.user.findUnique({
      where: {
        nickname: nickname,
      },
    });
    if (user === null) {
      throw new NotFoundException('존재하지 않은 유저');
    } else {
      await prisma.post.create({
        data: {
          author: {
            connect: {
              id: (await user).id,
            },
          },
          content: postData.content,
        },
      });
      return res.json({ success: 'true' });
    }
  }

  async findManyPost(lastId: number, res: Response) {
    const result = await prisma.post.findMany({
      take: 4,
      skip: lastId ? 1 : 0,
      ...(lastId && { cursor: { id: lastId } }),
    });
    return res.json(result);
  }

  async deleteByPostId(req: Request, res: Response, postId: number) {
    const nickname = req.cookies['nickname'];

    const user = prisma.user.findUnique({
      where: {
        nickname: nickname,
      },
    });

    const post = prisma.post.findUniqueOrThrow({
      where: {
        id: postId,
      },
    });

    if ((await user).id != (await post).authorId) {
      throw new ForbiddenException('요청 권한이 없습니다');
    }

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    return res.json({ success: 'true' });
  }
}
