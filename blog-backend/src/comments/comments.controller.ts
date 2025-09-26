import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { Comment } from './entities/comment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: { user: User },
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.create(
      createCommentDto,
      req.user,
    );
    return new CommentResponseDto(comment);
  }

  @Get()
  async findAll(): Promise<CommentResponseDto[]> {
    const comments = await this.commentsService.findAll();
    return comments.map((comment) => new CommentResponseDto(comment));
  }

  @Get('my-comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  async findMyComments(
    @Request() req: { user: User },
  ): Promise<CommentResponseDto[]> {
    const comments = await this.commentsService.findByUser(req.user.id);
    return comments.map((comment) => new CommentResponseDto(comment));
  }

  @Get('post/:postId')
  async findByPost(
    @Param('postId') postId: string,
  ): Promise<CommentResponseDto[]> {
    const comments = await this.commentsService.findByPost(postId);
    return comments.map((comment) => new CommentResponseDto(comment));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CommentResponseDto> {
    const comment = await this.commentsService.findOne(id);
    return new CommentResponseDto(comment);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: { user: User },
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.update(
      id,
      updateCommentDto,
      req.user,
    );
    return new CommentResponseDto(comment);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<void> {
    return this.commentsService.remove(id, req.user);
  }
}
