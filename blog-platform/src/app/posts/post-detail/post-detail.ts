import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Post } from '../post-list/post-list';

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
export class PostDetail implements OnInit {
  post: Post | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const postId = params['id'];
      this.loadPost(postId);
    });
  }

  loadPost(postId: string): void {
    // For now, using mock data. In a real app, this would call your backend API
    setTimeout(() => {
      const mockPosts = [
        {
          id: '1',
          title: 'Getting Started with Angular 17',
          content: `
            <h2>Introduction</h2>
            <p>Angular 17 introduces many exciting new features and improvements that make building modern web applications even more enjoyable and efficient. In this comprehensive guide, we'll explore the key changes and how they can benefit your development workflow.</p>
            
            <h2>New Control Flow Syntax</h2>
            <p>One of the most significant changes in Angular 17 is the introduction of the new control flow syntax. Instead of structural directives like *ngIf and *ngFor, you can now use more intuitive @if, @for, and @switch syntax.</p>
            
            <h3>Benefits of the New Syntax</h3>
            <ul>
              <li>Better performance with improved tree-shaking</li>
              <li>More readable and maintainable code</li>
              <li>Better TypeScript integration</li>
              <li>Reduced bundle size</li>
            </ul>
            
            <h2>Enhanced Performance</h2>
            <p>Angular 17 brings several performance improvements, including faster compilation times, better runtime performance, and optimized bundle sizes. The new build system is significantly faster and more efficient.</p>
            
            <h2>Conclusion</h2>
            <p>Angular 17 represents a significant step forward in the framework's evolution. The new features and improvements make it easier than ever to build high-quality web applications with excellent performance and developer experience.</p>
          `,
          excerpt: 'Learn about the new features and improvements in Angular 17, including the new control flow syntax and enhanced performance.',
          author: { id: '1', name: 'John Doe' },
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          status: 'PUBLISHED' as const,
          tags: ['Angular', 'Frontend', 'Tutorial']
        },
        {
          id: '2',
          title: 'Building Modern Web Applications',
          content: `
            <h2>The Modern Web Development Landscape</h2>
            <p>Building modern web applications requires a deep understanding of current technologies, best practices, and user expectations. In this article, we'll explore the essential tools and techniques that every developer should know.</p>
            
            <h2>Frontend Frameworks</h2>
            <p>Modern frontend development is dominated by powerful frameworks like React, Angular, and Vue.js. Each has its strengths and use cases, and choosing the right one depends on your project requirements and team expertise.</p>
            
            <h2>Backend Technologies</h2>
            <p>Node.js, Python with Django/Flask, and modern languages like Go and Rust are popular choices for backend development. The key is to choose technologies that scale with your application's needs.</p>
          `,
          excerpt: 'Explore the latest trends and best practices in modern web application development.',
          author: { id: '2', name: 'Jane Smith' },
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-12'),
          status: 'PUBLISHED' as const,
          tags: ['Web Development', 'Best Practices']
        },
        {
          id: '3',
          title: 'TypeScript Tips and Tricks',
          content: `
            <h2>Advanced TypeScript Techniques</h2>
            <p>TypeScript provides powerful features that can make your code more robust, maintainable, and type-safe. Here are some advanced techniques that every TypeScript developer should know.</p>
            
            <h2>Utility Types</h2>
            <p>TypeScript's utility types like Partial, Required, Pick, and Omit can help you create flexible and reusable type definitions.</p>
            
            <h2>Generic Constraints</h2>
            <p>Using generic constraints allows you to create more precise type definitions and better compile-time checks.</p>
          `,
          excerpt: 'Discover advanced TypeScript techniques that will make your code more robust and maintainable.',
          author: { id: '1', name: 'John Doe' },
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-08'),
          status: 'PUBLISHED' as const,
          tags: ['TypeScript', 'Programming', 'Tips']
        }
      ];

      const foundPost = mockPosts.find(p => p.id === postId);
      if (foundPost) {
        this.post = foundPost;
      } else {
        this.error = 'Post not found';
      }
      this.isLoading = false;
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/posts']);
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
