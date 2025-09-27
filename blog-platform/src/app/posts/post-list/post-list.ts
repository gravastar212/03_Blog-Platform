import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { PostsService, Post, PostsResponse } from '../../services/posts.service';

@Component({
  selector: 'app-post-list',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './post-list.html',
  styleUrl: './post-list.scss'
})
export class PostList implements OnInit, OnDestroy {
  posts: Post[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  pageSize = 6;
  currentPage = 0;
  totalPosts = 0;
  totalPages = 0;

  // Filters
  searchTerm = '';
  statusFilter = '';

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private postsService: PostsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadPosts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0; // Reset to first page when searching
        this.loadPosts();
      });
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;

    const options = {
      page: this.currentPage + 1, // API uses 1-based pagination
      limit: this.pageSize,
      search: this.searchTerm.trim() || undefined,
      status: this.statusFilter || undefined
    };

    this.postsService.getPublishedPosts(options)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PostsResponse) => {
          this.posts = response.data;
          this.totalPosts = response.total;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading posts:', error);
          this.error = 'Failed to load posts. Please try again.';
          this.loading = false;
          this.snackBar.open(this.error, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onStatusFilterChange(): void {
    this.currentPage = 0; // Reset to first page when filtering
    this.loadPosts();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPosts();
  }

  viewPost(postId: string): void {
    // Navigation will be handled by routerLink in template
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

  refreshPosts(): void {
    this.currentPage = 0;
    this.loadPosts();
  }
}
