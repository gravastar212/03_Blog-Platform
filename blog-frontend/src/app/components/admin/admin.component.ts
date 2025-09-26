import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService, User } from '../../services/auth.service';
import { PostsService } from '../../services/posts.service';
import { CommentsService } from '../../services/comments.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  isLoading = false;
  
  // Statistics
  totalPosts = 0;
  totalComments = 0;
  totalUsers = 0;
  recentPosts = 0;
  recentComments = 0;

  adminMenuItems = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: 'people',
      route: '/admin/users',
      color: 'primary'
    },
    {
      title: 'Post Management',
      description: 'Moderate posts and manage content',
      icon: 'article',
      route: '/admin/posts',
      color: 'accent'
    },
    {
      title: 'Comment Management',
      description: 'Moderate comments and manage discussions',
      icon: 'comment',
      route: '/admin/comments',
      color: 'warn'
    },
    {
      title: 'Analytics',
      description: 'View site statistics and analytics',
      icon: 'analytics',
      route: '/admin/analytics',
      color: 'primary'
    },
    {
      title: 'Settings',
      description: 'Configure site settings and preferences',
      icon: 'settings',
      route: '/admin/settings',
      color: 'accent'
    }
  ];

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private commentsService: CommentsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeAuth();
    this.loadStatistics();
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
    });
  }

  private loadStatistics(): void {
    this.isLoading = true;

    // Load basic statistics
    // Note: In a real application, you'd have dedicated admin endpoints
    // For now, we'll use existing services to get basic counts
    
    this.postsService.getPosts().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.totalPosts = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading post statistics:', error);
        this.isLoading = false;
        this.snackBar.open('Failed to load statistics', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });

    this.commentsService.getComments().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.totalComments = response.total;
      },
      error: (error) => {
        console.error('Error loading comment statistics:', error);
      }
    });
  }

  getWelcomeMessage(): string {
    if (this.currentUser) {
      return `Welcome back, ${this.currentUser.name}!`;
    }
    return 'Welcome to the Admin Panel';
  }

  getCurrentTime(): string {
    return new Date().toLocaleString();
  }
}