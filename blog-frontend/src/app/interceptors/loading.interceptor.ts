import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading indicator for certain requests
    if (this.shouldSkipLoading(request)) {
      return next.handle(request);
    }

    // Increment active requests counter
    this.activeRequests++;
    
    // Start loading if this is the first request
    if (this.activeRequests === 1) {
      this.loadingService.startLoading();
    }

    return next.handle(request).pipe(
      finalize(() => {
        // Decrement active requests counter
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        
        // Stop loading if no more active requests
        if (this.activeRequests === 0) {
          this.loadingService.stopLoading();
        }
      })
    );
  }

  private shouldSkipLoading(request: HttpRequest<any>): boolean {
    // Skip loading for certain endpoints or request types
    const skipPatterns = [
      // Skip for health checks
      '/health',
      // Skip for small requests that are very fast
      '/ping',
      // Skip for requests that have a custom header
      'skip-loading'
    ];

    const url = request.url.toLowerCase();
    
    // Check if URL matches any skip patterns
    for (const pattern of skipPatterns) {
      if (url.includes(pattern)) {
        return true;
      }
    }

    // Check for custom header to skip loading
    if (request.headers.has('X-Skip-Loading')) {
      return true;
    }

    // Skip for GET requests to static assets (if any)
    if (request.method === 'GET' && this.isStaticAsset(url)) {
      return true;
    }

    return false;
  }

  private isStaticAsset(url: string): boolean {
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    return staticExtensions.some(ext => url.toLowerCase().includes(ext));
  }
}