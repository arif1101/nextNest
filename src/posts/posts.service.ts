/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post-dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User, UserRole } from 'src/auth/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: ['authorName'],
    });
  }

  async findOne(id: number): Promise<Post> {
    const singlePost = await this.postsRepository.findOne({
      where: { id },
      relations: ['authorName'],
    });
    if (!singlePost) {
      throw new NotFoundException(`Post with ID ${id} is not found`);
    }
    return singlePost;
  }

  async create(createPostData: CreatePostDto, authorName: User): Promise<Post> {
    const newPost = this.postsRepository.create({
      title: createPostData.title,
      content: createPostData.content,
      authorName,
    });
    return this.postsRepository.save(newPost);
  }

  async update(
    id: number,
    updatePostData: UpdatePostDto,
    user: User,
  ): Promise<Post> {
    const findPostToUpdate = await this.findOne(id);

    if (
      findPostToUpdate.authorName.id !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You can only update your own posts');
    }

    if (updatePostData.title) {
      findPostToUpdate.title = updatePostData.title;
    }

    if (updatePostData.content) {
      findPostToUpdate.title = updatePostData.content;
    }
    return this.postsRepository.save(findPostToUpdate);
  }

  async remove(id: number): Promise<void> {
    console.log(id);
    const findPostToDelete = await this.findOne(id);
    await this.postsRepository.delete(findPostToDelete.id);
  }
}
