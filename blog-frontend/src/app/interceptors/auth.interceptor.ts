import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly API_BASE_URL = 'http://localhost:3000';
  private readonly EXCLUDED_URLS = [
    '/auth/login',
    '/auth/signup'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip interceptor for excluded URLs
    if (this.shouldSkipInterceptor(request)) {
      return next.handle(request);
    }

    // Get the JWT token
    const token = this.authService.getToken();

    // Clone the request and add the Authorization header if token exists
    let authRequest = request;
    if (token) {
      authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle the request and catch errors
    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleHttpError(error, request, next);
      })
    );
  }

  /**
   * Check if the request should skip the interceptor
   */
  private shouldSkipInterceptor(request: HttpRequest<unknown>): boolean {
    const url = request.url;
    
    // Skip if it's not an API request
    if (!url.startsWith(this.API_BASE_URL)) {
      return true;
    }

    // Skip for excluded URLs
    const relativeUrl = url.replace(this.API_BASE_URL, '');
    return this.EXCLUDED_URLS.some(excludedUrl => relativeUrl.startsWith(excludedUrl));
  }

  /**
   * Handle HTTP errors, especially 401 Unauthorized
   */
  private handleHttpError(
    error: HttpErrorResponse,
    originalRequest: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    
    if (error.status === 401) {
      // Handle 401 Unauthorized
      return this.handleUnauthorized(originalRequest, next);
    }

    // For other errors, just throw them
    return throwError(() => error);
  }

  /**
   * Handle 401 Unauthorized responses
   */
  private handleUnauthorized(
    originalRequest: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    
    // Clear authentication data
    this.authService.logout();

    // Redirect to login page
    this.router.navigate(['/login'], {
      queryParams: { 
        returnUrl: this.router.url,
        reason: 'session_expired'
      }
    });

    // Return the error
    return throwError(() => new HttpErrorResponse({
      error: { message: 'Session expired. Please log in again.' },
      status: 401,
      statusText: 'Unauthorized'
    }));
  }
}