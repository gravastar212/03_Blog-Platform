import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class PostInfoDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  constructor(partial: Partial<PostInfoDto>) {
    Object.assign(this, partial);
  }
}

export class CommentResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  postId: string;

  @Expose()
  userId: string;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  @Type(() => PostInfoDto)
  post: PostInfoDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<CommentResponseDto>) {
    Object.assign(this, partial);
  }
}
