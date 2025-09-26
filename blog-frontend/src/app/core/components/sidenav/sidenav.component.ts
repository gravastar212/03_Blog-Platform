import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  @Input() opened = false;
  @Input() mode: 'over' | 'push' | 'side' = 'side';
  @Output() closeSidenav = new EventEmitter<void>();

  navItems = [
    { name: 'Home', icon: 'home', route: '/home' },
    { name: 'Posts', icon: 'article', route: '/posts' },
    { name: 'Create Post', icon: 'add', route: '/posts/create' },
    { name: 'My Posts', icon: 'person', route: '/posts/my-posts' },
  ];

  userItems = [
    { name: 'Profile', icon: 'account_circle', route: '/profile' },
    { name: 'Settings', icon: 'settings', route: '/settings' },
  ];

  onCloseSidenav(): void {
    this.closeSidenav.emit();
  }

  onNavItemClick(): void {
    // Close sidenav on mobile after navigation
    if (this.mode === 'over') {
      this.onCloseSidenav();
    }
  }
}