import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post-dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostExistPipe } from './pipes/post-exist-pipe';
import { Post as PostEntity } from './entities/post.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { currentUser } from 'src/auth/decorators/current-user.decorators';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe, PostExistPipe) id: number,
  ): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  create(
    @Body() dto: CreatePostDto,
    @currentUser() user: any,
  ): Promise<PostEntity> {
    return this.postsService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe, PostExistPipe) id: number,
    @Body() updatePostData: UpdatePostDto,
    @currentUser() user: any,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updatePostData, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe, PostExistPipe) id: number,
  ): Promise<void> {
    await this.postsService.remove(id);
  }
}
