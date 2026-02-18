import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Title must be a string' })
  @Length(3, 100, {
    message: 'Title must be between 3 and 100 characters',
  })
  @Transform(({ value }) => value.trim())
  title: string;

  @IsString({ message: 'Content must be a string' })
  @Length(10, 5000, {
    message: 'Content must be between 10 and 5000 characters',
  })
  @Transform(({ value }) => value.trim())
  content: string;

  @IsString({ message: 'Author name must be a string' })
  @Length(2, 50, {
    message: 'Author name must be between 2 and 50 characters',
  })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Author name can contain only letters and spaces',
  })
  @Transform(({ value }) => value.trim())
  authorName: string;
}
