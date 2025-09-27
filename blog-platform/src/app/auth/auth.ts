import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

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

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly API_URL = 'http://localhost:3000';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeAuth();
  }

  /**
   * Login user with email and password
   */
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, loginData)
      .pipe(
        tap(response => {
          this.setAuthData(response.accessToken, response.user);
        })
      );
  }

  /**
   * Signup new user
   */
  signup(signupData: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/signup`, signupData)
      .pipe(
        tap(response => {
          this.setAuthData(response.accessToken, response.user);
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearAuthData();
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
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: 'USER' | 'ADMIN'): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    try {
      const token = this.getToken();
      const user = this.getStoredUser();

      if (token && user && !this.isTokenExpired(token)) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } else {
        this.clearAuthData();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.clearAuthData();
    }
  }

  /**
   * Set authentication data in localStorage and update state
   */
  private setAuthData(token: string, user: User): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
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
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    
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
    if (!isPlatformBrowser(this.platformId)) {
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      return;
    }
    
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
}
