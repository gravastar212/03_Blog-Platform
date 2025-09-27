import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { PostsService, Post, Comment } from '../../services/posts.service';

@Component({
  selector: 'app-post-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss'
})
export class PostDetail implements OnInit, OnDestroy {
  post: Post | null = null;
  comments: Comment[] = [];
  isLoading = true;
  loadingComments = false;
  error: string | null = null;
  commentsError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postsService: PostsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const postId = params['id'];
      if (postId) {
        this.loadPost(postId);
        this.loadComments(postId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPost(postId: string): void {
    this.isLoading = true;
    this.error = null;

    this.postsService.getPost(postId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (post: Post) => {
          this.post = post;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading post:', error);
          this.error = 'Failed to load post. Please try again.';
          this.isLoading = false;
          this.snackBar.open(this.error, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  loadComments(postId: string): void {
    this.loadingComments = true;
    this.commentsError = null;

    this.postsService.getPostComments(postId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.comments = response.data;
          this.loadingComments = false;
        },
        error: (error) => {
          console.error('Error loading comments:', error);
          this.commentsError = 'Failed to load comments.';
          this.loadingComments = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PUBLISHED':
        return 'primary';
      case 'DRAFT':
        return 'accent';
      case 'ARCHIVED':
        return 'warn';
      default:
        return 'primary';
    }
  }
}
