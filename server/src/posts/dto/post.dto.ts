import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  image?: string;
}

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
