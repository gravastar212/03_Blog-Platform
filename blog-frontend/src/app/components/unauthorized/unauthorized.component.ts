import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss'
})
export class UnauthorizedComponent implements OnInit {
  requiredRoles: string[] = [];
  userRole: string = '';
  attemptedUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.requiredRoles = params['requiredRoles'] ? params['requiredRoles'].split(',') : [];
      this.userRole = params['userRole'] || '';
      this.attemptedUrl = params['attemptedUrl'] || '';
    });
  }

  goBack(): void {
    if (this.attemptedUrl) {
      // Try to go back to the attempted URL
      this.router.navigate([this.attemptedUrl]);
    } else {
      // Go to home page
      this.router.navigate(['/home']);
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  goToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.attemptedUrl || '/home' }
    });
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'USER':
        return 'User';
      default:
        return role;
    }
  }

  getRoleDescription(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Full access to all features and administrative functions';
      case 'USER':
        return 'Access to basic features and content creation';
      default:
        return 'Unknown role';
    }
  }
}