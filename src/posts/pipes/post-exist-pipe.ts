/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { PostsService } from '../posts.service';

@Injectable()
export class PostExistPipe implements PipeTransform {
  constructor(private readonly postService: PostsService) {}
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      this.postService.findOne(value);
    } catch (e) {
      throw new NotFoundException(`Post with ID ${value} not found `);
    }
    return value;
  }
}
