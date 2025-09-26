import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { PostsService, Post } from '../../services/posts.service';
import { CommentsService, Comment, CreateCommentRequest } from '../../services/comments.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss'
})
export class PostDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  post: Post | null = null;
  comments: Comment[] = [];
  
  // State
  isLoading = false;
  isLoadingComments = false;
  error: string | null = null;
  currentUser: any = null;
  isAuthenticated = false;

  // Comment form
  commentForm: FormGroup;
  isSubmittingComment = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalComments = 0;
  hasMoreComments = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postsService: PostsService,
    private commentsService: CommentsService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.initializeAuth();
    this.loadPostAndComments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeAuth(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

  private loadPostAndComments(): void {
    this.route.params.pipe(
      switchMap(params => {
        const postId = params['id'];
        if (!postId) {
          throw new Error('Post ID is required');
        }

        this.isLoading = true;
        this.error = null;

        // Load post and comments in parallel
        return forkJoin({
          post: this.postsService.getPost(postId),
          comments: this.commentsService.getCommentsByPost(postId, {
            page: this.currentPage,
            limit: this.pageSize
          })
        });
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.post = data.post;
        this.comments = data.comments.comments;
        this.totalComments = data.comments.total;
        this.hasMoreComments = this.comments.length < this.totalComments;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading post and comments:', error);
        this.error = 'Failed to load post. Please try again.';
        this.isLoading = false;
        this.snackBar.open('Failed to load post', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  loadMoreComments(): void {
    if (this.isLoadingComments || !this.post) return;

    this.currentPage++;
    this.isLoadingComments = true;

    this.commentsService.getCommentsByPost(this.post.id, {
      page: this.currentPage,
      limit: this.pageSize
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.comments = [...this.comments, ...response.comments];
        this.hasMoreComments = this.comments.length < this.totalComments;
        this.isLoadingComments = false;
      },
      error: (error) => {
        console.error('Error loading more comments:', error);
        this.currentPage--; // Revert page increment on error
        this.isLoadingComments = false;
        this.snackBar.open('Failed to load more comments', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onSubmitComment(): void {
    if (this.commentForm.valid && this.post && this.isAuthenticated) {
      this.isSubmittingComment = true;

      const commentData: CreateCommentRequest = {
        content: this.commentForm.value.content,
        postId: this.post.id
      };

      this.commentsService.createComment(commentData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (newComment) => {
          this.comments.unshift(newComment);
          this.totalComments++;
          this.commentForm.reset();
          this.isSubmittingComment = false;
          this.snackBar.open('Comment added successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        },
        error: (error) => {
          console.error('Error creating comment:', error);
          this.isSubmittingComment = false;
          this.snackBar.open('Failed to add comment', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  deleteComment(comment: Comment): void {
    if (!this.canDeleteComment(comment)) {
      this.snackBar.open('You do not have permission to delete this comment', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentsService.deleteComment(comment.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== comment.id);
          this.totalComments--;
          this.snackBar.open('Comment deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
          this.snackBar.open('Failed to delete comment', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  canEditPost(): boolean {
    return !!(this.isAuthenticated && this.post && 
           (this.currentUser?.role === 'ADMIN' || this.currentUser?.id === this.post.authorId));
  }

  canDeletePost(): boolean {
    return !!(this.isAuthenticated && this.post && 
           (this.currentUser?.role === 'ADMIN' || this.currentUser?.id === this.post.authorId));
  }

  canDeleteComment(comment: Comment): boolean {
    return this.isAuthenticated && 
           (this.currentUser?.role === 'ADMIN' || this.currentUser?.id === comment.userId);
  }

  formatDate(date: Date | string): string {
    const postDate = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return postDate.toLocaleDateString();
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PUBLISHED':
        return 'primary';
      case 'DRAFT':
        return 'accent';
      default:
        return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PUBLISHED':
        return 'visibility';
      case 'DRAFT':
        return 'edit';
      default:
        return 'article';
    }
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }

  editPost(): void {
    if (this.post) {
      this.router.navigate(['/posts', this.post.id, 'edit']);
    }
  }

  deletePost(): void {
    if (this.post && confirm(`Are you sure you want to delete "${this.post.title}"?`)) {
      this.postsService.deletePost(this.post.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.snackBar.open('Post deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.router.navigate(['/posts']);
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          this.snackBar.open('Failed to delete post', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.id;
  }
}