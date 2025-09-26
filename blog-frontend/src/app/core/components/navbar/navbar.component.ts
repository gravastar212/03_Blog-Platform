import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private breakpointObserver = inject(BreakpointObserver);

  @Output() toggleSidenav = new EventEmitter<void>();

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  navItems = [
    { name: 'Home', icon: 'home', route: '/home' },
    { name: 'Posts', icon: 'article', route: '/posts' },
    { name: 'Create Post', icon: 'add', route: '/posts/create' },
  ];

  userMenuItems = [
    { name: 'Profile', icon: 'person', route: '/profile' },
    { name: 'My Posts', icon: 'article', route: '/posts/my-posts' },
    { name: 'Settings', icon: 'settings', route: '/settings' },
    { name: 'Logout', icon: 'logout', action: 'logout' }
  ];

  isLoggedIn = false; // This should come from auth service

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  handleUserAction(item: any): void {
    if (item.action === 'logout') {
      // Handle logout logic here
      console.log('Logout clicked');
      this.isLoggedIn = false;
    } else if (item.route) {
      // Handle navigation to route
      console.log(`Navigate to: ${item.route}`);
    }
  }

  onLogin(): void {
    // Handle login logic here
    console.log('Login clicked');
    this.isLoggedIn = true;
  }
}