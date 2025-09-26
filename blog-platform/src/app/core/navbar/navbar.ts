import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
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

  isLoggedIn = false; // This would be connected to auth service later

  onLogin(): void {
    // Navigate to login page
    console.log('Navigate to login');
  }

  handleUserAction(item: any): void {
    if (item.action === 'logout') {
      console.log('Logout user');
    } else if (item.route) {
      console.log('Navigate to:', item.route);
    }
  }
}
