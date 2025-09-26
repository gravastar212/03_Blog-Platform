import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Comment {
  id: string;
  content: string;
  postId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
  post: {
    id: string;
    title: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentRequest {
  content: string;
  postId: string;
}

export interface UpdateCommentRequest {
  content?: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /**
   * Get all comments with optional pagination and filtering
   */
  getComments(options?: {
    page?: number;
    limit?: number;
    postId?: string;
    userId?: string;
  }): Observable<CommentsResponse> {
    let params = new HttpParams();
    
    if (options?.page) {
      params = params.set('page', options.page.toString());
    }
    if (options?.limit) {
      params = params.set('limit', options.limit.toString());
    }
    if (options?.postId) {
      params = params.set('postId', options.postId);
    }
    if (options?.userId) {
      params = params.set('userId', options.userId);
    }

    return this.http.get<Comment[]>(`${this.API_URL}/comments`, { params })
      .pipe(
        map(comments => ({
          comments,
          total: comments.length,
          page: options?.page || 1,
          limit: options?.limit || 10
        }))
      );
  }

  /**
   * Get comments for a specific post
   */
  getCommentsByPost(postId: string, options?: {
    page?: number;
    limit?: number;
  }): Observable<CommentsResponse> {
    return this.http.get<Comment[]>(`${this.API_URL}/comments/post/${postId}`, {
      params: options ? new HttpParams({
        fromObject: Object.entries(options).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      }) : undefined
    }).pipe(
      map(comments => ({
        comments,
        total: comments.length,
        page: options?.page || 1,
        limit: options?.limit || 10
      }))
    );
  }

  /**
   * Get a single comment by ID
   */
  getComment(id: string): Observable<Comment> {
    return this.http.get<Comment>(`${this.API_URL}/comments/${id}`);
  }

  /**
   * Get current user's comments
   */
  getMyComments(options?: {
    page?: number;
    limit?: number;
  }): Observable<CommentsResponse> {
    return this.http.get<Comment[]>(`${this.API_URL}/comments/my-comments`, {
      params: options ? new HttpParams({
        fromObject: Object.entries(options).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      }) : undefined
    }).pipe(
      map(comments => ({
        comments,
        total: comments.length,
        page: options?.page || 1,
        limit: options?.limit || 10
      }))
    );
  }

  /**
   * Create a new comment
   */
  createComment(commentData: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.API_URL}/comments`, commentData);
  }

  /**
   * Update an existing comment
   */
  updateComment(id: string, commentData: UpdateCommentRequest): Observable<Comment> {
    return this.http.patch<Comment>(`${this.API_URL}/comments/${id}`, commentData);
  }

  /**
   * Delete a comment
   */
  deleteComment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/comments/${id}`);
  }

  /**
   * Get comment statistics for current user
   */
  getMyCommentStats(): Observable<{
    total: number;
    recent: number;
  }> {
    return this.getMyComments().pipe(
      map(response => {
        const comments = response.comments;
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return {
          total: comments.length,
          recent: comments.filter(comment => 
            new Date(comment.createdAt) > oneWeekAgo
          ).length
        };
      })
    );
  }
}