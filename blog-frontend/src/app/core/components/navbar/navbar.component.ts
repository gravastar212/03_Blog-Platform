import { Component, inject, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterModule, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService, User } from '../../../services/auth.service';

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
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  private authSubscription?: Subscription;

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

  currentUser: User | null = null;
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  handleUserAction(item: any): void {
    if (item.action === 'logout') {
      this.authService.logout();
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  onLogin(): void {
    this.router.navigate(['/login']);
  }
}