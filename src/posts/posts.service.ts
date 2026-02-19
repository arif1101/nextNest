import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post-dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find();
  }

  async findOne(id: number): Promise<Post> {
    const singlePost = await this.postsRepository.findOneBy({ id });
    if (!singlePost) {
      throw new NotFoundException(`Post with ID ${id} is not found`);
    }
    return singlePost;
  }

  async create(createPostData: CreatePostDto): Promise<Post> {
    const newPost = this.postsRepository.create({
      title: createPostData.title,
      content: createPostData.content,
      authorName: createPostData.authorName,
    });
    return this.postsRepository.save(newPost);
  }

  async update(id: number, updatePostData: UpdatePostDto): Promise<Post> {
    const findPostToUpdate = await this.findOne(id);

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
