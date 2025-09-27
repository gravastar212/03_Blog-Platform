import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * JWT Interceptor
 * 
 * Automatically adds JWT token from localStorage to Authorization header
 * for all HTTP requests. Also handles 401 Unauthorized responses by:
 * - Clearing stored auth data
 * - Redirecting to login page
 * 
 * Features:
 * - SSR-safe (only runs in browser)
 * - Automatic token attachment
 * - 401 error handling with logout
 * - Error logging for debugging
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // Only add token in browser environment
  if (isPlatformBrowser(platformId)) {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Clone the request and add the Authorization header
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        
        return next(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            // Handle 401 Unauthorized responses
            if (error.status === 401) {
              console.warn('JWT token expired or invalid. Redirecting to login.');
              
              // Clear stored auth data
              localStorage.removeItem('auth_token');
              localStorage.removeItem('current_user');
              
              // Redirect to login page
              router.navigate(['/auth/login']);
            }
            
            return throwError(() => error);
          })
        );
      }
    } catch (error) {
      console.error('Error accessing localStorage in JWT interceptor:', error);
    }
  }

  // If no token or not in browser, proceed with original request
  return next(req);
};
