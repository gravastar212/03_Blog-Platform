import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    RouterOutlet,
    RouterModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  menuItems = [
    { name: 'Home', icon: 'home', route: '/home' },
    { name: 'Posts', icon: 'article', route: '/posts' },
    { name: 'Create Post', icon: 'add', route: '/posts/create' },
    { name: 'My Posts', icon: 'person', route: '/posts/my-posts' },
    { name: 'Profile', icon: 'account_circle', route: '/profile' },
  ];

  userMenuItems = [
    { name: 'Profile', icon: 'person', route: '/profile' },
    { name: 'Settings', icon: 'settings', route: '/settings' },
    { name: 'Logout', icon: 'logout', action: 'logout' }
  ];

  handleUserAction(item: any): void {
    if (item.action === 'logout') {
      // Handle logout logic here
      console.log('Logout clicked');
    } else if (item.route) {
      // Handle navigation to route
      console.log(`Navigate to: ${item.route}`);
    }
  }
}