import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000'; // Backend API URL
  private readonly TOKEN_KEY = 'blog_auth_token';
  private readonly USER_KEY = 'blog_user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const token = this.getToken();
    const userData = this.getStoredUser();

    if (token && userData && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(userData);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.clearAuthData();
    }
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response.accessToken, response.user);
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Signup new user
   */
  signup(userData: SignupRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/signup`, userData)
      .pipe(
        tap(response => {
          this.setAuthData(response.accessToken, response.user);
        }),
        catchError(error => {
          console.error('Signup error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout user and clear authentication data
   */
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/home']);
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: 'USER' | 'ADMIN'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Get HTTP headers with authorization token
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  /**
   * Refresh user data from server
   */
  refreshUserData(): Observable<User> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    return this.http.get<User>(`${this.API_URL}/users/profile/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.storeUser(user);
      }),
      catchError(error => {
        console.error('Error refreshing user data:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Set authentication data in localStorage and update state
   */
  private setAuthData(token: string, user: User): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      this.storeUser(user);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }

  /**
   * Store user data in localStorage
   */
  private storeUser(user: User): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  /**
   * Get stored user data from localStorage
   */
  private getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * Check if JWT token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Decode JWT token payload
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(): Date | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = this.decodeToken(token);
      return payload?.exp ? new Date(payload.exp * 1000) : null;
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Check if token will expire soon (within 5 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const expiration = this.getTokenExpiration();
    if (!expiration) {
      return true;
    }

    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return expiration < fiveMinutesFromNow;
  }
}