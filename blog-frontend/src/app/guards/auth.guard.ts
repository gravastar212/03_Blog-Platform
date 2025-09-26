import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService, User } from '../services/auth.service';

export interface AuthGuardData {
  requiresAuth?: boolean;
  requiredRoles?: ('USER' | 'ADMIN')[];
  redirectTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Get guard configuration from route data
    const guardData: AuthGuardData = route.data?.['authGuard'] || {};
    
    // Default configuration
    const requiresAuth = guardData.requiresAuth !== false; // Default to true
    const requiredRoles = guardData.requiredRoles || [];
    const redirectTo = guardData.redirectTo || '/login';

    return this.authService.currentUser$.pipe(
      take(1),
      map((user: User | null) => {
        // Check if authentication is required
        if (requiresAuth && !user) {
          // User is not logged in, redirect to login
          return this.router.createUrlTree([redirectTo], {
            queryParams: { returnUrl: state.url }
          });
        }

        // Check if specific roles are required
        if (requiredRoles.length > 0) {
          if (!user) {
            // User is not logged in, redirect to login
            return this.router.createUrlTree([redirectTo], {
              queryParams: { returnUrl: state.url }
            });
          }

          // Check if user has required role
          const hasRequiredRole = requiredRoles.includes(user.role);
          if (!hasRequiredRole) {
            // User doesn't have required role, redirect to unauthorized page or home
            return this.router.createUrlTree(['/unauthorized'], {
              queryParams: { 
                requiredRoles: requiredRoles.join(','),
                userRole: user.role,
                attemptedUrl: state.url
              }
            });
          }
        }

        // User is authenticated and has required role (if any)
        return true;
      })
    );
  }
}

// Helper function to create route data for AuthGuard
export function requireAuth(requiredRoles?: ('USER' | 'ADMIN')[], redirectTo?: string): { authGuard: AuthGuardData } {
  return {
    authGuard: {
      requiresAuth: true,
      requiredRoles,
      redirectTo
    }
  };
}

// Helper function to create route data for admin-only routes
export function requireAdmin(redirectTo?: string): { authGuard: AuthGuardData } {
  return requireAuth(['ADMIN'], redirectTo);
}

// Helper function to create route data for user-only routes
export function requireUser(redirectTo?: string): { authGuard: AuthGuardData } {
  return requireAuth(['USER', 'ADMIN'], redirectTo);
}

// Helper function to create route data for optional auth (no redirect)
export function optionalAuth(): { authGuard: AuthGuardData } {
  return {
    authGuard: {
      requiresAuth: false
    }
  };
}