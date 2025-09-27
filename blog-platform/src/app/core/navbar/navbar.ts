import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Router } from '@angular/router';
import { Auth, User } from '../../auth/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit, OnDestroy {
  title = 'Blog Platform';
  
  navItems = [
    { name: 'Home', icon: 'home', route: '/home' },
    { name: 'Posts', icon: 'article', route: '/posts' },
    { name: 'About', icon: 'info', route: '/about' },
    { name: 'Contact', icon: 'mail', route: '/contact' }
  ];

  userMenuItems = [
    { name: 'Profile', icon: 'person', route: '/profile' },
    { name: 'Settings', icon: 'settings', route: '/settings' },
    { name: 'Logout', icon: 'logout', action: 'logout' }
  ];

  isLoggedIn = false;
  currentUser: User | null = null;
  private authSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authSubscription.add(
      this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        this.isLoggedIn = isAuthenticated;
      })
    );

    this.authSubscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  onLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  handleUserAction(item: any): void {
    if (item.action === 'logout') {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }
}
