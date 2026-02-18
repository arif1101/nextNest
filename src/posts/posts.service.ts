import { Injectable, NotFoundException } from '@nestjs/common';
import { PostInterface } from './interfaces/post.interface';

@Injectable()
export class PostsService {
  private posts: PostInterface[] = [
    {
      id: 1,
      title: 'First',
      content: 'First Post content',
      authorName: 'Sangam',
      createdAt: new Date(),
    },
  ];

  findAll(): PostInterface[] {
    return this.posts;
  }
  findOne(id: number): PostInterface {
    const singlePost = this.posts.find((post) => post.id === id);
    if (!singlePost) {
      throw new NotFoundException(`Post with ID ${id} is not found`);
    }
    return singlePost;
  }

  create(
    createPostData: Omit<PostInterface, 'id' | 'createdAt'>,
  ): PostInterface {
    const newPost: PostInterface = {
      id: this.getNextId(),
      ...createPostData,
      createdAt: new Date(),
    };
    this.posts.push(newPost);
    return newPost;
  }

  update(
    id: number,
    updatePostData: Partial<Omit<PostInterface, 'id' | 'createdAt'>>,
  ): PostInterface {
    const index = this.posts.findIndex((post) => post.id === id);

    if (index === -1) {
      throw new NotFoundException(`Post with ID ${id} is not found`);
    }

    const currentPost = this.posts[index];

    const updatedPost: PostInterface = {
      ...currentPost,
      ...updatePostData,
      createdAt: currentPost.createdAt,
    };

    this.posts[index] = updatedPost;

    return updatedPost;
  }

  remove(id: number): { message: string } {
    const currentDeleteIndex = this.posts.findIndex((post) => post.id === id);
    if (currentDeleteIndex === -1) {
      throw new NotFoundException(`Post with ID ${id} is not found`);
    }

    this.posts.splice(currentDeleteIndex, 1);
    return { message: `Post with ID ${id} has been deleted` };
  }

  private getNextId(): number {
    return this.posts.length > 0
      ? Math.max(...this.posts.map((post) => post.id)) + 1
      : 1;
  }
}
