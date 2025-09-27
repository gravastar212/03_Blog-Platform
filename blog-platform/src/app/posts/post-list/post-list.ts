import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'DRAFT' | 'PUBLISHED';
  tags?: string[];
}

@Component({
  selector: 'app-post-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './post-list.html',
  styleUrl: './post-list.scss'
})
export class PostList implements OnInit {
  posts: Post[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    // For now, using mock data. In a real app, this would call your backend API
    setTimeout(() => {
      this.posts = [
        {
          id: '1',
          title: 'Getting Started with Angular 17',
          content: 'Angular 17 introduces many new features...',
          excerpt: 'Learn about the new features and improvements in Angular 17, including the new control flow syntax and enhanced performance.',
          author: { id: '1', name: 'John Doe' },
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          status: 'PUBLISHED',
          tags: ['Angular', 'Frontend', 'Tutorial']
        },
        {
          id: '2',
          title: 'Building Modern Web Applications',
          content: 'Modern web development requires...',
          excerpt: 'Explore the latest trends and best practices in modern web application development.',
          author: { id: '2', name: 'Jane Smith' },
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-12'),
          status: 'PUBLISHED',
          tags: ['Web Development', 'Best Practices']
        },
        {
          id: '3',
          title: 'TypeScript Tips and Tricks',
          content: 'TypeScript provides powerful features...',
          excerpt: 'Discover advanced TypeScript techniques that will make your code more robust and maintainable.',
          author: { id: '1', name: 'John Doe' },
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-08'),
          status: 'PUBLISHED',
          tags: ['TypeScript', 'Programming', 'Tips']
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  }
}
