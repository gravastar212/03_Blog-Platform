import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  tags: string[];
}

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    RouterModule
  ],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostsComponent {
  samplePosts: Post[] = [
    {
      id: '1',
      title: 'Getting Started with Angular 17',
      author: 'John Doe',
      date: '2 days ago',
      excerpt: 'Learn the basics of Angular 17 and its new features including standalone components, signals, and improved performance.',
      tags: ['Angular', 'JavaScript', 'Web Development']
    },
    {
      id: '2',
      title: 'Building Responsive UIs with Material Design',
      author: 'Jane Smith',
      date: '1 week ago',
      excerpt: 'Discover how to create beautiful and responsive user interfaces using Angular Material Design components.',
      tags: ['Material Design', 'UI/UX', 'Responsive Design']
    },
    {
      id: '3',
      title: 'TypeScript Best Practices for Large Applications',
      author: 'Mike Johnson',
      date: '2 weeks ago',
      excerpt: 'Explore advanced TypeScript patterns and best practices for building maintainable large-scale applications.',
      tags: ['TypeScript', 'Best Practices', 'Architecture']
    },
    {
      id: '4',
      title: 'Modern CSS Techniques and Layouts',
      author: 'Sarah Wilson',
      date: '3 weeks ago',
      excerpt: 'Master modern CSS techniques including Grid, Flexbox, and CSS custom properties for better layouts.',
      tags: ['CSS', 'Layout', 'Frontend']
    },
    {
      id: '5',
      title: 'Node.js and Express.js Backend Development',
      author: 'David Brown',
      date: '1 month ago',
      excerpt: 'Build robust backend APIs using Node.js and Express.js with proper error handling and authentication.',
      tags: ['Node.js', 'Express', 'Backend', 'API']
    },
    {
      id: '6',
      title: 'Database Design and Optimization',
      author: 'Lisa Davis',
      date: '1 month ago',
      excerpt: 'Learn database design principles and optimization techniques for better application performance.',
      tags: ['Database', 'SQL', 'Performance', 'Design']
    }
  ];
}