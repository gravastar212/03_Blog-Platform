import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId: user.id,
    });
    return this.commentRepository.save(comment);
  }

  async findAll(): Promise<Comment[]> {
    return this.commentRepository.find({
      relations: ['user', 'post'],
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
        post: {
          id: true,
          title: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
        post: {
          id: true,
          title: true,
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async findByPost(postId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { postId },
      relations: ['user'],
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findByUser(userId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { userId },
      relations: ['post'],
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        post: {
          id: true,
          title: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    // Check if user is the comment owner or admin
    if (comment.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    Object.assign(comment, updateCommentDto);
    return this.commentRepository.save(comment);
  }

  async remove(id: string, user: User): Promise<void> {
    const comment = await this.findOne(id);

    // Check if user is the comment owner or admin
    if (comment.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
  }
}
