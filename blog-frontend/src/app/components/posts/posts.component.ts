import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterModule } from '@angular/router';
import { map, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PostsService, Post } from '../../services/posts.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Form controls
  searchControl = new FormControl('');
  statusControl = new FormControl('all');

  // Data
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  
  // State
  isLoading = false;
  error: string | null = null;
  currentUser: any = null;
  isAuthenticated = false;

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalPosts = 0;

  // Responsive grid
  cols = this.breakpointObserver.observe([
    Breakpoints.Handset,
    Breakpoints.Tablet,
    Breakpoints.Web
  ]).pipe(
    map(({ breakpoints }) => {
      if (breakpoints[Breakpoints.Handset]) {
        return 1;
      } else if (breakpoints[Breakpoints.Tablet]) {
        return 2;
      } else {
        return 3;
      }
    })
  );

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeAuth();
    this.setupSearch();
    this.loadPosts();
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

  private setupSearch(): void {
    // Search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterPosts();
    });

    // Status filter
    this.statusControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.filterPosts();
    });
  }

  loadPosts(): void {
    this.isLoading = true;
    this.error = null;

    this.postsService.getPublishedPosts({
      page: this.currentPage,
      limit: this.pageSize
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.posts = response.posts;
        this.totalPosts = response.total;
        this.filteredPosts = [...this.posts];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.error = 'Failed to load posts. Please try again.';
        this.isLoading = false;
        this.snackBar.open('Failed to load posts', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  private filterPosts(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const statusFilter = this.statusControl.value;

    this.filteredPosts = this.posts.filter(post => {
      const matchesSearch = !searchTerm || 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.author.name.toLowerCase().includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  onSearch(): void {
    this.filterPosts();
  }

  onStatusChange(): void {
    this.filterPosts();
  }

  loadMorePosts(): void {
    if (this.isLoading) return;

    this.currentPage++;
    this.isLoading = true;

    this.postsService.getPublishedPosts({
      page: this.currentPage,
      limit: this.pageSize
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.posts = [...this.posts, ...response.posts];
        this.filteredPosts = [...this.posts];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading more posts:', error);
        this.currentPage--; // Revert page increment on error
        this.isLoading = false;
        this.snackBar.open('Failed to load more posts', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  refreshPosts(): void {
    this.currentPage = 1;
    this.loadPosts();
  }

  getPostExcerpt(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
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

  canEditPost(post: Post): boolean {
    return this.isAuthenticated && 
           (this.currentUser?.role === 'ADMIN' || this.currentUser?.id === post.authorId);
  }

  canDeletePost(post: Post): boolean {
    return this.isAuthenticated && 
           (this.currentUser?.role === 'ADMIN' || this.currentUser?.id === post.authorId);
  }

  trackByPostId(index: number, post: Post): string {
    return post.id;
  }

  deletePost(post: Post): void {
    if (!this.canDeletePost(post)) {
      this.snackBar.open('You do not have permission to delete this post', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
      this.postsService.deletePost(post.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== post.id);
          this.filteredPosts = this.filteredPosts.filter(p => p.id !== post.id);
          this.totalPosts--;
          this.snackBar.open('Post deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
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
}