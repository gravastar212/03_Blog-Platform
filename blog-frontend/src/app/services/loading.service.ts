import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCount = 0;

  // Observable for components to subscribe to
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  // Get current loading state
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  // Start loading
  startLoading(): void {
    this.loadingCount++;
    if (this.loadingCount === 1) {
      this.loadingSubject.next(true);
    }
  }

  // Stop loading
  stopLoading(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  // Force stop loading (useful for error scenarios)
  forceStopLoading(): void {
    this.loadingCount = 0;
    this.loadingSubject.next(false);
  }

  // Reset loading state
  resetLoading(): void {
    this.loadingCount = 0;
    this.loadingSubject.next(false);
  }

  // Check if currently loading
  isCurrentlyLoading(): boolean {
    return this.loadingSubject.value;
  }

  // Get current loading count
  getLoadingCount(): number {
    return this.loadingCount;
  }
}