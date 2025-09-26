import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /**
   * Test method to demonstrate the interceptor
   * This will automatically include the JWT token if available
   */
  testAuthenticatedRequest(): Observable<any> {
    return this.http.get(`${this.API_URL}/users/profile/me`);
  }

  /**
   * Test method for public endpoint (should not include token)
   */
  testPublicRequest(): Observable<any> {
    return this.http.get(`${this.API_URL}/posts/published`);
  }

  /**
   * Test method that will likely return 401 (for testing interceptor)
   */
  testUnauthorizedRequest(): Observable<any> {
    return this.http.get(`${this.API_URL}/users`);
  }
}