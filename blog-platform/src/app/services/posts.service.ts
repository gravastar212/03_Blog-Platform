import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  postId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface CreateCommentDto {
  content: string;
  postId: string;
}

export interface PostsResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /**
   * Get all posts with pagination and filtering
   */
  getPosts(options?: {
    page?: number;
    limit?: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    search?: string;
    authorId?: string;
  }): Observable<PostsResponse> {
    let params = new HttpParams();
    
    if (options?.page) {
      params = params.set('page', options.page.toString());
    }
    if (options?.limit) {
      params = params.set('limit', options.limit.toString());
    }
    if (options?.status) {
      params = params.set('status', options.status);
    }
    if (options?.search) {
      params = params.set('search', options.search);
    }
    if (options?.authorId) {
      params = params.set('authorId', options.authorId);
    }

    return this.http.get<PostsResponse>(`${this.API_URL}/posts`, { params });
  }

  /**
   * Get a single post by ID
   */
  getPost(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.API_URL}/posts/${id}`);
  }

  /**
   * Create a new post
   */
  createPost(postData: CreatePostDto): Observable<Post> {
    return this.http.post<Post>(`${this.API_URL}/posts`, postData);
  }

  /**
   * Update an existing post
   */
  updatePost(id: string, postData: UpdatePostDto): Observable<Post> {
    return this.http.put<Post>(`${this.API_URL}/posts/${id}`, postData);
  }

  /**
   * Delete a post
   */
  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/posts/${id}`);
  }

  /**
   * Get comments for a specific post
   */
  getPostComments(postId: string, options?: {
    page?: number;
    limit?: number;
  }): Observable<{ data: Comment[]; total: number; page: number; limit: number }> {
    let params = new HttpParams();
    
    if (options?.page) {
      params = params.set('page', options.page.toString());
    }
    if (options?.limit) {
      params = params.set('limit', options.limit.toString());
    }

    return this.http.get<{ data: Comment[]; total: number; page: number; limit: number }>(
      `${this.API_URL}/comments/post/${postId}`, 
      { params }
    );
  }

  /**
   * Create a new comment
   */
  createComment(commentData: CreateCommentDto): Observable<Comment> {
    return this.http.post<Comment>(`${this.API_URL}/comments`, commentData);
  }

  /**
   * Update an existing comment
   */
  updateComment(id: string, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.API_URL}/comments/${id}`, { content });
  }

  /**
   * Delete a comment
   */
  deleteComment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/comments/${id}`);
  }

  /**
   * Get published posts (for public consumption)
   */
  getPublishedPosts(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Observable<PostsResponse> {
    return this.getPosts({
      ...options,
      status: 'PUBLISHED'
    });
  }

  /**
   * Search posts by title or content
   */
  searchPosts(query: string, options?: {
    page?: number;
    limit?: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  }): Observable<PostsResponse> {
    return this.getPosts({
      ...options,
      search: query
    });
  }
}
