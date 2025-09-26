import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Post {
  id: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /**
   * Get all posts with optional pagination and filtering
   */
  getPosts(options?: {
    page?: number;
    limit?: number;
    status?: 'DRAFT' | 'PUBLISHED';
    authorId?: string;
    search?: string;
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
    if (options?.authorId) {
      params = params.set('authorId', options.authorId);
    }
    if (options?.search) {
      params = params.set('search', options.search);
    }

    return this.http.get<Post[]>(`${this.API_URL}/posts`, { params })
      .pipe(
        map(posts => ({
          posts,
          total: posts.length,
          page: options?.page || 1,
          limit: options?.limit || 10
        }))
      );
  }

  /**
   * Get published posts only
   */
  getPublishedPosts(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Observable<PostsResponse> {
    return this.getPosts({ ...options, status: 'PUBLISHED' });
  }

  /**
   * Get a single post by ID
   */
  getPost(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.API_URL}/posts/${id}`);
  }

  /**
   * Get posts by a specific author
   */
  getPostsByAuthor(authorId: string, options?: {
    page?: number;
    limit?: number;
    status?: 'DRAFT' | 'PUBLISHED';
  }): Observable<PostsResponse> {
    return this.getPosts({ ...options, authorId });
  }

  /**
   * Get current user's posts
   */
  getMyPosts(options?: {
    page?: number;
    limit?: number;
    status?: 'DRAFT' | 'PUBLISHED';
  }): Observable<PostsResponse> {
    return this.http.get<Post[]>(`${this.API_URL}/posts/my-posts`, {
      params: options ? new HttpParams({
        fromObject: Object.entries(options).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      }) : undefined
    }).pipe(
      map(posts => ({
        posts,
        total: posts.length,
        page: options?.page || 1,
        limit: options?.limit || 10
      }))
    );
  }

  /**
   * Create a new post
   */
  createPost(postData: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(`${this.API_URL}/posts`, postData);
  }

  /**
   * Update an existing post
   */
  updatePost(id: string, postData: UpdatePostRequest): Observable<Post> {
    return this.http.patch<Post>(`${this.API_URL}/posts/${id}`, postData);
  }

  /**
   * Delete a post
   */
  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/posts/${id}`);
  }

  /**
   * Search posts by title or content
   */
  searchPosts(query: string, options?: {
    page?: number;
    limit?: number;
    status?: 'DRAFT' | 'PUBLISHED';
  }): Observable<PostsResponse> {
    return this.getPosts({ ...options, search: query });
  }

  /**
   * Get posts by status
   */
  getPostsByStatus(status: 'DRAFT' | 'PUBLISHED', options?: {
    page?: number;
    limit?: number;
  }): Observable<PostsResponse> {
    return this.getPosts({ ...options, status });
  }

  /**
   * Get recent posts (last 10 published posts)
   */
  getRecentPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/posts/published`)
      .pipe(
        map(posts => posts.slice(0, 10)) // Limit to 10 most recent
      );
  }

  /**
   * Get post statistics for current user
   */
  getMyPostStats(): Observable<{
    total: number;
    published: number;
    drafts: number;
  }> {
    return this.getMyPosts().pipe(
      map(response => {
        const posts = response.posts;
        return {
          total: posts.length,
          published: posts.filter(post => post.status === 'PUBLISHED').length,
          drafts: posts.filter(post => post.status === 'DRAFT').length
        };
      })
    );
  }
}