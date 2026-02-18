import { IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePostDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @Length(3, 100, {
    message: 'Title must be between 3 and 100 characters',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value?.trim() : value,
  )
  title?: string;

  @IsOptional()
  @IsString({ message: 'Content must be a string' })
  @Length(10, 5000, {
    message: 'Content must be between 10 and 5000 characters',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value?.trim() : value,
  )
  content?: string;
}
